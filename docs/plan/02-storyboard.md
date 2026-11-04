# 02 · Storyboard and transition specification: the AVVVS film

Status: final draft for client review, 2026-11-04.
Precedence: `docs/brief/creative-brief.md` > `docs/plan/01-creative-direction.md` (called **CD** below) > **this file** > `docs/research/*` > `PLAN.md` (v1).
Executor: Claude Sonnet 5.5 at medium effort. Every number here is a spec. If a number is marked **MEASURE**, the work package that produces the asset measures it and writes it into `src/lib/film/timeline.ts`; until then use the placeholder given.

This file defines, for every animation beat of the six scenes: the scroll range, start and end state, camera, objects, light, materials, scroll trigger, duration, rendering technique, DOM copy, and the hand-off to the next beat. It then gives a keyframe-by-keyframe breakdown of Scene 02 (§4), the five scene-boundary transitions (§5), the interactions (Skip film, inspect a plate or specimen, return to film) (§6), the mobile variant (§7), the reduced-motion and static variant (§8), and the data file that holds it all (§9).

Plates, palette, fonts, headlines and copy are exactly those in CD §2.2, §3, §4.2 and §5.2. Nothing here adds a fact. New strings in this file are UI labels only (§6.4), and they are listed for client approval.

---

## 0. Conventions (read before any beat)

### 0.1 Units and the progress variable

| Symbol | Meaning |
|---|---|
| `p` | Film progress, 0..1. `p = clamp((scrollY − trackTop) / (trackHeight − innerHeight), 0, 1)`. ScrollTrigger supplies it as `self.progress` on the master trigger (§0.4). |
| Track height | **1400vh desktop, 1000vh mobile** (CD C11). The sticky stage is 100svh of it, so the scroll distance `D` is **1300vh desktop** and **900vh mobile**. |
| `vh d` / `vh m` | Scroll distance from the top of the track, in viewport heights: `p × 1300` (desktop) and `p × 900` (mobile). Every beat lists both. |
| `local` | Progress inside a scene: `(p − scene.start) / (scene.end − scene.start)`, clamped 0..1. |
| `s` | Progress inside a sub-segment (for example one plate in S02), 0..1. |
| `seg(x, a, b)` | `clamp((x − a) / (b − a), 0, 1)` |
| `smoother(t)` | `t*t*t*(t*(6*t − 15) + 10)` (CD §2.8). Every transition `t` goes through it. |
| Mobile | Viewport width < 768 px, or detect-gpu `isMobile` (tech-feasibility §2). |
| Screen coordinates | `x_s`, `y_s` in 0..1, **origin top-left**, y down (same as CD §2.1 composition zones). |
| World coordinates | three.js convention: metres, **Y up**, camera looks toward −Z unless a target is given. Pre-rendered scenes list a "virtual camera" in the same convention. It is the spec for the Blender fallback (CD C13 pipeline B), the reference render that steers image-to-video (pipeline A), and the match check against the real-time scenes. |
| Lens | Full-frame focal length, as in CD §2.6. Real-time cameras give the vertical fov. |
| Colours | OKLCH. Kelvin values from CD §2.5 are converted to OKLCH approximations. Real-time code converts OKLCH to linear sRGB with `oklchToLinear()` in `src/lib/film/color.ts` (§9.3). **Never hex in components** (CLAUDE.md). |

### 0.2 Scene ranges

| Scene | `p` | vh d | vh m | Length d / m | Tone (`data-film-tone`) | Technique |
|---|---|---|---|---|---|---|
| S01 Into the origins | 0.000–0.140 | 0–182 | 0–126 | 182 / 126 | `dark` | Pre-rendered WebP sequence + real-time motes |
| S02 The botanical archive | 0.140–0.460 | 182–598 | 126–414 | 416 / 288 | `parchment` | Real-time R3F (plates, specimen) + procedural paper in `Composite` + DOM SVG annotations |
| S03 From illustration to extraction | 0.460–0.600 | 598–780 | 414–540 | 182 / 126 | `dark` | Pre-rendered sequence + real-time powder |
| S04 The alchemy of nature | 0.600–0.740 | 780–962 | 540–666 | 182 / 126 | `dark` | Pre-rendered sequence |
| S05 The AVVVS reveal | 0.740–0.920 | 962–1196 | 666–828 | 234 / 162 | `dark` | Pre-rendered background sequence + real product photographs as a separate layer |
| S06 Beyond the film (hand-off) | 0.920–1.000 | 1196–1300 | 828–900 | 104 / 72 | `site` | DOM over a `--bg` stage |

The scene shares are tech-feasibility §3.2's; the track length is CD C11's.

### 0.3 Transition windows (CD §2.8: last 12% of the outgoing scene + first 8% of the incoming one)

| ID | Boundary | Window `p` | vh d | vh m | Mid-point (tone switches here) | Mode |
|---|---|---|---|---|---|---|
| T1 | S01 → S02 | 0.1232–0.1656 | 160.2–215.3 | 110.9–149.0 | 0.1444 | Ink bleed |
| T2 | S02 → S03 | 0.4216–0.4712 | 548.1–612.6 | 379.4–424.1 | 0.4464 | Ember burn (oval) |
| T3 | S03 → S04 | 0.5832–0.6112 | 758.2–794.6 | 524.9–550.1 | 0.5972 | Displace |
| T4 | S04 → S05 | 0.7232–0.7544 | 940.2–980.7 | 650.9–679.0 | 0.7388 | Spiral ring |
| T5 | S05 → S06 | 0.8984–0.9264 | 1167.9–1204.3 | 808.6–833.8 | 0.9124 | Closing burn |

`t = smoother(seg(p, a, b))`. Inside a window both scenes render (scene A = outgoing, scene B = incoming). Before its own start, scene B is held at its `local = 0` state. After its own end, scene A is held at its `local = 1` state.

### 0.4 Scroll machinery (same for every beat)

- **One master ScrollTrigger** in `FilmScroll.tsx`: `trigger: "#film-track", start: "top top", end: "bottom bottom", scrub: true, pin: false, invalidateOnRefresh: true, onUpdate: self => film.setTarget(self.progress, self.getVelocity())`. **No pin anywhere**: the stage is `position: sticky; top: 0; height: 100svh` (tech-feasibility §3.4). `scrub: true`, not a number, because Lenis already smooths (no double easing).
- **Lenis 1.3.27**: `new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, syncTouch: false, autoRaf: false })`, driven by `gsap.ticker` with `lenis.on("scroll", ScrollTrigger.update)` and `gsap.ticker.lagSmoothing(0)`. **Not created** under `prefers-reduced-motion: reduce` or `(pointer: coarse)` (CD C10). This overrides tech-feasibility's lerp 0.1.
- Canvas-side values are damped once in `useFrame`: `progress = THREE.MathUtils.damp(progress, target, 6, delta)`. Every beat below reads the damped `progress` as `p`.
- **Text cues** are not scrubbed. Each cue is its own ScrollTrigger on the track with absolute start and end positions:
  ```ts
  const D = () => track.offsetHeight - window.innerHeight;
  ScrollTrigger.create({
    trigger: track,
    start: () => track.offsetTop + cue.show * D(),
    end:   () => track.offsetTop + cue.hide * D(),
    onEnter: () => tlIn.play(), onLeave: () => tlOut.play(),
    onEnterBack: () => tlIn.play(), onLeaveBack: () => tlOut.play(),
  });
  ```
  `tlIn`: SplitText `mask: "lines"`, `yPercent: 110 → 0` over **760 ms**, `opacity 0 → 1` over **640 ms**, ease `cubic-bezier(0.16,1,0.3,1)` (register it as `CustomEase.create("avvvs", "0.16,1,0.3,1")` or use `"expo.out"` only if CustomEase is unavailable), **60 ms** line stagger. `tlOut`: `opacity 1 → 0` over **400 ms**, same ease, no travel. (CD §2.7.) All cues are listed in §9.1 `CUES`.
- **Per-beat line** "ST" below names the slice of the master trigger the beat lives in. Every beat is `scrub: true` (through the master) and `pin: none`, unless it says otherwise.

### 0.5 Beat card fields

Each beat card has: **Range** (local, `p`, vh d, vh m) · **Start** · **End** · **Camera** (position → target) · **Camera move** (path, easing) · **Objects** · **Light** · **Materials** · **ST** · **Duration** · **Technique** · **DOM** · **Audio** · **Next**.

"Duration" for a scrubbed beat is its scroll length; for reference it also gives the time at **150vh per second**, a measured comfortable wheel speed on a laptop trackpad with lerp 0.085 (UNVERIFIED as an average; use it only for pacing reviews). Time-based parts (text, inspect mode) give milliseconds.

### 0.6 Asset names used below

| Sequence | Desktop frames (1600×900 WebP q72) | Mobile frames (720×1280 WebP q72) | Clips it is cut from |
|---|---|---|---|
| `s01` | 96 (`0000–0095`) | 64 | `s01a` wide drift 28 / 18 · `s01b` descent 28 / 18 · `s01c` macro + hand H1 40 / 28 |
| `s03` | 72 | 48 | `s03a` break 36 / 24 · `s03b` powder to amber 36 / 24 |
| `s04` | 72 | 48 | `s04a` kindi pour 36 / 24 · `s04b` hands and spiral (H2) 36 / 24 |
| `s05bg` | 48 | 32 | `s05bg` painted dark-botanical ground, 12° arc |
| `s05p` | 25 (alpha WebP) | 25 (alpha WebP) | Packshot turntable: the product group on real teak, 0.5° steps over 12° |
| `s05rim` | 1 (alpha WebP) | 1 | Packshot step 0, rim light only (the silhouette) |
| `s05h` | 12 (alpha WebP) | 12 | Packshot H3: the vaidyan's hand sets Mezhu Thailam down (real photograph; optional, N2) |
| `s02spec` | 24 | 24 | Tier-1 only: specimen turntable rendered offline from the GLB (§7.3) |

Each 5 s generated clip (120 source frames at 24 fps) is resampled to the frame count above with `ffmpeg -vf "fps=<count/5>,scale=…:flags=lanczos"` before grading (CD §2.9). Clip *n+1* is generated from clip *n*'s last frame as its start image, so the joins are continuous. Posters: see §8.2.

---

## 1. Film at a glance

| Beat | `p` | vh d | Picture | DOM copy (CD §4.2 IDs) | Technique |
|---|---|---|---|---|---|
| B01.1 Open | .000–.017 | 0–22 | Near-black forest fading up | `s01.title` (h1), `s01.titleLead` | Sequence `s01` 0–2 + `uFade` |
| B01.2 Drift | .017–.056 | 22–73 | Laterite path under jackfruit and palms, mist | — (h1 leaves at .028) | `s01` 3–27 + motes |
| B01.3 Descent | .056–.092 | 73–120 | Down through understorey to a karinochi branch | `s01.head` | `s01` 28–55 + motes |
| B01.4 Macro and hand | .092–.123 | 120–160 | H1 lifts and turns one leaf; venation macro | `s01.caption` | `s01` 56–95 |
| B01.5 → T1 | .123–.140 | 160–182 | Leaf turns to ink | — | T1 ink bleed |
| B02.1 ← T1 | .140–.166 | 182–215 | Engraved Vitex leaf on paper, close | — | T1 + R3F |
| B02.2 Ring reveal | .166–.204 | 215–265 | Camera pulls back; five plates on a ring | `s02.head`, `s02.caption` | R3F |
| B02.3–B02.7 Plates 1–5 | .204–.396 | 265–515 | Each plate turns to front, comes forward, annotations draw | `s02.plate.*` | R3F + DOM SVG |
| B02.8 Specimen | .396–.422 | 515–548 | Ginger plate's paper dissolves; 3D rhizome lifts free | ginger names (out at .409) | R3F GLB |
| B02.9 → T2 | .422–.460 | 548–598 | Ember burn from the rhizome | — | T2 |
| B03.1 ← T2 | .460–.471 | 598–613 | Painted rhizome on dark earth | — | T2 + `s03` |
| B03.2 Break | .471–.523 | 613–680 | Rhizome breaks along its fibres | `s03.head`, `s03.caption` | `s03` 0–35 |
| B03.3 Powder | .523–.558 | 680–725 | Camera moves through falling powder | (same) | `s03` 36–53 + powder |
| B03.4 Amber | .558–.583 | 725–758 | Still liquid warms from clear to amber | (same, out at .580) | `s03` 54–71 |
| B03.5 → T3 | .583–.600 | 758–780 | Noise displace into oil | — | T3 |
| B04.1 ← T3 | .600–.611 | 780–795 | Amber oil in a brass uruli | — | T3 + `s04` |
| B04.2 Pour | .611–.659 | 795–856 | Brass kindi pours amber into the uruli | `s04.head`, `s04.caption` | `s04` 0–35 |
| B04.3 Hands | .659–.723 | 856–940 | H2: two hands draw a spatula; spiral forms | (same, out at .718) | `s04` 36–71 |
| B04.4 → T4 | .723–.740 | 940–962 | Spiral opens as a gilt ring | — | T4 |
| B05.1 ← T4 | .740–.754 | 962–981 | Forest-green ground, rim-lit silhouettes | — | T4 + `s05rim` |
| B05.2 Silhouette | .754–.780 | 981–1014 | Rim light, then key light on two bottles | — | `s05rim` → `s05h`/`s05p` |
| B05.3 Hand H3 | .780–.808 | 1014–1051 | Hand sets Mezhu Thailam beside Rujanth | — | `s05h` 0–11 |
| B05.4 Orbit | .808–.884 | 1051–1149 | 12° arc around the three real products | `s05.head`, `s05.caption`, `s05.productNames` | `s05bg` + `s05p` |
| B05.5 Hold | .884–.898 | 1149–1168 | Still product shot | (same, out at .895) | hold |
| B05.6 → T5 | .898–.920 | 1168–1196 | Burn rises from the bottom | — | T5 |
| B06.1 ← T5 | .920–.926 | 1196–1204 | Page colour | — | T5 |
| B06.2 Hand-off | .926–1.000 | 1204–1300 | Bone page, one honest line | `handoff.note` | DOM |

---

## 2. Global layers present in every live beat

| Layer | Spec |
|---|---|
| Stage | `<div class="film__stage">` sticky, 100svh, background `var(--film-night)` until the canvas fires `film:live`, then the canvas covers it (opacity 0 → 1 over 200 ms). |
| Canvas | One R3F `<Canvas>` (`FilmCanvas.tsx`), `aria-hidden="true"`, `frameloop` per tech-feasibility §3.4. |
| Composite | One full-screen pass (`Composite.tsx`), §5.1 uniforms. Grain: amplitude **0.028** on dark scenes, **0.018** on S02, seed updated at 24 Hz (CD §2.4). Vignette −0.3 EV at radius 0.35 on dark scenes, 0 on S02 and S06. |
| Chrome | Nav, "Skip film" (bottom-right), "Sound off" (bottom-left). Ink `var(--film-ink)` when `data-film-tone="dark"`, `var(--film-sepia)` when `parchment`, theme `var(--ink)` when `site`. Colour swaps instantly, no transition (CD §2.7). |
| Text | Server-rendered `<section data-scene="sNN">` blocks inside the track, positioned in the copy zone (CD §2.1, §2.7): desktop headline bottom at `y_s` 0.68, left edge `--margin`, max width 26ch; caption 24 px below. Phone: copy zone `y_s` 0.10–0.40. No boxes, rules, eyebrows or numbers. |
| Audio | Optional, off by default (CD §6). Gains follow the per-beat line. |

---

## 3. Scene-by-scene beats

### Scene 01: Into the origins (p 0.000–0.140)

Shared facts for all S01 beats:
- **Technique:** pre-rendered sequence `s01` drawn by `Sequence.tsx` into scene FBO A; frame `n` and `n+1` blended by the fractional index (tech-feasibility §2). Frame map (piecewise linear on `local`): desktop `[[0,0],[0.40,27],[0.66,55],[0.90,95],[1,95]]`, mobile `[[0,0],[0.40,17],[0.66,35],[0.90,63],[1,63]]`.
- **Motes (real-time, `Particles.tsx`, preset `s01`):** tier 3: 1,500 points; tier 2: 600; tier 1: 0. Box `x ∈ [−4, 4]`, `y ∈ [−2.5, 2.5]`, `z ∈ [−6, −1]`, own camera fov 40°, `z_cam = −3.0 × seg(local, 0.12, 0.88)` (forward parallax), positions wrapped with `mod` in the vertex shader. Size 1.2–2.4 px × DPR. Colour `oklch(0.88 0.03 90)`, normal blending (never additive), max alpha 0.35. **Light gate:** the vertex shader samples the current `s01` frame at the point's screen position and sets `alpha *= smoothstep(0.42, 0.70, luma)`, so motes appear only inside sun shafts. Drift `(0.02, −0.005, 0)` units/s, time-based. Envelope: alpha × `seg(local, 0.12, 0.20) × (1 − seg(local, 0.80, 0.88))`. This replaces "floating particles" in the brief without glow or gold dust (CD §2.11).
- **Painted light (all S01 frames):** sun key from the upper left, 40° above horizontal, direction toward the light `(−0.70, 0.64, 0.31)`, colour ≈ 5200 K `oklch(0.95 0.025 75)`; at most 3 shafts per frame. Sky fill from above, −2 stops, ≈ 7000 K `oklch(0.95 0.015 260)`. Volumetric mist, density 0.6 at frame top falling to 0.2 at the leaf (CD §2.5). Blender fallback: Sun strength 4.5, Principled Volume density 0.020 at canopy height falling to 0.006 at 1 m.
- **Painted materials:** laterite path `oklch(0.45 0.09 40)`; jackfruit and palm foliage mid `oklch(0.45 0.09 140)`, shadow `oklch(0.18 0.03 150)`; moss `oklch(0.40 0.08 135)`; sun shafts `oklch(0.90 0.06 95)`; karinochi leaf upper surface `oklch(0.38 0.07 140)`, underside silver-white `oklch(0.80 0.03 120)`; the sunlit leaf is the only accent, `oklch(0.72 0.14 128)`, ≤ 8% of the frame (CD §2.1, §2.2). Sleeve unbleached cotton `oklch(0.88 0.02 90)`.
- **Composition anchor:** the subject sits at `x_s` 0.62–0.76, `y_s` 0.45–0.70. The copy zone `x_s` 0.04–0.42 is calm (OKLCH L std-dev ≤ 0.06 on the 8×8 downsample).

#### B01.1 Open
- **Range:** local 0.00–0.12 · p 0.0000–0.0168 · vh d 0–21.8 · vh m 0–15.1
- **Start:** stage shows the live poster `s01-live-d.avif` (frame 0 with `uFade` 0.80 baked in, mean L ≈ 0.16). The h1 is visible from first paint.
- **End:** frame 2, `uFade` 0 (mean L 0.30), the forest legible.
- **Camera (virtual):** `(0.00, 1.60, 0.00)` → target `(0.00, 1.45, −20.0)`; 24 mm; eye height 1.6 m looking down the laterite path.
- **Camera move:** 0.3 m push along −Z, baked in frames 0–2, linear.
- **Objects:** mist drifts left to right (baked). Motes off (envelope 0).
- **Light:** as S01 shared; the sun shafts are faint because of the fade.
- **Materials:** as S01 shared.
- **ST:** master slice p 0–0.0168; `uFade = 0.80 × (1 − seg(local, 0, 0.12))`.
- **Duration:** 21.8vh d / 15.1vh m (≈ 0.15 s at reference speed; most visitors rest here, so the fade must look good when still).
- **Technique:** sequence + `Composite.uFade` mixes toward `--film-night` `oklch(0.14 0.015 160)`.
- **DOM:** `s01.title` "Ayurveda since 1921" as the page `<h1>`, Boska 300 `--step-display`, line height 0.95, tracking −0.03em, bottom-left, baseline 8svh above the stage bottom, `x` = `--margin`. `s01.titleLead` "Arya Vaidya Vilasini Vaidya Sala, Kozhikode." Geist 400 `--step-body`, 16 px below the h1. **Both are opaque at first paint with no entry animation** (the h1 is the LCP candidate; an opacity-0 start would delay LCP). Colour `--film-ink` (passes ≥ 3:1 / 4.5:1 on a L ≤ 0.30 frame).
- **Audio:** S01 bed gain `0 → 1` across local 0.00–0.15 (if enabled).
- **Next:** continuous into B01.2 (same clip `s01a`).

#### B01.2 Drift
- **Range:** local 0.12–0.40 · p 0.0168–0.0560 · vh d 21.8–72.8 · vh m 15.1–50.4
- **Start:** frame 2 (d) / 1 (m); the path and palms in mist.
- **End:** frame 27 (d) / 17 (m); the camera has drifted right and lower, the understorey ahead.
- **Camera (virtual):** `(0.00, 1.60, −0.30)` → `(0.60, 1.45, −6.00)`; target `(0.90, 1.20, −20.0)` → `(1.60, 0.90, −14.0)`; 24 → 35 mm.
- **Camera move:** Catmull-Rom through `(0.25, 1.56, −2.8)`, baked; within the clip `sine.inOut`; the scroll mapping is linear.
- **Objects:** mist layers parallax (near layer 1.4× the far layer's speed), palm fronds sway ≤ 2% of frame width, baked. Motes fade in across local 0.12–0.20.
- **Light / materials:** S01 shared. One sun shaft crosses the path at `x_s` ≈ 0.70.
- **ST:** master slice p 0.0168–0.0560.
- **Duration:** 51vh d / 35vh m (≈ 0.34 s).
- **Technique:** sequence + motes.
- **DOM:** the h1 block exits at **p 0.0280** (local 0.20) with `tlOut` (opacity → 0, 400 ms) and comes back on scroll back (cue `s01.title`, §9.1).
- **Audio:** bed 1.0.
- **Next:** continuous into B01.3 (clip join `s01a` → `s01b`, frame 27/28).

#### B01.3 Descent
- **Range:** local 0.40–0.66 · p 0.0560–0.0924 · vh d 72.8–120.1 · vh m 50.4–83.2
- **Start:** frame 28 (d) / 18 (m).
- **End:** frame 55 (d) / 35 (m): a karinochi (*Vitex negundo*) branch fills the right half, five-leaflet palmate leaves, one leaf in the clear shaft.
- **Camera (virtual):** `(0.60, 1.45, −6.00)` → `(1.85, 1.05, −11.20)`; target `(1.60, 0.90, −14.0)` → leaf `(2.10, 0.90, −12.00)`; 35 → 50 mm.
- **Camera move:** descending dolly-in, Catmull-Rom through `(1.30, 1.20, −9.0)`, `sine.inOut` baked. Roll ≤ 2°.
- **Objects:** foreground understorey leaves pass the lens blurred at 3% of frame width (painted). Mist density falls toward the leaf. Motes at full envelope.
- **Light / materials:** S01 shared. The leaf sits in the single clear shaft.
- **ST:** master slice p 0.0560–0.0924.
- **Duration:** 47vh d / 33vh m (≈ 0.32 s).
- **Technique:** sequence + motes.
- **DOM:** `s01.head` "Rooted in nature. Refined through tradition." `<h2>`, Boska 300 `--step-head`, line height 1.0, tracking −0.02em, ≤ 26ch, `text-wrap: balance`, headline bottom at `y_s` 0.68, `x` = `--margin`, `--film-ink`. Show **p 0.0588** (local 0.42), hide **p 0.0896** (local 0.64).
- **Audio:** bed 1.0.
- **Next:** continuous into B01.4 (clip join `s01b` → `s01c`).

#### B01.4 Macro and hand (H1)
- **Range:** local 0.66–0.88 · p 0.0924–0.1232 · vh d 120.1–160.2 · vh m 83.2–110.9
- **Start:** frame 56 (d) / 36 (m): 100 mm macro on the leaf, the hand not yet in frame.
- **End:** frame 92 (d) / 61 (m): the right hand (H1) has entered from the lower right, holds the leaf by its stalk between thumb and index finger, and has turned it so the silver-white downy underside faces the light; venation fills the subject zone. Mid-vein runs from `(0.58, 0.70)` to `(0.80, 0.32)` in screen space (desktop) and from `(0.40, 0.80)` to `(0.62, 0.52)` (mobile). **This line is the T1 shared element** and the S02 leaf anchor (§4.1) is matched to its mid-point `(0.69, 0.51)` (d) / `(0.51, 0.66)` (m).
- **Camera (virtual):** `(1.85, 1.05, −11.20)` → `(2.10, 0.95, −11.88)` (12 cm from the leaf); target leaf `(2.10, 0.90, −12.00)`; 100 mm macro, 1:1.
- **Camera move:** 3% push-in, baked, linear. No other move (one move per clip, CD §2.6).
- **Objects:** H1 hand path (baked): enters at frame 60 from `(1.05, 1.05)` (off-frame lower right) to grip at frame 74, `(0.80, 0.78)`; rotates the leaf about its stalk axis by 150° between frames 74 and 92; holds 92–95. Five digits, nails, three knuckle creases per finger (CD §2.10 check 1). Foreground leaf blurred at 3% of frame width.
- **Light:** S01 shared; as the underside turns to the light its luminance rises from L 0.55 to L 0.82 (the "dramatic light change" CD §1.3 H1).
- **Materials:** S01 shared; skin from the consenting vaidyan's reference photos (N1).
- **ST:** master slice p 0.0924–0.1232.
- **Duration:** 40vh d / 28vh m (≈ 0.27 s).
- **Technique:** sequence. Motes fade out across local 0.80–0.88.
- **DOM:** `s01.caption` "Karinochi, *Vitex negundo*. One of three leaves we use for Elakizhi." `<p>`, Geist 400 `--step-body`, ≤ 38ch, binomial in `<i>`; desktop: placed in the copy zone with its bottom at `y_s` 0.68 (no headline is showing at this moment); `--film-ink`. Show **p 0.0980** (local 0.70), hide **p 0.1204** (local 0.86).
- **Audio:** insect layer `0 → 0.6` across local 0.70–0.95.
- **Next:** B01.5; frame index reaches 95 at local 0.90 and holds.

#### B01.5 Leaf to ink (outgoing half of T1)
- **Range:** local 0.88–1.00 · p 0.1232–0.1400 · vh d 160.2–182.0 · vh m 110.9–126.0
- **Start:** frame 93 (d), T1 `t` = 0.
- **End:** frame 95 held; T1 `t` = smoother(0.396) = **0.31**: the leaf's edges have turned to sepia line work, the first paper patches have bloomed.
- **Camera:** held at the B01.4 end pose.
- **Objects:** none moving (frame hold from local 0.90).
- **Light:** the frame's own; composite vignette fades `1 → 0` with `t`.
- **ST:** master slice p 0.1232–0.1400; T1 runs on its own window (§5.2).
- **Duration:** 21.8vh d / 15.1vh m.
- **Technique:** `Composite` uMode 1 (ink bleed). S02's R3F scene starts rendering into FBO B at p 0.1232, camera at K01 (§4).
- **DOM:** none.
- **Audio:** S01 bed crossfades to S02 bed over the T1 window.
- **Next:** T1 continues into B02.1 (§5.2).

---

### Scene 02: The botanical archive (p 0.140–0.460)

S02 is the signature scene. The beat cards give each phase; §4 gives the keyframes. Shared facts:

- **Technique:** real-time R3F scene `Archives.tsx` rendered into a premultiplied-alpha FBO (`useFBO`, RGBA8, canvas size × DPR). `Composite` draws the procedural paper sheet underneath (`uFlat = 1` from T1 end to T2 start), then `col = paper × (1 − a) + fbo.rgb`, then the dapple light over everything (CD §2.4: depth 0.085, rake 0.35, speed 2.6, scale 2.6), then grain 0.018. No vignette.
- **Sheet colour:** `--film-parchment` `oklch(0.90 0.035 82)`, foxing and edges `--film-parchment-2` `oklch(0.84 0.045 78)`, paper parameters pulp 0.115 / fibre 0.055 (+0.03 cross) / tooth 0.038 / fleck 0.55 on 1.9% of 3×3 px cells (CD §2.4).
- **Plates (`Plate.tsx`, one per row in CD §5.2, ring order Nirgundi, Eranda, Tila, Haridra, Shunti):**
  - Geometry: `PlaneGeometry(W, 1.30, 24, 1)` where `W = 1.30 × plate.aspect` (`aspect` = width / height of the cropped scan, **MEASURE** per plate, placeholder 0.78 → W 1.014), clamp W ≤ 2.0. A curl: vertex `z += 0.035 × (1 − (2u − 1)²)` (sagitta 3.5 cm, sheet bows toward the viewer).
  - Material `PlateMaterial` (custom `ShaderMaterial`, `toneMapped: false`, `transparent: true`, `premultipliedAlpha: true`): its own paper = the same procedural paper at L + 0.03 (`oklch(0.93 0.030 84)`), deckled edge alpha `smoothstep(0, 0.012, edgeDist + (fbm(uv × 40) − 0.5) × 0.008)`, ink texture `s02-<slug>-ink-2048` (KTX2 ETC1S; 1024 on mobile and tier 1/2) multiplied on: `col = paper × mix(vec3(1), inkRGB, inkA)`. Ink retouched to `oklch(0.28 0.035 55)` (CD §5.2).
  - Lambert term: light direction toward the light `L = normalize(−0.770, 0.480, 0.423)` (raking 25° across the sheet from the upper left), colour ≈ 4300 K `oklch(0.93 0.045 75)`, intensity 1.0; ambient 0.5 of the same colour (−1 stop). Shared paper normal map `paper-normal-1024` (512 mobile), strength 0.35, so the tooth shows under the raking light.
  - Dim uniform `uDim` 0..1: `rgb *= 1 − 0.12 × uDim`, then saturation `× (1 − 0.30 × uDim)` (CD §2.6), opacity `× (1 − 0.45 × uDim)`. No blur.
  - Shadow: a second quad 1.5 cm behind each plate, same size + 4%, texture `soft-rect-64.png` (generated once, Gaussian, radius 2% of frame), black, alpha 0.18, offset `(+0.6%, −1.2%)` of frame in screen space ≈ world `(+0.012, −0.024)` at the focus distance (CD §2.5). Drawn before the plate, `depthWrite: false`.
  - Idle float (time-based): `y += 0.015 × sin(0.5 × time + i)`, rotation z ± 0.4°. Off when `film.paused`.
- **Ring:** group centre `C = (−0.40, 0.00, −2.60)`, radius **R = 2.60**, plate *i* (0-based) at angle `θ_i = i × 72°` (5 plates; `360° / N` in general): position `C + (R sin θ_i + jR_i sin θ_i, yOff_i, R cos θ_i + jR_i cos θ_i)`, facing outward (rotation.y = θ_i). Depth jitter `jR = [0, +0.12, −0.10, +0.08, −0.06]`, height offsets `yOff = [0, +0.10, −0.08, +0.06, −0.05]` (brief: "floating at different depths"). Plate 0 at the front is at `(−0.40, 0, 0)`. Ring rotation `ringRot` (radians about Y, applied to the group) brings plate *k* to the front at `ringRot = −k × 72°`.
- **Camera:** `PerspectiveCamera`, vertical fov **28°** desktop (CD §2.6), near 0.05, far 30. It always looks along −Z (target = position + `(0, 0, −10)`), so only the position is keyframed. Interpolation: Catmull-Rom (`THREE.CatmullRomCurve3`, `centripetal`) through the §4 keyframe positions, with the easing named on the segment applied to the segment parameter via `gsap.parseEase(name)`.
- **Specimen:** Poly Haven `food_ginger_01` (CC0, 7,205 tris), processed by `scripts/build-glb.mjs` to `public/film/glb/ginger-d.glb` / `-m.glb`; its own PBR material (`MeshStandardMaterial`), `toneMapped: true` with `AgXToneMapping`, exposure 1.0, only inside this FBO. Lights for the specimen only (layer 1): `DirectionalLight` colour `oklch(0.90 0.06 70)` intensity 2.4 at `(−3.0, 2.2, 2.5)` aimed at the specimen; `HemisphereLight` sky `oklch(0.94 0.02 85)`, ground `oklch(0.55 0.04 70)`, intensity 0.8. Contact shadow: one `soft-rect-64` quad under the specimen on the sheet plane, alpha 0.18 → 0.10 as it rises.
- **Annotations:** DOM SVG (`PlateAnnotations.tsx`) positioned over the focused plate. Each frame `useFrame` projects the focused plate's 4 corners and writes a `matrix3d` (or translate + scale when the plate faces the camera within 2°) into the SVG wrapper's `style.transform` directly (no React render). Leader lines: `<path>` in plate UV space (viewBox `0 0 1000 ${1000/aspect}`), stroke `--film-sepia-soft`, 1.25 px (`vector-effect: non-scaling-stroke`). Labels: the Latin part names from `plates.ts` (*radix*, *rhizoma*, *folium*, *flos*, *fructus*, *semen*), Boska 400 italic `--step-small`, `--film-sepia-soft`. **Reconciliation with CD §2.7:** IM FELL English stays baked only into the plate texture's reference strip at the plate foot; the drawn annotations are DOM so every word is HTML (CD §7.1) and no extra font loads.
- **Light on the whole scene:** the dapple and rake from `Composite` (CD §2.4), read as coconut-palm shade. Window light ≈ 4300 K from the upper left.
- **DOM layout:** desktop names column `x_s` 0.58–0.94, the focused plate centred at `x_s` ≈ 0.36 (§4). Phone: §7.2.

#### B02.1 Ink resolves into the engraving (incoming half of T1)
- **Range:** local 0.000–0.080 · p 0.1400–0.1656 · vh d 182.0–215.3 · vh m 126.0–149.0
- **Start:** T1 `t` 0.31: S01 leaf in sepia line work over paper patches. FBO B shows plate 1 (Nirgundi) close up, plates 2–5 at opacity 0.
- **End:** T1 `t` 1: only paper and the Vitex engraving remain; the engraved leaflet chosen as `leafAnchor` sits where the painted leaf was.
- **Camera:** K01 → K03 (§4): `(aX − 0.320, aY + 0.0095, 1.90)` → `(aX − 0.282, aY + 0.006, 2.40)`, where `(aX, aY)` is plate 1's `leafAnchor` in world space (placeholder `(−0.278, 0.104)` → K01 `(−0.598, 0.114, 1.90)`).
- **Camera move:** straight dolly back +0.50 on Z with x easing toward the plate centre; ease `power1.out`.
- **Objects:** plate 1 static at the ring front, opacity 1, `uDim` 0. Plates 2–5 opacity 0 (they soak in during B02.2).
- **Light:** S02 shared; dapple fades in with `uFlat` (it is multiplied by `uFlat`).
- **Materials:** S02 shared.
- **ST:** master slice p 0.1400–0.1656; T1 window (§5.2). `data-film-tone` switches `dark → parchment` at **p 0.1444**.
- **Duration:** 33vh d / 23vh m.
- **Technique:** T1 composite + R3F.
- **DOM:** none.
- **Audio:** S02 bed 0.35.
- **Next:** B02.2.

#### B02.2 Pull back to the ring
- **Range:** local 0.080–0.200 · p 0.1656–0.2040 · vh d 215.3–265.2 · vh m 149.0–183.6
- **Start:** close on the Vitex leaf (K03).
- **End:** overview (K06–K07): the ring of five plates, plate 1 at the front right of centre (`x_s` 0.65), neighbours foreshortened at ±72°, the copy zone on the left calm.
- **Camera:** K03 `(−0.560, 0.090, 2.40)` → K04 `(−0.95, 0.12, 3.70)` → K05 `(−1.15, 0.14, 5.00)` → K06 `(−1.20, 0.15, 6.00)`, then hold to K07.
- **Camera move:** Catmull-Rom, ease `power2.inOut` over local 0.080–0.170; hold 0.170–0.200.
- **Objects:** plates 2–5 soak in: plate *i* (1-based) opacity `seg(local, 0.08 + 0.012 i, 0.15 + 0.012 i)` with an fBm brushed edge on its alpha (amplitude 0.06, as CD's soak-in); at overview non-front plates hold `uDim` 0.5 so the copy zone stays calm.
- **Light / materials:** S02 shared.
- **ST:** master slice p 0.1656–0.2040.
- **Duration:** 50vh d / 35vh m.
- **Technique:** R3F.
- **DOM:** `s02.head` "Plants of Malabar, recorded from 1678. Still in our medicines." (h2, Boska 300 `--step-head`, copy zone `x_s` 0.04–0.42, headline bottom `y_s` 0.68, `--film-sepia`) and `s02.caption` "Engravings from *Hortus Malabaricus*, Hendrik van Rheede's book of the plants of this coast." (Geist 400, 24 px below, `--film-sepia`). Show **p 0.1688** (local 0.09), hide **p 0.2008** (local 0.19).
- **Audio:** bed 0.35.
- **Next:** B02.3.

#### B02.3–B02.7 One plate at a time (5 identical segments)
Segment *k* (0-based plate index, `N` = 5): `local ∈ [0.20 + k × 0.12, 0.20 + (k+1) × 0.12]` (general: segment length `0.60 / N`). Inside it, `s` 0..1:

| Phase | `s` | What happens | Easing |
|---|---|---|---|
| a. Turn | 0.00–0.30 | `ringRot` from `−(k−1)·72°` to `−k·72°` (k = 0: no turn; instead the camera pans from overview to focus). Camera z `3.38 → 4.60 → 3.45` (peak at `s` 0.15), x 0, y `0.04 → 0.06 → 0.04`. | `power2.inOut` on the turn; the camera z arc is `3.45 + 1.15 × sin(π × s/0.30)` blended from the previous hold value |
| b. Come forward | 0.30–0.40 | Focused plate moves +0.25 along its outward normal (to z 0.25 at the front); neighbours `uDim 0 → 1`; plate `uDim` stays 0. | `power3.out` |
| c. Hold | 0.40–0.85 | Annotations draw (time-based, triggered at `s` 0.40, reversed below it); names block shows. Camera micro-push z `3.45 → 3.38` (2%), linear in scroll. | linear |
| d. Release | 0.85–1.00 | Plate back to z 0 (except the last plate, see B02.8); neighbours `uDim 1 → 0`; names hide at `s` 0.88. | `power2.in` |

| Beat | Plate (CD §5.2) | local | p | vh d | vh m | Names show / hide p |
|---|---|---|---|---|---|---|
| B02.3 | 1 Nirgundi, *Vitex negundo* | 0.200–0.320 | 0.2040–0.2424 | 265.2–315.1 | 183.6–218.2 | 0.2194 / 0.2378 |
| B02.4 | 2 Eranda, *Ricinus communis* | 0.320–0.440 | 0.2424–0.2808 | 315.1–365.0 | 218.2–252.7 | 0.2578 / 0.2762 |
| B02.5 | 3 Tila, *Sesamum indicum* | 0.440–0.560 | 0.2808–0.3192 | 365.0–415.0 | 252.7–287.3 | 0.2962 / 0.3146 |
| B02.6 | 4 Haridra, *Curcuma longa* | 0.560–0.680 | 0.3192–0.3576 | 415.0–464.9 | 287.3–321.8 | 0.3346 / 0.3530 |
| B02.7 | 5 Shunti, *Zingiber officinale* | 0.680–0.800 | 0.3576–0.3960 | 464.9–514.8 | 321.8–356.4 | 0.3730 / **0.4088** |

If plate 6 (Ashwagandha, CD §5.2 conditional) ships, `N = 6`, segment length 0.10, angles 60°, Ashwagandha at index 4 and ginger at index 5; recompute cue values with the same `s` thresholds (the code derives them from `N`; never hard-code them).

Per-segment card (applies to each of B02.3–B02.7):
- **Start:** previous plate released (or overview for k = 0).
- **End:** focused plate at the front, forward, fully annotated; then released.
- **Camera:** see §4 keyframes; focus pose `(0.00, 0.04, 3.45)` (distance 3.20 to the forward plate; the plate fills 81.5% of frame height, centred at `x_s` 0.36, `y_s` 0.525).
- **Camera move:** described in the phase table.
- **Objects:** ring turn; plate forward and back; idle float continues.
- **Light / materials:** S02 shared.
- **ST:** master slice per row; annotation and names cues per row.
- **Duration:** 50vh d / 35vh m per plate. Time-based parts: leader lines `drawSVG "0% 0%" → "0% 100%"` **900 ms**, 120 ms stagger, ease `avvvs`; labels opacity 0 → 1 **400 ms**, each starting when its leader is 70% drawn; the binomial script accent (one per page, CD §2.7) is drawn on the focused plate's names block by DrawSVG over **1200 ms**. Reverse on scroll back: all reverse at 1.5× speed.
- **Technique:** R3F + DOM SVG.
- **DOM (names block, desktop `x_s` 0.58–0.94, vertically centred on the plate, `--film-sepia`):**
  1. Common name, Boska 400 `--step-head` (e.g. "Five-leaved chaste tree").
  2. Binomial, Boska 400 italic `--step-lead`, inside `<i>`, with the SVG stroke accent drawn over it (the text itself is present and selectable).
  3. Sanskrit and Malayalam (romanised; script only after N6), Geist 400 `--step-body`; Malayalam in `lang="ml"`.
  4. Reference line, Geist `--step-small`: "Hort. Mal. XI, tab. 11" etc. (tab numbers for plates 1–2 only after N5).
  5. Note (CD §5.2 last column), Geist 400 `--step-body`, ≤ 38ch.
  6. "In:" up to 3 product links (`/products/{handle}`, in-stock first), Geist 500 `--step-small`, `--film-sepia`, underline on hover/focus (no colour transition).
  7. Visually-present list "Parts labelled: *rhizoma*, *folium*, …" Geist `--step-small` (same strings as the SVG labels).
  8. Button "Inspect plate" (ginger: "Inspect specimen"), §6.2.
  Reveal: lines 1–5 use the text-cue SplitText reveal; 6–8 fade 0 → 1 over 400 ms with 70 ms stagger after line 5 starts.
- **Audio:** paper rustle one-shot at `s` 0.30 crossing, −6 dB relative to the bed (only if N13 supplies a file).
- **Next:** segment *k+1*; after B02.7, B02.8.

#### B02.8 The ginger plate gives up its rhizome
- **Range:** local 0.800–0.880 · p 0.3960–0.4216 · vh d 514.8–548.1 · vh m 356.4–379.4
- **Start:** plate 5 (ginger) forward at z 0.25, annotated (K30). It does **not** release.
- **End:** the 3D rhizome stands free in front of the bare sheet, 0.60 in front of the plate's former position, yaw 35°, pitch −12°, its centre at screen `(0.66, 0.55)` desktop / `(0.50, 0.66)` mobile (K33). Plates 1–4 and the ginger plate's paper are gone.
- **Camera:** K30 `(0.00, 0.04, 3.38)` → K32 `(0.10, 0.03, 3.20)` → K33 `(S.x − 0.340, S.y + 0.060, S.z + 2.40)` where `S` = specimen world centre at the end pose (§4.4).
- **Camera move:** Catmull-Rom, `power2.inOut`.
- **Objects:**
  - `s` 0.00–0.35 (local 0.800–0.828): ginger plate `uDissolve 0 → 1`: fragment discard where `fbm(uv × 6) + 0.6 × (1 − regionMask) < uDissolve × 1.6`, where `regionMask` = 1 inside `plates.ts` `specimenRegion` (the rhizome on the engraving), so the paper around the rhizome goes first and the engraved rhizome's ink goes last (the brief's "root system separates"). Burn-free edge: 0.02 soft edge in `--film-parchment-2`. The specimen GLB fades in (material `opacity 0 → 1`, `transparent` only during the fade) at the engraved rhizome's place and orientation (`plates.ts` `specimenPose`: position offset in plate UV, yaw, roll, scale fitted so the GLB silhouette covers the engraving's rhizome ± 5%, **MEASURE**). Plates 1–4 opacity `1 − seg(s, 0, 0.35)`, their shadows with them.
  - `s` 0.35–1.00 (local 0.828–0.880): specimen rises +0.60 along +Z, yaw `0° → 35°`, pitch `0° → −12°`, `power2.out`. Contact shadow alpha 0.18 → 0.10 and grows 15%.
- **Light:** S02 shared + specimen lights. The specimen's key matches the sheet's raking light direction (upper left).
- **Materials:** GLB PBR as shipped (CC0), base colour untouched; sheet unchanged.
- **ST:** master slice p 0.3960–0.4216.
- **Duration:** 33vh d / 23vh m.
- **Technique:** R3F GLB. **Tier 1:** the specimen is the 24-frame `s02spec` sequence on a camera-facing quad instead of the GLB (§7.3). The GLB is requested at S02 local ≥ 0.40 (p ≥ 0.268) (tech-feasibility §3.6).
- **DOM:** ginger names block hides at **p 0.4088** (local 0.84) so it is gone before the specimen crosses the names column.
- **Audio:** bed 0.35.
- **Next:** B02.9 / T2.

#### B02.9 Ember burn out of the paper (outgoing half of T2)
- **Range:** local 0.880–1.000 · p 0.4216–0.4600 · vh d 548.1–598.0 · vh m 379.4–414.0
- **Start:** K33: specimen free on the sheet. T2 `t` 0.
- **End:** T2 `t` = smoother(0.774) = **0.92**: almost all of the sheet has burnt away from the specimen outward, revealing S03 frame 0 (the same rhizome, painted, on dark earth).
- **Camera:** held at K33 (no move during the burn; the shared element must stay put).
- **Objects:** specimen keeps turning, yaw `35° → 45°` linear in scroll (continues to 47° until the T2 window ends at p 0.4712).
- **Light:** unchanged; the ember line adds its own glow inside the composite only.
- **ST:** master slice p 0.4216–0.4600; T2 window.
- **Duration:** 50vh d / 35vh m.
- **Technique:** `Composite` uMode 2 (§5.3). `data-film-tone` `parchment → dark` at **p 0.4464**. Grain 0.018 → 0.028 and vignette 0 → 1 with `t`.
- **DOM:** none.
- **Audio:** S02 bed → S03–S04 bed crossfade over T2.
- **Next:** B03.1.

---

### Scene 03: From illustration to extraction (p 0.460–0.600)

Shared facts:
- **Technique:** sequence `s03`; frame map desktop `[[0,0],[0.45,35],[0.90,71],[1,71]]`, mobile `[[0,0],[0.45,23],[0.90,47],[1,47]]`. Before p 0.46 (during T2) frame 0 is held.
- **Frame 0 match (T2 shared element):** S03 frame 0 must show the ginger rhizome in **the same pose and screen position** as the specimen at K33 (centre `(0.66, 0.55)` d / `(0.50, 0.66)` m, yaw 35°, pitch −12°, apparent length 0.30 of frame width d / 0.62 m). Pipeline A: render the GLB at the K33 camera (Blender, same lens: 28° vertical fov ≈ 46 mm) on a flat `--film-earth` ground, then img2img it into the painted style with the S01 hero as style reference; that still is the image-to-video start frame of `s03a`. Pipeline B: render directly. **Acceptance:** silhouette IoU ≥ 0.85 between the GLB render and frame 0.
- **Painted light:** low key from the upper left, 30°, a narrow 20° cone, ≈ 3600 K `oklch(0.85 0.09 65)`; fill −2.5 stops; thin warm rim on the falling fragments; suspended dust lit only inside the cone (CD §2.5).
- **Palette:** ground `--film-earth` `oklch(0.30 0.05 60)`, shadow `oklch(0.22 0.04 50)`, mid `oklch(0.55 0.10 65)`, highlight `oklch(0.82 0.12 80)`, accent amber `--film-amber` `oklch(0.62 0.13 65)` ≤ 8% area.
- **Painted materials:** ginger skin `oklch(0.62 0.07 70)`, broken fibre `oklch(0.80 0.06 85)`, powder `oklch(0.82 0.05 85)`, liquid clear (shows the ground through it) warming to amber.
- **Virtual camera:** 100 mm macro; specimen centre at the origin.
- **Powder (real-time, `Particles.tsx` preset `s03`):** tier 3: 4,000 points; tier 2: 1,500; tier 1: 0. Box `x ∈ [−3, 3]`, `y ∈ [−2, 2]`, `z ∈ [−3.0, −0.2]`, curl-noise drift (frequency 0.6, speed 0.04 units/s) plus gravity −0.03 units/s, own camera fov 30°, `z_cam = −2.4 × seg(local, 0.45, 0.70)` linear (the camera moves through the particles). Size 1–3 px × DPR, near particles (closer than z −0.8) drawn larger and softer (radius × 2.2, alpha × 0.5) to fake the 1.5–2.5% painted defocus. Colour `oklch(0.82 0.05 85)`, normal blending, max alpha 0.50. Light gate as S01 (luma of the current frame, `smoothstep(0.30, 0.60, luma)`), so powder shows inside the key cone. Envelope `seg(local, 0.30, 0.45) × (1 − seg(local, 0.62, 0.75))`.
- **DOM:** `s03.head` "Ground into choornam. Cooked slowly into thailam." (h2) + `s03.caption` "Mezhu Thailam is one of the formulae handed down at AVVVS." Show **p 0.4740** (local 0.10), hide **p 0.5804** (local 0.86). `s03.head` is NEEDS-AVVVS (N9): in production, if the status is still `needs-avvvs`, render only the caption (CD §4.2 guard).

#### B03.1 Arrival (incoming half of T2)
- **Range:** local 0.00–0.08 · p 0.4600–0.4712 · vh d 598.0–612.6 · vh m 414.0–424.1
- **Start:** T2 `t` 0.92: a rim of burning parchment left at the frame edges.
- **End:** T2 `t` 1: frame 6 (d) / 4 (m); the painted rhizome on dark earth.
- **Camera (virtual):** `(0.00, 0.10, 0.45)` → target `(0.00, 0.03, 0.00)`; 100 mm.
- **Camera move:** none yet (frames 0–6 are the start of the clip's 6% push).
- **Objects:** the rhizome begins a slow turn (baked, yaw +4°).
- **Light / materials:** S03 shared.
- **ST:** master slice p 0.4600–0.4712.
- **Duration:** 14.6vh d / 10.1vh m.
- **Technique:** T2 composite + `s03`.
- **DOM:** none.
- **Next:** B03.2.

#### B03.2 The rhizome breaks
- **Range:** local 0.08–0.45 · p 0.4712–0.5230 · vh d 612.6–679.9 · vh m 424.1–470.7
- **Start:** frame 6 (d).
- **End:** frame 35 (d) / 23 (m): the rhizome has broken along its fibres into 5–7 fragments falling below frame centre; fine powder begins to shed from the broken faces.
- **Camera (virtual):** `(0.00, 0.10, 0.45)` → `(0.00, 0.09, 0.435)`; target fixed.
- **Camera move:** slow push, 3% of the clip's 6%, baked, linear.
- **Objects (baked):** break begins at frame 12, fragments fall with rotation ≤ 25° each, staying inside the subject zone `x_s` 0.55–0.80.
- **Light:** key cone narrows onto the break; rim on fragments.
- **Materials:** S03 shared.
- **ST:** master slice p 0.4712–0.5230.
- **Duration:** 67vh d / 47vh m.
- **Technique:** sequence; powder envelope starts at local 0.30.
- **DOM:** `s03.head` + `s03.caption` in at p 0.4740.
- **Audio:** water bed 0.5.
- **Next:** continuous into B03.3 (clip join `s03a` → `s03b`).

#### B03.3 Through the powder
- **Range:** local 0.45–0.70 · p 0.5230–0.5580 · vh d 679.9–725.4 · vh m 470.7–502.2
- **Start:** frame 36 (d) / 24 (m): fragments dissolving into a cloud of powder.
- **End:** frame 53 (d) / 36 (m): the powder settles toward a still liquid surface in the lower 60% of the frame.
- **Camera (virtual):** `(0.00, 0.09, 0.435)` → `(0.00, 0.06, 0.40)`; target `(0.00, 0.03, 0.00)` → `(0.00, −0.04, 0.00)` (tilts down 10°).
- **Camera move:** push 3% + tilt, baked, `sine.inOut`. Real-time powder camera `z 0 → −2.4`, linear.
- **Objects:** powder particles at full envelope until local 0.62, then fading.
- **Light / materials:** S03 shared.
- **ST:** master slice p 0.5230–0.5580.
- **Duration:** 45vh d / 32vh m.
- **Technique:** sequence + real-time powder.
- **DOM:** S03 text stays.
- **Next:** B03.4.

#### B03.4 Clear to amber
- **Range:** local 0.70–0.88 · p 0.5580–0.5832 · vh d 725.4–758.2 · vh m 502.2–524.9
- **Start:** frame 54 (d) / 36 (m): the liquid clear, the dark ground showing through.
- **End:** frame 69 (d) / 46 (m): the liquid amber `--film-amber`, a soft highlight `oklch(0.82 0.12 80)` across it, filling `y_s` 0.40–1.00; the amber region centred at `x_s` 0.66. **This amber field is the T3 shared element.**
- **Camera (virtual):** `(0.00, 0.06, 0.40)` → `(0.00, 0.055, 0.395)`; target fixed.
- **Camera move:** baked residual push, linear.
- **Objects:** powder settles; a single slow ripple (baked).
- **Light:** the key's warm reflection on the liquid.
- **ST:** master slice p 0.5580–0.5832.
- **Duration:** 33vh d / 23vh m.
- **Technique:** sequence.
- **DOM:** S03 text hides at p 0.5804.
- **Next:** B03.5.

#### B03.5 Displace out (outgoing half of T3)
- **Range:** local 0.88–1.00 · p 0.5832–0.6000 · vh d 758.2–780.0 · vh m 524.9–540.0
- **Start / End:** frame 69 → 71 (held from local 0.90); T3 `t` 0 → smoother(0.6) = 0.68.
- **Camera / objects:** held.
- **ST:** T3 window (§5.4).
- **Duration:** 21.8vh d / 15.1vh m.
- **Technique:** `Composite` uMode 3.
- **Next:** B04.1.

---

### Scene 04: The alchemy of nature (p 0.600–0.740)

Shared facts:
- **Technique:** sequence `s04`; frame map desktop `[[0,0],[0.42,35],[0.88,71],[1,71]]`, mobile `[[0,0],[0.42,23],[0.88,47],[1,47]]`.
- **Virtual set:** wide shallow brass **uruli** (diameter 0.45 m, depth 0.08 m) at the origin on dark teak; a brass **kindi** (spouted vessel) held upper right; steam ≤ 15% opacity (painted). No glassware (CD §1.3).
- **Virtual camera:** 85 mm, 30° down onto the uruli from table height: `(−0.04, 0.55, 0.95)` → `(+0.04, 0.55, 0.95)` over the whole scene (the 4% left-to-right lateral drift, CD §2.6), target `(0.00, 0.00, 0.00)` → `(0.08, 0.00, 0.00)`; baked, linear.
- **Painted light:** a single high window from the upper left, 45°, ≈ 3400 K `oklch(0.83 0.10 65)`; fill −2 stops; the brass takes a hard specular, the oil soft caustics (CD §2.5).
- **Palette:** ground `oklch(0.20 0.03 60)`, mid `oklch(0.65 0.11 80)`, highlight `oklch(0.93 0.08 90)`, accent brass `oklch(0.72 0.11 80)` (the only gilded object, ≤ 8% area). Max chroma outside the accent 0.08.
- **Materials (Blender fallback values):** brass Principled metallic 1.0, roughness 0.28, base `oklch(0.72 0.11 80)`; oil IOR 1.47, transmission 1.0, absorption tinted `--film-amber`; teak base `oklch(0.28 0.04 50)`, roughness 0.55; wooden spatula `oklch(0.55 0.06 65)`, roughness 0.7; sleeves unbleached cotton `oklch(0.88 0.02 90)`.
- **Spiral origin:** `S04.spiralOrigin` = the spiral centre on frame 71, in screen UV, **MEASURE** to ±0.5% of frame width; placeholders desktop `(0.69, 0.58)`, mobile `(0.50, 0.68)`.
- **DOM:** `s04.head` "Over 300 formulations, classical and our own." + `s04.caption` "Made at our GMP-certified factory in Kozhikode." Show **p 0.6140** (local 0.10), hide **p 0.7176** (local 0.84).

#### B04.1 Arrival (incoming half of T3)
- **Range:** local 0.00–0.08 · p 0.6000–0.6112 · vh d 780.0–794.6 · vh m 540.0–550.1
- **Start:** T3 `t` 0.68 → 1.
- **End:** frame 7 (d) / 4 (m): amber oil resting in the uruli, its surface region at `x_s` 0.55–0.80, `y_s` 0.45–0.75 (matches the S03 amber field).
- **Camera:** S04 shared, at its start.
- **ST:** T3 window.
- **Duration:** 14.6vh d / 10.1vh m.
- **Technique:** T3 + `s04`.
- **Next:** B04.2.

#### B04.2 The kindi pours
- **Range:** local 0.08–0.42 · p 0.6112–0.6588 · vh d 794.6–856.4 · vh m 550.1–592.9
- **Start:** frame 7 (d).
- **End:** frame 35 (d) / 23 (m): the kindi lifts away upper right; a thin stream ends; rings spread on the oil.
- **Camera:** drifting per S04 shared.
- **Objects (baked):** stream from the kindi spout falls into the uruli at `(0.70, 0.55)`; ripples.
- **Light / materials:** S04 shared.
- **ST:** master slice p 0.6112–0.6588.
- **Duration:** 62vh d / 43vh m.
- **Technique:** sequence.
- **DOM:** S04 text in at p 0.6140.
- **Audio:** water bed 0.5.
- **Next:** continuous into B04.3 (clip join `s04a` → `s04b`).

#### B04.3 Hands draw the spiral (H2)
- **Range:** local 0.42–0.88 · p 0.6588–0.7232 · vh d 856.4–940.2 · vh m 592.9–650.9
- **Start:** frame 36 (d) / 24 (m): two hands enter from the bottom edge; the left steadies the uruli rim, the right holds a flat wooden spatula.
- **End:** frame 71 (d) / 47 (m): the spatula has drawn the amber into a slow spiral (1.5 turns, clockwise seen from above), centred on `spiralOrigin`; the hands have withdrawn below the bottom edge by frame 66.
- **Camera:** drifting per S04 shared.
- **Objects (baked):** spatula path is an Archimedean spiral `r = 0.02 + 0.06 × θ/(3π)` m around the uruli centre; sleeves ≤ 2% kasavu border allowed (CD §1.3).
- **Light:** S04 shared; the spiral's ridges catch the key.
- **Materials:** S04 shared; skin from N1 references; hand checks per CD §2.10.
- **ST:** master slice p 0.6588–0.7232.
- **Duration:** 84vh d / 58vh m.
- **Technique:** sequence.
- **DOM:** S04 text hides at p 0.7176.
- **Next:** B04.4.

#### B04.4 The spiral opens (outgoing half of T4)
- **Range:** local 0.88–1.00 · p 0.7232–0.7400 · vh d 940.2–962.0 · vh m 650.9–666.0
- **Start / End:** frame 71 held; T4 `t` 0 → smoother(0.538) = 0.57.
- **ST:** T4 window (§5.5).
- **Duration:** 21.8vh d / 15.1vh m.
- **Technique:** `Composite` uMode 4.
- **Next:** B05.1.

---

### Scene 05: The AVVVS reveal (p 0.740–0.920)

**Order change from CD §1.3 (wording only, no content change):** the H3 hand sets Mezhu Thailam down *before* the orbit, not after it, so that the headline naming all three products (`s05.head`) appears only while all three are in frame. The hand still "picks, prepares and presents" in sequence across S01, S04 and S05.

Shared facts:
- **Layers inside the S05 FBO:** (1) `s05bg` painted dark-botanical ground (graded); (2) the product layer, one of `s05rim`, `s05h`, `s05p` (alpha WebP, **never graded**: CD §2.2 product exception). The product layer's alpha is written into the FBO alpha channel and `Composite` uses it as `uKeep`: where `uKeep > 0`, grade, grain, vignette and scrim are skipped (`col = mix(processed, raw, keep)`).
- **Frame maps (with H3):** `s05bg` `[[0,0],[0.38,0],[0.80,47],[1,47]]` d (`…31` m); `s05h` `[[0.22,0],[0.38,11]]`; `s05p` `[[0.38,0],[0.80,24]]`. **Without H3** (N2 not delivered): `s05bg` `[[0,0],[0.22,0],[0.80,47],[1,47]]`; `s05p` `[[0.22,0],[0.80,24]]`; the turntable includes all three products from the start; B05.3 is part of the orbit.
- **Runtime push:** `uZoom` (cover-fit zoom on the whole S05 FBO, both layers equally) `1.000 → 1.030` across local 0.08–0.88, linear (the 3% push, CD §2.6). Product pixels are upsampled ≤ 3%, which is not a repaint.
- **Virtual camera (bg and packshot rig must match):** 85 mm, 10° down, at radius 1.10 m from the product group centre (origin, at label height 0.07 m): start `(−0.115, 0.26, 1.094)` (azimuth −6°) → end `(+0.115, 0.26, 1.094)` (azimuth +6°), target `(0, 0.07, 0)`. CD's 85 → 135 mm change is **replaced by the runtime 3% push** because a turntable cannot change focal length between steps without refocusing the labels (note for the packshot brief).
- **Packshot rig (N2, asset-sources §5):** products on real dark teak on a motorised turntable; the camera fixed; the turntable rotates −6° → +6° in 0.5° steps (25 frames); f/11, focus-stacked so labels are sharp; ColorChecker frame at step 0. Lighting: large soft key from the upper left, 45°, ≈ 4000 K `oklch(0.88 0.06 65)`; fill −1.5 stops; **gold rim** from the back right, ≈ 3000 K `oklch(0.81 0.10 62)`, a strip light giving a 2–4 px edge at 1600 px width. `s05rim` = step 0 with key and fill off. Clipping-path cut-outs with the contact shadow kept as a 35%-alpha soft layer. Desktop and mobile crops come from the same 45 MP captures (mobile 9:16 crop: products arranged in depth, Rujanth Liniment front centre, Mezhu Thailam back left, Lakshol back right, so the group fits a 9:16 frame).
- **Painted ground:** `--film-forest` `oklch(0.20 0.035 150)` vignetting to `oklch(0.14 0.02 155)`; mid `oklch(0.32 0.05 150)`; out-of-focus painted leaves only in the outer 15% of the frame; centre 40% empty and evenly lit (CD §2.10 slot table). No haze.
- **Product placement:** group centre at `x_s` 0.68, `y_s` 0.60 desktop (subject zone); `x_s` 0.50, `y_s` 0.68 mobile. This equals `spiralOrigin` so the T4 ring opens straight onto the products.
- **No droplets.** The brief's "golden droplets float" is dropped: CD §2.11 bans gold dust and glowing particles, and the brief's rule 4 bans excessive gold. The gold is the rim light only.

#### B05.1 Arrival (incoming half of T4)
- **Range:** local 0.00–0.08 · p 0.7400–0.7544 · vh d 962.0–980.7 · vh m 666.0–679.0
- **Start:** T4 `t` 0.57: the gilt ring crest has passed the products.
- **End:** T4 `t` 1: forest-green ground, two rim-lit silhouettes (Rujanth Liniment, Lakshol) at the group position.
- **Camera:** start of the virtual arc (azimuth −6°), held.
- **Objects:** `s05rim` layer (with H3) / `s05rim` of the three-product group (without H3).
- **Light:** rim only (photographed); bg frame 0.
- **ST:** T4 window.
- **Duration:** 18.7vh d / 13vh m.
- **Technique:** T4 + S05 FBO.
- **Audio:** S05 night bed 0.4.
- **Next:** B05.2.

#### B05.2 Silhouette to light
- **Range:** local 0.08–0.22 · p 0.7544–0.7796 · vh d 980.7–1013.5 · vh m 679.0–701.6
- **Start:** silhouettes, rim light only.
- **End:** the same bottles fully lit by the photographed key; labels readable.
- **Camera:** azimuth −6°, `uZoom` 1.000 → 1.005.
- **Objects:** product layer crossfades `s05rim` → (`s05h` frame 0, or `s05p` step 0 without H3) across local **0.14–0.22**, linear. Both are real photographs of the same scene under two lighting states (no grading).
- **Light:** photographed key comes up.
- **Materials:** real packaging.
- **ST:** master slice p 0.7544–0.7796.
- **Duration:** 33vh d / 23vh m.
- **Technique:** S05 FBO layers.
- **DOM:** none.
- **Next:** B05.3.

#### B05.3 The hand sets Mezhu Thailam down (H3, real photograph)
- **Range:** local 0.22–0.38 · p 0.7796–0.8084 · vh d 1013.5–1050.9 · vh m 701.6–727.6
- **Start:** `s05h` frame 0: Rujanth Liniment and Lakshol on teak, the hand with Mezhu Thailam entering from the right edge.
- **End:** `s05h` frame 11: Mezhu Thailam standing beside Rujanth, the hand withdrawn out of frame.
- **Camera:** azimuth −6°, `uZoom` 1.005 → 1.012.
- **Objects:** 12 photographed frames; the composite blends `n`/`n+1`.
- **Light / materials:** photographed.
- **ST:** master slice p 0.7796–0.8084.
- **Duration:** 37vh d / 26vh m.
- **Technique:** S05 FBO, `s05h` layer. **If N2's H3 photos do not exist, this beat is part of B05.4** (see frame maps).
- **DOM:** none.
- **Next:** B05.4 (the last H3 frame is shot at turntable step 0, so it cuts invisibly to `s05p` step 0).

#### B05.4 The orbit
- **Range:** local 0.38–0.80 · p 0.8084–0.8840 · vh d 1050.9–1149.2 · vh m 727.6–795.6
- **Start:** `s05p` step 0, `s05bg` frame 0.
- **End:** `s05p` step 24, `s05bg` frame 47: the camera has arced 12° around the group (left to right).
- **Camera:** virtual arc azimuth −6° → +6° (baked into both layers), `uZoom` 1.012 → 1.027.
- **Camera move:** circular arc about the product group, radius 1.10 m, linear in scroll.
- **Objects:** none extra.
- **Light:** key, fill, gold rim (photographed and painted to match).
- **Materials:** real packaging; painted teak, leaves.
- **ST:** master slice p 0.8084–0.8840.
- **Duration:** 98vh d / 68vh m.
- **Technique:** S05 FBO, `s05bg` + `s05p`.
- **DOM:** `s05.head` "Rujanth, Mezhu Thailam and Lakshol. From our Kozhikode factory." (h2) and `s05.caption` "Three of the medicines AVVVS is known for. Each label lists what is inside." Show **p 0.8120** (local 0.40). `s05.productNames`: three links, one per line, Geist 500 `--step-body` name + Geist 400 `--step-small` price (`₹1,250` format, Shopify, build time), each to `/products/{handle}`; show **p 0.8228** (local 0.46). All hide at **p 0.8948** (local 0.86). These links are focusable and clickable during the film; skip any product Shopify does not return.
- **Audio:** bed 0.4.
- **Next:** B05.5.

#### B05.5 Hold
- **Range:** local 0.80–0.88 · p 0.8840–0.8984 · vh d 1149.2–1167.9 · vh m 795.6–808.6
- **Start / End:** last orbit frame held; `uZoom` 1.027 → 1.030.
- **ST:** master slice.
- **Duration:** 18.7vh d / 13vh m.
- **Technique:** S05 FBO.
- **DOM:** S05 text still visible until p 0.8948.
- **Audio:** bed 0.4 → 0 across local 0.80–1.00.
- **Next:** B05.6.

#### B05.6 Closing burn (outgoing half of T5)
- **Range:** local 0.88–1.00 · p 0.8984–0.9200 · vh d 1167.9–1196.0 · vh m 808.6–828.0
- **Start / End:** T5 `t` 0 → smoother(0.771) = 0.92; the burn front rises from the bottom edge.
- **ST:** T5 window (§5.6).
- **Technique:** `Composite` uMode 5. `uKeep` is ignored inside the burn region (the products burn with the frame, as the page takes over).
- **Next:** B06.1.

---

### Scene 06: Beyond the film (p 0.920–1.000)

#### B06.1 Burn ends on the page colour
- **Range:** local 0.00–0.08 · p 0.9200–0.9264 · vh d 1196.0–1204.3 · vh m 828.0–833.8
- **Start:** T5 `t` 0.92.
- **End:** T5 `t` 1: the stage is the theme's `--bg` everywhere.
- **ST:** T5 window. `data-film-tone` `dark → site` at **p 0.9124** (the chrome takes the theme `--ink`).
- **Technique:** composite. After p 0.93 the canvas sets `frameloop: "never"` and disposes S05 textures; the CSS stage background is `var(--bg)` so nothing changes visually.
- **Next:** B06.2.

#### B06.2 Hand-off
- **Range:** local 0.08–1.00 · p 0.9264–1.0000 · vh d 1204.3–1300 · vh m 833.8–900
- **Start:** empty `--bg` stage.
- **End:** p 1: the sticky stage releases and scrolls up with the end of the track; `#site` ("The store", CD §4.4) follows directly below.
- **Camera / objects / light:** none (DOM only).
- **ST:** master slice; Skip film hides at p 0.92.
- **Duration:** 96vh d / 66vh m.
- **Technique:** DOM/CSS.
- **DOM:** `handoff.note` "Scenes painted for this film. Medicines are made at our factory in Kozhikode." Geist 400 `--step-small`, `var(--muted)`, left-aligned at `x` = `--margin`, bottom at `y_s` 0.88 (phone: same). Show at **p 0.9280** (local 0.10), no hide (it scrolls away with the track). The "Image and sound credits" link lives in the footer (CD §4.4).
- **Audio:** silence.
- **Next:** the site.

---

## 4. Scene 02 keyframe-by-keyframe breakdown (desktop)

### 4.1 Derived constants
- fov 28°: `halfH(d) = d × tan(14°) = 0.2493 d`; `halfW(d) = halfH(d) × aspect` (desktop reference 16:9, `aspect = 1.778`; use the live aspect).
- Screen to world, camera looking along −Z: a world point `(X, Y, Z)` appears at `x_s = 0.5 + (X − camX) / (2 halfW)`, `y_s = 0.5 − (Y − camY) / (2 halfH)` with `d = camZ − Z`.
- **K01 (match to the S01 leaf):** with plate 1's `leafAnchor` world point `A = (aX, aY, 0)` and the target screen point `(0.69, 0.51)` at `d = 1.90`: `camX = aX − 0.19 × 2 × halfW(1.90) = aX − 0.320` (at 16:9), `camY = aY + 0.01 × 2 × halfH(1.90) = aY + 0.0095`, `camZ = 1.90`. Code computes this from the live aspect.
- `leafAnchor` (plate 1, UV, origin bottom-left): **MEASURE** on the retouched Vitex plate: pick a leaflet whose mid-vein runs lower-left to upper-right at 50–65° like the S01 macro. Placeholder `(0.62, 0.58)` → `A = (−0.40 + 0.12 W, 0.08 × 1.30) = (−0.278, 0.104)` for W 1.014.
- Focus pose: `(0.00, 0.04, 3.45)`; the forward plate (z 0.25) is 3.20 away; `halfH = 0.798`; plate height 1.30 = 81.5% of frame; centre `x_s` 0.359, `y_s` 0.525.
- Overview pose: `(−1.20, 0.15, 6.00)`; front plate at `x_s` 0.65, `y_s` 0.55, 43% of frame height.

### 4.2 Keyframes

Columns: K · S02 local · `p` · vh d · camera position (target is always position + (0,0,−10)) · ring rotation · plate states (z is the forward offset along the plate normal; op = opacity) · composite / uniforms · DOM · ease *into* this keyframe.

| K | local | p | vh d | Camera | ringRot | Plates | Composite and uniforms | DOM | Ease in |
|---|---|---|---|---|---|---|---|---|---|
| K00 | (pre) −0.054 | 0.1232 | 160.2 | K01 pose (held) | 0° | P1 op 1; P2–P5 op 0 | T1 starts: `uMode 1`, `t` 0, `uFlat` 0, grain 0.028, vignette 1 | — | — |
| K01 | 0.000 | 0.1400 | 182.0 | `(−0.598, 0.114, 1.90)` | 0° | same | T1 `t` 0.31; ink lines on S01 at 0.69 strength, paper front at ~15% coverage | — | hold |
| K02 | 0.040 | 0.1528 | 198.6 | `(−0.590, 0.112, 2.05)` | 0° | same | T1 `t` 0.83; S01 venation lines fading (alpha 0.85); Vitex ink at 0.7; grain 0.0197 | tone `parchment` since p 0.1444 | `power1.out` |
| K03 | 0.080 | 0.1656 | 215.3 | `(−0.560, 0.090, 2.40)` | 0° | same | T1 `t` 1 → `uMode 0`; `uFlat` 1; dapple on; grain 0.018; vignette 0 | — | `power1.out` |
| K04 | 0.110 | 0.1752 | 227.8 | `(−0.95, 0.12, 3.70)` | 0° | P2 op 0.66, P3 0.49, P4 0.31, P5 0.14 (soak-in) | — | `s02.head` + caption in (since p 0.1688) | `power2.inOut` |
| K05 | 0.140 | 0.1848 | 240.2 | `(−1.15, 0.14, 5.00)` | 0° | P2–P5 op 1, `uDim` 0.5 (non-front) | — | headline visible | `power2.inOut` |
| K06 | 0.170 | 0.1944 | 252.7 | `(−1.20, 0.15, 6.00)` | 0° | overview: P1 front `uDim` 0, others 0.5 | — | — | `power2.inOut` |
| K07 | 0.200 | 0.2040 | 265.2 | `(−1.20, 0.15, 6.00)` | 0° | same (hold) | — | head + caption out at p 0.2008 | linear |
| K08 | 0.236 | 0.2155 | 280.2 | `(0.00, 0.04, 3.45)` | 0° | P1 z 0 | — | — | `power3.inOut` |
| K09 | 0.248 | 0.2194 | 285.2 | `(0.00, 0.04, 3.43)` | 0° | P1 z 0.25; others `uDim` 1 | — | P1 names in; leaders draw 900 ms; script accent 1200 ms | `power3.out` |
| K10 | 0.302 | 0.2366 | 307.6 | `(0.00, 0.04, 3.38)` | 0° | hold | — | P1 names visible | linear |
| K11 | 0.320 | 0.2424 | 315.1 | `(0.00, 0.04, 3.38)` | 0° | P1 z 0; `uDim` 0 all | — | P1 names out at p 0.2378 | `power2.in` |
| K12 | 0.338 | 0.2482 | 322.6 | `(0.00, 0.06, 4.60)` | −36° | P1 sweeping left, P2 arriving from right | — | — | `power2.inOut` |
| K13 | 0.356 | 0.2539 | 330.1 | `(0.00, 0.04, 3.45)` | −72° | P2 at front, z 0 | — | — | `power2.inOut` |
| K14 | 0.368 | 0.2578 | 335.1 | `(0.00, 0.04, 3.43)` | −72° | P2 z 0.25; others `uDim` 1 | paper rustle one-shot (if N13) | P2 names in | `power3.out` |
| K15 | 0.422 | 0.2750 | 357.5 | `(0.00, 0.04, 3.38)` | −72° | hold | — | P2 names visible | linear |
| K16 | 0.440 | 0.2808 | 365.0 | `(0.00, 0.04, 3.38)` | −72° | P2 z 0; `uDim` 0 | — | P2 names out at p 0.2762 | `power2.in` |
| K17 | 0.458 | 0.2866 | 372.5 | `(0.00, 0.06, 4.60)` | −108° | turning | — | — | `power2.inOut` |
| K18 | 0.476 | 0.2923 | 380.0 | `(0.00, 0.04, 3.45)` | −144° | P3 at front | — | — | `power2.inOut` |
| K19 | 0.488 | 0.2962 | 385.0 | `(0.00, 0.04, 3.43)` | −144° | P3 z 0.25 | — | P3 names in | `power3.out` |
| K20 | 0.542 | 0.3134 | 407.4 | `(0.00, 0.04, 3.38)` | −144° | hold | — | P3 visible | linear |
| K21 | 0.560 | 0.3192 | 415.0 | `(0.00, 0.04, 3.38)` | −144° | P3 z 0 | — | P3 out at p 0.3146 | `power2.in` |
| K22 | 0.578 | 0.3250 | 422.5 | `(0.00, 0.06, 4.60)` | −180° | turning | — | — | `power2.inOut` |
| K23 | 0.596 | 0.3307 | 430.0 | `(0.00, 0.04, 3.45)` | −216° | P4 at front | — | — | `power2.inOut` |
| K24 | 0.608 | 0.3346 | 435.0 | `(0.00, 0.04, 3.43)` | −216° | P4 z 0.25 | — | P4 names in | `power3.out` |
| K25 | 0.662 | 0.3518 | 457.4 | `(0.00, 0.04, 3.38)` | −216° | hold | — | P4 visible | linear |
| K26 | 0.680 | 0.3576 | 464.9 | `(0.00, 0.04, 3.38)` | −216° | P4 z 0 | — | P4 out at p 0.3530 | `power2.in` |
| K27 | 0.698 | 0.3634 | 472.4 | `(0.00, 0.06, 4.60)` | −252° | turning | — | — | `power2.inOut` |
| K28 | 0.716 | 0.3691 | 479.9 | `(0.00, 0.04, 3.45)` | −288° | P5 (ginger) at front | — | — | `power2.inOut` |
| K29 | 0.728 | 0.3730 | 484.9 | `(0.00, 0.04, 3.43)` | −288° | P5 z 0.25 | GLB already requested (p ≥ 0.268) | P5 names in; button reads "Inspect specimen" | `power3.out` |
| K30 | 0.800 | 0.3960 | 514.8 | `(0.00, 0.04, 3.38)` | −288° | P5 z 0.25 (no release) | — | P5 visible | linear |
| K31 | 0.828 | 0.4050 | 526.4 | `(0.04, 0.035, 3.31)` | −288° | P5 `uDissolve` 1 (paper gone, rhizome ink last); P1–P4 op 0; specimen op 1 at `specimenPose` | — | — | `power2.inOut` |
| K32 | 0.856 | 0.4139 | 538.1 | `(0.10, 0.03, 3.20)` | −288° | specimen z +0.30, yaw 18°, pitch −6° | contact shadow 0.14 | P5 names out at p 0.4088 | `power2.inOut` |
| K33 | 0.880 | 0.4216 | 548.1 | `(S.x − 0.340, S.y + 0.060, S.z + 2.40)` | −288° | specimen z +0.60, yaw 35°, pitch −12° at screen (0.66, 0.55) | T2 starts: `uMode 2`, `uOrigin` = projected `S` (frozen now) | — | `power2.inOut` |
| K34 | 0.920 | 0.4344 | 564.7 | K33 (held) | — | specimen yaw 39° | T2 `t` 0.11; ember front just past the specimen silhouette | — | linear |
| K35 | 0.960 | 0.4472 | 581.4 | K33 | — | yaw 42° | T2 `t` 0.53; tone `dark` since p 0.4464; grain 0.023 | — | linear |
| K36 | 1.000 | 0.4600 | 598.0 | K33 | — | yaw 45° | T2 `t` 0.92 | — | linear |
| K37 | (post) +0.035 | 0.4712 | 612.6 | K33 | — | yaw 47°; S02 scene unmounts after this frame | T2 `t` 1 → `uMode 0`; S03 alone | `s03.head` in at p 0.4740 | linear |

### 4.3 Values between keyframes
- Camera position: Catmull-Rom through K01…K33 positions; per-segment parameter eased by the "Ease in" column of the *next* keyframe.
- `ringRot`: piecewise between the keyframes listed, same easing.
- Plate forward offset, `uDim`, opacity, `uDissolve`, specimen transforms: piecewise linear in the eased segment parameter.
- During the text-cue tweens (time-based) the scroll can keep moving; the cue reverses if the threshold is crossed back.
- The idle float and the dapple run on time, independent of scroll.

### 4.4 Specimen end pose `S`
`S = plate5Front + specimenPose.offset + (0, 0, 0.25 + 0.60)`, where `plate5Front = (−0.40, yOff_4, 0)` after the ring turn and `specimenPose.offset` is the rhizome's position on the plate in world units (**MEASURE**; placeholder `(+0.05, −0.18, 0)` → `S = (−0.35, −0.23, 0.85)` → K33 camera `(−0.69, −0.17, 3.25)`). Acceptance: at K33 the projected specimen centre is within 1% of `(0.66, 0.55)` and its apparent length is 0.28–0.32 of frame width.

### 4.5 What each keyframe must look like (review checklist)
- K01: frame reads as the S01 leaf drawn in sepia on paper; no flat cut. Leaf anchor within 3% of frame width of the painted mid-vein mid-point.
- K03: only paper and one engraving, no colour from S01 left (max chroma ≤ 0.05).
- K06: five plates visible (two at the edges partly), copy zone luminance std-dev ≤ 0.06.
- K09, K14, K19, K24, K29: focused plate fills 78–85% of frame height, names column clear of plate ink (no plate pixel with L < 0.60 inside the names block's bounding box), every leader line ends on its structure (within 1% of plate width).
- K31: no paper left on plate 5 except the rhizome's ink, which fades by K32.
- K33: specimen and contact shadow only, on bare sheet with dapple.
- K36: ember front, char and S03 frame 0 visible; no straight edges.

---

## 5. Transition specification

### 5.1 The composite pass (`Composite.tsx`, GLSL ES 3.0 via `ShaderMaterial` with `glslVersion: THREE.GLSL3`)

Uniforms (all set from `film.get()` in `useFrame`; constants from `timeline.ts`):

| Uniform | Type | Meaning / default |
|---|---|---|
| `tA`, `tB` | sampler2D | Outgoing / incoming scene FBO (premultiplied RGBA). Outside a window only `tA` is bound and `uMode = 0`. |
| `uRes` | vec2 | Drawing-buffer size in px |
| `uAspect` | float | `uRes.x / uRes.y` |
| `uMode` | int | 0 none, 1 ink bleed, 2 ember burn (oval), 3 displace, 4 spiral ring, 5 closing burn |
| `uT` | float | `smoother(seg(p, a, b))` of the active window |
| `uTime` | float | seconds, frozen while `film.paused` is false? No: runs always except under static mode; shader drift ≤ 0.06 / s (CD §7.5) |
| `uSeed` | float | grain seed, changes at 24 Hz |
| `uGrain` | float | 0.028 dark, 0.018 S02, lerped by `uT` across T1 and T2 |
| `uVig` | float | vignette strength 0..1 (1 = −0.3 EV at the corners, radius 0.35) |
| `uFade`, `uFadeCol` | float, vec3 | S01 open fade toward `--film-night` |
| `uFlat` | float | Paper-sheet amount (0 dark scenes, 1 in S02) |
| `uPaper` | vec3 | `--film-parchment` linear |
| `uPap` | vec4 | pulp 0.115, fibre 0.055, tooth 0.038, fleck 0.55 |
| `uDapple` | vec4 | depth 0.085, rake 0.35, speed 2.6, scale 2.6 |
| `uInk` | vec3 | `--film-sepia` linear |
| `uScale` | float | noise scale (T1, T3: 3.0) |
| `uEdge` | float | front softness (T1: 0.10) |
| `uInkLo`, `uInkHi` | float | Sobel threshold 0.42 / 0.46 |
| `uOrigin` | vec2 | burn / ring origin in screen UV (y up in GLSL: pass `(x_s, 1 − y_s)`) |
| `uBurnFld` | vec4 | noise, grain, dither, hash: T2 (0.295, 0.125, 0.052, 0.15); T5 (0.06, 0.17, 0.01, 0.10) |
| `uCharW` | float | char band width in front units (T2, T5: 0.031) |
| `uCharCol` | vec3 | `oklch(0.20 0.03 50)` linear |
| `uEmberW` | float | ember line half-width in front units = `0.0052 / maxDist` (total 1.04% of frame height) |
| `uEmber` | vec3 | `--film-ember` `oklch(0.78 0.155 60)` linear |
| `uBehind` | vec3 | T5 only: the theme `--bg` linear, read once per theme change from `getComputedStyle` |
| `uCrestW` | float | T4 crest width 0.08 |
| `uBlock` | vec2 | T4 block sizes in px (24, 8) |
| `uSplit` | float | T4 R/B split 0.004 |
| `uFlare` | vec3 | T4 gilt screen flare `vec3(1.0, 0.82, 0.45) × 0.35` (≈ `oklch(0.88 0.11 75)` at 0.35) |
| `uSwirl` | float | T4 swirl of A inside the front, max 0.35 rad |
| `uDisp` | float | T3 displacement 0.22 |
| `uZoom` | float | S05 cover-fit zoom (1.0–1.03), applied when sampling the S05 FBO |
| `uKeep` | (FBO alpha) | S05 product mask: skip grade/grain/vignette/scrim |
| `uGrade` | vec3 | per-scene lift, gamma, gain (CD §2.9), from `timeline.ts` |
| `uScrim` | float | 0..0.18, multiply toward `vec3(0.698, 0.667, 0.635)` |
| `uCover` | float | Skip-film cover 0..1 toward `uBehind` (§6.1); normally 0 |

Order of operations per fragment: sample A and B (with `uZoom` when the scene is S05) → transition mix by `uMode` → paper and dapple (`uFlat`) → grade → scrim → vignette → grain → `uCover`. Products: `mix(result, rawA, keep × (1 − burnMask))`.

**Exactness acceptance (all modes):** at `uT = 0` the output equals the A-only output and at `uT = 1` the B-only output; check with `readPixels` on a 4×4 grid of samples, max difference 1/255. No straight wipe edge in any mode. No region changes luminance by more than 0.1 L more than 3 times per second at any scroll speed up to 400vh/s (WCAG 2.3.1).

Noise helpers (write our own; never paste pear's GLSL): `hash(vec2)`, value noise, `fbm` with 4 octaves (2 on mobile via `#define PHONE`), lacunarity 2.03, gain 0.5; Bayer 4×4 matrix.

### 5.2 T1 S01 → S02: ink bleed

| Item | Spec |
|---|---|
| Window | p 0.1232–0.1656 (vh d 160.2–215.3, vh m 110.9–149.0) |
| Shared visual element | **The karinochi leaf's venation.** The painted leaf (S01 frame 95) becomes sepia line work, and the engraved Vitex leaflet (plate 1, `leafAnchor`) takes its place at the same screen point `(0.69, 0.51)` d / `(0.51, 0.66)` m. |
| A / B | A = S01 FBO (frame 95 held). B = S02 FBO composited over the procedural paper (`uFlat` is forced to 1 inside B's branch). |
| Technique | `uMode 1`. 1) `e = length(sobel(luma(A)))` at 1-texel offsets; `line = smoothstep(uInkLo, uInkHi, e)`. 2) `Ainked = mix(A, mix(A, uInk, line), smoothstep(0.0, 0.45, uT))` and A is desaturated by `0.8 × smoothstep(0.1, 0.5, uT)`. 3) Paper front: `f = fbm(uv × uScale)`, `m = smoothstep(f − uEdge, f + uEdge, uT × 1.30 − 0.15)`. 4) Behind the front: `paperLines = paper × mix(1, inkMul, line × (1 − smoothstep(0.80, 1.0, uT)))` where `inkMul = uInk / paper`; i.e. S01's venation lines stay drawn on the paper until the last 20%. 5) B's engraving fades in under the lines: `behind = mix(paperLines, Bcomp, smoothstep(0.55, 1.0, uT))`. 6) `col = mix(Ainked, behind, m)`. |
| Uniforms | `uT`, `uScale 3.0`, `uEdge 0.10`, `uInkLo 0.42`, `uInkHi 0.46`, `uInk` sepia, `uPaper`, `uPap`, `uDapple` (dapple × `m`), `uGrain` 0.028 → 0.018 (× `uT`), `uVig` 1 → 0 (× `uT`) |
| Progress mapping | `uT = smoother(seg(p, 0.1232, 0.1656))`. Milestones: `uT` 0.25 lines fully drawn on A; 0.50 half the frame is paper (tone switch at p 0.1444); 0.80 S01 lines begin to fade; 1.0 S02 only. |
| Mobile | same; `PHONE` fbm; anchor `(0.51, 0.66)` |
| Reduced motion | not used (static film, §8) |

### 5.3 T2 S02 → S03: ember burn (oval)

| Item | Spec |
|---|---|
| Window | p 0.4216–0.4712 (vh d 548.1–612.6, vh m 379.4–424.1) |
| Shared visual element | **The ginger rhizome.** The 3D specimen (A) and the painted rhizome on S03 frame 0 (B) occupy the same pose and screen position (§3 S03 frame 0 match). The burn starts *at* the rhizome, so the 3D object turns into its painting first, then the sheet burns away around it. |
| A / B | A = S02 FBO over paper (specimen still turning). B = S03 FBO (frame 0 held until p 0.46, then frames 0–6). |
| Technique | `uMode 2`. `q = (uv − uOrigin) × vec2(uAspect, 1)`; `r = length(q) / maxDist` (`maxDist` = distance from `uOrigin` to the farthest corner in the same units, computed on the CPU); `field = r + (fbm(uv × 4.0 + uTime × 0.02) − 0.5) × uBurnFld.x`; front radius `R = mix(−0.35, 1.30, uT)`; `d = field − R`. `d < −uEmberW`: B. `|d| ≤ uEmberW`: ember line `col = A × mix(2.2, 5.0, 0.5 + 0.5 sin(uTime × 1.4 + uv.x × 10.0)) × 0.25 + uEmber × 0.55`, clamped to L ≤ 0.92. `uEmberW < d < uEmberW + uCharW`: A darkened toward `uCharCol` by `1 − (d − uEmberW) / uCharW`, stippled with Bayer 4×4 at threshold `uBurnFld.z` and a per-pixel hash at `uBurnFld.w`, plus grain `uBurnFld.y`. Else: A. |
| Uniforms | `uT`, `uOrigin` (projected specimen centre, frozen at window start; expected `(0.66, 0.45)` in GL UV = screen `(0.66, 0.55)`), `uBurnFld (0.295, 0.125, 0.052, 0.15)`, `uCharW 0.031`, `uCharCol`, `uEmberW`, `uEmber`, `uGrain` 0.018 → 0.028, `uVig` 0 → 1, `uFlat` (A side only) |
| Progress mapping | `uT = smoother(seg(p, 0.4216, 0.4712))`. `uT` 0.12: the front has just passed the rhizome silhouette (the 3D specimen is replaced by its painting); 0.50: half the frame (tone switch at p 0.4464); 1.0: S03 only. |
| Reconciliation | CD §2.8 writes "char band 0.31 wide". In this shader's front units (0 = origin, 1 = farthest corner) 0.31 would char a third of the frame at once, so the band width is **0.031** and the darkening is full strength at the ember side. Flagged for review in the prototype. |
| Mobile | `uOrigin` from the mobile projection (expected screen `(0.50, 0.66)`); `PHONE` fbm |

### 5.4 T3 S03 → S04: displace

| Item | Spec |
|---|---|
| Window | p 0.5832–0.6112 (vh d 758.2–794.6, vh m 524.9–550.1) |
| Shared visual element | **The amber liquid.** S03's amber field (frame 71, `x_s` 0.55–0.80, `y_s` 0.40–1.00) and S04's oil in the uruli (frame 0, `x_s` 0.55–0.80, `y_s` 0.45–0.75) overlap and share the hue `--film-amber`. Acceptance: mean OKLCH hue of the two regions within 6°, L within 0.06. |
| Technique | `uMode 3` (CD §2.8): `n = fbm(uv × uScale)`; `dv = vec2(n − 0.5, fbm(uv × uScale + 19.0) − 0.5)`; `m = smoothstep(n − 0.1, n + 0.1, uT × 1.25 − 0.12)`; `col = mix(A(uv + dv × uDisp × uT), B(uv − dv × uDisp × (1 − uT)), m)`. |
| Uniforms | `uT`, `uScale 3.0`, `uDisp 0.22`, `uGrain` 0.028, `uVig` 1 |
| Progress mapping | `uT = smoother(seg(p, 0.5832, 0.6112))`; tone stays `dark`. |
| Mobile | same; `PHONE` fbm |

### 5.5 T4 S04 → S05: spiral ring

| Item | Spec |
|---|---|
| Window | p 0.7232–0.7544 (vh d 940.2–980.7, vh m 650.9–679.0) |
| Shared visual element | **The spiral's centre.** The ring opens exactly at `spiralOrigin` (S04 frame 71), which is where the S05 product group stands. The brass highlight becomes the gilt crest. |
| Technique | `uMode 4`. `q = (uv − uOrigin) × vec2(uAspect, 1)`; `r = length(q) / maxDist`; `θ = atan(q.y, q.x)`; front `R = mix(0.0, 1.15, uT) + 0.06 sin(3θ + 0.3 uTime) + 0.04 sin(5θ − 0.2 uTime)`. A is sampled with a swirl: rotate `q` by `uSwirl × uT × (1 − smoothstep(0.0, R, r))` (the spiral turns faster as the ring nears, then stops). Inside `R − uCrestW < r < R` (crest): sample A on a block grid (`uBlock.x` = 24 px for the outer half of the crest, `uBlock.y` = 8 px for the inner half), R and B channels offset by `± uSplit` along the radius, Bayer 4×4 dither on the crest's edge, then screen-blend `uFlare` × `1 − abs(2 (R − r)/uCrestW − 1)`. `r < R − uCrestW`: B. Else: A. |
| Uniforms | `uT`, `uOrigin` = `S04.spiralOrigin` (GL UV), `uCrestW 0.08`, `uBlock (24, 8)`, `uSplit 0.004`, `uFlare`, `uSwirl 0.35`, `uGrain` 0.028, `uVig` 1 |
| Progress mapping | `uT = smoother(seg(p, 0.7232, 0.7544))`; crest passes the product group's edge at `uT` ≈ 0.25; covers the frame at `uT` 1.0. |
| Mobile | `uOrigin` mobile `(0.50, 0.68)` (screen); blocks (16, 6) px |

### 5.6 T5 S05 → S06: closing burn

| Item | Spec |
|---|---|
| Window | p 0.8984–0.9264 (vh d 1167.9–1204.3, vh m 808.6–833.8) |
| Shared visual element | **The ember line**, which bookends T2, and **the page colour** (`--bg`), which becomes the site below. The gold rim of the bottles is the last warm colour before the ember passes. |
| Technique | `uMode 5`. `field = (1.0 − uvGL.y) … ` i.e. distance from the bottom edge `yb = uvGL.y` (0 at the bottom); `field = yb + (fbm(uv × 5.0 + uTime × 0.02) − 0.5) × uBurnFld.x × 4.0`; front `R = mix(−0.10, 1.10, uT)`; `d = field − R`. `d < −uEmberW`: `uBehind`. Ember line and char band as T2 with `uBurnFld (0.06, 0.17, 0.01, 0.10)`. The `uKeep` product exception does not apply where `d < uEmberW + uCharW`. |
| Uniforms | `uT`, `uBehind` (theme `--bg`), `uBurnFld`, `uCharW 0.031`, `uCharCol`, `uEmberW` (front units: 0.0052 of frame height), `uEmber`, `uGrain` 0.028 → 0, `uVig` 1 → 0 |
| Progress mapping | `uT = smoother(seg(p, 0.8984, 0.9264))`; tone switch `dark → site` at p 0.9124; after `uT` 1 the CSS stage background `var(--bg)` matches, the canvas stops. |
| Theme change mid-film | when `data-theme` changes, re-read `--bg` and update `uBehind` in the same frame. |

### 5.7 Window summary (for `timeline.ts`)

```ts
export const TRANSITIONS = [
  { id: "t1", from: "s01", to: "s02", a: 0.1232, b: 0.1656, mode: 1 },
  { id: "t2", from: "s02", to: "s03", a: 0.4216, b: 0.4712, mode: 2 },
  { id: "t3", from: "s03", to: "s04", a: 0.5832, b: 0.6112, mode: 3 },
  { id: "t4", from: "s04", to: "s05", a: 0.7232, b: 0.7544, mode: 4 },
  { id: "t5", from: "s05", to: "s06", a: 0.8984, b: 0.9264, mode: 5 },
] as const;
```
Derive `a` and `b` in code from `SCENES` (`a = from.end − 0.12 × fromLen`, `b = to.start + 0.08 × toLen`) and assert they equal these values in a unit test, so retiming a scene retimes its transitions.

---

## 6. Interactions

### 6.1 Skip film
- **Element:** `SkipFilm.tsx`, an `<a href="#site" class="film__skip">Skip film</a>`. It is the first focusable element inside the track (after the site-wide "Skip to content") and is also fixed bottom-right: `right: var(--margin)`, `bottom: 24px` (phone: `bottom: max(16px, env(safe-area-inset-bottom))`), min hit area 44 × 44 px, Geist 500 `--step-small`, ink by `data-film-tone`, no box, underline on hover and focus.
- **Visibility:** `p ∈ [0.02, 0.92]` (opacity 0 → 1 over 200 ms; `visibility: hidden` outside so it leaves the tab order). Before 0.02 it is reachable as the in-track link.
- **Without JS:** native anchor jump to `#site`.
- **With JS (live mode):** `preventDefault()`, then:
  1. `film.skipping = true`; audio master fades out over 600 ms.
  2. A DOM cover `<div class="film__cover">` (background `var(--bg)`, fixed, inset 0, z above the stage, below the nav) goes `opacity 0 → 1` over **240 ms**, ease `avvvs`. (A fast `scrollTo` through 1300vh would strobe through every transition, which breaks WCAG 2.3.1; the cover hides it.)
  3. On cover complete: `lenis.scrollTo("#site", { immediate: true, force: true })` (native: `window.scrollTo({ top, behavior: "instant" })`).
  4. Next frame: canvas `frameloop = "never"`, cover `opacity 1 → 0` over 240 ms, focus `#site h2` (it has `tabindex="-1"`).
- **Esc:** when focus is inside the track or on the stage, Esc does the same as Skip film (not when a dialog is open).
- **Reduced motion / static:** plain anchor jump, no cover animation (`behavior: "instant"`), focus as step 4.
- **Coming back:** scrolling up re-enters the film at the end and plays backwards normally; no extra control.

### 6.2 Pause and inspect a plate or the specimen (S02)
- **Triggers:** (a) the "Inspect plate" button in each plate's names block (ginger: "Inspect specimen"); (b) a click or tap on the focused plate itself: an invisible hit area `<div aria-hidden="true" tabindex="-1">` that follows the projected plate rect (same per-frame transform as the annotations), active only during phase c (hold) of that plate. The button is the accessible trigger; the hit area is a pointer convenience.
- **If the button is activated when its plate is not in hold** (keyboard user tabbing through the hidden plates, or a click during a turn): first scroll to that plate's hold centre `p_hold = segStart + 0.625 × segLen` (in global p) with `lenis.scrollTo(y, { duration: 0.8, easing: avvvs })` (native smooth scroll on touch), which stays inside S02 so no transition flashes; then open. **Keyboard focus on any plate button** (focus event) also scrolls to that plate's hold, so tabbing walks the ring.
- **Open (time-based, 640 ms, ease `avvvs`):**
  1. `film.paused = true`; `lenis.stop()`; `document.documentElement.style.overflow = "hidden"` (native scroll lock on touch); frameloop `"demand"` (invalidate on every inspect input).
  2. Camera tweens from its current pose to the **inspect pose**: plate facing the camera (plate tilt 0), camera `(plateX + 0.34 × halfW_factor…)`; concretely desktop `(plate.x + 0.55, plate.y, plate.z + 2.70)` so the plate fills ≈ 97% of frame height and sits at `x_s` ≈ 0.30 (left of the panel). Mobile: §7.2.
  3. The `<dialog class="inspect">` opens with `showModal()`. It covers the viewport (`inset: 0; width: 100%; height: 100%; max-width: none; background: transparent; border: 0; padding: 0`), `::backdrop { background: transparent }`. Inside: a **view surface** (left, `x_s` 0–0.58) and a **panel** (right, `width: min(36rem, 42vw)`, full height, background `var(--film-parchment)`, ink `var(--film-sepia)`, radius 0, no border, no blur, `overflow-y: auto`, `data-lenis-prevent`). Panel enters `x: 24px → 0`, opacity 0 → 1 over 320 ms.
  4. Focus moves to the panel heading (`tabindex="-1"`).
- **Panel content (all from `plates.ts`, same strings as the names block):** h2 common name (Boska 400 `--step-head`); binomial `<i>`; Sanskrit; Malayalam (romanised until N6); reference; note; "Parts labelled" as a list of buttons (one per annotation: focusing or hovering one sets `inspect.highlight = id`, which thickens that leader to 2.5 px and pans the view so the structure is centred, 400 ms); "In:" product links; credit line from `credits.ts` (Rheede attribution); controls "Zoom in", "Zoom out" (and for ginger "View specimen" / "View plate" toggle); **"Return to film"** as the last button (text button, Geist 500 `--step-body`, `--film-sepia`, underline).
- **View surface:** `role="group"`, `aria-label` "Plate view" (UI label), pointer events forwarded to `film.inspect`:
  - Plate: drag pans (clamped so the plate edge never passes the surface centre), wheel / pinch / buttons zoom 1× → 3× in steps of 0.5 (camera z = `2.70 / zoom` relative to the plate); double-click toggles 1×/2×. Arrow keys pan 5% of the plate per press when the surface has focus; `+` / `−` zoom.
  - Specimen (ginger, "View specimen"): the plate fades to 0.2 opacity, the GLB moves to the surface centre (400 ms) and drag rotates it (yaw unlimited, pitch ±30°), zoom 1× → 2.5×. Tier 1 / static: drag scrubs the 24-frame `s02spec` sequence (yaw only).
  - Textures: the focused plate swaps to its 2048 KTX2 if it was showing 1024.
- **Close ("Return to film", Esc, or `dialog` `cancel` event):** panel exits (opacity → 0, 200 ms); camera tweens back to the stored pre-inspect pose (640 ms); `dialog.close()`; overflow restored; `lenis.start()`; `film.paused = false`; focus returns to the trigger button. The scroll position never changed, so the film resumes exactly where it was.
- **Analytics / URL:** none; no hash or history entry (the route stays static).
- **Reduced motion and static mode:** the same dialog over the static S02 grid; the view surface shows the plate as `<img>` (AVIF 2048) zoomed with CSS `transform: scale()` (transforms only) and dragged with pointer events; no camera tweens; panel appears with opacity only (≤ 120 ms). Ginger "View specimen" shows `s02-ginger-specimen-1600.avif` (an offline GLB render; tier/static), and drag scrubs `s02spec` frames only if the visitor chose "Play film".

### 6.3 Return to film after leaving it
- From inspect: §6.2 close.
- After Skip film: scrolling up, or the nav's logo link to `/#film-track` (it is the home link; on the home page it uses the same cover-and-jump as Skip film, in reverse, landing at p 0).
- From the static film toggle: footer "Play film" (CD §4.2 `chrome.still`) saves `avvvs-film = "play"`, reloads the film in live mode and scrolls to the track top with the cover-and-jump.

### 6.4 New UI strings (add to `src/content/film.ts` with `status: "tone"`, for client approval)

| ID | Text |
|---|---|
| `chrome.inspectPlate` | Inspect plate |
| `chrome.inspectSpecimen` | Inspect specimen |
| `chrome.returnToFilm` | Return to film |
| `chrome.zoomIn` / `chrome.zoomOut` | Zoom in / Zoom out |
| `chrome.viewSpecimen` / `chrome.viewPlate` | View specimen / View plate |
| `chrome.partsLabelled` | Parts labelled |
| `chrome.plateView` | Plate view (aria-label only) |

---

## 7. Mobile variant (viewport < 768 px or `isMobile`)

### 7.1 Global differences
| Item | Desktop | Mobile |
|---|---|---|
| Track / scroll distance | 1400vh / 1300vh | 1000vh / 900vh (same `p` ranges, so every `p` in this file holds) |
| Scroll | Lenis lerp 0.085 | Native touch scroll (no Lenis); ScrollTrigger reads native scroll; `ScrollTrigger.config({ ignoreMobileResize: true })`; stage height `100svh` so the URL bar does not resize it |
| Frames | 1600×900 | 720×1280, rendered or generated **separately** at 9:16 (never cropped from 16:9), except packshots (cropped from the same 45 MP capture) |
| Composition | subject `x_s` 0.62–0.76, copy zone `x_s` 0.04–0.42 | subject `x_s` 0.40–0.60, `y_s` 0.58–0.78; copy zone `y_s` 0.10–0.40 (CD §2.1) |
| Text | headline bottom at `y_s` 0.68 | headline top at `y_s` 0.12, caption 16 px below; max 2 lines headline |
| DPR | ≤ 1.75 (tier 3) | ≤ 1.5 (tier 2), 1 (tier 1) |
| fbm | 4 octaves | 2 octaves (`PHONE`) |
| Particles | 1,500 / 4,000 | 600 / 1,500 (tier 2), 0 (tier 1) |
| Plates | KTX2 2048 | KTX2 1024 |
| Skip film | bottom-right | bottom-right above the safe area |
| Orientation change | — | on `resize` that crosses 768 px or flips orientation: `ScrollTrigger.refresh()`, swap the frame set (keep the current frame index ratio), recompute cameras |

### 7.2 Per scene
| Scene | Mobile variant |
|---|---|
| S01 | `s01` mobile 64 frames, same beats and cues. Leaf mid-vein `(0.40, 0.80)` → `(0.62, 0.52)`, anchor `(0.51, 0.66)`. H1 enters from the lower right edge at `(1.05, 0.95)`. h1 and lead in the top zone (`y_s` 0.12–0.40). |
| S02 | Camera fov **34°**; ring `C = (0, 0, −2.20)`, `R = 2.20`, front plate at `(0, 0, 0)`; same angles and jitter × 0.8. **K01:** anchor to screen `(0.51, 0.66)` at d 2.10: `camX = aX − 0.01 × 2 × halfW`, `camY = aY + 0.16 × 2 × halfH`. **Overview:** `(0.00, 0.72, 7.40)` → front plate centred at `y_s` 0.66 below the top copy zone. **Focus:** `(0.00, −0.34, 4.50)` (distance 4.25 to the forward plate): plate fills 50% of frame height, centred at `y_s` 0.37; **names block below the plate, `y_s` 0.66–0.92**, left-aligned at `--margin`, lines 1, 2, 4 and the "In:" links only; note, Sanskrit/Malayalam and parts list move into the inspect panel (they stay in the DOM, visually hidden with the `sr-only` pattern, not `display: none`). Turn arc: camera z `4.50 → 5.60 → 4.50`. Neighbour plates mostly off-frame. **Specimen end pose:** centre `(0.50, 0.66)`, distance 2.8. Annotations: max 3 per plate on mobile (the first three in `plates.ts` order); labels Boska italic 13 px minimum. Inspect: the dialog is a full-screen sheet: view surface top 55%, panel bottom 45% (scrollable), "Return to film" pinned at the panel's bottom with `env(safe-area-inset-bottom)`; pinch-zoom with two pointers. |
| S03 | `s03` mobile 48 frames; rhizome centre `(0.50, 0.66)`; amber field `y_s` 0.50–1.00 full width; powder 1,500 (tier 2). |
| S04 | `s04` mobile 48 frames; uruli centred `x_s` 0.50, `y_s` 0.68; hands enter from the bottom edge; `spiralOrigin` mobile placeholder `(0.50, 0.68)`. |
| S05 | `s05bg` 32 frames; packshot crops 720×1280 with the group in depth (Rujanth front centre); group centre `(0.50, 0.68)`; product names under the caption in the top zone; the three links stack. |
| S06 | Same; note at `y_s` 0.88. |

### 7.3 Tier 1 (live, low-end)
Mobile assets, particles 0, DPR 1. S02: plates 1024; the specimen is the pre-rendered `s02spec` 24-frame turntable on a camera-facing quad (yaw 0° → 45° mapped to the B02.8–B02.9 range); inspect "View specimen" scrubs it. All transitions keep their modes with `PHONE` fbm.

---

## 8. Reduced-motion and static variant

### 8.1 When
Static mode under `prefers-reduced-motion: reduce`, no WebGL 2, detect-gpu tier 0, `saveData`, or `effectiveType` 2g / slow-2g (tech-feasibility §3.7). The footer toggle "Play film" can override reduced motion only by an explicit click (CD §7.3). No Lenis, GSAP or three chunk is requested (`FilmStage` decides before `import()`).

### 8.2 What renders (server HTML, already in the track)
The track height becomes `auto`; the stage is `position: static`. Each scene is a `<section>` with a 100svh-max `<figure>` (poster) and its copy below or beside it (desktop: copy in the left 40%, poster right; phone: poster then copy). No transitions, no scroll-linked anything.

| Scene | Poster (AVIF, ≤ 140 KB d / ≤ 90 KB m) | `alt` (in `film.ts`, describes the painting only) | Copy |
|---|---|---|---|
| S01 | `s01-static-d.avif` (frame 92: hand turning the leaf) / `-m` | "Painting of a hand turning a karinochi leaf to the light in a Kerala forest." | `s01.title` (h1), `s01.titleLead`, `s01.head`, `s01.caption` |
| S02 | none for the scene; a **grid of `<figure>`s**, one per plate (plate `-1024.webp`, `loading="lazy"`), each with names, reference, note, In: links and "Inspect plate" | per plate: "Engraving of {common name}, *{binomial}*, from *Hortus Malabaricus*." | `s02.head`, `s02.caption`, plates |
| S03 | `s03-static-d.avif` (frame 36: the broken rhizome and powder) | "Painting of a ginger root breaking into powder on dark earth." | `s03.head` (if approved), `s03.caption` |
| S04 | `s04-static-d.avif` (frame 60: hands, spatula and amber spiral in the uruli) | "Painting of two hands drawing a wooden spatula through amber oil in a brass uruli." | `s04.head`, `s04.caption` |
| S05 | `s05-static-d.avif`: a still composite of `s05bg` frame 47 + `s05p` step 24 (products untouched) | "Photograph of Rujanth Liniment, Mezhu Thailam and Lakshol on dark teak." | `s05.head`, `s05.caption`, product links |
| S06 | none | — | `handoff.note` |

### 8.3 Reduced motion in the UI
All UI travel is 0; opacity changes ≤ 120 ms (CD §7.10). Text cues do not animate (text is simply present). Skip film still exists (anchor jump). Inspect works (§6.2 static path). The live posters (`s01-live-*.avif`) are not used in static mode.

### 8.4 Reduced motion while live (visitor clicked "Play film")
The film plays as specified but: no idle float, no dapple drift (`uDapple.z` speed 0), grain seed frozen, ring lobes frozen (`uTime` fixed at 0 inside T4), text cues use opacity only (no `yPercent`), camera micro-pushes in holds removed. Scroll-scrubbed motion stays because the visitor asked for it.

---

## 9. Data: `src/lib/film/timeline.ts` (pure data, server-safe)

### 9.1 Shape

```ts
export const FILM = { trackVh: { d: 1400, m: 1000 }, scrollVh: { d: 1300, m: 900 } } as const;

export const SCENES = [
  { id: "s01", start: 0.00, end: 0.14, tone: "dark",      kind: "sequence" },
  { id: "s02", start: 0.14, end: 0.46, tone: "parchment", kind: "realtime" },
  { id: "s03", start: 0.46, end: 0.60, tone: "dark",      kind: "sequence" },
  { id: "s04", start: 0.60, end: 0.74, tone: "dark",      kind: "sequence" },
  { id: "s05", start: 0.74, end: 0.92, tone: "dark",      kind: "layers"   },
  { id: "s06", start: 0.92, end: 1.00, tone: "site",      kind: "dom"      },
] as const;

export const TONE_SWITCH = [ { p: 0.1444, tone: "parchment" }, { p: 0.4464, tone: "dark" }, { p: 0.9124, tone: "site" } ] as const;

// [local, frame] pairs, piecewise linear; the composite blends floor/ceil by the fraction
export const FRAME_MAPS = {
  s01:   { d: [[0,0],[0.40,27],[0.66,55],[0.90,95],[1,95]], m: [[0,0],[0.40,17],[0.66,35],[0.90,63],[1,63]] },
  s03:   { d: [[0,0],[0.45,35],[0.90,71],[1,71]],           m: [[0,0],[0.45,23],[0.90,47],[1,47]] },
  s04:   { d: [[0,0],[0.42,35],[0.88,71],[1,71]],           m: [[0,0],[0.42,23],[0.88,47],[1,47]] },
  s05bg: { d: [[0,0],[0.38,0],[0.80,47],[1,47]],            m: [[0,0],[0.38,0],[0.80,31],[1,31]] },
  s05h:  { d: [[0.22,0],[0.38,11]], m: [[0.22,0],[0.38,11]] },
  s05p:  { d: [[0.38,0],[0.80,24]], m: [[0.38,0],[0.80,24]] },
  // without H3: s05bg [[0,0],[0.22,0],[0.80,47|31],[1,47|31]], s05p [[0.22,0],[0.80,24]]
} as const;

export type Cue = { id: string; show: number; hide: number | null; scene: string };
export const CUES: Cue[] = [
  { id: "s01.title",   show: 0,      hide: 0.0280, scene: "s01" }, // visible at first paint, no entry tween
  { id: "s01.head",    show: 0.0588, hide: 0.0896, scene: "s01" },
  { id: "s01.caption", show: 0.0980, hide: 0.1204, scene: "s01" },
  { id: "s02.head",    show: 0.1688, hide: 0.2008, scene: "s02" }, // with s02.caption
  { id: "s02.plate.0", show: 0.2194, hide: 0.2378, scene: "s02" },
  { id: "s02.plate.1", show: 0.2578, hide: 0.2762, scene: "s02" },
  { id: "s02.plate.2", show: 0.2962, hide: 0.3146, scene: "s02" },
  { id: "s02.plate.3", show: 0.3346, hide: 0.3530, scene: "s02" },
  { id: "s02.plate.4", show: 0.3730, hide: 0.4088, scene: "s02" }, // last plate stays to local 0.84
  { id: "s03.head",    show: 0.4740, hide: 0.5804, scene: "s03" }, // with s03.caption
  { id: "s04.head",    show: 0.6140, hide: 0.7176, scene: "s04" }, // with s04.caption
  { id: "s05.head",    show: 0.8120, hide: 0.8948, scene: "s05" }, // with s05.caption
  { id: "s05.productNames", show: 0.8228, hide: 0.8948, scene: "s05" },
  { id: "handoff.note", show: 0.9280, hide: null, scene: "s06" },
];
// Plate cues are generated from N: segStart = 0.14 + 0.32*(0.20 + k*0.60/N); show = segStart + 0.40*segLen; hide = segStart + 0.88*segLen
// (last plate: hide = 0.14 + 0.32*0.84). The literals above are the N = 5 result and are asserted in a unit test.

export const SKIP_VISIBLE = [0.02, 0.92] as const;

export const S02 = {
  fov: { d: 28, m: 34 },
  ring: { d: { centre: [-0.40, 0, -2.60], radius: 2.60 }, m: { centre: [0, 0, -2.20], radius: 2.20 } },
  plateHeight: 1.30, curl: 0.035, forward: 0.25,
  jitterR: [0, 0.12, -0.10, 0.08, -0.06], offsetY: [0, 0.10, -0.08, 0.06, -0.05],
  dim: { darken: 0.12, desat: 0.30, fade: 0.45, overview: 0.5 },
  poses: {
    d: { overview: [-1.20, 0.15, 6.00], focus: [0, 0.04, 3.45], focusHoldEnd: [0, 0.04, 3.38], turnPeak: [0, 0.06, 4.60], anchorScreen: [0.69, 0.51], anchorDist: 1.90, specimenScreen: [0.66, 0.55], specimenDist: 2.40, inspect: { dx: 0.55, dz: 2.70 } },
    m: { overview: [0, 0.72, 7.40],   focus: [0, -0.34, 4.50], focusHoldEnd: [0, -0.34, 4.42], turnPeak: [0, -0.30, 5.60], anchorScreen: [0.51, 0.66], anchorDist: 2.10, specimenScreen: [0.50, 0.66], specimenDist: 2.80, inspect: { dx: 0, dz: 3.20 } },
  },
  keys: [ /* K00..K37 from §4.2 as { local, cam: [x,y,z] | "anchor" | "specimen", ringRot, ease, plates: {...}, specimen: {...} } */ ],
} as const;

export const S04 = { spiralOrigin: { d: [0.69, 0.58], m: [0.50, 0.68] } } as const; // MEASURE on frame 71
export const S05 = { zoom: [[0.08, 1.0], [0.88, 1.03]], groupCentre: { d: [0.68, 0.60], m: [0.50, 0.68] }, hasH3: false } as const;

export const GRADE = { s01: [0, 1, 1], s03: [0, 1, 1], s04: [0, 1, 1], s05: [0, 1, 1] } as const; // lift, gamma, gain trims (CD §2.9 step 5)
export const GRAIN = { dark: 0.028, parchment: 0.018 } as const;
```

### 9.2 Asset request schedule (by `p`, on top of tech-feasibility §3.6)
| When | Request |
|---|---|
| First paint | `s01-live-{d,m}.avif` (preload, `fetchPriority="high"`), fonts |
| Idle after LCP / stage visible | film chunk; `s01` strides 16 → 8; paper normal map; `soft-rect-64.png` |
| p ≥ 0 (film live) | rest of `s01`; plates 1–3 at 1024 |
| p ≥ 0.06 | plates 4–5 at 1024, then all plates at 2048 (desktop) |
| p ≥ 0.14 (enter S02) | `s03` full at high priority; `s04` stride 16 at low |
| p ≥ 0.268 | ginger GLB (or `s02spec` on tier 1) |
| p ≥ 0.46 (enter S03) | `s04` full; `s05bg` stride 16; `s05rim`, `s05h` |
| p ≥ 0.60 (enter S04) | `s05bg` full; `s05p` |
| Evict | scene N−2 blobs when over 60 MB (d) / 30 MB (m) |

### 9.3 `src/lib/film/color.ts`
`oklchToLinear(L, C, h): [r, g, b]` using the OKLab → LMS → linear sRGB matrices (Björn Ottosson's published OKLab definition), no clamping beyond `[0, 1]`. Every shader colour uniform and every three.js light colour in this file is produced by it from the CSS token values (`--film-*`) or the literals above. A unit test checks `--film-parchment` round-trips to within 0.002.

---

## 10. Acceptance checks for the film work packages

- [ ] Each beat's start and end state matches its card at the listed `p` (screenshots at `p` = every beat boundary, desktop 1440×900 and mobile 390×844, stored in `docs/research/film-qa/`).
- [ ] `timeline.ts` contains every number in §9; no film number appears inline in a component (`grep -nE "0\.(1232|1656|4216)" src/components` returns nothing).
- [ ] Unit tests: transition windows derived from `SCENES` equal §5.7; plate cues derived from `N` equal §9.1; `oklchToLinear` round-trip.
- [ ] Composite exactness at `uT` 0 and 1 for all 5 modes (§5.1).
- [ ] T1: leaf anchor error ≤ 3% of frame width; T2: frame-0 silhouette IoU ≥ 0.85; T3: amber hue difference ≤ 6°; T4: ring origin within 0.5% of the spiral centre.
- [ ] S02: K09/K14/K19/K24/K29 checks from §4.5 pass; annotations stay locked to their structures within 1% of plate width while the camera micro-pushes.
- [ ] Text cues show and hide at the listed `p` in both scroll directions; no cue text overlaps another.
- [ ] HTML text contrast over every scene ≥ 4.5:1 captions, ≥ 3:1 headlines (95th-percentile pixel method, CD §2.3).
- [ ] No luminance flash > 0.1 L more than 3 times per second when scrolling at 400vh/s through every transition (record with the Performance panel screenshots and an 8×8 luma probe).
- [ ] Skip film: visible 0.02–0.92; lands on `#site h2` with focus; no transition visible during the jump; works without JS.
- [ ] Inspect: opens from button and plate click, traps focus, Esc and "Return to film" close it, focus returns, scroll position unchanged (`scrollY` equal before and after).
- [ ] Mobile 390×844 and 360×800: copy in the top zone, plate names below the plate, no horizontal scroll, Skip film above the safe area.
- [ ] Static mode: no request for the three, GSAP or Lenis chunks (Network panel); all copy and plate figures present; axe 0 serious/critical.
- [ ] 60 fps p95 on desktop (2020 MacBook Air class, 1440×900, DPR 1.5) through S02 and every transition; ≥ 30 fps on a mid Android.
- [ ] `npx tsc --noEmit` and `npm run lint` pass; `http://localhost:3000` renders.

---

## 11. Changes and reconciliations relative to other documents

| # | Item | This file | Instead of |
|---|---|---|---|
| R1 | Track | 1400vh / 1000vh (CD C11) with scene shares from tech-feasibility §3.2 | tech-feasibility 1100 / 900; pear-teardown 4400 |
| R2 | Transition windows | 12% out + 8% in (CD §2.8), §0.3 | tech-feasibility `DISSOLVE = 0.025` |
| R3 | Lenis | lerp 0.085 (CD C10) | tech-feasibility 0.1 |
| R4 | Grain | 0.028 dark / 0.018 S02 (CD C9) | tech-feasibility 0.05 / 0.035 |
| R5 | S05 order | Hand H3 before the orbit | CD §1.3 sentence order (content unchanged) |
| R6 | S05 lens | 85 mm fixed + 3% runtime push | CD §2.6 85 → 135 mm (a turntable packshot cannot change focal length per step) |
| R7 | S05 droplets | none | brief "golden droplets" (CD §2.11 bans gold dust) |
| R8 | Annotations | DOM SVG, Boska italic labels; IM FELL only in the baked plate reference strip | CD §2.7 table row "annotations baked in plate art" (kept for the baked strip; every word stays HTML, CD §7.1) |
| R9 | Burn char band | width 0.031 front units | CD §2.8 "0.31 wide" (see §5.3) |
| R10 | Skip film | cover + instant jump | tech-feasibility `scrollTo` with `duration: 1.2` (would strobe through transitions) |
| R11 | Chrome tokens | `--film-ink` / `--film-sepia` + theme `--ink` for `site` tone | tech-feasibility `--film-chrome-ink-*` (CD §3.1 already drops them) |

## 12. Missing inputs and MEASURE items introduced or used here

| # | Item | Blocks | Owner |
|---|---|---|---|
| M1 | Plate aspects (W/H) of all retouched plates | Plate geometry, §4 framing | Asset WP |
| M2 | `leafAnchor` on plate 1 (Vitex) | T1 match, K01 | Asset WP |
| M3 | `specimenRegion` and `specimenPose` on plate 5 (ginger) | B02.8, K31–K33, S03 frame 0 | Asset WP |
| M4 | Annotation list per plate (Latin part names + leader paths), only structures actually drawn on the engraving | B02.3–B02.7 | Asset WP, checked against the plate |
| M5 | `S04.spiralOrigin` on frame 71 (d, m) | T4 | Imagery WP |
| M6 | S01 frame 95 mid-vein position (d, m) | T1 | Imagery WP |
| M7 | CD N1 (hand references and release) | B01.4, B04.3 | AVVVS |
| M8 | CD N2 incl. H3 and the turntable spec in §3 S05 | S05; without H3 use the no-H3 frame maps | AVVVS |
| M9 | CD N3 (pipeline A licence) or pipeline B | all painted frames | AVVVS |
| M10 | CD N5, N6 (tab numbers, Malayalam script) | Plate names lines 3–4 | AVVVS |
| M11 | CD N9 (`s03.head` "choornam" approval) | S03 headline | AVVVS |
| M12 | CD N13 paper rustle (optional) | S02 one-shot | — |
| M13 | Approval of the §6.4 UI strings | Inspect controls | AVVVS |
| M14 | Reference scroll speed 150vh/s (pacing only, UNVERIFIED) | none (review aid) | QA |
