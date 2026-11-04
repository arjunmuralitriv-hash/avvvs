# AVVVS 3D Website — Build Plan

Status: **draft, waiting for approval**. Nothing is built yet.

---

## 1. What exists today (research findings)

**avvvs.com is down right now.** Its TLS certificate doesn't match the domain (`ERR_CERT_COMMON_NAME_INVALID`). All content below came from the Wayback Machine snapshots of May–July 2026, which load fine.

| Part | Where it lives | Platform |
|---|---|---|
| Brand / portfolio site | avvvs.com | WordPress 7.0.1 + Bricks builder |
| Online store | avvvsglobal.com | **Shopify**, with a public `/products.json` |
| Cosmetics brand | glovedaherbals.com, avvvs.com/cosmetic | separate site, linked out |
| Booking form | avvvs.com/consultation | Forminator plugin (WordPress AJAX form) |

### Brand facts (from the site, not invented)
- **Arya Vaidya Vilasini Vaidya Sala**, founded in **1921** by Kaloor Neelakantan Vaidyar with the blessing of Sree Narayana Guru.
- Succeeded by K.N. Ramadas Vaidyar. Now run by Dr Manoj Kaloor and Reeja Manoj.
- More than 300 classical and proprietary formulations, including Mezhu Thailam, Rujanth, Slepan, Redirons and Lakshol. The site claims "500k+ happy customers."
- GMP-certified factory. Exports to Russia, Austria, Slovenia and Colombia.
- **Contact:** AVVVS Ayur Specialty Clinics, 60/3829/A Annie Hall Road, Chalappuram PO, Kozhikode, Kerala 673002. Email mail@avvvs.com. Phone +91 8089202091 and +91 9037514016. The clinic is opposite Kozhikode railway station.
- **Social:** twitter.com/avvvsglobal, facebook.com/aryavaidyavilasini, instagram.com/avvvsglobal

### Sitemap to reproduce
Home · About · AVVVS Ayur Speciality Clinic · Wellness Treatments · Ayurvedic Life · Gallery · Testimonials · Blog (10 posts) · Contact · Book Appointment · Store (Proprietary / Classical / Cosmetic)

- **Clinics:** Women Health · Skin & Hair Care · Headache · Lifestyle Diseases · Pregnancy & Post-Natal Care · Pain Management · Obesity Management · Male & Female Infertility
- **Treatments:** Elakizhi · Podikizhi · Naranga kizhi · Abhyanga · Udvarthana · Njavarakizhi · Pizhichil · Shirodhara · and more. Each has preparation, procedure and benefits text.

### Store (Shopify, avvvsglobal.com)
- 3 collections: **Proprietary** (23 products), **Classical/Generic** (167), **Cosmetics** (10). About 200 products in total.
- Each product has a title, a `product_type` (THAILAM, CHOORNAM, LEHYAM, ARISHTAM, KASHAYAM, GHRITHAM, …), prices in INR and Shopify CDN images. A few products have no image.

### Booking form ("all the functions that are there now")
These are the fields today. None is marked required in the HTML, but the labels put \* on four of them.

| Field | Type | Options |
|---|---|---|
| First name \* | text | |
| Last name \* | text | |
| Email \* | email | |
| Date of birth | date | |
| Gender | radio | Male / Female / Other |
| Place | text | |
| Doctor | select | Dr Arun |
| Time slot | select | 9:00 AM – 1:00 PM · 2:00 PM – 5:00 PM |
| Phone \* | number | |

The new form keeps every field and adds a **preferred date**. The old form has no date picker for the appointment itself, which looks like a gap. It also adds a consent checkbox and real validation.

---

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Real server routes for the booking form, static generation and incremental revalidation for products and SEO |
| 3D | **three.js** through `@react-three/fiber` + `@react-three/drei` | three.js with React ergonomics; scenes load lazily |
| Page and UI motion | **motion** (motion.dev): `motion/react`, layout animations, `AnimatePresence` for route transitions | Smooth transitions and shared-element animation from product card to detail page |
| Micro motion | **animejs** (v4) | Small timelines only: number counters, SVG line drawing, staggered text |
| Styling | Tailwind CSS v4 + CSS variables (design tokens) | |
| Components | shadcn/ui primitives + selected **21st.dev** components, restyled to our tokens | Accessible primitives; 21st.dev adds pieces like the magnetic button, marquee, number ticker and dock |
| Scroll | Lenis smooth scroll, synced to the R3F frame loop | |
| Forms | react-hook-form + zod, shared between client and server | |
| Hosting | Vercel (suggested) | |

---

## 3. Design direction (the "no AI slop" part)

**Avoid** the usual Ayurveda look: leaf-green gradients, lotus and mandala clip art, "Unlock your wellness journey ✨" copy, glassmorphism cards, purple-blue AI gradients, an eyebrow label over every heading, and stock "spa" photos.

**Concept: "The Vaidya Sala ledger, 1921 → now."** It's a working Kerala apothecary, not a spa.
- **Palette:** warm unbleached paper, deep ink, oxblood/kumkum red, aged brass, and dark sesame-oil amber. The final values come from the AVVVS logo SVG and a Hallmark theme. The mood is close to a pharmacist's label and a medicine almirah.
- **Type:** a serif display face with character and a sober grotesk for body text. Malayalam glyphs (Noto Serif Malayalam) appear only where the content already uses them.
- **Copy:** only real copy from the scrape. Hallmark's "no invented facts" rule is a hard floor, so there are no made-up stats, testimonials or doctors.
- **Photography:** real product shots from Shopify plus real gallery images from the site. No AI-generated imagery.

### The homepage story: "From the garden to the bottle" (reference: pear.no's scroll-chapter storytelling, not its look)
One pinned three.js stage holds the screen while seven numbered chapters scroll past and scrub the scene forward. Like pear.no, each screen has one short serif line, scenes dissolve through a soft defocus, and single objects are hero props. **Every chapter is a fact from avvvs.com:**

| # | Chapter (h2) | Fact it carries (source) | What the 3D scene shows |
|---|---|---|---|
| 0 | Hero (Poster): *Herbs picked in Kerala, medicine since 1921* | 1921, Kaloor Neelakantan Vaidyar (About) | A leaf sprig, like the one in the logo, in dawn light; leaves stir |
| 1 | Grown beside the factory | Herbal gardens around the manufacturing units, for raw material and biodiversity (Home) | Rows of herb plants swaying; the camera drifts low through them |
| 2 | Picked by hand | Erukkila *Calotropis gigantea*, Ummathila *Datura metel*, Karinochiyila *Vitex negundo* (Treatments: Elakizhi) | Individual leaves detach and fall into a brass plate |
| 3 | Chopped, roasted, tied | "chopped fine and roasted with grated coconut and select spices… tied into a tuft-handled cloth poultice" (Treatments) | Leaves break into fragments that tumble in an uruli and gather into a cloth kizhi |
| 4 | Simmered into oil | Thailams; the in-house Mezhu Thailam formula (Home) | **Dark chapter (Vellum "oxblood, reversed")**: medicated oil in a brass uruli, shader surface, lamp glow, steam |
| 5 | Filled at our GMP factory | Capsulation, blister packing, ointment filling; exported to Russia, Austria, Slovenia, Colombia (About) | Oil pours into a glass kuppi bottle; bottles line up |
| 6 | On the almirah | 300+ formulations in 3 collections (Shopify) | A wooden almirah whose shelves are the real product types, with real Shopify labels as textures. **Links into the store** |
| 7 | And at the clinic | Elakizhi, Njavarakizhi, Abhyanga at the clinic opposite Kozhikode station (Clinic, Treatments) | The kizhi from chapter 3 returns, warm, on a treatment table. **The booking time slots appear as buttons** |

Then come the address and hours, the booking beside one last image, and the footer.

**No-WebGL / reduced-motion path:** every chapter shows a still of its scene, captured from the 3D scene itself, or a credited Wikimedia Commons photograph of the real named herb. The full story reads with JavaScript off.

### Other 3D moments
1. **Product viewer:** on a product page the bottle or jar is rendered in 3D. The shape comes from the `product_type` (THAILAM → oil bottle, LEHYAM → jar, CHOORNAM → pouch or tin), the label texture is the Shopify image, and the viewer is drag-to-rotate. A flat image is the fallback.
2. **Treatments:** a slow ink-in-water / warm-oil shader behind treatment detail pages. It is subtle and pauses offscreen.

**Performance and accessibility floor:** under `prefers-reduced-motion`, or on low-power devices (GPU tier detected with `detect-gpu`), 3D is replaced by a static render. The canvas never blocks content (LCP is the HTML hero text). There is a 60fps target on mid-range Android, draco/KTX2 assets, and the 3D bundle is code-split.

---

## 4. Store integration

**Decision: Shopify Storefront API** (GraphQL, `avvvsglobal.com` / its `*.myshopify.com` domain).
- **Catalog:** fetched with Storefront API `products` / `collections` queries, using incremental revalidation (hourly) plus on-demand revalidation. Until the token arrives, a dev-only adapter reads the public `/products.json`, so the build isn't blocked. Both adapters return the same typed `Product` shape.
- **Store UI:** collection tabs (Proprietary / Classical / Cosmetics), filter by product type, search (Storefront `query`), sort by price, product detail page with the 3D viewer, and related products (`productRecommendations`).
- **Cart:** Storefront **Cart API** (`cartCreate`, `cartLinesAdd/Update/Remove`). The cart id is kept in a cookie, so the cart survives reloads and devices share nothing. Optimistic UI runs in a slide-over drawer with motion layout animations.
- **Checkout:** redirect to the cart's `checkoutUrl`, which is Shopify's hosted checkout. Payments, tax and shipping stay on Shopify, and nothing on our side touches card data.
- **Needed from you:** a **Storefront API public access token**. Create it in Shopify admin → Settings → Apps → Develop apps → Storefront API, with the scopes `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts` and `unauthenticated_read_checkouts`. Put it in `.env.local` as `SHOPIFY_STOREFRONT_TOKEN`, along with `SHOPIFY_STORE_DOMAIN`.

## 5. Booking

- The client form has every existing field, a preferred date and zod validation. It shows inline errors, a loading state, and a confirmation only after the server confirms success.
- `POST /api/booking` validates the request again on the server, rate-limits it, and checks a honeypot field. It then sends email **over SMTP from the clinic's existing mailbox** using Nodemailer: one email to mail@avvvs.com with every field, and one confirmation to the patient. If sending fails, the page shows a real error with the phone and WhatsApp numbers.
- **Needed from you (entered yourself in `.env.local` / Vercel env, never in chat):** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `BOOKING_TO=mail@avvvs.com`. In dev, mail goes to a local Ethereal/Mailpit inbox so that testing never emails the clinic.
- The doctor and time-slot lists live in one config file, so the clinic can add doctors.

---

## 6. Performance, SEO, AEO and GEO

These requirements apply to every page and every agent from day one. They are not a cleanup pass at the end.

### 6.1 Performance budgets (fail the build if missed)
| Metric | Budget | Measured on |
|---|---|---|
| LCP | **≤ 2.0 s** | Moto G-class device, slow 4G (Lighthouse mobile) |
| INP | **≤ 150 ms** | |
| CLS | **≤ 0.05** | |
| TTFB | ≤ 400 ms (static or ISR from the Vercel edge) | |
| Initial JS (gzip, excluding the 3D chunk) | **≤ 170 KB** | `next build` output + bundle analyzer |
| 3D chunk (three + R3F + scene) | ≤ 350 KB gz, **loaded after first paint** | |
| Hero 3D assets (GLB + textures) | ≤ 1.2 MB total | |
| Lighthouse (mobile) | Performance ≥ 90, SEO 100, Accessibility ≥ 95, Best Practices 100 | |

How we meet them:
- **The 3D never gates content.** The hero headline and copy are server-rendered HTML and are the LCP element. The `<Canvas>` mounts with `next/dynamic({ ssr:false })` once the page is idle and the hero is in view. A pre-rendered still of the scene (AVIF) is visible until the canvas fades in, so the swap causes no layout shift.
- **Adaptive quality:** `detect-gpu` tier → device pixel ratio cap, shadow quality, and the number of instanced bottles. `PerformanceMonitor` from drei lowers quality when the frame rate drops. Rendering is `frameloop="demand"` when nothing moves, and the canvas pauses offscreen and in background tabs.
- **Assets:** GLB meshes are compressed with Draco or meshopt. Textures are KTX2/Basis. Bottle shapes are generated procedurally (lathe geometry), which is almost free to download.
- **Images:** `next/image` serves AVIF/WebP. Shopify CDN images use its `width` transform. Every image has explicit dimensions, and below-the-fold images are lazy-loaded.
- **Fonts:** `next/font`, self-hosted and subset (Latin, plus Malayalam only on pages that need it), with `font-display: swap` and metric-matched fallbacks.
- **Rendering:** React Server Components by default, with client components only where there's interaction. Store pages use ISR (hourly) plus on-demand revalidation from a Shopify webhook. Route transitions prefetch.
- **Motion:** transforms and opacity only, no layout-thrashing animations. animejs and motion animations respect `prefers-reduced-motion`.
- **Monitoring:** Vercel Speed Insights (real-user Core Web Vitals) and Lighthouse CI on every build. A budget breach fails the build.

### 6.2 Technical SEO
- **Keep the current rankings:** a **301 redirect map** from every old WordPress URL (all 10 blog slugs, `/consultation/`, `/avvvs-speciality-clinic/`, `/treatments/`, `/about-us/`, `/contact-us/`, `/gallery/`, `/testimonial/`, `/ayurvedic-life/`, `/cosmetic/`) to its new route. Where possible the old slugs are kept as they are.
- Next.js Metadata API sets per-page `title`, `description`, canonical, Open Graph and Twitter cards. Social share images are generated with `next/og`, one per product, treatment and clinic.
- `sitemap.xml` is built from content plus the Shopify products (about 200 product URLs), alongside `robots.txt`. Products, collections, treatments, clinics and posts get clean, human-readable URLs.
- Semantic HTML: one `h1` per page, a logical heading order, breadcrumbs, and descriptive internal links (for example clinic → related treatments → related products).
- Every word of content is server-rendered, nothing needs JavaScript to read, and nothing is hidden inside the canvas.
- `lang="en-IN"`. Malayalam strings get `lang="ml"`. If a Malayalam version is added later, hreflang is ready for it.
- **Local SEO:** name, address and phone written identically everywhere (footer, contact page, schema), matching the Google Business Profile. An embedded map on the contact page with the "opposite Kozhikode railway station" directions.

### 6.3 Structured data (JSON-LD, validated in Google's Rich Results Test)
| Page | Schema |
|---|---|
| Site-wide | `Organization` (founded 1921, founder, `sameAs` → the Facebook, Instagram and X accounts), `WebSite` |
| Clinic / Contact | `MedicalClinic` + `LocalBusiness` (address, geo, phone, opening hours from the time slots, `medicalSpecialty`) |
| Each clinic | `MedicalClinic` sub-department or `MedicalWebPage` with `about` |
| Each treatment | `MedicalTherapy` (name, description, procedure, herbs used as `drug`/ingredient text) inside a `MedicalWebPage` |
| Products | `Product` + `Offer` (INR price, availability from Shopify), `brand: AVVVS`, `BreadcrumbList` |
| Blog | `BlogPosting` (author, datePublished from the scraped posts) |
| Booking | `ReserveAction` on the clinic entity |
| FAQ blocks | `FAQPage` (see AEO below) |

### 6.4 AEO (answer engine optimisation: featured snippets, voice and "People also ask")
- **Questions become headings.** Treatment and clinic pages are laid out as real patient questions, each answered in a 40–60-word lead paragraph: "What is Elakizhi?", "What is Njavarakizhi used for?", "How long does an Abhyanga session take?" (the answer, 45–60 minutes, is from the site), "Where is the AVVVS clinic in Kozhikode?"
- **An FAQ block on each clinic, treatment and key product page**, with `FAQPage` schema. **Answers come only from the scraped AVVVS content.** We invent no medical claims, dosages or cures, which protects both Hallmark's floor and the clinic legally. Any question the content can't answer is left out.
- Benefits, ingredients and procedure steps are written as real `<ol>`/`<ul>` lists and `<table>`s, the formats answer engines lift.
- A "Key facts" box on About (founded 1921, founder, number of formulations, GMP certification, export countries, location) gives answer engines one unambiguous source.

### 6.5 GEO (generative engine optimisation: ChatGPT, Perplexity, Gemini, Google AI Overviews)
- **`/llms.txt`** (plus `/llms-full.txt`): a plain-Markdown map of the site, covering who AVVVS is, the clinics, treatments, product lines and booking, with links to the canonical pages.
- **Clear entities:** the full name "Arya Vaidya Vilasini Vaidya Sala (AVVVS)" appears consistently. The `Organization` `sameAs` and `@id` are stable, product names stay consistent with Shopify, and a Malayalam name variant is included where it's correct.
- **Easy to quote:** short, self-contained factual statements with dates and numbers, attributed to AVVVS. Each treatment page has a "Summary" sentence that an AI model can quote whole.
- **Crawler access:** `robots.txt` lets search crawlers (Googlebot, Bingbot) and AI retrieval agents (OAI-SearchBot, ChatGPT-User, PerplexityBot, Google-Extended, ClaudeBot) read the site. *Decision for you:* whether to also allow AI **training** crawlers (GPTBot, CCBot). The default is to allow them, for maximum visibility.
- **Fresh and trustworthy:** visible "last updated" dates, real author and doctor attribution only where the site provides it, and the 1921 heritage and GMP certification stated as facts. Real testimonials only.
- **Measure it:** before and after launch, track how ChatGPT, Perplexity and Gemini answer a fixed set of prompts, such as "best Ayurveda clinic in Kozhikode", "AVVVS Mezhu Thailam", "where to buy Rujanth" and "Njavarakizhi treatment Kozhikode".

---

## 7. Agent team

Orchestration: I (Opus) own the foundation, integration and final review. **Sonnet 5.5 agents** build the parallel pieces. Every agent gets the Karpathy guidelines (surgical, minimal, verify each step) plus the Hallmark and ui-ux-pro-max rules.

| Phase | Who | Work | Output |
|---|---|---|---|
| **0. Setup** | me | Install skills (`npx skills add nutlope/hallmark -g`, `npx ui-ux-pro-max-cli init --ai claude`, Karpathy `CLAUDE.md` in the repo), `git init`, scaffold Next.js, install three/R3F/drei/motion/animejs/lenis/zod | Building repo |
| **1. Foundation** | me | Generate a design system with ui-ux-pro-max (`--design-system --persist`) and choose a Hallmark theme. Build tokens, fonts, layout, nav, footer, route-transition shell and Lenis. Shared **SEO kit**: `buildMetadata()`, JSON-LD helpers (`<JsonLd>`, schema builders), breadcrumbs, `next/og` template. Performance budgets go into `next.config` and Lighthouse CI. **Build the hero first and review it** (Hallmark rule) | `design-system/MASTER.md`, app shell, `lib/seo/*` |
| **2. Parallel build** | 4 Sonnet agents, each in its own folder | | |
| | **A: Content** | Scrape every archived page (all 10 blog posts, gallery, testimonials, Ayurvedic Life, full clinic and treatment text) into typed `content/*.ts`. Download images into `public/` with credits | Content layer |
| | **B: 3D** | The pinned **story scene** (7 chapters scrubbed by scroll: garden, picking, preparing, oil, factory, almirah, clinic), lathe-geometry bottle generator, product viewer, oil shader, GPU tiering, per-chapter stills | `components/three/*` |
| | **C: Store** | Shopify fetch layer, collection, filter and search pages, PDP, cart drawer, permalink checkout | `app/store/*` |
| | **D: Booking + pages** | Booking form and API route, email; About, Clinics, Treatments, Blog, Gallery, Testimonials and Contact pages using content from A | `app/(site)/*`, `app/api/booking` |
| **3. Integrate** | me | Wire the hero to real content, shared-element transitions from card to PDP, tune motion | |
| **3b. Search & AI visibility** | **E: SEO/AEO/GEO** (Sonnet) | 301 redirect map from every old WordPress URL, `sitemap.ts`, `robots.ts`, `llms.txt` / `llms-full.txt`, JSON-LD on every page type (§6.3). Question-led headings and FAQ blocks drawn **only from scraped content**, a "Key facts" box, OG images. Validates every schema type | `app/sitemap.ts`, `app/robots.ts`, `public/llms*.txt`, `redirects` in config, FAQ content |
| **4. Verify** | me + 1 fresh-context reviewer | Hallmark lint at 8 widths. **Lighthouse CI against the budgets in §6.1** (mobile, slow 4G, on the home, store, product, treatment and booking pages). Bundle-size check. Rich Results test on each schema type. Check every 301 redirect resolves. Confirm the page text is complete with JavaScript off. Reduced-motion pass, keyboard pass, a real booking submission to a test inbox, cart → Shopify checkout handoff | Fix list, then fixes |

Agents B, C and D build against the shared tokens, the shell and the SEO kit from phase 1, so they don't drift apart. A runs first, or alongside them with stub content. **Every agent's definition of done** includes: `generateMetadata` and JSON-LD on its pages, server-rendered text, its page within the §6.1 budgets, and no invented facts.

---

## 8. Decisions (confirmed)
1. Booking delivery: **SMTP, existing clinic mailbox** (Nodemailer)
2. Store: **Shopify Storefront API + Cart API**, checkout on Shopify's hosted `checkoutUrl`
3. Hosting: **Vercel**
4. Note: avvvs.com's broken certificate needs fixing by whoever hosts it. That's separate from this build, but pointing the domain at Vercel would fix it at launch, because Vercel issues the certificate.

## 9. What I need from you (none of it blocks starting)
- Whether to allow AI **training** crawlers (GPTBot, CCBot). The default is to allow them.
- Access to the Google Business Profile, if one exists, so the name, address and phone can be matched exactly.
- Storefront API token + store domain (`.env.local`)
- SMTP credentials (`.env.local`)
- Any higher-resolution photos or brand guidelines you have. Otherwise the build uses what's on the current sites.
