# scalarteams.com

Static website for **Scalar Teams**, hosted on GitHub Pages (`scalarteams.com`) with no build step.

## Pages & Structure

| Path | File | Description |
| :--- | :--- | :--- |
| `/` | `index.html` | Homepage: positioning, two audience doors (Finance & Accounting first, Senior AI Engineers second), 3-step process, founder block |
| `/finance-accounting/` | `finance-accounting/index.html` | Landing page for controllers, CFOs, and operators at distributors, importers, wholesalers, and 3PLs |
| `/hire-ai-engineers/` | `hire-ai-engineers/index.html` | Google Ads landing page for CTOs, VPs of Engineering, and Heads of AI hiring Senior AI Engineers |
| `/about/` | `about/index.html` | Founder story (Eduardo Polo, CPA), Ecuador Employer of Record office, Canada + LatAm talent pool |
| `/request-a-quote/` | `request-a-quote/index.html` | Standalone quote request form with automatic landing-page and UTM capture |
| `/thank-you/` | `thank-you/index.html` | Post-submission confirmation page that fires the Google Ads conversion tag |
| `/sitemap.xml` | `sitemap.xml` | XML sitemap for search engines |
| `/robots.txt` | `robots.txt` | Crawler rules explicitly allowing `GPTBot`, `ClaudeBot`, and `PerplexityBot` |
| `/llms.txt` | `llms.txt` | Structured Markdown overview for AI search engines and LLM assistants |

---

## Placeholders You Need to Fill

Before running live traffic, search for and replace these three sets of placeholders:

### 1. Form Backend Endpoint (`FORM_ENDPOINT`)
The quote form appears on three pages and posts to `https://formspree.io/f/FORM_ENDPOINT` (or any static form backend URL you prefer). Replace `FORM_ENDPOINT` (e.g., with your Formspree ID `mrpenlvo`) in:
- `finance-accounting/index.html` (line 299)
- `hire-ai-engineers/index.html` (line 280)
- `request-a-quote/index.html` (line 81)

> Note: `site.js` checks whether `FORM_ENDPOINT` has been replaced; once swapped, successful submissions automatically redirect visitors to `/thank-you/`.

### 2. Google Ads Conversion ID & Label (`AW-XXXXXXX` / `LABEL`)
Open `thank-you/index.html` (lines 17–28) and replace:
- `AW-XXXXXXX` with your Google Ads Conversion ID (appears in the `<script src>` URL and `gtag('config', ...)`).
- `AW-XXXXXXX/LABEL` with your specific Google Ads conversion event `send_to` string.

### 3. Social Proof & Visual Proof (`<!-- TODO -->` Comments)
No client logos, testimonials, or statistics were invented. Once you have approved proof points, replace these HTML comments:
- `index.html` (line 129): `<!-- TODO: Add client logos, controller/CTO quotes, or case studies once approved for publication -->`
- `finance-accounting/index.html` (line 254): `<!-- TODO: Add controller/CFO testimonials or distribution case studies once approved for publication -->`
- `hire-ai-engineers/index.html` (line 233): `<!-- TODO: Add CTO/VP Engineering quotes or technical placement proof points once approved for publication -->`
- `about/index.html` (line 120): `<!-- TODO: Add founder portrait and Ecuador office photos once approved for publication -->`

---

## Hosting & DNS (Unchanged)
- **GitHub Pages:** Deployed from `main` branch `(root)` with `.nojekyll` and `CNAME` (`scalarteams.com`).
