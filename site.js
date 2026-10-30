(function () {
  'use strict';

  // 1. Theme preference (respects system default, allows manual toggle)
  var root = document.documentElement;
  try {
    var savedTheme = localStorage.getItem('scalar_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      root.setAttribute('data-theme', savedTheme);
    }
  } catch (e) {}

  var toggleBtn = document.querySelector('[data-theme-toggle]');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = current ? (current === 'dark' ? 'light' : 'dark') : (systemDark ? 'light' : 'dark');
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('scalar_theme', next);
      } catch (e) {}
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

    // 3. Handle static form submission & redirect to /thank-you
    form.addEventListener('submit', function (event) {
      if (!window.fetch || !window.FormData) {
        return;
      }
      event.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var statusEl = form.querySelector('.form-status');
      var originalBtnText = submitBtn ? submitBtn.textContent : 'Request written quote';

      if (statusEl) {
        statusEl.textContent = '';
      }

      if (form.action.indexOf('FORM_ENDPOINT') !== -1) {
        if (statusEl) {
          statusEl.textContent = 'Form endpoint placeholder (FORM_ENDPOINT) is not configured yet. Please email your role brief directly to hello@scalarteams.com.';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending request…';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Submission failed');
          }
          window.location.href = '/thank-you/';
        })
        .catch(function () {
          if (statusEl) {
            statusEl.textContent = 'We could not submit the form right now. Please email your brief directly to hello@scalarteams.com.';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
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
})();
