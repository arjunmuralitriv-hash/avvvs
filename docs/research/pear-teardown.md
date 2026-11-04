# pear.no teardown: art style, technique and a recipe for AVVVS

Researched 2026-11-04 in a 1440x900 viewport (plus code reading). Sources: the live page https://pear.no/, its bundle `assets/index-BhJdAf8K.js` (324 KB), `assets/index-Bd_JnIbr.css` (62 KB), and sample frames from `/films/...`. Local copies are in the session scratchpad. They are reference only: never commit them and never ship them.

Purpose: AVVVS has to match pear.no's ART STYLE exactly (client's words) while using none of its assets, copy, code or layouts. Section 4 is the build recipe. Section 6 is the do-not-copy list.

Who reads this: Claude Sonnet 5.5 at medium effort, one work package at a time. Every number below is either **MEASURED** (read from pear's code, CSS or DOM) or **PROPOSED** (our spec for AVVVS). Anything not verified is marked **UNVERIFIED**.

---

## 0. The short version

1. **pear.no is not a 3D site.** It runs no three.js, no OGL, no GSAP and no Lenis. What it does have:
   - pre-rendered **painterly image sequences** (WebP frames, 121 to 483 per clip) scrubbed by scroll;
   - three short **hero MP4s** (one picked at random on each load) and an MP4 footer loop;
   - **one hand-written full-screen WebGL1 fragment shader** that composites two frames and performs every transition: ring tear, halftone, noise warp, Bayer dither, ASCII crest, paper sheet, ember burn and dappled light;
   - a second small WebGL transition program;
   - 2D canvases for the hairlines and the constellation;
   - React 19.2.8 for the DOM overlay only.
2. **The art style:** late-19th-century academic / neoclassical oil painting (smooth glazed brushwork, soft north light, porcelain skin, velvet and linen). It is set against either a flat saturated cerulean sky or a near-white ground. One **gilded object** per frame is the hero accent (their golden pear). The texture lives in the paintings and in the transitions, **not** in a global film-grain overlay. Print artefacts (halftone dots, ordered dither, ASCII) appear only *during* a transition, then resolve back to the clean painting.
3. **The type:** a sharp, light, high-contrast display serif (Flecha, weight 300, tight negative tracking), a neutral grotesk for body text (GT Standard), and a tiny tracked uppercase mono for labels (GT Standard Mono). Text sits directly on the painting in the negative space the composition leaves, with no boxes and no scrims.
4. **For AVVVS:** keep the same engine (stills or loops, plus one compositing shader, plus a scroll scrub). Repaint the subject matter as Kerala academic realism in the Raja Ravi Varma tradition. Swap European parchment for real **public-domain Hortus Malabaricus plates** on a procedural paper sheet. Swap the gilded pear for **gilt brass** (uruli, kindi) and **real AVVVS product photography**.

---

## 1. Scene by scene (MEASURED, in scroll order)

How the page is built:
- One `<section class="stage">` that is 5350vh tall: 48,150 px at a 900 px viewport, so the scroll road is 47,250 px.
- Global progress is `p = scrollY / (scrollHeight - innerHeight)`.
- The road is split into nine chapters, measured in units out of 5350: `1200, 600, 300, 900, 300, 600, 500, 250, 700`. In the code these are the constants `T, E, ne, re, ie, ae, oe, se, ce`.
- The canvases are stacked: `.gl` (WebGL, the main film), `.fly` (absolute), `.trans` (fixed, the second WebGL), `.ftx` (fixed), `.lines` (2D, hairlines and constellation).

In the table below, "Y" is scrollY in px.

| # | Y | p | What is on screen | Palette | Light | Painterly or photo | Texture and depth of field | Text on image | How it hands off to the next scene |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 (first paint) | 0 | The hero MP4 behind a heavy blur, about 20 to 30 px. This is the loading state: the frame stays blurred until the video can play. | Cerulean and ivory | Flat daylight | Painting | Blurred | None | The blur clears when the video is ready |
| 2 | 0 (loaded) | 0 | A classical woman with a brass watering can and a laurel-crowned man with secateurs tend a sapling bearing gilded fruit. Above it, a cloud made of **halftone dots**. The logo is centred. | Cerulean sky oklch(0.42 0.11 247); emerald velvet; ivory linen; crimson sash; brass | Soft key light from the upper left; no hard shadows | Academic oil painting | No grain. Everything is in focus: painted depth, no optical DOF | 26px serif tagline under the logo; mono footer metadata at 12px | — |
| 3 | 1,400 | 0.03 | A Corinthian column capital on a tree trunk against blue. Concentric **rings** made of dotted and torn pixels radiate from a point. | Blue, marble white, bark brown | Daylight | Painting | Ring crest made of mosaic and dither | Mono rail label "— THE MODEL" on the left | **Ring transition** (`uMode 5`): a lobed radial front leaves from an origin point in the frame (`origin [.707,.926]` for this film) |
| 4 | 2,600 | 0.05 | Macro: two hands bind a graft onto a branch. A pruning knife sits in the foreground. A soft leaf blurs at the left edge. | Near-white ground; olive leaf; bark; gold-embroidered cuff | Diffuse studio light | Painting, macro framing | **Painted DOF**: the foreground leaf is blurred in the source frame | None | Scroll-scrubbed frames (bridge reel, 121 frames) |
| 5 | 3,800 to 5,400 | 0.08 to 0.11 | The camera drifts through a pear tree. A hand reaches up to a single **gilded** pear among green ones. | Olive and sap green; white sky ground; one gilt accent | Bright, overcast | Painting | Clean; occasional painted foreground blur | 48px serif "We build it." / "We rank it." on the left third, with an 8px mono tag and a 15px sans line beside it | Continuous scrub (the 362-frame "renaissance" reel) |
| 6 | 7,100 | 0.15 | A Renaissance youth in green velvet cuts the gilded pear with a knife. He fills the right 45% of the frame; the left 55% is empty pale ground. | Warm ivory; emerald; gold | Side light from the upper right | Painting | Clean | Rail label only. The left is kept empty for later copy. | Scrub |
| 7 | 8,400 | 0.18 | Two hands pull the pear's halves apart. The frame **splits along the seam**: halves smear sideways with a halftone and dot trail, crosshair registration marks sit at the split, and the camera pushes in. | Ivory; gold | Studio light | Painting being destroyed | Directional motion smear (`uMBlur .012`) plus halftone shred | None | **Seam split**: `uSplit .4`, push-in zoom 2x, roll 0.13 rad, a beige mass hiding the mirrored join (`uSeam .85`) |
| 8 | 9,500 to 11,800 | 0.20 to 0.25 | A flat cerulean field. The previous image dissolves at the edges into **dithered static**. Clouds rendered as **halftone dot clusters** drift across. | oklch(0.42 0.11 247) field; cream dots | None (flat field) | Print graphic | Halftone dots about 7px | Right column: 23px serif heading, 13px sans body, 8px mono chip. The column is about 280px wide. | Static and dither dissolve (Bayer 4x4) |
| 9 | 13,600 | 0.29 | A colossal gilded pear whose top half is still a **halftone screen** while the bottom is painted. A classical worker trowels gold onto it. | Blue; gilt; white linen; red sash | Warm sun from the left | Painting, half "printing" | Halftone resolving into paint (`uMode2 = 2`) | Same right column | Halftone print-in: dots grow on a cloud-shaped fBm front |
| 10 | 16,500 | 0.35 | Scaffolding. A woman holds a blueprint; a man hauls rope. | Blue; marble; timber; red | Daylight | Painting | Clean | Rail label | Scrub (`plan`, 121 frames) |
| 11 | 18,000 | 0.38 | The blueprint fills the frame and the image **turns into paper**: colour drains to a warm sheet tone and fibre appears. | Sheet `#E2D0B1` = oklch(0.864 0.046 81) | Lit sheet | Painting turning into a flat sheet | Pulp, fibre, tooth, flecks (§2.3) | None | **uFlat**: the film is mixed into the procedural paper |
| 12 | 19,500 | 0.41 | A watercolour-and-ink plate: workers on a timber platform build the golden pear by the sea. The plate has **brushed, feathered edges** on the sheet. | Muted watercolour on parchment | Even | Engraving and watercolour plate | Paper tooth | None | The plate "soaks in from the middle" (`uPlan2`) |
| 13 | 21,000 to 22,500 | 0.44 to 0.48 | The plate **draws back** into the left margin (top-down plan view). Large copy appears on the right. | Parchment; dark sepia text oklch(0.26 0.04 80) | Moving leaf-shadow dapple across the sheet | Plate on paper | Paper texture plus dappled light | 78px serif "No fees. A share of the upside.", then a 24px serif lead, then 16px sans body. The column is about 520px. | `uPlan` interpolates the plate rect from full frame to the margin panel |
| 14 | 24,200 | 0.51 | A **burn**: the paper is eaten from below by a dithered, ember-edged front, revealing blue sky and a classical figure underneath. | Parchment giving way to cerulean; ember oklch(0.78 0.155 60) | — | Mixed | Grain 0.17, dither speckle | Copy dissolves with the sheet | **Closing burn** (`uEnd`): char band plus a hot ember line |
| 15 | 25,500 | 0.54 | A woman in white with a red sash prunes a potted pear tree on a marble plinth, against flat blue. | Cerulean; white; red; terracotta-gold | Sun from the upper right | Painting | Halftone remnant at the lower left | 117px serif "We say no more often than yes." on the left; body text below at 50% | Scrub (`tree`, 121 frames) |
| 16 | 28,500 to 34,500 | 0.60 to 0.73 | A **frame of pear branches** around an oval of deep blue sky with one halftone cloud. A rainbow-iridescent highlight on one pear. | Darker, desaturated blue (scrim on); olive; gilt | Low warm light, dusk | Painting | Clean | 117px serif "Asked before" plus a **script word that writes itself** ("signing"). FAQ cards float at different depths, joined by thin leader lines and four-point star marks. | Scrub (`flysky`) with a cut-paper parallax of the FAQ cards |
| 17 | 36,000 | 0.76 | Blue field. A halftone cloud dissolves into an X-shaped hole of denser dots. | Cerulean; cream dots | — | Print graphic | Halftone | None | `trans` sequence on the second WebGL program |
| 18 | 40,500 | 0.86 | An orator in a red toga on marble steps points at a **constellation**: glowing stars joined by lines that link the form fields. | Blue; red; marble; white star glow | Day sky with sparkle | Painting plus 2D overlay | Glass fields: `backdrop-filter: blur(26px) saturate(1.15)` | 20px serif lead, glass inputs, mono CTA pill | Constellation lines drawn on a 2D canvas |
| 19 | 44,500 to 48,150 | 0.94 to 1 | The same composition as the hero (#2): a footer loop MP4 with registration hairlines. | As #2 | As #2 | Painting | — | Logo, 26px tagline, mono org number and email | The page ends on the image it opened with |

**Recurring chrome on every scene:**
- Hairline vertical rules at fixed columns: colour `#ffffff39` (white at 22% alpha).
- Crosshair marks `#ffffff86` (52%) where the rules cross.
- A left rail with the chapter name: a 9px mono uppercase label with a 24px dash before it.
- The logo top-left, about 22px.
- A black pill "APPLY →" top-right: 10px mono, tracking 0.2em.

**Light and dark chrome switch:** pear draws the current frame into an 8x5 canvas, computes average luminance, and toggles `.on-light` on the overlay. The thresholds use hysteresis: luminance above 168 turns it on and below 132 turns it off (185 and 150 at 720px or narrower). The check runs at most every 160 ms. This is how the white UI turns dark on pale frames.

---

## 2. The art-style recipe in measurable terms

### 2.1 Painting language (what the frames are)
- **Genre:** academic classical realism, in the line of Bouguereau, Alma-Tadema and Leighton. Figures in period costume do ordinary labour (watering, grafting, cutting, building). It is serious, not ironic.
- **Surface:** smooth glazed oil. Brushwork is visible only in foliage and drapery folds. There is no impasto, no cel shading and no visible digital painting strokes.
- **Ground:** each frame uses one of two grounds:
  - a flat, saturated **cerulean sky** (about 60% of frames);
  - a **near-white neutral studio ground**, about oklch(0.95 0.005 95) (about 40%).
  - No gradient skies and no landscapes with horizons, except one seascape plate.
- **Accent rule:** exactly **one gilded object** per frame, saturated metallic gold. The rest of the palette is muted.
- **Composition:** the subject sits right of centre. Measured film anchor points are `pos [.72, .6 to .72]`, so the subject centre is 72% across. The opposite 40 to 55% of the frame is calm negative space where the copy goes. Crops are tight (hands, half-figures).
- **Depth of field:** painted, not optical. An occasional foreground leaf is softly blurred inside the frame itself. There is no bokeh balls, no lens flare and no chromatic aberration in the paintings. The only chromatic split happens inside transitions.
- **Source resolution:** frames are 1280x720 and 1440x810 lossy WebP (VP8), about 47 to 94 KB each. The hero films are MP4.
- **Generative origin:** the uniform painted look, the camera drift and the 121- and 362-frame clips strongly suggest AI image-to-video output, frame-extracted. **UNVERIFIED.**

### 2.2 Palette families (MEASURED unless noted)

| Role | Hex | OKLCH | Where |
|---|---|---|---|
| Field / sky | `#015186` (`--color-sky`) | oklch(0.423 0.110 246.8) | Flat blue chapters; painted skies sit within about ±0.06 L of this |
| Page paper | `#f2f1ed` (`--paper`) | oklch(0.958 0.005 95.1) | UI paper, CTA text |
| Ink | `#1d1c19` (`--ink`) | oklch(0.226 0.006 91.6) | Dark chrome, pill background |
| Ink soft | `#33322d` | oklch(0.316 0.009 97.6) | Secondary dark text |
| Sheet (procedural paper) | rgb(226,208,177) `#E2D0B1` | oklch(0.864 0.046 81.3) | Paper chapter |
| Text on the sheet | rgb(46,33,9) `#2E2109` | oklch(0.258 0.042 80.2) | Sepia-black copy on paper |
| Display cream | rgb(255,250,234) `#FFFAEA` | oklch(0.985 0.022 92.5) | Big headings on dark or blue frames |
| Ember | (1.0, 0.62, 0.26) as float | oklch(0.783 0.155 60.3) | Burn edge glow |
| "Renaissance" scrim | `#595551` hard-light, at most 18% | oklch(0.452 0.008 67.6) | Darkens frames by at most about 5% (multiplies by 0.698/0.667/0.635 at full strength, applied at 0.18) |
| Painted families (estimated by eye) | — | Emerald velvet about oklch(0.38 0.07 165); crimson sash about oklch(0.50 0.17 25); gilt about oklch(0.72 0.13 85); olive leaf about oklch(0.55 0.09 120); marble about oklch(0.93 0.01 80) | Inside the paintings |

### 2.3 Grain and texture (MEASURED shader constants)

pear has **no global film-grain overlay**. Texture shows up in only three places.

**1. The paper sheet** (when `uFlat` is above 0). The values below are fractions of the colour value; for example, 0.038 means ±3.8%.
- `pulp` = **0.115**: large fBm at 1.7 cycles per viewport height. Thick pulp shifts warmer: blue × (1 − pulp·0.115·1.7), red × (1 + pulp·0.115·0.3).
- `fibre` = **0.055**: laid fibre, two anisotropic fBm fields. One runs along the sheet at (24, 2.1) cycles; one runs across at (2.8, 38) cycles, weighted 0.55.
- `tooth` = **0.038**: per-device-pixel white noise of ±3.8%.
- `fleck` = **0.55**: dark inclusions on about 1.9% of 3x3 px cells (smoothstep(0.981, 1.0) on a hash). Each fleck darkens to 70% at strength 0.55.

**2. Light on the sheet**, "something moving between it and the sun". This is a dappled leaf-shadow pattern made entirely of sines (no textures).
- Speed 2.6, drift 1.65, jiggle 2.25, scale 2.6.
- Shadow depth **0.085**, which darkens dapples by 8.5%.
- Breathe 2.5.
- Rake **0.35**: a diagonal light gradient weighted 0.62 on x and 0.38 on y.
- Contrast cycle 1.85, with a slow luminance swing of only about 2.2% plus 1.2%.

**3. Transition crests only:**
- halftone cells (`uDot` = 7px);
- Bayer 4x4 ordered dither;
- per-row tear;
- two block-mosaic octaves;
- a radial chroma split;
- a crest re-rendered as **ASCII**: a 5x5 bitmap font made of arithmetic, glyph ramp ` .:-+=*%#@`;
- static sprinkle.

Burn (plate) fields: noise .295, grain .125, dither .052, hash .15. Closing burn: noise .06, grain .17, dither .01, hash .1.

### 2.4 Blur (MEASURED)
- Loader: the hero is shown blurred until the video can play. This is a DOM blur of about 26px; the CSS has `filter: blur(26px)`. Exact element **UNVERIFIED**.
- Glass form fields: `backdrop-filter: blur(26px) saturate(1.15)`. Another component uses `blur(var(--blur, 7px)) saturate(1.22) brightness(1.02)`.
- Shader motion smear on the seam split: `uMBlur 0.012` (1.2% of frame width). Edge softening `uEdgeBl 0.01`, starting at 55% of the burn.
- There are **no** scene-to-scene defocus crossfades. Transitions are print-style destruction, not blur.

### 2.5 Typography (MEASURED at 1440x900)

| Role | Family | Size | Weight | Line height | Tracking | Measure |
|---|---|---|---|---|---|---|
| Mega statement | Flecha L | 116.8px (`clamp(30px, 8.11vw, 177px)`) | 300 | 1.04 | −0.024em | 2 lines, 12 to 16 characters per line |
| Chapter heading (paper) | Flecha M | 77.9px | 300 | 0.88 | −0.02em | 2 lines, about 16 characters per line, 513px |
| H1 | Flecha M | 77.1px | 300 | 1.0 | 0 | 1 line, 22 characters |
| Chapter number word | Flecha L | 66.2px | 300 | 0.98 | −0.015em | — |
| Section line | Flecha M | 47.8px (`clamp(28px, 4.6vw, 82px)`) | 300 | 0.98 | 0 | 1 line, about 12 characters |
| Lead | Flecha S | 20 to 24px | 400 | 1.15 to 1.22 | −0.02em | 434 to 518px, 40 to 45 characters |
| Card heading | Flecha S/M | 23 to 26px | 400 | 1.05 | −0.02em | 178 to 280px, about 20 to 26 characters |
| Body | GT Standard L | 12.8 to 15.8px | 400 | 1.26 to 1.32 | 0 | 190 to 300px, **28 to 45 characters** |
| Label / tag | GT Standard Mono | 8 to 12px, uppercase | 400 to 500 | 1.5 to 1.7 | +0.16 to 0.2em | — |
| Script accent | handwritten word drawn on a canvas ("signing") | about cap height × 1.1 | — | — | — | One word per page |

The CSS also has `max-width` values of 44ch, 46ch, 52ch and 56ch, which cap the measure.

Headlines are split into `.ln > i` line spans, so each line can be masked and revealed separately.

### 2.6 Motion (MEASURED)
- **Scroll smoothing (custom code, not Lenis):**
  - The wheel event is `preventDefault`ed.
  - A target accumulates `deltaY`, and each frame applies `current += (target − current) × 0.085`, snapping when the difference is under 0.08 px.
  - Keyboard steps: arrows ±90px; PageUp/PageDown/Space 0.9 × viewport height.
  - It is **disabled when `prefers-reduced-motion` matches or `pointer: coarse` matches**; those users get native scroll.
- **UI easing:** `--ease: cubic-bezier(.22, 1, .36, 1)` everywhere.
- **Durations:**
  - 0.2s (linear opacity);
  - 0.26s (background colour);
  - 0.38 to 0.42s (colour);
  - 0.46 to 0.52s (small transforms);
  - 0.6 to 0.64s (opacity reveals);
  - 0.76 to 0.82s (line and translate reveals);
  - 0.8s with a 0.4s delay (the rail fading in).
- **JS easing table:** smooth `t²(3−2t)`, smoother (quintic), out-quart, out-expo `1 − 2^(−9t)`, out-back (2.7/1.7), in-out cubic, linear.
- **Film playback:** all scroll-scrubbed, so there is no time-based playback in the story. The time-based exceptions are the hero MP4, the footer loop, the shader's `uTime` drift (noise drifting at 0.02 to 0.06 per second) and the dapple light.

---

## 3. Technique stack, with evidence

| Claim | Evidence |
|---|---|
| **Raw WebGL1**, no three, OGL or GSAP | Bundle counts: `WebGLRenderer` 0, `THREE` 0, `gsap` 0, `ScrollTrigger` 0, `Lenis` 0. Context created with `t.getContext('webgl', {alpha:false, antialias:false, depth:false})`. Two `createProgram` calls. |
| React only for the overlay | `e.version='19.2.8'` in the bundle |
| Full-screen triangle | Vertex shader `attribute vec2 a; vUv = a*0.5+0.5;` and `drawArrays(TRIANGLES, 0, 3)` |
| **Image sequences** | `wt('/films/plan',121,…)`, `wt('/films/coda',89,…)`, `wt('/films/tree',121,…)`, `wt('/films/flysky',121,…)`, `wt('/films/trans',121,…)`. The main reel is `Dt()` = bridge (121) plus `renaissance` (362) = 483 frames. URLs follow `/films/<name>[/768]/f_NNN.webp?r=13`; the model reels follow `/films/model/<name>/<1440|768>/f_NNN.webp`, with a `manifest.json` listing `{tiers:{1440:{count},768:{count}}}`. |
| Video | Hero `w = [{signal.mp4, origin [.707,.926]}, {colossus.mp4, origin [.732,.54]}, {reveal.mp4, origin [.84,.63]}]`, picked at random or with `?hero=`. Footer `footer-loop.mp4` starts playing at more than 50% scroll. |
| Mobile tier | `matchMedia('(max-width: 820px)')` switches to the `/768` frames and enables `#define PHONE` (fBm drops from 4 octaves to 2 for texture; motion fields keep 4) |
| Frame loader | Coarse-to-fine order: strides 32, 16, 8, 4, 2, 1 (`Ct`). A priority window of ±24 frames around the wanted frame (`xt = 24`). Fallback to the nearest loaded frame (`near()`). `img.decode()` pre-warms ±3 frames. Up to 3 retries. Each feed is active only inside its scroll window (`bt(from, to)`). |
| Scroll → progress | `p = scrollY/(scrollHeight − innerHeight)`. Chapter-local `seg = clamp((p − start)/len, 0, 1)`. Frame index = `round(seg × (N − 1))`. Example: `plan` frame = `min(120, round(seg × 120))`. |
| Transition modes (`uMode`) | `['breathe','slice','halftone','displace','static','ring']`, default `ring` (`?t=` overrides). Follow-up treatment (`uMode2`): `['none','slabs','halftone','warp','tear','fine','mosaic','dither','shred','ditherblock']`. Overlap windows `{overlap:[.4,1], after:[.7,1]}`. |
| Uniform families | Framing: `uPanPx, uPanY, uZoom`. Transition: `uT, uT2, uDot, uScale, uOrigin, uGlow`. Seam: `uSplit, uSeam, uSeamSoft, uSeamWH, uSeamCol, uReelZ, uDrift, uMBlur, uSpin, uEdgeBl`. Burn: `uBurn, uBurnX, uBurnY, uBurnAB, uBurnFld, uBurnChr, uShape, uPlateZ`. Paper: `uFlat, uPaperC, uPap, uRay1, uRay2`. Plate: `uPlan, uPlan2, uPlan3, uP`. Close: `uCoda, uEnd, uEndF, uEndC, uDrag`. Grade: `uScrim`. Textures: `uA` (film), `uB` (reel), `uC` (plate), `uE` (closing film), `uG` (behind the burn), `uP` (plan plate). |
| Noise | `hash` = `fract(sin(dot(p, vec2(127.1, 311.7))) × 43758.5453)`. Value noise; fBm with 4 octaves, lacunarity 2.03, gain 0.5. Bayer 2x2 nested into 4x4. |
| Second program (`.trans` canvas) | Uniforms `progress, grade, scaleB, mode, radius, width, intensity, time`. Modes: (0) a centre-opening noisy circular front with both pictures scaling through it; (1) vertical displacement with value noise; (2) a bottom-up wipe with scale; (3) crossfade or cut. `lift()` = a saturation grade around Rec.709 luma. |
| Fonts | `document.fonts`: Flecha S, M and L (300 and 400), GT Standard L (400 and 500), GT Standard Mono (400). Fallbacks: Iowan Old Style; ui-sans-serif / Helvetica Neue; ui-monospace. Both are commercial Grilli Type families. |
| Shader cost control | Branches skip work once a layer fully covers the frame ("dead road is not drawn") |

---

## 4. Recipe: the pear art style rebuilt for AVVVS (PROPOSED)

### 4.1 Engine decision
- **Do not build a real-time 3D forest.** pear proves the look comes from painted frames plus one compositing shader. This also replaces the bland v1 procedural scenes in `src/components/three/*`. Do not build on their art direction.
- **Renderer:** `three@0.187` (already installed) used only as a full-screen-triangle host:
  - `new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })`;
  - `THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)`;
  - one `THREE.Mesh(fullscreenTriangleGeometry, THREE.RawShaderMaterial)` with GLSL ES 1.0.
  - No R3F for the film, which keeps the chunk small.
  - Pixel ratio `Math.min(devicePixelRatio, 1.5)`, or 1 on phones.
- **Files:**
  - `src/components/three/film/FilmStage.tsx` (`"use client"`, loaded via `next/dynamic({ ssr: false })` from `src/components/story/Film.tsx`)
  - `film/composite.frag.glsl.ts` (exports the shader string)
  - `film/sequence.ts` (frame loader)
  - `film/road.ts` (chapter table)
  - `film/useScrollProgress.ts`
- **Scroll:** `lenis@1.3` with `{ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 }`. This matches pear's 0.085 per-frame lerp. Do not create Lenis when `matchMedia('(prefers-reduced-motion: reduce)').matches` or `matchMedia('(pointer: coarse)').matches`; use native scroll there, as pear does. **GSAP is not needed.**
- **Stage:** `<section class="film" style="height: 4400vh">` with a `position: sticky; top: 0; height: 100svh` canvas wrapper. Progress `p = clamp(scrollY − sectionTop, 0, sectionHeight − innerHeight) / (sectionHeight − innerHeight)`.
- **Static fallback (required):** for reduced motion, missing WebGL or a low GPU tier, render each chapter as a 100svh `<figure>` with its key still (AVIF) and the same HTML copy, stacked vertically. Every word of copy lives in server-rendered HTML; the canvas carries no text.

### 4.2 Road (chapter table, PROPOSED; the master plan may retime)
Units are out of 4400 (one unit = 1vh). The section is 4400vh, so the road is 43 viewports.

| Ch | Units | p range | Brief scene | Clip (frames) | Entry transition (`uMode`) | Copy slot |
|---|---|---|---|---|---|---|
| 1 | 0 to 800 | 0 to .182 | 01 Into the origins: a Kerala forest drift, descending to one leaf | `forest` (121) after a hero loop MP4 (5s, muted, `playsinline`) | Hero: blur 24px → 0 over 600ms when `canplay` fires | Left 40%: H1 at mega size |
| 2 | 800 to 1150 | .182 to .261 | Leaf macro → ink | `leaf-macro` (89) | `displace`: noise warp, scale 3.0, front `smoothstep(n − .10, n + .10, t·1.25 − .12)` | None |
| 3 | 1150 to 2000 | .261 to .455 | 02 Botanical archives: the parchment sheet, plates soak in, draw back to the margin, and cycle (one per **verified** ingredient) | Stills: Hortus Malabaricus plates (§5.2) | `uFlat` 0 → 1 over 150 units into the paper sheet | Right column 520px: 78px heading, 24px lead, 16px body |
| 4 | 2000 to 2600 | .455 to .591 | 03 Illustration to extraction: roots, powder, amber | `roots` (121) | **Burn** out of the paper: square front, ember edge | Left 40% |
| 5 | 2600 to 3300 | .591 to .75 | 04 Alchemy: a vaidyan's hands compounding in a brass uruli | `hands` (121) | `halftone`: dots grow on an fBm front, `uDot` = 7px | Right 40% |
| 6 | 3300 to 3900 | .75 to .886 | 05 The reveal: real AVVVS product photos composited into a painted dark-botanical plate | `reveal-bg` (89) plus the product as a separate texture layer | **Ring** from the uruli centre (`uOrigin`), lobed front, gilt flare | Left 40%: product name from Shopify |
| 7 | 3900 to 4400 | .886 to 1 | 06 Beyond the film: the closing burn onto page paper, and the site begins | `coda` (89) | **Closing burn** onto `--color-paper` | Nav and CTAs in HTML |

**Mapping rules:**
- `seg = clamp((p − start)/(end − start), 0, 1)`.
- Frame = `Math.round(seg × (N − 1))`.
- A transition occupies the **last 12% of the outgoing chapter plus the first 8% of the incoming one**.
- Ease the transition progress with smoother: `t³(t(6t − 15) + 10)`.

### 4.3 Frame and sequence spec
- **Desktop tier:** 1440x810. **Mobile tier** (820px or narrower): 768x432 for cover-fit at landscape, plus a **separate portrait crop** 720x1280 for phones when the subject would be cropped.
- **Encoding:** WebP lossy q=72. Target ≤ 70 KB per desktop frame and ≤ 25 KB per mobile frame.

  ```
  ffmpeg -i clip.mp4 -vf "fps=24,scale=1440:810:flags=lanczos" -frames:v 121 -c:v libwebp -quality 72 -compression_level 6 public/film/<clip>/1440/f_%03d.webp
  ```

- **121 frames = 5.04 s at 24 fps.** Write a `manifest.json` per clip: `{ "tiers": { "1440": { "count": 121 }, "768": { "count": 121 } }, "poster": "poster.avif" }`.
- **Loader (`film/sequence.ts`):**
  - Order frames coarse-to-fine with strides 32, 16, 8, 4, 2, 1.
  - Keep a priority window of ±24 around the wanted frame.
  - Run at most 6 concurrent `Image()` loads with `decoding = 'async'`.
  - Call `decode()` on ±3 neighbours.
  - When a frame is missing, draw the nearest loaded one.
  - Activate a clip only while `p` is inside `[start − 0.03, end + 0.03]`.
  - Upload with `texture.image = img; texture.needsUpdate = true`, only when the index changes.
- **Budget conflict:** PLAN.md §6.1 caps hero 3D assets at 1.2 MB. Seven clips at about 121 × 60 KB is about 50 MB of streamed frames. **The budget must be revised.** Propose: first paint ≤ 1.2 MB (poster AVIF plus the first 5 strided frames); the rest streamed after first paint, never blocking LCP. Listed as an open question.

### 4.4 Composite shader spec (write our own; do not paste pear's GLSL)
`composite.frag` (GLSL ES 1.0, `precision mediump float`).

**Uniforms:**

```
uniform sampler2D uA, uB;        // outgoing and incoming frame
uniform vec2  uRes, uResA, uResB;
uniform float uT;                // transition 0..1
uniform int   uMode;             // 0 crossfade, 1 displace, 2 halftone, 3 ring, 4 burn
uniform float uTime;
uniform vec2  uOrigin;           // ring origin in A's uv
uniform float uDot;              // halftone cell px, 7.0
uniform float uScale;            // displace noise scale, 3.0
uniform float uFlat;             // paper mix 0..1
uniform vec3  uPaper;            // sheet colour
uniform vec4  uPap;              // pulp .115, fibre .055, tooth .038, fleck .55
uniform vec4  uDapple;           // depth .085, rake .35, speed 2.6, scale 2.6
uniform sampler2D uPlate; uniform vec2 uResP;
uniform vec4  uPlateRect;        // xywh in uv: full frame (0,0,1,1) → margin (.06,.14,.40,.72)
uniform float uPlateOpen;        // 0..1 soak-in from the centre
uniform float uBurn;             // 0..1
uniform vec3  uEmber;            // vec3(1.0, .62, .26)
uniform float uScrim;            // 0...18
```

**Building blocks** (each is a GLSL function; write it from the description):

1. **`coverFit(uv, texRes)`:** cover-fit a 16:9 frame into any viewport, plus an optional `panPx` so phones can keep the subject.
2. **`hash`, `vnoise`, `fbm`:** 4 octaves, lacunarity 2.03, gain 0.5. Add a `PHONE` define that drops texture fBm to 2 octaves.
3. **Displace (`uMode 1`):**
   - `n = fbm(uv × uScale)` and `d = vec2(n − .5, fbm(uv × uScale + 19.) − .5)`;
   - `m = smoothstep(n − .1, n + .1, uT × 1.25 − .12)`;
   - `col = mix(A(uv + d × .22 × uT), B(uv − d × .22 × (1 − uT)), m)`.
4. **Halftone (`uMode 2`):**
   - cell `= floor(uv × uRes / uDot)`;
   - coverage `cov = clamp(uT × 1.6 − .3 + (fbm(uv × 3. + uTime × .02) − .5) × .55, 0, 1)`;
   - dot radius `cov × 1.55`;
   - mask `1 − smoothstep(r − .18, r + .06, d)`.
5. **Ring (`uMode 3`):**
   - Distance from `uOrigin`, aspect-corrected, normalised by the farthest corner.
   - The front is lobed by two angular harmonics: `r += .06·sin(3θ + uTime·.3) + .04·sin(5θ − uTime·.2)`.
   - Inside a crest of width .08: snap the sampling to a block grid (cells 24px and 8px), split R/B by ±.004 along the radius, and add a Bayer 4x4 dither.
   - Add a screen-blended gilt flare `vec3(1., .82, .45) × .35` on the crest.
   - Behind the crest, show B.
6. **Paper sheet (`uFlat`):**
   - `pw = vUv × vec2(aspect, 1)`;
   - `pulp = fbm(pw × 1.7) − .5`;
   - fibre A: `fbm(vec2(pw.x × 24., pw.y × 2.1)) − .5`;
   - fibre B: `fbm(vec2(pw.x × 2.8, pw.y × 38.)) − .5`;
   - tooth: `hash(floor(gl_FragCoord.xy)) − .5`;
   - fleck: `smoothstep(.981, 1., hash(floor(gl_FragCoord.xy / 3.) + 11.))`;
   - `paper = uPaper × (1 + pulp·.115 + fibA·.055 + fibB·.03 + tooth·.038)`;
   - `paper.b *= 1 − pulp·.196` and `paper.r *= 1 + pulp·.035`;
   - `paper = mix(paper, paper × .7, fleck × .55)`;
   - `col = mix(col, paper, uFlat)`.
7. **Dapple light (only while `uFlat > 0`):**
   - two nested sines: `sin(q.x·3.1 + sin(q.y·2.3 + T·.31)·1.8) + sin(q.y·2.7 + sin(q.x·1.9 − T·.24)·1.4)`;
   - `smoothstep(.25, 1.85, ·)`;
   - `lit = col × (1 + rake·.35 − dap·.085)`, where `rake = vUv.x·.62 + vUv.y·.38 − .5`.
   - On AVVVS this reads as coconut-palm shade moving over the manuscript, which is a fitting local reading.
8. **Plate in the margin:**
   - Sample `uPlate`, cover-fit inside `uPlateRect`.
   - Soak-in mask: `smoothstep(uPlateOpen − .15, uPlateOpen, 1 − length((uv − rectCentre)/rectHalf))`, with an fBm brushed edge of amplitude .06.
   - Multiply-blend the plate onto the paper: `col = mix(col, col × plate, a)`, so the ink sits *in* the sheet.
9. **Burn (`uMode 4`):**
   - Front metric `max(|d.x|, |d.y|)` (a square opening, which is pear's choice) or `length` (oval). Use oval for AVVVS, since a leaf-like opening suits the subject.
   - Add `fbm × .295` lobes.
   - Char band width .31: darken toward `vec3(.12, .08, .05)`, stippled by Bayer dither.
   - Ember line width .0104: `col = col × mix(2.2, 5., .5 + .5·sin(uTime·1.4 + uv.x·10.)) + uEmber × .55`.
   - Behind the front, show B.
10. **Scrim:** `col *= mix(vec3(1), vec3(.698, .667, .635), uScrim)`. Use it to unify warmth across frames from different generations.

**Acceptance for the shader package:**
- At `uT = 0` and `uT = 1`, the output equals A and B exactly; a pixel diff of 0 is checked via `readPixels` on a 4x4 sample.
- There is no visible straight wipe edge in any mode.
- 60 fps on a 2020 MacBook Air at 1440x900 with DPR 1.5, checked in the Performance panel (frames at 16.7 ms or less, p95).
- `PHONE` builds keep 50 fps or more on a mid-range Android.

### 4.5 Light and dark chrome switch (copy the idea, not the code)
- Every 160 ms, `drawImage` the current frame into an 8x5 canvas and compute mean luma.
- Toggle `data-on-light` on the overlay when luma goes above 168; clear it when luma drops below 132.
- Overlay colours flip between `--color-paper` and `--color-ink` with `transition: color .42s linear`.
- This applies inside the film only. The site's light/dark theme toggle is separate, and light is the default per the brief.

### 4.6 Type and layout spec for AVVVS (PROPOSED; families pending licence)

| Role | Size | Weight / line height / tracking | Measure |
|---|---|---|---|
| Mega | `clamp(2.4rem, 8.1vw, 11rem)` | 300 / 1.04 / −0.024em | ≤ 16 characters per line, 2 lines |
| Chapter | `clamp(2rem, 5.4vw, 5rem)` | 300 / 0.92 / −0.02em | ≤ 18 characters per line |
| Lead | `clamp(1.19rem, 1.6vw, 1.5rem)` | 400 / 1.2 / −0.02em | 40 to 45 characters (`max-width: 26em`) |
| Body | `clamp(.875rem, 1.05vw, 1.0625rem)` | 400 / 1.3 | 28 to 45 characters (`max-width: 38ch`) |
| Label | `clamp(9px, .66vw, 12px)` | 500 / 1.6 / +0.18em, uppercase, mono | — |

- **Script accent:** one handwritten Malayalam or Latin word per page at most (for example the botanical binomial). Draw it with an SVG stroke-dashoffset animation lasting 1.2s, using the brand ease `cubic-bezier(.22, 1, .36, 1)` via animejs v4.
- **Families:**
  - Option A: license Flecha and GT Standard from Grilli Type. **Do not** download them from pear.no.
  - Option B: free fonts with a similar feel: a sharp light display serif (for example Newsreader 300 at display optical size) plus a neutral grotesk plus a mono.
  - This conflicts with the CLAUDE.md "no new fonts" rule, but the client rejected the v1 typography, so the decision is the client's. See open questions.
- **Copy reveal:** wrap each line in `.ln > span`. Animate `translateY(110%) → 0` over 0.76s and opacity `0 → 1` over 0.64s, with `--ease: cubic-bezier(.22, 1, .36, 1)` and a 60ms stagger per line. Under reduced motion, show the text instantly.
- **Chrome:**
  - hairline column rules at the 1/12 grid edges, `oklch(1 0 0 / .22)`;
  - crosshair `oklch(1 0 0 / .52)`, 9px;
  - a left rail with a mono chapter label and a 24px dash;
  - no eyebrow labels above headings (house rule). The rail label is navigation, not an eyebrow.

### 4.7 Palette for AVVVS (PROPOSED; must reconcile with the design-system work package)
Keep pear's structure: **one saturated field colour + warm paper + near-black ink + one gilt accent**.

| Role | Proposed OKLCH | Why |
|---|---|---|
| Field (pear's cerulean equivalent) | oklch(0.40 0.09 160), Kerala monsoon green; or oklch(0.42 0.11 247) cerulean if the client wants pear's sky | A flat painted sky or field behind figures |
| Paper | oklch(0.958 0.006 90) | Page background in light mode |
| Sheet (parchment / palm-leaf) | oklch(0.86 0.05 80) | The procedural paper |
| Ink | oklch(0.23 0.01 80) | Text |
| Sheet ink | oklch(0.26 0.04 75) | Copy on the sheet |
| Gilt (brass uruli, kasavu border) | oklch(0.72 0.13 85) | The one accent per frame |
| Laterite / kumkum accent | oklch(0.50 0.15 32) | Replaces pear's crimson sash; use sparingly |
| Ember | oklch(0.78 0.155 60) | Burn edge |

---

## 5. Generated imagery: what needs it and how to keep it from looking like AI slop

### 5.1 Inventory

| Asset | Source | Needs generation? |
|---|---|---|
| Hero loop (forest, 5s) | Generated painting → image-to-video | Yes |
| `forest` drift (121 frames) | Generated keyframes → image-to-video | Yes |
| `leaf-macro` (89) | Generated | Yes |
| Botanical plates | **Public-domain *Hortus Malabaricus* (Van Rheede, 1678–1693), a 17th-century treatise on the plants of Malabar (Kerala)**. Use only plates for ingredients **verified** in AVVVS products. Scan source and licence per plate: **UNVERIFIED**. Biodiversity Heritage Library is the likely source; check the rights statement on each item. | **No.** Real engravings beat generated ones. |
| `roots` → powder → amber (121) | Generated | Yes. It is a visual metaphor; the brief forbids implying a real process. |
| `hands` (121) | **Preferred:** film a real AVVVS vaidyan's hands (with written consent), then run a painterly img2img pass at low denoise. **Fallback:** generated. | Partial |
| `reveal-bg` (89) | Generated dark-botanical plate | Yes |
| Products | **Real Shopify product images** (`/products/<handle>.json` → `images[].src`) or a client shoot. Never generated, never repainted labels. | **No** |
| `coda` (89) | Generated | Yes |
| Stills for fallback / OG images | The key frame of each clip, exported as AVIF at q55 | Derived |

### 5.2 Prompt recipe (same skeleton for every clip, to keep one painter's hand)

```
Oil painting in the late-19th-century Indian academic realist tradition (Raja Ravi Varma school),
smooth glazed brushwork, soft north light from the upper left at 45 degrees, porcelain-smooth skin,
handwoven cotton and kasavu (cream with gold border), [SUBJECT], set against a flat [monsoon-green
field | pale ivory studio ground], subject occupying the right 45% of the frame, left 55% calm
negative space, single gilded brass object as the only saturated accent, 16:9, museum photograph
of the canvas, no text.
```

Negative prompt:

```
text, letters, watermark, signature, logo, extra fingers, fused fingers, six fingers, glowing,
bokeh orbs, lens flare, HDR, fantasy, neon, lotus, mandala, om symbol, chakra, incense smoke
swirls, glossy plastic, 3D render, CGI, anime, airbrushed, oversaturated, symmetrical face
```

**Video:** generate the keyframe first, then image-to-video for 5s with **one** camera move (slow dolly-in at about 3% scale over the clip, or a 4% lateral drift). Do not combine moves. Export at 24fps.

Subjects per clip (Kerala-specific, using only what is verifiable or neutral):
- laterite path under a canopy of jack and coconut palms in monsoon light;
- a single medicinal leaf (a verified ingredient only);
- the brass uruli on a granite grinding stone (ammikallu);
- hands in a cream mundu with a kasavu border grinding on stone;
- copper and brass vessels on dark teak.
- **Do not** put a recognisable face on any "doctor" figure.
- **Do not** depict named AVVVS doctors unless they consent and the image is real photography.

### 5.3 Anti-slop acceptance checks (run per clip, record results in `docs/research/imagery-log.md`)
1. **Hands:** check every 10th frame (13 frames per clip): exactly 5 digits per visible hand, nails present, no fused knuckles. Any failure rejects the clip.
2. **Text artefacts:** zero glyph-like marks. Zoom to 200% on 4 frames.
3. **Botany:** leaf shape, venation and phyllotaxis match a herbarium or Hortus Malabaricus reference for the named plant. If it doesn't match, the plant is unnamed and gets no caption.
4. **Light consistency:** the key light comes from the upper left within ±20° in every clip. Shadow direction is checked by eye on the first, middle and last frame.
5. **Palette:** the mean of an 8x8 downsample lies within ΔE(OK) 0.08 of the clip's target ground. Exactly one region with chroma above 0.12 (the gilt accent).
6. **Temporal flicker:** mean absolute difference between consecutive frames in a static 10% corner patch is 4/255 or less. Reject boiling textures.
7. **Painterliness:** at 100% crop, brushwork is visible in foliage. Skin is not plastic-smooth with HDR micro-contrast.
8. **Consistency across clips:** all clips go through the same grade, a LUT exported as `.cube` from one hero frame. Apply `uScrim` 0 to 0.18 at runtime to even out warmth.
9. **Stereotype filter:** none of the house-banned motifs (lotus, leaf clip art, mandalas, glowing chakras) and no "spa" imagery.
10. **Provenance:** log the model, seed, prompt and date for every clip. Disclose generated imagery wherever the site discusses its making.

---

## 6. What NOT to copy

- **Assets:** no pear frames, MP4s, posters, logo, favicon, cloud halftone sprites or the constellation art. Do not hotlink `/films/*`. Do not train or img2img on their frames.
- **Code:** do not paste their GLSL or JS. Their comments and structure are distinctive authored work. Reimplement from the descriptions in §4.4. Standard techniques (fBm, Bayer, cover-fit, halftone) are fine to write ourselves.
- **Fonts:** never self-host Flecha or GT Standard from pear.no. License them from the foundry or choose alternatives.
- **Motifs:**
  - the gilded pear;
  - Greco-Roman figures in togas;
  - cerulean sky with halftone clouds as the signature (choosing a green field avoids a look-alike);
  - the seam split of a fruit cut in half;
  - the orator-and-constellation form;
  - the "Apply →" black pill;
  - FAQ cards on leader lines framed by branches;
  - a footer that repeats the hero composition.
- **Copy:** none of their lines or rhythm ("We build it. / We rank it.", "Asked before signing", "We say no…"). AVVVS copy comes only from `src/content/*` and Shopify data.
- **Exact layouts and timings:** do not clone the 9-chapter 5350vh road or the 1200/600/300… split. Use the AVVVS chapter table (§4.2), driven by the brief's six scenes.
- **What we may take:** the *principles*:
  - painted frames scrubbed by scroll;
  - one compositing shader;
  - print-artefact transitions that resolve back to clean paintings;
  - a procedural paper sheet with light moving over it;
  - text placed in the negative space;
  - a light, tightly tracked display serif with small mono labels;
  - 0.085 scroll lerp;
  - `cubic-bezier(.22, 1, .36, 1)`;
  - native scroll on touch and for reduced motion.

---

## 7. Missing inputs / UNVERIFIED
1. **Image-generation tool, licence and budget:** which model is allowed for commercial use, and who owns the output.
2. **Real vaidyan hand footage:** can AVVVS film it, and will they give written consent?
3. **Hortus Malabaricus plate scans:** per-plate source and rights statement; which plates match **verified** AVVVS ingredients (the ingredient list is not yet verified).
4. **Product photography quality:** do the Shopify images allow a hero composite (resolution of 2000px or more, clean background)? If not, a shoot is needed.
5. **Font decision:** license Flecha and GT Standard, or pick alternatives. The CLAUDE.md "no new fonts" rule versus the client's rejection of the v1 type.
6. **Performance budget:** PLAN.md §6.1 (1.2 MB hero assets) has to be revised for streamed frame sequences (about 50 MB over the session).
7. **Field colour:** monsoon green (distinct from pear) or cerulean (closest to pear). This is the client's call.
8. Whether pear's frames are AI-generated (inferred, **UNVERIFIED**), and the exact loader blur element and radius (**UNVERIFIED**; 26px is present in the CSS).
