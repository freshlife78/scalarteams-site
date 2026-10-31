# scalarteams.com

The website for **Scalar Teams**: flow audits that map how a distributor, wholesaler or logistics company really runs, then a full-time bilingual engineer in the client's time zone who automates the manual work. Scope and fee are quoted in writing within one business day.

It is a single static page served by GitHub Pages. There is no build step.

## Files

| File | What it does |
|---|---|
| `index.html` | The whole site: copy, styles and the quote form |
| `favicon.svg` | The browser-tab icon (the Scalar Teams mark) |
| `CNAME` | Tells GitHub Pages to serve the site at `scalarteams.com` |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are, without Jekyll |
| `README.md` | This file |

## Quote form

The form (`#quote-form`) posts to [Formspree](https://formspree.io) form `mrpenlvo`, which emails each submission to hello@scalarteams.com. It sends: name, email, company, industry, interest and brief.

On success the script hides the form and shows `#quote-thanks` inside the `if (res.ok)` branch. That's where the Google Ads conversion call goes once the conversion action exists (see the build sheet).

Section anchors used by ad sitelinks: `#how`, `#roles` (what we automate), `#vetting` (the engineers), `#pricing`, `#faq`, `#quote`.

## Hosting

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / `(root)`. Custom domain `scalarteams.com`, with Enforce HTTPS on.
- **DNS (Squarespace Domains):**
  - `A @` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
  - `CNAME www` → freshlife78.github.io
  - MX, SPF, DKIM and DMARC records belong to Google Workspace email. Leave them alone when changing the website.

## Editing

Open `index.html` on GitHub, click the pencil icon, make the change and commit. The live site updates within a few minutes.
