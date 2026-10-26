# anpyer.com

> Official website for **AnPyer** — a real Jupyter Notebook for Android.
> Static HTML/CSS, zero build step, hosted on GitHub Pages at <https://anpyer.com/>.

[![Live](https://img.shields.io/badge/site-anpyer.com-5cc8ff)](https://anpyer.com/)
[![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-222)](https://pages.github.com/)
[![No build](https://img.shields.io/badge/build-none-2ea44f)](#development)

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
│   ├── landing.css          # Landing-only blocks: hero, splits, stats, limits, pricing + .pkg-wall
│   ├── site.js              # Language menu behaviour + scroll-reveal (progressive enhancement)
│   ├── icons.svg            # SVG sprite: UI icons (globe, chevron, check)
│   └── brand/               # GENERATED icons (see "Brand images") + official Google Play badges
├── favicon.ico              # GENERATED — 16/32/48 multi-frame
├── CNAME  robots.txt  sitemap.xml  .nojekyll
└── README.md
```

### Layout model

- `assets/site.css` owns the **page skeleton** used by every page: `.site-header`, `.block` / `.block.alt` full-width sections with a centred `.inner` (max `--wide`, 72 rem), `.page-hero` title banner, `.doc` long-form column (max `--doc`, 46 rem), `.site-footer`.
- `assets/landing.css` adds only what the landing pages need (two-column `.split`, `.stats`, `.limits`, `.pricing-block`, `.reveal` animation, plus the generated `.pkg-wall` of section 2 — always dark, one tinted card per bucket with the bucket name on top).
- Colours are CSS variables; dark is the default, light follows `prefers-color-scheme`.

### Language menu

The header language switch is a native `<details class="lang-menu">`: a globe icon opens a dropdown listing each language with its flag emoji, the current one ticked. It works without JavaScript; `site.js` only adds close-on-outside-click and Escape. Icons come from `assets/icons.svg` via `<use href="/assets/icons.svg#…">`; flags are plain emoji (🇬🇧 🇨🇳).

### Brand images

`favicon.ico` and everything under `assets/brand/` are **generated, do not hand-edit**. The single source of truth is the 1024² icon master set in the app repo (`AnPyer/assets/icon/`); `AnPyer/scripts/gen-site-icons.py` renders the web sizes and writes them straight into this repo (the two repos are expected to be sibling directories). To refresh after the icon changes: in the app repo run `uv run --with pillow python scripts/gen-site-icons.py` (add `--check` to verify without writing), then commit here. Every page's `<head>` links `/favicon.ico`, `/assets/brand/favicon-32.png`, `/assets/brand/apple-touch-icon.png` and `og:image`; the header `<img class="logo">` uses `brand-64.png` (displayed at 26 px); the landing hero is a two-column split (`.hero-split`: copy left with `icon-512.png` inline at the start of the `<h1>` as a drop-cap (sized in em, tracks the heading), phone mockup right; stacks under 52rem) — the icon is rounded, transparent, same size as the Play listing icon — also the file to hand out for press / social avatars).

To add a language: add one `<li>` to the menu on every page and mirror the page tree under `/xx/`.

### Generated blocks (section 2 package cards)

Section 2 of the landing page (“Preinstalled”, both languages) is **generated — do not hand-edit it**. Two marker pairs and two bare `meta` numbers delimit the generated parts:

| Marker | Content | Source |
|---|---|---|
| `<!-- BEGIN:packages … -->` … `<!-- END:packages -->` | the card rail (`.pkg-wall`): one `<article class="pkg-card">` per bucket — bucket name on top, that bucket's pills below, the card tinted by its own `--cat` | `AnPyer/packages.toml` (`site_buckets` / `site_hidden` / `display` / `site_featured`), rendered by `AnPyer/scripts/sync-site-packages.py` |
| `<!-- BEGIN:pkgcount -->70+<!-- END:pkgcount -->` | the package counter in visible copy (hero lead + section 2 lead) | same script: floor(distinct packages ÷ 10) × 10, then `+` |
| the `70+` inside `<meta name="description">` and `<meta property="og:description">` | the same number, **without any marker** — an `<!-- -->` inside an attribute value is not a comment: crawlers and social cards would render it verbatim | rewritten in place by the same script (plain `\d+\+` regex on those two tags) |

After any package change in the app repo run `uv run scripts/sync-site-packages.py` there (the two repos are expected to be sibling directories; `--check` verifies without writing — it compares the cards, the visible counters, both `meta` descriptions **and** the package count quoted in the store material under `AnPyer/MarketingMaterial/`, so a stale `60+` anywhere fails). Bucket names, colours and order live in that script's `BUCKETS` table (no per-release "New in x.y" badges — the cards only say what's in the app now); `site_hidden = true` packages are internal dependencies and never appear. A package may sit in several buckets, so it shows up on several cards — **the counter counts packages once**, and a bucket with no packages produces no card. The old screenshot `assets/demo/06-packages-wall.png` is kept for the Play listing only.

The rail is dark in **both** themes (`.pkg-section` remaps the theme variables rather than painting a slab inside a light block). It scrolls sideways: `scroll-snap` plus a fixed card width so the next card peeks out on a phone; `assets/site.js` turns the mouse wheel into horizontal scrolling while the pointer is over the rail and hands the wheel back to the page at either end; the container carries `tabindex="0"` so the arrow keys scroll it. Without JavaScript it is still an ordinary horizontally scrollable box.

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

## Deployment

Pushing to `main` deploys automatically (GitHub Pages, *Deploy from a branch*, root). Changes go live in about a minute.

DNS is managed at Cloudflare and points the apex and `www` at GitHub Pages; the `CNAME` file in this repository pins the custom domain. HTTPS is issued by GitHub (Let's Encrypt).

## Configuration

### Placeholders

All placeholders have been filled. The publisher name is **`Open Book Co., Ltd.`** on every page (both languages) and must stay identical to the developer name shown in the Play Console listing. If that name ever changes, search-and-replace the `<span class="legal-name">` contents across the HTML.

### Google Play badge

`assets/brand/google-play-badge-{en,zh-cn}.svg` are the **official** badges downloaded from <https://play.google.com/intl/en_us/badges/>. Per Google's brand guidelines they must not be recoloured, reshaped or redrawn; the footer carries the required trademark line. Replace them only with files from that generator.

### Links from the app

The app's `src/config/links.ts` references this site (`PRIVACY_POLICY_URL`, `SUPPORT_EMAIL`, localized privacy URL). Keep the paths above in sync when moving pages.

## Maintenance

- **Privacy policy / terms** — edit both language versions, bump the version and effective date at the top, mention material changes in the Play release notes.
- **Third-party notices** — after the app's dependencies change, run `uv run scripts/licenses.py --notice` in the app repo and copy `src/generated/third-party-notices.json` to `notices/`.
- **Preinstalled packages (landing section 2)** — after editing `AnPyer/packages.toml`, run `uv run scripts/sync-site-packages.py` in the app repo (`--check` verifies without writing, and also reports the package count quoted in the store material) and commit the result here. It rewrites the card rail and the `70+` counters in `index.html` and `zh/index.html`; bucket names, colours and order come from that script's `BUCKETS` table, and every Android-available package must carry at least one bucket in `site_buckets` (`pkg.py check` enforces it).

## Roadmap

- [x] Rewrite landing-page copy (both languages)
- [x] Replace CSS phone mockups with real device screenshots
- [x] Fill publisher name placeholders before store submission
- [x] Official Google Play badge after the app went live
- [ ] Feature graphic / social preview image

## License

Copyright © 2026 Open Book Co., Ltd. All rights reserved unless stated otherwise.
