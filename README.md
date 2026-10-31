# scalarteams.com

The website for **Scalar Teams**: flow audits that map how a distributor, wholesaler or logistics company really runs, then a full-time bilingual engineer in the client's time zone who automates the manual work. Scope and fee are quoted in writing within one business day.

It is a static site served by GitHub Pages. There is no build step. The homepage carries its own styles; the inner pages share `styles.css` and `site.js`.

## Files

| File | What it does |
|---|---|
| `index.html` | The homepage: flow audit, what we automate, vetting, pricing terms, FAQ and the quote form (styles inline) |
| `finance-accounting/` | Managed finance offer plus finance, AP/AR and logistics hires |
| `hire-ai-engineers/` | Senior AI, ML and data engineers: roles, vetting, time-zone overlap |
| `about/` | Founder story, the Ecuador office and the talent pool |
| `news/` | Practical AI briefing: index, 12 articles, curation trainer and explainer chat |
| `request-a-quote/` | The quote form on its own page |
| `thank-you/` | Optional landing page for a Formspree redirect; not linked (the forms show an inline thank-you instead). Holds the commented-out Google Ads conversion tag |
| `styles.css` | Shared stylesheet for the inner pages (live palette, Archivo) |
| `site.js` | Shared script: mobile menu, quote form posting, UTM capture, briefing curation trainer, live wire and explainer chat |
| `images/` | Diagrams and article images |
| `sitemap.xml`, `robots.txt`, `llms.txt` | Search and AI-crawler files |
| `curation-preferences.json`, `scripts/curate_news_bot.py` | Exported briefing preferences and the publishing-bot scoring script |
| `favicon.svg` | The browser-tab icon (the Scalar Teams mark) |
| `CNAME` | Tells GitHub Pages to serve the site at `scalarteams.com` |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are, without Jekyll |
| `README.md` | This file |

## Quote form

The form (`#quote-form`) posts to [Formspree](https://formspree.io) form `mrpenlvo`, which emails each submission to hello@scalarteams.com. It sends: name, email, company, industry, interest and brief, plus two hidden fields (`landing_page`, `utm_parameters`) filled by `site.js`. The same form, with the same fields, appears on the homepage, `/finance-accounting/`, `/hire-ai-engineers/` and `/request-a-quote/`; only the preselected interest and the email subject differ.

On success the script hides the form and shows `#quote-thanks` inside the `if (res.ok)` branch. That's where the Google Ads conversion call goes once the conversion action exists (see the build sheet).

Section anchors used by ad sitelinks: `#how`, `#roles` (what we automate), `#vetting` (the engineers), `#pricing`, `#faq`, `#quote`.

## Hosting

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / `(root)`. Custom domain `scalarteams.com`, with Enforce HTTPS on.
- **DNS (Squarespace Domains):**
  - `A @` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
  - `CNAME www` → freshlife78.github.io
  - MX, SPF, DKIM and DMARC records belong to Google Workspace email. Leave them alone when changing the website.

## Editing

Open the page's `index.html` on GitHub, click the pencil icon, make the change and commit. The live site updates within a few minutes. Shared header, footer and form markup is repeated in each page, so a change to those needs to be made in every file.
