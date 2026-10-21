# scalarteams.com

The website for **Scalar Teams**: nearshore senior AI engineers, quoted in writing within one business day.

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

The form posts to [Formspree](https://formspree.io), which emails each submission to hello@scalarteams.com.

To connect it, open `index.html`, find `YOUR_FORM_ID` and replace it with the form's ID (the part after `/f/` in the Formspree endpoint). Until then, the form shows an error asking visitors to email hello@scalarteams.com instead.

## Hosting

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / `(root)`. Custom domain `scalarteams.com`, with Enforce HTTPS on.
- **DNS (Squarespace Domains):**
  - `A @` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
  - `CNAME www` → freshlife78.github.io
  - MX, SPF, DKIM and DMARC records belong to Google Workspace email. Leave them alone when changing the website.

## Editing

Open `index.html` on GitHub, click the pencil icon, make the change and commit. The live site updates within a few minutes.
