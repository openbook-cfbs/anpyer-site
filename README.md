# anpyer.com

> Official website for **AnPyer** — a real Jupyter Notebook for Android.
> Static HTML/CSS, zero build step, hosted on GitHub Pages at <https://anpyer.com/>.

[![Live](https://img.shields.io/badge/site-anpyer.com-5cc8ff)](https://anpyer.com/)
[![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-222)](https://pages.github.com/)
[![No build](https://img.shields.io/badge/build-none-2ea44f)](#development)

<!-- TODO: screenshot / social preview of the landing page -->

## Table of contents

- [About](#about)
- [Pages](#pages)
- [Project structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Maintenance](#maintenance)
- [Roadmap](#roadmap)
- [License](#license)

## About

This repository contains the public website for the AnPyer Android app. It serves three purposes:

1. **Product page** — what the app is, what it bundles, what it costs.
2. **Legal** — privacy policy, terms of use and third-party notices required by Google Play.
3. **Support** — contact address, FAQ and bug-report guidance.

The site is intentionally boring on the engineering side: hand-written HTML, two CSS files, one tiny script, no framework, no bundler. Edit a file, push, done.

<!-- TODO: one paragraph on design principles (dark-first, product-page blocks, bilingual) -->

## Pages

| Path | Language | Purpose | Play Console requirement |
|---|---|---|---|
| `/` | en | Landing page | Store listing → Website |
| `/zh/` | zh-CN | Landing page (Chinese) | — |
| `/privacy/` | en | Privacy policy (legally binding version) | Privacy policy URL |
| `/zh/privacy/` | zh-CN | Privacy policy (translation, English prevails) | Linked from the app by locale |
| `/terms/` `/zh/terms/` | en / zh-CN | Terms of use | Recommended for paid apps |
| `/support/` `/zh/support/` | en / zh-CN | Support, FAQ, bug reports | Store listing → Support |
| `/notices/` | en | Third-party open-source notices, rendered from `notices/third-party-notices.json` | Same data as *About → Open-source licences* in the app |
| `/404.html` | bilingual | Not-found page picked up by GitHub Pages | — |

Every page shares the same shell: sticky translucent header (brand, section links, language menu), full-width content blocks, footer with legal links.

## Project structure

```
.
├── index.html               # Landing page (en)
├── zh/                      # Chinese pages, mirroring the English tree
│   ├── index.html
│   ├── privacy/  terms/  support/
├── privacy/  terms/  support/  notices/
├── 404.html
├── assets/
│   ├── site.css             # Base: variables, header, language menu, blocks, typography, footer
│   ├── landing.css          # Landing-only blocks: hero, phone mockups, chips, steps, pricing
│   ├── site.js              # Language menu behaviour + scroll-reveal (progressive enhancement)
│   └── icons.svg            # SVG sprite: UI icons (globe, chevron, check)
├── scripts/
│   └── fill-placeholders.ps1  # One-shot placeholder replacement + notices JSON sync
├── CNAME  robots.txt  sitemap.xml  .nojekyll
└── README.md
```

### Layout model

- `assets/site.css` owns the **page skeleton** used by every page: `.site-header`, `.block` / `.block.alt` full-width sections with a centred `.inner` (max `--wide`, 72 rem), `.page-hero` title banner, `.doc` long-form column (max `--doc`, 46 rem), `.site-footer`.
- `assets/landing.css` adds only what the landing pages need (two-column `.split`, `.phone` mockups, `.chips`, `.steps`, `.stats`, `.pricing-block`, `.reveal` animation).
- Colours are CSS variables; dark is the default, light follows `prefers-color-scheme`.

### Language menu

The header language switch is a native `<details class="lang-menu">`: a globe icon opens a dropdown listing each language with its flag emoji, the current one ticked. It works without JavaScript; `site.js` only adds close-on-outside-click and Escape. Icons come from `assets/icons.svg` via `<use href="/assets/icons.svg#…">`; flags are plain emoji (🇬🇧 🇨🇳).

To add a language: add one `<li>` to the menu on every page and mirror the page tree under `/xx/`.

### Cache busting

GitHub Pages caches assets for 10 minutes and browsers longer. Stylesheet / script / sprite URLs carry a `?v=N` query string; bump it whenever you change a file under `assets/`.

## Development

There is nothing to install. Serve the directory with any static server — **do not open the files directly**, because links are root-absolute (`/privacy/`) and the notices page fetches JSON:

```bash
# pick one
python -m http.server 8080
npx serve .
```

Then open <http://localhost:8080/>.

<!-- TODO: browser support statement (color-mix, dvh, :has-free — modern evergreen only) -->

## Deployment

Pushing to `main` deploys automatically (GitHub Pages, *Deploy from a branch*, root). Changes go live in about a minute.

DNS is managed at Cloudflare and points the apex and `www` at GitHub Pages; the `CNAME` file in this repository pins the custom domain. HTTPS is issued by GitHub (Let's Encrypt).

<!-- TODO: condensed first-time setup (Pages settings, A/AAAA records, DNS-only mode on Cloudflare, Enforce HTTPS) -->

## Configuration

### Placeholders

The only placeholders left in the HTML are the publisher names, which must match the developer name shown in the Play Console listing **character for character**:

- `[COMPANY LEGAL NAME]` — English pages
- `[公司法定名称]` — Chinese pages

Fill them once with:

```powershell
pwsh -File scripts/fill-placeholders.ps1 -LegalNameEn "<Play developer name>" -LegalNameZh "<same, or Chinese>"
```

The script is idempotent and also copies `AnPyer/src/generated/third-party-notices.json` into `notices/` if the app repository is available next to this one (`-AnPyerRepo` to override).

### Links from the app

The app's `src/config/links.ts` references this site (`PRIVACY_POLICY_URL`, `SUPPORT_EMAIL`, localized privacy URL). Keep the paths above in sync when moving pages.

<!-- TODO: table of external references (Play Console fields, app links.ts constants) -->

## Maintenance

- **Privacy policy / terms** — edit both language versions, bump the version and effective date at the top, mention material changes in the Play release notes.
- **Third-party notices** — after the app's dependencies change, run `uv run scripts/licenses.py --notice` in the app repo, then re-run `fill-placeholders.ps1` (or copy the JSON by hand).
- **Landing copy** — the marketing text is still a placeholder draft; see [Roadmap](#roadmap).

## Roadmap

- [ ] Rewrite landing-page copy (both languages)
- [ ] Replace CSS phone mockups with real device screenshots (`<img>` slots)
- [ ] Feature graphic / social preview image
- [ ] Google Search Console domain verification
- [ ] Fill publisher name placeholders before store submission

<!-- TODO: link to the internal planning doc if/when it moves out of the app repo -->

## License

<!-- TODO: decide. Suggested: site code (HTML/CSS/JS) under MIT; text, brand assets and screenshots © [COMPANY LEGAL NAME], all rights reserved. -->

Copyright © 2026 [COMPANY LEGAL NAME]. All rights reserved unless stated otherwise.
