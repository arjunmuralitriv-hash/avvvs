# AVVVS design system: MASTER

The source of truth for visual decisions. Agents read this before building any UI.

> ui-ux-pro-max's auto-generated system (`design-system/avvvs/MASTER.md`) proposed claymorphism with teal and orange and Varela Round. That is **rejected**: it contradicts the brand spec (`.hallmark/brand-spec.md`) and Hallmark's floor. Only its UX and stack guidelines (below) are adopted.

## Direction
Hallmark **Vellum** theme (parchment, umber ink, hairline and double rules, one pigment), anchored to the AVVVS brand:
- **Pigment** = AVVVS blue (`--color-accent`, from logo `#0067aa`). It is the only accent: primary buttons, link hover, focus ring, index numerals, one field band per page.
- **Ink** = umber-maroon (`--color-ink`), from the logo wordmark `#602828`.
- **Brass/gold** (`--color-brass`, `--color-gold`) only in 3D materials and rules, never as text.
- **Paper** = warm parchment (`--color-paper`, `-2`, `-3`). Never pure white or black.

The concept is the 1921 vaidya sala ledger: a working Kerala apothecary, not a spa.

## Tokens (defined in `src/app/styles/tokens.css`; Tailwind v4 utilities exist for each)
- Colour: `paper`, `paper-2`, `paper-3`, `ink`, `ink-2`, `muted`, `rule`, `accent`, `accent-deep`, `accent-soft`, `accent-ink`, `focus`, `field`, `brass`, `gold`, `cream`, `scrim`, `error`, `success`
- Type: `--font-display` (Crimson Pro 600, h1/h2), `--font-body` (Hanken Grotesk 400/500/600), `--font-outlier` (Crimson Pro 400 statements and figures), `--font-malayalam` (only on `lang="ml"`)
- Sizes: `--text-display` (h1), `--text-display-s`, `--text-section` (h2), `--text-title` (h3, set in Hanken 600), `--text-lead`, `--text-md` (body, 16px min), `--text-sm` (labels)
- Space: `--space-3xs … --space-4xl`, sections `--section-gap-s | --section-gap | --section-gap-l`, `.container` (1440 cap, 64px gutter), `.grid-12`
- Shape: radius 2px everywhere (`--radius-card`), no shadows, 1px hairlines (`--color-rule`), double ink rules (`.rule-double`)
- Motion: `--dur-micro` 120ms, `--dur-short` 220ms, `--dur-long` 420ms, `--ease-out`

## Ready classes (`src/app/globals.css`)
`.btn` `.btn--primary` `.btn--on-field` · `.link` · `.chip` · `.band` `.band--paper` `.band--field` `.fibre` · `.section` `.section--s` `.section--l` · `.grid-12` · `.rule-top` `.rule-double` `.hair` · `.display-s` / `.statement` · `.label` · `.visually-hidden`

## Hard rules (the Hallmark floor, never waived)
1. Every colour and font goes through a token. No hex values or `font-family` in components.
2. Never `transition: all`. Animate only `transform` and `opacity`.
3. Never an eyebrow label over a heading, never tracked capitals or small caps. Labels are body face, a step smaller, sentence case.
4. No middle-dot meta strings, no arrows glued to link text, no decorative status dots, no emoji icons, no card inside a card, no purple-blue gradient, no glassmorphism.
5. Image grid tracks use `minmax(0, 1fr)`. Display heads use `overflow-wrap: break-word; min-width: 0` (base.css does this).
6. Every interactive element has `:focus-visible`, appearing instantly. Every control covers its states: default, hover, active, focus, disabled, busy, error, success.
7. Every animation has a `prefers-reduced-motion: reduce` fallback. Content is visible with JavaScript off.
8. Never an invented metric, testimonial, doctor, review or logo. The facts are in `src/lib/site.ts` and `src/content/*`.
9. Never one italic word inside a roman heading.
10. About 80 words on any one screen. Headings of 7 words or fewer for heroes, 6 or fewer for sections.

## UX guidelines adopted from ui-ux-pro-max
- **Forms:** every input has a real `<label>`, never a placeholder-only field. Validate on blur, not only on submit. Show loading, then success or error. Reserve space for error text so nothing jumps.
- **Keyboard:** tab order follows visual order and there are no traps. The sticky nav must never cover focus (`scroll-padding-top` is set in base.css).
- **Motion:** one or two animated elements per view at most. Use the shared duration tokens.
- **Next.js:** Server Components by default, data fetched in Server Components, `next/dynamic` for heavy client pieces (all of three.js), `next/image` for every image.
- **Pre-delivery:** test at 375, 768, 1024, 1440 and 1920. Text contrast is at least 4.5:1. `cursor: pointer` on every clickable element.

## Voice
Ledger-plain and dated, as a clerk would enter it: the item, the size, the year, the town. Never "unlock", "journey", "holistic wellness experience", "curated", "artisanal", or a story the site did not tell.
