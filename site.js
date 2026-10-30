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

  // 5. Live AI Engineering Wire (fetches top-voted AI/LLM engineering discussions live)
  var liveList = document.getElementById('live-ai-wire');
  var liveStatus = document.getElementById('live-ai-wire-status');
  if (liveList && window.fetch) {
    var hnUrl = 'https://hn.algolia.com/api/v1/search_by_date?query=LLM%20OR%20RAG%20OR%20%22AI%20agent%22%20OR%20Anthropic%20OR%20OpenAI&tags=story&numericFilters=points%3E35&hitsPerPage=8';
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
          var link = document.createElement('a');
          link.href = hit.url || ('https://news.ycombinator.com/item?id=' + hit.objectID);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = hit.title;

          var meta = document.createElement('span');
          meta.className = 'news-source';
          var dateStr = hit.created_at ? hit.created_at.slice(0, 10) : '';
          var domain = '';
          if (hit.url) {
            try {
              domain = new URL(hit.url).hostname.replace(/^www\./, '') + ' · ';
            } catch (e) {}
          }
          meta.textContent = domain + hit.points + ' pts · ' + dateStr;

          li.appendChild(link);
          li.appendChild(meta);
          liveList.appendChild(li);
        });
        if (liveStatus) {
          liveStatus.textContent = 'Live feed updated from Hacker News AI/LLM wire';
        }
      })
      .catch(function () {
        if (liveStatus) {
          liveStatus.textContent = 'Showing curated archive';
        }
      });
  }
})();
