#!/usr/bin/env python3
"""
Scalar Teams Publishing Bot — Preference-Guided AI Briefing Curated Feed
------------------------------------------------------------------------
Reads `curation-preferences.json` (exported from the `/news/` Curation Trainer UI
or maintained in the repository) and scores incoming candidate AI & finance articles
using your learned `topic_weights` and `category_weights`.

Usage:
  python3 scripts/curate_news_bot.py
  python3 scripts/curate_news_bot.py --preferences ~/Downloads/curation-preferences.json
"""

import argparse
import datetime
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PREFS = REPO_ROOT / "curation-preferences.json"

# Default topic keywords mapped to Scalar Teams briefing categories
TOPIC_KEYWORDS = {
    "three-way-match": ["three-way match", "3-way match", "purchase order", "receiving log"],
    "accounts-payable": ["accounts payable", "ap automation", "invoice", "vendor bill", "payables"],
    "erp": ["erp", "netsuite", "quickbooks", "sap", "general ledger", "reconciliation"],
    "freight-audit": ["freight", "bol", "bill of lading", "3pl", "logistics", "supply chain", "customs"],
    "document-extraction": ["ocr", "document extraction", "pdf", "vision", "layout", "structured output"],
    "rag": ["rag", "retrieval", "hybrid search", "bm25", "vector", "rerank", "embeddings"],
    "evals": ["eval", "evaluation", "benchmark", "golden dataset", "hallucination", "ci/cd"],
    "llm-ops": ["latency", "prompt caching", "inference", "token cost", "fine-tuning", "routing"],
    "agents": ["agent", "tool calling", "multi-agent", "workflow", "langgraph", "mcp"],
    "security": ["security", "soc 2", "zero data retention", "prompt injection", "iam", "audit"],
    "fintech": ["fintech", "treasury", "cash flow", "cfo", "controller", "accounting", "close"],
}

CATEGORY_RULES = {
    "Business Case": ["invoice", "erp", "supply chain", "freight", "accounting", "ap", "reconciliation", "3pl"],
    "Models & Costs": ["token", "caching", "inference", "latency", "cost", "model", "distillation", "pricing"],
    "Engineering": ["rag", "eval", "agent", "vector", "retrieval", "postgres", "security", "production", "llm"],
    "New Startups": ["launch", "seed", "series a", "yc", "startup", "fintech", "open-source"],
}


def load_preferences(path: Path) -> dict:
    if not path.exists():
        return {
            "votes": {},
            "liked_articles": [],
            "disliked_articles": [],
            "category_weights": {},
            "topic_weights": {},
        }
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def detect_topics_and_category(title: str, summary: str = "") -> tuple[list[str], str]:
    text = f"{title} {summary}".lower()
    matched_topics = []
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            matched_topics.append(topic)

    best_cat = "Engineering"
    best_hits = 0
    for cat, keywords in CATEGORY_RULES.items():
        hits = sum(1 for kw in keywords if kw in text)
        if hits > best_hits:
            best_hits = hits
            best_cat = cat

    return matched_topics, best_cat


def score_candidate(title: str, summary: str, prefs: dict) -> dict:
    topics, category = detect_topics_and_category(title, summary)
    topic_weights = prefs.get("topic_weights", {})
    category_weights = prefs.get("category_weights", {})

    score = int(category_weights.get(category, 0))
    matched_weights = {}
    for t in topics:
        w = int(topic_weights.get(t, 0))
        score += w
        if w != 0:
            matched_weights[t] = w

    return {
        "category": category,
        "topics": topics,
        "score": score,
        "matched_weights": matched_weights,
    }


def fetch_hn_candidates(limit: int = 20) -> list[dict]:
    query = urllib.parse.quote(
        '"RAG" OR "LLM" OR "evals" OR "invoice" OR "ERP" OR "supply chain" OR "accounting" OR "agent"'
    )
    url = f"https://hn.algolia.com/api/v1/search_by_date?query={query}&tags=story&numericFilters=points>15&hitsPerPage={limit}"
    req = urllib.request.Request(url, headers={"User-Agent": "ScalarTeamsCuratorBot/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            hits = data.get("hits", [])
            results = []
            for h in hits:
                created = (h.get("created_at") or "")[:10]
                results.append(
                    {
                        "title": h.get("title", "Untitled"),
                        "url": h.get("url") or f"https://news.ycombinator.com/item?id={h.get('objectID')}",
                        "published_date": created or datetime.date.today().isoformat(),
                        "points": h.get("points", 0),
                    }
                )
            return results
    except Exception as exc:
        print(f"[warn] Could not fetch live HN wire ({exc}); using sample candidates.")
        return []


def main():
    parser = argparse.ArgumentParser(description="Curate AI Briefing articles using learned preference weights.")
    parser.add_argument(
        "--preferences",
        type=Path,
        default=DEFAULT_PREFS,
        help="Path to curation-preferences.json exported from the site",
    )
    parser.add_argument("--min-score", type=int, default=-1, help="Minimum bot score to keep an article")
    args = parser.parse_args()

    prefs = load_preferences(args.preferences)
    topic_weights = prefs.get("topic_weights", {})
    cat_weights = prefs.get("category_weights", {})

    print("=" * 72)
    print("SCALAR TEAMS PUBLISHING BOT — CURATION PROFILE")
    print("=" * 72)
    print(f"Preferences file : {args.preferences}")
    print(f"Liked articles   : {len(prefs.get('liked_articles', []))}")
    print(f"Disliked articles: {len(prefs.get('disliked_articles', []))}")

    liked_topics = sorted([(t, w) for t, w in topic_weights.items() if w > 0], key=lambda x: -x[1])
    muted_topics = sorted([(t, w) for t, w in topic_weights.items() if w < 0], key=lambda x: x[1])

    print(f"Preferred topics : {', '.join(f'{t} (+{w})' for t, w in liked_topics) or 'None yet (neutral)'}")
    print(f"Muted topics     : {', '.join(f'{t} ({w})' for t, w in muted_topics) or 'None yet (neutral)'}")
    print(f"Category weights : {json.dumps(cat_weights)}")
    print("-" * 72)

    candidates = fetch_hn_candidates(limit=20)
    scored = []
    for item in candidates:
        eval_res = score_candidate(item["title"], "", prefs)
        if eval_res["score"] >= args.min_score:
            scored.append({**item, **eval_res})

    scored.sort(key=lambda x: (x["score"], x["points"]), reverse=True)

    print(f"\nTOP CURATED CANDIDATES ({len(scored)} kept):")
    for idx, item in enumerate(scored[:10], start=1):
        badge = f"Score {item['score']:+d}"
        topics_str = ", ".join(item["topics"]) if item["topics"] else "general-ai"
        print(f"{idx:2d}. [{badge}] [{item['published_date']}] [{item['category']}] {item['title']}")
        print(f"    Topics: {topics_str} | {item['url']}")


if __name__ == "__main__":
    main()
