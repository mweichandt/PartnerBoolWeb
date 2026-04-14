# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static single-page marketing website for **Partner Bool**, a digital property management company for condominiums. Plain HTML/CSS/JS (no build step) with GSAP and Lenis loaded via CDN.

## Development

Serve with any static file server: `npx serve .`, `python -m http.server`, or VS Code Live Server. Entry point is `index.html`.

## Architecture

Three files hold the entire site: `index.html` (496 lines), `css/styles.css` (1640 lines), `js/main.js` (453 lines). The `old/` directory is a backup of the original single-file version — do not modify.

### JS structure (`js/main.js`)

Everything runs inside a single IIFE — no globals, no modules. Key coupling to understand:

- **Lenis ↔ GSAP sync**: Lenis handles smooth scroll but its `raf` is driven by GSAP's ticker (`gsap.ticker.add`), and Lenis scroll events feed `ScrollTrigger.update`. These must stay in lockstep. `lagSmoothing(0)` is intentional.
- **Preloader timing cascade**: Preloader hides at 1.4s → reveal animations init at 1.6s → `ScrollTrigger.refresh(true)` at 2.2s. These delays are coordinated; changing one may break scroll positioning.
- **`prefersReducedMotion` is a hard gate**: Checked once at load. When true, Lenis is never instantiated, all GSAP animations are skipped, and the `lenis` variable is `undefined`. Every consumer guards on it.

### CSS structure (`css/styles.css`)

Organized as numbered sections matching page order. Key section ranges for navigation:

| Lines | Section |
|-------|---------|
| 1–56 | Reset + Design tokens (`:root` vars) |
| 57–136 | Utilities (`.container`, `.section`, `.split`, noise texture) |
| 137–181 | Preloader |
| 182–337 | Navigation + Mobile menu |
| 338–567 | Hero (Ken Burns, overlays, parallax, word reveal) |
| 568–598 | Marquee |
| 599–712 | Problem + Pillars (diferencial) |
| 713–806 | Process (4-step timeline) |
| 807–859 | Stats (animated counters) |
| 860–921 | Testimonials (carousel base) |
| 922–1009 | Team |
| 1010–1169 | FAQ + Contact form |
| 1170–1288 | Footer + Floating elements (WhatsApp, back-to-top) |
| 1289–1515 | Responsive breakpoints |
| 1518–1579 | Antes vs Después comparison |
| 1581–1640 | Nav indicator, scroll stability, manifesto bg, reduced-motion |

### Animation system

- `data-reveal` attribute on HTML elements (`up`, `left`, `right`, `scale`) + optional `data-reveal-delay` → GSAP `ScrollTrigger` with `once: true`
- `ScrollTrigger.refresh(true)` fires at 2.2s and on `window.load` to prevent scroll position miscalculation after late-loading content
- Hero title uses word-by-word split animation (JS wraps each word in `<span class="word"><span class="word-inner">`)

### Custom cursor

Circle ring (26px) + center dot (5px). Color switches between yellow (dark sections) and grey (light sections) via `elementFromPoint` detection on `mousemove`. Three states: default, `is-hover` (expanded ring on interactive elements), `is-text` (vertical line on inputs). Hidden on touch devices and when `prefers-reduced-motion` is set.

### External libraries (CDN — no local copies)

- **GSAP 3.12.5** + **ScrollTrigger** — all scroll-triggered animations, parallax, counters
- **Lenis 1.1.18** — smooth scroll engine
- **Manrope** (Google Fonts, weights 300–800)

## Gotchas

- **Marquee seamless loop**: Content is duplicated 4x in HTML and CSS animates `translateX(-25%)`. Adding/removing items requires maintaining 4 copies.
- **Bleed gap fix**: `<div class="bleed">` transitions between sections use `margin-top: -1px; margin-bottom: -1px` to prevent subpixel rendering gaps. Do not remove these margins.
- **Image filenames have spaces and mixed case**: `Atardecer.JPEG` (capital extension), `Naty Dummy.jpg`, `Gas Dummy.png`, `Max Dummy.jpg`. Preserve exact casing — case matters on Linux servers.
- **Logo fallback**: `<img>` tags for logos use inline `onerror` that replaces the `<img>` with a styled `<span>`. If editing logo markup, preserve this fallback.
- **Carousel is scroll-snap, not GSAP**: Testimonial carousel uses CSS `scroll-snap-type` + JS `scrollTo()` — not GSAP ScrollTrigger. Autoplay interval is 5s.
- **Nav indicator tracking**: Only 4 sections are tracked (`problema`, `diferencial`, `proceso`, `equipo`). Adding a new nav link requires updating the `sectionIds` array in JS.

## Conventions

- **Language**: All copy in Spanish, Argentine dialect ("vos" form)
- **Primary accent**: `--yellow` (#FFD200) — used for highlights, hover states, and CTAs
- **Lateral padding**: `--section-pad-x: clamp(15px, 3vw, 36px)` — all sections use this
- **Responsive breakpoints**: 1024px (tablet), 768px (mobile: hamburger nav, cursor hidden, single-column), 640px (carousel 1-col), 480px (stats 1-col)
- **Section theming classes**: `.section--warm` (off-white), `.section--white`, `.section--dark` (near-black), `.section--black` — these also control cursor color detection

### Contact & integrations

- **Formspree** form: `https://formspree.io/f/mojpyypn` — uses `_subject` + `_gotcha` honeypot
- **WhatsApp**: `wa.me/5491159725509` — floating button + footer link
- **Social links**: Instagram (`/partnerbool`) and LinkedIn (`/company/partnerbool`) URLs are placeholders — replace with real profile URLs
