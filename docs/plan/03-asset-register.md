# 03 · Visual asset register: AVVVS film and site (v2)

Status: draft for client review, 2026-11-04 (rev. 2: file paths, noise, turntable, OG image and S05 product layer aligned with `04-technical-architecture.md`; packshot ground aligned with `05-store-revamp.md`).
Precedence: `docs/brief/creative-brief.md` > `docs/plan/01-creative-direction.md` > **this file** (what each asset is, looks like and weighs) = `04-technical-architecture.md` (where files live and how the runtime reads them) > `docs/research/*` > `PLAN.md` (v1).
Executor: Claude Sonnet 5.5 at medium effort, one work package at a time. Every number in this file is a target to meet, not a suggestion. When this file and 01 disagree on art, 01 wins. When this file and 04 disagree on a path, script name or runtime field, 04 wins. Report any conflict in the WP report. Known conflicts are listed in §5.4.

Inputs read in full: the brief, `01-creative-direction.md`, `04-technical-architecture.md` §1–§10, `05-store-revamp.md` (image rules), `docs/research/asset-sources.md`, `tech-feasibility.md`, `pear-teardown.md` §4–7, `design-system-proposal.md` §2 and §5, `store-revamp.md` §6 and §8, `src/content/catalogue.generated.json` (image URLs and sizes), `public/content/**` (measured with sharp on 2026-11-04).

Markers:
- **VERIFIED (source)**: read from the source page, API or file on 2026-11-04.
- **UNVERIFIED**: not checked. Do not ship until checked; each one is also listed in §5.
- **NEEDS-AVVVS**: AVVVS must supply or approve.

---

## 0. How to use this register

### 0.1 Column meanings
| Column | Meaning |
|---|---|
| id | Stable key. Use it in file names, `credits.ts`, `imagery-log.md` and commit messages. Prefixes: `SEQ` image sequence, `KF` generated keyframe (source only, never shipped), `PST` poster or still, `PLT` engraving, `SVG` vector artwork, `TEX` texture, `GLB` 3D model, `HDR` HDRI, `PRD` product photograph, `REF` reference photograph (never shipped), `PHO` site photograph, `AUD` audio, `FNT` font, `ICO` brand mark or icon, `GRD` colour-grade file. |
| status | **available** = the source exists today and can be fetched or used now (it may still need processing). **required** = it does not exist yet and must be produced or supplied. "conditional" in the description means it ships only if the stated condition is met. |
| owner | **Claude agent** (a Sonnet WP can do it with the repo tools and, where stated, the Higgsfield MCP). **AVVVS** (the client supplies or approves). **Photographer** (commissioned by AVVVS). **Arjun** (the developer; for downloads that need a personal free account, which agents must not create). **3D artist**, **Retoucher**, **Reader** (native Malayalam reader): paid humans, listed in §5.2. |
| target size | Per file unless it says "total". A build script fails if a file is more than 10% over (tech-feasibility §4.6). |

### 0.2 Folder layout (create exactly this; it is 04 §2 plus the source folders 04 leaves out)
`<hash8>` = the first 8 hex characters of the sha1 of the folder's (or file's) bytes, written by the build script into `src/lib/film/manifest.generated.ts`. Nothing in `src/` hard-codes a hashed path.
```
assets-src/                              git-ignored except where marked (committed)
  README.md                              (committed) where masters live, who owns them
  grade/avvvs-film-base.cube  avvvs-s01.cube  avvvs-s03.cube  avvvs-s04.cube  avvvs-s05-bg.cube   (committed)
  keyframes/<KF-id>/<d|m>/               v1.png … v4.png (every generation), chosen.png, upscaled.png, final.kra|psd, final.png
  clips/<scene>/<clip>-<d|m>-v<n>.mp4    pipeline A image-to-video output (04 §2)
  renders/<scene>/<d|m>/####.png         pipeline B Blender output (04 §2)
  frames/<scene>/<d|m|s>/####.png        graded, sized 16-bit PNG (04 §2)
  plates/raw/<slug>.jpg                  untouched downloads
  plates/<slug>.tif                      retouched plate masters (04 §2)
  plates/plates.json                     (committed) crop boxes, levels, source URLs, measured sizes
  s05/raw/                               photographer RAW + 16-bit TIFF selects (PRD-ARC-A/B, PRD-H3)
  s05/products/<A|B>/####.png            packshot arc + H3 frames, RGBA, cut out (04 §2)
  s05/camera.json                        (committed) packshot camera record (lens, height, angle per frame)
  refs/hands/  refs/vessels/  refs/vitex/  refs/specimen/   reference images (never shipped)
  glb/<asset>.glb                        Blender / Poly Haven exports (04 §2)
  blender/*.blend
  audio/raw/<freesound-id>.<ext>  audio/<bed>.wav    raw downloads, then 60 s masters
  fonts/                                 Boska-Light.otf (for next/og), IMFellEnglish-*.ttf
public/film/
  s01.<hash8>/{d,m,s}/0000.webp …        sequence frames (04 §2)
  s03.<hash8>/{d,m,s}/  s04.<hash8>/{d,m,s}/  s05.<hash8>/{d,m,s}/     (s05 = painted S05 ground only)
  s05p.<hash8>/{d,m}/0000.webp …         S05 product layer, RGBA (arc frames, then H3 frames if shipped)
  specimen-turntable.<hash8>/0000.webp … tier-1 ginger turntable, 24 frames, RGBA
  posters/<scene>-<d|m>.<hash8>.avif     scenes: s01open, s01, s02, s03, s04, s05
  plates/<slug>-2048.<hash8>.ktx2  <slug>-1024.<hash8>.ktx2  <slug>-2048.<hash8>.avif  <slug>-1024.<hash8>.webp
  glb/ginger-d.<hash8>.glb  ginger-m.<hash8>.glb
  tex/noise-256.png                      composite noise (04 §6.7.1)
  audio/<bed>.opus  <bed>.m4a            beds: s01-bed, s01-insects, s02-frogs, s02-paper, s34-water, s05-night
public/svg/binomial-<slug>.svg
public/brand/avvvs-logo.svg  avvvs-logo-cream.svg  avvvs-logo-ink.svg  avvvs-logo.png (existing, keep)
src/app/icon.svg  src/app/apple-icon.png  src/app/favicon.ico  src/app/opengraph-image.tsx
src/app/fonts/boska/Boska-Light.woff2  Boska-Regular.woff2  Boska-Italic.woff2  Boska-Medium.woff2  LICENSE.txt
scripts/film/extract-frames.mjs  build-frames.mjs  build-posters.mjs  build-plates.mjs  build-glb.mjs  build-audio.mjs
             build-noise.mjs  build-turntable.mjs  build-lut.mjs  qc-frames.mjs  check-budgets.mjs  make-placeholders.mjs
```
`build-noise.mjs`, `build-turntable.mjs`, `build-lut.mjs` and `qc-frames.mjs` are not in 04 §2's script list; add them beside the others with `package.json` scripts `film:noise`, `film:turntable`, `film:lut`, `film:qc`.

Plate file slugs (ring order) and their `plates.ts` ids (04 §7.1): `vitex-negundo` = `nirgundi`, `ricinus-communis` = `eranda`, `sesamum-indicum` = `tila`, `curcuma-longa` = `haridra`, `zingiber-officinale` = `shunti`; conditional `withania-somnifera` = `ashwagandha` (sits before ginger if it ships, 01 §5.2). 01 §5.2's working names (`s02-<slug>-2048.avif`, `-ink-2048.png`) are replaced by the 04 paths above; the ink PNG stays an intermediate in `assets-src/plates/`.

### 0.3 Frame and sequence constants (from tech-feasibility §2 and 01 §2.10)
- Generated keyframes: desktop **2560 × 1440** (16:9), phone **1440 × 2560** (9:16), generated separately, never cropped from each other.
- Generated clips: **5.0 s at 24 fps = 120 frames**, 1080p (1920 × 1080 desktop, 1080 × 1920 phone), one camera move each.
- Shipped frames, three sets (04 `Quality.set`):
  - `d` desktop **1600 × 900**, WebP quality 72, effort 6, `smartSubsample: true`, average ≤ **70 KB**.
  - `m` phone **720 × 1280** (portrait, from the separately generated 9:16 clips), same settings, average ≤ **45 KB**.
  - `s` small landscape for tier-1 wide viewports **960 × 540**, made from the `d` frames by taking every 2nd selected frame (index 0, 2, 4 …; the last frame is always included), quality 70, average ≤ **28 KB**. 04 references a §14.4 table that defines `s`, but that section is not written yet; until it is, this definition stands (decision D12).
- Frame selection from a 120-frame clip: index `round(i × 119 / (N − 1))` for `i = 0 … N − 1`, where N is the per-clip count in §2.1. Clips of one scene are concatenated in clip order and renumbered from `0000`.
- S01 has **4 clips** (wide drift, descent, hand, macro), not the 3 in 04 §5.1 `S01_CLIPS`. Desktop ranges: `wide [0, 23]`, `descent [24, 47]`, `hand [48, 71]`, `macro [72, 95]`; phone 16 per clip. The film WP updates `S01_CLIPS` to these four keys (§5.4 K2).
- Posters: desktop **1920 × 1080** AVIF ≤ **140 KB**, phone **828 × 1472** AVIF ≤ **90 KB**, AVIF quality 50, effort 6.
- No grain, vignette or canvas texture is baked into any frame or poster (01 C9, §2.4). This overrides asset-sources §3.4 steps 2–4.

---

## 1. Byte budget per scene (what the browser downloads)

`scripts/film/check-budgets.mjs` enforces the per-scene totals below (+10% tolerance) and exits 1 on an overrun.

| Scene | Desktop `d` | Phone `m` | Tier-1 wide `s` | Made of | Change from tech-feasibility §2 |
|---|---|---|---|---|---|
| S01 | 6.7 MB | 2.9 MB | 1.3 MB | SEQ-S01 (96 / 64 / 48 frames) | none |
| S02 | ≤ 3.3 MB | ≤ 1.4 MB | ≤ 0.8 MB | 5 plate KTX2 (2048 d / 1024 m, s) + ginger GLB (d, m; none on tier 1) | no HDRI (lit by an ambient + directional light, 04 §7.4, 0 bytes); no separate annotation or paper-normal textures (§2.4, §2.5) |
| S02 tier-1 specimen | — | 0.84 MB | 0.84 MB | SEQ-S02TURN (24 frames, 1024², tier 1 only, replaces the GLB) | none |
| S03 | 5.0 MB | 2.2 MB | 1.0 MB | SEQ-S03 (72 / 48 / 36) | none |
| S04 | 5.0 MB | 2.2 MB | 1.0 MB | SEQ-S04 (72 / 48 / 36) | none |
| S05 | ≤ 5.6 MB | ≤ 3.2 MB | ≤ 2.5 MB | SEQ-S05BG (40 / 28 / 20) + SEQ-S05P arc (13 / 13; `s` uses `m`, 04 §6.3) + H3 frames (24 / 24, conditional) | bg cut from 48 / 32 to 40 / 28; the 2.0 MB product GLB is replaced by photo arc frames. Net +0.2 MB desktop, +0.8 MB phone. Within the ≤ 8 MB / ≤ 4 MB in-flight cap (04 §6.5). Record in the WP report. |
| Posters (all) | ≤ 0.84 MB | ≤ 0.54 MB | uses `d` | 6 posters per device | — |
| Noise texture | ≤ 0.14 MB | same | same | TEX-NOISE | — |
| Audio (only after "Sound on") | ≤ 4.6 MB | same | not loaded (static/poster) | 6 beds, one format each (Opus, or AAC where Opus is not supported) | — |
| **Film total (without audio)** | **≈ 26.6 MB** | **≈ 12.6 MB** (tier 2; tier 1 phones add the 0.84 MB turntable and drop the GLB) | **≈ 8.4 MB** | streamed scene by scene (04 §6.4–6.5) | — |

---

## 2. The register

### 2.1 Image sequences (shipped)

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| SEQ-S01 | S01 forest descent | S01, film progress 0.00–0.14, scene-local 0.00–1.00 | Concatenation of clips s01a (wide drift, KF-S01-A → B, frames 0–23), s01b (descent, B → C, 24–47), s01c (hand H1 lifts and turns the leaf, C → D, 48–71), s01d (macro push, D → E, 72–95). Fade-up from black (01 §2.3) is applied at runtime in `Composite`, not baked. Path `public/film/s01.<hash8>/{d,m,s}/`. | WebP | d 1600×900 × **96** (24 per clip); m 720×1280 × **64** (16 per clip); s 960×540 × **48** | avg ≤ 70 / 45 / 28 KB; total 6.7 / 2.9 / 1.3 MB | generate (pipeline A, §6) or 3D artist render (pipeline B) | Generated with Higgsfield, paid plan; licence-back accepted (N3). Credit: "Selected painted scenes created with generative tools and retouched for AVVVS." Hand painted from reference photos of an AVVVS vaidyan, with consent (N1). | required | Claude agent (generation, grade, encode); AVVVS (approval) |
| SEQ-S03 | S03 rhizome to amber | S03, progress 0.46–0.60 | Clips s03a (rhizome splits, KF-S03-A → B), s03b (fragments become powder, B → C), s03c (powder settles, liquid warms clear → amber, C → D). Visual metaphor only (brief S03). The runtime powder (04 §6.8) is drawn over these frames in local 0.15–0.80, so frames keep powder sparse there. Path `public/film/s03.<hash8>/{d,m,s}/`. | WebP | d × **72** (24 per clip); m × **48** (16 per clip); s × **36** | avg ≤ 70 / 45 / 28 KB; total 5.0 / 2.2 / 1.0 MB | generate | as SEQ-S01 (no hand line) | required | Claude agent; AVVVS approval |
| SEQ-S04 | S04 uruli spiral | S04, progress 0.60–0.74 | Clips s04a (kindi pours amber into the uruli, spout enters from the upper left, no hands visible; KF-S04-A → B), s04b (hands H2 draw the spatula, spiral forms; B → C), s04c (hands withdraw, spiral holds; C → C-hold). The spiral centre in the last frame is the S04→S05 ring origin. Target, measured from the **top-left** of the frame: d **x 0.68, y 0.45**; m **x 0.50, y 0.66** (±0.03). Write it to `RING_ORIGIN` in `src/lib/film/timeline.ts` in 04's y-up UV: `d: [0.68, 0.55]`, `m: [0.50, 0.34]` (04's placeholder `m: [0.50, 0.66]` puts the origin in the phone copy zone; §5.4 K3). Re-measure on the shipped last frame and write the measured values. Path `public/film/s04.<hash8>/{d,m,s}/`. | WebP | d × **72**; m × **48**; s × **36** | avg ≤ 70 / 45 / 28 KB; total 5.0 / 2.2 / 1.0 MB | generate | as SEQ-S01 | required | Claude agent; AVVVS approval |
| SEQ-S05BG | S05 painted ground | S05, progress 0.74–0.92 | One clip s05bg from KF-S05-BG: 12° camera arc to the right (clockwise seen from above) around an empty teak table, forest-green ground, leaves only at the edges. Never contains a product. The 3% push-in is a runtime scale applied to bg and product layers together. Path `public/film/s05.<hash8>/{d,m,s}/` (04 calls this folder `s05`). | WebP | d × **40**; m × **28**; s × **20** | avg ≤ 70 / 45 / 28 KB; total 2.8 / 1.3 / 0.56 MB | generate | as SEQ-S01 | required | Claude agent |
| SEQ-S05P | S05 product layer (arc + optional H3) | S05 local 0.15–0.88 (04 §6.3 `product()`) | **Part 1, arc (13 frames):** real photographs of Rujanth Liniment (front, centre), Mezhu Thailam and Lakshol on a dark teak plank, cut out to alpha **with** their contact shadow (shadow alpha ≤ 0.6), 0° → 12° in 1° steps, matching the bg arc. **Part 2, H3 (24 frames, conditional on PRD-H3):** the vaidyan's right hand brings Mezhu Thailam in from the right, sets it beside Rujanth, and withdraws, all at the 12° angle; the arc in Part 1 then uses set B (Mezhu Thailam absent) and the last H3 frame equals set A angle 12. Every frame is a **full canvas** (1600×900 / 720×1280) RGBA image so one `SequenceSource` with one rect plays both parts. Frame-to-progress mapping: arc frames over local 0.15–0.78, H3 frames over 0.78–0.88; without H3, the 13 arc frames span 0.15–0.88 (04 §6.3 maps linearly over the whole range; §5.4 K4 asks the film WP to add this two-segment map). **Never graded, relit or repainted** (01 §2.2): only ±0.1 EV and dust removal. Path `public/film/s05p.<hash8>/{d,m}/`. If neither PRD-ARC set exists, the folder is empty and `product()` returns alpha 0 (04 §6.3); S05 then shows only the painted ground and the HTML product names. | WebP with alpha (`quality: 82`, `alphaQuality: 90`, `effort: 6`) | d 1600×900 × **13** (+ **24** H3); m 720×1280 × **13** (+ **24**), cropped from the same raw files | arc ≤ 110 KB d / ≤ 70 KB m per frame; H3 ≤ 60 / ≤ 40 KB (mostly transparent); total ≤ 2.8 / ≤ 1.9 MB | photograph (PRD-ARC-A/B, PRD-H3) | © AVVVS. Photographer assigns web usage rights to AVVVS in writing. Model release of the vaidyan for H3 (N1). | required | Photographer (shoot); Claude agent (cut-out, crop, encode) |
| SEQ-S02TURN | Ginger specimen turntable | S02 local 0.82–1.00, **tier 1 only** (04 §7.4) | 24 RGBA frames of GLB-GINGER on a transparent ground, turning **Y 0° → 35° with X tilt 0° → 8°** (the same move the real-time specimen makes, 04 §7.2), frame `k` at Y = k × 35°/23, X = k × 8°/23. Light: one directional key from upper left (three position (−3, 4, 3), 4300 K) + ambient 0.6, matching 04 §7.4, ACES tone mapping. Rendered by `scripts/film/build-turntable.mjs` (headless three r187 in Playwright Chromium, `preserveDrawingBuffer: true`, `toDataURL`) or by Blender CLI with the same camera (fov 28°, z 3.2). Path `public/film/specimen-turntable.<hash8>/0000.webp …`. | WebP with alpha | 1024×1024 × **24** | ≤ 35 KB each; total ≤ 0.84 MB | model (render of GLB-GINGER) | Model CC0 (Poly Haven `food_ginger_01`), courtesy credit | required | Claude agent |

### 2.2 Generated keyframe stills (source files only; never shipped)
All are generated with the §6 runbook. Size **2560 × 1440** (d) and **1440 × 2560** (m), PNG, in `assets-src/keyframes/<id>/`. Licence for every row: generated on a Higgsfield paid plan; licence-back accepted in writing (N3); no copyright in the raw output, so keep the layered retouch PSD/KRA as authorship evidence (asset-sources §3.2). Status **required**, owner **Claude agent** (generation and QC) with **AVVVS** approval of each final, unless stated.

| id | asset name | scene / beat | description (the exact prompt slots are in §6.4) | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| KF-S01-A | Laterite path, wide | S01 frame 0 (after fade-up) | Red laterite path after rain under jackfruit and coconut palms, mist, ≤ 3 sun shafts, 24 mm, eye height 1.6 m. Start of s01a. | PNG 8-bit sRGB | 2560×1440 + 1440×2560 | ≤ 12 MB each | generate | see header | required | Claude agent |
| KF-S01-B | Understorey, karinochi ahead | S01 local ≈ 0.25 | Hip height, 35 mm, karinochi shrub ahead in the one shaft. End of s01a, start of s01b. | PNG | as above | ≤ 12 MB | generate | see header | required | Claude agent |
| KF-S01-C | Karinochi branch | S01 local ≈ 0.50 | One *Vitex negundo* branch at 50 mm, palmate leaves of 5 leaflets, one leaf in the shaft, foreground leaf blurred 3% of frame width. End of s01b, start of s01c. | PNG | as above | ≤ 12 MB | generate | see header | required | Claude agent |
| KF-S01-D | Hand H1 turns the leaf | S01 local ≈ 0.75 | Right hand from the lower right holds one leaf by its stalk, underside to the light, 100 mm. Needs REF-HANDS. End of s01c, start of s01d. | PNG | as above | ≤ 12 MB | generate (with REF-HANDS as image reference) | see header + hand consent line | required | Claude agent; AVVVS approves the hand |
| KF-S01-D-ALT | Leaf turned by wind (no hand) | S01 local ≈ 0.75 | **Conditional backup** if N1 is not supplied: the same leaf turned by a breath of wind, underside to the light, no hand. | PNG | as above | ≤ 12 MB | generate | see header | required (conditional) | Claude agent |
| KF-S01-E | Venation macro | S01 last frame (ink bleed source) | 1:1 macro of the silver-white underside, mid-vein diagonal lower-left to upper-right, only the mid-vein plane sharp. End of s01d. The Sobel edge map of this frame drives the S01→S02 ink bleed, so veins must be crisp. | PNG | as above | ≤ 12 MB | generate | see header | required | Claude agent |
| KF-S03-A | Rhizome on earth | S03 frame 0 | Ginger rhizome on dark earth ground, starting to split along its fibres, 100 mm, narrow 20° light cone. Structure reference: REF-SPECIMEN (render of GLB-GINGER at the S02 final pose). | PNG | as above | ≤ 12 MB | generate (with REF-SPECIMEN) | see header | required | Claude agent |
| KF-S03-B | Fragments to powder | S03 local ≈ 0.33 | Fragments falling, breaking into fine pale powder, dust lit only in the cone. | PNG | as above | ≤ 12 MB | generate | see header | required | Claude agent |
| KF-S03-C | Powder on clear liquid | S03 local ≈ 0.66 | Powder settling onto perfectly clear still liquid in a shallow dark earthenware bowl. | PNG | as above | ≤ 12 MB | generate | see header | required | Claude agent |
| KF-S03-D | Amber liquid | S03 last frame | Same bowl, liquid warm transparent amber `oklch(0.62 0.13 65)` = the one accent. | PNG | as above | ≤ 12 MB | generate | see header | required | Claude agent |
| KF-S04-A | Kindi pours into uruli | S04 frame 0 | Wide shallow brass uruli on dark teak, a brass kindi spout entering from the upper-left frame edge pours a thin amber stream, **no hands visible**, 85 mm, 30° down. Vessel reference: REF-VESSELS. | PNG | as above | ≤ 12 MB | generate (with REF-VESSELS) | see header | required | Claude agent |
| KF-S04-B | Hands H2 at the uruli | S04 local ≈ 0.33 | Left hand steadies the rim, right hand draws a flat wooden spatula through the oil, spiral beginning. Needs REF-HANDS. | PNG | as above | ≤ 12 MB | generate (with REF-HANDS, REF-VESSELS) | see header + hand consent line | required | Claude agent; AVVVS approves the hands |
| KF-S04-B-ALT | Spatula rests, spiral forms (no hands) | S04 local ≈ 0.33 | **Conditional backup** if N1 is not supplied: spatula resting across the rim, the poured oil turning in a slow spiral by itself. | PNG | as above | ≤ 12 MB | generate | see header | required (conditional) | Claude agent |
| KF-S04-C | Spiral formed | S04 last frame | Uruli seen as in A, hands gone, a clear amber spiral whose centre sits at the ring origin (from the top-left: d x 0.68 y 0.45; m x 0.50 y 0.66; see SEQ-S04). | PNG | as above | ≤ 12 MB | generate | see header | required | Claude agent |
| KF-S05-BG | Teak and forest ground | S05 frame 0 | Dark teak table at 85 mm, 10° down, forest-green ground vignetting to near-black, out-of-focus leaves only in the outer 12%, empty evenly lit product area (d x 0.45–0.85; m y 0.50–0.85), gold rim light grazing the teak edge from back right. **No bottle, label or text.** | PNG | as above | ≤ 12 MB | generate | see header | required | Claude agent |

### 2.3 Posters, stills and share images (shipped)
Every poster's `alt` text is in §3 and goes into `src/content/film.ts`. Poster files are `public/film/posters/<scene>-<d|m>.<hash8>.avif` with `<scene>` = `s01open`, `s01`, `s02`, `s03`, `s04`, `s05` (04 §2), built by `npm run film:posters` from the graded 16-bit PNG frames (never from the WebP frames).

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| PST-S01-OPEN | S01 first-paint poster (LCP) | S01 progress 0, live and static | SEQ-S01 frame 0000 darkened in sharp until the 8×8 mean OKLCH L is **0.14–0.17** (it matches the canvas at progress 0, so the canvas fades in over it with no flash). `<Image preload fetchPriority="high" sizes="100vw">`. | AVIF | d 1920×1080, m 828×1472 | ≤ 140 KB d, ≤ 90 KB m | derived from SEQ-S01 | as SEQ-S01 | required | Claude agent |
| PST-S01 | S01 still | S01, static mode | SEQ-S01 frame 0048 (karinochi branch, KF-S01-C region), full grade. | AVIF | d 1920×1080, m 828×1472 | ≤ 140 / ≤ 90 KB | derived from SEQ-S01 | as SEQ-S01 | required | Claude agent |
| PST-S02 | S02 still | S02, static mode header image | Screenshot of the live S02 scene at local progress 0.30 (turmeric plate focused) captured at 2560×1440 and 1440×2560 via the Browser pane (`mcp__Claude_Browser__resize_window` + `computer screenshot`, URL `http://localhost:3000/#perf` not needed) once the S02 scene renders. Until it renders: PLT-CURCUMA ink composited (multiply) on a flat `oklch(0.90 0.035 82)` sheet with sharp. | AVIF | d 1920×1080, m 828×1472 | ≤ 140 / ≤ 90 KB | derived (screenshot or composite) | engraving PD; courtesy credit | required | Claude agent |
| PST-S03 | S03 still | S03, static mode | SEQ-S03 last frame (amber liquid). | AVIF | d 1920×1080, m 828×1472 | ≤ 140 / ≤ 90 KB | derived from SEQ-S03 | as SEQ-S03 | required | Claude agent |
| PST-S04 | S04 still | S04, static mode | SEQ-S04 frame 0036 (hands H2 at the uruli, or the ALT frame). | AVIF | d 1920×1080, m 828×1472 | ≤ 140 / ≤ 90 KB | derived from SEQ-S04 | as SEQ-S04 | required | Claude agent |
| PST-S05 | S05 still | S05, static mode | SEQ-S05BG frame 0000 with SEQ-S05P set-A angle-0 frame composited on top in sharp (`composite`, `blend: "over"`). Product pixels untouched. | AVIF | d 1920×1080, m 828×1472 | ≤ 140 / ≤ 90 KB | derived (generated bg + real photo) | as SEQ-S05BG + © AVVVS product photo | required | Claude agent |
| PST-OG | Home share image | `/` and every route without its own image: Open Graph and Twitter | `src/app/opengraph-image.tsx` (`next/og` `ImageResponse`; read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md` first). **Typographic, no artwork** (04 §3.1). Ground: `--field-brand` `oklch(50% 0.133 247.3)`. Line 1: "Ayurveda since 1921" in Boska Light 300, 88 px, line-height 0.95, `--field-brand-ink` `oklch(98.2% 0.048 102.2)`, left 72 px, baseline 300 px. Line 2: "Arya Vaidya Vilasini Vaidya Sala, Kozhikode" in Geist 400, 32 px, same ink, left 72 px, baseline 372 px. No logo until ICO-LOGO-SVG exists. Fonts as TTF/OTF ArrayBuffers (`next/og` cannot read woff2): Boska Light from `assets-src/fonts/` copied to `src/app/og-fonts/Boska-Light.otf` (committed, licence permits embedding: check the FFL text, NEEDS-AVVVS with D5) and Geist from the `geist` npm package's `dist/fonts/geist-sans/Geist-Regular.ttf` (UNVERIFIED path; check after `npm i -D geist`, or download the TTF from https://github.com/vercel/geist-font/releases). Colours are converted to sRGB inside this one generated file only (the no-hex rule applies to components). | PNG (generated at build) | 1200×630 | ≤ 120 KB | generate (code) | own work; Boska FFL, Geist OFL | required | Claude agent |
| PST-OG-PDP | Product share images | `/products/[handle]` | `openGraph.images` = the Shopify hero image URL at `width=1200` (capped at the intrinsic width), exactly as 05 §5.4 PDP metadata says. No generated image, no text on the photo. | JPG/WebP (CDN) | ≤ 1200 wide | CDN | Shopify CDN | © AVVVS | available | Claude agent |

### 2.4 Botanical engravings (S02, static film grid, plants list)
Retouch spec for every row (01 §5.2, asset-sources §0.4):
1. Download the full-size scan to `assets-src/plates/raw/`.
2. Crop to the plate border plus 3% margin.
3. Remove later pencil marginalia. The Claude agent may only fill **blank paper** with flat paper colour plus matched noise (sharp composite). Marginalia that touches an engraved line goes to the Retoucher (GIMP clone tool). **Never** inpaint with a generative model.
4. Levels: paper → `oklch(0.94 0.025 85)`, ink → `oklch(0.28 0.035 55)`.
5. Export `public/film/plates/<slug>-2048.<hash8>.avif` (long edge 2048, quality 60, ≤ **450 KB**; used by the static grid, the plants list and the inspect dialog) and `<slug>-1024.<hash8>.webp` (quality 75, ≤ 180 KB; HTML on phones and the KTX2 fallback, 04 §7.3).
6. Annotations: bake the plate's Latin part names into the retouched master (see TEX-PLATE-ANNOT below), so the KTX2, the AVIF and the WebP all carry them. Save the master as `assets-src/plates/<slug>.tif` and record crop box, levels, measured source size and source URL in `assets-src/plates/plates.json`.
7. Encode the **full plate (paper + ink + annotations), opaque RGB**, to `public/film/plates/<slug>-2048.<hash8>.ktx2` (ETC1S/basis-lz, mipmaps, sRGB; ≤ **450 KB**) and `<slug>-1024.<hash8>.ktx2` (≤ **150 KB**). 04 §7.3 `PlateMesh` samples this one map (`uMap`), so each plate keeps its own paper over the procedural sheet. Confirm the `ktx create` flags with `ktx create --help` (KTX-Software 4.4.2). If KTX-Software will not install, the runtime uses the `-1024.webp` (04 §7.3, §1.4).
7a. Ink key (intermediate only, for the PST-S02 fallback composite): `alpha = clamp((Lpaper − L) / (Lpaper − Link), 0, 1)` in OKLab L, RGB set to the ink colour → `assets-src/plates/<slug>-ink-2048.png`. Not shipped.
7b. Steps 2 and 4–7a run with `npm run film:plates` (`scripts/film/build-plates.mjs`), which reads `plates.json`. Steps 1 and 3 are manual.
8. One `credits.ts` entry per plate with the standard line: `Hendrik Adriaan van Rheede tot Drakestein, Hortus Indicus Malabaricus, vol. {V} ({year}), tab. {T}. Public domain. Scan: Internet Archive / Biodiversity Heritage Library.`

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| PLT-VITEX | Karinochi plate (ring 1) | S02 plate 1; S01→S02 ink bleed lands here | *Vitex negundo*, HM vol. 2 (1679). Double-page spread; the plate fills the spread. **Tab number UNVERIFIED**: read it off the plate and record it before captioning "Hort. Mal. II, tab. {T}" (N5). | JPG source → AVIF, WebP, KTX2 | source 5124×4234 (VERIFIED, asset-sources §1.2) | per retouch spec | https://commons.wikimedia.org/wiki/File:Hortus_Indicus_Malabaricus_BHL463761.jpg (original via `Special:FilePath/Hortus_Indicus_Malabaricus_BHL463761.jpg`) | Public domain (Commons tag). Standard Rheede line, vol. 2 (1679), tab. UNVERIFIED. | available | Claude agent (retouch); Retoucher if marginalia touches lines |
| PLT-RICINUS | Castor plate (ring 2) | S02 plate 2 | *Ricinus communis*, HM vol. 2. **Tab number UNVERIFIED** (N5). Species from the Commons category. | as above | source 5215×4209 | per retouch spec | https://commons.wikimedia.org/wiki/File:Hortus_Indicus_Malabaricus_BHL463817.jpg | Public domain. Standard line, vol. 2 (1679), tab. UNVERIFIED. | available | Claude agent |
| PLT-SESAMUM | Sesame plate (ring 3) | S02 plate 3 | *Sesamum indicum*, HM vol. 9 (1689) tab. 54 "Schit-Elu" (heading VERIFIED on IA n129). Size not measured: measure on download and record; if long edge < 2000 px, stop and report. | as above | source ≥ 5000 px expected (UNVERIFIED) | per retouch spec | https://archive.org/download/Hortus_Indicus_Malabaricus_Volume9/page/n128.jpg | Public domain by age (IA states no licence). Standard line, vol. 9 (1689), tab. 54. | available | Claude agent |
| PLT-CURCUMA | Turmeric plate (ring 4) | S02 plate 4; PST-S02 | *Curcuma longa*, HM vol. 11 (1692) tab. 11 "Manjella Kua" (heading VERIFIED on IA n28). | as above | source 10789×9031, 9.1 MB (VERIFIED) | per retouch spec | https://archive.org/download/Hortus_Indicus_Malabaricus_Volume11/page/n27.jpg | PDM 1.0 (IA licenseurl). Standard line, vol. 11 (1692), tab. 11. | available | Claude agent |
| PLT-ZINGIBER | Ginger plate (ring 5, last) | S02 plate 5 → specimen → S03 | *Zingiber officinale*, HM vol. 11 tab. 12 "Inschi vel Inschi Kua" (heading VERIFIED on IA n30). | as above | source ≈ 10789×9031 (same volume; not measured individually) | per retouch spec | https://archive.org/download/Hortus_Indicus_Malabaricus_Volume11/page/n29.jpg | PDM 1.0. Standard line, vol. 11 (1692), tab. 12. | available | Claude agent |
| PLT-WITHANIA | Ashwagandha plate (conditional) | S02 plate 5 (ginger moves to 6) | **Conditional (N4):** ships only if a public-domain scan ≥ 2000 px long edge is committed to `assets-src/plates/raw/` by the end of the asset WP. Commons Flora Graeca t. 233 is 714×1080 (too small). Candidates: a BHL scan of Sibthorp & Smith, *Flora Graeca* vol. 3 t. 233 (UNVERIFIED availability), or Kirtikar & Basu 1918 plate volumes `archive.org/details/indianmedicinalp0{1-4}kirt` (plate number UNVERIFIED). **Do not use Bodleian Digital images**: they are CC BY-NC (UNVERIFIED for 2026), and NC is not allowed. Gets the same retouch targets. | as above | ≥ 2000 px required | per retouch spec | search (asset-sources §1.3) | PD required; credit with its own source line | required (conditional) | Claude agent (search); AVVVS (decision N4) |
| PLT-RASNA | Rasna plate (upgrade candidate) | replaces PLT-WITHANIA if found | *Alpinia galanga*. No engraving located yet. Search the HM vol. 11 OCR index (method asset-sources §1.4) for a Rasna/galangal plate; ships only if its heading is read on the scan (01 §5.4). | as above | ≥ 2000 px | per retouch spec | search | PD | required (conditional) | Claude agent |

Derived per plate (for every shipped plate above):

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| TEX-PLATE-ANNOT-<slug> | Plate annotation lettering (baked; no separate file) | S02, on the plate; pointed at while the plate is focused | Latin part names only (*radix*, *rhizoma*, *folium*, *flos*, *fructus*, *semen*, whichever the engraving actually shows), IM FELL English italic, 26 px at the 2048 px plate size, `--film-sepia-soft` `oklch(0.45 0.05 60)`, at the label positions in `src/content/plates.ts` (`annotations: { part, uv: [x, y] }[]`, uv from the plate's top-left). `build-plates.mjs` composites an SVG `<text>` layer (FNT-IMFELL TTF embedded with `@font-face` and a data URI) onto the master before encoding (01 §2.7: "baked into the plate texture at build time"). The "drawing" happens in the DOM: DrawSVG leader lines from the HTML label to `projectPlateUv(uv)` (04 §7.2). The same words are in the HTML `<figure>` (01 §7.1). No label sits over engraved lines: keep a 24 px clear margin, checked at 100%. | baked into the PLT KTX2 / AVIF / WebP | — | adds ≤ 5% to each plate file | generate (script) | Font SIL OFL 1.1 | required | Claude agent |
| SVG-BINOMIAL-<slug> | Binomial script stroke | S02 focused plate, the one script accent per page (01 §2.7) | Single-line stroke path of the binomial (for example *Curcuma longa*) for DrawSVG `0% 0%` → `0% 100%` over 1200 ms. Made with Inkscape 1.x Extensions → Text → Hershey Text, font "EMS Allure" (single-stroke script), then Path → Object to Path, stroke `currentColor`, width 1.5 at a 600-px-wide viewBox, `aria-hidden="true"`. The same text is in the HTML `<i>`. | SVG | viewBox width 600 | ≤ 6 KB each | generate (Inkscape) | EMS fonts: SIL OFL 1.1 (UNVERIFIED: check the licence file shipped with the Inkscape extension before use) | required | Claude agent |

### 2.5 Textures

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| TEX-NOISE | Composite noise | All scenes: S02 paper and every transition front (grain is a separate hash, 01 §2.4) | `public/film/tex/noise-256.png`, the `uNoise` sampler of 04 §6.7.1: **256 × 256, RG value noise, tileable**. R = value noise on a 32 × 32 lattice (smoothstep interpolation; the lattice wraps at 32, so the tile repeats seamlessly). G = an independent value noise on the same lattice with seed + 19. B = 0, A = 255. 04's `vnoise` reads `.r`; `.g` is spare. 8-bit linear data: load with `colorSpace = NoColorSpace`, `RepeatWrapping`, linear filter, no mips (04). Generated by `scripts/film/build-noise.mjs` from a `Uint8Array` with sharp, seed 1921. Check: tiled 2 × 2, the seam columns and rows differ by at most 1/255 from their neighbours' interpolation (no visible seam at 400%). | PNG (lossless) | 256×256 | ≤ 140 KB | generate (script) | own work | required | Claude agent |
| TEX-PAPER-REF | Paper reference (not shipped) | S02 look-dev for the procedural sheet (01 §2.4) | AmbientCG `Paper001`–`Paper006` 2K colour maps, used only to tune `uPap` (pulp, fibre, tooth, fleck) by eye in `/dev/film-lab`. 04 §7.3 `PlateMesh` uses no normal map and the full-screen sheet is procedural, so **no paper texture ships**. No CSS parchment tile either: the site has no parchment ground (01 §3). | JPG (offline) | 2048² | n/a | https://ambientcg.com/view?id=Paper001 (download link from `https://ambientcg.com/api/v2/full_json?id=Paper001&include=downloadData`) | CC0 (AmbientCG). No credit (not shipped). | available | Claude agent |

### 2.6 3D models

Shipped:

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| GLB-GINGER | Ginger specimen | S02 local 0.82–1.00 (plate loses its paper, rhizome stands free; 04 §7.2, §7.4), REF-SPECIMEN, SEQ-S02TURN | Poly Haven `food_ginger_01`, 7,205 tris (VERIFIED). Get file URLs from `https://api.polyhaven.com/files/food_ginger_01` (glTF, 2k textures). Optimise with `npm run film:glb` (`scripts/film/build-glb.mjs`): `npx @gltf-transform/cli@4.5.1 optimize in.gltf ginger-d.glb --compress meshopt --texture-compress ktx2 --texture-size 1024`, and the same with `--texture-size 512` → `ginger-m.glb`; the script hashes them into `public/film/glb/ginger-{d,m}.<hash8>.glb`. Scale and position in code (04 §7.4: longest axis 1.1 m). No simplification (already ≤ 15k). Check albedo against PLT-ZINGIBER shape; it is a photoscan, so botany is real. | GLB (meshopt, KTX2) | ≤ 7.3k tris; textures 1024² d / 512² m | ≤ 600 KB d / ≤ 300 KB m | https://polyhaven.com/a/food_ginger_01 | CC0. Courtesy credit "Poly Haven". | available | Claude agent |

Offline only (pipeline B fallback or reference renders; never served to the browser). Rows below are needed **only if N3 is refused** (pipeline B), except REF-SPECIMEN which uses GLB-GINGER. Licence for Poly Haven and AmbientCG rows: CC0. Sketchfab rows: CC BY 4.0, credit "{title} by {author}, CC BY, modified" on `/credits` even though only renders ship.

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| GLB-B-S01-SET | S01 forest kit | S01 renders | Poly Haven `fern_02` (6,232 tris), `calathea_orbifolia_01` (16,688), `anthurium_botany_01` (4,134), `pachira_aquatica_01` (76,914 → ratio 0.2), `moss_01` (246,170 → ratio 0.05), `rock_moss_set_01`/`02` (ratio 0.3, albedo shifted to `oklch(0.45 0.08 40)`), `root_cluster_01` (ratio 0.15), `dead_tree_trunk_02` (ratio 0.15). Offline, so decimation only for scene-file size. | glTF 2k | per asset-sources §2.1 | n/a (offline) | https://polyhaven.com/a/{id} | CC0 | available | 3D artist |
| GLB-B-BANANA | Banana leaves | S01 renders | Sketchfab `9441c1bf514b4bc8b8254100beb403e7` (griffon.sebastien, 26,224 faces) and `6d2989ee224c4ba1a6d3899c1b6abf34` (ronchoqa, 222 faces). Download needs a free Sketchfab account. | GLB | per asset-sources §2.3 | n/a | https://sketchfab.com/3d-models/{uid} | CC BY (credit required) | available | Arjun (download); 3D artist |
| GLB-B-VITEX | Karinochi branch | S01 hero plant (renders) | **No source exists.** Custom model: palmate leaves of 5 lanceolate leaflets, opposite arrangement, upper surface dark green, underside silver-white with down; leaf cards from AmbientCG `LeafSet00x` re-shaped to match PLT-VITEX and REF-VITEX. ≤ 60k tris. | .blend + GLB | — | n/a | model | own work (AVVVS) | required | 3D artist |
| GLB-B-URULI | Brass uruli | S04 renders; also a structure reference for KF-S04 in pipeline A if REF-VESSELS is weak | Lathe (spin) model: Ø 30 cm, height 9 cm, wall 4 mm, two side ring handles; brass PBR base `oklch(0.72 0.11 80)`, metallic 1, roughness 0.28, hammered normal. ≤ 6k tris. Shape from REF-VESSELS. | .blend + GLB | ≤ 6k tris | n/a | model | own work (AVVVS) | required | 3D artist |
| GLB-B-KINDI | Brass kindi | S04 renders | Body Ø 11 cm, height 14 cm, spout 9 cm at 35°. Same material. ≤ 6k tris. | .blend + GLB | ≤ 6k tris | n/a | model | own work | required | 3D artist |
| GLB-B-ROOT | Single root | S03 renders | Poly Haven `single_root` (114,424 tris, ratio 0.3) as look-dev for "rhizome breaks"; the hero is still GLB-GINGER. | glTF | — | n/a | https://polyhaven.com/a/single_root | CC0 | available | 3D artist |
| TEX-B-LEAF | Leaf atlases and ground | S01 renders | AmbientCG `LeafSet004`–`030` (pick broad-leaf sets), `Ground037`, `ScatteredLeaves001`, `Bark00x`, `Moss001`. | JPG PBR 2K/4K | — | n/a | https://ambientcg.com/view?id={id} | CC0 | available | 3D artist |

Not used (do not download for the web): Megascans/Fab (licence, asset-sources §2.4); `vintage_microscope` (lab imagery); Sketchfab rigged hand (CC BY-SA); Korean/Nepali vessels; puja thali; any product bottle model other than one built later from PRD-LABEL-HIRES and PRD-PACK-DIMS (§2.8).

### 2.7 HDRIs (offline only)
Nothing HDRI is served to the browser in v2: GLB-GINGER is lit by `ambientLight` 0.6 + one `directionalLight` from the upper left (position (−3, 4, 3), intensity 1.4, 4300 K), exactly as 04 §7.4. SEQ-S02TURN uses the same lights. All rows are Poly Haven, CC0, available, and used only in pipeline B or for an optional Blender REF-SPECIMEN.

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| HDR-FOREST | `forest_grove` | S01 renders | Dappled forest light; key matches 01 §2.5 S01 (5200 K key). | .hdr | 4k | 28.5 MB (offline) | https://polyhaven.com/a/forest_grove | CC0 | available | 3D artist |
| HDR-FOREST-ALT | `hochsal_forest` | S01 renders, misty variant | Overcast. | .hdr | 4k | 27.7 MB | https://polyhaven.com/a/hochsal_forest | CC0 | available | 3D artist |
| HDR-ATTIC | `industrial_wooden_attic` | REF-SPECIMEN if rendered in Blender (optional; the three.js render needs no HDRI) | Warm archival window light (4300 K). | .hdr | 2k | 6.4 MB | https://polyhaven.com/a/industrial_wooden_attic | CC0 | available | Claude agent |
| HDR-STUDIO | `brown_photostudio_02` | S04 renders (pipeline B) | Warm studio reflections for brass. | .hdr | 4k | 24.3 MB | https://polyhaven.com/a/brown_photostudio_02 | CC0 | available | 3D artist |

### 2.8 Product photography

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| PRD-SHOPIFY-ALL | Existing Shopify product images | Store grid, PDP gallery, cart, signature band (interim), PST-OG-PDP | 165 products, 236 images; 164 products have at least one image (VERIFIED). Most are 682×1024. Served through the Shopify CDN loader (`?width=` / `&width=`), never `/_next/image` (store-revamp §6.4). | JPG/WebP (CDN) | mostly 682×1024; max 3333×3333 | CDN-resized | `https://avvvsglobal.com/products.json?limit=250&page=1` → `images[].src` | © AVVVS | available | Claude agent (wire-up) |
| PRD-SHOPIFY-LABEL | Back-label photos | PDP "Read the label" (LabelViewer) | 48 files named `*BACK*`; 64 products have ≥ 2 images (VERIFIED). Label image index rule: store-revamp §3.3. Hero examples: `mezhuthailamback.jpg`, `laksholback.jpg` (682×1024). Readable only at 2× zoom: high-res replacement is PRD-LABEL-HIRES. | JPG (CDN) | 682×1024 typical | CDN `&width=2000` | Shopify CDN | © AVVVS | available | Claude agent |
| PRD-SIG-6 | Signature band fronts | Home "Known for" band (68svh panels), store lead row, PDP hero | Front packshots on **white seamless**, soft shadow only (05 shows product photos on `--photo-well` with `mix-blend-mode: multiply`, which needs a white ground; 05 R9, §5.1), for Mezhu Thailam (`mezhuthailam`), Rujanth Liniment (`rujanth-linment`), Rujanth Capsule (`rujanth-capsule`), Lakshol (`lakshol`), Slepan Capsule (`slepan-capsule`), Red Irons Capsule (`red-irons-capsule`). Needed because a 68svh panel at DPR 2 needs ≥ 1500 px of image height; the current 682×1024 images are too small. Interim: use the Shopify images. | TIFF 16-bit master + JPG; web AVIF | ≥ 2400×3000 (4:5) | web AVIF ≤ 220 KB at 1600 px tall | photograph | © AVVVS, usage assigned in writing | required | Photographer; Claude agent (export) |
| PRD-ARC-A | S05 arc, all three products | SEQ-S05P part 1 (no-H3 build) | Rujanth Liniment front-centre, Mezhu Thailam left-behind, Lakshol right-behind (exact layout: §2.8.1), on a dark teak plank, black background. Camera locked; motorised turntable rotates the plank **counter-clockwise seen from above** in 1° steps, 0°–12° (13 frames) = the camera orbiting clockwise. Cross-polarised key from upper left 45°, 4000 K; gold rim from back right 3000 K (2–4 px rim at 1600 px). ColorChecker frame before and after. | RAW + TIFF 16-bit | ≥ 45 MP (≥ 8000 px long edge), 13 frames | n/a (raw) | photograph | © AVVVS | required | Photographer |
| PRD-ARC-B | S05 arc, two products | SEQ-S05P part 1 (H3 build) | Same as A with Mezhu Thailam absent (its spot empty, same lighting). 13 frames. | RAW + TIFF | as A | n/a | photograph | © AVVVS | required | Photographer |
| PRD-H3 | Hand sets Mezhu Thailam down | SEQ-S05P part 2 | At the 12° position of set B: the consenting vaidyan's right hand (hand rules, 01 §1.3: no rings, watch or jewellery; unbleached cotton sleeve) brings Mezhu Thailam in from the right, sets it in its set-A spot, withdraws. Video 4K (3840×2160) 24 fps, 180° shutter, 3 takes; plus the empty-hand-out end frame. Label must face camera and stay sharp. | video (ProRes or H.265 10-bit) | 4K, ~2 s per take | n/a | photograph | © AVVVS; model release (N1) | required | Photographer |
| PRD-LABEL-HIRES | Label flats | PDP LabelViewer; content sheet transcription | Flat scans or print PDFs/dielines of the back labels, first for the 21 proprietary products and the 6 signature SKUs, then the rest (store-revamp M8). | PDF or TIFF 600 dpi | ≥ 3000 px tall | web JPG ≤ 600 KB at 2000 px | AVVVS print files or photograph | © AVVVS | required | AVVVS |
| PRD-MISSING-ARAG | Aragwadharishtam photo | Store, PDP | The only product with no image (store-revamp M8). Front + back. | JPG | ≥ 1500 px tall | CDN | photograph | © AVVVS | required | AVVVS / Photographer |
| PRD-PACK-DIMS | Packaging measurements | Reserve: a future real-packaging GLB (not v2) | Calliper sizes for the 3 hero SKUs (height, diameter, shoulder radius, cap height) + ColorChecker shots. Captured during the session so a real-packaging model is possible later. | text + JPG | — | — | photograph | © AVVVS | required | Photographer |

#### 2.8.1 S05 product layout (for the photographer and the cut-out)
Desktop 16:9 framing, measured on the final 1600×900 frame: Rujanth Liniment base centre at **x 0.66, y 0.78**, bottle height **0.44** of frame height; Mezhu Thailam base at **x 0.56, y 0.74**; Lakshol base at **x 0.77, y 0.74**; all labels facing camera at 0°. Phone 9:16 crop of the same raw: Rujanth base at **x 0.50, y 0.84**, height **0.30** of frame height. Nothing may enter the copy zone (d x < 0.42; m y < 0.40).

### 2.9 Reference photography (never shipped)

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| REF-HANDS | Vaidyan hand references | KF-S01-D, KF-S04-B (image reference), hand QC skin patch | 12 poses (asset-sources §2.6.2): right hand holding a leaf by its stalk (3 angles: back of hand, side, palm-up turn), two hands at a wide bowl rim with a flat wooden spatula (3 angles), right hand pouring from a small spouted brass vessel (2), hands at rest on teak (2), close-up of each hand flat, back and palm (2). Kit: key 45° 3200 K, fill −2 EV, 85 mm, f/8, ISO 100, grey card in frame. Same unbleached cotton sleeve as the film. Signed model release first. | RAW + JPG | ≥ 24 MP | n/a | photograph | © AVVVS; release (N1). Uploaded to Higgsfield as media only after N3. | required | Photographer; AVVVS (subject, release) |
| REF-VESSELS | Uruli and kindi references | KF-S04-A/B/C (image reference); GLB-B-URULI/KINDI | AVVVS's own brass uruli and kindi, on teak: front, 30° down (the S04 camera), top, side with a tape measure. | JPG | ≥ 12 MP | n/a | photograph | © AVVVS | required | AVVVS |
| REF-VITEX | Karinochi plant references | KF-S01-B/C/D/E botany QC; GLB-B-VITEX | A live *Vitex negundo* branch: upper surface, underside, leaf with 5 leaflets flat on grey card. AVVVS grows or sources it for Elakizhi (VERIFIED as a therapy leaf, `treatments.ts`). | JPG | ≥ 12 MP | n/a | photograph | © AVVVS | required | AVVVS |
| REF-SPECIMEN | Ginger specimen render | KF-S03-A (structure reference) | GLB-GINGER rendered at the S02 final specimen pose (Y 35°, X tilt 8°, 04 §7.2) on a flat `oklch(0.30 0.05 60)` ground, key from upper left 30°, 2560×1440 and 1440×2560, with `build-turntable.mjs --still`. Saved to `assets-src/refs/specimen/`. | PNG | 2560×1440 + 1440×2560 | n/a | model | CC0 | required | Claude agent |

### 2.10 Site photography

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| PHO-ABOUT-WIDE | About wide photo | Home about section; `/about-us` | One landscape photo of the AVVVS factory or Vaidya Sala. Candidates already scraped (VERIFIED sizes, 1300×867): `public/content/gallery/factory-3.webp`, `factory-4`, `factory7`, `factory9`, `factory13`, `factory17`, `factory18`, `fatory19`, `factory20`. AVVVS picks one and supplies the original at ≥ 2560 px wide; until then the 1300 px file is used at max 1300 CSS px. No AI generation, no stock (01 §2.11). | AVIF | ≥ 2560×1440 original; web 1920 and 960 wide | ≤ 260 KB at 1920 | AVVVS (old-site gallery; original files) | © AVVVS. Use rights for old-site photos NEEDS-AVVVS confirmation. | available (low-res) / required (hi-res) | AVVVS |
| PHO-FOUNDER | Founder portrait | `/about-us` | Kaloor Neelakantan Vaidyar. Existing `public/content/about/neelakandan-vaidyar.webp` is 251×298 (too small above 250 CSS px). A higher-resolution scan of the original is needed. | AVIF | ≥ 1200 px tall | ≤ 120 KB | AVVVS archive | © AVVVS | available (low-res) / required (hi-res) | AVVVS |
| PHO-CONTENT | Old-site photos | `/about-us`, `/avvvs-speciality-clinic`, blog pages if kept | Everything already in `public/content/**` (about, clinics, gallery, treatments, blog). Keep as-is; replace only if a page design needs larger. Many are ≤ 612 px. | WebP | as found | as found | avvvs.com (scraped via web.archive.org) | © AVVVS. Rights NEEDS-AVVVS confirmation. | available | AVVVS (rights) |

### 2.11 Audio (off by default; loaded only after "Sound on")
Processing for every bed (01 §6, asset-sources §4): DAW edit to a **60 s loop** with a 2 s equal-power crossfade at the loop point; loudness **−30 LUFS integrated ±1** (measure with `ffmpeg -af ebur128`); export Opus 96 kbps stereo `.opus` + AAC 96 kbps `.m4a` fallback with `npm run film:audio` (`scripts/film/build-audio.mjs`, ffmpeg `libopus` / `aac`) from `assets-src/audio/<bed>.wav` to `public/film/audio/<bed>.{opus,m4a}`; ≤ **1 MB** per file. Bed file names: `s01-bed`, `s01-insects`, `s02-frogs`, `s02-paper`, `s34-water`, `s05-night`. Freesound downloads need a free account (Arjun). All sources VERIFIED CC0 1.0 on their own pages on 2026-11-04; re-check before shipping.

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| AUD-S01-BED | Dawn to river bed | S01; gain 0 → 1 over local 0.00–0.15 | First 20 s: Freesound 787307 (dawn chorus, North Goa); crossfade over 6 s into 332419 (Chalakudy River, Kerala; high-pass 60 Hz, phone recording). | Opus + M4A | 60 s loop, 48 kHz stereo | ≤ 0.75 MB each | https://freesound.org/people/HotCatMedia/sounds/787307/ ; https://freesound.org/people/seventhsamurai/sounds/332419/ | CC0 1.0; courtesy credit "HotCatMedia, seventhsamurai (Freesound)" | available | Arjun (download); Claude agent (edit with ffmpeg) |
| AUD-S01-INSECTS | Insect rise | S01; gain 0 → 0.6 over local 0.70–0.95 | Freesound 615011 "Insect Buildup Forest". | Opus + M4A | 60 s loop | ≤ 0.75 MB | https://freesound.org/people/absent1010/sounds/615011/ | CC0 1.0 | available | Arjun; Claude agent |
| AUD-S02-FROGS | Post-rain frogs | S02; bed gain 0.35 | 60 s cut from Freesound 515141 (17:41 take; pick the 60 s with no voices or engines). | Opus + M4A | 60 s loop | ≤ 0.75 MB | https://freesound.org/people/cottonsoundtechie/sounds/515141/ | CC0 1.0 | available | Arjun; Claude agent |
| AUD-S02-PAPER | Paper rustle one-shot | S02, each time a plate comes forward; −6 dB relative to bed | **No CC0 file chosen yet** (N13). Search Freesound for "paper page turn" with the CC0 filter; ≤ 1.2 s. Optional: the S02 bed works without it. | Opus + M4A | ≤ 1.2 s one-shot | ≤ 25 KB | Freesound (to be chosen) | CC0 required | required | Arjun; Claude agent |
| AUD-S34-WATER | Water lap | S03 and S04; gain 0.5 | Freesound 524688, slowed to 50% and low-passed at 2 kHz (`ffmpeg -af "asetrate=24000,aresample=48000,lowpass=f=2000"`). | Opus + M4A | 60 s loop | ≤ 0.75 MB | https://freesound.org/people/salilnair/sounds/524688/ | CC0 1.0 | available | Arjun; Claude agent |
| AUD-S05-NIGHT | Night forest bed | S05; gain 0.4, out to 0 over local 0.80–1.00 | Freesound 417872 (Maharashtra jungle at night). | Opus + M4A | 60 s loop | ≤ 0.75 MB | https://freesound.org/people/Agim/sounds/417872/ | CC0 1.0 | available | Arjun; Claude agent |
| AUD-FIELD | Kozhikode forest field recording | would replace AUD-S01-BED and AUD-S05-NIGHT | Optional commissioned 30-minute recording in Kozhikode district (N13). | WAV 24-bit 48 kHz | 30 min | n/a | commission | © AVVVS | required (optional) | AVVVS |

### 2.12 Fonts

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| FNT-BOSKA | Boska (display) | h1, film headlines (300), site h2 (400), binomials (400 italic), 500 for emphasis | Download the family zip, keep only Light 300, Regular 400, Italic 400, Medium 500 woff2 in `src/app/fonts/boska/`, plus `LICENSE.txt`, plus the 300 TTF/OTF in `assets-src/fonts/` for PST-OG. Load with `next/font/local`, `display: "swap"`, preload 300 and 400 only. If the download has no 300, use 400 and record it (01 §3.1). Requires N12 (CLAUDE.md "no new fonts" amendment). | woff2 (+ TTF for OG) | 4 files | ≤ 40 KB each (UNVERIFIED until downloaded) | https://www.fontshare.com/fonts/boska | ITF Free Font License (FFL); commit the licence file. Not OFL: client acceptance NEEDS-AVVVS (design-system-proposal §10.11). | available | Claude agent; AVVVS (N12) |
| FNT-GEIST | Geist (text and UI) | body, nav, buttons, forms, store | `next/font/google` `Geist`, variable, weights 400–600, subsets `["latin"]`. Has ₹ and `tnum` (VERIFIED in proposal §2.1). | woff2 (served by next/font) | variable | ≤ 70 KB | https://fonts.google.com/specimen/Geist | SIL OFL 1.1 | available | Claude agent |
| FNT-ANEK-ML | Anek Malayalam | `:lang(ml)` text | `next/font/google` `Anek_Malayalam`, subsets `["malayalam"]`, `preload: false`. Loaded only where a Malayalam string exists (none until N6). | woff2 | variable | lazy | https://fonts.google.com/specimen/Anek+Malayalam | SIL OFL 1.1 | available | Claude agent |
| FNT-NOTO-SERIF-ML | Noto Serif Malayalam | `:lang(ml)` inside h1, h2, statements, plate names | `next/font/google` `Noto_Serif_Malayalam`, `preload: false`. | woff2 | variable | lazy | https://fonts.google.com/noto/specimen/Noto+Serif+Malayalam | SIL OFL 1.1 | available | Claude agent |
| FNT-IMFELL | IM FELL English | build time only: TEX-PLATE-ANNOT | Download the TTFs (roman and italic) to `assets-src/fonts/`. **Never** loaded as a webfont. | TTF | 2 files | n/a | https://fonts.google.com/specimen/IM+Fell+English | SIL OFL 1.1 | available | Claude agent |
| FNT-EMS | EMS Allure (single-stroke) | build time only: SVG-BINOMIAL | Ships with the Inkscape Hershey Text extension. | SVG font | 1 | n/a | Inkscape 1.x install | SIL OFL 1.1 (UNVERIFIED, check the bundled licence) | available | Claude agent |

### 2.13 Brand marks and icons
House rules: no icon library, no icons inside buttons, no arrows glued to labels, no leaf/lotus clip art (design-system-proposal §5.2, §8).

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| ICO-LOGO-PNG | Logo lockup (existing) | Nav (28 px tall), footer (on a 4 px `--field-brand-ink` pad) until the SVGs arrive | `public/brand/avvvs-logo.png`, 612×308 RGBA (VERIFIED). Never cropped or recoloured. | PNG | 612×308 | 25 KB-class (as found) | AVVVS | © AVVVS (trademark) | available | — |
| ICO-LOGO-SVG | Logo lockup, vector | Nav, footer, PST-OG fallback, favicon source | Official full-colour vector (N14). | SVG | vector | ≤ 20 KB | AVVVS | © AVVVS | required | AVVVS |
| ICO-LOGO-CREAM | One-colour cream logo | Footer on `--field-brand` | All marks in `oklch(98.2% 0.048 102.2)` (#fffbd6). | SVG | vector | ≤ 20 KB | AVVVS | © AVVVS | required | AVVVS |
| ICO-LOGO-INK | One-colour ink logo | Dark theme nav, print | All marks in `--ink`; supplied as one path set so CSS can colour it with `currentColor`. | SVG | vector | ≤ 20 KB | AVVVS | © AVVVS | required | AVVVS |
| ICO-FAVICON | App icons | browser tab, bookmarks, iOS home screen | From the logo's blue-panel mark once ICO-LOGO-SVG exists: `src/app/icon.svg`, `src/app/favicon.ico` (16 + 32 + 48), `src/app/apple-icon.png` 180×180 on `--field-brand`. Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md` first. Replace the existing `src/app/favicon.ico` (15,086 bytes, origin unknown; likely the create-next-app default). Interim: crop the blue panel from ICO-LOGO-PNG to 180×180 and 32×32. | SVG, ICO, PNG | 16/32/48, 180 | ≤ 15 KB each | derived from logo | © AVVVS | required | Claude agent (after AVVVS N14) |
| ICO-SUN | Sun icon | ThemeToggle in dark mode | Inline SVG in `ThemeToggle.tsx`, 20×20 viewBox 0 0 20 20, `stroke="currentColor"`, stroke-width 1.5, `fill="none"`, round caps: circle r 4 at (10,10) + 8 rays of length 2.5 starting at r 6.5. `aria-hidden="true"`. | inline SVG | 20 px | < 1 KB | generate (hand-written) | own work | required | Claude agent |
| ICO-MOON | Moon icon | ThemeToggle in light mode | Inline SVG, same box and stroke: crescent made from a circle r 7 at (10,10) minus a circle r 6 at (13,7). `aria-hidden="true"`. | inline SVG | 20 px | < 1 KB | generate | own work | required | Claude agent |

### 2.14 Colour-grade files

| id | asset name | scene / beat | description | format | resolution and frames | target file size | source | licence and attribution | status | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| GRD-BASE | Film master LUT | S01, S03, S04, S05 bg | Graded on the approved S01 hero frame to 01 §2.2 targets in linear light. 33-point. `assets-src/grade/avvvs-film-base.cube`. Made in DaVinci Resolve (free) or built by `scripts/film/build-lut.mjs` from per-channel curves fitted to the targets. | .cube | 33³ | ≤ 1 MB | generate | own work | required | Claude agent |
| GRD-S01 / S03 / S04 / S05BG | Scene trims | per scene | Lift, gamma, gain, saturation only; each within ±0.06 L and ±0.03 chroma of the base. S02 has no LUT. Products are never graded. | .cube | 33³ | ≤ 1 MB each | generate | own work | required | Claude agent |

### 2.15 Explicitly not created (so nobody adds them)
| Item | Why |
|---|---|
| Hero MP4 loop at page load (pear's three random MP4s) | Not in 01. The S01 poster plus the scrubbed sequence replace it. |
| `coda` sequence for S06 | 01 §2.8: the closing burn reveals `--bg`; no clip behind it. |
| "Leaf macro" separate clip (pear-teardown ch. 2) | Folded into s01d. |
| S05 golden droplets / particles | 01 §2.11 bans gold dust and glowing particles. The brief's "golden droplets" is dropped; report it to the client in the storyboard. |
| Real-time product GLB orbit (tech-feasibility `ProductOrbit`) | Replaced by the photographic arc (SEQ-S05P). PRD-PACK-DIMS keeps the option open. |
| Any generated bottle, label, packaging, botanical plate, face or named person | 01 §2.10 "Never generate". |
| Any generated S05 hand | 01 C4: H3 is photo only. |
| Grain or canvas overlays baked into frames | 01 C9. |
| Separate plate annotation overlay textures, a paper normal map, a CSS parchment tile, the `-ink-*.ktx2` plate textures | 04 §7.3 samples one opaque plate map; annotations are baked into it (§2.4); the site has no parchment ground (01 §3). |
| An HDRI or `RoomEnvironment` in the browser | 04 §7.4 lights the specimen with one ambient and one directional light. |
| A painted or photographic OG image | 04 §3.1: the OG image is typographic (PST-OG). |
| v1 assets: `public/story/ch-0..7.avif`, `src/components/three/*` procedural art, `public/{file,globe,next,vercel,window}.svg` | Deleted in WP T0 (04 §1; tech-feasibility §5). |

---

## 3. Poster alt text (put in `src/content/film.ts`, field `posterAlt`)
| Poster | `alt` (≤ 125 characters, no "image of") |
|---|---|
| PST-S01-OPEN | "Painting of a laterite path under coconut palms and jackfruit trees in morning mist, still dark before dawn." |
| PST-S01 | "Painting of a karinochi branch, its five-part leaves catching a shaft of sun in a Kerala forest." |
| PST-S02 | "Engraving of turmeric from Hortus Malabaricus, 1692, on an aged ivory page." |
| PST-S03 | "Painting of amber liquid in a dark earthenware bowl, lit by a narrow beam." |
| PST-S04 | "Painting of two hands drawing a wooden spatula through amber oil in a brass uruli." (ALT build: "Painting of amber oil turning in a slow spiral in a brass uruli.") |
| PST-S05 | "Rujanth Liniment, Mezhu Thailam and Lakshol bottles on dark teak against a painted forest-green ground." |
| Plates (static grid, plants list) | "Engraving of {common name}, {binomial}, from Hortus Malabaricus, volume {V}, {year}." (Withania: its own source.) |

## 4. Credits entries (`src/content/credits.ts`)
Extend the existing `Credit` type to `{ id, title, author, source, sourceUrl, licence, licenceUrl, modified: boolean, usedIn: ("S01"|"S02"|"S03"|"S04"|"S05"|"site")[] }` (asset-sources §0.2). One entry per row in §2 that ships (SEQ, PST, PLT, TEX, GLB, AUD, FNT, PRD, PHO). Generated rows share one entry: title "Painted film scenes", author "Created with generative tools and retouched for AVVVS", licence "All rights reserved, AVVVS". The hand line from 01 §1.3 is a separate entry (NEEDS-AVVVS release). `/credits` renders the list server-side; the footer link reads "Image and sound credits".

---

## 5. MISSING INPUTS

### 5.1 AVVVS must supply
| # | Item | Register ids blocked | Links to 01 §8 |
|---|---|---|---|
| A1 | Signed model release + the vaidyan for REF-HANDS and PRD-H3 | REF-HANDS, KF-S01-D, KF-S04-B, PRD-H3, SEQ-S05P part 2 | N1 |
| A2 | Commission and approve the packshot day (PRD-SIG-6, PRD-ARC-A, PRD-ARC-B, PRD-H3, PRD-PACK-DIMS), with written usage assignment to AVVVS | SEQ-S05P, PST-S05, PRD-SIG-6 | N2 |
| A3 | Label print PDFs or dielines (or flat scans) for the 21 proprietary + 6 signature SKUs | PRD-LABEL-HIRES | store-revamp M8 |
| A4 | Photo of Aragwadharishtam; high-res front and back labels for the 100 products with one image | PRD-MISSING-ARAG, PRD-SHOPIFY-LABEL upgrade | M8 |
| A5 | Vector logo: full colour, one-colour cream, one-colour ink | ICO-LOGO-SVG, ICO-LOGO-CREAM, ICO-LOGO-INK, ICO-FAVICON | N14 |
| A6 | Reference photos of AVVVS's own uruli and kindi, with measurements | REF-VESSELS, KF-S04-*, GLB-B-URULI/KINDI | asset-sources §6.9 |
| A7 | Photos of a live karinochi branch (both leaf faces) | REF-VITEX (botany QC for S01) | — |
| A8 | Pick the about photo and supply its original ≥ 2560 px; a higher-res founder portrait | PHO-ABOUT-WIDE, PHO-FOUNDER | — |
| A9 | Written confirmation that photos scraped from avvvs.com may be reused, and whom to credit | PHO-CONTENT, PHO-ABOUT-WIDE | — |
| A10 | Malayalam-script names for the 5 plates and 3 hero products, checked by a native reader | plate captions, FNT-ANEK-ML use | N6 |
| A11 | Approval of every generated keyframe (KF-*) and every final clip before it ships | all SEQ from generation | — |

### 5.2 Needs a paid service or credits
| # | Item | Estimate of quantity (cost UNVERIFIED: run `get_cost: true` and record) | Register ids |
|---|---|---|---|
| P1 | **Higgsfield paid plan + credits** (pipeline A) | Keyframes: 13 stills × 2 aspects × 4 variants = 104 images, + 2 ALT stills × 2 × 4 = 16, + ≈ 20 inpaint passes. Clips: 11 × 2 aspects × ≈ 3 attempts = 66 video generations (5 s, 1080p). Upscales: ≈ 30 images. | KF-*, SEQ-S01/S03/S04/S05BG |
| P2 | **Photographer**, one studio day + one location half-day (hands, H3) | PRD-SIG-6 (6 SKUs), PRD-ARC-A/B (26 frames), PRD-H3 (3 takes), PRD-PACK-DIMS, REF-HANDS (12 poses) | PRD-*, REF-HANDS |
| P3 | **3D artist** (only if pipeline B: Higgsfield terms refused) | S01–S05 Blender scenes + painterly post, both aspects; GLB-B-VITEX, GLB-B-URULI, GLB-B-KINDI | GLB-B-*, HDR-*, all SEQ |
| P4 | **Retoucher** | Plate marginalia that touches engraved lines (≤ 5 plates); hand paint-over when §6.9 step 3 fires | PLT-*, KF-S01-D, KF-S04-B |
| P5 | **Native Malayalam reader** | ≈ 8 strings | A10 |
| P6 | Optional: **field recordist** in Kozhikode district | 30 min | AUD-FIELD |
| P7 | Optional: a paid hi-res scan if no free PD Withania plate is found (only from a source with a PD or CC0 statement) | 1 plate | PLT-WITHANIA |

Free but account-gated (Arjun, not an agent): Freesound account (AUD-*), Sketchfab account (GLB-B-BANANA). Free installs: KTX-Software 4.4.2, Inkscape 1.x, DaVinci Resolve (optional).

### 5.3 Needs a decision
| # | Decision | Default in this file if nobody decides | Blocks |
|---|---|---|---|
| D1 | Accept Higgsfield's licence-back terms (pipeline A) or pay for pipeline B (N3) | Nothing is generated until accepted in writing. | every SEQ |
| D2 | If no hand release arrives (A1): ship hand-less S01/S04 variants? | Yes: use KF-S01-D-ALT and KF-S04-B-ALT; S05 ships without H3 (set A). | SEQ-S01, SEQ-S04, SEQ-S05P |
| D3 | Plate 6: Ashwagandha, Rasna or none (N4) | None: ring of 5. | PLT-WITHANIA, PLT-RASNA |
| D4 | S05 byte budget +0.2 MB desktop / +0.8 MB phone over tech-feasibility §2 (§1) | Accept; if refused, cut the H3 part of SEQ-S05P to 16 frames and the arc to 7 angles (2° steps). | S05 |
| D5 | Boska (ITF FFL, not OFL) + amending CLAUDE.md "no new fonts" (N12) | Blocked until approved; fallback per design-system-proposal §10.11 is Newsreader (OFL). | FNT-BOSKA, PST-OG |
| D6 | Drop the brief's S05 "golden droplets" (§2.15) | Dropped. | S05 |
| D7 | S01 first-paint poster is a darkened frame (PST-S01-OPEN), not a bright still | Darkened, so the live film has no flash; the bright still is static-mode only. | LCP look |
| D8 | Plate part-name labels baked into the plate texture in IM FELL (TEX-PLATE-ANNOT) with the same words in HTML, versus no baked labels and HTML labels only | Baked into the plate texture + HTML labels with DOM leader lines (01 §2.7 table, 04 §7.2–7.3). | TEX-PLATE-ANNOT |
| D9 | Wellcome Collection (CC BY 4.0) photos as fallbacks if an IA scan crops badly | Allowed with attribution "Wellcome Collection, CC BY 4.0". | PLT-* |
| D10 | Use the old-site AVVVS photos (PHO-CONTENT) on v2 pages before rights are confirmed | Not shipped to production until A9. | PHO-* |
| D11 | Reinstate "reimagined" (C7) and a blue sky (C3) | Not reinstated (01). | none in this register |
| D12 | Definition of the tier-1 wide sequence set `s` (04 references a §14.4 that is not written) | 960×540, every 2nd `d` frame, WebP q70, avg ≤ 28 KB (§0.3). | SEQ-S01, S03, S04, S05BG |
| D13 | S01 split into 4 clips (adds the hand clip) instead of 04's 3 `S01_CLIPS` ranges | 4 clips of 24 / 16 frames (§0.3). | SEQ-S01, `timeline.ts` |

### 5.4 Known conflicts with other plan files (the film WP fixes the other file, not this one)
| # | Conflict | Resolution |
|---|---|---|
| K1 | 01 §5.2 names plate exports `s02-<slug>-2048.avif` and `-ink-2048.png`; 04 §2 uses `public/film/plates/<slug>-<size>.<hash8>.{ktx2,avif,webp}` | 04's paths (§0.2). The ink PNG is an intermediate only. |
| K2 | 04 §5.1 `S01_CLIPS` has 3 ranges (wide, descent, macro) | Replace with `{ wide: [0, 23], descent: [24, 47], hand: [48, 71], macro: [72, 95] }` (D13). |
| K3 | 04 §5.1 `RING_ORIGIN.m = [0.50, 0.66]` (y-up) puts the ring origin in the phone copy zone (01 §2.1: subject at y 0.58–0.78 from the top) | `m: [0.50, 0.34]` y-up (= 0.66 from the top); desktop `[0.68, 0.55]` stays. Replace both with the values measured on the shipped S04 last frame. |
| K4 | 04 §6.3 maps the product layer linearly over S05 local 0.15–0.88 | Add the two-segment map in SEQ-S05P (arc 0.15–0.78, H3 0.78–0.88) when H3 ships; keep linear when it does not. |
| K5 | 04 §1.4 / §2 reference §11–§19 (asset pipeline, budgets, `s` set, Blender export) that are not written in 04 | This register's §0.3, §1, §6.6 and §2.6 are the spec until 04 is completed. |
| K6 | tech-feasibility proposed a 512² KTX2 grain texture and a 360° turntable | 04 wins: `noise-256.png` RG value noise (TEX-NOISE) and a 0°–35° turntable (SEQ-S02TURN). |

---

## 6. Image-generation runbook (pipeline A)

### 6.1 Gates (all must be true before the first paid call)
1. D1 accepted **in writing** by AVVVS; a paid Higgsfield plan is active. Record the date and plan name in `docs/research/imagery-log.md`.
2. For KF-S01-D and KF-S04-B: REF-HANDS and the signed release are in `assets-src/refs/hands/`. Otherwise generate the ALT stills (D2).
3. For KF-S04-*: REF-VESSELS in `assets-src/refs/vessels/` (if missing, generate without it and judge shape against 01 §2.6 and asset-sources §2.3 dimensions).
4. For KF-S03-A: REF-SPECIMEN rendered.
5. Every call first runs with `get_cost: true`; the WP stops if the running total passes the budget AVVVS approved (log each cost).

### 6.2 Tool setup
- Load the Higgsfield tool schemas with ToolSearch (`generate_image`, `generate_video`, `upscale_image`, `upscale_video`, `models_explore`, `media_upload`, `media_confirm`, `job_display`, `jobs_wait`) and **read each schema before the first call**; parameter names below are from asset-sources §3.1 and may have changed.
- Run `models_explore` once and record in the log: (a) whether `nano_banana_2_1` still accepts `seed` and image references, and its largest 16:9 output size; (b) which video model accepts **both a start frame and an end frame** (asset-sources lists `minimax_h3` with keyframes; check `kling3_0` and `seedance_2_5` too). Default image model: `nano_banana_2_1`. Default video model: the first of `minimax_h3`, `kling3_0`, `seedance_2_5` that supports start + end frames at 1080p and 24 fps. If none supports an end frame, stop and report: scenes must not contain cuts.
- Upload each reference (REF-HANDS selects, REF-VESSELS, REF-SPECIMEN, and later the approved S01 hero still) with `media_upload` → PUT → `media_confirm`; record each `media_id` in the log.
- The **style reference**: after KF-S01-C (desktop) is approved, attach it to every later image call as the style image (the role the schema calls a style or image reference). The first three S01 stills are generated before it exists; regenerate KF-S01-A and B with it attached if their side-by-side mean L differs by more than 0.05.

### 6.3 Fixed prompt strings
Build every image prompt as: `PREFIX + PALETTE + ", " + SUBJECT + ", " + COMPOSITION + ", exactly one saturated accent: " + ACCENT + ", " + SUFFIX + " " + NEGATIVE`. Hand stills append `HAND` right after SUBJECT. Do not paraphrase these strings.

```
PREFIX = "Oil painting in the late-19th-century Indian academic realist tradition (Raja Ravi Varma school), smooth glazed brushwork, thin glazes over a warm umber ground, visible strokes only in foliage and cloth folds, soft lost-and-found edges, single motivated light from the upper left at 40 degrees, lifted shadows that keep detail, restrained palette of raw umber, yellow ochre, terre verte, lead white and ivory black, "

SUFFIX = "museum photograph of the canvas, matte varnish, fine canvas weave in the highlights, no text, no signature, no frame, no border, no watermark."

NEGATIVE = "No text, no letters, no watermark, no signature, no logo, no extra or fused fingers, no six fingers, no jewellery, no rings, no face, no lab coat, no gloves, no glassware or laboratory, no glow, no glowing particles, no gold dust, no bokeh orbs, no lens flare, no HDR, no fantasy, no neon, no lotus, no mandala, no om symbol, no chakra, no incense smoke swirls, no temple, no religious iconography, no glossy plastic, no 3D render look, no CGI, no anime, no airbrushed skin, no oversaturation, no symmetrical leaves, no blue sky, no bottles, no labels, no packaging."

PALETTE.S01 = "deep forest greens, cool shadow, warm sun shafts through monsoon mist"
PALETTE.S03 = "earth brown, ochre, muted amber, macro"
PALETTE.S04 = "dark umber room, champagne brass, amber oil, warm caustics"
PALETTE.S05 = "deep forest green and near-black, gold rim light"

COMPOSITION.D = "subject in the right 45% of the frame, the left 55% calm, dark and nearly empty, wide 16:9 canvas"
COMPOSITION.M = "subject in the lower middle of the frame between 58% and 78% of the height, the top 40% calm, dark and nearly empty, tall 9:16 canvas"

HAND.H1 = "one weathered right hand entering from the lower right edge, holding a single karinochi leaf by its stalk between thumb and index finger, turning it so the pale underside faces the light, five fingers, sleeve of unbleached cotton at the wrist"
HAND.H2 = "two hands, left hand steadying the rim of a brass uruli, right hand drawing a flat wooden spatula through amber oil, five fingers each, wrists entering from the bottom edge, sleeves of unbleached cotton"
```
(PREFIX, SUFFIX, NEGATIVE, PALETTE and HAND are 01 §2.10 verbatim.)

### 6.4 Per-still prompt slots, seeds and sizes
Seed rule: desktop seed as listed; phone seed = desktop seed + 1000. `count: 4` per call; pick one (§6.7–6.8), save all four as `v{n}.png`. Aspect `16:9` (d) / `9:16` (m) at the model's largest size; then §6.6 step 1 brings it to exactly 2560×1440 / 1440×2560. S05 uses `COMPOSITION.S05` instead of D/M (given in its row).

| KF id | seed (d) | references attached | SUBJECT (exact) | ACCENT (exact) |
|---|---|---|---|---|
| KF-S01-A | 192101 | style (after approval) | "a red laterite path after monsoon rain under tall jackfruit trees and coconut palms, wet laterite holding the light, ferns and broad understorey leaves along the path edges, volumetric mist dense near the canopy and thinner near the ground, at most three sun shafts falling from the upper left, eye-level view down the path through a 24 mm lens, everything in focus" | "one sunlit leaf where the brightest shaft lands" |
| KF-S01-B | 192102 | style | "the same laterite path seen from hip height through a 35 mm lens among understorey shrubs, a karinochi (Vitex negundo) shrub ahead with palmate leaves of five leaflets, dark green above and silver-white and downy beneath, the mist thinner, one sun shaft falling on the shrub" | "the one sunlit karinochi leaf" |
| KF-S01-C | 192103 | style (none on first pass), REF-VITEX | "a single karinochi (Vitex negundo) branch seen through a 50 mm lens, palmate leaves of five lanceolate leaflets on long stalks in opposite pairs, dark green upper surfaces, one leaf lit by the sun shaft, the understorey behind dissolving into soft painted mist, a foreground leaf softly blurred" | "the one sunlit leaf" |
| KF-S01-D | 192104 | style, REF-HANDS (H1 poses), REF-VITEX | "a karinochi branch seen through a 100 mm lens" + `HAND.H1` + ", the leaf's silver-white downy underside catching the sun, the branch behind softly out of focus" | "the one sunlit leaf in the hand" |
| KF-S01-D-ALT | 192114 | style, REF-VITEX | "a karinochi branch seen through a 100 mm lens, one leaf turned by a breath of wind so that its silver-white downy underside faces the sun, the branch behind softly out of focus, no hand, no person" | "the one sunlit leaf" |
| KF-S01-E | 192105 | style, REF-VITEX | "extreme 1:1 macro of the silver-white underside of one karinochi leaflet, the mid-vein running diagonally from lower left to upper right, fine secondary veins and soft down clearly drawn, only the mid-vein plane sharp, a foreground leaflet edge softly blurred, no hand visible" | "the sunlit leaflet" |
| KF-S03-A | 192301 | style, REF-SPECIMEN | "a single fresh ginger rhizome lying on its side on dark earth-brown ground, knobbly pale tan skin with fine rings, one cut end showing pale yellow fibres, the rhizome beginning to split along its fibres, seen through a 100 mm macro lens, lit only by a narrow cone of light from the upper left" | "none, every colour stays muted" |
| KF-S03-B | 192302 | style | "fragments of ginger rhizome falling slowly through darkness and breaking into fine pale powder, a field of suspended powder lit only inside a narrow cone of light from the upper left, a thin warm rim of light on the falling fragments, 100 mm macro" | "none, every colour stays muted" |
| KF-S03-C | 192303 | style | "fine pale powder settling onto the surface of still, perfectly clear liquid in a shallow dark earthenware bowl, the liquid a dark mirror with soft rings where the powder lands, suspended dust in the narrow light cone, 100 mm macro" | "none, every colour stays muted" |
| KF-S03-D | 192304 | style | "the same shallow dark earthenware bowl, the still liquid now a warm transparent amber lit by the narrow cone of light, a little powder still suspended, soft caustic light on the bowl wall, 100 mm macro" | "the amber liquid" |
| KF-S04-A | 192401 | style, REF-VESSELS | "a wide shallow brass uruli with two ring handles on a dark teak table in a dark umber room, seen through an 85 mm lens from 30 degrees above at table height, the long spout of a brass kindi entering from the upper left edge of the frame and pouring a thin stream of amber oil into the uruli, no hands visible, faint painted steam over the uruli" | "the brass" |
| KF-S04-B | 192402 | style, REF-VESSELS, REF-HANDS (H2 poses) | "the same brass uruli on dark teak, 85 mm, 30 degrees above, amber oil inside beginning to turn in a slow spiral" + `HAND.H2` | "the brass" |
| KF-S04-B-ALT | 192412 | style, REF-VESSELS | "the same brass uruli on dark teak, 85 mm, 30 degrees above, a flat wooden spatula resting across the rim, the amber oil inside turning in a slow spiral, no hands, no person" | "the brass" |
| KF-S04-C | 192403 | style, REF-VESSELS | "the same brass uruli on dark teak, 85 mm, 30 degrees above, no hands, the amber oil holding one clear spiral whose centre sits at 68% of the frame width and 45% of the frame height measured from the top, faint painted steam" (phone: "whose centre sits at 50% of the width and 66% of the height measured from the top") | "the brass" |
| KF-S05-BG | 192501 | style | "a dark teak table surface seen through an 85 mm lens from 10 degrees above, a deep forest-green painted background falling to near-black at the edges, out-of-focus tropical leaves of jackfruit and karinochi only in the outer 12% of the frame, a thin warm gold rim of light from the back right grazing the far edge of the teak, the table empty" | "none (the product supplies it)" |

`COMPOSITION.S05` (replaces D/M for KF-S05-BG): desktop "an empty, evenly lit area of teak between 45% and 85% of the frame width where objects will later stand, leaves only at the top and right edges, the left 42% calm and dark, wide 16:9 canvas"; phone "an empty, evenly lit area of teak between 50% and 85% of the frame height, leaves only at the top edge, the top 40% calm and dark, tall 9:16 canvas".

Inpaint (only for hand or botany repairs on a keyframe): model `nano_banana_2`, `is_inpaint: true`, mask media covering only the faulty region plus 24 px; prompt = the full still prompt; seed = still seed + 500. Never inpaint text-like marks into existence; never inpaint plates or products.

### 6.5 Clip prompts (image-to-video)
Settings for every clip: start frame = the earlier KF (graded? no: ungraded final PNG), end frame = the later KF, duration 5 s, 24 fps, 1080p, aspect matching the KF, `count` 1, no audio. Seed (if the model takes one) = start-KF seed + 7. Generate desktop first; generate phone only after the desktop clip passes §6.7.

| clip | start → end | motion prompt (exact) |
|---|---|---|
| s01a | KF-S01-A → KF-S01-B | "Slow forward dolly along the path that lowers from eye height to hip height. Mist drifts slowly from left to right. Leaves stir slightly. No other movement, no cuts, the painting style stays constant." |
| s01b | KF-S01-B → KF-S01-C | "Slow descending push toward the karinochi branch. Mist thins. Leaves stir slightly. No other movement, no cuts, the painting style stays constant." |
| s01c | KF-S01-C → KF-S01-D | "Camera holds still. A right hand enters from the lower right, takes one leaf by its stalk between thumb and index finger and slowly turns it until the pale underside faces the light. Five fingers throughout. No other movement, no cuts." (ALT: "Camera holds still. A breath of wind slowly turns one leaf until its pale underside faces the light. No other movement, no cuts.") |
| s01d | KF-S01-D → KF-S01-E | "Very slow push-in toward the underside of the leaf, about 3% scale. The hand and leaf hold still. No other movement, no cuts." |
| s03a | KF-S03-A → KF-S03-B | "The ginger rhizome splits along its fibres and the fragments fall slowly downward. Very slow push-in, about 2%. No other movement, no cuts." |
| s03b | KF-S03-B → KF-S03-C | "The falling fragments break into fine powder that drifts down and spreads. Very slow push-in, about 2%. No cuts." |
| s03c | KF-S03-C → KF-S03-D | "The powder settles onto the liquid and dissolves while the liquid slowly warms from clear to amber. Very slow push-in, about 2%. No cuts." |
| s04a | KF-S04-A → KF-S04-B | "The amber stream pours into the uruli, then the spout lifts away out of the top-left of the frame, and two hands enter from the bottom edge to the rim. Slow lateral camera drift from left to right, about 2%. No cuts." (ALT end KF-S04-B-ALT: "...the spout lifts away out of the top-left of the frame and a wooden spatula is laid across the rim from the right edge; no hands appear.") |
| s04b | KF-S04-B → KF-S04-C | "The right hand draws the wooden spatula through the oil in a slow inward spiral, the left hand steady on the rim, then both hands withdraw downward out of the frame and the spiral settles. Slow lateral drift from left to right, about 1%. No cuts." (ALT: "The amber oil turns in a slow spiral and settles. Slow lateral drift, about 1%. No cuts.") |
| s04c | KF-S04-C → KF-S04-C (hold) | "The amber spiral holds its form and turns very slightly. Slow lateral drift from left to right, about 1%. Nothing enters the frame. No cuts." |
| s05bg | KF-S05-BG → (no end frame) | "Slow camera arc of 12 degrees around the empty centre of the teak table, moving to the right. The leaves at the edges sway very slightly. The table stays empty. No other movement, no cuts." |

Total S04 lateral drift = 2% + 1% + 1% = 4% (01 §2.6).

### 6.6 Upscale, grade and frame pipeline
1. **Keyframe finish.** If the chosen PNG's long edge is < 2560 px, run `upscale_image` (read its schema; pick the factor that first reaches ≥ 2560; no "creative" or "enhance face" options). Then `sharp(...).resize(2560, 1440, { fit: "cover", kernel: "lanczos3" })` (phone 1440×2560) → `upscaled.png`. Any paint-over (hands, botany) is done on this file in Krita or Photoshop, layers kept as `final.kra`/`.psd`, flattened to `final.png`. Keyframes are **not** graded; the LUT is applied to frames.
2. **Clip check.** If the model returned less than 1080p, run `upscale_video` to 1920×1080 (or 1080×1920). Confirm 24 fps and 120 frames with `ffprobe -count_frames`. Re-time with `-r 24` only if the model returned another rate and the clip is 5 s.
3. **Extract + grade** with `node scripts/film/extract-frames.mjs --scene s01 --clip s01a --device d --version 3`, one call per clip and device. The script runs exactly this ffmpeg command and writes full-resolution graded 16-bit PNGs to `assets-src/frames/<scene>/_raw/<clip>-<device>/`:
   ```
   ffmpeg -i assets-src/clips/s01/s01a-d-v3.mp4 -vf "lut3d=file=assets-src/grade/avvvs-film-base.cube,lut3d=file=assets-src/grade/avvvs-s01.cube" -pix_fmt rgb48be -start_number 1 assets-src/frames/s01/_raw/s01a-d/%04d.png
   ```
   S05 bg uses `avvvs-s05-bg.cube`. Pipeline B renders (`assets-src/renders/<scene>/<d|m>/`) go through the same LUT pass with `--from-png`. Product frames (PRD-*) never pass a LUT. Step 4 then writes the selected, sized frames to `assets-src/frames/<scene>/<d|m|s>/####.png` (04 §2) before WebP encoding.
4. **Encode** with `node scripts/film/build-frames.mjs --scene s01 --clips s01a,s01b,s01c,s01d --device d --count 24` (then `--device m --count 16`; then `--device s`, which derives from the `d` selection per §0.3): selects frames by the §0.3 index rule, resizes with lanczos3, writes WebP per §0.3, renumbers from `0000`, writes the hashed folder and `src/lib/film/manifest.generated.ts` (per scene and set: `base`, `count`, `w`, `h`, `bytes[]`), and fails on a > 10% budget overrun (§1). `npm run check:budgets` re-checks all scenes.
5. **Posters** with `npm run film:posters` (`scripts/film/build-posters.mjs`) per §2.3 (AVIF q50 effort 6).
6. **QC** with `node scripts/film/qc-frames.mjs --scene s01 --device d` (spec in §6.7), then the manual checks; append the results to `docs/research/imagery-log.md`.
7. **Product cut-outs** (SEQ-S05P): from the photographer's TIFF selects, mask in Photoshop "Select Subject" + manual edge, or the Higgsfield `remove_background` tool on a copy (check its schema; the alpha only, never use its RGB output). Keep the contact shadow as a separate multiplied layer, alpha ≤ 0.6. Crop to the §2.8.1 layout on a full 1600×900 / 720×1280 transparent canvas, save to `assets-src/s05/products/<A|B>/####.png`, record lens, height and angle per frame in `assets-src/s05/camera.json`, and encode with `node scripts/film/build-frames.mjs --scene s05p --alpha` (sharp `.webp({ quality: 82, alphaQuality: 90, effort: 6 })`).

### 6.7 QC checklist for every keyframe and every clip (any failure rejects it)
Automated (`scripts/film/qc-frames.mjs`, sharp + an OKLab conversion; checks frames 0, mid and last of each clip, plus every 10th frame for flicker):
| # | Check | Threshold |
|---|---|---|
| Q1 | Palette: mean of the 8×8 downsample vs the scene's mid target (01 §2.2) | ΔE_OK ≤ 0.08 |
| Q2 | Accent: clusters in the 8×8 downsample with chroma > 0.12 | exactly 1 (S01, S03 frames with liquid, S04, S05 bg = 0 allowed); S03 frames before the liquid appears: 0; area ≤ 8% of frame |
| Q3 | Copy zone calm: OKLCH L standard deviation in d x 0.04–0.42 (m y 0.10–0.40) on the 8×8 downsample | ≤ 0.06 |
| Q4 | Tone range: no pixel below L 0.08; whites ≤ L 0.92 (speculars ≤ 0.96); dark-scene midtone mean 0.24–0.38 | as stated (01 §2.3) |
| Q5 | Flicker: mean absolute difference between consecutive frames in a static 10% corner patch | ≤ 4/255 |
| Q6 | Cross-clip consistency: mean L of each clip vs the scene target | ±0.05 |
| Q7 | HTML text contrast: 95th-percentile-luminance pixel inside each headline and caption box (positions from 01 §2.7) | captions ≥ 4.5:1, headlines ≥ 3:1 |

Manual (log the frame numbers looked at):
| # | Check |
|---|---|
| M1 | Zero glyph-like marks at 200% zoom on 4 frames per clip and on every keyframe. |
| M2 | Botany: leaf shape, venation and phyllotaxis match the plant's plate (PLT-VITEX for karinochi: palmate, 5 leaflets, opposite; PLT-ZINGIBER for ginger: knobbly rhizome). If not, the plant gets no caption, and S01 must be regenerated because `s01.caption` names it. |
| M3 | Key light from the upper left within ±20° on frames 0, mid, last (shadows fall lower right). |
| M4 | Brushwork visible in foliage and cloth at 100%; no plastic skin, no HDR micro-contrast. |
| M5 | None of the banned motifs (NEGATIVE list and 01 §2.11); no pear motifs (gilded pear, togas, cerulean halftone sky, seam split). |
| M6 | Kerala material check: laterite, jackfruit, coconut palm, teak, brass uruli and kindi, unbleached cotton; nothing North-Indian, temple or puja. |
| M7 | One camera move per clip; roll ≤ 3°; no cut or jump; no zoom faster than 10% scale over the clip. |
| M8 | Provenance logged (§6.10). |

### 6.8 Hands and anatomy QC (KF-S01-D, KF-S04-B, clips s01c, s01d, s04a, s04b; also PRD-H3 frames)
Check every keyframe at 100% and 200%, and in clips **every 10th frame plus every frame where a finger overlaps another finger, the leaf, the spatula or the rim**. One failure rejects the frame; § 6.9 says what to do.
1. **Count:** exactly 5 digits on every visible hand, counting partly hidden digits by their knuckles. H1 shows exactly one hand; H2 exactly two; no third hand, no detached fingers anywhere in the frame.
2. **Handedness:** H1 is a right hand: seen from the back with fingers pointing up-left, the thumb is on the viewer's left. H2 left hand: thumb on the side nearer the frame centre when the palm faces down onto the rim. Thumbs attach low on the palm (at the wrist side), never level with the finger bases.
3. **Joints:** each finger has 3 segments and bends only toward the palm; the thumb has 2 visible segments; 3 knuckle creases per finger on the back of the hand, 2 on the thumb; no finger bends backward more than 10°.
4. **Proportions:** middle finger longest; index and ring within 10% of each other; little finger tip reaches about the last crease of the ring finger; finger widths taper evenly; palm length ≈ middle-finger length.
5. **Nails:** present on every visible fingertip, on the back side only, oval, aligned with the finger axis; none on the palm side.
6. **Contact and grip:** H1 holds the leaf stalk between the thumb pad and index pad with visible contact and no interpenetration; the leaf hangs from the stalk under gravity. H2 left fingers wrap over the rim (fingertips inside, thumb outside, or the reverse, but consistent across frames); the spatula sits between thumb and fingers like a held tool, not floating.
7. **Wrist and sleeve:** wrist width continuous with the forearm; the sleeve is unbleached cotton, cuff edge clean; optional cream kasavu border ≤ 2% of frame area; no watch, ring, bangle, thread, tattoo, gloves or lab coat.
8. **Skin:** tone matches the REF-HANDS grey-card-corrected skin patch within ΔE_OK 0.05; visible skin texture and creases; no waxy or airbrushed areas; age consistent across frames.
9. **No face** or body beyond the forearm in any frame (01 §1.3).
10. **Lighting:** the hand's shadow falls lower right, consistent with the key; cast shadow on the leaf/rim present where contact happens.
11. **Temporal (clips):** digit count, nail positions and sleeve pattern stay constant in every checked frame; fingers never merge, split, swap or grow; no hand "swims" (shape change > 5% of hand width between consecutive checked frames without a pose change).
12. **PRD-H3 only:** the label of Mezhu Thailam is never covered by more than 25% at any frame and is sharp in the last 6 frames; release on file.

### 6.9 Fix and retry ladder
1. Keyframe fails a hand or botany check: inpaint the region (§6.4), at most **3** inpaint passes per keyframe. Still failing: regenerate with the next seed (seed + 1, + 2 …), at most **6** generations per still.
2. Clip fails: regenerate the clip (same KFs, seed + 1), at most **4** attempts per clip and device.
3. Only if **≤ 3 consecutive frames** fail a hand check in an otherwise passing clip: the Retoucher paints those frames over (logged), or drop them and let the runtime frame crossfade bridge the gap (only if the clip keeps ≥ the §2.1 frame count after selection).
4. Still failing after the limits: stop, log it, and escalate to AVVVS with three options: hand-less ALT (D2), Retoucher paint-over of the keyframe plus a static-camera clip, or pipeline B for that scene.

### 6.10 Log format (`docs/research/imagery-log.md`, one block per keyframe or clip)
```
### KF-S01-D (d) · chosen v3
date: 2026-11-xx · model: nano_banana_2_1 · seed: 192104 · count: 4 · cost: <credits>
prompt: <the full composed prompt, verbatim>
references: style=<media_id>, REF-HANDS=<media_ids>, REF-VITEX=<media_id>
upscale: upscale_image x2 (job <id>) · paint-over: none | <what, by whom>
QC auto: Q1 0.041 · Q2 1 cluster 3.1% · Q3 0.038 · Q4 ok · Q5 n/a · Q6 +0.02 · Q7 caption 6.2:1 headline 4.1:1
QC manual: M1 ok (frames …) · M2 ok · M3 ok · M4 ok · M5 ok · M6 ok · M7 n/a · hands §6.8 1–11 ok
approved by AVVVS: <name, date> | pending
```

---

## 7. Acceptance checks for the asset work package
- [ ] Every id in §2 with status **available** has been fetched, processed and placed at its §0.2 path, or is listed in the WP report with a reason.
- [ ] Every shipped file has a `credits.ts` entry; `grep -c` of shipped files in `public/film` and `public/svg` equals the number of credit `usedIn` references for them.
- [ ] No asset is NC, ND or SA; Sketchfab CC BY rows are credited even though only renders ship.
- [ ] Plate AVIFs ≤ 450 KB at 2048 px, plate KTX2 ≤ 450 KB (2048) / ≤ 150 KB (1024), no pencil marginalia at 100%, baked annotation labels never touch an engraved line, and each caption reference ("Hort. Mal. XI, tab. 11") matches the heading read on the scan. Vitex and Ricinus show no tab number until N5 is resolved.
- [ ] `npm run check:budgets` passes the §1 budgets; `manifest.generated.ts` frame counts equal §2.1 for every set (`d`, `m`, `s`).
- [ ] Every clip and keyframe has a `imagery-log.md` block with Q1–Q7, M1–M8 and (where hands appear) §6.8 1–12 passing, plus AVVVS approval.
- [ ] No generated file contains a bottle, label, packaging, plate, face or text (M1, M5 logged).
- [ ] Product layers: a pixel diff between the photographer's colour-checked select and the shipped WebP shows no hue shift (mean ΔE_OK ≤ 0.02 on the label area).
- [ ] Audio: each file ≤ 1 MB, −30 LUFS ±1, loads only after "Sound on".
- [ ] `npx tsc --noEmit` and `npm run lint` pass, and `http://localhost:3000` renders with whatever assets exist (missing frames fall back to posters; missing posters fall back to the static film text).
