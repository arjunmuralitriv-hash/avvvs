# 04 · Technical architecture: AVVVS film, site and store (v2)

Status: final draft for review, 2026-11-04.
Precedence: `docs/brief/creative-brief.md` > `docs/plan/01-creative-direction.md` > **this file** > `docs/research/*` > `PLAN.md` (v1).
Executor: Claude Sonnet 5.5 at medium effort, **one work package (§20) at a time**. When this file gives a number, path, prop or command, use it exactly. When it says UNVERIFIED, confirm it the way the line says before relying on it. When it says NEEDS-AVVVS, do not ship that item until the client supplies or approves it.

Inputs read in full: the creative brief; `01-creative-direction.md`; `03-asset-register.md` §0–§2 (**asset ids, file paths, frame counts and byte targets in this file follow 03**; if the two disagree on an asset path or size, 03 wins and this file is corrected); `docs/research/tech-feasibility.md`; the shader, scroll and sequence sections of `pear-teardown.md`; the 3D, HDRI, hands and Shopify-photo sections of `asset-sources.md`; the decisions, data model, page specs and WPs of `store-revamp.md`; the component and implementation sections of `design-system-proposal.md`; `PLAN.md` §1 and §6; `package.json`, `next.config.ts`, `lighthouserc.json`, `src/app/layout.tsx`, the `src/**` file list; `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md` and `03-api-reference/02-components/image.md`. Package versions were checked with `npm view` on 2026-11-04. ffmpeg 9.0.2 (with libwebp and libsvtav1) is installed through scoop. Blender and KTX-Software are **not** installed on this machine.

---

## 0. Decisions this file makes (read first)

| # | Decision | Reason / source |
|---|---|---|
| A1 | **One persistent R3F `<Canvas>`** inside a CSS-sticky stage. It renders with a **custom render loop** (`useFrame` priority 1): the S02 scene goes into one render target, then **one composite shader** draws a full-screen triangle to the screen. Sequence frames are textures fed straight into the composite; they are never rendered as scenes. | 01 C1; tech-feasibility D1, D2. The brief prefers R3F, and drei's loaders save work for S02. pear-teardown's "plain three, no R3F" option is rejected because the S02 ring, specimen and loaders are real-time 3D. |
| A2 | **Film track 1400vh on viewports ≥ 768 px wide, 1000vh below.** Scene shares: S01 0.00–0.14, S02 0.14–0.46, S03 0.46–0.60, S04 0.60–0.74, S05 0.74–0.92, hand-off 0.92–1.00. | 01 C11. The storyboard document may retime these; the values live only in `src/lib/film/timeline.ts`. |
| A3 | **GSAP 3.15.1 + ScrollTrigger + SplitText + DrawSVGPlugin**, `@gsap/react` 2.1.2. One master ScrollTrigger on the track writes progress to a mutable store. **No `pin`**, no drei `ScrollControls`. | tech-feasibility D3–D5. Sticky gives the "pinned" effect the brief asks for without pin-spacer DOM changes. |
| A4 | **Lenis 1.3.27, `lerp: 0.085`**, one site-wide singleton, driven by `gsap.ticker` while the film runs. Not created under `prefers-reduced-motion: reduce` or `(pointer: coarse)`. | 01 C10; pear's measured lerp. |
| A5 | **Image sequences are WebP frames decoded with `createImageBitmap` into a small LRU.** **No video scrubbing** at runtime. MP4 exists only as a build intermediate (pipeline A). | tech-feasibility D6 and §4.3: `currentTime` seeking is unreliable on iOS Safari. |
| A6 | **Three film modes, chosen before first paint by an inline `<head>` script**: `static` (stacked stills), `live` (sticky track + canvas), and `poster` (sticky track, posters swap, no WebGL; a runtime downgrade of `live`). | Avoids a layout jump (CLS) between the static and live layouts. 01 §7 item 2. |
| A7 | **Theme: a custom inline script + `localStorage["avvvs-theme"]` + `data-theme` on `<html>`. No `next-themes`, no cookies.** Light is the default even when the OS prefers dark. | 01 §3.1; Next docs "preventing flash before hydration": cookies read on the server make every route dynamic under Cache Components. `next-themes` follows the OS by default and adds a client provider we do not need. |
| A8 | **No `@react-three/postprocessing` / `postprocessing`.** Grade, grain, vignette, scrim and every transition run in the one composite pass. | tech-feasibility D8. Uninstall them. |
| A9 | **WebGL 2 via `WebGLRenderer`**, not WebGPU. | tech-feasibility D7. |
| A10 | **Runtime grain amplitude 0.018 on S02 and 0.028 on dark scenes, seed updated at 24 Hz.** No grain is baked into frames. | 01 C9 (overrides tech-feasibility's 0.035 / 0.05). |
| A11 | **S05 products are a real-photo layer** (a 13-frame motion-control arc from the packshot session, RGBA WebP), composited **after** the grade so they are never colour-graded. **No product GLB at launch.** | 01 §2.2 "Product layer exception" and C6; asset-sources §5. A measured Blender bottle is a post-launch option (B8). |
| A12 | **Particles only in S03** (pale powder, normal alpha blending, tier ≥ 2). S01 has no runtime particles: mist and motes are painted into the frames. | 01 §2.11 bans glowing particles and gold dust; 01 §1.3 lists no S01 particles. |
| A13 | **Film boot is deferred**: the runtime chunk loads on the first `wheel`, `scroll`, `pointermove`, `touchstart` or `keydown`, or after `requestIdleCallback` (timeout 3000 ms) following `load`, whichever comes first. The S01 poster and the `<h1>` are the first paint and stay until the canvas is ready. | Keeps LCP ≤ 2.0 s and TBT ≤ 200 ms on a Moto G-class Lighthouse run (PLAN §6.1). |
| A14 | **"Skip film" targets `#site`.** | 01 §3.6 and §7 item 3 (design-system-proposal's `#after-film` is not used). |
| A15 | **PDP route stays `/products/[handle]`; old blog URLs stay at the site root** (`/<old-slug>`) through `src/app/[slug]/page.tsx` with `dynamicParams = false`. | PLAN §6.2 "where possible the old slugs are kept as they are"; store-revamp §6.1. Exact old URLs need no redirect. |
| A16 | **Unit tests run with `tsx --test`; end-to-end tests with Playwright 1.64.1; a11y with `@axe-core/playwright` 4.14.0; performance with Lighthouse CI 0.16 and a custom in-page FPS probe.** | §17. |

---

## 1. Stack and exact versions

### 1.1 Runtime dependencies (after T0)

| Package | Version | Status | Use |
|---|---|---|---|
| next | 16.4.5 | keep | App Router, `cacheComponents: true`, `partialPrefetching: true` |
| react / react-dom | 19.3.0 | keep | `<ViewTransition>` for route transitions |
| three | 0.187.0 | keep | WebGLRenderer, ShaderMaterial, KTX2Loader |
| @react-three/fiber | 9.8.2 | keep | the single `<Canvas>` |
| @react-three/drei | 10.7.9 | keep | **only** `useGLTF`, `useKTX2`, `useFBO`, `PerformanceMonitor` |
| gsap | **3.15.1** | **add** | ScrollTrigger, SplitText, DrawSVGPlugin (all free under the GSAP Standard licence, tech-feasibility §1) |
| @gsap/react | **2.1.2** | **add** | `useGSAP` cleanup |
| lenis | 1.3.27 | keep | smooth wheel scroll |
| detect-gpu | 5.0.70 | keep | GPU tier, benchmarks self-hosted |
| motion | 14.9.0 | keep | UI only (drawer, sheet, store). Never inside the film. |
| animejs | 4.5.0 | keep | small UI timelines only (CLAUDE.md). Never inside the film. |
| zod 4.6.7, nodemailer 10.3.1, react-hook-form 7.91.0, @hookform/resolvers 7.0.2, clsx, tailwind-merge, server-only | as installed | keep | booking, store |
| @react-three/postprocessing, postprocessing | — | **remove** | A8 |

### 1.2 Dev dependencies to add

| Package | Version | Use |
|---|---|---|
| @playwright/test | **1.64.1** | e2e, visual snapshots, perf runs |
| @axe-core/playwright | **4.14.0** | accessibility checks |
| sharp | **0.35.5** | frame, poster and plate encoding (already present transitively through Next; pin it so scripts do not depend on Next's copy) |
| tsx | **4.23.15** | run `.ts` unit tests and scripts with the `@/` path alias |

Keep the existing `@lhci/cli` 0.16.0, `@next/bundle-analyzer` 16.4.5, `puppeteer-core`, `tailwindcss` 4, TypeScript 5.

### 1.3 Install commands (T0, run from the repo root in Git Bash)

```bash
npm i gsap@3.15.1 @gsap/react@2.1.2
npm rm @react-three/postprocessing postprocessing
npm i -D @playwright/test@1.64.1 @axe-core/playwright@4.14.0 sharp@0.35.5 tsx@4.23.15
npx playwright install --with-deps chromium webkit
# CLI tools used through npx only (never added to package.json):
npx @gltf-transform/cli@4.5.1 --version     # expect 4.5.1
```

### 1.4 External tools (asset pipeline only; not needed to run the site)

| Tool | Version | Install on Windows | Check |
|---|---|---|---|
| ffmpeg | 9.0.2 (installed via scoop) | `scoop install ffmpeg` | `ffmpeg -hide_banner -encoders \| grep -E "libwebp\|libsvtav1\|libopus"` |
| KTX-Software (`ktx` CLI) | **4.4.2** | Installer from https://github.com/KhronosGroup/KTX-Software/releases/tag/v4.4.2; tick "add to PATH". The asset filename is UNVERIFIED (historically `KTX-Software-4.4.2-Windows-x64.exe`). | `ktx --version` |
| Blender | **4.5 LTS** (any later LTS is acceptable; the export settings in §19 refer to the 4.5 glTF exporter) | https://www.blender.org/download/lts/ | `blender --version` |
| @gltf-transform/cli | 4.5.1 | via `npx` | `npx @gltf-transform/cli@4.5.1 --version` |

If `ktx` cannot be installed, use the WebP texture fallback in §11.6 (higher GPU memory, no external tool).

### 1.5 `package.json` scripts (final set)

```jsonc
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "analyze": "ANALYZE=true next build",
  "postinstall": "node scripts/copy-decoders.mjs",
  "test:unit": "tsx --test \"src/**/*.test.ts\"",
  "test:e2e": "playwright test --project=chromium-desktop --project=chromium-mobile --project=webkit-iphone --project=reduced-motion --project=no-js",
  "test:visual": "playwright test --project=visual",
  "test:a11y": "playwright test tests/e2e/a11y.spec.ts",
  "perf:film": "playwright test --project=perf --headed",
  "lhci": "lhci autorun",
  "check:claims": "tsx scripts/check-claims.ts",
  "check:budgets": "node scripts/film/check-budgets.mjs",
  "film:frames": "node scripts/film/build-frames.mjs",
  "film:posters": "node scripts/film/build-posters.mjs",
  "film:plates": "node scripts/film/build-plates.mjs",
  "film:glb": "node scripts/film/build-glb.mjs",
  "film:audio": "node scripts/film/build-audio.mjs",
  "film:noise": "node scripts/film/build-noise.mjs",
  "film:arc": "node scripts/film/build-arc.mjs",
  "film:extract": "node scripts/film/extract-frames.mjs",
  "film:placeholders": "node scripts/film/make-placeholders.mjs",
  "detect-gpu:fetch": "node scripts/fetch-detect-gpu.mjs"
}
```

`ANALYZE=true` does not work in PowerShell; run `npm run analyze` from Git Bash (the Bash tool here).

---

## 2. Folder structure (target state)

`(new)` = created by this plan; `(keep)` = exists and stays; `(replace)` = exists and is rewritten; `(store WP)` = owned by store-revamp §7.

```
AVVVS/
├─ assets-src/                         (new) source art, layout exactly as 03 §0.2; git-ignored except the files marked (committed), §11.1
│  ├─ README.md                        (committed) where masters live, who owns them
│  ├─ grade/avvvs-film-base.cube, avvvs-s01.cube, avvvs-s03.cube, avvvs-s04.cube, avvvs-s05-bg.cube   (committed)
│  ├─ keyframes/<KF-id>/{v1..vn,chosen,upscaled,final}.png     pipeline A stills
│  ├─ clips/<clip-id>-<d|m>-v<n>.mp4   pipeline A image-to-video output (5 s, 24 fps, 120 frames)
│  ├─ renders/<clip-id>/<d|m>/0001.png pipeline B Blender output (16-bit PNG), §19
│  ├─ frames/<clip-id>/<d|m>/0001.png  graded, full-res PNG (output of extract-frames)
│  ├─ plates/raw/, plates/retouched/   engraving scans and retouched masters
│  ├─ plates/plates.json               (committed) crop boxes, levels, source URLs, measured px
│  ├─ packshots/raw/, packshots/selects/   PRD-ARC-A/B, PRD-H3
│  ├─ s05/layout.json                  (committed) product rect and H3 sub-rect per device, §11.5
│  ├─ refs/hands/, refs/vessels/       never shipped
│  ├─ glb/raw/                         Poly Haven / Blender exports before gltf-transform
│  ├─ blender/*.blend                  pipeline B scene files, §19
│  ├─ fonts/                           Boska 300 TTF (for next/og), IM FELL English TTFs (build only)
│  └─ audio/raw/, audio/master/
├─ docs/plan/04-technical-architecture.md   (this file)
├─ public/
│  ├─ brand/avvvs-logo.png             (keep) until the SVG logo arrives (N14)
│  ├─ content/**                       (keep) scraped images
│  ├─ decoders/basis/{basis_transcoder.js,basis_transcoder.wasm}   (new, postinstall copy from three/examples/jsm/libs/basis/; meshopt needs no copy: drei bundles the decoder)
│  ├─ detect-gpu/benchmarks/*.json     (new, scripts/fetch-detect-gpu.mjs)
│  ├─ plates/<slug>-2048.avif, <slug>-1024.webp     HTML plate images (static grid, plants list, inspect dialog)
│  ├─ svg/binomial-<slug>.svg          single-stroke binomials for DrawSVG (03 SVG-BINOMIAL)
│  └─ film/                            hash = first 6 hex of sha1 over the folder's files (03 §0.2)
│     ├─ s01.<hash>/{d,m,s}/0000.webp …    SEQ-S01 (96 / 64 / 64 frames)
│     ├─ s03.<hash>/{d,m,s}/, s04.<hash>/{d,m,s}/   SEQ-S03, SEQ-S04 (72 / 48 / 48)
│     ├─ s05bg.<hash>/{d,m,s}/          SEQ-S05BG (40 / 28 / 28)
│     ├─ s05arc.<hash>/{d,m}/           SEQ-S05ARC, 13 RGBA angle frames, set A or B (§11.5)
│     ├─ s05h3.<hash>/{d,m}/            SEQ-S05H3, 24 RGBA sub-rect frames (conditional on PRD-H3)
│     ├─ s02turn.<hash>/{l,p}/          SEQ-S02TURN, 24 RGBA frames, tier 1 only
│     ├─ s02/plates/<slug>-ink-2048.ktx2, <slug>-ink-1024.ktx2, <slug>-annot-2048.webp, <slug>-annot-1024.webp
│     ├─ s02/specimen/zingiber-officinale-d.glb, zingiber-officinale-m.glb
│     ├─ tex/film-noise-512.png         RGBA noise for the composite (03 TEX-NOISE)
│     ├─ tex/paper-normal-1024.ktx2, paper-normal-512.ktx2   plate backing paper (03 TEX-PAPER-N)
│     ├─ posters/<PST-id>-<d|m>.avif    03 §2.3 (PST-S01-OPEN, PST-S01 … PST-S05)
│     └─ audio/<AUD-id>.opus, <AUD-id>.m4a
│   The `s` set (540×960, §14.4) is an addition to 03: build-frames derives it from the `m` PNGs; it is not a separate render.
├─ scripts/
│  ├─ copy-decoders.mjs                (new) postinstall
│  ├─ fetch-detect-gpu.mjs             (new)
│  ├─ check-claims.ts                  (store WP S2; also scans film.ts, plates.ts)
│  ├─ seed-medicine-sheet.mjs          (store WP S1)
│  └─ film/
│     ├─ extract-frames.mjs            MP4/PNG → graded, sized PNG (ffmpeg)
│     ├─ build-frames.mjs              PNG → WebP + manifest (sharp)
│     ├─ build-posters.mjs             PNG → AVIF posters (sharp)
│     ├─ build-plates.mjs              TIFF → AVIF/WebP/ink PNG/KTX2
│     ├─ build-glb.mjs                 gltf-transform pipeline
│     ├─ build-audio.mjs               WAV → Opus/AAC (ffmpeg)
│     ├─ build-noise.mjs               TEX-NOISE 512² RGBA (§11.9)
│     ├─ build-arc.mjs                 packshot TIFF → RGBA arc + H3 frames (§11.5)
│     ├─ make-placeholders.mjs         numbered test frames for T5
│     └─ check-budgets.mjs             byte budgets per scene (§14.2)
├─ src/
│  ├─ app/                             routes, §3
│  │  ├─ fonts/boska/*.woff2 + LICENSE.txt   (design WP)
│  │  ├─ styles/tokens.css             (replace, 01 §3.3)
│  │  ├─ styles/base.css               (replace)
│  │  ├─ styles/film.css               (new) track/stage/scene layout, modes, tones
│  │  └─ globals.css                   (replace) imports + Tailwind @theme mapping
│  ├─ components/
│  │  ├─ film/                         DOM side of the film (server + client leaves)
│  │  ├─ three/film/                   everything that imports three / R3F
│  │  ├─ home/                         S06 sections
│  │  ├─ site/                         nav, footer, theme, scroll
│  │  ├─ ui/                           Button, Field, Select, Disclosure (design WP)
│  │  ├─ store/                        (keep logic, store WP rebuilds visuals)
│  │  ├─ booking/                      (keep)
│  │  └─ content/                      (keep Blocks, Breadcrumbs, Faq; delete ShaderBackdrop)
│  ├─ content/
│  │  ├─ film.ts                       (new) all film strings, 01 §4.2
│  │  ├─ plates.ts                     (new) plate data, 01 §5.2
│  │  ├─ credits.ts                    (keep, extend per plate/sound/HDRI)
│  │  ├─ store-policies.ts             (store WP S3)
│  │  ├─ medicines/sheet.tsv           (store WP S1)
│  │  └─ about.ts, clinics.ts, treatments.ts, blog.ts, gallery.ts, testimonials.ts, ayurvedic-life.ts, types.ts, index.ts (keep)
│  └─ lib/
│     ├─ film/                         timeline, store, quality, assets, transitions, color, audio, perf
│     ├─ scroll/lenis.ts               (new) the Lenis singleton
│     ├─ theme.ts                      (new) theme key, head script string, theme-color values
│     ├─ motion/tokens.ts              (design WP)
│     ├─ medicines/*                   (store WP S1–S7)
│     ├─ shopify/*                     (keep)
│     ├─ booking/*                     (keep)
│     ├─ seo/index.tsx                 (keep, extended §16)
│     └─ site.ts                       (keep)
├─ tests/
│  ├─ e2e/*.spec.ts                    §17
│  ├─ visual/*.spec.ts
│  └─ perf/film-perf.spec.ts
├─ playwright.config.ts                (new)
├─ lighthouserc.json                   (replace, §14.3)
└─ next.config.ts                      (keep; add headers + redirects, §3.3)
```

---

## 3. Route map

All routes are Server Components with `generateMetadata` through `buildMetadata()` and JSON-LD through `<JsonLd>` (CLAUDE.md). "Static" means prerendered at build with no request-time API; Shopify reads are cached (`"use cache"` + `cacheTag`, existing adapter) and revalidated by the webhook route.

### 3.1 Routes

| Path | File | Status | Rendering | JSON-LD | Notes |
|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | replace | static | `organizationSchema`, `websiteSchema` (layout) + `clinicSchema` | `<Film />` + `<HomeSite />` (§4.3) |
| `/store` | `src/app/store/page.tsx` | store WP S4 | static first page; filtered requests stream | `BreadcrumbList`, `ItemList` (first 24) | 24 per page; facets by form/route/reference |
| `/store/[collection]` | `src/app/store/[collection]/page.tsx` | keep (store WP) | static, `generateStaticParams` from collections with ≥ 1 product | `BreadcrumbList` | no "Cosmetics" while empty |
| `/products/[handle]` | `src/app/products/[handle]/page.tsx` | store WP S3 | static per handle, ISR via `cacheTag("product:"+handle)` | `Product` + `Offer` + `BreadcrumbList` | never renders `body_html` |
| `/about-us` | `src/app/about-us/page.tsx` | keep, restyle | static | `AboutPage` + `Organization` ref | "Key facts" `<dl>` (AEO) |
| `/avvvs-speciality-clinic` | `…/page.tsx` | keep, restyle | static | `MedicalClinic` | |
| `/avvvs-speciality-clinic/[slug]` | `…/[slug]/page.tsx` | keep, restyle | static, 8 slugs from `clinics.ts` | `MedicalWebPage` + `FAQPage` (only scraped answers) | |
| `/treatments` | `src/app/treatments/page.tsx` | **new** | static | `MedicalWebPage` | nav already links here |
| `/treatments/[slug]` | `src/app/treatments/[slug]/page.tsx` | **new** | static, 12 slugs from `treatments.ts` | `MedicalTherapy` in `MedicalWebPage`, `FAQPage` | question headings (PLAN §6.4) |
| `/ayurvedic-life` | `src/app/ayurvedic-life/page.tsx` | **new** | static | `CollectionPage` | old `/ayurvediclife` redirects here |
| `/gallery` | `src/app/gallery/page.tsx` | **new** | static | `ImageGallery` | 6 albums from `gallery.ts` |
| `/testimonial` | `src/app/testimonial/page.tsx` | **new** | static | none (no `Review` markup on a clinic: self-serving reviews are not eligible) | only real testimonials from `testimonials.ts` |
| `/blog` | `src/app/blog/page.tsx` | **new** | static | `Blog` | label "Journal" in nav |
| `/<blog-slug>` and `/<recipe-slug>` | `src/app/[slug]/page.tsx` | **new** | static; `generateStaticParams` returns the 10 blog slugs + 2 recipe slugs (decoded with `decodeURIComponent`); `export const dynamicParams = false` | `BlogPosting` / `Recipe` | keeps the exact old WordPress URLs (A15) |
| `/cosmetic` | `src/app/cosmetic/page.tsx` | **new** | static | `WebPage` | content from `about.ts` cosmetic block; links out to glovedaherbals.com |
| `/consultation` | keep | keep, restyle | static shell; the form is a client island; server action sends | `MedicalClinic` with `potentialAction: ReserveAction` | reads `?medicine=` client-side only (store WP S6) |
| `/contact-us` | keep | keep, restyle | static | `MedicalClinic` + `LocalBusiness` | map embed (facade, click to load) |
| `/credits` | `src/app/credits/page.tsx` | **new** | static | `WebPage` | every plate, sound, HDRI, model credit from `credits.ts` (01 §4.4) |
| `/sitemap.xml` | `src/app/sitemap.ts` | **new** | static | — | content + all Shopify handles |
| `/robots.txt` | `src/app/robots.ts` | **new** | static | — | §16.3 |
| `/llms.txt`, `/llms-full.txt` | `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts` | **new** | static (`export const dynamic = "force-static"` is not available under Cache Components; a GET handler with no request APIs is prerendered) | — | §16.4. Confirm static behaviour in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` before writing. |
| `/opengraph-image` | `src/app/opengraph-image.tsx` + per-route where listed in §16 | **new** | static | — | `next/og`, Boska + Geist, no artwork |
| `/api/shopify/revalidate` | keep | keep | dynamic | — | webhook |
| `/dev/film-lab` | `src/app/dev/film-lab/page.tsx` | **new** | `notFound()` when `process.env.NODE_ENV === "production"` | — | transition tuning harness (T6) |

### 3.2 Redirects (`next.config.ts` → `redirects()`, all `permanent: true`, i.e. 308)

Next already 308-redirects trailing slashes (`/about-us/` → `/about-us`) because `trailingSlash` is false. Add only the paths whose names change:

| From | To |
|---|---|
| `/ayurvediclife` and `/ayurvediclife/:path*` | `/ayurvedic-life` |
| `/book-appointment`, `/appointment` | `/consultation` |
| `/shop`, `/collections/:handle` | `/store`, `/store/:handle` |
| `/category/:path*`, `/tag/:path*`, `/author/:path*` | `/blog` |
| `/feed` | `/blog` |

Before adding any other entry, check the Wayback Machine (`https://web.archive.org/web/2026/https://avvvs.com/<path>/`) that the old path existed. Never bypass avvvs.com's broken TLS.

### 3.3 `next.config.ts` additions

```ts
async headers() {
  const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
  return [
    { source: "/film/:path*", headers: immutable },
    { source: "/decoders/:path*", headers: immutable },
    { source: "/film/:path*.ktx2", headers: [...immutable, { key: "Content-Type", value: "image/ktx2" }] },
    { source: "/film/audio/:path*.opus", headers: [...immutable, { key: "Content-Type", value: "audio/ogg" }] },
    { source: "/detect-gpu/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }] },
  ];
},
```
Remove `"@react-three/drei"` from `experimental.optimizePackageImports` only if `npm run analyze` shows it hurts; otherwise keep. Keep `cacheComponents`, `partialPrefetching`, images config and the turbopack CSS rule exactly as they are.

---

## 4. Component hierarchy

Legend: **S** = Server Component, **C** = `"use client"`, **D** = loaded only through `next/dynamic({ ssr: false })`. Props are TypeScript; `?` = optional.

### 4.1 Root layout

```
src/app/layout.tsx  (S)  RootLayout({ children }: LayoutProps<"/">)
└─ <html lang="en-IN" suppressHydrationWarning className={fontVars}>   (no data-theme / data-film from the server: HEAD_SCRIPT sets both before first paint, §12.2; CSS defaults equal light + live)
   ├─ <head>
   │  └─ HeadScript (S)  src/components/site/HeadScript.tsx  props: none
   │       renders <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} /> (§12.2)
   │       + <noscript><style>{NOSCRIPT_FILM_CSS}</style></noscript>
   └─ <body>
      └─ CartProvider (C, keep)  src/components/store/CartProvider.tsx
         ├─ <a href="#main" className="skip-link">Skip to content</a>
         ├─ SiteNav (S)  src/components/site/SiteNav.tsx  props: none
         │  ├─ Wordmark (S)  src/components/site/Wordmark.tsx  props: { height?: number = 28 }
         │  ├─ NavLinks (S)  inline in SiteNav, from `nav` in site.ts (Store, Clinic, Treatments, About)
         │  ├─ ThemeToggle (C)  src/components/site/ThemeToggle.tsx  props: none
         │  ├─ CartButton (C, keep)  src/components/store/CartButton.tsx
         │  ├─ Button (S)  src/components/ui/Button.tsx  props: { variant: "primary"|"secondary"|"quiet"; size?: "md"|"lg"; href?: string; children; type?; onClick? }  ("Book")
         │  └─ NavMenu (C, keep+restyle)  src/components/site/NavMenu.tsx  props: { links: NavLink[] }  phone sheet, `data-lenis-prevent`
         ├─ <ViewTransition default="page"><main id="main">{children}</main></ViewTransition>
         ├─ SiteFooter (S)  src/components/site/SiteFooter.tsx  props: none
         │  └─ FilmModeToggle (C)  src/components/film/FilmModeToggle.tsx  props: none  ("Show still images" / "Play film")
         ├─ CartDrawer (C, keep, store WP restyles)  id="cart-drawer", `data-lenis-prevent`
         ├─ SmoothScroll (C, replace)  src/components/site/SmoothScroll.tsx  props: none
         └─ JsonLd (S, keep)  data=[organizationSchema(), websiteSchema()]
```

Fonts (`fontVars`): `boska` via `next/font/local` (`variable: "--font-boska"`, weights 300/400/400 italic/500, `display: "swap"`, `preload: true` for 300 and 400 only), `Geist` via `next/font/google` (`variable: "--font-geist"`, `subsets: ["latin"]`, `display: "swap"`), Anek Malayalam and Noto Serif Malayalam with `preload: false`. **No other fonts.** IM FELL English is baked into plate textures and never loaded. (01 §3.1; needs N12 approval of the CLAUDE.md amendment.)

`viewport` export:
```ts
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: THEME_COLOR.light, // "#f8f7f3", see §12.4
};
```

### 4.2 Home page

```
src/app/page.tsx  (S)  Page()
├─ Film (S)  src/components/film/Film.tsx  props: none
│  │  reads: FILM_COPY (src/content/film.ts), PLATES (src/content/plates.ts),
│  │         SCENES (src/lib/film/timeline.ts), POSTERS (src/lib/film/manifest.generated.ts),
│  │         getProducts() for plate "In:" links and S05 names (cached Shopify read)
│  └─ <div id="film" className="film" data-film-root>
│     ├─ SkipFilm (C)  src/components/film/SkipFilm.tsx  props: { targetId: "site" }
│     │    renders <a href="#site" className="film__skip">Skip film</a> (works without JS)
│     ├─ FilmStage (C)  src/components/film/FilmStage.tsx
│     │    props: { children: React.ReactNode /* FilmPoster */; plates: PlateRuntimeData[]; heroProducts: HeroProduct[] }
│     │  ├─ FilmPoster (S, passed as children)  src/components/film/FilmPoster.tsx
│     │  │    props: { scene: SceneId; alt: ""; priority?: boolean }
│     │  │    <picture> art-directed d/m AVIF via getImageProps; S01 is preloaded (§13.1)
│     │  ├─ ScenePosters (C)  src/components/film/ScenePosters.tsx  props: { scenes: PosterRef[] }  (poster mode only, §15)
│     │  └─ FilmRuntime (C, D)  src/components/film/FilmRuntime.tsx
│     │       props: { quality: Quality; plates: PlateRuntimeData[]; heroProducts: HeroProduct[] }
│     │     ├─ FilmScroll (C)  src/components/film/FilmScroll.tsx  props: { trackId: "film" }  (renders null)
│     │     ├─ FilmOverlay (C)  src/components/film/FilmOverlay.tsx  props: { trackId: "film"; plates: PlateRuntimeData[] }  (renders null; animates server DOM)
│     │     ├─ FilmChrome (C)  src/components/film/FilmChrome.tsx  props: none
│     │     │  ├─ SoundToggle (C)  src/components/film/SoundToggle.tsx  props: none
│     │     │  └─ ProgressRail (C)  src/components/film/ProgressRail.tsx  props: none (1 px rail, scaleX = progress)
│     │     └─ FilmCanvas (C)  src/components/three/film/FilmCanvas.tsx  props: { quality: Quality; plates: PlateRuntimeData[] }
│     │        └─ <Canvas …> (§6.1)
│     │           ├─ PerformanceMonitor (drei) → useQualityStep()
│     │           ├─ FilmDirector  src/components/three/film/FilmDirector.tsx  props: { quality: Quality }  (renders null; owns the render loop)
│     │           ├─ Composite  src/components/three/film/Composite.tsx  props: { quality: Quality }  (mesh in the composite scene)
│     │           ├─ Archives  src/components/three/film/Archives.tsx  props: { plates: PlateRuntimeData[]; quality: Quality }  (createPortal into the archive scene)
│     │           │  ├─ PlateMesh ×N  src/components/three/film/PlateMesh.tsx  props: { plate: PlateRuntimeData; index: number; count: number; texture: THREE.Texture }
│     │           │  ├─ PlateShadow ×N  src/components/three/film/PlateShadow.tsx  props: { index: number; width: number; height: number }
│     │           │  └─ Specimen  src/components/three/film/Specimen.tsx  props: { quality: Quality }  (GLB on tier ≥ 2; SpecimenTurntable on tier 1)
│     │           └─ PowderFx  src/components/three/film/PowderFx.tsx  props: { count: number }  (tier ≥ 2 only)
│     ├─ FilmScene ×6 (S)  src/components/film/FilmScene.tsx
│     │    props: { scene: SceneDef; copy: FilmLine[]; headingLevel: 1 | 2; children?: React.ReactNode }
│     │  ├─ <div className="film__copy" data-cue="…"> h1/h2 + p from film.ts </div>
│     │  ├─ FilmStill (S)  src/components/film/FilmStill.tsx  props: { scene: SceneId; alt: string }  (static mode only; `loading="lazy"`)
│     │  └─ (s02 only) FilmPlates (S)  src/components/film/FilmPlates.tsx
│     │        props: { plates: Plate[]; products: Record<string, { title: string; available: boolean }> }
│     │        └─ <figure> ×N with img (static mode), common name, <i>binomial</i>, Sanskrit, Malayalam (lang="ml", only when verified),
│     │           reference line, "In:" product links (max 3, in stock first), note, annotation list
│     │           └─ PlateInspectButton (C)  src/components/film/PlateInspectButton.tsx  props: { plateId: string; label: string }
│     ├─ PlateInspect (C)  src/components/film/PlateInspect.tsx  props: { plates: PlateRuntimeData[] }  (one <dialog>, opened by the buttons)
│     └─ HandoffNote (S)  src/components/film/HandoffNote.tsx  props: none  (film.ts `handoff.note`)
├─ HomeSite (S)  src/components/home/HomeSite.tsx  props: none  → <div id="site">
│  ├─ StoreIntro (S)  src/components/home/StoreIntro.tsx  props: none  (h2 "The store", lead, 2 buttons; h2 has tabIndex={-1} for SkipFilm focus)
│  ├─ SignatureBand (S)  src/components/home/SignatureBand.tsx  props: none  (async; reads Shopify; 01 §4.4 order; skips missing handles)
│  ├─ PlantsList (S)  src/components/home/PlantsList.tsx  props: none  (plates.ts + product links)
│  ├─ ClinicBand (S)  src/components/home/ClinicBand.tsx  props: none
│  │  └─ ClinicLiveLine (C)  src/components/home/ClinicLiveLine.tsx  props: { slots: TimeSlot[] }  (Asia/Kolkata; renders "" on the server, fills after mount; reserves 1 line height)
│  └─ AboutBlock (S)  src/components/home/AboutBlock.tsx  props: none
└─ JsonLd (S)  data={clinicSchema()}
```

Shared prop types (in `src/lib/film/types.ts`):
```ts
export type SceneId = "s01" | "s02" | "s03" | "s04" | "s05" | "handoff";
export type FilmLine = { id: string; text: string; source: string; status: "verified" | "tone" | "needs-avvvs" };
export type PlateRuntimeData = {
  id: string;                 // binomial slug (03 §0.2), e.g. "vitex-negundo"
  aspect: number;             // width / height of the cropped plate
  ink: { d: string; m: string };          // KTX2 ink-alpha URLs (2048 / 1024)
  annot: { d: string; m: string };        // WebP annotation overlays (2048 / 1024)
  inkFallback?: { d: string; m: string }; // WebP ink URLs when KTX2 could not be built (§11.6)
  annotations: { label: string; uv: [number, number]; anchor: [number, number] }[]; // label point and structure point, plate UV 0..1
};
export type HeroProduct = { handle: string; name: string; price: string; url: string };
```

### 4.3 Other pages (summary; detailed specs live in their own WPs)

- Store and PDP components: store-revamp §6–§7 (`BuyPanel`, `LabelViewer`, `FactsList`, `CautionNote`, `PolicyDetails`, `StickyBuyBar`, `FormTiles`, `ProductCard`, `Catalogue`, `CatalogueControls`). All Server Components except `BuyPanel`, `StickyBuyBar`, `LabelViewer`, `CatalogueControls`, `QuantityStepper`, the recently-viewed writer and `CartDrawer`.
- Content pages: `Blocks`, `Breadcrumbs`, `Faq` (keep, `src/components/content/`), restyled by the design WP.
- Booking: `BookingForm` (C, keep) + `src/lib/booking/*` (keep).
- **No content page imports anything from `src/components/film`, `src/components/three`, `gsap` or `three`.** Enforced by an ESLint `no-restricted-imports` rule scoped to `src/app/**` except `src/app/page.tsx` and `src/app/dev/**`.

---

## 5. Film runtime: data and control

### 5.1 `src/lib/film/timeline.ts` (pure data, server-safe, no imports from three)

```ts
export const FILM_VH = { wide: 1400, narrow: 1000 } as const;   // track height in svh; narrow = viewport < 768 px
export const NARROW_MAX_PX = 767;

export type SceneKind = "sequence" | "archive" | "solid";
export type Tone = "dark" | "parchment";
export const SCENES = [
  { id: "s01",     start: 0.00, end: 0.14, kind: "sequence", tone: "dark",      grain: 0.028, vignette: 0.30 },
  { id: "s02",     start: 0.14, end: 0.46, kind: "archive",  tone: "parchment", grain: 0.018, vignette: 0.00 },
  { id: "s03",     start: 0.46, end: 0.60, kind: "sequence", tone: "dark",      grain: 0.028, vignette: 0.30 },
  { id: "s04",     start: 0.60, end: 0.74, kind: "sequence", tone: "dark",      grain: 0.028, vignette: 0.30 },
  { id: "s05",     start: 0.74, end: 0.92, kind: "sequence", tone: "dark",      grain: 0.028, vignette: 0.30 },
  { id: "handoff", start: 0.92, end: 1.00, kind: "solid",    tone: "parchment", grain: 0.000, vignette: 0.00 },
] as const;

// Transition band = last 12% of the outgoing scene + first 8% of the incoming one (01 §2.8)
export const BAND_OUT = 0.12;
export const BAND_IN = 0.08;

// Per-scene runtime grade (lift, gamma, gain, saturation) applied in linear light. Start neutral; tune in /dev/film-lab.
export const GRADE: Record<SceneId, [number, number, number, number]> = {
  s01: [0, 1, 1, 1], s02: [0, 1, 1, 1], s03: [0, 1, 1, 1], s04: [0, 1, 1, 1], s05: [0, 1, 1, 1], handoff: [0, 1, 1, 1],
};
export const SCRIM: Record<SceneId, number> = { s01: 0, s02: 0, s03: 0, s04: 0, s05: 0, handoff: 0 }; // 0..0.18

// Text cues in scene-local progress. "in" < 0 means visible at first paint (no reveal).
export const TEXT_CUES = {
  "s01.title":   { scene: "s01", in: -1,   out: 0.40 },  // the h1: never animated in, LCP-safe
  "s01.head":    { scene: "s01", in: 0.50, out: 0.88 },
  "s01.caption": { scene: "s01", in: 0.62, out: 0.88 },
  "s02.head":    { scene: "s02", in: 0.08, out: 0.20 },
  "s03.head":    { scene: "s03", in: 0.08, out: 0.88 },
  "s04.head":    { scene: "s04", in: 0.08, out: 0.88 },
  "s05.head":    { scene: "s05", in: 0.20, out: 0.88 },  // after the ring clears
  "handoff.note":{ scene: "handoff", in: 0.30, out: 2 },
} as const;                    // captions share their headline's cue unless listed

// S01 sub-clips (frame index ranges inside the S01 sequence; 03 SEQ-S01: 4 clips × 24 d / 16 m frames)
export const S01_CLIPS = { wide: [0, 23], descent: [24, 47], hand: [48, 71], macro: [72, 95] } as const; // desktop; mobile ranges = ×(64/96)
// S01 fade-up from --film-night, applied in Composite (not baked, 03 SEQ-S01): uFade 1 → 0 across S01 local 0.00–0.12.

// S04 → S05 ring origin: spiral centre in S04's last frame, in frame UV (0..1, y down as in the image). Targets from 03 SEQ-S04;
// re-measure on the delivered last frame and overwrite (±0.03 allowed).
export const RING_ORIGIN = { d: [0.69, 0.58], m: [0.50, 0.66] } as const;
// S02 → S03 burn origin: specimen centre in screen UV at S02 local 0.88.
export const BURN_ORIGIN = { wide: [0.34, 0.50], narrow: [0.50, 0.36] } as const;
```

S02 choreography constants live in `src/lib/film/s02-layout.ts` (§7.2). Nothing film-related is hard-coded in components.

Helper (same file):
```ts
export type Resolved = {
  a: number; b: number;          // scene indices; b = -1 outside a band
  localA: number; localB: number;// scene-local progress, clamped 0..1
  mix: number;                   // eased band progress 0..1 (smoother step)
  mode: TransitionMode;          // from TRANSITIONS[a→b], "none" outside a band
};
export function resolve(p: number): Resolved;
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
```
Band maths for boundary between scene `i` (len `Li`) and `i+1` (len `Lj`): `bandStart = end_i − BAND_OUT·Li`, `bandEnd = start_j + BAND_IN·Lj`, `mix = smoother(clamp((p − bandStart)/(bandEnd − bandStart)))`. Inside the band `a = i`, `b = i+1`, `localA = clamp((p − start_i)/Li)`, `localB = clamp((p − start_j)/Lj)` (so B holds its frame 0 until the boundary).

Unit tests (`src/lib/film/timeline.test.ts`): `resolve(0)` → a=0, b=−1; `resolve(0.14)` → a=0, b=1, `0 < mix < 1`; `resolve(1)` → a=5, b=−1; mix is continuous (max jump < 0.02 over 10,000 steps); scene starts and ends are contiguous and cover 0..1.

### 5.2 `src/lib/film/store.ts` (mutable store, no React)

```ts
export type FilmState = {
  target: number;      // 0..1, written by ScrollTrigger onUpdate
  progress: number;    // damped toward target in FilmDirector: damp(progress, target, 6, dt)
  velocity: number;    // ScrollTrigger.getVelocity() / 1000, clamped ±3
  scene: number;       // index of resolve(progress).a
  paused: boolean;     // inspect dialog open, tab hidden, or skip pressed
  mode: "live" | "poster" | "static";
  ready: boolean;      // first composite frame drawn
};
export const film = {
  get(): Readonly<FilmState>;
  setTarget(p: number, v: number): void;      // the only thing ScrollTrigger calls; also calls invalidate()
  setProgress(p: number): void;               // FilmDirector only; updates scene and fires scene listeners on change
  setPaused(v: boolean): void;
  setMode(m: FilmState["mode"]): void;        // also writes document.documentElement.dataset.film
  setReady(): void;                           // dispatches window event "film:ready"
  onTarget(fn: (s: FilmState) => void): () => void;   // fires on setTarget (scroll events, not per frame)
  onScene(fn: (scene: number) => void): () => void;   // fires only when scene changes
  bindInvalidate(fn: () => void): void;       // FilmCanvas registers R3F invalidate
};
```
Rules: `useFrame` never calls React `setState`. React subscribes only through `useSyncExternalStore(film.onScene, () => film.get().scene)`. In development, `window.__film = film` for tests (stripped in production by `if (process.env.NODE_ENV !== "production")`; Playwright production runs use `NEXT_PUBLIC_FILM_DEBUG=1`, §17).

### 5.3 Scroll: `src/lib/scroll/lenis.ts` + `FilmScroll.tsx`

`src/lib/scroll/lenis.ts`:
```ts
let lenis: Lenis | null = null; let rafId = 0;
export function getLenis(): Lenis | null;            // null under reduced motion or coarse pointer
export function createLenis(): Lenis | null {        // called once by SmoothScroll
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(pointer: coarse)").matches) return null;
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, syncTouch: false, autoRaf: false, anchors: false });
  const loop = (t: number) => { lenis!.raf(t); rafId = requestAnimationFrame(loop); };
  rafId = requestAnimationFrame(loop);
  return lenis;
}
export function handOverToGsap(ticker: typeof gsap.ticker): () => void {  // FilmScroll calls this
  cancelAnimationFrame(rafId);
  const tick = (time: number) => lenis!.raf(time * 1000);
  ticker.add(tick); ticker.lagSmoothing(0);
  return () => { ticker.remove(tick); rafId = requestAnimationFrame(function loop(t) { lenis!.raf(t); rafId = requestAnimationFrame(loop); }); };
}
```
`SmoothScroll.tsx` (C, site-wide): calls `createLenis()` in `useEffect`, destroys on unmount, calls `lenis.scrollTo(0, { immediate: true })` on pathname change. Exactly **one** Lenis instance exists; `FilmScroll` never constructs its own.

`src/lib/film/gsap.ts` (C module, imported only by film client files):
```ts
"use client";
import gsap from "gsap"; import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText"; import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"; import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });
export { gsap, ScrollTrigger, SplitText, useGSAP };
```

`FilmScroll.tsx` — the **master timeline**:
```ts
useGSAP(() => {
  const track = document.getElementById(trackId)!;
  const lenis = getLenis();
  const release = lenis ? handOverToGsap(gsap.ticker) : null;
  if (lenis) lenis.on("scroll", ScrollTrigger.update);

  const master = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: track, start: "top top", end: "bottom bottom",
      scrub: true,                      // Lenis already smooths wheel; touch gets damping in FilmDirector
      onUpdate: (st) => film.setTarget(st.progress, st.getVelocity() / 1000),
      onRefresh: (st) => film.setTarget(st.progress, 0),
    },
  });
  // Normalised duration 1.0: one label per scene start, used by seek() and by tests.
  SCENES.forEach((s) => master.addLabel(s.id, s.start));
  master.to({}, { duration: 1 }, 0);                                 // spacer so labels map 1:1 to progress
  master.fromTo("[data-film-rail]", { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0); // ProgressRail
  master.to("[data-film-skip]", { autoAlpha: 1, duration: 0.001 }, 0.02);
  master.to("[data-film-skip]", { autoAlpha: 0, duration: 0.001 }, 0.92);

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  return () => { release?.(); lenis?.off("scroll", ScrollTrigger.update); };
}, { scope: undefined });
```
Also exported: `seek(sceneId)`: `lenis ? lenis.scrollTo(track.offsetTop + SCENES[i].start * (track.offsetHeight − innerHeight), { duration: 1.2 }) : window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" })`.

Tone switching: `film.onScene(i => document.documentElement.dataset.filmTone = SCENES[i].tone)`; removed (`delete dataset.filmTone`) when the track leaves the viewport (an `IntersectionObserver` on `#film` with `threshold: 0`). CSS swaps `--chrome-ink` instantly: `[data-film-tone="dark"] { --chrome-ink: var(--film-ink) } [data-film-tone="parchment"] { --chrome-ink: var(--film-sepia) }`. No colour transition.

### 5.4 `FilmOverlay.tsx` (text reveals over the canvas)

- Finds every `[data-cue]` element inside `#film`. For each, builds a paused GSAP timeline once:
  ```ts
  const split = SplitText.create(el.querySelectorAll("h1,h2,p"), { type: "lines", mask: "lines", linesClass: "film-line" });
  const tl = gsap.timeline({ paused: true })
    .fromTo(split.lines, { yPercent: 110 }, { yPercent: 0, duration: 0.76, ease: "power4.out" /* replaced by CustomEase below */, stagger: 0.06 }, 0)
    .fromTo(split.lines, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.64, stagger: 0.06 }, 0);
  ```
  The ease is the one site curve `cubic-bezier(0.16,1,0.3,1)`: register it once with `CustomEase.create("avvvs", "0.16,1,0.3,1")` (CustomEase ships with gsap 3.15; register it in `src/lib/film/gsap.ts`) and use `ease: "avvvs"`.
- `film.onTarget` computes each cue's local progress (from `target`, not damped progress, so text never lags the scroll). Crossing `in` upward → `tl.play()`; below `in` → `tl.reverse()`; crossing `out` → `gsap.to(el, { autoAlpha: 0, duration: 0.4 })`; back below `out` → `gsap.to(el, { autoAlpha: 1, duration: 0.4 })`.
- `s01.title` (cue `in: -1`) is never split or hidden before its `out`; it is the LCP element.
- Plate text: one cue group per plate (`data-cue="s02.plate.<id>"`), shown during that plate's hold window (§7.2). The binomial is also drawn as an SVG stroke (DrawSVG `"0% 0%"` → `"0% 100%"`, 1200 ms, ease "avvvs") on the plate's `<svg class="film-annot">`; leader lines draw over 600 ms with 80 ms stagger after the binomial starts.
- `useGSAP` reverts all timelines and `split.revert()` runs on unmount.
- Under `static` mode this component never loads.

### 5.5 Mode selection and boot: `FilmStage.tsx`

1. On mount read `document.documentElement.dataset.film` (set by the head script). If `"static"` → render nothing extra; return.
2. Wait for the boot trigger (A13): first of `wheel | scroll | pointermove | touchstart | keydown` (once, passive) or `requestIdleCallback(cb, { timeout: 3000 })` scheduled from `window.load`.
3. `const q = await getQuality()` (§5.6). If `q.mode === "static"` (tier 0, or WebGL 2 context creation fails) → `film.setMode("poster")` and mount `ScenePosters`; return.
4. `film.setMode("live")`; render `<FilmRuntime quality={q} …/>` via `const FilmRuntime = dynamic(() => import("./FilmRuntime"), { ssr: false, loading: () => null })`.
5. The canvas wrapper starts at `opacity: 0`; on `film:ready` it fades to 1 over 400 ms (`--dur-dissolve` is not used here; 400 ms opacity only). The poster stays underneath until then and is hidden (`visibility: hidden`) 400 ms after `film:ready` to free compositing.
6. `webglcontextlost` on the canvas → `film.setMode("poster")`, unmount `FilmRuntime`, mount `ScenePosters`. No retry in the same session.

### 5.6 `src/lib/film/quality.ts`

```ts
export type Quality = {
  mode: "live" | "static";
  tier: 1 | 2 | 3;
  set: "d" | "m" | "s";          // sequence set (§14.4)
  dpr: [number, number];
  plateTex: 1024 | 2048;
  specimen: "glb" | "turntable";
  powder: number;                 // particle count, 0 = off
  fbmOctaves: 2 | 4;              // composite PHONE define when 2
  sobel: boolean;                 // ink-bleed edge detection; false → luminance threshold only
  concurrency: 1 | 2 | 4;
  decodeWindow: [behind: number, ahead: number];
  lruSize: number;
  blobCapMB: number;
};
export async function getQuality(): Promise<Quality>;
```
Rules, first match wins:
1. No WebGL 2 context (`document.createElement("canvas").getContext("webgl2")` is null) → `static`.
2. `getGPUTier({ benchmarksURL: "/detect-gpu/benchmarks" })` → tier 0 → `static`. (Download the benchmarks with `npm run detect-gpu:fetch`, which saves `https://unpkg.com/detect-gpu@5.0.70/dist/benchmarks/*.json` into `public/detect-gpu/benchmarks/` once at dev time; no runtime request leaves our origin.)
3. Tier, device and network → the table in §14.4.

### 5.7 Pausing

`film.setPaused(true)` when: the inspect dialog opens; `document.hidden`; SkipFilm is used; the `#film` element is fully off-screen. Paused → R3F `setFrameloop("never")`, Lenis keeps running (page still scrolls), the asset queue keeps loading at low priority, audio fades out over 0.6 s. Unpaused → `setFrameloop("demand")`.

---

## 6. Film runtime: rendering

### 6.1 `FilmCanvas.tsx`

```tsx
<Canvas
  frameloop="demand"
  dpr={quality.dpr}
  flat                                   // NoToneMapping; sequences are display-referred
  gl={{ antialias: false, alpha: false, depth: true, stencil: false, powerPreference: "high-performance", preserveDrawingBuffer: false }}
  camera={{ fov: 28, near: 0.1, far: 50, position: [0, 0.15, 6] }}    // the S02 camera; the composite uses its own ortho camera
  onCreated={({ gl, invalidate }) => { gl.outputColorSpace = THREE.SRGBColorSpace; film.bindInvalidate(invalidate); }}
  style={{ position: "absolute", inset: 0 }}
  aria-hidden="true"
>
  <PerformanceMonitor ms={250} iterations={10} flipflops={3} onDecline={stepDown} onIncline={stepUp} onFallback={toTier1} />
  <FilmDirector quality={quality} />
  <Composite quality={quality} />
  <Archives plates={plates} quality={quality} />
  {quality.powder > 0 && <PowderFx count={quality.powder} />}
</Canvas>
```
- `stepDown`: lower the max DPR by 0.25 (floor 1). `stepUp`: raise by 0.25 up to `quality.dpr[1]`. `toTier1`: switch to tier-1 settings (powder 0, plate textures 1024, specimen turntable, `fbmOctaves` 2) without remounting the canvas.
- Render cadence driver (in `FilmDirector`, using `gsap.ticker`): if `|target − progress| > 1e-4` or `velocity ≠ 0` or a time-based effect is visible (dapple on S02, the specimen turn) → `invalidate()` every tick. Otherwise invalidate at **24 Hz** (accumulate `deltaTime` ≥ 41.6 ms), which keeps grain and dapple alive while idle at a third of the GPU cost.

### 6.2 `FilmDirector.tsx` (owns the render loop)

```ts
useFrame((state, dt) => {
  const s = film.get();
  const p = THREE.MathUtils.damp(s.progress, s.target, 6, dt);
  film.setProgress(p);
  const r = resolve(p);
  sources.update(r);                     // ask SequencePlayers / Archives for textures (§6.3)
  composite.setUniforms(r, sources, state.clock.elapsedTime);
  const gl = state.gl;
  if (sources.archiveActive(r)) {        // only while S02 is A or B
    gl.setRenderTarget(archiveRT);       // useFBO(size × dpr, { samples: tier3 ? 4 : 0, type: HalfFloatType? no: UnsignedByteType })
    gl.setClearColor(0x000000, 0); gl.clear();
    gl.render(archiveScene, archiveCamera);
  }
  gl.setRenderTarget(null);
  gl.render(compositeScene, orthoCamera);
  if (powderOn(r)) gl.render(powderScene, orthoOrPerspective);  // drawn after the composite, alpha-blended
  if (!s.ready) film.setReady();
}, 1);                                    // priority 1: R3F stops its own render
```
`archiveRT`: drei `useFBO(undefined, undefined, { samples: quality.tier === 3 ? 4 : 0, depthBuffer: true })` (sized to the canvas × DPR automatically). Clear alpha 0 so the composite can lay plates over the procedural paper. MSAA 4× only on tier 3; tiers 1–2 rely on the plates' mipmaps.

### 6.3 Scene registry: `src/components/three/film/registry.ts`

```ts
export type SceneSource = {
  id: SceneId;
  kind: "sequence" | "archive" | "solid";
  // Returns the textures the composite samples for this scene at local progress t.
  sample(t: number): { tex: THREE.Texture | null; next: THREE.Texture | null; frac: number; res: [number, number]; pan: [number, number] };
  product?(t: number): { tex: THREE.Texture | null; next: THREE.Texture | null; frac: number; rect: [number, number, number, number]; alpha: number };
  prefetch(priority: "high" | "low"): void;   // queue its assets
  release(): void;                            // close bitmaps, dispose textures (scenes ≥ 2 steps away)
};
export const REGISTRY: Record<SceneId, (q: Quality) => SceneSource>;
```
- `s01`, `s03`, `s04`: `SequenceSource(manifest[id][q.set])`.
- `s05`: `SequenceSource(manifest.s05bg[q.set])` for the painted ground + `product()` built from two players (03 SEQ-S05ARC, SEQ-S05H3):
  - **Arc:** `SequencePlayer(manifest.s05arc[q.set === "s" ? "m" : q.set])`, 13 frames = 0°…12°. Visible across S05 local **0.10–0.85** (03), `alpha = smoothstep(0.10, 0.16, t)`; the ring band (local 0.00–0.08) is over before it shows. Angle frame `f = smoother(clamp((t − 0.10)/0.75)) × 12`, `i = floor(f)`, `frac = f − i` (crossfade to `i+1`). It must stay in lockstep with the bg: bg frame = `round(smoother(clamp((t − 0.10)/0.75)) × (bgCount − 1))` for t ≥ 0.10, frame 0 before. `rect` = `uProdRect` from `assets-src/s05/layout.json` (the arc frames are full-canvas 1600×900 / 720×1280 RGBA, so the default rect is `[0, 0, 1, 1]`).
  - **H3 (conditional):** if `manifest.s05h3` exists, arc set B is shipped (Mezhu Thailam absent) and H3 plays across S05 local **0.80–0.95**: frame `round(clamp((t − 0.80)/0.15) × 23)`, drawn in the sub-rect `uH3Rect` (from `layout.json`, screen UV) over arc frame 12; for t > 0.95 hold H3 frame 23 (which equals set-A angle 12, 03). If `s05h3` is absent, set A ships and `uH3A = 0`.
  - **Push-in:** both layers and the bg scale together by `1 + 0.03 × smoother(t)` about the screen centre (01 §2.6 "3% push-in"; 03 SEQ-S05BG). Applied in the shader by scaling `uv` about 0.5 before `coverUv` and before the product rect lookup.
  - If `manifest.s05arc` is empty (N2 missing), `product()` returns `alpha: 0` and S05 shows the bg only; `s05.head` and the product names stay in HTML.
- Transition origins: `RING_ORIGIN` is in image UV (y down). Convert once when building uniforms: `uOrigin = [x, 1 − y]`. `BURN_ORIGIN` is already screen UV with y up.
- `s02`: `ArchiveSource` → `tex = archiveRT.texture`, `next = same`, `frac = 0`, `res = canvas px`, `pan = [0,0]`.
- `handoff`: `SolidSource` → no texture; the composite uses `uBg`.

Sequence frame mapping: `f = t × (count − 1)`, `i = floor(f)`, `frac = f − i`; if frame `i+1` is not decoded yet, `frac = 0`; if frame `i` is not decoded, use the nearest decoded index (search outward, max ±16), never black.

### 6.4 `src/lib/film/sequence.ts` — the image-sequence player

```ts
export class SequencePlayer {
  constructor(opts: { base: string; count: number; w: number; h: number; lruSize: number; window: [number, number]; queue: AssetQueue });
  want(index: number, direction: 1 | -1): void;  // reprioritise fetch + decode around index
  texture(index: number): THREE.Texture | null;  // decoded & uploaded, or null
  nearest(index: number): number;                // nearest decoded index, -1 if none
  dispose(): void;                               // close all bitmaps, dispose textures, cancel queued jobs
}
```
Internals:
- **Fetch order (progressive temporal refinement):** strides 16 → 8 → 4 → 2 → 1 over the whole sequence, then the active window first at each stride.
- **Blob store:** `Map<number, Blob>` per player, shared cap `quality.blobCapMB` across players (60 MB desktop, 30 MB mobile, 15 MB tier 1); evict blobs of the scene farthest from the current one first.
- **Decode window:** frames `[i − behind, i + ahead]` (desktop `[4, 8]`, mobile `[3, 6]`, mirrored when scrolling backwards) are decoded with `createImageBitmap(blob, { imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none" })`. Decoded bitmaps live in an LRU of `quality.lruSize` (16 desktop ≈ 92 MB CPU, 12 mobile ≈ 44 MB, 8 tier 1). `bitmap.close()` on eviction.
- **Texture pool:** 3 `THREE.Texture` objects per player (`colorSpace = SRGBColorSpace`, `flipY = false`, `generateMipmaps = false`, `minFilter = magFilter = LinearFilter`, `wrapS = wrapT = ClampToEdgeWrapping`). Map frame index → pooled texture. When frame `i+1` becomes `i`, reuse its texture (no re-upload). Upload = `tex.image = bitmap; tex.needsUpdate = true` only when a pooled texture is assigned a new frame. Same-size uploads use `texSubImage2D` in three r187.
- **Activation:** a player is active only while its scene is A or B, or within `±0.03` progress of its band. Inactive players keep blobs but drop textures and bitmaps.
- **Timing marks:** `performance.mark/measure` around decode and upload (`film:decode`, `film:upload`), read by the perf probe.

### 6.5 `src/lib/film/assets.ts` — the asset queue

```ts
export type Job = { url: string; scene: SceneId; priority: "high" | "low"; kind: "frame" | "ktx2" | "glb" | "image" | "audio"; bytes?: number };
export class AssetQueue {
  constructor(concurrency: 1 | 2 | 4);
  push(job: Job): Promise<Blob>;      // dedupes by url
  reprioritise(currentScene: number): void;  // drops queued (not in-flight) jobs for scenes ≥ 3 steps away; high-priority jobs for scene+1 go first
  cancelScene(scene: SceneId): void;
  stats(): { inFlight: number; queued: number; bytesLoaded: number };
}
```
- Uses `fetch(url, { priority: job.priority, cache: "force-cache" })`.
- Concurrency: 4 desktop, 2 mobile, 1 when `navigator.connection?.effectiveType === "3g"`.
- In-flight budget: ≤ 8 MB desktop / ≤ 4 MB mobile of queued bytes (from the manifest's byte arrays).

### 6.6 Video scrubbing (decision record)

No `<video>` or `VideoTexture` is used in the film. Reasons: async seeks on iOS Safari, all-intra encodes would be 2–4× larger than a GOP encode and close to the WebP set, and reverse scroll is expensive (tech-feasibility §4.3). Video is used only:
1. as pipeline-A output (5 s, 24 fps MP4 from image-to-video), turned into frames by `scripts/film/extract-frames.mjs`;
2. nowhere else: nothing autoplays (01 §7 item 10).
If a future trailer MP4 is made, add `VideoObject` JSON-LD then, not before.

### 6.7 Composite shader: `src/components/three/film/Composite.tsx` + `shaders/`

- One `THREE.Mesh` with a full-screen triangle (`BufferGeometry` with positions `[-1,-1, 3,-1, -1,3]`, uv `[0,0, 2,0, 0,2]`), `frustumCulled = false`, in `compositeScene`, drawn with `OrthographicCamera(-1, 1, 1, -1, 0, 1)`.
- `THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false, toneMapped: false })`. **Write GLSL ES 1.0 syntax** (`varying`, `texture2D`, `gl_FragColor`); three's ShaderMaterial converts it for WebGL 2. End the fragment shader with `#include <colorspace_fragment>` so linear output is encoded to sRGB.
- Defines: `FBM_OCT` = `quality.fbmOctaves` (4 or 2); `SOBEL` defined only when `quality.sobel`.
- Files: `shaders/common.glsl.ts` (hash, bayer4, noise via texture, fbm, coverUv, luma, grade, smoother), `shaders/paper.glsl.ts` (paper + dapple), `shaders/transitions.glsl.ts` (the five modes), `shaders/composite.frag.glsl.ts` (main), `shaders/fullscreen.vert.glsl.ts`. Each exports a template string; `composite.frag` concatenates them.

#### 6.7.1 Uniforms

| Uniform | Type | Set from | Value / range |
|---|---|---|---|
| `uA`, `uANext` | sampler2D | registry `sample()` of scene A | sequence frames or archive RT |
| `uAFrac` | float | sample | 0..1 frame blend |
| `uAKind` | int | SCENES | 0 sequence, 1 archive, 2 solid |
| `uARes` | vec2 | sample | texture px (archive: canvas px) |
| `uAPan` | vec2 | sample | cover-fit pan, −1..1 (0 = centre) |
| `uAGrade` | vec4 | GRADE | lift, gamma, gain, saturation |
| `uAProd` | float | `product()` alpha of A | 0..1 |
| `uB…` | same set for scene B | | |
| `uProd`, `uProdNext` | sampler2D | S05 product layer | RGBA, straight alpha |
| `uProdFrac` | float | | 0..1 |
| `uProdRect` | vec4 | `product()` | x, y, w, h in frame UV; default `(0, 0, 1, 1)` because arc frames are full-canvas (03 SEQ-S05ARC); mapped through the same `coverUv` as the bg so products stay locked to the teak |
| `uH3`, `uH3Next` | sampler2D | S05 H3 player | RGBA sub-rect frames |
| `uH3Rect` | vec4 | `layout.json` | x, y, w, h of the H3 sub-rect in frame UV |
| `uH3A` | float | `product()` | 0 or 1 (1 only when `s05h3` ships and S05 local ≥ 0.80) |
| `uPush` | float | S05 | `1 + 0.03 × smoother(localS05)`, 1 elsewhere |
| `uFade` | float | S01 | 1 → 0 across S01 local 0.00–0.12 (`mix(col, uNight, uFade)`) |
| `uNight` | vec3 | `--film-night` | linear `(0.0014, 0.0034, 0.0022)` |
| `uMode` | int | TRANSITIONS | 0 none, 1 inkBleed, 2 emberBurn, 3 displace, 4 spiralRing, 5 closingBurn |
| `uMix` | float | `resolve().mix` | 0..1, already smoother-eased |
| `uOrigin` | vec2 | RING_ORIGIN / BURN_ORIGIN | screen UV |
| `uRes` | vec2 | canvas size × DPR | px |
| `uTime` | float | `clock.elapsedTime % 1000` | s |
| `uSeed` | float | updated at 24 Hz | `floor(time × 24)` |
| `uGrain` | float | SCENES (mixed by uMix) | 0.018 / 0.028 / 0 |
| `uVignette` | float | SCENES (mixed) | 0.30 dark / 0 parchment |
| `uScrim` | float | SCRIM | 0..0.18 |
| `uScrimColor` | vec3 | color.ts | linear of `oklch(0.70 0.02 70)` = `(0.3851, 0.3350, 0.2847)` |
| `uPaper` | vec3 | color.ts `--film-parchment` | linear `(0.8209, 0.7181, 0.5553)` |
| `uSepia` | vec3 | `--film-sepia` | linear `(0.0501, 0.0207, 0.0085)` |
| `uEmber` | vec3 | `--film-ember` | linear `(0.9927, 0.3358, 0.0531)` |
| `uChar` | vec3 | `oklch(0.20 0.03 50)` | linear `(0.0152, 0.0060, 0.0028)` |
| `uGilt` | vec3 | constant | `(1.0, 0.82, 0.45)` |
| `uBg` | vec3 | `--bg` of the current theme, read on mount and on the `avvvs:theme` event | light `(0.9357, 0.9278, 0.8965)`, dark `(0.0041, 0.0065, 0.0055)` |
| `uPap` | vec4 | constant | pulp 0.115, fibre 0.055, tooth 0.038, fleck 0.55 |
| `uDapple` | vec4 | constant | depth 0.085, rake 0.35, speed 2.6, scale 2.6 |
| `uNoise` | sampler2D | `/film/tex/film-noise-512.png` (03 TEX-NOISE) | 512² RGBA: R = 4-octave fBm, G = second fBm (offset 19), B = white hash; `RepeatWrapping`, `LinearFilter`, no mips, `NoColorSpace` |

`src/lib/film/color.ts` exports `oklchToLinear(l, c, h): [r, g, b]` (OKLab → linear sRGB matrices, the same maths as the CSS spec) and the constants above computed from the 01 §3.3 tokens at module load. `uBg` reads the CSS custom property: `getComputedStyle(document.documentElement).getPropertyValue("--bg")` returns `oklch(…)`; parse the three numbers with a regex and convert. No hex values anywhere in components.

#### 6.7.2 Building blocks (GLSL; tune values only through uniforms)

```glsl
// common
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float bayer4(vec2 fc){ vec2 p = mod(floor(fc), 4.); float i = p.x + p.y*4.;
  // 4x4 ordered matrix /16, written as a lookup of 16 constants
  ... return v/16.; }
float vnoise(vec2 p){ return texture2D(uNoise, p/512.).r; }            // TEX-NOISE R channel, REPEAT
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<FBM_OCT;i++){ s+=a*vnoise(p*64.); p*=2.03; a*=.5; } return s; }
float luma(vec3 c){ return dot(c, vec3(.2126,.7152,.0722)); }
vec2 coverUv(vec2 uv, vec2 tex, vec2 pan){
  float ca = uRes.x/uRes.y, ta = tex.x/tex.y;
  vec2 s = ca > ta ? vec2(1., ta/ca) : vec2(ca/ta, 1.);
  return uv*s + (1.-s)*(.5 + .5*pan);
}
vec3 grade(vec3 c, vec4 g){ c = c*g.z + g.x*(1.-c); c = pow(max(c, 0.), vec3(1./g.y)); return mix(vec3(luma(c)), c, g.w); }

// paper (S02 sheet), from 01 §2.4 / pear-teardown §4.4 item 6, our own implementation
vec3 paper(vec2 uv){
  vec2 pw = uv*vec2(uRes.x/uRes.y, 1.);
  float pulp = fbm(pw*1.7) - .5;
  float fa = fbm(vec2(pw.x*24., pw.y*2.1)) - .5;
  float fb = fbm(vec2(pw.x*2.8, pw.y*38.)) - .5;
  float tooth = hash(floor(gl_FragCoord.xy)) - .5;
  float fleck = smoothstep(.981, 1., hash(floor(gl_FragCoord.xy/3.) + 11.));
  vec3 p = uPaper*(1. + pulp*uPap.x + fa*uPap.y + fb*.03 + tooth*uPap.z);
  p.b *= 1. - pulp*.196; p.r *= 1. + pulp*.035;
  return mix(p, p*.7, fleck*uPap.w);
}
float dapple(vec2 uv){
  vec2 q = uv*uDapple.w; float T = uTime*uDapple.z*.1;
  float d = sin(q.x*3.1 + sin(q.y*2.3 + T*.31)*1.8) + sin(q.y*2.7 + sin(q.x*1.9 - T*.24)*1.4);
  return smoothstep(.25, 1.85, d);
}
vec3 lit(vec3 c, vec2 uv){ float rake = uv.x*.62 + uv.y*.38 - .5; return c*(1. + rake*uDapple.y - dapple(uv)*uDapple.x); }

// one scene slot → colour (graded), product mask out
vec3 slot(int kind, sampler2D t, sampler2D tn, float frac, vec2 res, vec2 pan, vec4 g, float prodA, vec2 uv, out float pm){
  pm = 0.;
  if (kind == 2) return uBg;                                   // solid (hand-off)
  if (kind == 1) {                                             // archive: paper + RT over, then dapple light
    vec4 r = texture2D(t, uv);                                 // premultiplied RT
    vec3 c = r.rgb + paper(uv)*(1. - r.a);
    return grade(lit(c, uv), g);
  }
  vec2 tuv = coverUv(uv, res, pan);
  vec3 c = grade(mix(texture2D(t, tuv).rgb, texture2D(tn, tuv).rgb, frac), g);
  if (prodA > 0.) {                                            // S05 product layer: never graded
    vec2 puv = (uv - uProdRect.xy)/uProdRect.zw;
    if (all(greaterThanEqual(puv, vec2(0.))) && all(lessThanEqual(puv, vec2(1.)))) {
      vec4 pr = mix(texture2D(uProd, puv), texture2D(uProdNext, puv), uProdFrac);
      pm = pr.a*prodA; c = mix(c, pr.rgb, pm);
    }
  }
  return c;
}
```

#### 6.7.3 The transition library (`shaders/transitions.glsl.ts` + `src/lib/film/transitions.ts`)

`transitions.ts`:
```ts
export type TransitionMode = "none" | "inkBleed" | "emberBurn" | "displace" | "spiralRing" | "closingBurn";
export const MODE_INDEX = { none: 0, inkBleed: 1, emberBurn: 2, displace: 3, spiralRing: 4, closingBurn: 5 } as const;
export const TRANSITIONS: Record<`${SceneId}>${SceneId}`, { mode: TransitionMode; origin?: "ring" | "burn" }> = {
  "s01>s02": { mode: "inkBleed" },
  "s02>s03": { mode: "emberBurn", origin: "burn" },
  "s03>s04": { mode: "displace" },
  "s04>s05": { mode: "spiralRing", origin: "ring" },
  "s05>handoff": { mode: "closingBurn" },
};
```
Each mode is used once (01 §2.8). Reference GLSL (A = outgoing, B = incoming, `t = uMix`):

| Mode | Recipe |
|---|---|
| 1 **inkBleed** (S01→S02) | `float conv = 1. - smoothstep(t*1.2 - .2, t*1.2, fbm(uv*3.))` (fBm front, scale 3.0, edge 0.10·2). Edge map: with `SOBEL`, 3×3 Sobel on `luma(texture2D(uA, coverUv(uv,…)))` at 1.5 px steps, `ink = smoothstep(.42, .46, length(g)*4.)`; without `SOBEL`, `ink = 1. - smoothstep(.18, .30, luma(A))` (dark veins only). `float inkFade = 1. - smoothstep(.7, 1., t)` (venation goes last). `vec3 inked = mix(colB, uSepia, ink*inkFade)`. `col = mix(colA, inked, conv)`. |
| 2 **emberBurn** (S02→S03) | `vec2 q = (uv - uOrigin)*vec2(uRes.x/uRes.y, 1.)`; `float f = length(q)/maxCornerDist + (fbm(uv*4.) - .5)*.295` (oval front, lobes 0.295); `float e = t*1.35`. Inside (`f < e`) → B. Char band ahead of the front: `float ch = 1. - smoothstep(0., .31*.25, f - e)`, applied as `colA = mix(colA, uChar, step(bayer4(gl_FragCoord.xy), ch)*ch)`. Ember line: `float line = 1. - smoothstep(0., .0104, abs(f - e))`; `col += uEmber*line*(.8 + .2*sin(uTime*1.4 + uv.x*10.))`. |
| 3 **displace** (S03→S04) | `float n = fbm(uv*3.), n2 = fbm(uv*3. + 19.); vec2 d = vec2(n - .5, n2 - .5); float m = smoothstep(n - .1, n + .1, t*1.25 - .12); col = mix(slotA(uv + d*.22*t), slotB(uv - d*.22*(1. - t)), m);` |
| 4 **spiralRing** (S04→S05) | Aspect-corrected distance from `uOrigin` normalised by the farthest corner, `θ = atan(q.y, q.x)`, `r += .06*sin(3.*θ + .3*uTime) + .04*sin(5.*θ - .2*uTime)`, `e = t*1.15`. Inside `r < e - .04` → B; outside `r > e + .04` → A. Crest (`abs(r - e) < .04`): snap the sampling UV to a block grid, `cell = t < .5 ? 24. : 8.` px: `uvs = (floor(uv*uRes/cell) + .5)*cell/uRes`; R/B split ±0.004 along the radial direction; choose A or B per pixel with `bayer4 < (e - r + .04)/.08`; gilt screen flare: `col = 1. - (1. - col)*(1. - uGilt*.35*crestMask)`. |
| 5 **closingBurn** (S05→hand-off) | `float f = uv.y + (fbm(uv*3.) - .5)*.06 + (hash(gl_FragCoord.xy) - .5)*.017`, `e = t*1.12 - .06`. Below the front (`f < e`) → B (`uBg`). Char band 0.05 above the front toward `uChar` with Bayer stipple; ember line 0.0104 wide as in mode 2. |

Main:
```glsl
void main(){
  vec2 uv = vUv; float pmA, pmB; vec3 col;
  if (uMode == 3) { /* displace samples slots at displaced uvs */ }
  else {
    vec3 a = slot(uAKind, uA, uANext, uAFrac, uARes, uAPan, uAGrade, uAProd, uv, pmA);
    if (uMode == 0) col = a; else { vec3 b = slot(uBKind, uB, uBNext, uBFrac, uBRes, uBPan, uBGrade, uBProd, uv, pmB); col = transition(a, b, uv); }
  }
  float pm = max(pmA, pmB);                                   // product pixels get no grain/vignette/scrim
  col *= mix(vec3(1.), uScrimColor/.698, uScrim*(1. - pm));
  float v = smoothstep(.35, 1.2, length((uv - .5)*vec2(uRes.x/uRes.y, 1.)));
  col *= 1. - uVignette*v*(1. - pm)*.5;                        // ≈ −0.3 EV at the corners
  col += (hash(floor(gl_FragCoord.xy) + uSeed) - .5)*uGrain*(1. - pm);
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}
```

**Final sequence branch of `slot()`**: replace the lines from `vec2 tuv = coverUv(...)` to `return c;` in the block above with this version, which adds the S01 fade-up, the S05 push-in, the full-canvas arc layer and H3:
```glsl
vec2 suv = (uv - .5) / uPush + .5;                       // S05 push-in (uPush = 1 elsewhere)
vec2 tuv = coverUv(suv, res, pan);
vec3 c = grade(mix(texture2D(t, tuv).rgb, texture2D(tn, tuv).rgb, frac), g);
if (prodA > 0.) {                                        // arc layer, full-canvas, same cover mapping as the bg
  vec2 puv = (tuv - uProdRect.xy) / uProdRect.zw;
  vec4 pr = mix(texture2D(uProd, puv), texture2D(uProdNext, puv), uProdFrac);
  if (uH3A > 0.) {                                       // H3 sub-rect over arc frame 12
    vec2 huv = (tuv - uH3Rect.xy) / uH3Rect.zw;
    if (all(greaterThanEqual(huv, vec2(0.))) && all(lessThanEqual(huv, vec2(1.)))) {
      vec4 h = mix(texture2D(uH3, huv), texture2D(uH3Next, huv), uH3Frac);
      pr = vec4(mix(pr.rgb, h.rgb, h.a), max(pr.a, h.a));
    }
  }
  pm = pr.a * prodA; c = mix(c, pr.rgb, pm);
}
c = mix(c, uNight, uFade);                               // S01 fade-up (uFade = 0 elsewhere)
return c;
```
(`uH3Frac` float: frame blend for H3, same rule as `uAFrac`.) Product pixels are composited after `grade()`, so they are never graded (01 §2.2), and `pm` keeps grain, vignette and scrim off them.

**Shader acceptance (T6):** at `uMix = 0` and `uMix = 1` the output equals A and B exactly (`gl.readPixels` on a 4×4 grid, max channel diff ≤ 1/255 with grain set to 0); no straight wipe edge in any mode; no region flashes (> 0.1 L change more than 3× per second, 01 §7 item 5); desktop composite pass ≤ 2.0 ms GPU at 1440×900 × DPR 1.5 (Chrome Performance → GPU track), tier 1 ≤ 4.0 ms at 390×844 × DPR 1.

### 6.8 `PowderFx.tsx` (S03 only)

- `THREE.Points` with `BufferGeometry` of `count` vertices (4000 tier 3, 1500 tier 2, 0 tier 1); attributes `aSeed` (vec3 random), `aSize` (1.5–3.0 px × DPR).
- Vertex shader: position = seed spread in a 1.2 × 0.8 × 0.6 box, advected by 2D curl noise of `uTime × 0.04` and S03 local progress `uT` (the fall: `y −= uT × 0.6 × (0.5 + seed.y)`).
- Fragment: round point (`smoothstep(.5, .35, length(gl_PointCoord - .5))`), colour linear of `oklch(0.85 0.04 80)` = `(0.7138, 0.6003, 0.4397)`, opacity `0.55 × smoothstep(0.15, 0.25, uT) × (1 − smoothstep(0.70, 0.80, uT)) × (1 − bandMix)`. `blending = NormalBlending`, `depthTest = false`, `transparent = true`. No additive blending, no glow (A12).
- One draw call.

---

## 7. S02 Botanical archive (real-time scene)

### 7.1 Plates data (`src/content/plates.ts`)

Exactly the rows of 01 §5.2, ring order, ids = 03 slugs: **1 `vitex-negundo` (Nirgundi), 2 `ricinus-communis` (Eranda), 3 `sesamum-indicum` (Tila), 4 `curcuma-longa` (Haridra), 5 `zingiber-officinale` (Shunti, ginger, always last)**; `withania-somnifera` is inserted at position 5 (ginger moves to 6) only when N4 is resolved. Each row: `{ id, common, ml?, mlVerified: boolean, sanskrit, binomial, reference, productHandles: string[], note, noteSource, source: { title, url, licence }, aspect, annotations }`. `ml` renders only when `mlVerified === true` (N6). Build check in `plates.test.ts`: ids are unique, ginger is last, every `productHandles` entry exists in `catalogue.generated.json`, every plate has a `credits.ts` entry, and `npm run check:claims` passes on `note`.

### 7.2 Layout and choreography (`src/lib/film/s02-layout.ts`)

Units are metres in the archive scene. Plate height `H = 1.4`, width `W = H × aspect`.

| Constant | Wide (aspect ≥ 1) | Narrow (portrait) |
|---|---|---|
| Camera fov (vertical) | 28° | 40° |
| Camera rest position / target | `(0, 0.15, 6.0)` → `(0, 0, 0)` | `(0, 0.35, 6.0)` → `(0, 0.35, 0)` |
| Camera focus position / target | `(−0.45, 0.05, 3.2)` → `(−0.45, 0, 0)` | `(0, 0.35, 3.4)` → `(0, 0.35, 0)` |
| Ring group position | `(−0.9, 0, −2.4)` (front plate lands at x −0.9, z 0) | `(0, 0.35, −2.4)` |
| Ring radius | 2.4 | 2.4 |
| Angular step between plates | 36° | 36° |
| Text column (HTML) | x 0.58–0.94 of the viewport | y 0.66–0.92 |

Ring rotation for plate `k` facing the camera: `θ_k = −k × 36°`. Each plate is oriented to face the ring centre outward (its normal points along the radius).

Scene-local schedule (N = plate count, 5 or 6):

| Local range | What happens |
|---|---|
| 0.00–0.08 | Ink-bleed band from S01. Plates hidden (`uSoak = 0`). |
| 0.04–0.10 | All plates soak in: `uSoak` 0 → 1 (soak mask from each plate's centre, fBm brushed edge 0.06). |
| 0.08–0.80 | Plate dwells. Segment length `L = 0.72/N`; plate `k` owns `[0.08 + kL, 0.08 + (k+1)L]`. Inside a segment (segment-local `u`): 0.00–0.25 rotate the ring to `θ_k` (ease in-out cubic); 0.25–0.40 dolly rest → focus, plate `k` `uFocus` 0 → 1, others stay 0; **0.40–0.80 hold** (camera still; DOM annotations and names show: cue `s02.plate.<id>` in at u 0.40, out at u 0.80); 0.80–1.00 dolly focus → rest. The last plate skips the dolly back. |
| 0.80–0.86 | Ginger plate: `uDissolve` 0 → 1 (paper burns away in fBm cells; ink lines go last). |
| 0.82–1.00 | Specimen GLB fades in (opacity 0 → 1 over 0.82–0.86) and turns Y 0° → 35°, X tilt 0° → 8°. |
| 0.88–1.00 | Ember-burn band into S03 (origin `BURN_ORIGIN`). |

Unfocused plates: darken 12%, desaturate 30%, no blur (01 §2.6).
Shadows: one `PlateShadow` per plate: a quad 6% larger than the plate, offset by (0.6%, −1.2%) of frame in screen terms (≈ `(0.036, −0.05, −0.02)` in plate space at rest distance), using a 64×64 `CanvasTexture` of a blurred rectangle generated once in code, opacity 0.18, `depthWrite: false`.

`projectPlateUv(uv: [number, number], layout: "wide" | "narrow", viewport: { w: number; h: number }): { x: number; y: number }` — pure maths using the focus camera above, so `FilmOverlay` positions the DOM leader lines once per hold window and on resize (not per frame). Unit-test it against a three.js projection in `s02-layout.test.ts` (max error 1 px at 1440×900 and 390×844).

### 7.3 `PlateMesh.tsx`

- `PlaneGeometry(W, H, 24, 30)`; vertex shader adds paper curl: `pos.z += uCurl × (pos.x / (W/2))² × 0.06` with `uCurl = 1` (plates look like real sheets), plus `pos.z += sin(pos.y × 2.1 + index) × 0.008`.
- Fragment (plate = backing paper + ink + annotations):
  `vec3 paperC = uPaper * (0.94 + 0.06 * dot(normalize(vec3(texture2D(uPaperN, vUv*2.).rg*2.-1., 1.)), normalize(vec3(-.6,.7,.4))))` (paper-normal lit by the upper-left key);
  `float ink = texture2D(uInk, vUv).a` (ink-alpha KTX2, RGB = ink colour);
  `vec3 c = mix(paperC, texture2D(uInk, vUv).rgb, ink * uSoak)`;
  `vec4 an = texture2D(uAnnot, vUv); c = mix(c, an.rgb, an.a * uAnnotA)` (`uAnnotA` 0 → 1 over 600 ms when the hold window starts, time-based, reversed on exit);
  focus: `c = mix(desat(c, .30)*.88, c, uFocus)`; dissolve: `float d = fbm(vUv*6.); if (d < uDissolve - .02 * (1. - ink)) discard;` so paper goes first and ink lines last; the paper edge within 0.02 of the front darkens toward `uSepia`. Output premultiplied into the archive RT.
- Textures: `useKTX2(url, "/decoders/basis/")` for `ink` and `paper-normal` at `quality.plateTex` (2048 / 1024 for ink, 1024 / 512 for paper normal); `useTexture` (drei) for the `annot` WebP and for the `inkFallback` WebP when KTX2 could not be built.
- Draw calls in S02: N plates + N shadows + specimen (≤ 3 meshes) ≤ **15** (budget 30).

### 7.4 `Specimen.tsx`

- Tier ≥ 2: `useGLTF(url, false, true, (loader) => loader.setKTX2Loader(ktx2))` where `ktx2` comes from `src/components/three/film/loaders.ts` (`new KTX2Loader().setTranscoderPath("/decoders/basis/").detectSupport(gl)`, created once). URL: `/film/s02/specimen/zingiber-officinale-d.glb` (tier 3) or `-m.glb` (tier 2). Requested only when S02 local ≥ 0.40 (§13).
- Lighting inside the archive scene (03 §2.7: no HDRI is served): environment = PMREM of `RoomEnvironment` (`three/examples/jsm/environments/RoomEnvironment.js`, `new PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture`, generated once, 0 bytes downloaded) assigned to `archiveScene.environment` with `environmentIntensity = 0.5`, plus one `directionalLight` from upper left (`position (−3, 4, 3)`, intensity 1.4, colour linear of 4300 K ≈ `(1.0, 0.86, 0.72)`), no shadows. Specimen materials keep `toneMapped: true` and the renderer's tone mapping stays `NoToneMapping` (`flat`), so set `material.envMapIntensity` and light intensity in `/dev/film-lab` until the rhizome's mean L at S02 local 0.95 is 0.55 ± 0.05; plates are `toneMapped: false`.
- Size: normalised so the rhizome's longest axis = 1.1 m; centred at the ginger plate's centre; `position.z = +0.15` in front of the plate.
- Tier 1: `SpecimenTurntable` = a plane with the 24-frame RGBA WebP sequence SEQ-S02TURN (`/film/s02turn.<hash>/l/` 1280×720 on wide layouts, `/p/` 720×1280 on narrow), a full 360° turn in 15° steps; `f = turnDeg / 15` where `turnDeg` is the same 0° → 35° the GLB would turn; show frame `floor(f)` crossfaded with `floor(f) + 1` by `fract(f)` (frames 0–3 are used; 03 renders the full turn, which costs nothing extra to keep).

### 7.5 Inspect mode (optional, brief S02)

`PlateInspectButton` (in each plate figure, visible during the hold window, 44×44 px minimum, label "Inspect {common}") → `PlateInspect` opens a native `<dialog>` with the plate's `-2048.avif`, names, reference, note, and a "Return to film" button. Opening: `film.setPaused(true)`, `getLenis()?.stop()`. Closing (button, Esc, backdrop click): `film.setPaused(false)`, `lenis.start()`, focus returns to the trigger. The dialog has `data-lenis-prevent`. Image zoom: CSS `transform: scale()` 1–3× with pointer/wheel, same mechanics as the store's LabelViewer (reuse its hook `useZoomPan` from `src/components/store/LabelViewer.tsx` once S3 exists; until then write it in `src/components/ui/useZoomPan.ts` and have LabelViewer import it).

---

## 8. Scene DOM, CSS and modes (`src/app/styles/film.css`)

```css
.film { position: relative; height: calc(var(--film-len) * 1svh); }
:root { --film-len: 1400; }
@media (max-width: 767px) { :root { --film-len: 1000; } }
.film__stage { position: sticky; top: 0; height: 100svh; margin-bottom: -100svh; overflow: hidden; background: var(--film-night); z-index: 0; pointer-events: none; }
.film__scene { position: absolute; left: 0; right: 0; top: calc(var(--start) * 100%); height: calc((var(--end) - var(--start)) * 100%); z-index: 1; }
.film__copy  { position: sticky; top: 0; height: 100svh; }      /* copy zones per 01 §2.7 inside */
.film__still { display: none; }

/* static mode: a stack of normal sections */
:root[data-film="static"] .film { height: auto; }
:root[data-film="static"] .film__stage { display: none; }
:root[data-film="static"] .film__scene { position: static; height: auto; }
:root[data-film="static"] .film__copy { position: static; height: auto; }
:root[data-film="static"] .film__still { display: block; }
:root[data-film="static"] .film-plates { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr)); gap: var(--gap); }
```
- Each `FilmScene` sets `style={{ "--start": s.start, "--end": s.end }}` (numbers, not colours, so allowed inline).
- In `live` and `poster` mode the S02 `<figure>`s are visually hidden except the focused plate's text block (`.film-plates figure { position: absolute; opacity: 0 }`, and FilmOverlay reveals the active one). All text stays in the DOM and in reading order.
- `NOSCRIPT_FILM_CSS` (inside `<noscript>`) equals the static-mode rules with `:root` instead of `:root[data-film="static"]`.
- Copy positions (01 §2.7): wide: headline block bottom at 68% of the stage, x from `--margin` to 42% of the width; title (`h1`) baseline 8svh above the bottom; narrow: copy zone 10–40svh from the top.

---

## 9. Audio (`src/lib/film/audio.ts`, loaded only on the first "Sound on" click)

- `SoundToggle` is a `<button aria-pressed>` "Sound off" / "Sound on"; never saved (01 §6).
- First press: `import("@/lib/film/audio")` (a separate small chunk), create `AudioContext`, fetch the beds through the asset queue (`kind: "audio"`, priority low except the current scene's bed), decode with `decodeAudioData`, loop with 2 s equal-power crossfades.
- Graph: one `GainNode` per bed → master `GainNode` → destination. Master target −30 LUFS is baked into the files (§11.8); runtime master gain 1.0, fade in 3 s, fade out 0.6 s.
- Gains follow 01 §6 per scene-local progress, updated from `film.onTarget` (not per frame) with `gain.setTargetAtTime(v, ctx.currentTime, 0.15)`.
- Format choice: `new Audio().canPlayType('audio/ogg; codecs="opus"')` → `.opus`, else `.m4a`.
- Paused when `document.hidden`, SkipFilm, or static/poster mode.

---

## 10. Perf probe (`src/lib/film/perf-probe.ts`)

Enabled when `window.__AVVVS_PERF__ === true` (Playwright sets it with `addInitScript`) or the URL hash is `#perf` (read client-side only, so the route stays static). Never enabled otherwise; the module is imported dynamically by `FilmRuntime` only when enabled.

Collects per scene (`resolve(progress).a`):
- frame time from `useFrame` delta (ms): count, p50, p95, p99, max, frames > 20 ms, frames > 33.4 ms;
- `film:decode` and `film:upload` measures: p95;
- `PerformanceObserver({ type: "long-animation-frame", buffered: true })`: count and total blocking ms (Chromium only);
- `gl.info.render.calls`, `.triangles`, `gl.info.memory.textures`, `.geometries` (max per scene);
- `performance.memory.usedJSHeapSize` max (Chromium only).

Exposes `window.__filmPerf = { scenes: Record<SceneId, Stats>, report(): void /* console.table */, reset(): void }`.

---
