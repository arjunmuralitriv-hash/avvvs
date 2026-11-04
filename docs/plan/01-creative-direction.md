# 01 · Creative direction: AVVVS film and site (v2)

Status: final draft for client review, 2026-11-04. **Every later plan document builds on this one.**
Precedence: `docs/brief/creative-brief.md` (client's words) > **this file** > `docs/research/*` > `PLAN.md` (v1).
Executor: Claude Sonnet 5.5 at medium effort, one work package at a time. When this file gives a number, use it. When it says NEEDS-AVVVS, do not ship that item until the client supplies or approves it.

Inputs read in full: the creative brief; `docs/research/pear-teardown.md`, `catalogue-audit.md`, `asset-sources.md`, `tech-feasibility.md`, `design-system-proposal.md`, `store-revamp.md`; `src/lib/site.ts`; `src/content/{story,about,treatments}.ts`; `src/content/catalogue.generated.json`.

Claim markers used in this file:
- **VERIFIED (source)**: stated in AVVVS's own material (old site via `src/content/*`, `src/lib/site.ts`, the store JSON, a printed label photo) or read off a public-domain scan.
- **NEEDS-AVVVS**: not verified. AVVVS must supply or approve it before launch.
- **TONE**: a line that makes no factual claim. The client still approves it.

---

## 0. Decisions this file makes (read first)

| # | Question | Decision | Why |
|---|---|---|---|
| C1 | What is the film made of? | Pre-rendered **painted frames** scrubbed by scroll for S01, S03, S04 and the S05 move. A real-time three.js scene only for the S02 plate ring and the S02→S03 specimen. All composited in **one** WebGL canvas by **one** custom composite shader. | pear.no's look comes from painted frames plus one shader (pear-teardown §0). tech-feasibility D1–D2 shows it fits the budget. |
| C2 | Painting genre | **Kerala academic realism**: late-19th-century Indian academic oil painting (the Raja Ravi Varma school), smooth glazed brushwork, one motivated light from the upper left. | It is pear's genre (academic classical realism, pear-teardown §2.1) moved to Kerala, so it is "exactly like pear.no" in style without copying a single pear motif. |
| C3 | Flat cerulean sky? | **No.** No flat blue field anywhere in the film. AVVVS blue appears only in the site UI (accent and footer). | pear-teardown §6 lists the cerulean field as pear's signature. The brief fixes the film palette (green → ivory → earth → amber → green-black). |
| C4 | Where do hands appear? | **Three times**: S01 end (the hand lifts the leaf), S04 (both hands compounding in a brass uruli), S05 end (the hand sets the real bottle down; real photograph only). **Never** in S02 and S03. | See §1.3. |
| C5 | Which plants are on the plates? | **Five locked plates + one conditional**: Nirgundi, Eranda (castor), Tila (sesame), Haridra (turmeric), Shunti (ginger); Ashwagandha only if a ≥ 2000 px public-domain scan is found. | Only botanicals that AVVVS itself prints (blog list or back label) and that have a usable public-domain engraving (§5). |
| C6 | Which products are the S05 heroes? | **Rujanth Liniment** (centre), **Mezhu Thailam**, **Lakshol**. | All three are AVVVS signature products (`org.signatureProducts`), and between them they contain every locked plate plant (§5.3). The film's plants end up in the film's bottles. |
| C7 | The brief's S05 line "Ancient Wisdom. Thoughtfully Reimagined." | **Not used** by default. | "Reimagined" implies changed formulas, which is untrue for classical medicines (design-system-proposal §10 item 7). The client may reinstate it (NEEDS-AVVVS). |
| C8 | Type | **Boska** (display) + **Geist** (text and UI), as in design-system-proposal §2, with one change: film headlines and the h1 use **Boska Light 300**. | pear's display face is a light serif at weight 300 (pear-teardown §2.5). Boska 400 stays for site h2s. |
| C9 | Grain | **No grain baked into frames.** Runtime grain only, in the composite shader, at 0.018 (parchment) / 0.028 (dark scenes) amplitude, updated at 24 fps. | pear has no global grain overlay (pear-teardown §2.3). Baked grain also adds roughly a third to WebP frame size. |
| C10 | Scroll feel | Lenis `lerp: 0.085`, off for `prefers-reduced-motion` and `pointer: coarse`. GSAP ScrollTrigger reads the scroll (tech-feasibility D3, D5). | 0.085 is pear's measured lerp. tech-feasibility proposed 0.1; the client asked for pear's feel. |
| C11 | Film length | Recommend a track of **1400vh desktop / 1000vh mobile**, using the scene shares from tech-feasibility §3.2. The storyboard (doc 02) may retime it. | pear runs 5350vh; tech-feasibility proposed 1100vh. 1400vh gives S02 (the signature scene) about 450vh. |
| C12 | One easing curve | `cubic-bezier(0.16, 1, 0.3, 1)` for all UI and film-text motion. Scrubbed film motion is linear in scroll, and camera curves carry their own easing inside the timeline. | One curve keeps the site consistent. It is close to pear's `(.22,1,.36,1)`. |
| C13 | Image pipeline | **Default A:** generated painted keyframes, then image-to-video with one camera move, frame-extracted and graded. **Fallback B:** Blender renders with a baked painterly post. Both go through the same LUT (§2.9). | A is cheaper and closest to pear (pear-teardown §2.1). B is used if the client rejects Higgsfield's licence-back terms (asset-sources §3.2). |

Working title (internal only, never on screen): **From Nature to Essence**, the brief's name for the concept.

---

## 1. Concept

### 1.1 The concept in one sentence
**A vaidyan's hand lifts one leaf from a Kerala forest, and the film follows it through the 17th-century engravings of Malabar's plants into the three medicines AVVVS is known for.**

Competitor test (design-system-proposal §1): put Kottakkal or Kama in that sentence and it breaks. Kottakkal is not in Kozhikode and is not known for Rujanth. Kama makes no classical medicines. *Hortus Malabaricus* is the flora of AVVVS's own coast.

### 1.2 Logline (the film, 6 scenes)
> Before dawn in a monsoon forest, a hand turns one leaf to the light. The leaf becomes ink on a page printed in 1678, where the plants of Malabar are drawn one by one: karinochi, castor, sesame, turmeric, ginger. A root lifts off the page and breaks into powder, the powder into amber, and in a brass uruli two hands draw the amber into a spiral. The spiral opens on three bottles on dark teak, Rujanth, Mezhu Thailam and Lakshol, made in Kozhikode by a vaidya sala that has done this since 1921. Then the page goes quiet, and the store begins.

### 1.3 Scene spine, with the client's additions folded in

| Scene | Brief beat | What the viewer sees (v2) | pear.no technique used | Hands | Parchment |
|---|---|---|---|---|---|
| **S01 Into the origins** | Near-black → forest flight → descend to one medicinal leaf → macro | Near-black frame fades up on a laterite path under jackfruit and coconut palms in monsoon mist. The camera descends through understorey to one **karinochi (*Vitex negundo*)** branch. **A vaidyan's right hand enters from the lower right, lifts one leaf by its stalk and turns it**, so the silver-white underside catches the light. Extreme macro of the venation. | Scroll-scrubbed painted sequence. Painted (not optical) depth of field. | **H1** | — |
| **S02 The botanical archive** | Leaf → ink; parchment space; 3D ring of plates; plate comes forward; annotations draw; parchment dissolves to a specimen | The venation turns into sepia ink line, and the frame becomes a procedural paper sheet with palm-leaf shadow moving across it. Five (or six) **real Hortus Malabaricus engravings** stand on a slow ring. Each one comes forward in turn, its annotations draw themselves, and its names appear in HTML. The last plate (ginger) loses its paper, and the rhizome stands free as a 3D specimen. | Procedural paper sheet with moving dapple light (pear-teardown §2.3). Ink multiply-blended into the sheet. Script annotation drawn as a stroke. | none | **Yes: this is the parchment scene** |
| **S03 From illustration to extraction** | Root separates → powder → transparent liquid turns amber → camera moves through particles | The ginger specimen turns, the rhizome breaks along its fibres, and the fragments fall into a field of fine powder on a dark earth ground. The powder settles into still liquid that warms from clear to amber. | **Ember burn** out of the paper into S03. Scrubbed sequence plus GPU powder particles. | none | exits through a burn |
| **S04 The alchemy of nature** | Extracts flow through vessels, combine, swirl, golden spiral | Dark umber ground. A brass **kindi** pours the amber into a wide brass **uruli**. **Two hands**, sleeves of unbleached cotton, steady the uruli and draw a wooden spatula through the oil, so the amber turns into a slow spiral. One gilded object per frame: the brass. | Scrubbed painted sequence. The spiral centre becomes the origin of the next transition. | **H2** | — |
| **S05 The AVVVS reveal** | Spiral fills screen → silhouette → real product → slow orbit → dark botanical ground → branding | A **ring transition** opens from the uruli centre with a gilt crest. Deep forest-green ground, painted leaves at the frame edges. The three **real** products (photographed, never generated) stand on dark teak, Rujanth Liniment in front. A slow 12° camera arc. **A hand sets Mezhu Thailam down beside Rujanth and withdraws**: a real photograph from the packshot session, never generated. | Ring transition with gilt flare. The product is a separate texture layer, never graded or repainted. | **H3** (photo only) | — |
| **S06 Beyond the film** | Into the functional site | The **closing burn** eats the frame from below onto the site's bone ground. The store, the clinic band and the footer follow. | Closing burn into `--bg`. | none | — |

**Why the hands appear exactly where they do**

- **H1, S01 end: the hand lifts the leaf.** It gives the forest-to-archive transition a human cause: someone who knows *which* leaf to take. Karinochi is a real AVVVS choice: it is one of the three Elakizhi leaves (VERIFIED, `treatments.ts`, avvvs.com/treatments) and it is printed in Rujanth Liniment's composition (VERIFIED, catalogue-audit §4). Turning the leaf shows its pale, downy underside, the plant's real field mark, and makes the dramatic light change that hands the scene over to S02.
- **H2, S04: both hands at the uruli.** The brief asks S04 for "craftsmanship, not a pharmaceutical lab". Hands are the plainest sign of craft. Brass and wood replace glassware, so the scene cannot be read as a lab or as a claim about factory machinery. pear-teardown §4.2 already places a "hands" clip here.
- **H3, S05 end: the hand sets the bottle down.** It closes the arc (the hand picks, prepares and presents) and puts a person beside the product without touching the label. **It ships only as a real photograph** of a consenting AVVVS vaidyan from the packshot session (asset-sources §5). A generated hand next to a real label would be a composited fake on a regulated product. If the photo does not exist, S05 ships without H3.
- **No hands in S02.** The plates are the subject there, and the moving palm shadow already implies a person reading. A hand over a real-time 3D ring would need a rigged, licensed hand model, and none exists (asset-sources §2.6). A painted hand pasted over 3D would break the style.
- **No hands in S03.** Particles and liquid read better alone, and a hand would turn the visual metaphor into a statement about a manufacturing step.

**Hand rules (all three appearances).** The hands are never shown with a face, wrist jewellery, rings, a watch, a lab coat or gloves. Sleeves are unbleached cotton (S01, S04), with an optional cream kasavu border showing at most 2% of the frame. Skin tone matches the reference photos of the consenting vaidyan. Each hand passes the finger check in §2.10. On screen the hands are never captioned as a named person. The credits page says: "Hands painted from reference photographs of an AVVVS vaidyan, with consent" (NEEDS-AVVVS: the release form).

---

## 2. Art style bible (the film)

### 2.1 Painting language

| Property | Spec | Measurable check |
|---|---|---|
| Genre | Late-19th-century Indian academic realist oil painting. Serious, quiet labour, never ironic. | Side by side with pear frames at 25% zoom, a reviewer cannot tell the genres apart. Nothing on screen is a pear motif (§2.11). |
| Surface | Smooth glazed oil. Brushwork visible only in foliage, cloth folds and the edges of mist. No impasto, cel shading, visible digital strokes or airbrushed skin. | At 100% crop, foliage shows directional strokes. Skin shows no HDR micro-contrast. |
| Composition (desktop 16:9) | The subject's centre of mass sits at **x = 0.62–0.76, y = 0.45–0.70** (pear's measured anchor is 0.72). The **copy zone is x 0.04–0.42** and is calm. | Copy zone: luminance standard deviation ≤ 0.06 (OKLCH L) on the 8×8 downsample. |
| Composition (phone 9:16, rendered separately) | Subject centre at **x 0.40–0.60, y 0.58–0.78**. **Copy zone is y 0.10–0.40.** | Same variance check on the copy zone. |
| Accent rule | **Exactly one saturated region per frame**, chroma > 0.12, covering at most **8% of the frame area**. S01: the sunlit leaf. S02: none. S03: amber liquid. S04: brass. S05: gold rim light on the bottles (the labels keep their own colours). | Pixel count on the 8×8 downsample: one cluster above chroma 0.12. |
| Depth of field | **Painted, not optical.** Out-of-focus foreground elements blur at a radius of **1.5–3% of frame width**, painted into the frame. No bokeh balls, lens flares or chromatic aberration in frames. Chromatic split happens only inside transition crests. | Visual check on frames 0, mid and last of each clip. |
| Light | One motivated key light from the **upper left, 35–50° above horizontal**, in every painted scene. Shadows fall to the lower right. Fill sits 1.5–2 stops under the key. | Shadow direction within ±20° on frames 0, mid and last of every clip. |
| Text in frames | **Zero.** No letters, signatures, labels or glyph-like marks in painted frames. All words are HTML. | 200% zoom on 4 frames per clip. |

### 2.2 Palette per scene (OKLCH)

All film colours are artwork constants: they do not change with the site theme. "Text" is the HTML colour set over that scene. The tokens are defined in design-system-proposal §3.2 (film art tokens) and are restated in §3.3 below.

| Scene | Ground | Shadow | Mid | Highlight | Accent (≤ 8% area) | Max chroma outside accent | HTML text over it |
|---|---|---|---|---|---|---|---|
| S01 open (first 10% of S01) | `oklch(0.14 0.015 160)` `--film-night` | = ground | — | — | none | 0.03 | `--film-ink` `oklch(0.94 0.01 95)` |
| S01 forest | painted forest | `oklch(0.18 0.03 150)` | `oklch(0.45 0.09 140)` | `oklch(0.90 0.06 95)` (sun shafts) | sunlit leaf `oklch(0.72 0.14 128)` | 0.10 | `--film-ink` |
| S02 archive | sheet `oklch(0.90 0.035 82)` `--film-parchment` | ink `oklch(0.30 0.045 55)` `--film-sepia` | foxing and edges `oklch(0.84 0.045 78)` `--film-parchment-2` | `oklch(0.95 0.025 85)` (dapple highlight) | none | 0.05 | `--film-sepia`; annotations `--film-sepia-soft` `oklch(0.45 0.05 60)` |
| S03 extraction | `oklch(0.30 0.05 60)` `--film-earth` | `oklch(0.22 0.04 50)` | `oklch(0.55 0.10 65)` | `oklch(0.82 0.12 80)` | amber `oklch(0.62 0.13 65)` `--film-amber` | 0.10 | `--film-ink` |
| S04 alchemy | `oklch(0.20 0.03 60)` | `oklch(0.20 0.03 60)` | `oklch(0.65 0.11 80)` | `oklch(0.93 0.08 90)` | brass `oklch(0.72 0.11 80)` | 0.08 | `--film-ink` |
| S05 reveal | `oklch(0.20 0.035 150)` `--film-forest`, vignetting to `oklch(0.14 0.02 155)` | `oklch(0.14 0.02 155)` | `oklch(0.32 0.05 150)` | `oklch(0.85 0.12 85)` | gold rim `oklch(0.762 0.099 80.7)` `--film-gold` | 0.06 (labels exempt) | `--film-ink` |
| Transition ember (burns only) | — | char `oklch(0.20 0.03 50)` | — | — | ember `oklch(0.78 0.155 60)` on a line ≤ 1.04% of frame height | — | — |
| S06 site | `--bg` of the current theme (§3.3) | | | | AVVVS blue on actions only | | `--ink` |

**Product layer exception (S05):** product photographs are **never** colour-graded, repainted, relit or retouched beyond ±0.1 EV exposure and dust removal. Label colours must match the Shopify photos (checked against the ColorChecker shot in the packshot session).

### 2.3 Contrast and tone range

| Scene group | Black point (L) | White point (L) | Midtone L mean, 8×8 | Notes |
|---|---|---|---|---|
| Dark scenes (S01 forest, S03, S04, S05) | 0.10–0.14 | ≤ 0.92 (specular highlights ≤ 0.96) | 0.24–0.38 | Lifted shadows: no pixel below L 0.08. Shadows must hold detail. |
| S01 open | 0.14 | 0.20 | 0.15 | Fade-up: mean L rises from 0.14 to 0.30 across S01 local 0.00–0.12. |
| S02 parchment | 0.28 (ink) | 0.95 | 0.84–0.90 | Ink never darker than L 0.26 (it is sepia, not black). |

- HTML text contrast over frames is measured against the **95th-percentile luminance pixel inside the text's bounding box**, on frames 0, mid and last of each scene. It must reach **≥ 4.5:1** for captions and **≥ 3:1** for headlines at ≥ 32px. If it fails, re-compose the frame first. Use `--scrim` (design-system-proposal §3.2) only as a last resort: a radial patch behind the text block, at most 0.5 alpha, no visible edge.
- No pure black (L 0) and no pure white (L 1) anywhere in the film.

### 2.4 Grain, texture, blur (runtime, in `Composite`)

| Effect | Value | Where |
|---|---|---|
| Grain | Monochrome, per device pixel, `(hash(floor(gl_FragCoord.xy) + seed) − 0.5) × amp`. **amp 0.018** on S02, **0.028** on dark scenes. `seed` changes at 24 Hz, not every frame. | All scenes. Off in static mode. |
| Paper pulp / fibre / tooth / fleck | 0.115 / 0.055 (+0.03 cross fibre) / 0.038 / fleck 0.55 on 1.9% of 3×3 px cells | S02 sheet only (pear-teardown §4.4 item 6, own implementation) |
| Palm-shade dapple on the sheet | depth 0.085, rake 0.35, speed 2.6, scale 2.6 | S02 only. The shadow reads as coconut-palm fronds. |
| Vignette | −0.3 EV at the corners, radius 0.35 | Dark scenes only. None on S02. |
| Scroll-velocity smear | Off by default. If used: directional blur ≤ 0.8% of frame width at velocity ≥ 2, transitions only. | Transitions only |
| DOM blur | **None.** No `backdrop-filter`, no blurred loader. The S01 poster AVIF shows sharp from the first paint. | Site-wide rule (no glass) |

### 2.5 Lighting recipes

| Scene | Key | Fill | Rim / practical | Colour temperature | Atmosphere |
|---|---|---|---|---|---|
| S01 | Sun shafts from upper left, 40°, through canopy gaps; shafts ≤ 3 per frame | Sky bounce from above, −2 stops, cool | — | Key 5200 K, shadows 7000 K | Volumetric mist, painted. Density falls from 0.6 at the top of frame to 0.2 at the leaf. The leaf sits in the one clear shaft. |
| S02 | Window light from upper left, raking 25° across the sheet | Even ambient bounce, −1 stop | none | 4300 K warm archival | Dapple from moving palm fronds (§2.4). Plates cast soft shadows: offset (0.6%, 1.2%) of frame, blur 2%, opacity 0.18. |
| S03 | Low key from upper left, 30°, narrow (a 20° cone) | −2.5 stops | Thin warm rim on the falling fragments | 3600 K | Suspended dust lit only inside the key cone |
| S04 | Single high window, upper left, 45° | −2 stops | The brass catches the key as a hard specular; the oil shows soft caustics | 3400 K | Faint steam over the uruli at ≤ 15% opacity, painted |
| S05 | Large soft key from upper left, 45° | −1.5 stops | **Gold rim light** from back right on the bottle edges, 2–4 px wide at 1600 px | Key 4000 K, rim 3000 K | No haze. Painted leaves frame the edges, out of focus. |

### 2.6 Lens and camera (for prompts, Blender cameras and the real-time S02 camera)
Full-frame equivalents. The camera never rolls more than 3°. One camera move per clip (pear-teardown §5.2).

| Scene | Start | End | Move | DOF (painted) |
|---|---|---|---|---|
| S01 | 24 mm, eye height 1.6 m, looking down the path | 100 mm macro, 1:1, 12 cm from the leaf | Descending dolly-in. The clip boundaries split it into: wide drift (24→35 mm), descent (35→50 mm), macro (100 mm). | Wide: everything sharp. Macro: only the leaf's mid-vein plane sharp, foreground leaf blurred at 3% of frame width. |
| S02 | Real-time `PerspectiveCamera`, vertical fov 28° (≈ 46 mm), z = 6.0, y = 0.15 | Same fov, z = 3.2 for the focused plate | Dolly toward each plate in turn | None (paper is flat). Plates not in focus darken 12% and desaturate 30%, with no blur. |
| S03 | 100 mm macro | 100 mm macro | Slow push through the particle field, about 6% scale | Particles nearer than the focus plane blurred at 1.5–2.5% of frame width |
| S04 | 85 mm, 30° down onto the uruli, table height | 85 mm | 4% lateral drift, left to right | Rim of the uruli sharp, background soft |
| S05 | 85 mm, 10° down | 135 mm | 12° arc around the products, plus a 3% push-in | Bottle labels always sharp. Teak and leaves soft. |

### 2.7 Type over imagery (film)

| Element | Face | Size token | Weight / leading / tracking | Measure | Position desktop | Position phone |
|---|---|---|---|---|---|---|
| S01 title (page `h1`) | Boska | `--step-display` (40 → 116 px) | **300** / 0.95 / −0.03em | ≤ 16ch, 2 lines max | Bottom-left, baseline 8svh above the bottom edge, x from `--margin` | Top zone, y 12–40svh |
| Scene headline (`h2`) | Boska | `--step-head` (32 → 64 px) | **300** / 1.0 / −0.02em | ≤ 26ch, 2 lines max, `text-wrap: balance` | Copy zone x 0.04–0.42; headline bottom at y 0.68 | Copy zone y 0.10–0.40 |
| Caption (`p`) | Geist | `--step-body` (17 → 19 px) | 400 / 1.55 / 0 | ≤ 38ch, 3 lines max | 24px below the headline | 16px below the headline |
| Plate names (S02, HTML) | Boska 400 for the common name; Boska 400 *italic* for the binomial; Geist `--step-small` for the reference line | `--step-head` / `--step-lead` / `--step-small` | as tokens | ≤ 24ch | Right column x 0.58–0.94 (the ring is centred left) | Below the plate, y 0.66–0.92 |
| Malayalam name (plates) | Noto Serif Malayalam via `:lang(ml)` | `--step-lead` | 400 / 1.25 / 0 | — | Under the common name | Under the common name |
| Annotations baked in plate art | IM FELL English italic, baked into the plate texture at build time | — | — | — | On the plate | On the plate |

Rules:
- **No boxes, cards, pills, eyebrows, numbers ("01") or rules** over film frames. Text sits on the painting's calm zone (§2.1).
- **Text reveal:** each line is wrapped in a mask (SplitText, `mask: "lines"`). `yPercent 110 → 0` over **760 ms**, opacity 0 → 1 over **640 ms**, ease `cubic-bezier(0.16,1,0.3,1)`, **60 ms** stagger. It triggers when the scene's local progress passes 0.08 and reverses below 0.08. Exit is opacity 1 → 0 over **400 ms** when local progress passes 0.88. Time-based, not scrubbed.
- **Script accent:** at most one per page: the binomial of the focused plate, drawn as an SVG stroke (DrawSVG, `0% 0%` → `0% 100%`) over **1200 ms**. The same text is in the HTML.
- **Chrome over the film** (nav, Skip film, Sound, Theme) uses `--film-ink` on dark scenes and `--film-sepia` on S02, switched by `data-film-tone="dark|parchment"` on `<html>` when the scene changes (tech-feasibility §3.10). The colour swaps instantly; nothing transitions colour.

### 2.8 Transition vocabulary (each used once)
Every scene change is a print-style destruction that resolves back into a clean painting. No crossfades between scenes, no defocus, no straight wipe edge (pear-teardown §2.4). Each boundary takes **the last 12% of the outgoing scene plus the first 8% of the incoming one**, eased with `t³(t(6t − 15) + 10)`.

| Boundary | Name | Recipe (own GLSL; the parameters are a starting point) | Story reason |
|---|---|---|---|
| S01 → S02 | **Ink bleed** | The leaf frame's luminance is thresholded into line work (`smoothstep(0.42, 0.46, L)` on a Sobel edge map). Ink colour moves toward `--film-sepia` while `uFlat` (the paper mix) rises 0 → 1 under an fBm front (scale 3.0, edge 0.10). Venation is the last thing to go. | The leaf becomes the engraving |
| S02 → S03 | **Ember burn** (oval) | Oval front from the specimen centre, fBm lobes 0.295. Char band 0.31 wide, toward `oklch(0.20 0.03 50)`, Bayer 4×4 stipple. Ember line 1.04% wide in `oklch(0.78 0.155 60)`. Behind the front: S03 frame 0. | The page gives up the specimen |
| S03 → S04 | **Displace** | Noise warp, scale 3.0: `m = smoothstep(n − .1, n + .1, t × 1.25 − .12)`, displacement 0.22 | Powder dissolves into liquid |
| S04 → S05 | **Spiral ring** | Ring from the uruli centre (`uOrigin` = the spiral centre in S04's last frame, stored per clip). Front lobed by `.06·sin(3θ + 0.3t) + .04·sin(5θ − 0.2t)`. Crest 0.08 wide, block-snapped (24 px, then 8 px), R/B split ±0.004, gilt screen flare `vec3(1., .82, .45) × .35`. | The spiral opens on the reveal |
| S05 → S06 | **Closing burn** | Burn from the bottom edge upward, noise 0.06, grain 0.17. Behind the front: the theme's `--bg` (read once per theme change). | The film becomes the page |

Do **not** use pear's seam split, ASCII crest, halftone-cloud field or square burn (pear-teardown §6).

### 2.9 Grading LUT plan
1. **Hero frames.** Pick one approved hero still per scene (S01, S03, S04, S05) and one sheet render for S02.
2. **Master LUT.** In DaVinci Resolve (or Photoshop), grade the S01 hero to the §2.2 targets in linear light. Export a 33-point `.cube`: `assets-src/grade/avvvs-film-base.cube`.
3. **Scene trims.** On top of the base LUT, export one trim per scene: `avvvs-s01.cube`, `avvvs-s03.cube`, `avvvs-s04.cube`, `avvvs-s05-bg.cube`. Each trim moves only lift, gamma, gain and saturation, by at most ±0.06 L and ±0.03 chroma. S02 gets no LUT: its colour is the procedural sheet.
4. **Apply** base + trim to every frame before WebP export, with ffmpeg `lut3d=file=…` in `scripts/build-frames.mjs` (the sharp step runs after it). Products are never graded (§2.2).
5. **Runtime trim.** `Composite` has a per-scene `uGrade` (lift, gamma, gain) and `uScrim` 0–0.18 (multiply toward `vec3(.698,.667,.635)`) to even out warmth between clips from different generations. Constants live in `src/lib/film/timeline.ts`, never inline.
6. **Acceptance:** for every clip, the mean of the 8×8 downsample of frames 0, mid and last lies within **ΔE_OK 0.08** of that scene's mid target in §2.2. The accent rule (§2.1) holds. The record goes in `docs/research/imagery-log.md`.

### 2.10 Image-generation template (pipeline A)
Use the same skeleton for every still and keyframe, so the series reads as one painter's hand. Use the same model, a fixed `seed` (`nano_banana_2_1`), and the approved S01 hero still as a style reference on every later call. Generate only on a **paid plan**, only after the client accepts the licence-back terms in writing (NEEDS-AVVVS, asset-sources §3.2).

```
Oil painting in the late-19th-century Indian academic realist tradition (Raja Ravi Varma school),
smooth glazed brushwork, thin glazes over a warm umber ground, visible strokes only in foliage and
cloth folds, soft lost-and-found edges, single motivated light from the upper left at 40 degrees,
lifted shadows that keep detail, restrained palette of raw umber, yellow ochre, terre verte, lead
white and ivory black, [SCENE PALETTE CLAUSE], [SUBJECT: concrete, physical, Kerala-specific],
[COMPOSITION CLAUSE], exactly one saturated accent: [ACCENT], museum photograph of the canvas,
matte varnish, fine canvas weave in the highlights, no text, no signature, no frame, no border,
no watermark. [NEGATIVE CLAUSE]
```

| Slot | S01 | S03 | S04 | S05 background |
|---|---|---|---|---|
| SCENE PALETTE CLAUSE | "deep forest greens, cool shadow, warm sun shafts through monsoon mist" | "earth brown, ochre, muted amber, macro" | "dark umber room, champagne brass, amber oil, warm caustics" | "deep forest green and near-black, gold rim light" |
| SUBJECT (examples) | "a red laterite path under jackfruit and coconut palms after rain"; "a karinochi (Vitex negundo) branch, palmate leaves of five leaflets, dark green above, silver-white and downy beneath" | "a ginger rhizome breaking along its fibres into fine pale powder" | "a wide shallow brass uruli on dark teak, a brass kindi pouring amber oil" | "dark teak surface, out-of-focus tropical leaves at the frame edges, empty centre for a product" |
| COMPOSITION CLAUSE | "subject in the right 45% of the frame, left 55% calm and dark" | same | same | "centre 40% empty and evenly lit, leaves only in the outer 15%" |
| ACCENT | "the one sunlit leaf" | "the amber liquid" | "the brass" | "none (the product supplies it)" |
| Aspect | 16:9 at 2560 × 1440 for desktop keyframes; 9:16 at 1440 × 2560, generated separately (not cropped) for phone | | | |

**Hand prompts.** Always give the exact pose and count, and always attach a real reference photo of the consenting AVVVS vaidyan (asset-sources §2.6.2) as `medias` role `image`:
- H1: "one weathered right hand entering from the lower right edge, holding a single karinochi leaf by its stalk between thumb and index finger, turning it so the pale underside faces the light, five fingers, sleeve of unbleached cotton at the wrist".
- H2: "two hands, left hand steadying the rim of a brass uruli, right hand drawing a flat wooden spatula through amber oil, five fingers each, wrists entering from the bottom edge, sleeves of unbleached cotton".

**Negative clause.** The models have no negative field, so state it in prose at the end of the prompt:
```
no text, no letters, no watermark, no signature, no logo, no extra or fused fingers, no six fingers,
no jewellery, no rings, no face, no lab coat, no gloves, no glassware or laboratory, no glow, no
glowing particles, no gold dust, no bokeh orbs, no lens flare, no HDR, no fantasy, no neon, no
lotus, no mandala, no om symbol, no chakra, no incense smoke swirls, no temple, no religious
iconography, no glossy plastic, no 3D render look, no CGI, no anime, no airbrushed skin, no
oversaturation, no symmetrical leaves, no blue sky, no bottles, no labels, no packaging
```

**Video (image-to-video).** Start from the approved keyframe. Make 5 s clips at 24 fps with **one** camera move (a 3% dolly-in **or** a 4% lateral drift, never both). Extract to frames, then grade (§2.9).

**Never generate:** botanical plates (S02 uses only real engravings), AVVVS packaging, labels or bottles, faces, named people, or the S05 hand.

**Anti-slop acceptance per clip** (log in `docs/research/imagery-log.md`; any failure rejects the clip):
1. Hands: every 10th frame shows exactly 5 digits per visible hand, nails present, 3 knuckle creases per finger, thumbs on the correct side.
2. Zero glyph-like marks (200% zoom, 4 frames).
3. Botany: leaf shape, venation and phyllotaxis match the named plant's Hortus Malabaricus plate. If they don't, the plant is unnamed and gets no caption.
4. Key light within ±20° of upper left on frames 0, mid and last.
5. Palette: the §2.9 ΔE check, plus exactly one cluster with chroma > 0.12.
6. Flicker: mean absolute difference between consecutive frames in a static 10% corner patch ≤ 4/255.
7. Brushwork visible in foliage at 100%. No plastic skin.
8. All clips pass the same LUT. Side-by-side mean L within ±0.05 of the scene target.
9. None of the banned motifs (§2.11).
10. Provenance logged: model, seed, prompt, date, reference media IDs.

### 2.11 Do and don't

| Do | Don't |
|---|---|
| One subject per frame in the right 45%, calm copy zone | Clutter, several focal points, centred-everything framing |
| Kerala material: laterite, jackfruit, coconut palm, teak, brass uruli and kindi, unbleached cotton | Generic "jungle", fantasy flora, North-Indian or temple props, puja items |
| Real Hortus Malabaricus engravings, retouched only to remove later pencil marks | AI-drawn "botanical" sketches, Köhler-style European colour plates as heroes |
| Real product photos, untouched | Generated or 3D-invented bottles, repainted labels, the v1 procedural bottle |
| Print-artefact transitions that resolve to clean paintings | Crossfades, blur dissolves, glitch for its own sake |
| Brass as the only gold in S04, gold rim light in S05 | Gold dust, glowing particles, lens flares, a gold gradient anywhere |
| HTML text on the calm zone | Text baked into frames, text in boxes, glass panels |
| pear's *principles* (painted frames, one shader, paper with light, 0.085 lerp) | pear's motifs: gilded pear, togas, cerulean halftone sky, seam split, ASCII crest, constellation form, black "Apply" pill, branch-framed FAQ, footer repeating the hero |

---

## 3. UI design system around the film (adopted)

**Adopt `docs/research/design-system-proposal.md` in full** (type §2, colour §3, space §4, components §5, anti-slop rules §8). It replaces `design-system/MASTER.md`. The design-system work package rewrites MASTER.md from this section. **Light is the default**, including when the OS prefers dark. Changes and final decisions are listed below.

### 3.1 Final decisions and the changes from the proposal

| Item | Final | Change from the proposal? |
|---|---|---|
| Display face | **Boska** (Fontshare, ITF FFL), self-hosted with `next/font/local` from `src/app/fonts/boska/`. Weights **300, 400, 400 italic, 500**. Licence text committed beside the files. | **Adds 300** for the h1 and film headlines (C8). If the Fontshare download has no 300, use 400 and record it in the WP report. |
| Text / UI face | **Geist** variable (400, 500, 600), `next/font/google` | none |
| Malayalam | Anek Malayalam (text), Noto Serif Malayalam (display), both `preload: false`, applied only through `lang="ml"` | none |
| Plate lettering | IM FELL English, baked into textures, never loaded as a webfont | none |
| Sizes | Five steps only: `--step-display`, `--step-head`, `--step-lead`, `--step-body`, `--step-small` (proposal §2.2) | none |
| Radius | 0 everywhere. 999px only on the theme toggle and the cart badge. | none |
| Accent | AVVVS blue `oklch(50% 0.133 247.3)`, actions and links only, < 5% of any screen | none |
| Film chrome tokens | `--film-ink` and `--film-sepia`, switched by `data-film-tone`. tech-feasibility's `--film-chrome-ink-*` names are **not** created. | Merges the two docs |
| Easing | One curve, `--ease-out: cubic-bezier(0.16,1,0.3,1)`. `--ease-in-out` is kept only for the drawer and sheet. | none |
| Theme script | Inline in `<head>`, reads `localStorage["avvvs-theme"]` in try/catch, default `light`, no cookies | none |

### 3.2 Fonts in CSS
```css
--font-display: var(--font-boska), "Iowan Old Style", "Palatino Linotype", Georgia, serif;
--font-text: var(--font-geist), ui-sans-serif, "Segoe UI", Roboto, Arial, sans-serif;
--font-ml-text: var(--font-anek-ml), "Noto Sans Malayalam", "Nirmala UI", sans-serif;
--font-ml-display: var(--font-noto-serif-ml), "Noto Serif Malayalam", "Nirmala UI", serif;
```

### 3.3 Tokens (copy into `src/app/styles/tokens.css`; contrast ratios in `docs/research/taste/contrast.txt`)
```css
:root, :root[data-theme="light"] {
  color-scheme: light;
  --bg: oklch(97.5% 0.005 95);  --surface: oklch(94.5% 0.007 95);  --surface-2: oklch(91% 0.009 95);
  --ink: oklch(22% 0.012 170);  --muted: oklch(47% 0.012 170);
  --accent: oklch(50% 0.133 247.3);  --accent-hover: oklch(43% 0.11 248);  --accent-ink: oklch(98.5% 0.006 95);
  --focus: var(--accent);
  --field-brand: oklch(50% 0.133 247.3);  --field-brand-ink: oklch(98.2% 0.048 102.2);
  --field-clinic: oklch(35.6% 0.082 22.1);  --field-clinic-ink: oklch(95% 0.012 90);  --field-clinic-muted: oklch(83% 0.03 40);
  --error: oklch(50.5% 0.185 27);  --success: oklch(48% 0.1 155);
  --scrim: oklch(16% 0.01 170 / 0.5);  --overlay: oklch(16% 0.01 170 / 0.4);
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: oklch(18% 0.01 170);  --surface: oklch(22.5% 0.012 170);  --surface-2: oklch(27% 0.013 170);
  --ink: oklch(92% 0.008 95);  --muted: oklch(72% 0.01 120);
  --accent: oklch(76% 0.1 243);  --accent-hover: oklch(82% 0.08 243);  --accent-ink: oklch(18% 0.01 170);
  --focus: var(--accent);
  --field-brand: oklch(50% 0.133 247.3);  --field-brand-ink: oklch(98.2% 0.048 102.2);
  --field-clinic: oklch(30% 0.07 22.1);  --field-clinic-ink: oklch(93% 0.012 90);  --field-clinic-muted: oklch(80% 0.03 40);
  --error: oklch(72% 0.15 27);  --success: oklch(74% 0.12 155);
  --scrim: oklch(10% 0.01 170 / 0.55);  --overlay: oklch(5% 0.01 170 / 0.6);
}
:root { /* film art: identical in both themes */
  --film-night: oklch(14% 0.015 160);  --film-forest: oklch(20% 0.035 150);  --film-ink: oklch(94% 0.01 95);
  --film-parchment: oklch(90% 0.035 82);  --film-parchment-2: oklch(84% 0.045 78);
  --film-sepia: oklch(30% 0.045 55);  --film-sepia-soft: oklch(45% 0.05 60);
  --film-earth: oklch(30% 0.05 60);  --film-amber: oklch(62% 0.13 65);  --film-gold: oklch(76.2% 0.099 80.7);
  --film-ember: oklch(78% 0.155 60);
}
```
`--film-ember` is new (burn edge, artwork only, never text). Store caution tokens come from store-revamp §5.6: `--store-caution-bg` `oklch(0.965 0.025 85)` / dark `oklch(0.27 0.025 85)`. Its border token is **not** used, because the design system bans outlines: the caution note is a filled `--store-caution-bg` block.

### 3.4 Space and grid (unchanged from proposal §4.1–4.2)
4 px base: `--space-1` 4 … `--space-11` 192. `--margin: clamp(1rem, 0.5rem + 2vw, 2.5rem)`, `--gap: clamp(1rem, 0.75rem + 0.6vw, 1.5rem)`, `--section-gap: clamp(5rem, 1rem + 10vw, 12rem)`, `--nav-h: 64px`. Columns: 4 below 48rem, 8 from 48rem, 12 from 75rem. Left and right margins are equal.

### 3.5 Motion tokens (unchanged from proposal §4.4)
`--dur-press 120ms · --dur-fade 200ms · --dur-panel 320ms · --dur-enter 640ms · --dur-dissolve 1600ms · --stagger 70ms · --rise 24px`. Mirror them in `src/lib/motion/tokens.ts`. Film text uses the §2.7 values (760 / 640 / 60 ms). Hover colour changes are instant. No colour transitions anywhere.

### 3.6 Site composition after the film (the dealt direction, "The place carries it")
Home, in order: `#site` store intro (h2 + lead + primary "Browse medicines") → **band of unequal panels** with the 5 signature products (flex 5/2/3/2/2, 68svh) → the "Plants in our medicines" list (the 5–6 plates as a statement plus a table pushed right, linking to products) → clinic band on `--field-clinic` → about (wide photo, facts) → footer on `--field-brand` with the phone number as the display line. Copy for each is in §4.4.

---

## 4. Copy voice and final copy

### 4.1 Voice (adopted from design-system-proposal §6.1, plus store-revamp §5.5)
1. Say the thing plainly, then stop. Name the medicine, form, size, place and year. One idea per sentence.
2. h1 ≤ 32 characters. h2 ≤ 5 words on site pages. **Film headlines ≤ 12 words** and ≤ 2 lines at 26ch.
3. No medical promises, ever: no "cures", "heals", "treats", "relieves", "boosts", "immunity", "clinically proven", "100% natural", "no side effects", "safe for all", and no disease or condition names on any marketing surface. The build tripwire is `npm run check:claims` (store-revamp §5.5). It also scans `src/content/film.ts` and `src/content/plates.ts`.
4. Banned words: journey, unlock, holistic, wellness journey, curated, artisanal, elevate, seamless, transform, ancient secrets, discover, magic, "experience" as a verb. No tricolon headlines, no "not just X", no exclamation marks, no emoji.
5. Ayurvedic terms as AVVVS uses them (thailam, kashayam, arishtam, choornam, lehyam, ghritham). English plurals: "thailams".
6. Numbers come from data (`org`, Shopify counts), never typed by hand.
7. British/Indian spelling; ₹1,250; "9:00 AM – 1:00 PM".
8. Buttons name the action: "Book a consultation", "Add to cart", "Go to checkout", "Skip film".

### 4.2 Final film copy
Store this in `src/content/film.ts`, one object per line with `{ id, text, source, status }`. `status` is `"verified" | "tone" | "needs-avvvs"`. The build fails if any `needs-avvvs` line renders in production (`process.env.NODE_ENV === "production"` guard in `Film.tsx`).

| ID | Scene, role | Final text | Words | Status and source |
|---|---|---|---|---|
| `s01.title` | S01 title card, page `h1` | **Ayurveda since 1921** | 3 | VERIFIED: `org.foundingYear` 1921 (`src/lib/site.ts`; about.ts line 28, avvvs.com/about-us) |
| `s01.titleLead` | S01, under the h1 | Arya Vaidya Vilasini Vaidya Sala, Kozhikode. | 6 | VERIFIED: `org.name`, `clinic.city` |
| `s01.head` | S01 descent, `h2` | **Rooted in nature. Refined through tradition.** | 6 | TONE: the brief's own suggested S01 headline. No factual claim. |
| `s01.caption` | S01 macro, caption | Karinochi, *Vitex negundo*. One of three leaves we use for Elakizhi. | 11 | VERIFIED: `treatments.ts` Elakizhi ("Karinochiyila", *Vitex negundo*), avvvs.com/treatments |
| `s02.head` | S02 entry, `h2` | **Plants of Malabar, recorded from 1678. Still in our medicines.** | 10 | VERIFIED: *Hortus Malabaricus* vol. 1, Amsterdam 1678 (asset-sources §1.1). Each plate plant appears in AVVVS products (§5) |
| `s02.caption` | S02, caption | Engravings from *Hortus Malabaricus*, Hendrik van Rheede's book of the plants of this coast. | 15 | VERIFIED: asset-sources §1.1 (Malabar flora, Rheede, 12 vols, 1678–1693) |
| `s02.plate.*` | One per plate | See §5.2 (name, binomial, reference, "In:" products, note) | — | per row in §5.2 |
| `s03.head` | S03, `h2` | **Ground into choornam. Cooked slowly into thailam.** | 7 | VERIFIED: "Thailams are cooked slowly in medicated oil" (`story.ts` ch4 ← avvvs.com home). "Choornam" as a powder form: the store form gloss, NEEDS-AVVVS approval (store-revamp M9) |
| `s03.caption` | S03, caption | Mezhu Thailam is one of the formulae handed down at AVVVS. | 10 | VERIFIED: `story.ts` ch4 ("one of the in-house formulae handed down at AVVVS") |
| `s04.head` | S04, `h2` | **Over 300 formulations, classical and our own.** | 7 | VERIFIED: `org.formulations` "300+"; store collections "classical" and "proprietary" (catalogue-audit §2) |
| `s04.caption` | S04, caption | Made at our GMP-certified factory in Kozhikode. | 7 | VERIFIED wording: store About page and avvvs.com/about-us ("present GMP-certified factory", "located in the suburbs of the city"). NEEDS-AVVVS: the certificate (issuer, number) before any body is named (catalogue-audit §9) |
| `s05.head` | S05, `h2` | **Rujanth, Mezhu Thailam and Lakshol. From our Kozhikode factory.** | 9 | VERIFIED: `org.signatureProducts`; factory in Kozhikode suburbs (about.ts line 54). The product set depends on the packshot session (NEEDS-AVVVS, asset-sources §5) |
| `s05.caption` | S05, caption | Three of the medicines AVVVS is known for. Each label lists what is inside. | 14 | VERIFIED: signature products (`org.signatureProducts`); labels print composition (store-revamp §3.2) |
| `s05.productNames` | S05, under the caption | Product names and prices come from Shopify at build time, `titleCase(title)`, with links to the PDPs. | — | VERIFIED: Shopify |
| `handoff.note` | S06 boundary, `--step-small` | Scenes painted for this film. Medicines are made at our factory in Kozhikode. | 13 | VERIFIED (second sentence: about.ts line 54). The first sentence is a required honesty note: S03 and S04 are visual metaphors (brief S03) |
| `chrome.skip` | Fixed control | Skip film | 2 | — |
| `chrome.sound` | Toggle | Sound off / Sound on | — | — |
| `chrome.still` | Footer toggle | Show still images / Play film | — | — |

Alternative for `s05.head`, only if the client asks: "Ancient wisdom. Thoughtfully reimagined." (TONE, NEEDS-AVVVS: "reimagined" must be approved for classical formulations).

### 4.3 Headlines rejected, and why (so nobody re-adds them)
- "Every medicine begins as a named plant." False: Lakshol contains lac resin and Mezhu Thailam contains beeswax (catalogue-audit §4).
- "Sent from Kozhikode." Dispatch location UNVERIFIED (design-system-proposal §10 item 8).
- "Ancient wisdom. Thoughtfully reimagined." See C7.
- Any line naming a body part, condition or benefit (DMR Act exposure, store-revamp §5).

### 4.4 Final copy for key site sections

| Place | Final text | Status and source |
|---|---|---|
| `#site` h2 | **The store** | — |
| `#site` lead | **Classical and proprietary medicines from the Vaidya Sala in Kozhikode.** | VERIFIED: collections; `clinic.city` |
| `#site` buttons | primary "Browse medicines" → `/store`; secondary "Book a consultation" → `/consultation` | — |
| Signature band, h2 | **Known for** | TONE |
| Signature band, items | Product name (Shopify `titleCase`), form and size line, price. Order: Mezhu Thailam, Rujanth Liniment, Rujanth Capsule, Lakshol, Slepan, Red Irons Capsule | VERIFIED: `org.signatureProducts` (Mezhu Thailam, Rujanth, Slepan, Redirons, Lakshol); handles matched in `catalogue.generated.json`. Skip any handle Shopify does not return. |
| Plants list, h2 | **Plants in our medicines** | VERIFIED for the listed plants only (§5) |
| Plants list, statement | **Five plants from the film, and the AVVVS medicines whose labels name them.** | VERIFIED (§5.3) |
| Plants list, table columns | Plant · *Botanical name* · In (product links) | §5.2 data |
| Clinic band, h2 | **The clinic at Annie Hall Road** | VERIFIED: `clinic.street` |
| Clinic band, lead | **Consultations from 9:00 AM to 1:00 PM and 2:00 PM to 5:00 PM, opposite Kozhikode railway station.** | VERIFIED: `clinic.timeSlots`, `clinic.landmark`. NEEDS-AVVVS: open days, before any "open today" wording |
| Clinic band, live line | "Consultations open now, until 1:00 PM" / "Next consultation slot: today, 2:00 PM" (computed in Asia/Kolkata) | VERIFIED slots. Never says "open today" until `clinic.days` exists |
| Clinic band, button | primary "Book a consultation" | — |
| About, h2 | **A vaidya sala since 1921** | VERIFIED: `org.foundingYear` |
| About, paragraph | **Kaloor Neelakantan Vaidyar founded Arya Vaidya Vilasini Vaidya Sala in Kozhikode in 1921, with the blessing of Sree Narayana Guru, as a pharmacy preparing and dispensing Ayurveda medicines.** | VERIFIED: about.ts line 28; `org.founder`, `org.blessing` |
| About, facts (`<dl>`) | Founded: 1921 · Formulations: 300+ · Factory: GMP-certified, Kozhikode · Clinic: Annie Hall Road, Chalappuram | VERIFIED: `org`, about.ts line 97–101. "500k+ customers" is **not** used: it is in `org` but has no stated basis (NEEDS-AVVVS source) |
| Booking h1 / lead | **Book a consultation** / **Pick a day and a slot. The clinic calls you to confirm the time.** | VERIFIED: current form flow |
| Booking success | h2 **Request sent** / "The clinic will call you on {phone} to confirm the time." Shown only after the server returns ok. | — |
| Store h1 / lead | **Medicines** / **{count} classical and proprietary medicines, by form. Not sure what you need? Ask a vaidyan.** ("Ask a vaidyan" links to `/consultation`) | VERIFIED: `count` from Shopify at build time |
| PDP standard caution | "Ayurveda medicines should be taken under the guidance of a qualified vaidyan. Dosage: as directed by the physician." | NEEDS-AVVVS approval (store-revamp M9). The dosage line is VERIFIED from 3 labels |
| PDP consult button | "Ask a vaidyan before buying" | — |
| PDP delivery line | "Delivered in an estimated 3–4 business days after dispatch (Sundays and holidays excluded). Shipping is calculated at checkout." | VERIFIED: avvvsglobal.com/pages/shipping (2023-09-09) |
| Cart footer | "Shipping and taxes are worked out at checkout." | VERIFIED: store cart text |
| Cart empty | "Your cart is empty." / button "Browse medicines" | — |
| Footer display line | **+91 80892 02091** (`tel:`) | VERIFIED: `clinic.phones[0]` |
| Footer second line | **mail@avvvs.com** | VERIFIED: `clinic.email` |
| Footer bottom right | "Arya Vaidya Vilasini Vaidya Sala, Kozhikode, since 1921" | VERIFIED |
| Footer credits link | "Image and sound credits" → `/credits` | Required (asset-sources §0.2) |
| 404 | h1 **Page not found** / "The page may have moved. Try the store or book a consultation." | — |
| Zero search results | "No medicine matches '{q}'. Ask a vaidyan on WhatsApp or book a consultation." | — |

---

## 5. Botanical plates (S02)

### 5.1 Selection rule
A plant gets a plate only if **(a)** AVVVS itself prints its botanical name (an old-site blog composition, catalogue-audit §4, or a back-label photo, store-revamp §3.2) **and (b)** a public-domain engraving at ≥ 2000 px on the long edge is identified (asset-sources §1.2). Herbs named only in product titles do not qualify on their own. The ring is ordered so the S01 leaf opens it and the S03 specimen closes it.

### 5.2 The final list (ring order)

| # | Common | Malayalam (romanised) | Sanskrit | Botanical | In AVVVS products (handle) | Source engraving | One-line note (historical or AVVVS usage, not a product claim) |
|---|---|---|---|---|---|---|---|
| 1 | **Five-leaved chaste tree** | **Karinochi** (VERIFIED: `treatments.ts` "Karinochiyila"); script NEEDS-AVVVS | **Nirgundi** (VERIFIED: AVVVS print, Rujanth Liniment) | ***Vitex negundo*** (VERIFIED: AVVVS print) | Rujanth Liniment (`rujanth-linment`), blog composition. Also the Elakizhi therapy. | *Hortus Malabaricus* vol. 2 (1679), Commons `File:Hortus_Indicus_Malabaricus_BHL463761.jpg`, 5124 × 4234, PD. Species from the Commons category; **tab number UNVERIFIED** (read it off the plate before captioning). | "One of three leaves roasted and tied into the Elakizhi poultice at the AVVVS clinic." VERIFIED (`treatments.ts`, avvvs.com/treatments) |
| 2 | **Castor** | **Avanakku** (UNVERIFIED: from asset-sources, not AVVVS); script NEEDS-AVVVS | **Eranda**, also **Gandharvahasta** (VERIFIED: AVVVS print, Rujanth lists; product titles) | ***Ricinus communis*** (VERIFIED: AVVVS print) | Rujanth Capsule (`rujanth-capsule`), Rujanth Liniment (`rujanth-linment`) (blog lists); Gandharvahastadi Castor Oil (`gandharvahasthadi-castor-oil`), Gandharvahasthadi Kashayam (`gandharvahasthadi-kashayam`), Rasnairandadi Kashayam (`rasnairandadi-kashayam`) (titles); Rasnadi Kashayam label | HM vol. 2, Commons `File:Hortus_Indicus_Malabaricus_BHL463817.jpg`, 5215 × 4209, PD. Category identification; **tab number UNVERIFIED**. | "Its Sanskrit name, Gandharvahasta, gives two AVVVS medicines their names." VERIFIED (product titles) |
| 3 | **Sesame** | **Ellu** (UNVERIFIED modern spelling); historical **"Schit-Elu"** (VERIFIED: plate heading) | **Tila** (VERIFIED: AVVVS print) | ***Sesamum indicum*** (VERIFIED: AVVVS print) | Rujanth Liniment (`rujanth-linment`) ("Tila *Sesamum indicum*"); Mezhu Thailam (`mezhuthailam`) ("Tila Thailam (sesame oil)"). Both blog lists. | **HM vol. 9 (1689) tab. 54 "Schit-Elu"**, IA `Hortus_Indicus_Malabaricus_Volume9/page/n128.jpg`, PD by age, ≥ 5000 px expected (size not measured). VERIFIED heading. | "Sesame oil is the base of Mezhu Thailam and an oil used for Abhyanga at the AVVVS clinic." VERIFIED (catalogue-audit §4; `treatments.ts` Abhyanga) |
| 4 | **Turmeric** | historical **"Manjella kua"** (VERIFIED: plate heading); modern name and script NEEDS-AVVVS | **Haridra**, also **Nisha** (UNVERIFIED as AVVVS print; standard pharmacopoeia name) | ***Curcuma longa*** (VERIFIED: printed on the Lakshol back label, store-revamp §3.2) | Lakshol (`lakshol`), back label; Nisakathakadi Kashayam (`nisakathakadi-kashayam`), title ("Nisa") | **HM vol. 11 (1692) tab. 11 "Manjella Kua"**, IA `Hortus_Indicus_Malabaricus_Volume11/page/n27.jpg`, 10789 × 9031, PDM 1.0. VERIFIED heading. | "Recorded as Manjella kua in *Hortus Malabaricus*, volume 11, 1692." VERIFIED (scan heading) |
| 5 | **Ginger** (S03 specimen) | **Chukku** for dry ginger (VERIFIED: `treatments.ts`, title KOTTAMCHUKKADI); historical **"Inschi kua"** (VERIFIED: plate heading) | **Shunti** (VERIFIED: AVVVS print, Rujanth Capsule) | ***Zingiber officinale*** (VERIFIED: AVVVS print) | Rujanth Capsule (`rujanth-capsule`), blog list; Kottamchukkadi Choornam (`kottam-chukkadi-choornam`), title. Also the Podikizhi therapy. | **HM vol. 11 tab. 12 "Inschi vel Inschi Kua"**, IA `…Volume11/page/n29.jpg`, PDM 1.0. VERIFIED heading. 3D specimen: Poly Haven `food_ginger_01`, CC0, 7,205 tris. | "Dry ginger, chukku, is one of the powders roasted for the Podikizhi poultice." VERIFIED (`treatments.ts` Podikizhi) |
| 6 (conditional) | **Ashwagandha** | NEEDS-AVVVS | **Ashwagandha** (VERIFIED: product titles) | ***Withania somnifera*** (VERIFIED: printed on the Lakshol back label) | Ashwagandha Capsule (`aswaganda-cap`), Aswagandha Choornam (`aswagandha-choornam`), Aswagandharishtam (`aswagandharishtam`), Balaswagandhadi Thailam (`balaswagandhadi-thailam`); Lakshol label | **No usable scan yet.** Flora Graeca t. 233 on Commons is 714 × 1080 (too small). Find a ≥ 2000 px Flora Graeca t. 233 or a Kirtikar & Basu (1918) plate (asset-sources §1.3). | "Named in the titles of four AVVVS medicines, from capsule to thailam." VERIFIED |

**Conditional rule for plate 6:** if a ≥ 2000 px public-domain scan of plate 6 is not committed to `assets-src/plates/` by the end of the asset work package, the ring ships with **5 plates**, and Ashwagandha appears only in the §4.4 plants list and in the store. If a scan arrives, it sits in ring position 5 and ginger moves to 6 (ginger must stay last because it becomes the specimen). Being the only non-Hortus plate, it gets the same retouch targets so it matches the set.

**Per-plate on-screen content** (the brief's "individual plate", using only real data):
- **Classification number:** the real book reference, set as "Hort. Mal. XI, tab. 11" (turmeric), "Hort. Mal. XI, tab. 12" (ginger), "Hort. Mal. IX, tab. 54" (sesame). Vitex and castor show "Hort. Mal. II" with the tab number added only after it is read off the plate. Ashwagandha shows its own source reference. No invented numbering.
- **Common name, binomial, Sanskrit and Malayalam names:** from the table. Every Malayalam-script string must come from AVVVS or a label and be checked by a native reader (design-system-proposal §2.3). Until then, render the romanised name only.
- **Annotations that draw themselves:** only the plate's real labelled structures, in Latin part names (*radix*, *rhizoma*, *folium*, *flos*, *fructus*, *semen*), with leader lines to the structure on the engraving. The coordinates are hand-placed per plate in `src/content/plates.ts`. No measurements or numbers that are not on the engraving.
- **"In:" line:** product names linking to `/products/{handle}`, max 3 per plate, in-stock first.
- **Note:** the one-line note above. **Never** an indication, benefit, dosage or condition.

Plate files: retouch per asset-sources §0.4 (crop to plate border + 3%, remove pencil marginalia, levels paper `oklch(0.94 0.025 85)` / ink `oklch(0.28 0.035 55)`). Export `s02-<slug>-2048.avif` (≤ 450 KB), `-1024.webp`, `-ink-2048.png` (luminance-keyed alpha for the ink-draws effect and for multiply onto the sheet). Each plate gets a credit entry in `src/content/credits.ts`, using the standard Rheede attribution line (asset-sources §1.1).

### 5.3 Why these plates also tie the film together
| Hero product (S05) | Plate plants it contains (AVVVS-printed) |
|---|---|
| Rujanth Liniment | Nirgundi, Eranda, Tila |
| Mezhu Thailam | Tila |
| Lakshol | Haridra (turmeric), Ashwagandha (label) |
| (Rujanth Capsule, signature range) | Eranda, Shunti (ginger) |

### 5.4 Brief candidates and other strong herbs not on the ring

| Plant | Verdict | Reason |
|---|---|---|
| Tulsi *Ocimum tenuiflorum* | **Excluded** | Not in any AVVVS product, title, blog list or treatment (catalogue-audit §6). No safe engraving either. |
| Brahmi | **Excluded** | One product title, out of stock. Species (*Bacopa* or *Centella*) UNVERIFIED for AVVVS. |
| Amla *Phyllanthus emblica* | **Excluded from the ring; reserve** | Named only via "Triphala/dhatri" in 3 titles. AVVVS prints no botanical for it in a sold product (Hairgreens is not sold). The HM 1-38 match is a category match only. |
| Neem *Azadirachta indica* | **Excluded; reserve** | 2 titles only, no AVVVS print |
| Rasna *Alpinia galanga* | **Excluded for now; first upgrade candidate** | Strongest product evidence (8 products, AVVVS print), but **no public-domain engraving located**. If an HM plate is found with the asset-sources §1.4 method and its heading is read, Rasna takes the conditional slot instead of Ashwagandha. |
| Bala *Sida cordifolia* | Excluded | No usable engraving. HM "Bala" is banana, a trap (asset-sources §1.2 row 10). |
| Guduchi, Sahachara | Excluded | No engraving located |
| Erukku *Calotropis*, Ummam *Datura* | Excluded | Elakizhi leaves only, not product ingredients. Datura is toxic. |

---

## 6. Sound design (optional, off by default)

- **Default:** silent. A text toggle **"Sound off"** sits in the film chrome (bottom-left, 44 × 44 px minimum hit area, Geist `--step-small`, `--film-ink` / `--film-sepia` by tone). It is a `<button aria-pressed="false">`. Pressing it changes the label to "Sound on" and `aria-pressed="true"`. The preference is **not** saved: every visit starts silent.
- **Engine:** Web Audio API (`AudioContext` created on the first click). One `GainNode` per scene bed, all into a master gain. Never `<audio autoplay>`.
- **Loudness:** master −30 LUFS integrated, ±1. Fade in 3 s on enable, fade out 0.6 s on disable.
- **Beds (CC0, asset-sources §4).** One 60 s loop per bed, with a 2 s equal-power crossfade at the loop point. Opus 96 kbps (`.opus`) plus an AAC `.m4a` fallback, ≤ 1 MB each, in `public/film/audio/`.

| Scene | Bed | Source (Freesound id) | Gain curve over the scene's local progress |
|---|---|---|---|
| S01 | Dawn chorus fading into Kerala river-side ambience, insects rising toward the macro | 787307 → 332419 (Chalakudy, Kerala; high-pass 60 Hz), insects 615011 | 0 → 1 across 0.00–0.15. The insect layer rises 0 → 0.6 across 0.70–0.95. |
| S02 | Post-rain frogs, very low, plus a paper rustle one-shot as each plate comes forward | 515141 (60 s cut), paper one-shot NEEDS-AVVVS (no CC0 file chosen yet) | Bed 0.35. One-shot at −6 dB relative to the bed. |
| S03–S04 | Water lap, slowed 50% and low-passed at 2 kHz | 524688 | 0.5 |
| S05 | Night forest bed, very low | 417872 | 0.4, out to 0 across S05 local 0.80–1.00 |
| S06 | Silence | — | 0 |

- Between scenes, beds cross-fade over the same scroll band as the visual transition.
- Audio pauses when `document.hidden` and when Skip film is used.
- `prefers-reduced-motion` does not mute sound, but the default stays off.
- In static mode the toggle is not rendered.
- Missing input (optional): a commissioned 30-minute Kozhikode-district forest recording would replace the non-Kerala layers.

---

## 7. Accessibility and reduced-motion principles

1. **Every word is HTML.** The canvas is `aria-hidden="true"` and carries no text, no plate names and no product information that is not also in the server-rendered DOM (CLAUDE.md 3D rule; tech-feasibility D12).
2. **Static film.** It is the default under `prefers-reduced-motion: reduce`, no WebGL 2, GPU tier 0, Save-Data, or 2G. Each scene becomes a normal section: poster AVIF (`alt` written per scene in `film.ts`) + headline + caption. S02 becomes a grid of `<figure>`s (plate image, common name, *binomial*, reference, note). No Lenis, GSAP or three chunk is requested in static mode.
3. **The visitor stays in control.** "Skip film" is the first focusable element in the track and a fixed control, visible from progress 0.02 to 0.92. It works without JS (`href="#site"`). The nav is always reachable. A footer toggle, "Show still images" / "Play film", saves to `localStorage["avvvs-film"]`. Reduced motion still defaults to static even when the toggle says play; playing then needs the explicit click.
4. **No scroll hijack on touch.** Native scroll on `pointer: coarse` and under reduced motion. No pinning (sticky stage only). Keyboard: arrows, PageUp/PageDown and Space scroll normally. Esc while the stage has focus does what Skip film does.
5. **No flashing.** No region may change luminance by more than 0.1 L more than 3 times per second (WCAG 2.3.1). Shader time drift ≤ 0.06 per second. Grain seed updates at 24 Hz with amplitude ≤ 0.028. Transition crests are scroll-driven, never time-looped.
6. **Vestibular care.** Camera roll ≤ 3°. No zoom faster than 10% scale per 100vh of scroll. No parallax on UI text.
7. **Contrast.** All UI pairs per proposal §3.3 (AA or better in both themes). Film text per §2.3 (≥ 4.5:1 captions, ≥ 3:1 headlines ≥ 32px, measured on the 95th-percentile pixel). Chrome over the film is ≥ 4.5:1 against the poster of every scene.
8. **Focus.** `outline: 2px solid var(--focus); outline-offset: 3px` on every interactive element, also over film frames. Over S02, the focus colour is `--film-sepia`, which passes 3:1 against `--film-parchment`.
9. **Language.** `<html lang="en-IN">`. Malayalam strings are wrapped in `lang="ml"`, Hindi in `lang="hi"`. Binomials are in `<i>`, not styled spans.
10. **Motion in the UI.** Transform and opacity only. Under reduced motion every travel is 0 and opacity changes are capped at 120 ms. Nothing autoplays: no video, no audio, no carousel.
11. **Optional S02 inspect mode** (brief S02 "optional"): it opens a `<dialog>` with focus trapped, Esc and "Return to film" both close it, and focus goes back to the plate trigger.
12. **Acceptance:** axe shows 0 serious or critical issues on `/` in live and static modes, in light and dark, at 390 / 768 / 1440 px. Keyboard-only users can reach the store from first load in ≤ 4 Tab presses (Skip to content, Skip film, then the nav).

---

## 8. Missing inputs and NEEDS-AVVVS (consolidated)

| # | Needed | Blocks |
|---|---|---|
| N1 | Signed model release + 12 reference photos of an AVVVS vaidyan's hands (asset-sources §2.6.2) | H1, H2 |
| N2 | Packshot session for Rujanth Liniment, Mezhu Thailam, Lakshol (asset-sources §5 spec), including **H3**: the vaidyan's hand setting Mezhu Thailam down, shot on black | S05, `s05.head` |
| N3 | Written acceptance of Higgsfield's licence-back terms + a paid plan (pipeline A); otherwise pipeline B (Blender) | All painted frames |
| N4 | ≥ 2000 px public-domain scan for Ashwagandha (plate 6), or an HM Rasna plate with its heading read | Plate 6 |
| N5 | Tab numbers for HM vol. 2 Vitex (BHL 463761) and Ricinus (BHL 463817), read off the plates | Plate references 1–2 |
| N6 | Malayalam-script names for all plates and hero products, from labels or AVVVS, checked by a native reader | Malayalam lines |
| N7 | GMP certificate (issuer, number, validity) | Naming any certifying body. The current wording is allowed without it. |
| N8 | Clinic open days and holidays | Any "open today" wording |
| N9 | Approval of the form glosses ("choornam: herbal powder") and the standard caution line | `s03.head`, PDP caution |
| N10 | Client decision on C7 (reinstate "reimagined"?) and C3 (no blue in the film) | `s05.head`, palette |
| N11 | Source for "500k+ customers" in `org`, or remove it | About facts |
| N12 | CLAUDE.md says "no new fonts" and points to v1 `design-system/MASTER.md`. The user must approve amending it for Boska and Geist before the design WP runs. | Design-system WP |
| N13 | A CC0 paper-rustle one-shot (optional) and a Kozhikode forest field recording (optional) | §6 |
| N14 | Vector (SVG) logo + one-colour cream version | Nav, footer |

---

## 9. Acceptance checks for documents and packages that build on this file

- [ ] Every film string renders from `src/content/film.ts` with a `source`. `grep -n "needs-avvvs" src/content/film.ts` lists only items in §8, and none renders in production.
- [ ] `src/content/plates.ts` contains exactly the §5.2 rows (5, or 6 if N4 arrives), ginger last, each with a `credits.ts` entry.
- [ ] `npm run check:claims` scans `film.ts` and `plates.ts` and exits 0.
- [ ] No hex values in components; every colour is a §3.3 token.
- [ ] Each clip's `imagery-log.md` entry shows all 10 anti-slop checks passing (§2.10).
- [ ] The design-system inspector (`design-taste-frontend` `inspect.mjs`) shows 0 FAIL at 390 / 768 / 1440 in light and dark.
- [ ] §7 item 12 passes.
- [ ] `npx tsc --noEmit` and `npm run lint` pass, and `http://localhost:3000` renders.
