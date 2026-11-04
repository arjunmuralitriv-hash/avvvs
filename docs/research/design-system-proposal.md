# AVVVS design system v2: proposal

Status: proposal, for client review. It replaces `design-system/MASTER.md` (v1, "Vellum") once approved.
Author process: `design-taste-frontend` (tasteskill v2), run 2026-11-04. Its raw outputs are in `docs/research/taste/`:

| File | What it is |
| --- | --- |
| `docs/research/taste/direction-sheet.md` | The direction the skill dealt (seed 1753979869, "The place carries it") |
| `docs/research/taste/direction.json` | Same, machine-readable |
| `docs/research/taste/before/` | Inspector run on the v1 site at http://localhost:3000 (screenshots at 1440, 768 and 390, plus `report.json`) |
| `docs/research/taste/ref-pear/`, `ref-kama/`, `ref-lelabo/` | Inspector runs on reference sites |
| `docs/research/taste/contrast.txt` | Computed WCAG contrast for every token pair in section 2 |

Source of truth order: `docs/brief/creative-brief.md` > this file > PLAN.md (v1). Every fact used in copy comes from `src/lib/site.ts`, `src/content/*` or Shopify. Anything else is marked **UNVERIFIED**.

---

## 0. Why v1 reads bland (measured, not felt)

The inspector ran on http://localhost:3000 on 2026-11-04: **6 FAIL, 4 WARN**. Read it with the screenshots in `.hallmark/shots/` and `docs/research/taste/before/`.

1. **Every part of the colour sits in the middle.** The page ground is `#f6f0e0`, a yellow cream. Section grounds are `#ece0c8` and `#e0ceb1`, which are beige on beige. The ink is maroon-brown, so dark brown sits on light brown. Nothing on the page is close to white or close to black, so there is no light source and no depth. The only colour with any strength is the blue button. The inspector flags `palette-cream`: this is the third-wave AI look, a warm "editorial" cream used as a shortcut to premium.
2. **The type is two safe defaults.** It pairs Crimson Pro 600, a bookish old-style serif set semibold, with Hanken Grotesk. The hero is 84px (5.8vw) on **4 lines**, which fails the two-line rule. Top-scored gallery sites use a median of 8.4vw for their largest type, while weak sites use 5.0vw, so v1 sits with the weak ones. The size steps 14 / 16 / 21 / 52 / 84 are fine on paper, but the 52px chapter headings are set in boxes beside the hero-scale props. As a result no screen has one dominant thing.
3. **Ornament stands in for an idea.** There are 18 hairlines, a double rule under the nav and over every card, 1px outlined buttons, chips and boxes, and chapter numbers ("3.", "4."). This is broadsheet cosplay: the shapes of a ledger with no ledger behind them.
4. **The 3D is procedural clip art.** It shows a sprig of identical ellipse leaves, a smooth torus uruli and bottles with invented "THAILAM" labels. Worse, the PDP lays a fake 3D bottle over the real Shopify photo (`products-dhanwantharam-thailam-1440x900.png`), which breaks the brief's rule 6 ("no generic AI-generated product packaging").
5. **Every chapter has the same composition.** Each one is a boxed text card plus one prop on a flat field. The page has **0 photographs** and 0 video, and the hero is 92% canvas. It runs 10.6 screens with only 356 words.
6. **The copy is accurate but flat.** Headlines are sentences ("Herbs picked in Kerala, medicine since 1921", 43 characters). The store intro is about the checkout ("Payment and delivery are handled at Shopify checkout") rather than the medicines.
7. **The frame is off.** Margins are 144px left and 169px right at 1440px, and 24px left and 98px right at 768px. The "Find the clinic" heading is covered by the stage on screen 10.
8. **The nav is busy.** The full two-panel centenary lockup is shown at 104px, with an outlined Cart button, a filled Book button and a double rule, so three framed objects compete in 76px of height.

v2 fixes these by giving the page one light and one dark, real pictures (the painted film plus real product photographs), one large type moment per screen, and no lines.

---

## 1. Direction

**Dealt:** "The place carries it" (seed 1753979869). The film frame *is* the first screen, at 100vw × 100svh. The title sits on its bottom edge like a film title, and the design steps back. After the film the page keeps that restraint: short text in a narrow column, pictures large, practical information gathered once.
- Three directions were dealt: `uneven-photographs`, `place-carries-it` and `borrowed-category`. `place-carries-it` was chosen because the client wants a pear.no-style film with quiet UI around it, and this direction is built for exactly that (one frame, no clutter on top of it).
- **Redraw recorded:** the dealt type system was Boska alone, for display and text. Boska stays as the display face. The text face is **Geist**, for two reasons: (a) the store shows prices, quantities, filters and cart totals at 13–16px, which need a UI face with tabular figures; (b) Boska has `tnum`, but a high-contrast serif at 13px in a cart reads as wedding stationery, not a pharmacy. This is the two-face limit, not a blend.
- **Palette:** the dealt proportions are kept: one ground, one ink, the accent on the action only, and photographs carry the colour. The dealt colours ("green-black and bone", jade accent) are re-sourced from the subject. The green-black ink stays (the forest of Scene 01), the bone ground stays, and **the jade accent is replaced by AVVVS blue** from the logo.

**The idea sentence.** On this site, *the logo's own blue panel with cream numerals* becomes *the one saturated field that closes every page*. The footer is the logo, enlarged: AVVVS blue `#0067aa` ground, cream `#fffbd6` ink, and the clinic's phone number set as the display line. Competitor test: no other vaidya sala's logo is this blue-and-cream panel, so the idea is AVVVS's own.

**Supporting observation (pear.no).** pear.no's painted frames (inspected 2026-11-04, `ref-pear/desktop-page-01.jpg`) sit on a saturated cobalt sky that is close in hue to AVVVS blue, with gold objects and classical hands. AVVVS blue and gold can therefore enter the *film* as painted sky and lamplight without becoming UI decoration. That is for the film plan to use; it is noted here so the palettes agree.

**The one live thing.** An **"Open now / next slot"** line, computed in the browser from `clinic.timeSlots` (09:00–13:00 and 14:00–17:00) in `Asia/Kolkata`. It reads either "Consultations open now, until 1:00 PM" or "Next consultation slot: today, 2:00 PM", and links to `/consultation?slot=<id>`. It appears in the contact section and in the footer's top row. The server-rendered fallback is the static slot list. **UNVERIFIED:** the clinic's open *days* (Sunday? holidays?) are not on avvvs.com. Until the client confirms them, the line must say "slot" and never say "open today" on a Sunday. Add `clinic.days` to `src/lib/site.ts` only when confirmed.

---

## 2. Type system

### 2.1 Families

| Role | Family | Weights / styles to load | Licence | Source URL | Loader |
| --- | --- | --- | --- | --- | --- |
| Display (h1, h2, film titles, statements, prices on PDP) | **Boska** | 400, 400 italic, 500 | ITF Free Font License (FFL): free for personal and commercial use, self-hosting permitted. Keep the licence file in the repo. | https://www.fontshare.com/fonts/boska | Download the woff2 files into `src/app/fonts/boska/` and load them with `next/font/local` |
| Text and UI (body, nav, buttons, forms, product cards, cart, tables) | **Geist** | variable 400–600 (only 400, 500 and 600 are used) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Geist | `next/font/google` (`Geist`) |
| Malayalam text (`:lang(ml)`, UI and body) | **Anek Malayalam** | variable 400–600 | SIL OFL 1.1 | https://fonts.google.com/specimen/Anek+Malayalam | `next/font/google` (`Anek_Malayalam`, subsets `["malayalam"]`, `preload: false`) |
| Malayalam display (`:lang(ml)` inside h1/h2/statements) | **Noto Serif Malayalam** | variable 400–600 | SIL OFL 1.1 | https://fonts.google.com/noto/specimen/Noto+Serif+Malayalam | `next/font/google` (`Noto_Serif_Malayalam`, `preload: false`) |
| Film artwork only (Scene 02 plate engraving lettering, annotations) | **IM FELL English** (roman and italic) | 400, 400 italic | SIL OFL 1.1 | https://fonts.google.com/specimen/IM+Fell+English | **Not loaded as a webfont.** It is baked into the plate textures and SVG artwork at asset-build time. Any text a plate shows also exists in HTML, set in Boska and Geist (CLAUDE.md 3D rule). |

Glyph checks were run on the downloaded files on 2026-11-04 with fontTools:
- Boska: ₹ U+20B9 present, `tnum` and `onum` present.
- Geist: ₹ present, `tnum` present.
- General Sans was rejected because it has no `tnum`.
- Switzer was rejected because it has no ₹ and no `tnum`.
- Instrument Sans was rejected because the Google latin file has no ₹.

Fallback stacks:
```css
--font-display: var(--font-boska), "Iowan Old Style", "Palatino Linotype", Georgia, serif;
--font-text: var(--font-geist), ui-sans-serif, "Segoe UI", Roboto, Arial, sans-serif;
--font-ml-text: var(--font-anek-ml), "Noto Sans Malayalam", "Nirmala UI", sans-serif;
--font-ml-display: var(--font-noto-serif-ml), "Noto Serif Malayalam", "Nirmala UI", serif;
```
Remove Crimson Pro and Hanken Grotesk from `src/app/layout.tsx` and `tokens.css`. Before writing the loader, read `node_modules/next/dist/docs/` for the Next 16.4 `next/font` API (AGENTS.md).

### 2.2 Scale: five sizes, far apart

| Token | Value | px at 390 → 1440 | Face / weight | Leading | Tracking | Used for |
| --- | --- | --- | --- | --- | --- | --- |
| `--step-display` | `clamp(2.5rem, 0.5rem + 7.5vw, 8.5rem)` | 40 → 116 | Boska 400 | 0.95 | -0.03em | h1 (one per page), the footer phone line |
| `--step-head` | `clamp(2rem, 1.3rem + 3.2vw, 4rem)` | 32 → 64 | Boska 400 | 1.0 | -0.02em | h2 section and scene headings, PDP product name |
| `--step-lead` | `clamp(1.25rem, 0.95rem + 1.1vw, 2rem)` | 20 → 31 | Boska 400 for statements; Geist 400 for supporting lines | 1.3 | -0.01em (Boska), 0 (Geist) | supporting line under h1, film statements (`<p>`), PDP price, cart subtotal |
| `--step-body` | `clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)` | 17 → 19 | Geist 400, 500 for emphasis and buttons | 1.55 | 0 | paragraphs, nav links, buttons, form fields, product names on cards |
| `--step-small` | `clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)` | 13 → 14 | Geist 400 / 500 | 1.45 | 0.005em | captions, breadcrumbs, form hints, credits, legal |

Rules:
- Ratios: display ÷ body = 116/19 = 6.1 on desktop, above the study's 4.3 median, which is intended. Nothing sits between `lead` and `head`. **No sixth size**: an h3 is `--step-body` in Geist 600.
- Headlines are at most two lines at 390, 768 and 1440px. Give h1 `max-width: 16ch` and h2 `max-width: 20ch`, `text-wrap: balance`, `hyphens: none`, and an optical margin of `margin-left: -0.04em` on Boska display lines.
- Statements (film lines, intro sentences) are `<p class="statement">` at `--step-lead`, at most 25 words and at most three lines. They are never set larger.
- Italic Boska is allowed only for Latin binomials (*Vitex negundo*) and titles of works. Never one styled word inside a heading.
- Numbers: `font-variant-numeric: tabular-nums` on prices, quantities, cart, time slots and phone numbers. Boska `oldstyle-nums` is allowed only inside display statements that contain a year ("since 1921").
- Product titles come from Shopify in ALL CAPS. Always render them through `titleCase()` (it exists in `src/lib/shopify/format.ts`) and never in uppercase CSS.
- No `text-transform: uppercase` anywhere, and no letter-spaced labels.
- Body copy is always `--ink` at ≥ 17px. `--muted` is for captions and secondary lines only.
- Measure: `p { max-width: 62ch }`, and a lead paragraph has `max-width: 40ch`.

### 2.3 Malayalam

- Apply it only through `lang="ml"` on the element (`<span lang="ml">`). Do not add a language switch: a full Malayalam locale is out of scope unless the client asks.
- `:lang(ml) { font-family: var(--font-ml-text); line-height: 1.75; }`, then `:where(h1,h2,.statement):lang(ml), :where(h1,h2,.statement) :lang(ml) { font-family: var(--font-ml-display); line-height: 1.25; letter-spacing: 0; }`. Malayalam conjuncts need the extra leading. Never apply negative tracking to Malayalam.
- Where it appears: plant names on the Scene 02 plates and their HTML captions, and product names where Shopify or the old site provides a Malayalam name. **UNVERIFIED:** no Malayalam spellings exist in `src/content/*` yet. Every Malayalam string must come from the client or the old site, checked by a native reader. Never machine-transliterate.

---

## 3. Colour tokens (OKLCH)

### 3.1 How much of each brand colour survives

| Brand colour | Logo hex | v2 role |
| --- | --- | --- |
| AVVVS blue | `#0067aa` = `oklch(50% 0.133 247.3)` | **Kept, as the only accent**: primary buttons, text links, focus ring, selected filter, and the footer field. Under 5% of any screen except the footer. In dark mode the blue is lightened for text and buttons, while the footer field keeps the exact logo blue. |
| Cream | `#fffbd6` = `oklch(98.2% 0.048 102.2)` | **Kept, in one place only:** the ink on the blue footer field (the logo's own pairing). It is never a page ground, which would bring back v1's cream. |
| Maroon | `#602828` = `oklch(35.6% 0.082 22.1)` | **Kept as one field**: the clinic and booking band on the home page and the `/consultation` page head. It is never text on the light ground. |
| Gold | `#d2ab66` = `oklch(76.2% 0.099 80.7)` | **Dropped from the UI.** It fails contrast as text on the light ground, and the brief bans "excessive gold effects". It lives only in the film (Scene 04–05 light, droplets) as `--film-gold`. |
| Aqua `#71cee1`, leaf `#bed630`, store ink `#193a43` | | Dropped. They are logo details only. |

The ground is a low-chroma **bone**, not cream (chroma 0.005, hue 95). The ink is a **green-black** taken from the Scene 01 forest shadow, which ties the UI to the film.

### 3.2 Tokens

Paste this into `src/app/styles/tokens.css`, replacing the v1 colour block. All contrast values come from `docs/research/taste/contrast.txt`. Pairs not listed there are not allowed.

```css
:root, :root[data-theme="light"] {
  color-scheme: light;
  --bg:           oklch(97.5% 0.005 95);    /* #f8f7f3 bone ground */
  --surface:      oklch(94.5% 0.007 95);    /* #eeede8 image wells, fields, drawer lines */
  --surface-2:    oklch(91% 0.009 95);      /* #e3e1db pressed, hover, selected-row */
  --ink:          oklch(22% 0.012 170);     /* #151c1a green-black */
  --muted:        oklch(47% 0.012 170);     /* #555d5a */
  --accent:       oklch(50% 0.133 247.3);   /* #0067aa AVVVS blue */
  --accent-hover: oklch(43% 0.11 248);      /* #0b5388 */
  --accent-ink:   oklch(98.5% 0.006 95);    /* #fbfaf6 text on accent */
  --focus:        var(--accent);
  --field-brand:     oklch(50% 0.133 247.3);  /* footer: logo blue */
  --field-brand-ink: oklch(98.2% 0.048 102.2);/* logo cream */
  --field-clinic:     oklch(35.6% 0.082 22.1);/* #602828 logo maroon */
  --field-clinic-ink: oklch(95% 0.012 90);    /* #f1eee6 */
  --field-clinic-muted: oklch(83% 0.03 40);   /* #dac1b9 */
  --error:   oklch(50.5% 0.185 27);   /* #b72121 */
  --success: oklch(48% 0.1 155);      /* #236e44 */
  --scrim:   oklch(16% 0.01 170 / 0.5);   /* only under text on film/photo */
  --overlay: oklch(16% 0.01 170 / 0.4);   /* behind cart drawer / dialogs */
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg:           oklch(18% 0.01 170);      /* #0d1311 */
  --surface:      oklch(22.5% 0.012 170);   /* #161e1b */
  --surface-2:    oklch(27% 0.013 170);     /* #202925 */
  --ink:          oklch(92% 0.008 95);      /* #e6e5df */
  --muted:        oklch(72% 0.01 120);      /* #a4a69f */
  --accent:       oklch(76% 0.1 243);       /* #77b9ec */
  --accent-hover: oklch(82% 0.08 243);      /* #97cbf4 */
  --accent-ink:   oklch(18% 0.01 170);      /* #0d1311 */
  --focus:        var(--accent);
  --field-brand:     oklch(50% 0.133 247.3);  /* unchanged: brand field */
  --field-brand-ink: oklch(98.2% 0.048 102.2);
  --field-clinic:     oklch(30% 0.07 22.1);   /* #4b1d1d */
  --field-clinic-ink: oklch(93% 0.012 90);
  --field-clinic-muted: oklch(80% 0.03 40);
  --error:   oklch(72% 0.15 27);      /* #f47c70 */
  --success: oklch(74% 0.12 155);     /* #66c189 */
  --scrim:   oklch(10% 0.01 170 / 0.55);
  --overlay: oklch(5% 0.01 170 / 0.6);
}

/* Film art tokens: the same in both themes (the film is artwork, not UI) */
:root {
  --film-night:      oklch(14% 0.015 160);  /* S01 opening black, S05 ground */
  --film-forest:     oklch(20% 0.035 150);  /* S01, S05 */
  --film-ink:        oklch(94% 0.01 95);    /* HTML text over dark film frames */
  --film-parchment:  oklch(90% 0.035 82);   /* S02 aged ivory */
  --film-parchment-2:oklch(84% 0.045 78);   /* S02 plate edges, foxing */
  --film-sepia:      oklch(30% 0.045 55);   /* S02 ink, HTML text over parchment */
  --film-sepia-soft: oklch(45% 0.05 60);    /* S02 annotations */
  --film-earth:      oklch(30% 0.05 60);    /* S03 */
  --film-amber:      oklch(62% 0.13 65);    /* S03-S04 extract (art only, never text) */
  --film-gold:       oklch(76.2% 0.099 80.7);/* S04-S05 light, logo gold */
}
```

**Theme mechanics.**
- `<html data-theme="light">` is server-rendered. A blocking inline script in `<head>` (in `src/app/layout.tsx`) reads `localStorage.getItem("avvvs-theme")`, wrapped in try/catch, and sets `data-theme` before first paint.
- **Light is the default even when the OS prefers dark**, as the client asked. See the open question on this.
- Expose the tokens to Tailwind v4 in `@theme` as `--color-bg: var(--bg)` and so on, so utilities like `bg-bg`, `text-ink` and `bg-surface` exist. Components use tokens only and never hex values.
- Set `<meta name="theme-color">` to `#f8f7f3` in light and `#0d1311` in dark.

### 3.3 Contrast: every text/background pair defined (WCAG 2.x)

| Pair | Light | Dark | Requirement |
| --- | --- | --- | --- |
| `--ink` on `--bg` | 16.05 | 14.82 | AA body 4.5 ✔ (AAA ✔) |
| `--ink` on `--surface` | 14.69 | 13.46 | 4.5 ✔ |
| `--ink` on `--surface-2` | 13.21 | 11.84 | 4.5 ✔ |
| `--muted` on `--bg` | 6.31 | 7.58 | 4.5 ✔ |
| `--muted` on `--surface` | 5.78 | 6.89 | 4.5 ✔ |
| `--muted` on `--surface-2` | 5.19 | 6.06 | 4.5 ✔ |
| `--accent` (link text) on `--bg` | 5.56 | 8.84 | 4.5 ✔ |
| `--accent` (link text) on `--surface` | 5.09 | 8.03 | 4.5 ✔ |
| `--accent-ink` on `--accent` (primary button) | 5.72 | 8.84 | 4.5 ✔ |
| `--accent-ink` on `--accent-hover` | 7.74 | 10.85 | 4.5 ✔ |
| `--bg` on `--ink` (selected chip/segment, inverted) | 16.05 | 14.82 | 4.5 ✔ |
| `--field-brand-ink` on `--field-brand` (footer) | 5.70 | 5.70 | 4.5 ✔ |
| `--field-clinic-ink` on `--field-clinic` | 9.92 | 11.43 | 4.5 ✔ |
| `--field-clinic-muted` on `--field-clinic` | 6.73 | 7.44 | 4.5 ✔ |
| `--error` on `--bg` | 6.01 | 7.10 | 4.5 ✔ |
| `--error` on `--surface` (field error text) | 5.50 | 6.44 | 4.5 ✔ |
| `--success` on `--bg` | 5.79 | 8.55 | 4.5 ✔ |
| `--focus` ring against `--surface-2` (non-text) | 4.57 | 7.06 | 3.0 ✔ |
| `--film-sepia` on `--film-parchment` | 10.23 | same | 4.5 ✔ |
| `--film-sepia-soft` on `--film-parchment` | 5.59 | same | 4.5 ✔ |
| `--film-sepia` on `--film-parchment-2` | 8.42 | same | 4.5 ✔ |
| `--film-ink` on `--film-forest` / `--film-night` / `--film-earth` | 15.07 / 16.67 / ≥7 | same | 4.5 ✔ |

Not allowed (they fail or are untested): gold as text on any light ground, `--muted` on either field, `--accent` text on `--field-clinic`, and any text placed directly on a film frame or photograph without `--scrim` under it. Text on photographs cannot be computed, so check it in the screenshots and require the scrim.

---

## 4. Space, grid, shape, motion

### 4.1 Spacing scale (4px base)

```css
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px; --space-6: 32px;  --space-7: 48px;  --space-8: 64px;
--space-9: 96px; --space-10: 128px; --space-11: 192px;
--margin: clamp(1rem, 0.5rem + 2vw, 2.5rem);          /* page side margin: 16px @390, 40px @1440 */
--gap: clamp(1rem, 0.75rem + 0.6vw, 1.5rem);          /* column gap: 16 → 24px */
--section-gap: clamp(5rem, 1rem + 10vw, 12rem);       /* between sections: 80px @390, 160px @1440 */
--nav-h: 64px;
```
- Inside a section, use no gap larger than `--space-8` (64px). The space between sections must always be larger than any space inside one.
- A heading's space above is at least twice its space below.

### 4.2 Grid

- One grid on every page: `display:grid; grid-template-columns: repeat(12, minmax(0,1fr)); column-gap: var(--gap); padding-inline: var(--margin);` with no max-width cap on full-bleed sections. Text sections cap at `max-width: 1600px; margin-inline: auto`.
- The left and right margins must be **equal**, which fixes v1's 144/169px. Breakpoints: `< 48rem` (768px) uses 4 columns, `48–75rem` uses 8 columns, `≥ 75rem` uses 12 columns.
- Text blocks share three left edges across the site: column 1, column 4 (narrow statement column, `max-width: 52ch`) and column 8 (right-hand tables and PDP info).

### 4.3 Radii, borders, elevation

| Token | Value | Rule |
| --- | --- | --- |
| `--radius` | `0` | Applies to every button, field, image, card, drawer and chip. One radius for the whole site; 52% of top-scored sites use square corners. |
| `--radius-round` | `999px` | Only for the 40px theme-toggle icon button and the cart count badge. |
| Borders | none | No hairlines, no 1px outlined boxes and no double rules. Surfaces are separated by a tone step (`--bg` → `--surface` → `--surface-2`). The two exceptions: form fields may carry `box-shadow: inset 0 -2px 0 var(--ink)` (a 2px bottom bar) on focus and error, and real data tables (PDP spec table) use alternating `--surface` rows rather than lines. |
| Elevation 0 | `--bg` | page |
| Elevation 1 | `--surface` | image wells, fields, filter bar |
| Elevation 2 | `--surface-2` | hover, pressed, selected row |
| Float | `--shadow-float: 0 24px 64px oklch(16% 0.01 170 / 0.18)` | **Only** for things that truly float: the cart drawer, the mobile menu sheet, dialogs and toasts. Never on cards at rest. |

### 4.4 Motion tokens

Project rule (CLAUDE.md): animate transform and opacity only, always honour `prefers-reduced-motion`. **Hover colour changes are instant (no transition).**

```css
--dur-press: 120ms;    /* button/press scale */
--dur-fade: 200ms;     /* opacity reveals, tooltips, theme-toggle icon swap */
--dur-panel: 320ms;    /* cart drawer, menu sheet, accordion */
--dur-enter: 640ms;    /* section entrances */
--dur-dissolve: 1600ms;/* time-based crossfade only (still-image fallback of the film) */
--stagger: 70ms;       /* between heading → text → picture */
--rise: 24px;          /* entrance travel */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-press: cubic-bezier(0.3, 0, 0.2, 1);
/* film scrub: linear (scroll is the clock); camera curves get their easing inside the timeline */
```
Mirror these as `src/lib/motion/tokens.ts` (`export const dur = { press: 0.12, fade: 0.2, panel: 0.32, enter: 0.64, dissolve: 1.6 }; export const ease = { out: [0.16,1,0.3,1], inOut: [0.65,0,0.35,1] }`) for `motion/react` and animejs. The motion library choice for the film (GSAP ScrollTrigger is in the brief but not installed) belongs to the technical plan. These tokens work with any library.

Recipes:
- **Section entrance:** heading, then text, then picture. Each goes `opacity 0→1` and `translateY(24px)→0` over `--dur-enter` with `--ease-out`, stagger 70ms, fired once at 20% visibility. Content is visible without JS, so the reveal class is added by script only.
- **Press:** `transform: scale(0.98)` over `--dur-press`.
- **Cart drawer:** `translateX(100%)→0` over `--dur-panel` with `--ease-out`, and overlay opacity 0→1 over `--dur-fade`.
- **Theme switch:** no animated colour transition. Swap `data-theme` and cross-fade the toggle icon over `--dur-fade`.
- **Reduced motion:** every travel becomes 0, opacity changes are capped at 120ms, the film is replaced by its still frames (one per scene), Lenis is disabled, and nothing autoplays.

---

## 5. Components at a glance

All components are Server Components unless marked **client**. They live in `src/components/ui/` unless a path is given.

### 5.1 Nav: `SiteNav` (server) + `ThemeToggle`, `CartButton`, `SkipFilm` (client leaves)

- **Layout:** height `--nav-h` 64px, `position: sticky; top: 0`, padding `0 var(--margin)`, three zones:
  - **Left:** the wordmark. Use the official logo as an SVG at 28px height. **Missing input:** a vector (SVG) logo and a one-colour version. Until they arrive, use the PNG lockup at 28px height, and never crop or recolour it.
  - **Centre-left:** 4 links in Geist 500 `--step-body`: Store, Clinic, Treatments, About.
  - **Right:** `SkipFilm`, `ThemeToggle`, `CartButton`, and a "Book" primary button (48px tall here: 40px visual height with a 48px hit area).
- **Background:**
  - Over the home film, the bar has no fill. Its items use `--film-ink` on dark scenes (S01, S03, S04, S05) and `--film-sepia` on S02. Each scene's root sets `data-tone="dark|parchment"`, and the nav reads that state from a tiny client store.
  - Everywhere else, and on the home page after the film's last frame, the bar is a solid `--bg`.
  - No border, no blur, no shadow. The bar is not glass: it is either transparent over artwork or opaque.
- **`SkipFilm`** (client):
  - Renders the text link "Skip film" only while any film scene intersects the viewport.
  - `href="#after-film"`; on click it calls `lenis.scrollTo('#after-film', { immediate: true })` and focuses `#after-film h2` (with `tabIndex={-1}`).
  - It is also the second tab stop on the home page, after the global "Skip to content" link.
  - Under reduced motion the film is already a stack of stills, and the link still works.
- **`ThemeToggle`** (client): a 40px round icon button with a sun icon in dark mode and a moon icon in light mode. Inline SVG, 20px, stroke `currentColor`, no icon library. `aria-label="Switch to dark theme"` or `"Switch to light theme"`, `aria-pressed` is not used. It writes `localStorage["avvvs-theme"]`.
- **`CartButton`:** the text "Cart" plus a count badge (`--radius-round`, `--accent` fill, `--accent-ink` 13px tabular). It opens the drawer and carries `aria-expanded` and `aria-controls="cart-drawer"`.
- **Phone (< 48rem):** the wordmark, Cart, and a "Menu" text button. The menu is a full-height sheet from the right (same mechanics as the cart drawer), with links at `--step-head` Boska, "Book a consultation" as a full-width primary button, and the theme toggle at the bottom. "Skip film" stays visible in the bar on phones.

### 5.2 Buttons: `Button` (`variant: "primary" | "secondary" | "quiet"`, `size: "md" | "lg"`, `as: "button" | Link | "a"`)

| Variant | Fill | Text | Hover | Use |
| --- | --- | --- | --- | --- |
| primary | `--accent` | `--accent-ink` | `--accent-hover`, instant | One per view: Book, Add to cart, Checkout, Send request |
| secondary | `--surface` | `--ink` | `--surface-2` | Second action: Ask on WhatsApp, Continue shopping |
| quiet | none | `--ink`, underline offset 0.18em, thickness 0.07em | text `--accent` | Inline actions: Remove, Clear filters |

- **Sizes:** `md` is 48px tall with `0 24px` padding; `lg` is 56px tall with `0 32px` padding and is used for PDP Add to cart and cart Checkout. Text is Geist 500 `--step-body`. Radius 0, no border.
- **States:**
  - `:active` → `scale(0.98)`.
  - `:focus-visible` → `outline: 2px solid var(--focus); outline-offset: 3px`, with no transition.
  - `disabled` / `aria-disabled` → opacity 0.45 and `cursor: not-allowed`.
  - `aria-busy="true"` → the label changes to a gerund ("Adding…", "Sending…") and the width stays locked through `min-width` measured at mount.
- **No icons inside buttons and no arrows glued to labels.** Labels name the action: "Add to cart", "Book a consultation", "Go to checkout".

### 5.3 Product card: `ProductCard` (`product: Product`, `priority?: boolean`, `sizes: string`)

- **Image well:** `--surface`, aspect 4:5, product photo `object-fit: contain` with 8% inset padding, `next/image` with `sizes="(min-width:75rem) 25vw, (min-width:48rem) 33vw, 50vw"`. Square corners. No overlay badges.
- **Below the well**, with 16px gap, in this order:
  1. The name: Geist 500 `--step-body`, `titleCase(product.title)`, 2-line clamp.
  2. The form and size: Geist 400 `--step-small` `--muted`, e.g. "Thailam, 200 ml". Form comes from `productType`, size from the first variant title. Use a comma, never a middle dot.
  3. The price: Geist 500 `--step-body` tabular, e.g. "₹270". A sale shows the compare-at price struck through in `--muted` *after* the price.
  4. When `availableForSale` is false, the text "Out of stock" in `--muted` replaces the add button.
- **Add:**
  - A `secondary` `md` button reading "Add to cart", full card width. It is always visible, with no hover-reveal, because touch devices have no hover.
  - If there is more than one variant, it reads "Choose size" and links to the PDP.
- **Interaction:** the whole card is one link to `/store/products/<handle>` (`ProductCard` uses the stretched-link pattern: the name `<a>` with `::after { inset:0 }`, and the button sits above it with `position: relative; z-index: 1`). Hovering the well swaps to the second Shopify image with an opacity fade over `--dur-fade` when one exists. No lift, no shadow.
- **Grid:** 4 columns at ≥ 75rem, 3 at ≥ 48rem, 2 below. Column gap `--gap`, row gap 48px.
- **The store does not open on a uniform grid.** The first block after the store h1 is a **lead row** of the five signature products (verified in `org.signatureProducts`: Mezhu Thailam, Rujanth, Slepan, Redirons, Lakshol), laid out per the dealt "band of unequal panels": a full-bleed row, 68svh, flex-grow 5 / 2 / 3 / 2 / 2. Products must be matched by handle; skip any not found in Shopify.

### 5.4 PDP layout: `/store/products/[handle]`

12-column grid, `--margin` sides.

- **Gallery** (columns 1–7; full width on phone):
  - The main image sits in a `--surface` well at 4:5. It is `position: sticky; top: calc(var(--nav-h) + 16px)` on desktop.
  - Thumbnails sit in a row below: 72px squares with 8px gap. The selected one has a 2px `--ink` bottom bar (a filled bar, not an outline).
  - **Remove the v1 procedural 3D bottle from the PDP.** A 3D viewer may return only with a model of the real packaging (see missing inputs).
- **Info** (columns 9–12; 8–12 at 48–75rem), top to bottom:
  1. Breadcrumb: `--step-small`, "Store / Thailam / Dhanwantharam Thailam". The slash is text, not a rule.
  2. `h1` product name: Boska `--step-head` (the PDP's h1 uses head size, not display), max 2 lines.
  3. Form and size line: `--muted` `--step-small`.
  4. Price: Boska `--step-lead` tabular.
  5. Variant selector (if more than one variant): a segmented `radiogroup`. Each option is 48px, `--surface`. The selected option is filled `--ink` with `--bg` text.
  6. Quantity stepper: three 48px cells (−, value, +) on `--surface`. The value is an `<input type="number" min="1" max="10">`.
  7. **Add to cart**, primary `lg`, full column width.
  8. "Ask about this medicine" as a secondary `lg` button. It links to `waHref(clinic.phones[0])` with the product name in the `text` parameter. **UNVERIFIED** which phone is WhatsApp-enabled.
  9. One line in `--step-small`: "Shipping and returns: see the [shipping policy] and [refund policy]". The links go to `https://avvvsglobal.com/policies/shipping-policy` and `/policies/refund-policy`. Do not restate thresholds or timeframes until they have been fetched and stored in `src/content/`.
  10. Accordion (`<details>`/`<summary>`, Geist 600 `--step-body` summary, 56px rows, separated by 8px of space and `--surface` fills, no lines), in this order:
      - "What it is used for": the Shopify description, verbatim and sanitised (`sanitize.ts`).
      - "How to use": shown only if Shopify text contains it.
      - "Ingredients": shown only if Shopify text contains it. **Never fill it from elsewhere.**
      - "Shipping and returns".
- **Below the fold:** h2 "More [form plural]" (e.g. "More thailams"), then a 4-up row of same-`productType` cards.
- **Compliance:** the Shopify "Indications" text lists diseases (e.g. paralysis, hernia, arthritis). Showing disease indications for drugs may be regulated in India (Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954; AYUSH advertising rules). **Flag for the client's legal review before launch.** The design keeps the text in a collapsed accordion, not in headings or cards.
- **JSON-LD:** `Product` with `offers` from Shopify only. No `aggregateRating`, because there are no reviews.

### 5.5 Cart drawer: `CartDrawer` (client), id `cart-drawer`

- A right-hand sheet, `width: min(440px, 100vw)`, `height: 100dvh`, `--bg`, `--shadow-float`, over an `--overlay` backdrop. Built on `<dialog>` with `showModal()` for the focus trap and Esc. Opening and closing follow the motion recipe.
- **Header** (64px): h2 "Cart" plus the count in Geist `--step-body`, and a quiet "Close" text button on the right.
- **Lines:** each line is a grid with a 64px image well (`--surface`, 4:5), then name and size, then a quantity stepper (40px cells), then the line price (tabular, right-aligned). A quiet "Remove" button goes under the name. Lines are separated by 24px of space.
- **Footer** (sticky): on a `--surface` block with 24px padding:
  - Subtotal row: label in Geist `--step-body`, amount in Boska `--step-lead` tabular.
  - One `--step-small` `--muted` line: "Shipping and taxes are worked out at checkout."
  - "Go to checkout" primary `lg`, full width, pointing to `cart.checkoutUrl` (it already works in `src/lib/shopify`).
- **Empty state:** "Your cart is empty." in `--step-lead` Boska, plus a secondary button "Browse medicines" to `/store`.
- **Busy:** the stepper is disabled while a line mutation is pending. On failure, an inline `--error` message appears under the line: "Couldn't update. Try again."

### 5.6 Forms: `Field`, `Select`, `SlotPicker`, `BookingForm` (existing, restyled)

- **Field:**
  - Label above, Geist 500 `--step-small` `--ink`, 8px gap.
  - Control: 48px tall, `--surface` fill, radius 0, no border, Geist 400 `--step-body`, padding `0 16px`.
  - Hint text (what the field accepts) goes under the control in `--muted` `--step-small`, tied with `aria-describedby`.
  - An error slot is reserved at `min-height: 20px`, in `--error` `--step-small`, prefixed by the word "Error:" for screen readers (`<span class="visually-hidden">Error:</span>`).
  - Focus: `outline: 2px solid var(--focus); outline-offset: 2px`. Error state: `box-shadow: inset 0 -2px 0 var(--error)` plus `aria-invalid="true"`.
- **`SlotPicker`:** a radiogroup of the two `clinic.timeSlots`, as two filled `--surface` tiles of 72px with the label in tabular figures. The selected tile is filled `--ink` with `--bg` text. A `?slot=` URL parameter preselects a slot.
- **Date:** native `<input type="date" min={today}>` (Asia/Kolkata).
- **Submit:** primary `lg`. While sending: `aria-busy`, "Sending…", and fields disabled. **Success appears only after the server action returns ok** (CLAUDE.md). The form is then replaced by an `h2` "Request sent" and the line "The clinic will call you on {phone} to confirm the time." Focus moves to that h2. On failure, the form stays filled and an error summary at the top names each field.
- Validate on blur and again on submit (zod schema already in `src/lib/booking`).
- The `/consultation` page head sits on the `--field-clinic` (maroon) field.

### 5.7 Footer: `SiteFooter` ("contact as the headline", dealt)

- **Field:** full-bleed `--field-brand` (logo blue) with all text in `--field-brand-ink` (logo cream). `min-height: 90svh` on the home page and `64svh` elsewhere. It is the same in both themes.
- **Top row** (40px from the top, columns 1–7, Geist `--step-small` at full ink):
  - The address (`clinic.street`, `clinic.locality`, `clinic.city` `clinic.postalCode`).
  - Consultation times.
  - The live "Open now / next slot" line.
  - On the right margin, a quiet text link "Back to top".
- **Lower half:** the display line is the phone number `+91 80892 02091` as a `tel:` link in Boska `--step-display`, `white-space: nowrap`, flush left. Under it, at `--step-lead`, sits `mail@avvvs.com` as a `mailto:` link.
- **Bottom row** (`--step-small`), in three positions:
  - Left: footer links from `footerNav`.
  - Centre: image credits for any found pictures, required by the skill.
  - Right: "Arya Vaidya Vilasini Vaidya Sala, Kozhikode, since 1921".
- The logo lockup appears once, at 28px height, in the top row. On a blue ground the lockup's own blue panel merges with the field, so a **one-colour cream logo is needed (missing input)**. Until it arrives, place the lockup on a 4px `--field-brand-ink` padding block.

---

## 6. Copy voice

### 6.1 Rules

1. **Say the thing plainly, then stop.** Name the medicine, the form, the size, the place and the year. One idea per sentence.
2. **Headlines are titles of 2–6 words** and ≤ 32 characters for an h1 (so it fits two lines at 390px). An h2 is ≤ 5 words.
3. **Film lines are statements, not headings:** `<p class="statement">`, ≤ 12 words each.
4. **No medical promises.** Never write "cures", "heals", "treats", "boosts immunity", "clinically proven", "safe for all" or "no side effects". Product benefits are quoted only from Shopify text, inside the PDP accordion.
5. **Ayurvedic terms are used as AVVVS uses them** (Thailam, Kashayam, Arishtam, Lehyam, Choornam, Ghritham, Elakizhi). Don't explain them with spa words. Plural in English: "thailams".
6. **Banned words:** journey, unlock, holistic wellness, curated, artisanal, elevate, seamless, rejuvenate your soul, ancient secrets, discover the magic, nourish your being, transform, and "experience" as a verb. No tricolon headlines, no "not just X, it's Y", no exclamation marks, no emoji.
7. **Numbers come from data.** "165 medicines" is rendered from the Shopify count, never typed. "300+ formulations" and "since 1921" come from `org`.
8. **Buttons name the action:** "Book a consultation", "Add to cart", "Go to checkout", "Skip film". Never "Learn more" or "Get started".
9. **British/Indian English spelling** (colour, centre, programme), Indian number formatting for prices (₹1,250), and times as "9:00 AM – 1:00 PM".
10. **No eyebrows, no "01", no section labels above headings.**

### 6.2 Rewrites

| Place | v1 | v2 | Source / flag |
| --- | --- | --- | --- |
| Home h1 (over film frame 1, bottom-left) | "Herbs picked in Kerala, medicine since 1921" (43 chars, 4 lines) | **"Ayurveda since 1921"** (19 chars) | `org.foundingYear` ✔ |
| Supporting line under h1 | "How AVVVS makes its 300 formulations, from the garden to the clinic." | **"Arya Vaidya Vilasini Vaidya Sala makes 300+ Ayurvedic medicines in Kozhikode, Kerala, and runs a clinic opposite the railway station."** | `org.formulations`, `clinic.landmark` ✔ |
| Scene 01, h2 + statement | "Grown beside the factory" | h2 **"Into the origins"** · statement **"Rooted in nature. Refined through tradition."** · caption "AVVVS grows herbs in gardens around its own manufacturing units." | Headline from the brief ✔; caption from `story.ts` ch1 ✔ |
| Scene 02 | "Picked by hand" | h2 **"The botanical archive"** · statement **"Every medicine begins as a named plant."** · plates: Erukkila *Calotropis gigantea*, Ummathila *Datura metel*, Karinochiyila *Vitex negundo* | Plants verified for the **Elakizhi treatment** (`story.ts` ch2), **not** as product ingredients: caption them "Leaves used in Elakizhi". Brief candidates (Ashwagandha, Turmeric, Brahmi, Amla, Neem, Ginger, Tulsi) are **UNVERIFIED** until matched to Shopify ingredient text. Datura is toxic, so the caption must not suggest home use. |
| Scene 03 | "Chopped, roasted, tied" / "Simmered into oil" | h2 **"From leaf to oil"** · statement **"Thailams are cooked slowly in medicated oil."** | `story.ts` ch4 ✔. The particle and extract visuals are a metaphor (brief §S03), so the copy describes only the verified thailam method. |
| Scene 04 | "Filled at our GMP factory" | h2 **"The formulation"** · statement **"Over 300 classical and proprietary formulations."** · caption "Made at our GMP-certified factory near Kozhikode." | `org.formulations` ✔, `org.certifications` ✔. "near Kozhikode" comes from v1 About ("suburbs of Kozhikode"): re-check the scrape. |
| Scene 05 | "On the almirah" | h2 **"AVVVS"** (the name as the reveal) · statement **"Ancient wisdom. Thoughtfully reimagined."** · then the five signature products by name | Headline from the brief. It is tone, not a claim, but "reimagined" implies new formulas: **client to confirm**. Alternative: "Made in Kozhikode since 1921." |
| After film (`#after-film`) | none | h2 **"The store"** · lead **"Classical and proprietary medicines, sent from Kozhikode."** + primary "Browse medicines" | "sent from Kozhikode": **UNVERIFIED** dispatch location; fallback "Classical and proprietary medicines from the Vaidya Sala." |
| Store h1 + intro | "Store" / "Medicines from the Vaidya Sala, by collection and by form. Payment and delivery are handled at Shopify checkout." | h1 **"Medicines"** · lead **"{count} classical and proprietary medicines, by form. Choose a thailam, kashayam, arishtam or lehyam, or search by name."** | `count` comes from Shopify. The form list is drawn from real `productType` counts (Kashayam 60, Arishtam 27, Thailam 23…). |
| Clinic band (home, maroon field) | "And at the clinic" | h2 **"The clinic at Annie Hall Road"** · lead **"Consultations from 9:00 AM to 1:00 PM and 2:00 PM to 5:00 PM, opposite Kozhikode railway station."** | `clinic` ✔ |
| Booking h1 + intro | "Book a consultation" / "Choose a date and a time slot. The clinic will call to confirm." | h1 **"Book a consultation"** (kept: it is clear) · lead **"Pick a day and a slot. The clinic calls you to confirm the time."** | The current form flow ✔ |
| Booking success | (v1: confirmation state) | **"Request sent"** + "The clinic will call you on {phone} to confirm the time." | Shown only after the server confirms |
| Cart empty | none | "Your cart is empty." / button "Browse medicines" | |
| 404 | v1 | h1 **"Page not found"** · "The page may have moved. Try the store or book a consultation." | |

---

## 7. Reference sites

| Site | Take | Leave |
| --- | --- | --- |
| **https://pear.no** (inspected 2026-11-04, `docs/research/taste/ref-pear/`) | The film's art direction: classical-realist painted frames, close crops of **hands at work**, a single gold object against a saturated sky (its cobalt is near AVVVS blue), and WebGL dissolves between paintings. One light serif line at about 8vw (Flecha L 300 at 116.8px, 8.1vw) and nothing else on the frame. | Their GT Standard Mono labels, crosshair and hairline grid, gradient "glint" fills and 8–12px micro text. All of these fail the house rules (the inspector reported mono and gradient FAILs on pear.no). Never their assets. |
| **https://izanami-official.com** (studied in the skill library, `aww-izanami`, score 7) | Silence as design: one sentence over a full-bleed atmospheric frame, and a slow Lenis-scrubbed descent from mist into a scene. Hierarchy comes from isolation, not size. This is the model for Scene 01's opening and its near-black start. | The tiny tracked capitals, rotated section labels, live clocks, and the missing reduced-motion rule. |
| **https://seasats.com** (studied, `aww-seasats`, score 8.4) | A light flared serif headline in the calm upper third of a full-bleed image, and **colour sampled from the imagery** for UI fields. This is how the footer field and clinic field relate to the film's palette. | The mono caps on buttons and the numbered sub-items. |
| **https://www.aesop.com** (from prior knowledge, not inspected: the site returns 403 to automated requests) | An apothecary store where every product page answers the same questions in the same order (what it is, size, how to use, key ingredients), with large calm product images on a neutral ground and a small plain text face. This is the model for the PDP accordion order and the "form, size" card line. | Its proprietary type and its colour. The facts on AVVVS pages come only from Shopify. |
| **https://www.kamaayurveda.com** (inspected 2026-11-04, `ref-kama/`): the *counter-reference* | It shows the category default AVVVS must not look like: a promo bar, centred logo, carousel hero with a discount in condensed caps, a row of rounded category tiles, 18 font sizes, and 40 tiny uppercase labels. Useful only for the information a buyer in this category expects (size, price, form on every card). | Everything visual. |

---

## 8. Anti-slop rules this system enforces

`node <skill>/scripts/inspect.mjs` and `lint.mjs` must pass with **0 FAIL** at 1440, 768 and 390px on every page before a work package is reported done. The skill folder is `C:\Users\arjun\.claude\skills\design-taste-frontend`.

1. **No yellow cream ground** and no cream + terracotta. The ground is bone `oklch(97.5% 0.005 95)`, and logo cream is used only as ink on the blue footer.
2. **No gradients**: not on backgrounds, buttons or text. The single exception is a neutral `--scrim` under text on a film frame or photograph.
3. **No hairlines, no 1px outlined boxes, no double rules.** Surfaces are separated by tone steps. Retire `.rule-top`, `.rule-double`, `.hair`, `.fibre`, the outlined `.chip` and the outlined `.btn` from `globals.css`.
4. **No shadows at rest, no glows.** `--shadow-float` is allowed only on the drawer, menu sheet, dialogs and toasts.
5. **No glass:** no backdrop blur and no floating pill nav.
6. **No eyebrows, no pill badges above headings, no tiny uppercase letter-spaced labels.**
7. **No index numbering.** Remove v1's chapter numbers ("3.", "4.") and do not label scenes as "01–06" in the UI. Scene numbers exist only in code and docs.
8. **No monospace** outside `<pre>/<code>`.
9. **Two UI typefaces only** (Boska, Geist), plus Malayalam faces only on `:lang(ml)`. IM FELL English exists only inside baked film artwork.
10. **Five type sizes**, and headlines of two lines or fewer at every width.
11. **No styled accent word** in a heading (italic, colour or underline), except Latin binomials in captions.
12. **One accent (AVVVS blue)**, on actions and links only, under 5% of a screen. Headings are ink.
13. **One radius (0).** Round only the theme-toggle and cart badge.
14. **No fabricated content:** no invented ingredients, doctors, reviews, star ratings, certifications, statistics or "trusted by" rows. Unverified items are shown only after the client confirms them.
15. **No fake packaging.** A 3D or rendered product must use the real label art, and the v1 procedural bottle is removed.
16. **No category clip art:** no lotus, mandala, leaf icons, Om or chakra symbols, and no "spa" stock photography.
17. **No identical card rows as a section.** The product grid is allowed only as the catalogue itself, and it is always preceded by the unequal lead row.
18. **No hover-only information.** Everything a card shows on hover is also reachable on touch and by keyboard.
19. **Motion:** transform and opacity only, no colour transitions, no bounce easing, no infinite loops that carry no meaning, and reduced-motion fallbacks everywhere. The film never blocks navigation, store or booking, and "Skip film" is always visible over it.
20. **Banned copy** from §6.1 rule 6, enforced by `lint.mjs` plus a project grep in CI: `rg -i "journey|unlock|holistic|curated|artisanal|elevate|seamless" src/`.

---

## 9. Implementation notes for the executor (Sonnet, one package at a time)

Suggested order for the design-system package. Each step has an acceptance check.

1. **Fonts:** download Boska 400/400i/500 woff2 to `src/app/fonts/boska/` along with `LICENSE.txt` (the FFL from Fontshare). Wire `next/font/local` (Boska) and `next/font/google` (Geist, Anek Malayalam, Noto Serif Malayalam) in `src/app/layout.tsx`.
   → *Check:* `inspect.mjs http://localhost:3000` reports `typefaces Geist …, Boska …` and no fallback warning.
2. **Tokens:** replace the colour, type, space and motion blocks of `src/app/styles/tokens.css` with §2.2, §3.2 and §4, and map them in `@theme`. Delete the v1 tokens (`paper*`, `brass`, `oxblood*`, `fibre`, `rule-*`).
   → *Check:* `rg "#[0-9a-fA-F]{3,6}" src/components src/app --glob '!*.css'` returns nothing new, and `npx tsc --noEmit` and `npm run lint` pass.
3. **Theme:** add the inline no-flash script and `ThemeToggle`.
   → *Check:* load with `localStorage["avvvs-theme"]="dark"`. There is no light flash on reload (record the Performance panel or take a screenshot at 0ms), and the default with empty storage is light even with the OS in dark mode.
4. **Components** in §5 order: Button, Field, SiteNav, SiteFooter, ProductCard, CartDrawer, PDP layout.
   → *Check:* each renders in both themes, keyboard-only use works (Tab order, Esc closes the drawer, focus returns to CartButton), and inspector 0 FAIL.
5. **Copy:** replace strings per §6.2 in `src/content/story.ts` and the page files. Keep every `source:` comment.
   → *Check:* `lint.mjs src/` shows no copy FAILs.

---

## 10. Missing inputs and UNVERIFIED items

1. **Vector logo** (SVG), a one-colour cream version and a one-colour ink version. Needed for the nav and footer.
2. **Clinic open days** and holidays. The "Open now" line needs them.
3. **Which phone number is on WhatsApp** (`+91 8089202091` or `+91 9037514016`).
4. **Ingredient lists per product.** Only what Shopify descriptions contain may be shown, so the PDP "Ingredients" section stays hidden where none exists. This also decides which plants Scene 02 may present as *product* ingredients.
5. **Malayalam names** for plants and products, checked by a native reader.
6. **Legal review** of the disease indications shown on PDPs (Drugs and Magic Remedies Act 1954 / AYUSH advertising rules).
7. **Brief headline "Ancient wisdom. Thoughtfully reimagined."**: the client must confirm that "reimagined" is acceptable for classical formulations.
8. **Dispatch location** ("sent from Kozhikode") and the shipping and refund terms. Fetch them from the `avvvsglobal.com/policies/*` pages into `src/content/` before any of it appears in copy.
9. **Factory location wording** ("near Kozhikode" / "suburbs of Kozhikode"): re-check against the archived About page.
10. **Real packaging models or photographs** of the five signature products. Needed for any 3D product reveal (Scene 05) or PDP viewer.
11. **Boska licence file.** Download and commit the FFL text with the fonts. Confirm the client accepts a non-OFL font, or switch the display face to Newsreader (OFL, the skill's `newsreader-light` system) with the same scale.
