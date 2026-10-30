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

      // Guard if FORM_ENDPOINT placeholder has not been swapped yet
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

  // 4. AI Briefing & News Category Filter
  var filterBtns = document.querySelectorAll('[data-news-filter]');
  var newsCards = document.querySelectorAll('[data-news-category]');
  if (filterBtns.length > 0 && newsCards.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var selected = btn.getAttribute('data-news-filter');
        filterBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        newsCards.forEach(function (card) {
          var cat = card.getAttribute('data-news-category');
          if (selected === 'all' || cat === selected) {
            card.hidden = false;
          } else {
            card.hidden = true;
          }
        });
      });
    });
  }

  // Auto-expand targeted briefing when navigating to /news/#brief-...
  function expandHashBriefing() {
    if (!window.location.hash) return;
    var target = document.querySelector(window.location.hash);
    if (target) {
      target.hidden = false;
      var details = target.querySelector('details.news-expand');
      if (details) {
        details.open = true;
      }
    }
  }
  expandHashBriefing();
  window.addEventListener('hashchange', expandHashBriefing);

  // 5. Live AI Engineering Wire (expands inline on our site, naming the source without redirecting off-site)
  var liveList = document.getElementById('live-ai-wire');
  var liveStatus = document.getElementById('live-ai-wire-status');
  if (liveList && window.fetch) {
    var hnUrl = 'https://hn.algolia.com/api/v1/search_by_date?query=LLM%20OR%20RAG%20OR%20%22AI%20agent%22%20OR%20Anthropic%20OR%20OpenAI&tags=story&numericFilters=points%3E35&hitsPerPage=6';
    fetch(hnUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.hits || data.hits.length === 0) return;
        liveList.innerHTML = '';
        data.hits.forEach(function (hit) {
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

          var titleSpan = document.createElement('span');
          titleSpan.style.color = 'var(--text-primary)';
          titleSpan.style.fontWeight = '600';
          titleSpan.textContent = hit.title;

          var domain = 'Community Wire';
          if (hit.url) {
            try {
              domain = new URL(hit.url).hostname.replace(/^www\./, '');
            } catch (e) {}
          }
          var dateStr = hit.created_at ? hit.created_at.slice(0, 10) : '';

          var body = document.createElement('div');
          body.className = 'news-expanded-body';
          var p1 = document.createElement('p');
          p1.textContent = 'Tracked in our live AI engineering wire (' + hit.points + ' practitioner upvotes, ' + (hit.num_comments || 0) + ' technical comments on ' + dateStr + '). Our engineering team monitors emerging model releases, retrieval benchmarks, and production failure reports to keep our technical vetting assessments current.';
          var cite = document.createElement('span');
          cite.className = 'source-citation';
          cite.textContent = 'Named Source: ' + domain + ' · Reported by ' + (hit.author || 'engineering contributor') + ' · ' + dateStr;

          body.appendChild(p1);
          body.appendChild(cite);
          summary.appendChild(titleSpan);
          details.appendChild(summary);
          details.appendChild(body);
          li.appendChild(details);
          liveList.appendChild(li);
        });
        if (liveStatus) {
          liveStatus.textContent = 'Live feed updated · Click any headline to expand on-site';
        }
      })
      .catch(function () {
        if (liveStatus) {
          liveStatus.textContent = 'Click any headline to expand on-site';
        }
      });
  }
})();
