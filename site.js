(function () {
  'use strict';

  // 1. Mobile navigation toggle
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // 2. Capture Landing Page & UTM Parameters across navigation
  var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
  var params = new URLSearchParams(window.location.search);
  var collectedUtms = {};

  utmKeys.forEach(function (key) {
    if (params.has(key)) {
      collectedUtms[key] = params.get(key);
    }
  });

  try {
    if (!sessionStorage.getItem('scalar_landing_page')) {
      sessionStorage.setItem('scalar_landing_page', window.location.pathname + window.location.search);
    }
    if (Object.keys(collectedUtms).length > 0) {
      sessionStorage.setItem('scalar_utm_params', JSON.stringify(collectedUtms));
    }
  } catch (e) {}

  var landingValue = window.location.pathname;
  var utmValue = '';
  try {
    landingValue = sessionStorage.getItem('scalar_landing_page') || window.location.pathname;
    utmValue = sessionStorage.getItem('scalar_utm_params') || '';
  } catch (e) {}

  if (!utmValue && Object.keys(collectedUtms).length > 0) {
    utmValue = JSON.stringify(collectedUtms);
  }

  // Populate hidden fields on all quote forms
  var forms = document.querySelectorAll('form.quote-form');
  forms.forEach(function (form) {
    var landingInput = form.querySelector('input[name="landing_page"]');
    var utmInput = form.querySelector('input[name="utm_parameters"]');
    if (landingInput) {
      landingInput.value = landingValue;
    }
    if (utmInput) {
      utmInput.value = utmValue || 'direct / none';
    }

    // 3. Post to Formspree and show the inline thank-you block (same behaviour as the homepage form)
    form.addEventListener('submit', function (event) {
      if (!window.fetch || !window.FormData) {
        return;
      }
      event.preventDefault();

      var button = form.querySelector('button[type="submit"]');
      var statusEl = document.getElementById('quote-status') || form.querySelector('.form-status');
      var thanks = document.getElementById('quote-thanks');
      var originalBtnText = button ? button.textContent : '';

      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }
      if (statusEl) {
        statusEl.textContent = '';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          form.hidden = true;
          if (thanks) {
            thanks.hidden = false;
            thanks.focus();
          }
          return;
        }
        throw new Error('Request failed');
      }).catch(function () {
        if (statusEl) {
          statusEl.textContent = 'Your request didn’t send. Email hello@scalarteams.com and we’ll reply within one business day.';
        }
        if (button) {
          button.disabled = false;
          button.textContent = originalBtnText;
        }
      });
    });
  });

  // 4. Publishing Bot Curation & Preference Learning System
  var STORAGE_KEY = 'scalar_curation_profile_v1';

  // Master metadata catalog so learning works from any page
  var CATALOG = {
    'freight-quote-bol-triage': {
      title: 'Automated freight quote & bill-of-lading triage in high-volume 3PL inboxes',
      category: 'cases',
      date: '2026-10-28',
      topics: ['Logistics & 3PL', 'Document Extraction', 'Supply Chain', 'TMS Automation']
    },
    'workflows-vs-autonomous-agents': {
      title: 'Workflows vs. Autonomous Agents: why simple composable patterns win in production',
      category: 'practices',
      date: '2026-10-25',
      topics: ['Agent Workflows', 'Production Architecture', 'Anthropic Engineering', 'Prompt Chaining']
    },
    'vision-llm-ap-three-way-matching': {
      title: 'Vision-LLM extraction for multi-page vendor invoices and three-way PO matching',
      category: 'cases',
      date: '2026-10-22',
      topics: ['AP & ERP Controls', 'Three-Way Matching', 'Vision LLMs', 'NetSuite & QuickBooks']
    },
    'contextual-retrieval-hybrid-rag': {
      title: 'Contextual Retrieval + BM25 + Reranking cuts RAG retrieval failures by 67%',
      category: 'practices',
      date: '2026-10-19',
      topics: ['RAG & Search', 'Contextual Retrieval', 'BM25 & Reranking', 'Anthropic Research']
    },
    'schema-enforced-structured-outputs': {
      title: 'Constrained decoding and 100% JSON-Schema compliance in frontier models',
      category: 'models',
      date: '2026-10-15',
      topics: ['Structured Outputs', 'Constrained Decoding', 'JSON Schema', 'OpenAI & Frontier APIs']
    },
    'cicd-llm-evaluation-harnesses': {
      title: 'The rise of CI/CD evaluation harnesses: Braintrust, LangSmith, Arize Phoenix & Promptfoo',
      category: 'startups',
      date: '2026-10-12',
      topics: ['LLM Evals & CI/CD', 'Developer Tooling', 'Promptfoo & Braintrust', 'LLM-as-a-Judge']
    },
    'wholesale-ar-remittance-deductions': {
      title: 'Automating retail remittance advice parsing and short-pay deduction packets',
      category: 'cases',
      date: '2026-10-08',
      topics: ['AR & Collections', 'Wholesale Distribution', 'Deduction Recovery', 'Document Extraction']
    },
    'two-tier-reasoning-model-routing': {
      title: 'Two-tier model routing: pairing reasoning models with fast small models',
      category: 'models',
      date: '2026-10-04',
      topics: ['Model Routing', 'Cost & Latency', 'Prompt Caching', 'Reasoning Models']
    },
    'vertical-ai-customs-freight-audit': {
      title: 'Vertical AI startups targeting customs brokerage, HTS classification, and freight audit',
      category: 'startups',
      date: '2026-09-29',
      topics: ['Cross-Border Customs', 'Supply Chain Startups', 'HTS Classification', 'Freight Audit']
    },
    'applied-llms-production-lessons': {
      title: 'What we learned from a year of building with LLMs (Applied Engineering Survey)',
      category: 'practices',
      date: '2026-09-24',
      topics: ['Production Engineering', 'LLM Evals & CI/CD', 'RAG & Search', 'Applied LLMs']
    },
    'model-context-protocol-enterprise': {
      title: 'Model Context Protocol (MCP) standardizes how AI systems connect to enterprise data',
      category: 'startups',
      date: '2026-09-18',
      topics: ['Model Context Protocol', 'Enterprise Integration', 'Security & Permissions', 'Open Standards']
    },
    'read-only-erp-customer-operations': {
      title: 'Read-only ERP tool calling for instant "Where is my order?" and invoice copy requests',
      category: 'cases',
      date: '2026-09-14',
      topics: ['Security & Permissions', 'Customer Operations', 'ERP Integration', 'B2B Distribution']
    }
  };

  function loadVotes() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed.votes === 'object') {
          return parsed.votes;
        }
      }
    } catch (e) {}
    return {};
  }

  function computeProfile(votes) {
    var topicWeights = {};
    var categoryWeights = { cases: 0, practices: 0, models: 0, startups: 0 };
    var likedSlugs = [];
    var dislikedSlugs = [];

    Object.keys(votes).forEach(function (slug) {
      var vote = votes[slug];
      var item = CATALOG[slug];
      if (!item) return;
      var delta = vote === 'like' ? 1 : (vote === 'dislike' ? -1 : 0);
      if (delta === 0) return;

      if (delta > 0) likedSlugs.push(slug);
      if (delta < 0) dislikedSlugs.push(slug);

      if (categoryWeights[item.category] !== undefined) {
        categoryWeights[item.category] += delta;
      }
      item.topics.forEach(function (t) {
        topicWeights[t] = (topicWeights[t] || 0) + (delta * 2);
      });
    });

    return {
      updated_at: new Date().toISOString(),
      votes: votes,
      liked_articles: likedSlugs,
      disliked_articles: dislikedSlugs,
      category_weights: categoryWeights,
      topic_weights: topicWeights
    };
  }

  function saveVotes(votes) {
    var profile = computeProfile(votes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {}
    return profile;
  }

  function scoreSlug(slug, profile) {
    var item = CATALOG[slug];
    if (!item) return 0;
    var score = 0;
    if (profile.votes[slug] === 'like') score += 10;
    if (profile.votes[slug] === 'dislike') score -= 15;
    score += (profile.category_weights[item.category] || 0);
    item.topics.forEach(function (t) {
      score += (profile.topic_weights[t] || 0);
    });
    return score;
  }

  var currentVotes = loadVotes();
  var currentProfile = computeProfile(currentVotes);
  var isSortedByBot = false;

  function renderCurationUI() {
    currentProfile = computeProfile(currentVotes);

    // Update all Like/Dislike buttons on the page
    var allGradeBtns = document.querySelectorAll('.grade-btn[data-grade][data-slug]');
    allGradeBtns.forEach(function (btn) {
      var slug = btn.getAttribute('data-slug');
      var gradeType = btn.getAttribute('data-grade');
      var active = currentVotes[slug] === gradeType;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Update all relevance status pills & card visual states
    var allItems = document.querySelectorAll('[data-curation-item]');
    allItems.forEach(function (el) {
      var slug = el.getAttribute('data-article-slug');
      var vote = currentVotes[slug];
      var score = scoreSlug(slug, currentProfile);

      if (el.classList.contains('news-card')) {
        if (vote === 'dislike') {
          el.classList.add('is-disliked');
        } else {
          el.classList.remove('is-disliked');
        }
      }

      var pill = document.querySelector('[data-relevance-status="' + slug + '"]');
      if (pill) {
        pill.classList.remove('is-boosted', 'is-muted');
        if (vote === 'like') {
          pill.textContent = '★ Liked · Bot Score +' + Math.max(score, 1);
          pill.classList.add('is-boosted');
        } else if (vote === 'dislike') {
          pill.textContent = 'Muted · Bot Score ' + score;
          pill.classList.add('is-muted');
        } else if (score > 0) {
          pill.textContent = 'Bot Match +' + score;
          pill.classList.add('is-boosted');
        } else if (score < 0) {
          pill.textContent = 'Low Match (' + score + ')';
          pill.classList.add('is-muted');
        } else {
          pill.textContent = 'Neutral Match';
        }
      }
    });

    // Update Dashboard summary & learned tags on /news/
    var summaryText = document.getElementById('curation-summary-text');
    var tagsBox = document.getElementById('curation-learned-tags');
    if (summaryText && tagsBox) {
      var likeCount = currentProfile.liked_articles.length;
      var dislikeCount = currentProfile.disliked_articles.length;

      if (likeCount === 0 && dislikeCount === 0) {
        summaryText.innerHTML = 'Grade articles below with <strong>👍 Like</strong> or <strong>👎 Not for me</strong>. The publishing bot learns your preferred topics, categories, and sources to rank and curate future briefings.';
        tagsBox.hidden = true;
        tagsBox.innerHTML = '';
      } else {
        summaryText.innerHTML = '<strong>Bot Training Active:</strong> ' + likeCount + ' liked, ' + dislikeCount + ' muted. The publishing bot has updated your topic weights below and re-scored all briefings.';
        tagsBox.innerHTML = '';
        var topics = Object.keys(currentProfile.topic_weights).sort(function (a, b) {
          return currentProfile.topic_weights[b] - currentProfile.topic_weights[a];
        });
        topics.forEach(function (t) {
          var w = currentProfile.topic_weights[t];
          if (w === 0) return;
          var span = document.createElement('span');
          span.className = 'curation-tag ' + (w > 0 ? 'boost' : 'mute');
          span.textContent = (w > 0 ? '↑ ' : '↓ ') + t + ' (' + (w > 0 ? '+' + w : w) + ')';
          tagsBox.appendChild(span);
        });
        tagsBox.hidden = tagsBox.children.length === 0;
      }
    }

    if (isSortedByBot) {
      sortGridByBotScore();
    }
  }

  function sortGridByBotScore() {
    var grid = document.getElementById('news-grid-container');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('article.news-card'));
    cards.sort(function (a, b) {
      var slugA = a.getAttribute('data-article-slug');
      var slugB = b.getAttribute('data-article-slug');
      var scoreDiff = scoreSlug(slugB, currentProfile) - scoreSlug(slugA, currentProfile);
      if (scoreDiff !== 0) return scoreDiff;
      var dateA = a.getAttribute('data-article-date') || '';
      var dateB = b.getAttribute('data-article-date') || '';
      return dateB.localeCompare(dateA);
    });
    cards.forEach(function (c) {
      grid.appendChild(c);
    });
  }

  // Attach click listener for Like / Dislike buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.grade-btn[data-grade][data-slug]') : null;
    if (!btn) return;
    var slug = btn.getAttribute('data-slug');
    var grade = btn.getAttribute('data-grade');
    if (currentVotes[slug] === grade) {
      delete currentVotes[slug];
    } else {
      currentVotes[slug] = grade;
    }
    saveVotes(currentVotes);
    renderCurationUI();
    rankLiveWire();
  });

  // Sort by Bot Match Score toggle
  var sortBtn = document.getElementById('btn-sort-curated');
  if (sortBtn) {
    sortBtn.addEventListener('click', function () {
      isSortedByBot = !isSortedByBot;
      sortBtn.setAttribute('aria-pressed', isSortedByBot ? 'true' : 'false');
      if (isSortedByBot) {
        sortGridByBotScore();
      }
    });
  }

  // Export Bot Profile JSON for automated publishing script
  var exportBtn = document.getElementById('btn-export-curation');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      var profile = computeProfile(currentVotes);
      var blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'curation-preferences.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Reset Curation Votes
  var resetBtn = document.getElementById('btn-reset-curation');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      currentVotes = {};
      saveVotes(currentVotes);
      renderCurationUI();
      rankLiveWire();
    });
  }

  // 5. Category & Liked Filter
  var filterBtns = document.querySelectorAll('[data-news-filter]');
  var newsCards = document.querySelectorAll('#news-grid-container [data-news-category]');
  if (filterBtns.length > 0 && newsCards.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var selected = btn.getAttribute('data-news-filter');
        filterBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        newsCards.forEach(function (card) {
          var cat = card.getAttribute('data-news-category');
          var slug = card.getAttribute('data-article-slug');
          if (selected === 'all') {
            card.hidden = false;
          } else if (selected === 'liked') {
            card.hidden = currentVotes[slug] !== 'like';
          } else {
            card.hidden = cat !== selected;
          }
        });
      });
    });
  }

  // Initialize curation UI on page load
  renderCurationUI();

  // 6. Live AI Engineering Wire (scored & sorted by learned bot preferences, with publication dates)
  var liveList = document.getElementById('live-ai-wire');
  var liveStatus = document.getElementById('live-ai-wire-status');
  var cachedHits = [];

  function scoreHeadlineText(title) {
    var t = (title || '').toLowerCase();
    var score = 0;
    var w = currentProfile.topic_weights || {};
    if (/rag|retrieval|vector|bm25|embedding|search/.test(t)) score += (w['RAG & Search'] || 0) + (w['Contextual Retrieval'] || 0);
    if (/agent|workflow|mcp|tool|orchestrat/.test(t)) score += (w['Agent Workflows'] || 0) + (w['Model Context Protocol'] || 0);
    if (/eval|benchmark|test|promptfoo|judge/.test(t)) score += (w['LLM Evals & CI/CD'] || 0);
    if (/json|schema|structured|constrained/.test(t)) score += (w['Structured Outputs'] || 0);
    if (/invoice|accounting|erp|finance|freight|supply|logistics/.test(t)) score += (w['AP & ERP Controls'] || 0) + (w['Logistics & 3PL'] || 0);
    if (/claude|anthropic|openai|gpt|gemini|llama|qwen|model/.test(t)) score += (w['Model Routing'] || 0) + (w['OpenAI & Frontier APIs'] || 0);
    return score;
  }

  function rankLiveWire() {
    if (!liveList || cachedHits.length === 0) return;
    var scored = cachedHits.map(function (hit) {
      return {
        hit: hit,
        botScore: scoreHeadlineText(hit.title)
      };
    });
    scored.sort(function (a, b) {
      if (b.botScore !== a.botScore) return b.botScore - a.botScore;
      return (b.hit.points || 0) - (a.hit.points || 0);
    });

    liveList.innerHTML = '';
    scored.slice(0, 6).forEach(function (entry) {
      var hit = entry.hit;
      var botScore = entry.botScore;
      var li = document.createElement('li');
      li.style.display = 'block';

      var details = document.createElement('details');
      details.className = 'news-expand';
      details.style.borderTop = 'none';
      details.style.paddingTop = '0';
      details.style.marginTop = '0';

      var summary = document.createElement('summary');
      summary.style.display = 'flex';
      summary.style.justifyContent = 'space-between';
      summary.style.alignItems = 'baseline';
      summary.style.width = '100%';
      summary.style.gap = '12px';

      var dateStr = hit.created_at ? hit.created_at.slice(0, 10) : '2026-10';
      var titleSpan = document.createElement('span');
      titleSpan.style.color = 'var(--text-primary)';
      titleSpan.style.fontWeight = '600';
      var badgePrefix = botScore > 0 ? '[Bot Match +' + botScore + '] ' : '';
      titleSpan.textContent = badgePrefix + hit.title + ' (' + dateStr + ')';

      var domain = 'Community Wire';
      if (hit.url) {
        try {
          domain = new URL(hit.url).hostname.replace(/^www\./, '');
        } catch (e) {}
      }

      var body = document.createElement('div');
      body.className = 'news-expanded-body';
      var p1 = document.createElement('p');
      p1.textContent = 'Published ' + dateStr + ' · Tracked in our live AI engineering wire (' + hit.points + ' practitioner upvotes, ' + (hit.num_comments || 0) + ' technical comments). Ranked by your learned publishing bot topic weights.';
      var cite = document.createElement('span');
      cite.className = 'source-citation';
      cite.textContent = 'Named Source: ' + domain + ' · Published ' + dateStr + ' · Reported by ' + (hit.author || 'engineering contributor');

      body.appendChild(p1);
      body.appendChild(cite);
      summary.appendChild(titleSpan);
      details.appendChild(summary);
      details.appendChild(body);
      li.appendChild(details);
      liveList.appendChild(li);
    });
  }

  if (liveList && window.fetch) {
    var hnUrl = 'https://hn.algolia.com/api/v1/search_by_date?query=LLM%20OR%20RAG%20OR%20%22AI%20agent%22%20OR%20Anthropic%20OR%20OpenAI&tags=story&numericFilters=points%3E35&hitsPerPage=10';
    fetch(hnUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.hits || data.hits.length === 0) return;
        cachedHits = data.hits;
        rankLiveWire();
        if (liveStatus) {
          liveStatus.textContent = 'Live feed updated · Ranked by your bot preferences';
        }
      })
      .catch(function () {});
  }

  // 7. AI Briefing Explainer Chat & Highlight-to-Explain Assistant
  var KNOWLEDGE_BASE = [
    {
      id: 'llm-extraction',
      keywords: ['llm extraction', 'vision-llm', 'vision llm', 'document extraction', 'ocr', 'parse', 'parsing', 'invoice extraction', 'bol', 'bill of lading', 'rate confirmation', 'pdf'],
      title: 'Vision-LLM Document Extraction',
      answer: '<p><strong>LLM Extraction (specifically Vision-LLM extraction)</strong> is the process of using a multimodal AI model to read unstructured documents—like multi-page vendor invoices, scanned Bills of Lading (BOLs), or shipper emails—and convert them into clean, structured database fields (JSON).</p>' +
        '<ul>' +
        '<li><strong>How it differs from legacy OCR:</strong> Old OCR tools broke whenever a vendor moved a column or used a new invoice template. Vision-LLMs inspect the actual page image and understand layout, tables, handwritten dock notes, and multi-page line items without per-vendor templates.</li>' +
        '<li><strong>Practical business use:</strong> Extracting SKU quantities, unit costs, freight accessorials (lumper/detention), and origin/destination ZIP codes directly into NetSuite, QuickBooks, or a TMS as a staged draft.</li>' +
        '<li><strong>Control principle:</strong> Every extracted field includes a confidence score and bounding-box highlight so a human AP clerk or logistics coordinator verifies exceptions before anything posts to the general ledger.</li>' +
        '</ul>' +
        '<p>Related briefings: <a href="/news/vision-llm-ap-three-way-matching/">Vision-LLM AP Three-Way Matching</a> · <a href="/news/freight-quote-bol-triage/">3PL Freight &amp; BOL Triage</a></p>'
    },
    {
      id: 'three-way-match',
      keywords: ['three-way', '3-way', 'three way', 'po match', 'purchase order', 'ap ', 'accounts payable', 'voucher', 'variance'],
      title: 'Automated Three-Way PO Matching',
      answer: '<p><strong>Three-Way Matching</strong> is an internal accounting control that verifies three separate documents before a vendor bill is approved for payment:</p>' +
        '<ul>' +
        '<li><strong>1. Purchase Order (PO):</strong> What your buyer agreed to order and at what contracted unit price.</li>' +
        '<li><strong>2. Warehouse Receipt / Signed BOL:</strong> The actual physical quantity received and signed for at your loading dock.</li>' +
        '<li><strong>3. Vendor Invoice PDF:</strong> What the supplier is billing you for.</li>' +
        '</ul>' +
        '<p><strong>How AI helps:</strong> Vision-LLM extraction parses the vendor PDF and warehouse receipt, maps vendor item numbers to your ERP Item Master, and runs deterministic math checks. Clean matches (within ±0.5% tolerance) stage as draft ERP bills; price hikes or short-shipments route to an AP specialist exception queue.</p>' +
        '<p>Related briefing: <a href="/news/vision-llm-ap-three-way-matching/">Vision-LLM Invoice Extraction &amp; 3-Way Matching</a></p>'
    },
    {
      id: 'rag-bm25',
      keywords: ['rag', 'retrieval', 'contextual retrieval', 'bm25', 'rerank', 'reranking', 'vector', 'embedding', 'chunk', 'hybrid search'],
      title: 'Contextual Retrieval, Hybrid RAG, BM25 & Reranking',
      answer: '<p><strong>RAG (Retrieval-Augmented Generation)</strong> lets an AI answer questions using your company’s own contracts, SOPs, and financial tables instead of guessing from memory.</p>' +
        '<ul>' +
        '<li><strong>The Chunking Problem:</strong> Splitting a 50-page contract into small paragraphs ("chunks") strips away context—a chunk might say <em>"The fee increased by 4%"</em> without saying which vendor or quarter.</li>' +
        '<li><strong>Contextual Retrieval:</strong> Automatically prepends a short 50-token header (vendor name, document date, section) to every chunk before indexing.</li>' +
        '<li><strong>BM25 + Vector Hybrid Search:</strong> Vector embeddings capture semantic meaning, while <strong>BM25</strong> performs exact keyword matching on SKU codes, invoice IDs, and part numbers. Combining both with a cross-encoder <strong>Reranker</strong> reduces retrieval failures by 67%.</li>' +
        '</ul>' +
        '<p>Related briefing: <a href="/news/contextual-retrieval-hybrid-rag/">Contextual Retrieval + BM25 + Reranking</a></p>'
    },
    {
      id: 'constrained-decoding',
      keywords: ['constrained decoding', 'cfg', 'context-free grammar', 'structured output', 'json schema', 'pydantic', 'zod', 'logit', 'hallucinated gl'],
      title: 'Grammar-Constrained Decoding & Structured Outputs',
      answer: '<p><strong>Constrained Decoding (Structured Outputs)</strong> forces an LLM to output data that 100% obeys your exact JSON Schema or Pydantic/Zod type definition.</p>' +
        '<ul>' +
        '<li><strong>How it works:</strong> Instead of hoping the model writes valid JSON, the inference engine compiles your schema into a Context-Free Grammar (CFG). At every single token step, any token that would break the JSON syntax or invent an invalid General Ledger code has its probability masked to zero (<code>-∞</code>).</li>' +
        '<li><strong>Why it matters for ERP/Finance:</strong> If your schema defines allowed GL accounts as <code>["5100-COGS", "5240-FREIGHT", "6110-COLD-STORAGE"]</code>, it is mathematically impossible for the model to invent a fake account code.</li>' +
        '</ul>' +
        '<p>Related briefing: <a href="/news/schema-enforced-structured-outputs/">Constrained Decoding &amp; 100% JSON-Schema Compliance</a></p>'
    },
    {
      id: 'workflows-agents',
      keywords: ['agent', 'autonomous', 'workflow', 'prompt chaining', 'orchestrator', 'routing', 'composable'],
      title: 'Deterministic Workflows vs. Autonomous Agents',
      answer: '<p>In production software, there is a critical difference between <strong>Workflows</strong> and open-ended <strong>Autonomous Agents</strong>:</p>' +
        '<ul>' +
        '<li><strong>Workflows:</strong> Systems where LLMs and tools are orchestrated through deterministic, predictable code paths (prompt chaining, routing, parallel execution, evaluator loops).</li>' +
        '<li><strong>Autonomous Agents:</strong> Systems where the LLM dynamically decides its own control flow and loops over tools on its own.</li>' +
        '<li><strong>Why Workflows Win in Finance &amp; Ops:</strong> Unconstrained agents can loop unpredictably, rack up token costs, and fail silently. Composable code workflows give you auditability, predictable latency, and clear human approval gates.</li>' +
        '</ul>' +
        '<p>Related briefing: <a href="/news/workflows-vs-autonomous-agents/">Workflows vs. Autonomous Agents</a></p>'
    },
    {
      id: 'evals-cicd',
      keywords: ['eval', 'evaluation', 'ci/cd', 'promptfoo', 'braintrust', 'langsmith', 'arize', 'regression', 'benchmark', 'judge'],
      title: 'CI/CD LLM Evaluation Harnesses (Evals)',
      answer: '<p><strong>LLM Evals</strong> are automated unit and integration tests for AI features that run on every code or prompt change before deployment.</p>' +
        '<ul>' +
        '<li><strong>Golden Dataset:</strong> Teams maintain 100–500 real anonymised production cases (including messy edge cases).</li>' +
        '<li><strong>Deterministic + Judge Assertions:</strong> Every pull request runs the dataset and checks exact field accuracy, JSON validity, latency, and faithfulness. If accuracy drops below threshold, the build is blocked.</li>' +
        '</ul>' +
        '<p>Related briefing: <a href="/news/cicd-llm-evaluation-harnesses/">CI/CD Evaluation Harnesses</a></p>'
    },
    {
      id: 'ar-deductions',
      keywords: ['remittance', 'short-pay', 'short pay', 'deduction', 'chargeback', 'collections', 'ar ', 'accounts receivable', 'otif'],
      title: 'Wholesale AR Remittance & Deduction Recovery',
      answer: '<p>When large grocery chains or big-box retailers pay a wholesale distributor via ACH, they often pay 150 invoices at once while subtracting <strong>short-pay deductions</strong> (alleged shortages, promotional allowances, or late arrival fines).</p>' +
        '<ul>' +
        '<li><strong>How AI helps:</strong> Automatically parses remittance PDFs/EDI 820s, matches exact invoice lines, and pulls the signed carrier Proof of Delivery (POD), warehouse pick log, and promo agreement to stage a complete dispute packet in under 60 seconds—so AR specialists never miss a 30-day dispute window.</li>' +
        '</ul>' +
        '<p>Related briefing: <a href="/news/wholesale-ar-remittance-deductions/">Wholesale AR Remittance &amp; Short-Pay Deductions</a></p>'
    },
    {
      id: 'mcp-security',
      keywords: ['mcp', 'model context protocol', 'read-only', 'readonly', 'security', 'isolation', 'sql', 'permission', 'erp'],
      title: 'Read-Only ERP Isolation & Model Context Protocol (MCP)',
      answer: '<p><strong>Model Context Protocol (MCP)</strong> and <strong>Three-Layer Read-Only ERP Isolation</strong> allow AI assistants to look up live order, shipment, and invoice data safely:</p>' +
        '<ul>' +
        '<li><strong>Layer 1 (Identity Gate):</strong> Binds the session to the verified customer ID in deterministic application code.</li>' +
        '<li><strong>Layer 2 (Typed Read-Only Tools):</strong> The model never writes raw SQL and has zero write/refund/bank tools—it can only call read-only functions like <code>get_shipment_status(order_id)</code> against a read replica.</li>' +
        '<li><strong>Layer 3 (Human Release):</strong> Draft replies with attached BOLs and invoices stage in the helpdesk queue for a 10-second human review.</li>' +
        '</ul>' +
        '<p>Related briefings: <a href="/news/read-only-erp-customer-operations/">Read-Only ERP Customer Operations</a> · <a href="/news/model-context-protocol-enterprise/">Model Context Protocol (MCP)</a></p>'
    },
    {
      id: 'routing-caching',
      keywords: ['routing', 'two-tier', 'prompt caching', 'latency', 'token cost', 'reasoning model', 'small model', 'distillation'],
      title: 'Two-Tier Model Routing & Prompt Caching',
      answer: '<p><strong>Two-Tier Model Routing</strong> pairs fast, low-cost small models with frontier reasoning models:</p>' +
        '<ul>' +
        '<li><strong>85–90% of requests</strong> (classification, standard field extraction, FAQ lookups) route to fast small models (sub-500ms, pennies per million tokens).</li>' +
        '<li><strong>10–15% of complex requests</strong> (multi-constraint cold-chain re-routing, ambiguous contract clauses) escalate to deep reasoning models.</li>' +
        '<li>Combined with <strong>Prompt Caching</strong> (caching shared system instructions and schemas), teams cut inference spend by 60–80%.</li>' +
        '</ul>' +
        '<p>Related briefing: <a href="/news/two-tier-reasoning-model-routing/">Two-Tier Reasoning Model Routing</a></p>'
    },
    {
      id: 'customs-hts',
      keywords: ['customs', 'hts', 'htsus', 'tariff', 'broker', 'cross-border', 'packing list', 'commercial invoice', 'landed cost'],
      title: 'Cross-Border Customs & HTS Tariff Reconciliation',
      answer: '<p>In cross-border freight (LatAm/Canada/US), customs holds happen when the Commercial Invoice, Packing List, and Certificate of Origin have mismatched weights, carton counts, or 10-digit <strong>HTSUS tariff codes</strong>.</p>' +
        '<p>Pre-arrival AI audit engines cross-check every document 24 hours before port arrival and cite US CBP CROSS rulings so licensed brokers and logistics coordinators can fix typos before the truck reaches the border.</p>' +
        '<p>Related briefing: <a href="/news/vertical-ai-customs-freight-audit/">Vertical AI for Customs &amp; Freight Audit</a></p>'
    }
  ];

  function summarizeCurrentPage(query) {
    var h1 = document.querySelector('main h1');
    var lead = document.querySelector('.article-lead') || document.querySelector('.hero-sub');
    var callouts = Array.prototype.slice.call(document.querySelectorAll('.article-callout, .news-takeaway'));
    var headings = Array.prototype.slice.call(document.querySelectorAll('.article-body h2'));
    var paragraphs = Array.prototype.slice.call(document.querySelectorAll('.article-body p, main p'));

    var qLower = (query || '').toLowerCase();
    var qWords = qLower.replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(function (w) {
      return w.length > 3 && ['what', 'does', 'mean', 'this', 'that', 'explain', 'about', 'from', 'with', 'have'].indexOf(w) === -1;
    });

    // Check if specific paragraphs on this page match the user's words
    if (qWords.length > 0 && paragraphs.length > 0) {
      var scoredParas = [];
      paragraphs.forEach(function (p) {
        var text = (p.textContent || '').trim();
        if (text.length < 40) return;
        var tLow = text.toLowerCase();
        var hits = 0;
        qWords.forEach(function (w) {
          if (tLow.indexOf(w) !== -1) hits += 1;
        });
        if (hits > 0) {
          scoredParas.push({ text: text, hits: hits });
        }
      });
      scoredParas.sort(function (a, b) { return b.hits - a.hits; });
      if (scoredParas.length > 0) {
        var out = '<p><strong>From this page (' + (h1 ? h1.textContent : 'Scalar Teams Briefing') + '):</strong></p><ul>';
        scoredParas.slice(0, 2).forEach(function (sp) {
          out += '<li>' + sp.text + '</li>';
        });
        out += '</ul>';
        if (callouts.length > 0) {
          out += '<p><strong>Key Takeaway:</strong> ' + callouts[0].textContent.trim() + '</p>';
        }
        return out;
      }
    }

    // Default page summary
    var titleText = h1 ? h1.textContent.trim() : document.title;
    var leadText = lead ? lead.textContent.trim() : '';
    var html = '<p><strong>Plain-English Summary of "' + titleText + '":</strong></p>';
    if (leadText) {
      html += '<p>' + leadText + '</p>';
    }
    if (headings.length > 0) {
      html += '<p><strong>Core points covered:</strong></p><ul>';
      headings.slice(0, 4).forEach(function (h) {
        var nextP = h.nextElementSibling;
        var snippet = nextP && nextP.tagName === 'P' ? nextP.textContent.trim().slice(0, 170) + '…' : '';
        html += '<li><strong>' + h.textContent.trim() + ':</strong> ' + snippet + '</li>';
      });
      html += '</ul>';
    }
    if (callouts.length > 0) {
      html += '<p><strong>Bottom Line:</strong> ' + callouts[0].textContent.trim() + '</p>';
    }
    return html;
  }

  function answerQuestionLocally(query) {
    var q = (query || '').toLowerCase().trim();
    if (!q) return '<p>Ask me about any AI, finance, or logistics concept—for example: <em>"What is Vision-LLM extraction?"</em> or <em>"Explain 3-way PO matching"</em>.</p>';

    if (/summarize|summary|this article|this page|tldr|tl;dr|main point/.test(q)) {
      return summarizeCurrentPage(query);
    }

    // Score knowledge base entries
    var bestEntry = null;
    var bestScore = 0;
    KNOWLEDGE_BASE.forEach(function (entry) {
      var score = 0;
      entry.keywords.forEach(function (kw) {
        if (q.indexOf(kw) !== -1) {
          score += kw.length + 5;
        } else {
          var parts = kw.split(/\s+/);
          parts.forEach(function (part) {
            if (part.length > 2 && q.indexOf(part) !== -1) score += 2;
          });
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    });

    if (bestEntry && bestScore >= 4) {
      return bestEntry.answer;
    }

    // Fall back to searching the current page content + knowledge base overview
    return summarizeCurrentPage(query);
  }

  function initExplainerChat() {
    if (document.getElementById('scalar-explainer-fab')) return;

    // 1. Floating Action Button
    var fab = document.createElement('button');
    fab.id = 'scalar-explainer-fab';
    fab.type = 'button';
    fab.className = 'explainer-fab';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'scalar-explainer-panel');
    fab.innerHTML = '<span class="explainer-fab-dot" aria-hidden="true"></span><span>Ask AI Explainer</span>';

    // 2. Chat Panel
    var panel = document.createElement('aside');
    panel.id = 'scalar-explainer-panel';
    panel.className = 'explainer-panel';
    panel.setAttribute('aria-label', 'AI Briefing Explainer Chat');
    panel.hidden = true;

    panel.innerHTML =
      '<div class="explainer-header">' +
        '<div>' +
          '<h2 class="explainer-header-title">AI Briefing Explainer</h2>' +
          '<p class="explainer-header-sub">Ask what any AI, ERP, or logistics term means—or highlight text on any article.</p>' +
        '</div>' +
        '<div class="explainer-header-actions">' +
          '<button type="button" class="explainer-icon-btn" id="explainer-api-toggle" title="Optional: Connect live OpenAI API key">⚙ API</button>' +
          '<button type="button" class="explainer-icon-btn" id="explainer-close-btn" aria-label="Close explainer chat">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="explainer-settings" id="explainer-settings-box" hidden>' +
        '<label for="explainer-api-key">Optional OpenAI API Key (for live GPT-4o-mini answers):</label>' +
        '<input type="password" id="explainer-api-key" placeholder="sk-... (stored only in your browser localStorage)" autocomplete="off">' +
        '<div>Leave blank to use the built-in instant Scalar Teams Explainer Engine.</div>' +
      '</div>' +
      '<div class="explainer-messages" id="explainer-messages" aria-live="polite">' +
        '<div class="explainer-msg assistant">' +
          '<span class="explainer-msg-tag">Scalar Teams Explainer</span>' +
          '<p>Ask me to explain any concept from our briefings in plain English—or highlight any term on the page.</p>' +
          '<p>Try asking: <strong>"What is LLM extraction?"</strong>, <strong>"How does 3-way PO matching work?"</strong>, or <strong>"Summarize this page"</strong>.</p>' +
        '</div>' +
      '</div>' +
      '<div class="explainer-chips" id="explainer-chips">' +
        '<button type="button" class="explainer-chip" data-ask="What is Vision-LLM extraction?">What is LLM extraction?</button>' +
        '<button type="button" class="explainer-chip" data-ask="How does 3-way PO matching work?">3-Way PO Matching</button>' +
        '<button type="button" class="explainer-chip" data-ask="What is Contextual Retrieval and BM25?">RAG &amp; BM25</button>' +
        '<button type="button" class="explainer-chip" data-ask="What is constrained decoding and JSON schema?">Structured Outputs</button>' +
        '<button type="button" class="explainer-chip" data-ask="Summarize this page in plain English">Summarize this page</button>' +
      '</div>' +
      '<form class="explainer-form" id="explainer-form">' +
        '<input type="text" class="explainer-input" id="explainer-input" placeholder="e.g., What is LLM extraction?" aria-label="Ask a question" required>' +
        '<button type="submit" class="explainer-send">Ask</button>' +
      '</form>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // Also add an inline "💬 Ask AI Explainer about this article" button inside .article-header .grade-bar if present
    var articleGradeBar = document.querySelector('.article-header .grade-bar');
    if (articleGradeBar) {
      var inlineAskBtn = document.createElement('button');
      inlineAskBtn.type = 'button';
      inlineAskBtn.className = 'grade-btn';
      inlineAskBtn.style.borderColor = 'var(--steel)';
      inlineAskBtn.style.color = 'var(--steel)';
      inlineAskBtn.style.fontWeight = '600';
      inlineAskBtn.textContent = '💬 Ask Explainer about this article';
      inlineAskBtn.addEventListener('click', function () {
        openPanel();
        document.getElementById('explainer-input').focus();
      });
      articleGradeBar.appendChild(inlineAskBtn);
    }

    var closeBtn = document.getElementById('explainer-close-btn');
    var apiToggle = document.getElementById('explainer-api-toggle');
    var settingsBox = document.getElementById('explainer-settings-box');
    var apiKeyInput = document.getElementById('explainer-api-key');
    var messagesEl = document.getElementById('explainer-messages');
    var formEl = document.getElementById('explainer-form');
    var inputEl = document.getElementById('explainer-input');
    var chipsEl = document.getElementById('explainer-chips');

    try {
      var savedKey = localStorage.getItem('scalar_explainer_openai_key');
      if (savedKey && apiKeyInput) apiKeyInput.value = savedKey;
    } catch (e) {}

    if (apiKeyInput) {
      apiKeyInput.addEventListener('change', function () {
        try {
          localStorage.setItem('scalar_explainer_openai_key', apiKeyInput.value.trim());
        } catch (e) {}
      });
    }

    function openPanel() {
      panel.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
    }

    function closePanel() {
      panel.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
    }

    fab.addEventListener('click', function () {
      if (panel.hidden) {
        openPanel();
        inputEl.focus();
      } else {
        closePanel();
      }
    });

    closeBtn.addEventListener('click', closePanel);

    apiToggle.addEventListener('click', function () {
      settingsBox.hidden = !settingsBox.hidden;
    });

    function appendMessage(role, htmlContent, tagLabel) {
      var div = document.createElement('div');
      div.className = 'explainer-msg ' + role;
      if (role === 'assistant') {
        div.innerHTML = '<span class="explainer-msg-tag">' + (tagLabel || 'Scalar Teams Explainer') + '</span>' + htmlContent;
      } else {
        div.textContent = htmlContent;
      }
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    function handleQuestion(questionText) {
      var q = (questionText || '').trim();
      if (!q) return;
      openPanel();
      appendMessage('user', q);
      inputEl.value = '';

      var apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
      if (apiKey && window.fetch) {
        var loadingDiv = appendMessage('assistant', '<p>Thinking…</p>', 'Live LLM Explainer');
        var pageContext = (document.querySelector('main') ? document.querySelector('main').innerText : '').slice(0, 6000);
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are the Scalar Teams Technical & Finance AI Explainer. Explain AI engineering, accounting/ERP (3-way match, AP/AR, NetSuite, QuickBooks), and supply-chain/3PL concepts in clear, plain, practical language. Ground your answer in the current page context when relevant:\n\n' + pageContext
              },
              { role: 'user', content: q }
            ],
            temperature: 0.2
          })
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            var reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
            if (reply) {
              var formatted = '<p>' + reply.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
              loadingDiv.innerHTML = '<span class="explainer-msg-tag">Live LLM Explainer</span>' + formatted;
            } else {
              loadingDiv.innerHTML = '<span class="explainer-msg-tag">Scalar Teams Explainer</span>' + answerQuestionLocally(q);
            }
            messagesEl.scrollTop = messagesEl.scrollHeight;
          })
          .catch(function () {
            loadingDiv.innerHTML = '<span class="explainer-msg-tag">Scalar Teams Explainer</span>' + answerQuestionLocally(q);
            messagesEl.scrollTop = messagesEl.scrollHeight;
          });
      } else {
        var answerHtml = answerQuestionLocally(q);
        appendMessage('assistant', answerHtml, 'Scalar Teams Explainer');
      }
    }

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handleQuestion(inputEl.value);
    });

    chipsEl.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('.explainer-chip') : null;
      if (!chip) return;
      handleQuestion(chip.getAttribute('data-ask'));
    });

    // 3. Highlight-to-Explain floating pill when user selects text on an article
    var selPill = document.createElement('button');
    selPill.type = 'button';
    selPill.className = 'explainer-selection-pill';
    selPill.hidden = true;
    document.body.appendChild(selPill);

    var selectedPhrase = '';
    document.addEventListener('mouseup', function (e) {
      if (panel.contains(e.target) || e.target === selPill || e.target === fab) return;
      setTimeout(function () {
        var sel = window.getSelection ? window.getSelection() : null;
        var text = sel ? sel.toString().trim() : '';
        if (text && text.length >= 3 && text.length <= 90) {
          selectedPhrase = text;
          var range = sel.getRangeAt(0);
          var rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.top > 40) {
            var shortLabel = text.length > 26 ? text.slice(0, 24) + '…' : text;
            selPill.textContent = '💬 Explain "' + shortLabel + '"';
            selPill.style.left = Math.max(12, Math.min(window.innerWidth - 220, rect.left + (rect.width / 2) - 80)) + 'px';
            selPill.style.top = Math.max(12, rect.top - 42) + 'px';
            selPill.hidden = false;
            return;
          }
        }
        selPill.hidden = true;
      }, 20);
    });

    selPill.addEventListener('click', function () {
      selPill.hidden = true;
      if (selectedPhrase) {
        handleQuestion('What does "' + selectedPhrase + '" mean in this context?');
      }
    });
  }

  if (document.querySelector('.article-wrap, #news-grid-container')) {
    initExplainerChat();
  }
})();
