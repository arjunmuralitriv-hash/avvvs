# AVVVS redesign: client direction (2026-11-04)

These are the client's own words, kept verbatim, and they are the source of truth for the redesign. Where an earlier plan (PLAN.md v1) conflicts with this file, this file wins.

## Feedback on the first build
> i dont like the typography, colour themes, and i dont like the copy written. I want the website to look modern, clean and minimalistic, with dark and light modes, (light mode default) I want the art style of the 3D film to be exactly like pear.no. The story may include the hands of a doctor and all, make it dramatic and eye catching and clean and smooth transitions, maybe even use a parchment art style or something. The generation so far is bland and has no taste. Use npx skills add Leonxlnx/taste-skill As well.

> Premium, aesthetic, minimalist style is a must.
> Revamp the store as well, to a awe inspiring modern store with the correct information on every medicine and things that make sales easier

## Reference notes the client pasted (from another project)
> Realism in 3D Models: Initial plant models looked cartoonish. We solved this by sourcing high-resolution GLTF models with PBR textures from Sketchfab and AmbientCG.
> Performance Optimization: With high-quality assets, frame rate dropped. We fixed this using model decimation, asset compression, and smart use of Suspense, LOD, and React-Spring animations.
> Camera Path Design: Making the garden feel like a game-level tour was tough. We used react-spring and @react-three/fiber to animate guided camera movement smoothly.

## The master creative brief the client pasted (verbatim)

AVVVS — IMMERSIVE 3D BRAND EXPERIENCE
Master Creative Direction, Storyboard & Technical Implementation Brief

You are acting as a multidisciplinary creative and technical team consisting of: an award-winning digital creative director; a cinematic 3D art director; a senior Three.js / React Three Fiber developer; a GSAP motion designer; a luxury brand experience designer; a senior Next.js architect; a web performance and accessibility engineer.

Your assignment is to conceptualise, design and eventually develop an exceptionally premium, cinematic, immersive website for AVVVS, an herbal / Ayurveda-focused brand. This must NOT look like a conventional Ayurveda website, Shopify template, generic wellness landing page or ordinary corporate website. The objective is to create a digital brand experience that communicates the relationship between nature, traditional Ayurvedic knowledge, botanical ingredients, formulation craftsmanship and the finished AVVVS products. The website should feel like an interactive cinematic film.

### 1. CREATIVE VISION
The central creative concept: FROM NATURE TO ESSENCE. The entire website should tell one continuous visual story:
1. A journey through the lush tropical landscapes of Kerala.
2. Discovery of medicinal plants and botanical ingredients.
3. Exploration of traditional botanical knowledge through antique illustrated manuscripts.
4. Transformation of botanical ingredients into extracts.
5. The blending and preparation of herbal formulations.
6. A dramatic cinematic reveal of actual AVVVS products.
7. Transition into the functional brand and product website.

The visual identity should combine: Kerala's tropical botanical environment; traditional Ayurvedic heritage; antique botanical scientific illustrations; premium apothecary aesthetics; photorealistic 3D product cinematography; modern interactive web technology. Avoid excessive visual clutter, generic stock imagery, stereotypical Ayurveda graphics, cartoon-like illustrations and unnecessary animations. The experience must feel sophisticated, immersive and internationally competitive.

### 2. SIX-SCENE CINEMATIC EXPERIENCE
**SCENE 01 — INTO THE ORIGINS.** Opening sequence. Begin with a near-black screen. Gradually introduce ambient tropical forest sounds. The camera flies through a dense Kerala rainforest. Show tropical foliage, medicinal plants, moss-covered surfaces, tree roots, natural sunlight and volumetric mist. Introduce subtle floating particles and realistic environmental movement. Descend towards a specific medicinal leaf. End with an extreme macro shot of that leaf. The leaf becomes the transition into Scene 02. Suggested headline: "Rooted in Nature. Refined Through Tradition." Animation: scroll-controlled camera movement, cinematic depth of field, volumetric lighting, atmospheric particles, realistic vegetation, smooth camera interpolation. The environment must feel like a real tropical Kerala forest, not a generic fantasy jungle.

**SCENE 02 — THE BOTANICAL ARCHIVES.** The signature visual sequence. Present medicinal plants through the visual language of antique botanical manuscripts and historical scientific illustrations. Environment: as the camera approaches the leaf from Scene 01, the forest gradually fades; the leaf transforms into an ink illustration; the environment becomes an aged ivory parchment space; multiple antique botanical plates emerge, floating at different depths, each with a detailed medicinal plant illustration. Background: aged ivory parchment, subtle paper grain, natural paper imperfections, warm archival lighting. Illustrations: dark brown ink, sepia engraving, detailed root structures, leaf venation, flowers and fruit, botanical cross-sections, scientific measurement markings. Typography: elegant antique serif, small handwritten annotations, botanical nomenclature, fine numbered references. The illustrations must resemble genuine historical botanical scientific engravings, not generic AI-generated sketches.
- 3D BOTANICAL MANUSCRIPT CAROUSEL: a circular 3D arrangement of botanical parchment plates, one per ingredient. Candidate ingredients: Ashwagandha, Turmeric, Brahmi, Amla, Neem, Ginger, Tulsi. IMPORTANT: these are candidates only; verify which ingredients actually appear in AVVVS products before presenting them as brand ingredients. The carousel rotates on scroll, has one prominent central plate and partially visible plates either side, subtle parallax and depth, realistic parchment geometry, soft shadows and warm lighting. Not a flat 2D slider.
- INDIVIDUAL PLATE: botanical classification number; common name; scientific name; full plant illustration; root details; leaf and flower details; handwritten annotations; a small traditional-use description (factually verified). Example: ASHWAGANDHA, *Withania somnifera*.
- SCROLL INTERACTION: when an ingredient comes into focus, its plate moves toward the camera; the illustration enlarges; the scientific name appears; handwritten annotations draw themselves; fine leader lines connect annotations to structures; the plant gains 3D depth; the root system separates; the parchment dissolves, giving way to a photorealistic 3D specimen.
- OPTIONAL: click an ingredient to pause the film and inspect an enlarged specimen (roots, leaves, flowers, fruit), with a clear return-to-film control.

**SCENE 03 — FROM ILLUSTRATION TO EXTRACTION.** The specimen rotates; the roots become the focus and separate; they float against an earthy background; fine particles detach and become powder; the powder disperses into transparent liquid that turns amber-gold; the camera moves through the suspended particles. Dark amber, earth brown, ochre, golden highlights, macro cinematography. A small overlay can identify the ingredient. Do not invent manufacturing processes; the animation is a visual metaphor unless the real process is verified.

**SCENE 04 — THE ALCHEMY OF NATURE.** "Nature's ingredients become carefully crafted formulations." Golden extracts flow through glass vessels, combine, swirl; a golden spiral forms. A premium traditional apothecary read through modern cinematic design, not a pharmaceutical lab. Liquid, glass refraction, caustics, macro lighting, subtle particles, controlled camera. Craftsmanship, not unsupported scientific claims.

**SCENE 05 — THE AVVVS REVEAL.** The climax; the finished AVVVS products are the hero. CRITICAL: use actual AVVVS packaging, labels, logo, typography and colours; never invent a bottle or fake labels. The spiral fills the screen, slows, a silhouette emerges, the actual product appears, golden droplets float, a slow orbit, the background becomes a dark botanical environment, AVVVS branding appears. Suggested headline: "Ancient Wisdom. Thoughtfully Reimagined." A luxury commercial product shot, not a generic mock-up.

**SCENE 06 — BEYOND THE FILM.** Transition into the functional commercial site: (A) brand philosophy: origins, heritage, formulation philosophy, ingredient selection, quality; (B) product collection: real photography, names, descriptions, ingredients, usage, pricing, detail pages, purchase or enquiry; (C) craftsmanship: sourcing, formulation, manufacturing, QA, verified certifications; (D) conversion: Explore Products, Shop Now, Enquire Now, Contact Us, WhatsApp. Visitors must always be able to navigate, enquire and buy without finishing the film.

### 3. VISUAL TRANSITION SYSTEM
One continuous film: LIVING FOREST → BOTANICAL ILLUSTRATION → 3D BOTANICAL SPECIMEN → HERBAL EXTRACT → FORMULATION → AVVVS PRODUCT. Colour progression: S01 forest green, deep shadows, sunlight; S02 aged ivory, sepia, dark brown ink; S03 earth brown, ochre, muted amber; S04 champagne gold, amber, warm glass; S05 deep forest green, black, gold; S06 warm ivory, muted green, sophisticated neutrals. Seamless camera transitions, shared elements, coordinated lighting; no abrupt section changes.

### 4. TECHNICAL ARCHITECTURE
Preferred: Next.js, React, TypeScript, Three.js, React Three Fiber, Drei, GSAP + ScrollTrigger, Blender, WebP/AVIF, GLB/glTF. Hybrid rendering: S01 pre-rendered image sequence or real-time; S02 real-time parchment carousel and botanical models; S03 pre-rendered transformation with real-time particle accents; S04 pre-rendered liquid simulation; S05 pre-rendered hero with optional real-time product interaction; S06 conventional responsive Next.js. Don't force real-time 3D everywhere. ScrollTrigger: pinned sections, scroll-controlled camera, timeline transitions, scrubbed animations, proper React cleanup. Must work on desktop, laptops, tablets, modern Android, iPhone: lazy-load cinematic assets, optimise textures, compress GLBs, avoid excess draw calls, device-appropriate quality, static/simplified fallback, reduced-motion respected, never block content or purchasing. 60 FPS on capable desktops, stable on mobile.

### 5. ART DIRECTION RULES (mandatory)
1. No generic Ayurveda templates. 2. No mandalas, floating symbols or stereotypical spiritual graphics. 3. No cartoonish botanical illustrations. 4. No excessive gold effects. 5. No animation for its own sake. 6. No generic AI-generated product packaging. 7. No unsupported health or medicinal claims. 8. No fabricated certifications. 9. No cluttered layouts. 10. No slow or inaccessible navigation.

### 6. RESEARCH AND ASSET DISCOVERY
Investigate brand identity, official logo, actual catalogue, packaging, ingredient lists, brand philosophy, existing descriptions, product photography, verified certifications and manufacturing info. Do not assume missing information. Create an asset register (asset name, scene, description, format, resolution, source, model/photograph/generate, available or required). List all missing inputs.

### 7. IMPLEMENTATION PHASES
Phase 1 Discovery. Phase 2 Creative development (storyboard, compositions, camera, transitions, typography, colour). Phase 3 Technical planning (architecture, component hierarchy, timelines, asset pipeline, mobile fallback). Phase 4 Visual prototype: forest-to-parchment transition, rotating manuscript carousel, one ingredient illustration becoming a 3D specimen. Do not build all six scenes before validating. Phase 5 Production. Phase 6 QA (layouts, browsers, performance, loading, accessibility, navigation, enquiry and purchase flows).

### 8. EXPECTED DELIVERABLES (first)
1. Creative direction document. 2. Six-scene storyboard. 3. Frame-by-frame breakdown of Scene 02. 4. Transition specification for every scene. 5. Visual asset register. 6. Technical architecture document. 7. Next.js component hierarchy. 8. Blender modelling and animation requirements. 9. Mobile optimisation strategy. 10. Realistic implementation roadmap. Include visual references. For every animation specify: starting state, ending state, camera position, camera movement, object movement, lighting, materials, scroll trigger, duration or scroll progress, transition to the next scene. No vague "make it cinematic".

### 9. WORKING PRINCIPLES
Be critical and technically realistic; propose cheaper alternatives that preserve the result when something is too heavy for browsers. Prioritise the highest-impact moments. Do not sacrifice mobile for desktop spectacle. Do not fabricate information about AVVVS. Do not assume candidate ingredients are used. Ask for missing assets and inputs. Do not start full production until the storyboard and technical plan are reviewed.

THE FINAL OBJECTIVE: a world-class digital experience where a visitor embarks on a cinematic journey through Kerala's botanical heritage, traditional Ayurvedic knowledge and the craftsmanship behind AVVVS: visually memorable, technically sophisticated, commercially effective and genuinely usable.

## Client additions beyond the brief
- The 3D film's art style should match **pear.no**: painterly, classical-realist imagery with WebGL transitions. Take the technique and art direction, never their assets.
- The story may feature **the hands of a doctor (vaidyan)**: dramatic, eye-catching, clean and smooth.
- A **parchment art style** is welcome (this fits Scene 02).
- **Light and dark modes**, with light as the default. Modern, clean, minimal, premium. The v1 typography, colours and copy are all rejected.
- **Store revamp**: an awe-inspiring modern store, correct information for every medicine, and features that make selling easier.
- Use the **taste-skill** (`design-taste-frontend`, installed globally).
- When the plan is ready, push to https://github.com/arjunmuralitriv-hash/avvvs.
