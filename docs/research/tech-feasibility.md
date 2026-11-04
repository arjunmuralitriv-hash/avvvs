# Tech feasibility and architecture: the AVVVS cinematic film

Status: research (2026-11-04). Input to the v2 plan. Written to be run as is by Claude Sonnet 5.5 at medium effort, one work package (WP) at a time.
Sources read: `docs/brief/creative-brief.md` (it wins every conflict), `PLAN.md` (v1: only its store, booking, SEO, performance and facts sections still apply), `src/**`, `node_modules/next/dist/docs/01-app/**` (view-transitions, lazy-loading, caching, image, script, keeping-pages-static), the npm registry, the Lenis README, the GSAP standard licence page, and the gltf-transform CLI docs.

---

## 0. Decisions in one table

| # | Decision | Why (short) |
|---|---|---|
| D1 | **Hybrid rendering, composited in one WebGL canvas.** Pre-rendered painterly image sequences for S01, S03, S04 and the S05 hero move. Real-time three.js for the S02 manuscript carousel and specimen, the particle accents in S01 and S03, and the optional S05 product orbit. S06 is plain server-rendered Next.js. | Liquid, forest and volumetric mist cannot reach 30 fps on a mid Android in real time. pear.no's look is painted frames joined by WebGL shader transitions, and image sequences are exactly that. Putting both kinds into one canvas lets one shader dissolve any scene into the next. |
| D2 | **One persistent `<Canvas>`** in a CSS `position: sticky` stage. No per-scene canvases. | A WebGL context costs about 30–60 ms to create and its GPU memory is not shared between contexts. iOS Safari caps live contexts (roughly 8–16), and a cross-scene dissolve needs both scenes in the same context. |
| D3 | **GSAP 3.15.1 + ScrollTrigger drives the film; drei `ScrollControls` is not used.** | ScrollControls adds its own scroll container inside the canvas. That breaks native page scroll, Lenis, server-rendered text sitting on the film, the "Skip film" anchor, and the site below. ScrollTrigger reads real document scroll. |
| D4 | **A shared mutable progress store** (`src/lib/film/store.ts`) that ScrollTrigger writes and `useFrame` reads. React re-renders only when the scene index changes. | No React render on any per-frame update. This keeps the pattern of the existing `src/lib/story-progress.ts`, which already works this way. |
| D5 | **Lenis 1.3.27 driven by `gsap.ticker`**, with `lenis.on('scroll', ScrollTrigger.update)` and `lagSmoothing(0)`. Off under reduced motion and on touch (`syncTouch: false`). | This is the README's documented sync. It gives one rAF loop for Lenis, GSAP and (indirectly) R3F. |
| D6 | **Image sequences are WebP frames, decoded on demand with `createImageBitmap` into a ±N-frame LRU window**, then uploaded to one `THREE.Texture` per sequence. No `<video>` scrubbing. | `video.currentTime` scrubbing is unreliable on iOS Safari (async seeks, stale frames, needs all-intra encodes that are larger than WebP sets). Decoding everything at once would need about 400 MB of RAM (see §4.3). |
| D7 | **WebGLRenderer (WebGL 2), not WebGPURenderer.** | three r187 ships `three.webgpu.js` with a WebGL 2 fallback, but drei helpers, our GLSL `ShaderMaterial`s and `KTX2Loader` paths are WebGL-first, and Safari WebGPU is too new to make our baseline. Revisit after launch. |
| D8 | **No `@react-three/postprocessing` in the film.** Grain, vignette, the grade and the transition mask all run in one custom full-screen composite shader. | An `EffectComposer` chain costs 2–4 extra full-screen passes, which mobile cannot afford. One pass does the same job. Bloom and DOF are baked into the pre-rendered frames. |
| D9 | **Assets:** GLB through gltf-transform 4.5.1 (`simplify` + `meshopt`, KTX2 textures). Frames are WebP q≈72. Posters are AVIF. | Meshopt decodes faster than Draco and gzips well. KTX2 stays compressed in GPU memory, which mobile needs. WebP decodes about 2–3× faster than AVIF, and decode time matters for scrubbing. |
| D10 | **Quality from `detect-gpu` 5.0.70** (with self-hosted benchmarks) plus drei `PerformanceMonitor`, plus Save-Data, plus `prefers-reduced-motion`. Tier 0, reduced motion or Save-Data get the **static film** (server-rendered stills and text, no canvas). | The visitor can always navigate and buy, and the 3D never gates content. |
| D11 | **Theme:** light by default; `data-theme` is set on `<html>` by an inline script reading `localStorage`, with **no cookies**. The film keeps its own grade in both themes. Only the UI chrome changes with the theme. | Reading cookies makes the route dynamic under Cache Components (`02-guides/keeping-pages-static.md`). The film's colour progression is fixed art direction. |
| D12 | **Every word of the film is HTML**, server-rendered in the track. The canvas is `aria-hidden` and decorative. The LCP element is the S01 poster (AVIF, `preload`) or the H1. | SEO and accessibility. CLAUDE.md says "3D must never contain content that isn't also in the HTML". |

---

## 1. Versions (checked with `npm view`, 2026-11-04)

| Package | Latest | Installed | Licence | Action |
|---|---|---|---|---|
| gsap | **3.15.1** | (none) | GSAP Standard "no charge" licence | **install** |
| @gsap/react | **2.1.2** | (none) | same licence | **install** |
| lenis | 1.3.27 | 1.3.27 | MIT | keep |
| three | 0.187.0 | 0.187.0 | MIT | keep |
| @types/three | 0.187.0 | 0.187.0 | MIT | keep |
| @react-three/fiber | 9.8.2 | 9.8.2 | MIT | keep |
| @react-three/drei | 10.7.9 | 10.7.9 | MIT | keep |
| @react-three/postprocessing / postprocessing | 3.2.2 / 6.39.6 | installed | MIT / Zlib | **uninstall** (D8; nothing in `src` imports it) |
| detect-gpu | 5.0.70 | 5.0.70 | MIT | keep, self-host its benchmarks |
| motion | 14.9.0 | 14.9.0 | MIT | keep, for UI and the store only |
| animejs | 4.5.0 | installed | MIT | keep only for small UI timelines (CLAUDE.md); never inside the film |
| @gltf-transform/cli | 4.5.1 | (none) | MIT | dev tool, run through `npx` (do not add as a dependency) |
| zustand | 5.0.16 | (none) | MIT | **not needed**: a plain module store is enough (D4) |

**GSAP licence (confirmed on gsap.com/standard-license):** all of GSAP, including the plugins that used to be members-only (SplitText, MorphSVG, DrawSVG, ScrollTrigger), is free for commercial use. The restriction is that you may not build a visual, no-code animation builder that competes with Webflow, and you may not remove GSAP's notices. A brand website is fine.

**Install (WP-F0):**
```bash
npm i gsap@3.15.1 @gsap/react@2.1.2
npm rm @react-three/postprocessing postprocessing
# dev tools, not dependencies:
npx @gltf-transform/cli@4.5.1 --version
```

**KTX-Software on Windows (for KTX2 textures):** gltf-transform's `etc1s` / `uastc` commands shell out to KTX-Software's `ktx` CLI, which must be on `PATH`. The latest stable release is **v4.4.2**. The unified `ktx` tool (`ktx create`, `ktx encode`) is included, and the release notes say legacy `toktx` goes away in 4.5. `where ktx toktx basisu` finds nothing on this machine today. Steps:
1. Download the Windows x64 installer from https://github.com/KhronosGroup/KTX-Software/releases/tag/v4.4.2. The asset list was truncated when fetched, so check the exact filename (UNVERIFIED; historically `KTX-Software-<ver>-Windows-x64.exe`).
2. Tick "add to PATH" during install, then run `ktx --version`.
3. **Fallback if that fails:** `gltf-transform webp` (it uses sharp, which is already a Next dependency, so nothing extra to install). This costs more GPU memory but needs no external tool. It is acceptable for S02 plates at 1024² on mobile.

`basisu` is not needed. The three r187 transcoder ships in `node_modules/three/examples/jsm/libs/basis/` (`basis_transcoder.js` + `.wasm`). The draco decoder is in `libs/draco/` and the meshopt decoder in `libs/meshopt_decoder.module.js`. Copy them to `public/decoders/` in a `postinstall` script so they are same-origin and cacheable.

---

## 2. Rendering approach per scene (D1, with budgets)

Common definitions:
- "Desktop" means detect-gpu tier 3 with no `isMobile`. "Mobile" means tier 2 with `isMobile`, or any viewport under 768 px. Tier 1 uses the mobile assets, with real-time extras turned off.
- Frame sizes: desktop **1600×900** (16:9) and mobile **720×1280** (9:16, rendered from a second Blender camera, not cropped).
- Encoding: WebP, quality 72, `-m 6`. Average size target: desktop ≤ 70 KB per frame, mobile ≤ 45 KB.
- Each scene also has a **poster** AVIF: its first frame at 1920×1080 and 828×1472, ≤ 140 KB and ≤ 90 KB, used for the static film and before load.

| Scene | Technique | Frames desktop / mobile | Bytes desktop / mobile | Real-time parts | Draw calls (max) | Tris (max) |
|---|---|---|---|---|---|---|
| **S01 Into the origins** | Pre-rendered sequence (Blender, painterly grade, DOF, volumetrics, the mist all baked in) | 96 / 64 | 6.7 MB / 2.9 MB | Dust and pollen `Points`: 1,500 / 600 particles, 1 draw call. Sun-shaft parallax lives in the composite shader. | 4 | ≈ 0 |
| **S02 Botanical archives** | **Real-time.** Parchment plates on a ring, the leaf-to-ink transition, and the specimen GLB. Annotations are **DOM SVG** over the canvas. | n/a | ≤ 3.6 MB / ≤ 1.6 MB | Up to 7 plates (only verified ingredients; see §9), a parchment backdrop and 1 specimen GLB | 30 / 20 | 120k / 40k |
| **S03 Illustration to extraction** | Pre-rendered sequence (roots to powder to amber liquid) | 72 / 48 | 5.0 MB / 2.2 MB | Powder `Points`: 4,000 / 1,500 particles, curl-noise in the vertex shader, 1 draw call | 4 | ≈ 0 |
| **S04 Alchemy of nature** | Pre-rendered sequence (Blender fluid sim, glass, caustics) | 72 / 48 | 5.0 MB / 2.2 MB | none | 2 | ≈ 0 |
| **S05 The AVVVS reveal** | Pre-rendered sequence (spiral to silhouette to product), then an optional real-time orbit of a **real product** GLB | 48 / 32 | 3.4 MB / 1.4 MB, plus a GLB ≤ 2.0 MB / ≤ 1.0 MB | Product GLB with an HDRI env (256² cube, KTX2) and droplet `Points` (300 / 120) | 12 | 80k / 30k |
| **S06 Beyond the film** | Plain server-rendered Next.js | n/a | not part of the film budget | none | n/a | n/a |
| **Total film** | | 288 / 192 frames | **≈ 23.7 MB / ≈ 11.3 MB** in total, streamed scene by scene; ≤ 8 MB / ≤ 4 MB in flight at any time | | **≤ 60 / ≤ 35** at any instant | **≤ 200k / ≤ 70k** |

Why these counts: about 3 frames per 1% of film scroll on desktop and 2 on mobile is the point below which a scrubbed sequence starts to look stuttery. Below that, the composite shader **blends frame `n` and `n+1` by the fractional part** (a temporal crossfade), which hides the steps. So mobile can use about 33% fewer frames.

**If the byte total is too much** (the risk in R2), in this order:
1. S04 goes down to 48 / 32 frames, with a longer crossfade.
2. Mobile drops to 600×1066.
3. S01 desktop goes down to 72 frames.

Do not cut S02. It is real-time and cheap.

**Texture budgets (GPU memory):** desktop ≤ 256 MB, mobile ≤ 128 MB.
- S02 plates: KTX2 ETC1S, 2048² desktop and 1024² mobile, one texture per plate (the illustration with the paper baked in). A normal-and-roughness map for the paper is shared at 1024² / 512².
- Specimen GLB: KTX2 base colour at 2048² / 1024², normal map in UASTC at 1024² / 512².
- Sequence textures: one `THREE.Texture` per active sequence (1600×900 RGBA ≈ 5.8 MB; two at most during a dissolve).
- Render targets: two RGBA8 RTs at canvas size × DPR, for scene A and scene B during a dissolve.

**DPR caps:** tier 3: `[1, 1.75]`; tier 2: `[1, 1.5]`; tier 1: `1`. Sequences are drawn at their native size and scaled by the composite pass, so a higher DPR only sharpens S02 and S05.

**Frame rate targets:** desktop holds 60 fps (p95 frame time ≤ 16.7 ms). A mid Android (Snapdragon 7-series, Adreno 6xx/7xx) holds ≥ 30 fps and aims for 60. If `PerformanceMonitor` reports a decline, DPR drops by 0.25 steps down to 1. After 3 flip-flops it falls back to tier 1 settings (particles off, mobile plate textures).

---

## 3. Architecture

### 3.1 Files (new and changed)

```
src/lib/film/
  timeline.ts        // scene ranges, scroll length, per-scene constants (pure data, server-safe)
  store.ts           // mutable progress store (D4), no React
  quality.ts         // detect-gpu + saveData + reduced-motion -> Quality
  assets.ts          // AssetManager: priority queue, prefetch, LRU bitmap cache
  manifest.ts        // generated: frame URLs and byte sizes per scene and per device class
src/components/film/
  Film.tsx           // SERVER component: track + server-rendered scene text + posters + skip link
  FilmStage.tsx      // "use client": decides static vs live; next/dynamic(FilmCanvas, {ssr:false})
  FilmScroll.tsx     // "use client": Lenis + gsap.ticker + the master ScrollTrigger -> store
  FilmOverlay.tsx    // "use client": SplitText headline and annotation timelines (useGSAP)
  SkipFilm.tsx       // "use client": the skip control (a plain <a href="#site"> without JS)
  StaticFilm.tsx     // server: posters + text, used for reduced motion / no WebGL / tier 0
src/components/three/film/
  FilmCanvas.tsx     // the single <Canvas>, PerformanceMonitor, scene switcher, composite pass
  Composite.tsx      // full-screen quad: grade, grain, vignette, dissolve(A,B)
  Sequence.tsx       // image-sequence texture driver (for S01/S03/S04/S05)
  Archives.tsx       // S02 ring of plates + leaf-to-ink + specimen
  Particles.tsx      // shared GPU points (S01 dust, S03 powder, S05 droplets)
  ProductOrbit.tsx   // S05 optional, only when a real product GLB exists
  shaders/*.glsl.ts  // GLSL as template strings
scripts/
  build-frames.mjs   // PNG renders -> WebP frames + manifest.ts (sharp)
  build-glb.mjs      // gltf-transform pipeline
  copy-decoders.mjs  // postinstall: basis/draco/meshopt -> public/decoders/
public/film/{s01,s03,s04,s05}/{d,m}/0000.webp ...
public/film/posters/{s01..s05}-{d,m}.avif
public/film/glb/*.glb, public/film/ktx2/*.ktx2
public/detect-gpu/benchmarks/*.json
```

### 3.2 Timeline (the single source of scroll truth)

`src/lib/film/timeline.ts`:
```ts
export const FILM_VH = { desktop: 1100, mobile: 900 } as const; // track height in vh (the stage is 100vh of it)
export const SCENES = [
  { id: "s01", start: 0.00, end: 0.14, kind: "sequence", tone: "dark"  },
  { id: "s02", start: 0.14, end: 0.46, kind: "realtime", tone: "light" }, // signature: longest
  { id: "s03", start: 0.46, end: 0.60, kind: "sequence", tone: "dark"  },
  { id: "s04", start: 0.60, end: 0.74, kind: "sequence", tone: "dark"  },
  { id: "s05", start: 0.74, end: 0.92, kind: "sequence", tone: "dark"  },
  { id: "handoff", start: 0.92, end: 1.00, kind: "dom", tone: "light" },
] as const;
export const DISSOLVE = 0.025; // each boundary dissolves over ±0.0125 of total progress
```
On desktop, 1% of progress is about 10 vh of scroll, so S02 gets about 350 vh. The creative WP fills in the in-scene keyframes (camera poses, plate angles) as data in this file, never inline in components.

### 3.3 The progress store (D4)

`src/lib/film/store.ts`: extend the current `story-progress.ts` pattern.
```ts
type FilmState = {
  target: number;          // 0..1 written by ScrollTrigger.onUpdate
  progress: number;        // damped in useFrame: progress = damp(progress, target, 6, dt)
  scene: number;           // index into SCENES (from progress)
  local: number;           // 0..1 inside the scene
  mix: number;             // 0..1 dissolve weight to the next scene, 0 outside the DISSOLVE band
  velocity: number;        // ScrollTrigger getVelocity()/1000, clamped ±3, for motion blur and grain
  paused: boolean;         // S02 inspect mode or the tab is hidden
};
export const film = { get, setTarget, setDerived, subscribeScene, subscribePaused };
```
Rules:
- `setTarget` is the only thing ScrollTrigger calls. It also calls R3F `invalidate()` when the frameloop is `"demand"`.
- `subscribeScene` fires only when `scene` changes. React uses it (through `useSyncExternalStore`) to mount and unmount scene components and to set `data-film-tone`.
- `useFrame` never calls `setState`.

### 3.4 How ScrollTrigger drives R3F

`FilmScroll.tsx` (client, mounted by `FilmStage` only in live mode):
```ts
gsap.registerPlugin(ScrollTrigger, useGSAP); // once, module scope
useGSAP(() => {
  const lenis = reduced || isTouch ? null : new Lenis({ lerp: 0.1, syncTouch: false, autoRaf: false });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
  }
  ScrollTrigger.create({
    trigger: trackRef.current, start: "top top", end: "bottom bottom",
    scrub: true,             // Lenis already smooths; scrub:true avoids double easing
    onUpdate: (st) => film.setTarget(st.progress, st.getVelocity()),
  });
  return () => { /* gsap.ticker.remove(tick); lenis?.destroy(); */ }; // useGSAP reverts triggers
}, { scope: trackRef });
```
- **No `pin`.** The stage is `position: sticky; top: 0; height: 100svh` inside a track of `FILM_VH` vh. Sticky needs no pin-spacer DOM changes. Server-rendered layout matches the client, so there is no CLS. It also works without JS.
- The R3F `<Canvas frameloop="demand">` switches to `"always"` while the stage intersects the viewport and a particle or orbit scene is active. It switches to `"never"` when an `IntersectionObserver` reports the stage offscreen or `document.hidden` (use `useThree().setFrameloop`).
- Damping happens in `useFrame`: `progress = THREE.MathUtils.damp(progress, target, 6, delta)`. Scenes read `film.get()` every frame.
- `FilmOverlay` text timelines use their own `ScrollTrigger`s with `scrub: true` on the server-rendered `<section data-scene>` elements inside the track, so text and canvas share one scroll position.
- `ScrollTrigger.refresh()` runs after fonts load (`document.fonts.ready`) and after `FilmCanvas` mounts.
- Replace `src/components/site/SmoothScroll.tsx` with a site-wide `SmoothScroll` that uses the same gsap.ticker pattern, so only **one Lenis instance** exists. `FilmScroll` reads it from a module singleton (`src/lib/film/lenis.ts`) instead of creating its own.

### 3.5 The persistent canvas and scene switching

- `FilmCanvas` mounts `Composite` once. Each scene component renders **into a render target** (`useFBO` from drei, at canvas size × DPR) only while `scene === i`, or while `mix > 0` and it is the next scene.
- `Composite` samples `tA` and `tB` and computes:
  ```glsl
  float m = smoothstep(mix - 0.08, mix + 0.08, paperNoise(uv * 3.0) * 0.6 + uv.y * 0.4);
  vec3 c = mix(texture(tA, uv).rgb, texture(tB, uv).rgb, m);
  c = grade(c, uSceneGrade);          // per-scene lift/gamma/gain in linear space
  c += (hash(uv * uRes + uTime) - 0.5) * uGrain;   // grain 0.035 light, 0.05 dark scenes
  c *= vignette(uv, 0.35);
  ```
  This is the pear.no technique: a noise-thresholded "paper burn" dissolve between painted frames. `paperNoise` comes from a 512² tiling grain texture (KTX2), not runtime fbm, which keeps mobile cost down.
- Sequence scenes are cheap: `Sequence.tsx` draws a full-screen quad textured with the current frame. `texture.image = bitmap; texture.needsUpdate = true` runs only when the frame index changes. A second texture holds frame `n+1` for the fractional crossfade.
- At most **two scenes are live** at any moment. The other scenes' components are unmounted, and the GPU resources of scenes more than one step away are disposed (`useGLTF.clear`, `texture.dispose()`).

### 3.6 Asset preloading (`src/lib/film/assets.ts`)

- A **priority queue** with concurrency 4 on desktop and 2 on mobile (or 1 when `navigator.connection.effectiveType` is `3g`). Requests use `fetch(url, { priority })` with `priority: "high" | "low"`, and blobs are kept in a `Map<url, Blob>`.
- **Progressive temporal refinement per sequence:** frames are queued in strides 16 → 8 → 4 → 2 → 1. The first pass of S01 (6 frames desktop, 4 mobile, ≈ 0.4 MB) makes scrubbing possible straight away at low temporal resolution. The nearest loaded frame is shown until finer frames arrive.
- Schedule:
  - **P0** (the stage enters the viewport, or idle after LCP): S01 stride 16 and stride 8, plus the paper-grain texture.
  - **P1:** the rest of S01, plus S02 plates for verified ingredients 1–3.
  - **On entering scene N:** queue scene N+1 in full at `high`, and N+2's stride-16 pass at `low`.
  - Scene N-2's blobs are evicted when total blob memory is over 60 MB desktop or 30 MB mobile.
- **Decode window:** `createImageBitmap(blob)` for frames `[i-4, i+8]` while scrolling forward (mirrored when scrolling back), in an LRU of 16 bitmaps on desktop (≈ 92 MB) and 12 on mobile (≈ 44 MB). Call `bitmap.close()` on eviction. Use `createImageBitmap(blob, { imageOrientation: "flipY" })`, or set `texture.flipY = false` and flip the UV, to match WebGL orientation.
- GLB and KTX2 use drei `useGLTF.preload(url, "/decoders/draco/", true)` and `useKTX2.preload(url, "/decoders/basis/")` at the same moments as the scene's frames.
- The S02 specimen GLB is **not** requested until S02 local progress is ≥ 0.4. The S05 product GLB is not requested until S04 begins.
- Read `manifest.ts` (generated) for byte sizes. Show a small server-rendered progress hairline only if the film is waiting longer than 300 ms for a frame the visitor is scrubbing.

### 3.7 Quality tiers (`src/lib/film/quality.ts`)

```ts
export type Quality = { mode: "static" | "live"; tier: 1 | 2 | 3; device: "d" | "m";
  dpr: [number, number]; particles: number; plateTex: 1024 | 2048; specimen: boolean; orbit: boolean };
```
Rules, in order:
1. `prefers-reduced-motion: reduce`, or no WebGL 2 context, or `navigator.connection?.saveData`, or `effectiveType` is `2g` / `slow-2g` → `static`.
2. `getGPUTier({ benchmarksURL: "/detect-gpu/benchmarks" })` returns tier 0 → `static`.
3. tier 1 → live, device `m`, particles 0, plates 1024, specimen off (the plate dissolves into a pre-rendered 24-frame turntable sequence instead), orbit off.
4. tier 2 → live, device from `isMobile` or viewport, particles at the mobile counts, plates 1024, specimen on (the mobile GLB), orbit on only if `!isMobile`.
5. tier 3 → everything at the desktop values.

Download detect-gpu's `benchmarks.tar.gz` (from the pmndrs/detect-gpu repo) into `public/detect-gpu/benchmarks/`, so no request goes to unpkg (privacy and reliability).

### 3.8 Reduced motion, no WebGL, and static mode

- `Film.tsx` (server) always renders the track with every scene's text and an `<Image>` poster per scene, so the static film *is* the server HTML.
- In static mode, CSS turns the sticky stage off (`[data-film="static"] .film__stage { position: static }`) and the track height becomes `auto`. Each scene then becomes a normal section: poster + headline + caption.
- S02 in static mode shows the plates as a responsive grid of `<figure>`s (plate image + common name + *scientific name* + verified traditional use).
- No Lenis, no GSAP and no canvas are loaded in static mode. `FilmStage` decides before calling `import()`, so neither the three nor the GSAP chunk is ever fetched.
- A user toggle in the footer ("Play film" / "Show still images") is stored in `localStorage` (`avvvs-film`). It overrides rule 1 only when the visitor chooses to *play*; reduced motion still forces static by default.

### 3.9 "Skip film"

- `SkipFilm` is a fixed button (bottom-right, 44×44 px minimum hit area) and also the **first focusable element inside the track** (`<a href="#site" class="film__skip">Skip film</a>`). It works without JS as an in-page anchor.
- With JS it calls `lenis.scrollTo("#site", { duration: 1.2 })`, or `{ immediate: true }` under reduced motion. It also sets `film.paused`, sets the frameloop to `"never"`, and moves focus to `#site h2`.
- It is visible from progress 0.02 until 0.92 and hidden after the hand-off. The main nav stays reachable at all times (brief: "never block navigation or purchasing").
- Pressing Esc while the stage has focus does the same thing.

### 3.10 Light and dark mode with the film (D11)

- `<html data-theme="light|dark">` is set before paint by an inline `<script>` in the root layout `<head>`: `localStorage['avvvs-theme']`, else `light` (the client wants light as the default, so the OS preference is *not* followed until the user toggles). Add `suppressHydrationWarning` on `<html>`. Do not read cookies: that would make every route dynamic under `cacheComponents: true`.
- `viewport` export: `colorScheme: "light dark"` and a `themeColor` array with media queries. The colours are OKLCH values from the new tokens; the design WP owns them.
- **The film ignores the theme.** Its grades are constants per scene in `timeline.ts`.
- The UI chrome sitting over the film (nav, skip, sound, progress hairline) reads `data-film-tone` (`dark` | `light`), which `FilmScroll` writes on `<html>` when the scene changes:
  - `dark` tone: chrome ink `oklch(96% 0.01 90)` on a transparent nav.
  - `light` tone: chrome ink `oklch(22% 0.02 60)`.
  - These two values belong in `globals.css` as `--film-chrome-ink-dark` and `--film-chrome-ink-light`. Components never hard-code them.
- Below the film (S06 onward), the normal theme tokens apply. The hand-off (0.92–1.0) cross-fades the stage to `var(--color-paper)` of the *current theme*: the composite shader takes `uHandoffColor` from `getComputedStyle(document.documentElement).getPropertyValue('--color-paper')`, converted once per theme change.

### 3.11 SEO and LCP (D12)

- The home route stays **fully static** (no runtime APIs, no cookies). `Film.tsx` is a Server Component.
- Scene headlines and captions are real `<h1>` / `<h2>` / `<p>` elements in DOM order. The S01 headline is the page `<h1>`, but only once the copy WP supplies approved text; the brief's suggested line is not yet approved copy.
- LCP is the S01 poster `<Image preload fetchPriority="high" sizes="100vw">` (Next 16: `preload` replaces the deprecated `priority`), ≤ 90 KB mobile. The headline text sits on top.
- The film JS loads after `requestIdleCallback` (timeout 1500 ms), and only when the stage is within 1 viewport of being visible.
- Budget against PLAN.md §6.1: initial JS ≤ 170 KB gz excludes the film. The **film chunk** (three + R3F + drei parts + GSAP + ScrollTrigger + SplitText + Lenis + scenes) must be ≤ **380 KB gz**. That is the v1 350 KB plus about 30 KB for GSAP and ScrollTrigger, *if* postprocessing is removed. Check with `npm run analyze`.
- CLS ≤ 0.05: posters and the stage have fixed aspect boxes, and the canvas fades in on top of the poster with opacity only (`story:live`-style event `film:live`).
- JSON-LD stays as is (`clinicSchema`, `organizationSchema`). Add `VideoObject` **only** if a rendered MP4 trailer exists (it doesn't; do not add it).

### 3.12 Audio (brief S01 "ambient forest sounds")

Browsers block autoplay with sound, so audio is **off by default** behind a "Sound" toggle in the chrome. On first enable, load a single loop (`/film/audio/forest.m4a`, AAC 96 kbps, ≤ 450 KB, 30 s seamless). Gain follows `1 - smoothstep(0.10, 0.16, progress)`, so it fades out by S02. Use the Web Audio API `GainNode` and never a `<audio autoplay>`. The audio source is a **missing input** (it needs a licensed recording).

---

## 4. Research notes behind the decisions

### 4.1 GSAP + React 19 + Next 16
- Use `useGSAP(fn, { scope, dependencies })` from `@gsap/react` 2.1.2. It wraps `gsap.context()` and reverts every tween and ScrollTrigger on unmount, which covers the brief's "proper React cleanup" requirement. Call `gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin)` once at module scope in a `"use client"` file.
- Only import GSAP inside client components that are loaded by `FilmStage` after the static/live decision. Never import it in a server component or the root layout (bundle budget).
- `SplitText` is used for headline reveals: lines, `mask: "lines"`, y 100% → 0, opacity 0 → 1, stagger 0.08. Run `split.revert()` on cleanup.
- `DrawSVGPlugin` handles the S02 annotation leader lines (`drawSVG: "0% 0%"` → `"0% 100%"`, scrubbed). These are DOM SVG, so they are crisp, accessible and indexable.
- Animate transforms and opacity only (CLAUDE.md).

### 4.2 R3F 9 / drei 10 / three r187
- R3F v9 is the version that supports React 19. Use `<Canvas gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false, depth: true }} dpr={q.dpr} flat linear={false}>`. Antialiasing is off because the composite pass is a full-screen quad and sequences are pre-antialiased. S02 and S05 get FXAA inside `Composite` on desktop only, at about 0.3 ms.
- Set `gl.outputColorSpace = SRGBColorSpace` and use ACES tone mapping only inside the S02 and S05 render targets. Sequence frames are already display-referred, so skip tone mapping for them (`toneMapped: false` on the sequence material).
- drei pieces used: `useGLTF`, `useKTX2`, `useFBO`, `PerformanceMonitor`, `AdaptiveDpr` (no), `Preload` (no: our own queue controls the order). `ScrollControls` and `View` are not used (D2, D3).
- `KTX2Loader` needs `detectSupport(gl)`, which `useKTX2` handles, and the transcoder path `/decoders/basis/`. `MeshoptDecoder` is passed by `useGLTF(url, false, true)`; with `true` drei uses the bundled meshopt decoder.
- `BatchedMesh` (r187) is **not needed**: there is no real-time foliage, because S01 is a sequence, and ≤ 7 plates are fewer draw calls than any batching overhead. Listed so nobody adds it.
- r187 ships `GLTFGaussianSplatLoaderExtension`. Gaussian splats could suit a real-time S01 later. Not now: the file sizes (≥ 10 MB) and mobile sort cost rule it out.
- WebGPU: `three/webgpu` (`three.webgpu.js`) exists, and R3F 9 accepts an async `gl` factory. Rejected for v2 (D7).

### 4.3 Image sequence vs video scrubbing
| | Image sequence (chosen) | Video `currentTime` scrub |
|---|---|---|
| iOS Safari | reliable | seeks are async; frames lag or stall on fast scrubs; needs `muted playsinline` and a user gesture on some versions |
| Encoding | 1 file per frame, cacheable, progressive strides possible | needs all-intra (`-g 1`) or keyint ≤ 6 to scrub smoothly, which makes files 2–4× bigger than a GOP encode and close to the WebP set size |
| Reverse scroll | free | costly (decode back from the last keyframe) |
| Decode cost | `createImageBitmap` off the main thread in Chromium and Safari | hardware, but seek latency dominates |
| Composite with WebGL | upload the bitmap to a texture | `VideoTexture` works but inherits the seek problem |

Memory maths: 1600×900×4 B ≈ 5.76 MB per decoded frame, so all 96 S01 frames decoded would be ≈ 553 MB. Hence the LRU window (§3.6).
WebCodecs `VideoDecoder` frame extraction would solve the seek problem, but it is more complex and Safari support is incomplete. Rejected.

### 4.4 Lenis + ScrollTrigger
These are the README's own sync lines, used exactly as in §3.4. Also:
- Add `data-lenis-prevent` on the cart drawer, nav menu and any modal, so they scroll natively. Do this instead of `allowNestedScroll`, which walks the DOM on every scroll event.
- `syncTouch: false` keeps native momentum on phones. Sticky and ScrollTrigger both work with native touch scroll.

### 4.5 gltf-transform pipeline (`scripts/build-glb.mjs`, dev only)
```bash
npx @gltf-transform/cli@4.5.1 inspect in.glb
# desktop
npx @gltf-transform/cli@4.5.1 optimize in.glb out-d.glb --compress meshopt --texture-compress ktx2 --simplify-ratio 0.5 --simplify-error 0.001
# mobile (stronger)
npx @gltf-transform/cli@4.5.1 simplify in.glb tmp.glb --ratio 0.25 --error 0.002
npx @gltf-transform/cli@4.5.1 resize tmp.glb tmp2.glb --width 1024 --height 1024
npx @gltf-transform/cli@4.5.1 etc1s tmp2.glb tmp3.glb --slots "{baseColorTexture,emissiveTexture}"
npx @gltf-transform/cli@4.5.1 uastc tmp3.glb tmp4.glb --slots "{normalTexture}"
npx @gltf-transform/cli@4.5.1 meshopt tmp4.glb out-m.glb
```
Flag names (`--simplify-ratio`, `--slots`) were not shown on the docs page. **Confirm them with `npx @gltf-transform/cli@4.5.1 optimize -h` before scripting** (UNVERIFIED). Acceptance: the `inspect` output meets the §2 tris and texture limits.

### 4.6 Frame pipeline (`scripts/build-frames.mjs`)
- Input: Blender PNG renders `renders/<scene>/<d|m>/####.png` (16-bit → 8-bit sRGB).
- sharp: `.resize(w, h, { fit: "cover" }).webp({ quality: 72, effort: 6, smartSubsample: true })`. The poster is frame 0 → `.avif({ quality: 50, effort: 6 })`.
- Output: `public/film/<scene>/<d|m>/NNNN.webp` and `src/lib/film/manifest.ts` (`{ s01: { d: { count, bytes:[...] }, m: {...} } }`).
- The script fails if a scene exceeds its §2 byte budget by more than 10%.
- Serve with `Cache-Control: public, max-age=31536000, immutable` (a content hash goes in the folder name, e.g. `s01.3f9a1c`).

### 4.7 The pear.no look (technique only)
The painterly, classical-realist quality comes from the **source frames**: Blender renders with a painterly post (Kuwahara/oil filter in compositing, canvas texture overlay, a muted classical palette) plus a hand paintover on key frames. The real-time layer adds paper grain, the noise-mask dissolve and slow parallax. A real-time Kuwahara filter would cost 4–8 ms on mobile, so it is rejected and baked offline instead. The doctor's (vaidyan's) hands, if used, belong in a pre-rendered sequence (S03 or S04), modelled and animated in Blender. Never use generated stand-ins for real people. A hand model with a licence is a missing input.

---

## 5. Codebase audit

| Path | Verdict | Notes |
|---|---|---|
| `src/lib/shopify/*` (`index.ts`, `public-json.ts`, `cart-actions.ts`, `format.ts`) | **KEEP** | Working adapter, products.json fallback and cart permalink checkout. The store revamp builds on it. |
| `src/app/api/shopify/*` | **KEEP** | |
| `src/lib/booking/*`, `src/components/booking/BookingForm.tsx` | **KEEP** | Restyle `BookingForm.module.css` to the new tokens only. The SMTP flow already meets "forms must really send". |
| `src/lib/seo/index.tsx` | **KEEP** | `buildMetadata`, `JsonLd` and the schemas. |
| `src/lib/site.ts` | **KEEP** | Verified facts. |
| `src/content/*` | **KEEP the facts, REWRITE the copy.** `story.ts` is v1 narrative copy (rejected) and gets replaced by `src/content/film.ts`, with a `source` field kept on every line. The content scrape was cut off partway (brief), so the content WP must finish it. |
| `src/components/store/*` logic (`CartContext`, `CartProvider`, `cart-store.ts`, `catalogue-query.ts`, `QuantityStepper`) | **KEEP** | The visual modules (`*.module.css`, `ProductCard`, `Catalogue`, `LedgerTable`) are **REPLACED** in the store-revamp WP. |
| `src/components/store/ProductGallery.tsx` | **CHANGE** | Remove the `ProductViewer` dynamic import. It renders an invented procedural bottle, which breaks brief rule 6 ("no generic AI-generated product packaging"). |
| `src/app/globals.css`, `src/app/styles/tokens.css`, `src/app/styles/base.css`, `design-system/MASTER.md` | **REPLACE** | The v1 "Vellum" theme, Crimson Pro / Hanken fonts and colours are rejected. The new tokens need light and dark sets plus the film chrome tokens (§3.10). |
| `src/app/layout.tsx` | **CHANGE** | New fonts, the theme inline script, `suppressHydrationWarning`, `viewport.colorScheme: "light dark"`. Keep `<ViewTransition default="page">` (React 19.3; works with App Router navigations). |
| `src/app/page.tsx` | **REPLACE** | It becomes `<Film />` + `<section id="site">` (S06). Keep the "Find the clinic" block, restyled. |
| `src/components/site/SmoothScroll.tsx` | **REPLACE** | Lenis on its own rAF loop becomes the gsap.ticker-driven singleton (§3.4). |
| `src/components/site/Nav.tsx`, `NavMenu.tsx`, `Footer.tsx` | **KEEP the structure, RESTYLE** | Add the theme toggle, `data-film-tone` styling and `data-lenis-prevent` on the menu. |
| `src/lib/story-progress.ts` | **DELETE**, superseded by `src/lib/film/store.ts` | |
| `src/components/story/StoryStage.tsx`, `StoryTrack.tsx` | **DELETE** | Their ideas (idle mount, WebGL check, a store written from scroll) carry over into `FilmStage` / `FilmScroll`. |
| `src/components/three/StoryCanvas.tsx`, `scenes/*` (Sprig, Garden, Picking, Preparing, Oil, Factory, Almirah, Clinic), `core.ts`, `leaves.ts`, `palette.ts`, `uruli.tsx` | **DELETE** | v1 procedural art direction, judged bland. |
| `src/components/three/ProductViewer.tsx`, `shapes.ts`, `props.tsx`, `labels.ts` | **DELETE** | Invented packaging (rule 6). S05 uses real-product GLBs only. |
| `src/components/three/TreatmentShader.tsx`, `src/components/content/ShaderBackdrop.tsx` | **DELETE** | `ShaderBackdrop` is imported nowhere (dead code), and it is the only user of `TreatmentShader`. |
| `public/story/ch-0..7.avif` | **DELETE** | Stills of the v1 scenes. |
| `public/{file,globe,next,vercel,window}.svg` | **DELETE** | create-next-app leftovers. |
| `next.config.ts` | **KEEP** | Add `headers()` for `/film/:path*` and `/decoders/:path*` (immutable cache, `Content-Type: image/ktx2` for `.ktx2`). Keep `cacheComponents`. |
| `@react-three/postprocessing`, `postprocessing` (package.json) | **UNINSTALL** | D8. |

Delete with `git rm`, so the delete is reviewable and can be undone. After deleting, `npx tsc --noEmit` and `npm run lint` must pass.

---

## 6. Work packages (technical side; the creative WPs supply the art)

Each WP ends with: `npx tsc --noEmit` passes, `npm run lint` passes, and `http://localhost:3000` renders. Each also has the checks listed below.

| WP | Scope | Acceptance checks |
|---|---|---|
| **F0 Clean-up and install** | §1 installs and uninstalls; §5 deletes; a temporary `page.tsx` stub with S06 content | `npm ls gsap` shows 3.15.1. `grep -r "components/three/scenes\|story-progress" src` finds nothing. Build passes. |
| **F1 Store, timeline, quality, Lenis** | `timeline.ts`, `store.ts`, `quality.ts`, the new `SmoothScroll` singleton, `copy-decoders.mjs` postinstall, self-hosted detect-gpu benchmarks | In the browser console, `film.get().target` goes 0 → 1 across the track. One Lenis instance exists (`window.__lenis` in dev only). Under reduced-motion emulation, no `lenis` or `gsap` chunk is requested (Network tab). |
| **F2 Film shell (static film)** | `Film.tsx`, `StaticFilm.tsx`, `SkipFilm.tsx`, server text for S01–S05 with placeholder posters | With JS disabled, every scene's text and poster renders and "Skip film" jumps to `#site`. Lighthouse mobile: LCP ≤ 2.0 s, CLS ≤ 0.05. |
| **F3 Canvas + composite + sequences** | `FilmStage`, `FilmCanvas`, `Composite`, `Sequence`, `assets.ts`, `build-frames.mjs`, run on **placeholder frames** (Blender greybox renders or numbered test frames) | Scrubbing S01 at 60 fps desktop (Chrome Performance p95 ≤ 16.7 ms) and ≥ 30 fps on a Moto G-class device or 4× CPU-throttled emulation. JS heap ≤ 200 MB desktop and ≤ 120 MB mobile while scrubbing the whole film. Boundary dissolves show no black frame. |
| **F4 Prototype (brief Phase 4)** | S01 → S02 transition, the S02 ring of 3 verified plates, one plate → specimen | This is the client review gate. Do not start F5 before sign-off. |
| **F5 S02 full + overlays** | `Archives.tsx`, `FilmOverlay` (SplitText, DrawSVG annotations), optional inspect mode (pause + "Return to film") | ≤ 30 draw calls (`gl.info.render.calls` logged in dev). Annotations are DOM text, so they show up in `get_page_text`. Inspect mode traps focus and Esc returns. |
| **F6 S03–S05** | Sequences, particles, the optional `ProductOrbit` (real GLB only) | Byte budgets in §2 are met (the `build-frames` script enforces them). The S05 product matches the real packaging photos (manual check against Shopify images). |
| **F7 Theme + chrome tones + audio + QA** | §3.10, §3.12, cross-device QA | Theme toggle persists and causes no flash on reload. Chrome stays readable in every scene (contrast ≥ 4.5:1 checked against the poster). Safari iOS 17+, Chrome Android, Firefox and Edge all pass. |

---

## 7. Risks

| # | Risk | Likelihood | Mitigation |
|---|---|---|---|
| R1 | **The asset production gap**: about 288 + 192 painterly frames, a portrait re-render, verified botanical plates and real product GLBs don't exist yet | High | F3 runs on greybox frames. The film ships scene by scene, and the static film is always complete. |
| R2 | The byte total (≈ 24 MB desktop) annoys visitors on metered connections | Medium | Streamed per scene, ≤ 8 MB in flight, Save-Data falls back to static, and the frame-cut ladder in §2. |
| R3 | iOS Safari memory kills (tab reloads) | Medium | Bitmap LRU ≤ 44 MB on mobile, dispose scenes more than one step away, mobile textures ≤ 1024². Test on an iPhone 12-class device. |
| R4 | Real packaging cannot be modelled accurately (no scans) | High | S05 falls back to Shopify product photography on a plane with a parallax depth map. Never invent a bottle (rule 6). |
| R5 | No candidate ingredient is verified in AVVVS products | Medium | S02 shows only ingredients verified from Shopify `body_html` / product pages. Fewer plates is fine (minimum 3 for the ring; otherwise use a linear sequence of plates). |
| R6 | KTX-Software won't install on Windows | Low | WebP textures through gltf-transform (§1 fallback). |
| R7 | The film chunk exceeds 380 KB gz | Medium | Drop drei (import loaders from `three/examples/jsm` directly), tree-shake GSAP plugins, and check `npm run analyze`. |
| R8 | Scroll hijack feel / accessibility complaints | Medium | No pin, native scroll on touch, Skip control, static mode, the nav always present. |
| R9 | Public-domain plate images look like generic AI sketches | Medium | Source genuine 19th-century engravings (for example Köhler's *Medizinal-Pflanzen*, 1887, public domain on Wikimedia Commons). Check each species is present and record the source in `credits.ts`. |

---

## 8. Recommended stack (final)

Next.js 16.4.5 (App Router, Cache Components, static home route) · React 19.3 · TypeScript · **gsap 3.15.1 + ScrollTrigger + SplitText + DrawSVG** (scroll, overlays) · **@gsap/react 2.1.2** (`useGSAP` cleanup) · **lenis 1.3.27** on `gsap.ticker` · **three 0.187** WebGLRenderer · **@react-three/fiber 9.8.2** (single canvas, demand frameloop) · **@react-three/drei 10.7.9** (useGLTF, useKTX2, useFBO, PerformanceMonitor only) · **detect-gpu 5.0.70** (self-hosted benchmarks) · motion 14.9 for UI and route transitions · sharp (bundled with Next) for frames · **@gltf-transform/cli 4.5.1** + **KTX-Software 4.4.2** (`ktx`) for GLB and KTX2 · Blender for all pre-rendered sequences. Removed: @react-three/postprocessing, postprocessing. Not added: zustand, WebGPU, drei ScrollControls, video scrubbing.

---

## 9. Missing inputs and UNVERIFIED items

1. **Which candidate ingredients actually appear in AVVVS products.** UNVERIFIED; must come from Shopify product data. This decides the S02 plate count.
2. **Real packaging for S05**: photographs from 6+ angles, or a 3D scan, of 1–3 hero SKUs. The label artwork files and the official logo in vector form (only `public/brand/avvvs-logo.png` exists).
3. **Licensed forest ambience audio** (30 s loop).
4. **Doctor's (vaidyan's) hands**: a hand model with a licence, or motion capture. Client approval of the scene.
5. **Blender renders for S01, S03, S04 and S05** in both 16:9 and 9:16, plus a 24-frame specimen turntable per verified ingredient (the tier 1 fallback).
6. **Botanical engraving sources** per verified ingredient, with public-domain status confirmed.
7. **The KTX-Software Windows asset filename** for v4.4.2. UNVERIFIED (the release asset list was truncated).
8. **gltf-transform `optimize` flag names** (`--simplify-ratio`, `--slots`). UNVERIFIED; confirm with `-h`.
9. **Approved copy** for scene headlines. The brief's suggested lines are suggestions only.
10. **A test device list** (the actual mid-range Android model for the 30 fps target).
