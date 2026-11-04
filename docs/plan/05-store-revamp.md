# 05 · Store revamp: build spec

Status: final draft, 2026-11-04. Executor: Claude Sonnet 5.5 at medium effort, one work package (§13) at a time.
Precedence: `docs/brief/creative-brief.md` > `docs/plan/01-creative-direction.md` > **this file** (for everything under `/store`, `/products`, the cart and checkout) = `docs/plan/04-technical-architecture.md` (for everything else) > `docs/research/store-revamp.md` > `docs/research/design-system-proposal.md` > `PLAN.md` (v1). Where 04 and this file disagree about a store route or component, this file wins; §0.1 lists every such point.

Inputs read in full: the creative brief, `01-creative-direction.md`, `docs/research/store-revamp.md`, `catalogue-audit.md` §2, §4–§6, `design-system-proposal.md` §2–§8, `src/lib/shopify/*`, `src/lib/site.ts`, `src/components/store/{cart-store.ts,CartContext.tsx,CartDrawer.tsx,catalogue-query.ts}`, `src/app/store/**`, `src/app/api/shopify/revalidate/route.ts`, `next.config.ts`, `package.json`, `src/content/catalogue.generated.json`.

Markers: **VERIFIED (source)**, **NEEDS-AVVVS** (do not ship until the client supplies or approves it), **UNVERIFIED** (used as a default, flagged), **TONE** (no factual claim, client still approves). Missing inputs are collected in §14.

**Not legal advice.** §8 is an engineering tripwire. AVVVS's counsel signs off the claims policy before launch (M2).

---

## 0. Decisions this file makes

| # | Decision | Why |
|---|---|---|
| R1 | Keep `src/lib/shopify/*` (both adapters, cached reads, cart store, permalink and Storefront checkout) unchanged except where §10 says. Add a **medicine layer** `src/lib/medicines/*` on top. All store UI reads `Medicine` / `MedicineCard`, never raw `Product`. | The data layer and checkout work today (store-revamp D1). |
| R2 | **PDP route stays `/products/[handle]`.** The proposal's `/store/products/[handle]` is not adopted. | 01 §5.2 and the plate "In:" links already point at `/products/{handle}`; 165 PDPs are statically generated there. |
| R3 | **Browse pages are static, every filtered state is one dynamic route.** `/store` and `/store/[collection]` never read `searchParams`. Every sort, facet, query and page > 1 lives at `/store/search?…`. | Cache Components: a page that reads `searchParams` cannot be fully prerendered. This puts the products in the initial HTML of every browse page (store-revamp S9) without path-based pagination. |
| R4 | `/store/[collection]` takes a **form id** (`thailam`, `kashayam`, …) or `proprietary`. `/store/classical` and `/store/cosmetics` redirect (§2.3). | Classical is 144 of 165 products: as a static page it breaks the HTML budget, and as a group it says nothing a buyer can use. Cosmetics has 0 published products (store-revamp I9). |
| R5 | **Shopify `body_html` is never rendered, indexed, summarised or put in metadata.** The proposal's "What it is used for" accordion is **rejected**. | 98 of 165 descriptions (59%) contain DMR Act Schedule or s.3 terms (store-revamp §5.3). |
| R6 | Medical facts render only from an **approved** content-sheet row. Until then the PDP points to the **real label photo** in a zoom viewer. | store-revamp D3, D4. |
| R7 | Sales aids are only those that need no invented data (§6). No reviews, ratings, bundles, subscriptions, urgency or free-shipping bars. | store-revamp D6, D7; creative brief rules 7–8. |
| R8 | Analytics: one provider-agnostic `track()` with three required events (§11). **No third-party script is added by this plan.** The provider is NEEDS-AVVVS (M13). | Product views of medicines can reveal health conditions; the safe default is no tracker until AVVVS chooses one. |
| R9 | Dark mode keeps product photographs on a **light photo well** (`--photo-well`, §5.1). | Shopify packshots sit on white grounds (verify in WP-R6, step 1). A white rectangle on `--surface` dark looks broken; a deliberate light well does not. |
| R10 | Store pages have **no scroll-entrance animation**. Motion is limited to the drawer, the sticky bar, the card image swap and button press. | The store is a tool. 01 §3.5 motion tokens still apply to what does move. |

### 0.1 Reconciliation with `04-technical-architecture.md` and the research WP names

04 was written against the research file's work-package names (S1–S9) and component names. Use this table to resolve every store reference in 04.

| 04 says | This file | Resolution |
|---|---|---|
| "store WP S1" (medicine layer, `sheet.tsv`, seed) | **R1** | same scope |
| "store WP S2" (`check-claims.ts`, also scans `film.ts`, `plates.ts`) | **R2** | same; Group G of §8.3 does not apply to `film.ts` / `plates.ts` (see §8.3) |
| "store WP S3" (PDP, `store-policies.ts`) | **R6** (PDP) and **R1** (`store-policies.ts`) | |
| "store WP S4" (`/store` static first page, `ItemList` of first 24, facets on `/store`) | **R4 + R5** | **This file wins:** `/store` is a store home with no product grid, so it has no `ItemList`; facets live on `/store/search`; `ItemList` goes on `/store/[collection]` (§5.2) |
| `/store/[collection]` "`generateStaticParams` from collections with ≥ 1 product" | §2.1 | **This file wins:** params are form ids with ≥ 1 product plus `proprietary` (R4) |
| "store WP S6" (selling aids, `/consultation` reads `?medicine=` client-side only) | **R7 + R8** | Agree: client-side read, §6.7 |
| "store WP S7" (E(1) gate) | **R1** (`policy.ts`) + **R7** (wiring) | |
| Component names `FormTiles`, `Catalogue`, `CatalogueControls` (04 §3 component tree) | `FormIndex`, `ProductGrid` + `BrowseBar` + `FilterPanel` + `SortLinks` | The 04 names are not created |
| `useZoomPan` hook "in `src/components/ui/useZoomPan.ts`" shared by `PlateInspect` and `LabelViewer` | §5.4.3 | Agree: `LabelViewer` imports `src/components/ui/useZoomPan.ts`; whichever WP runs first creates it |
| `Button` props `{ variant: "primary"\|"secondary"\|"quiet"; size?: "md"\|"lg"; href?; children; type?; onClick? }` | §4 | Agree; store components use it as is |
| `PlantsList` (home, `src/components/home/PlantsList.tsx`) | §5.4 "Film plants" links to `/#plants` | `PlantsList`'s `<section>` must carry `id="plants"`; if the home WP has not added it, R6 adds the id (one attribute) |
| `/shop` → `/store`, `/collections/:handle` → `/store/:handle` redirects | §2.3 | Compatible: `/store/classical` and `/store/cosmetics` then redirect again per §2.3 (one extra hop, acceptable) |

---

## 1. Facts this file relies on (do not retype; read from data)

| Fact | Value | Source |
|---|---|---|
| Products | 165, one variant each | VERIFIED: `catalogue.generated.json` (Shopify `products.json`, 2026-11-04) |
| Collections | classical 144, proprietary 21, cosmetics 0 published | VERIFIED: catalogue-audit §2 |
| `product_type` counts | KASHAYAM 60, ARISHTAM 27, THAILAM 23, CHOORNAM 21, CAPSULE 11, GHRITHAM 9, LEHYAM 7, PROPRIETARY 4, SYRUP 2, LINIMENT 1 | VERIFIED: computed from the JSON. Form ids (§3.3) regroup these. |
| In stock | 135 of 165 | VERIFIED: JSON `available` |
| Prices | ₹12 – ₹1,400, median ₹190 | VERIFIED: JSON |
| Images | 164 products have ≥ 1 image; `aragwadharishtam` has none; 64 have ≥ 2; 48 have a file named `*BACK*`; every back-label file is **682 px** wide; hero images: median 682 px, p90 1500 px | VERIFIED: JSON image widths |
| Verified compositions (no amounts) | `rujanth-capsule`, `rujanth-linment`, `mezhuthailam`, `lakshol` | VERIFIED: AVVVS blog posts (catalogue-audit §4), in JSON `ingredients` |
| Signature products | Mezhu Thailam, Rujanth, Slepan, Redirons, Lakshol → handles `mezhuthailam`, `rujanth-linment`, `rujanth-capsule`, `lakshol`, `slepan-capsule`, `red-irons-capsule` | VERIFIED: `org.signatureProducts`; handles from the JSON; order from 01 §4.4 |
| Delivery | "estimated 3–4 business days after dispatch (Sundays and holidays excluded)"; no charges, threshold or international terms stated | VERIFIED: avvvsglobal.com/pages/shipping (store-revamp §3.5) |
| Returns | 30 working days, unopened, 20% restocking charge; full refund if defective, damaged, lost, expired or missing; refunds 7–10 working days (COD up to 3 weeks) | VERIFIED: avvvsglobal.com/pages/return-policy |
| Checkout | Shopify hosted checkout on avvvsglobal.com (cart permalink now, `cart.checkoutUrl` with a token) | VERIFIED: `src/lib/shopify/format.ts`, `storefront.ts` |
| WhatsApp number | `clinic.phones[0]` = +91 8089202091 | **UNVERIFIED** which number has WhatsApp (M3) |

---

## 2. Information architecture and routes

### 2.1 Route table

| Route | Rendering | `searchParams`? | Purpose | Indexed |
|---|---|---|---|---|
| `/store` | Static (Cache Components prerender), revalidated by tag `products` | **No** | Store home: head + search, signature band, form index, recently viewed, advice band | yes |
| `/store/[collection]` | Static, `generateStaticParams` = every form id with ≥ 1 product + `proprietary` | **No** | One form (or the proprietary set): every product of that group, out-of-stock last | yes |
| `/store/search` | Static shell + dynamic results inside `<Suspense>` | Yes, read only inside the Suspense child | Search, facets, sort, pagination (24 per page), "all medicines" | **no** (`robots: { index: false, follow: true }`) |
| `/products/[handle]` | Static, `generateStaticParams` = all handles (kept) | No | PDP | yes |
| Cart | Client drawer `#cart-drawer`, no route | — | Lines, subtotal, upsell, checkout handoff | — |
| Checkout | Shopify (external) | — | Payment, address, shipping | — |
| `/consultation?medicine={handle}` | Existing page; the booking form reads the param (WP-R8) | Yes (inside Suspense) | "Ask a vaidyan before buying" target | yes (canonical without the param) |

Read `node_modules/next/dist/docs/01-app/` (Cache Components, `generateStaticParams`, `PageProps`, `redirects`, `robots` metadata) before touching these routes (AGENTS.md).

### 2.2 URL keys for `/store/search`

| Key | Values | Default | Notes |
|---|---|---|---|
| `q` | string, trimmed, max 80 chars | `""` | Phonetic search (§6.4) |
| `form` | a form id (§3.3) | `""` | One value |
| `collection` | `classical` \| `proprietary` | `""` | Hidden facet when a collection has 0 products |
| `route` | `internal` \| `external` | `""` | Facet renders only when ≥ 10 approved rows carry `route` |
| `ref` | slug of a classical reference (e.g. `ashtanga-hridayam`) | `""` | Same ≥ 10 rule |
| `stock` | `1` | absent | In stock only |
| `sort` | `relevance` (only valid with `q`), `name-asc`, `price-asc`, `price-desc` | `relevance` if `q`, else `name-asc` | `name-desc` is dropped |
| `page` | integer ≥ 1 | 1 | 24 per page; out-of-range → last page |
| `type` | legacy upper-case product type | — | Accepted as an alias: `type=THAILAM` → `form=thailam` (§2.3) |

`buildStoreHref(query, change)` in `src/lib/medicines/query.ts` writes keys in the order above and drops defaults, so every state has one canonical URL.

### 2.3 Redirects (add to `next.config.ts` `redirects()`; keep anything else that is there)

```ts
{ source: "/store/classical", destination: "/store/search?collection=classical", permanent: false },
{ source: "/store/cosmetics", destination: "/store", permanent: false },
{ source: "/store", has: [{ type: "query", key: "type", value: "(?<t>.+)" }], destination: "/store/search?type=:t", permanent: true },
{ source: "/store", has: [{ type: "query", key: "q", value: "(?<q>.+)" }], destination: "/store/search?q=:q", permanent: true },
```
`/store/[collection]` calls `notFound()` for any other unknown segment. If AVVVS publishes Cosmetics (M12), remove that redirect and add `cosmetics` to the static params.

### 2.4 Navigation and wayfinding

- Site nav (from the design-system WP) links "Store" → `/store`. The `CartButton` lives in the nav on every page.
- Breadcrumbs: PDP `Store / {Form label} / {name}` → `/store` / `/store/{form}`. Collection page `Store / {Form plural}`. Search page `Store / Search`. Breadcrumbs are by **form**, never by collection.
- Every store page ends with the `AdviceBand` (§5.3.4) before the footer, so "Ask a vaidyan" is always one tap away.
- Keyboard: from first load of `/store`, the search field is reachable in ≤ 3 Tab presses (Skip to content → nav is skipped → search field is the first control in `<main>`).

---

## 3. The medicine data model

### 3.1 Sources

| Code | Source | Trust | Location |
|---|---|---|---|
| **SH** | Shopify (public JSON now, Storefront API later) through `getProducts()` | Authoritative for price, stock, images, SKU, title, collections. **Not** for medical text. | `src/lib/shopify/index.ts` |
| **CAT** | `src/content/catalogue.generated.json` | Snapshot. Used only for (a) the sheet seed, (b) the 4 verified blog compositions (`ingredients`, `ingredients_source`), (c) build-time handle validation. Never for `indications`. | file |
| **SHEET** | AVVVS content sheet, `src/content/medicines/sheet.tsv` → `sheet.generated.json` | Authoritative once a row is `approved` | §3.4 |
| **DER** | Derived in code | Deterministic | `src/lib/medicines/*` |
| **POL** | Store policy strings | Verbatim, dated | `src/content/store-policies.ts` |
| **SITE** | `src/lib/site.ts` | Verified facts | file |
| **PLATE** | `src/content/plates.ts` (from 01 §5.2, built by the film WPs) | Verified per 01 | file |

### 3.2 TypeScript types — `src/lib/medicines/types.ts`

Plain serialisable data only (it crosses `"use cache"` and the server/client boundary).

```ts
import type { Money, ProductImage } from "@/lib/shopify/types";

export type FormId =
  | "asavam" | "arishtam" | "kashayam" | "keram" | "kuzhambu" | "thailam"
  | "choornam" | "ghritham" | "lehyam" | "capsule" | "syrup" | "liniment" | "other";

export type CollectionId = "classical" | "proprietary";
export type RouteOfUse = "internal" | "external";
export type TriState = "yes" | "no" | "unknown";
export type SheetStatus = "draft" | "approved";
export type PackUnit = "ml" | "g" | "capsules" | "tablets";

export type Pack = {
  quantity: number;
  unit: PackUnit;
  /** "sheet" = transcribed from the label and approved; "title" = parsed from the Shopify title (e.g. "KARPOORADI THALAM 200 ml"). */
  source: "sheet" | "title";
};

export type CompositionRow = {
  /** Botanical or substance name exactly as printed, e.g. "Alpinia galanga". Rendered in <i> when `isBinomial`. */
  name: string;
  isBinomial: boolean;
  /** e.g. "rhizome"; null when not printed. */
  part: string | null;
  /** e.g. "1.143 g"; null when not printed (blog lists have no amounts). */
  amount: string | null;
};

/** Present only when the sheet row is approved. Every string is verbatim from the physical label. */
export type LabelFacts = {
  nameMl: string | null;
  nameHi: string | null;
  route: RouteOfUse | null;
  classicalReference: string | null;
  compositionBasis: string | null;          // "Each 10 ml contains"
  composition: CompositionRow[];            // [] when not transcribed
  compositionSource: "label" | "avvvs-blog" | null;
  dosage: string;                           // required on approved rows, e.g. "As directed by the physician"
  directions: string | null;
  cautions: string | null;
  shelfLifeMonths: number | null;
  storage: string | null;
  manufacturer: { name: string; address: string | null; licenceNo: string | null } | null;
  prescriptionRequired: boolean;
  approvedBy: string;
  approvedOn: string;                       // YYYY-MM-DD
};

export type Gate =
  | { kind: "none" }
  | { kind: "consult"; reason: "schedule-e1" | "schedule-e1-unknown" | "prescription" };

export type Medicine = {
  handle: string;                 // SH, join key
  productId: string;              // SH
  variantId: string;              // SH, first (only) variant
  shopifyTitle: string;           // SH, raw, never displayed
  name: string;                   // SHEET display_name ?? DER cleanName(SH.title)
  form: FormId;                   // SHEET form ?? DER deriveForm()
  collections: CollectionId[];    // SH, filtered to known ids
  price: Money;                   // SH variant price
  compareAtPrice: Money | null;   // SH; rendered only if > price
  priceIsMrp: boolean;            // SHEET price_is_mrp === "yes" (approved rows only)
  available: boolean;             // SH variant available
  sku: string | null;             // SH
  images: ProductImage[];         // SH, in Shopify order
  heroImage: ProductImage | null; // DER images[0]
  hoverImage: ProductImage | null;// DER images[1] if it is not the label image, else null
  labelImage: ProductImage | null;// DER (§3.5)
  pack: Pack | null;              // SHEET (approved) ?? DER from title
  label: LabelFacts | null;       // SHEET, approved rows only
  indications: string | null;     // SHEET indications_label, only if §8.2 passes
  scheduleE1: TriState;           // SHEET schedule_e1, default "unknown" (applies in draft too)
  returnable: boolean;            // SHEET returnable !== "no" (applies in draft too)
  gate: Gate;                     // DER (§3.6)
  purchasable: boolean;           // DER available && gate.kind === "none"
  status: SheetStatus | "missing";// "missing" = no sheet row
  relatedHandles: string[];       // SHEET related_handles (max 4) ?? DER (§6.8)
  synonyms: string[];             // SHEET synonyms (any status)
  filmPlantSlugs: string[];       // DER (§3.7)
  searchKeys: string[];           // DER (§6.4), never displayed
};

/** What a card, the cart upsell, recently viewed and the sticky bar need. Small on purpose. */
export type MedicineCard = {
  handle: string;
  name: string;
  formLabel: string;          // "Thailam"
  packLabel: string | null;   // "200 ml"
  price: Money;
  compareAtPrice: Money | null;
  available: boolean;
  purchasable: boolean;
  variantId: string;
  heroImage: ProductImage | null;
  hoverImage: ProductImage | null;
};

export type FormSummary = {
  id: FormId;
  label: string;   // "Thailam"
  plural: string;  // "Thailams"
  gloss: string;   // "Medicated oil" (NEEDS-AVVVS approval, M9)
  count: number;
  inStock: number;
  thumb: ProductImage | null; // hero image of the first in-stock product, by name
  href: string;    // "/store/thailam"
};

export type StoreQuery = {
  q: string; form: FormId | ""; collection: CollectionId | ""; route: RouteOfUse | "";
  ref: string; stock: boolean; sort: "relevance" | "name-asc" | "price-asc" | "price-desc"; page: number;
};

export type FacetCounts = {
  form: Partial<Record<FormId, number>>;
  collection: Partial<Record<CollectionId, number>>;
  route: Partial<Record<RouteOfUse, number>> | null; // null = facet hidden (< 10 approved rows)
  ref: { slug: string; label: string; count: number }[] | null;
  inStock: number;
};

export type StoreResult = { items: MedicineCard[]; total: number; page: number; pageCount: number; facets: FacetCounts };
```

### 3.3 Field-by-field source table

Status groups decide when a SHEET value is used:
- **A (presentation, any status):** `display_name`, `form`, `synonyms`, `related_handles`, `label_image_index`.
- **B (label facts, `approved` only):** `name_ml`, `name_hi`, `net_quantity(+unit)`, `price_is_mrp`, `route`, `classical_reference`, `composition*`, `dosage_label`, `directions_label`, `cautions_label`, `shelf_life_months`, `storage_label`, `manufacturer_*`, `licence_no`, `prescription_required`.
- **C (indications):** `approved` **and** `indications_display=show` **and** `findClaims()` returns nothing (§8.2). Default: never.
- **D (safety, any status, conservative direction only):** `schedule_e1`, `returnable`.

| `Medicine` field | Primary source | Fallback | Rule |
|---|---|---|---|
| `handle`, `productId`, `variantId`, `sku`, `images`, `available`, `price`, `compareAtPrice` | SH | — | `compareAtPrice` kept only when `> price` |
| `shopifyTitle` | SH `title` | — | Never displayed |
| `name` | SHEET `display_name` (A) | DER `cleanName(title)` = `titleCase(title)` → strip `/\s*\d+(\.\d+)?\s*(ml|gm?s?|g)\b/i` → collapse whitespace | Never invent; fixes "THALAM" only through the sheet |
| `form` | SHEET `form` (A) | DER `deriveForm(productType, title)` §3.3.1 | |
| `collections` | SH | — | Keep only `classical` / `proprietary` |
| `pack` | SHEET `net_quantity` + unit (B) | DER from title, same regex as above, `source: "title"` | **Never** from SH `grams` (shipping weight) |
| `priceIsMrp` | SHEET (B) | `false` | Controls the "MRP, incl. of all taxes" wording |
| `heroImage`, `hoverImage`, `labelImage` | DER | — | §3.5 |
| `label` | SHEET (B) | `null` | |
| `indications` | SHEET `indications_label` (C) | `null` | Never from SH or CAT |
| `scheduleE1` | SHEET (D) | `"unknown"` | |
| `returnable` | SHEET (D) | `true` | |
| `gate`, `purchasable` | DER | — | §3.6 |
| `status` | SHEET `status` | `"missing"` | |
| `relatedHandles` | SHEET (A), unknown handles dropped | DER §6.8 | |
| `synonyms` | SHEET (A) | `[]` | |
| `filmPlantSlugs` | DER | `[]` | §3.7 |
| `searchKeys` | DER | — | §6.4 |

#### 3.3.1 Form enum — `src/lib/medicines/forms.ts`

```ts
export const FORMS: Record<FormId, { label: string; plural: string; gloss: string }> = {
  asavam:   { label: "Asavam",   plural: "Asavams",   gloss: "Fermented herbal liquid" },
  arishtam: { label: "Arishtam", plural: "Arishtams", gloss: "Fermented herbal decoction" },
  kashayam: { label: "Kashayam", plural: "Kashayams", gloss: "Decoction" },
  keram:    { label: "Keram",    plural: "Kerams",    gloss: "Medicated coconut oil" },
  kuzhambu: { label: "Kuzhambu", plural: "Kuzhambus", gloss: "Medicated oil blend" },
  thailam:  { label: "Thailam",  plural: "Thailams",  gloss: "Medicated oil" },
  choornam: { label: "Choornam", plural: "Choornams", gloss: "Herbal powder" },
  ghritham: { label: "Ghritham", plural: "Ghrithams", gloss: "Medicated ghee" },
  lehyam:   { label: "Lehyam",   plural: "Lehyams",   gloss: "Herbal confection" },
  capsule:  { label: "Capsule",  plural: "Capsules",  gloss: "" },
  syrup:    { label: "Syrup",    plural: "Syrups",    gloss: "" },
  liniment: { label: "Liniment", plural: "Liniments", gloss: "" },
  other:    { label: "Other",    plural: "Other medicines", gloss: "" },
};
export const FORM_ORDER: FormId[] = ["thailam","kashayam","arishtam","asavam","choornam","lehyam","ghritham","keram","kuzhambu","capsule","syrup","liniment","other"];
```
Glosses: NEEDS-AVVVS approval (M9). Until approved, `FORMS_GLOSS_APPROVED = false` in `policy.ts` hides every gloss (render `""`).

`deriveForm(productType, title)`, title upper-cased, first match wins:

| Order | Test | Form |
|---|---|---|
| 1 | title `/ASAVAM\b/` | asavam |
| 2 | title `/KERAM\b/` | keram |
| 3 | title `/KUZHAMBU\b/` | kuzhambu |
| 4 | title `/(RASAYANAM|GULAM|LEHYAM)\b/` | lehyam |
| 5 | title `/(GH?RU?ITH?AM|SARPIS)\b/` | ghritham |
| 6 | title `/\bT(H)?A(I)?LAM\b|\bTHALAM\b/` and not CASTOR OIL | thailam |
| 7 | `productType` ∈ ARISHTAM, KASHAYAM, CHOORNAM, CAPSULE, SYRUP, LINIMENT, THAILAM, GHRITHAM, LEHYAM | that id, lower-cased |
| 8 | otherwise | other (build warning naming the handle) |

Title rules run first so asavams filed under ARISHTAM and kerams under THAILAM land correctly (store-revamp I4). `gandharvahasthadi-castor-oil`: whatever the rules produce, the test prints it; the sheet `form` column fixes it if wrong.

### 3.4 The AVVVS content sheet

**File:** `src/content/medicines/sheet.tsv`, UTF-8, tab-separated, first row = headers below, one row per Shopify handle. AVVVS edits it in Google Sheets or Excel and exports **TSV** (File → Download → Tab-separated values). List cells use ` | ` (space, pipe, space). "Verbatim" means typed exactly as printed on the physical label, including its spelling.

**Build step:** `scripts/build-medicine-sheet.mjs` (plain Node, no deps) parses the TSV, validates every row with the zod schema in `src/lib/medicines/sheet-schema.ts` (imported via a relative `.ts` path; Node 25.9 strips types), checks every `handle` exists in `catalogue.generated.json`, and writes `src/content/medicines/sheet.generated.json` (`Record<handle, SheetRow>`). It exits 1 with `row N, column X: message` on any error. Add to `package.json`: `"medicines:build": "node scripts/build-medicine-sheet.mjs"`, `"predev": "npm run medicines:build"`, `"prebuild": "npm run medicines:build && npm run check:claims"`. At runtime an unknown handle (product deleted in Shopify after the snapshot) is skipped with one `console.warn`, never a crash.

| # | Column | Type | Required | Group | Notes |
|---|---|---|---|---|---|
| 1 | `handle` | string | yes | — | Must exist in Shopify |
| 2 | `status` | `draft` \| `approved` | yes | — | |
| 3 | `approved_by` | string | if approved | — | Name of the AVVVS vaidyan or QA person |
| 4 | `approved_on` | `YYYY-MM-DD` | if approved | — | |
| 5 | `display_name` | string ≤ 60 | no | A | Corrected title case, e.g. `Karpooradi Thailam` |
| 6 | `name_ml` | string | no | B | Malayalam script, from the label, checked by a native reader |
| 7 | `name_hi` | string | no | B | Devanagari, from the label |
| 8 | `synonyms` | list | no | A | Other spellings, e.g. `Dhanvantari Taila \| Dhanwantaram` |
| 9 | `form` | form id | no | A | Overrides the derivation |
| 10 | `net_quantity` | number | if approved | B | As printed |
| 11 | `net_quantity_unit` | `ml` \| `g` \| `capsules` \| `tablets` | if approved | B | |
| 12 | `price_is_mrp` | `yes` \| `no` | no | B | Shopify price equals printed MRP incl. taxes (M5) |
| 13 | `route` | `internal` \| `external` | if approved | B | Label "Usage" line |
| 14 | `classical_reference` | string | no | B | Label "Reference" line, normalised: `Ashtanga Hridayam`, `Sahasrayogam` |
| 15 | `composition_basis` | string | no | B | e.g. `Each 10 ml contains` |
| 16 | `composition` | list of `name ; part ; amount` | no | B | e.g. `Alpinia galanga ; rhizome ; 1.143 g`. Empty parts allowed: `Laccifer lacca ; ; ` |
| 17 | `composition_source` | `label` \| `avvvs-blog` | if `composition` set | B | `avvvs-blog` only for the 4 CAT products |
| 18 | `dosage_label` | string | if approved | B | Verbatim, e.g. `As directed by the physician` |
| 19 | `directions_label` | string | no | B | Verbatim |
| 20 | `indications_label` | string | no | C | Verbatim from the **label**, never from Shopify |
| 21 | `indications_display` | `show` \| `hide` | yes | C | Default `hide`; `show` needs counsel sign-off (M2) |
| 22 | `cautions_label` | string | no | B | Verbatim, e.g. `Caution: To be taken under medical supervision` |
| 23 | `schedule_e1` | `yes` \| `no` \| `unknown` | yes | D | Any Schedule E(1) ingredient (M1) |
| 24 | `prescription_required` | `yes` \| `no` | if approved | B | AVVVS policy for online sale |
| 25 | `returnable` | `yes` \| `no` | yes | D | Default `yes` |
| 26 | `shelf_life_months` | integer | no | B | From the label |
| 27 | `storage_label` | string | no | B | Verbatim |
| 28 | `manufacturer_name` | string | no | B | As printed |
| 29 | `manufacturer_address` | string | no | B | As printed (M7) |
| 30 | `licence_no` | string | no | B | Drug manufacturing licence no., as printed |
| 31 | `label_image_index` | integer ≥ 0 | no | A | Index into Shopify images |
| 32 | `related_handles` | list, max 4 | no | A | AVVVS-curated |
| 33 | `notes_internal` | string | no | — | Never rendered, never in `sheet.generated.json` |

Zod rules beyond types: `approved` requires 3, 4, 10, 11, 13, 18, 24. `composition` rows must have a non-empty name. `display_name`, `synonyms` and every C-group text must pass `findClaims()` when C is shown; the build fails otherwise.

**Seed:** `scripts/seed-medicine-sheet.mjs` reads CAT and writes `docs/data/medicine-sheet-template.tsv` with all 33 headers and one row per product: `handle`, `status=draft`, `display_name` = `cleanName(title)`, `form` = derived, `indications_display=hide`, `schedule_e1=unknown`, `returnable=yes`, and for the 4 CAT products `composition` (names only, from `ingredients`) + `composition_source=avvvs-blog`. **Every other column empty. Never pre-fill from `body_html` or CAT `indications`.** The committed `src/content/medicines/sheet.tsv` starts as the header row only; AVVVS fills rows from the template (M6).

### 3.5 Image roles

- `heroImage` = `images[0]`.
- `labelImage` = `images[label_image_index]` if set; else the first image whose URL matches `/back/i`; else, when there are ≥ 2 images, the last image; else `null`.
- `hoverImage` = `images[1]` when it exists and is not `labelImage`; else `null`.
- All Shopify images render through `src/lib/shopify/image-loader.ts` (a `next/image` `loader` returning `${src}${src.includes("?") ? "&" : "?"}width=${w}`), never through `/_next/image`. **Never request a width above the image's intrinsic width**: the loader caps `w` at `image.width` when known.

### 3.6 Gate and purchasability — `src/lib/medicines/policy.ts`

```ts
export const E1_UNKNOWN_IS_GATED = false;      // M1: AVVVS decides before launch
export const FORMS_GLOSS_APPROVED = false;     // M9
export const INDICATIONS_ENABLED = false;      // M2: master switch, overrides every sheet row
export const STANDARD_CAUTION_APPROVED = false;// M9: caution line text approval
export const whatsappPhoneIndex = 0;           // UNVERIFIED (M3); also exported from src/lib/site.ts

export function gateFor(m: { scheduleE1: TriState; label: LabelFacts | null }): Gate {
  if (m.scheduleE1 === "yes") return { kind: "consult", reason: "schedule-e1" };
  if (m.scheduleE1 === "unknown" && E1_UNKNOWN_IS_GATED) return { kind: "consult", reason: "schedule-e1-unknown" };
  if (m.label?.prescriptionRequired) return { kind: "consult", reason: "prescription" };
  return { kind: "none" };
}
```
`purchasable = available && gate.kind === "none"`. A non-purchasable medicine has **no** Add to cart anywhere: PDP, sticky bar, card quick add, cart upsell, recently viewed.

### 3.7 Film plants on a PDP

`filmPlantSlugs` lists the slugs of `src/content/plates.ts` rows whose **binomial** appears (case-insensitive, genus + species) in either the approved `label.composition` or the CAT `ingredients` of the 4 blog-verified products. Expected at launch from CAT alone: `rujanth-linment` → nirgundi, eranda, tila; `rujanth-capsule` → eranda, shunti; `mezhuthailam` → tila (the CAT string "Tila Thailam (sesame oil)" has no binomial, so add `Sesamum indicum` matching by the plate's Sanskrit name `Tila` as a second key); `lakshol` → none from CAT (turmeric and ashwagandha arrive with the approved label row). Title-only herb matches never count. If `plates.ts` does not exist yet, `filmPlantSlugs` is `[]` and the PDP block does not render.

### 3.8 Data functions — `src/lib/medicines/index.ts` (`import "server-only"`)

| Function | Cache | Returns |
|---|---|---|
| `getMedicines()` | `"use cache"`, `cacheLife("hours")`, `cacheTag("products", "medicines")` | `Medicine[]`, sorted by `name` (locale `en-IN`) |
| `getMedicine(handle)` | same, plus `cacheTag("product:" + handle)` | `Medicine \| null` |
| `getFormSummaries()` | derived from `getMedicines()` | `FormSummary[]` in `FORM_ORDER`, forms with count 0 omitted |
| `getSignatureCards()` | derived | `MedicineCard[]` for `SIGNATURE_HANDLES` (§5.3.2), skipping missing handles |
| `toCard(m)` | pure | `MedicineCard` |

Pure modules (no `server-only`, testable with `node --test`): `forms.ts`, `query.ts` (`parseStoreQuery`, `buildStoreHref`, `runStoreQuery(meds, q): StoreResult`), `phonetic.ts`, `glossary.ts`, `claims.ts`, `merge.ts` (`mergeMedicine(product, row | undefined, cat | undefined, plates): Medicine`).

Server actions — `src/lib/medicines/actions.ts` (`"use server"`):
- `getCardsAction(handles: string[]): Promise<MedicineCard[]>` — zod `z.array(z.string().max(120)).max(8)`, unknown handles dropped, order preserved.
- `getUpsellAction(cartHandles: string[]): Promise<MedicineCard[]>` — zod `.max(50)`; §6.9 rule; max 3.

---

## 4. Design system rules for the store (summary of 01 §3, applied)

Use only the tokens in 01 §3.3 plus the three store tokens below. No hex in components. CSS Modules per component (existing pattern), colours via `var(--token)`.

| Rule | Value |
|---|---|
| Faces | Boska (every h1 is Boska **300** per 01 C8: `--step-display` on store home and collection pages, `--step-head` on the PDP and search page; h2 Boska 400 `--step-head`; prices on PDP and cart subtotal Boska 400 `--step-lead`). Geist for everything else. |
| Sizes | Five only: `--step-display`, `--step-head`, `--step-lead`, `--step-body`, `--step-small`. An h3 is Geist 600 `--step-body`. |
| Numbers | `font-variant-numeric: tabular-nums` on every price, count, quantity, phone number |
| Radius | 0. `999px` only on the cart badge |
| Borders | None. Separation by tone steps `--bg` → `--surface` → `--surface-2`. Tables use alternating `--surface` rows. |
| Accent | `--accent` only on primary buttons, text links, focus, selected facet. < 5% of any screen |
| Shadows | `--shadow-float: 0 24px 64px oklch(16% 0.01 170 / 0.18)` on the cart drawer, LabelViewer dialog and sticky bar only |
| Focus | `outline: 2px solid var(--focus); outline-offset: 3px` |
| Buttons | `Button` from `src/components/ui/Button.tsx` (design-system WP): `primary` / `secondary` / `quiet`, `md` 48 px / `lg` 56 px. No icons in buttons. |
| Copy | Product names via `name` (never upper-case CSS). Card line "Form, pack" with a comma. |
| Banned visuals | Eyebrows, pills, badges over images, stars, "Bestseller"/"New" tags, gradients, glass, clip art, hover-only info, identical card rows as a section (the catalogue grid itself is allowed, always preceded by non-grid content) |

### 4.1 Store tokens (add to `src/app/styles/tokens.css`)

```css
:root, :root[data-theme="light"] {
  --photo-well: oklch(94.5% 0.007 95);       /* = --surface; product photos multiply onto it */
  --store-caution-bg: oklch(96.5% 0.025 85);
  --shadow-float: 0 24px 64px oklch(16% 0.01 170 / 0.18);
}
:root[data-theme="dark"] {
  --photo-well: oklch(90% 0.009 95);         /* deliberate light box in dark mode (R9) */
  --store-caution-bg: oklch(27% 0.025 85);
  --shadow-float: 0 24px 64px oklch(5% 0.01 170 / 0.5);
}
```
- No text ever sits on `--photo-well` (it is an image ground only). Product `<img>` inside the well gets `mix-blend-mode: multiply` in both themes so white packshot grounds take the well tone.
- `--ink` on `--store-caution-bg` must be ≥ 4.5:1 in both themes. Expected ≈ 15:1 light, ≈ 11:1 dark; WP-R6 records the computed ratios in `docs/research/taste/contrast.txt`.
- store-revamp's `--store-caution-border` is **not** created (no borders).

### 4.2 Shared layout

- 12-column grid from 01 §3.4: 4 cols < 48rem, 8 cols 48–75rem, 12 cols ≥ 75rem; `padding-inline: var(--margin)`; `column-gap: var(--gap)`; text sections `max-width: 1600px; margin-inline: auto`.
- Section spacing `--section-gap`; inside a section ≤ `--space-8`.
- Page top: `padding-top: var(--space-9)` (96 px) below the 64 px nav on store pages; `--space-7` (48 px) on the PDP.

---

## 5. Page-by-page layouts

Every page: `generateMetadata` via `buildMetadata()`, JSON-LD via `<JsonLd>`, all text server-rendered, `npm run check:claims` clean. Light and dark use the **same structure**; the dark column lists only what changes beyond token values.

### 5.1 Store home — `/store` (`src/app/store/page.tsx`)

**Order and grid**

| # | Block | Component | Desktop ≥ 75rem | Tablet 48–75rem | Phone < 48rem |
|---|---|---|---|---|---|
| 1 | Head | `StoreHead` | h1 cols 1–7; lead cols 1–6 under it; `StoreSearchField size="lg"` cols 8–12, bottom-aligned with the lead | h1 + lead cols 1–8; search cols 1–6 below, 32 px gap | stacked, search full width |
| 2 | Signature band | `SignatureBand` | full-bleed row, `height: 68svh` (min 520 px, max 760 px), panels flex-grow `5 / 2 / 3 / 2 / 2 / 2`, gap `--gap` | 2-row layout: first panel full width 52svh, then 5 panels in a horizontal scroll-snap row (each 40vw) | first panel 4:5 full width, then horizontal scroll-snap row, each 64vw, `scroll-snap-type: x mandatory` |
| 3 | Form index | `FormIndex` | h2 "By form" cols 1–4; list cols 5–12 | h2 cols 1–8; list cols 1–8 | full width |
| 4 | Recently viewed | `RecentlyViewed` (client) | h2 "Recently viewed" cols 1–4; compact row cols 5–12 | full | full; renders only when ≥ 2 entries |
| 5 | All / proprietary links | `StoreIndexLinks` | cols 5–12, two `--step-lead` Boska links | full | full |
| 6 | Advice band | `AdviceBand` | full-bleed `--field-clinic` | same | same |

**Copy (final)**

| Element | Text | Status |
|---|---|---|
| h1 | **Medicines** | 01 §4.4 |
| lead | **{count} classical and proprietary medicines, by form. Not sure what you need? [Ask a vaidyan](/consultation).** | VERIFIED: `count` = `getMedicines().length` |
| search label (visually hidden) / placeholder | "Search medicines" / "Name, form or botanical name" | — |
| search button | "Search" (secondary `lg`) | — |
| signature h2 | **Known for** | TONE (01 §4.4) |
| form index h2 | **By form** | — |
| form row | `{label}` Boska `--step-lead` · `{gloss}` Geist `--step-small` `--muted` (hidden until M9) · `{count}` tabular, right-aligned · 56 px thumbnail on the left | VERIFIED counts |
| links | "All {165} medicines" → `/store/search`; "Proprietary medicines ({21})" → `/store/proprietary` | VERIFIED counts |
| advice band | h2 **Ask a vaidyan first** · lead "The clinic at Annie Hall Road, opposite Kozhikode railway station. Consultations 9:00 AM – 1:00 PM and 2:00 PM – 5:00 PM." · primary "Book a consultation" → `/consultation` · secondary "Ask on WhatsApp" | VERIFIED: `clinic.street`, `clinic.landmark`, `clinic.timeSlots`; WhatsApp number UNVERIFIED (M3) |

**Signature panel anatomy** (each panel is one `<a href="/products/{handle}">`): image well `--photo-well` filling the panel above a 96 px text block on `--bg`; photo `object-fit: contain`, inset 8%; text block: name Geist 500 `--step-body`, "Form, pack" `--step-small` `--muted`, price Geist 500 `--step-body` tabular. The first (widest) panel shows the name in Boska `--step-head` instead. No Add button in the band (the band is a doorway; quick add lives in the grid). `sizes`: first panel `(min-width:75rem) 38vw, 100vw`; others `(min-width:75rem) 15vw, 64vw`. First panel image `priority`.

**Form index row**: `<li>` with one `<a>` covering the row; row height 72 px; alternating `--surface` / `--bg` fills; hover `--surface-2` (instant). Count reads "{n}" and, when `inStock < count`, a second muted line "{inStock} in stock" on phone only (desktop: a second column). `other` is listed last only if non-empty.

**Dark:** photo wells become `--photo-well` dark (light box); `--field-clinic` dark; everything else by token.

**Metadata:** title "Medicines", description "{count} classical and proprietary Ayurveda medicines from Arya Vaidya Vilasini Vaidya Sala, Kozhikode, since 1921. Thailams, kashayams, arishtams and more, by form.", path `/store`.
**JSON-LD:** `CollectionPage` (`name: "Medicines"`, `url`, `isPartOf` website id) + `BreadcrumbList` (Store). No `ItemList` here.

**Acceptance — store home**
1. `curl -s http://localhost:3000/store` (no JS) contains "Medicines", the six signature names that Shopify returns, every form label with count > 0, and "Ask a vaidyan first". Total HTML ≤ 120 KB uncompressed.
2. Sum of `FormIndex` counts = `count` in the lead.
3. `next build` output marks `/store` as static/prerendered (no dynamic marker).
4. With localStorage blocked, the page renders identically minus the recently-viewed block, with no console error.
5. 375 px: no horizontal page scroll (the scroll-snap rows scroll inside themselves); the search field is the first focusable element in `<main>`.
6. Lighthouse mobile: LCP ≤ 2.0 s, CLS ≤ 0.05, TBT ≤ 150 ms (PLAN §6.1).
7. Taste-skill inspector 0 FAIL at 390 / 768 / 1440 in light and dark.

### 5.2 Collection page — `/store/[collection]` (`src/app/store/[collection]/page.tsx`)

`collection` ∈ form ids with ≥ 1 product, plus `proprietary`.

| # | Block | Desktop | Tablet | Phone |
|---|---|---|---|---|
| 1 | Breadcrumbs | cols 1–12, `--step-small` | same | same |
| 2 | Head | h1 cols 1–7 (Boska 300 `--step-display`); lead cols 1–6 | cols 1–8 | full |
| 3 | Browse bar | `BrowseBar`: left "Sort:" quiet links (Name A–Z · Price low–high · Price high–low) + "In stock only" link; right `StoreSearchField size="md"` preset with `form` | stacked: links then search | `<details>` "Sort and filter" containing the same links; search below |
| 4 | Grid | `ProductGrid`: 4 columns, row gap 48 px | 3 columns | 2 columns |
| 5 | Other forms | `FormIndex variant="compact"` (one line per form, no thumbnails), h2 "Other forms" | same | same |
| 6 | Advice band | as §5.1 | | |

Browse-bar links go to `/store/search?form={id}&sort=…` / `&stock=1`. The current state on the static page is "Name A–Z, all stock", shown with `aria-current="true"` on "Name A–Z".

Grid content: every product of the group, sorted by name, **out-of-stock last**. Expected maximum 60 cards (kashayam); proprietary 21.

**Copy**

| Element | Form page | Proprietary page |
|---|---|---|
| h1 | **{plural}** e.g. "Thailams" | **Proprietary medicines** |
| lead | "{count} {plural lower}, prepared by Arya Vaidya Vilasini Vaidya Sala." + gloss sentence "{Plural}: {gloss lower}." when M9 is approved | "{count} proprietary medicines from AVVVS." |
| Out-of-stock card line | "Out of stock" | same |

`count` from data. VERIFIED: collections; `org.name`.

**Metadata:** title "{plural}" (or "Proprietary medicines"); description "{count} Ayurveda {plural lower} from Arya Vaidya Vilasini Vaidya Sala, Kozhikode, since 1921." Path `/store/{collection}`.
**JSON-LD:** `CollectionPage` + `ItemList` (`itemListElement`: `ListItem` with `position` and `url` of each PDP, no descriptions) + `BreadcrumbList`.

**Dark:** as §5.1.

**Acceptance — collection**
1. `curl -s /store/thailam` contains every thailam name returned by `getMedicines()` filtered to `form=thailam`; card count equals the `FormIndex` count for thailam.
2. HTML ≤ 140 KB for `/store/kashayam` (the largest).
3. `/store/classical` → 307 to `/store/search?collection=classical`; `/store/cosmetics` → `/store`; `/store/xyz` → 404.
4. Out-of-stock cards appear after every in-stock card.
5. Build marks every `/store/[collection]` path as prerendered.
6. Inspector 0 FAIL, both themes, 3 widths.

### 5.3 Search and filter — `/store/search` (`src/app/store/search/page.tsx`)

Static shell: breadcrumbs, h1, search form. Results: `<Suspense fallback={<ResultsSkeleton />}>` → `<SearchResults searchParams={searchParams} />` (the only reader of `searchParams`). The skeleton is 8 `--surface` blocks at card size, no shimmer animation.

| # | Block | Desktop | Tablet | Phone |
|---|---|---|---|---|
| 1 | Breadcrumbs "Store / Search" | | | |
| 2 | h1 + form | h1 **Search medicines** (Boska 300 `--step-head`) cols 1–6; `StoreSearchField size="lg"` cols 1–8 below | cols 1–8 | full |
| 3 | Result line | `--step-body`: "{total} medicines" / "{total} medicines for '{q}'" + `ActiveFilters` as quiet buttons "Remove: Thailam", "Remove: In stock only", "Clear all" | same | same |
| 4 | Facets | `FilterPanel` cols 1–3, sticky `top: calc(var(--nav-h) + 24px)` | `<details>` "Filters ({n active})" above the grid, open by default ≥ 48rem | `<details>` closed by default |
| 5 | Sort | `SortLinks` above the grid, right-aligned | same | inside the filters `<details>` |
| 6 | Grid | cols 4–12, 3 columns | 3 columns | 2 columns |
| 7 | Pagination | `Pagination`: "Previous" / "Page {p} of {n}" / "Next" as links; no numbered pills | same | same |
| 8 | Advice band | | | |

**FilterPanel**: groups in order Form, Collection, Use (route), Reference, Availability. Each group: h3 (Geist 600 `--step-body`) + a list of links "{label} ({count})". The selected value is filled `--ink` with `--bg` text (inverted row, contrast 16:1). Selecting a selected value removes it. Values with count 0 are not rendered. Route and Reference groups render only when `facets.route` / `facets.ref` are non-null. All filtering works without JavaScript (links and a GET form).

**Facet counts** are computed on the result set with every other active filter applied (the count shown for a value equals the results its link returns).

**Zero results** (`ZeroResults`): h2 **No match** · "No medicine matches '{q}'. [Ask a vaidyan on WhatsApp](wa) or [book a consultation](/consultation)." (01 §4.4) · then `FormIndex variant="compact"`.

**Metadata:** title "Search medicines"; `robots: { index: false, follow: true }`; canonical `/store/search`. No JSON-LD beyond `BreadcrumbList`.

**Acceptance — search**
1. The six queries in §6.4 return the listed handles; `q=paralysis` returns 0 results; `q=knee pain` returns 0 results.
2. `/store/search?form=thailam&stock=1&sort=price-asc&page=1` server-renders sorted in-stock thailams, ascending price, with "Remove: Thailam" and "Remove: In stock only".
3. Every facet count equals the result count of its link (test in `query.test.ts` over the live snapshot).
4. `/store/search?type=THAILAM` behaves as `form=thailam`; `/store?type=THAILAM` redirects there (308).
5. Works with JavaScript disabled (filters, sort, pagination, search).
6. HTML of page 1 with no filters ≤ 120 KB; `<meta name="robots" content="noindex, follow">` present.

### 5.4 PDP — `/products/[handle]` (`src/app/products/[handle]/page.tsx`)

Server Component. Client leaves only: `ProductGallery` (thumbnail switching), `LabelViewer`, `BuyPanel`, `StickyBuyBar`, `RecentlyViewedWriter`, `ProductAnalytics`, `RecentlyViewed`.

**Grid**

| Zone | ≥ 75rem | 48–75rem | < 48rem |
|---|---|---|---|
| Gallery | cols 1–7, main well `position: sticky; top: calc(var(--nav-h) + 24px)` | cols 1–4, sticky | full width, first |
| Info | cols 8–12 | cols 5–8 | full width, after gallery |
| Below the grid | full width rows | | |

**Gallery** (`ProductGallery`): main well `--photo-well`, aspect 4:5, image `contain`, inset 8%, `sizes="(min-width:75rem) 58vw, (min-width:48rem) 50vw, 100vw"`, `priority`. Thumbnails: row of 72 × 72 px wells, 8 px gap, below the main well; selected thumb has `box-shadow: inset 0 -2px 0 var(--ink)`; each thumb is a `<button aria-label="Show image {i} of {n}">`; the label image's thumb reads "Label" under it (`--step-small`). No image: a `--surface` 4:5 panel with the name set in Boska `--step-head` `--muted`, centred vertically, left-aligned with 8% inset (store-revamp §6.4). **No 3D viewer** (delete it).

**Info column, top to bottom** (spacing 24 px unless noted):

| # | Element | Spec | Renders when |
|---|---|---|---|
| 1 | Breadcrumbs | `Store / {Form label} / {name}` | always |
| 2 | h1 | `name`, Boska 300 `--step-head`, line-height 1.0, tracking −0.02em, `max-width: 16ch`, max 2 lines, `text-wrap: balance` | always |
| 3 | Malayalam name | `<p lang="ml">` `--step-lead` Noto Serif Malayalam (via `:lang(ml)`) | `label.nameMl` |
| 4 | Price line | `PriceLine`: Boska `--step-lead` tabular "₹270", then Geist `--step-small` `--muted` " · 200 ml" (pack). If `priceIsMrp`: second line "MRP, incl. of all taxes". If `compareAtPrice`: struck-through after the price in `--muted` | always (pack part when `pack`) |
| 5 | BuyPanel | §5.4.1 | always |
| 6 | Delivery line | `--step-small`: "Delivered in an estimated 3–4 business days after dispatch (Sundays and holidays excluded). Shipping is calculated at checkout." | always (from `store-policies.ts`) |
| 7 | Facts | `FactsList` `<dl>`, 2 columns (term `--muted`, value `--ink`), alternating `--surface` rows, 48 px min row height. Rows in order, **only with a value**: Form · Use ("Internal" / "External only") · Pack · Reference · Prescription ("Required" / "Not required") · Returnable ("Yes, within 30 working days" / "No") · Shelf life ("{n} months") · Item code (SKU) · Country of origin ("India") | per row |
| 8 | Caution | `CautionNote`: filled `--store-caution-bg` block, padding 24 px, Geist `--step-body`. Line 1 = standard caution (§8.4); line 2 = `label.cautions` verbatim | line 1 always once M9 approves the text (until then render only line 2 when present); line 2 when present |
| 9 | How to take | h2 visually styled as h3 (Geist 600 `--step-body`) "How to take" → "Dosage: {label.dosage}" → `label.directions` | `label` |
| 10 | Composition | h3 "Composition" → basis line → `CompositionTable` (Name in `<i>` when binomial · Part · Amount; columns with no values in any row are omitted); first 8 rows, then `<details><summary>Show all {n}</summary>`. Source note `--step-small` `--muted`: "As printed on the label." or "As published by AVVVS." (`avvvs-blog`) | `label.composition.length > 0` |
| 11 | Indications | `<details>` summary "Indications as printed on the label" → text | `indications !== null` (§8.2) |
| 12 | Read the label | `LabelViewer` trigger: secondary `md` button "Read the label". For `status !== "approved"` this block moves up to position 9, with the 120 px label thumbnail beside it and the line "The full composition and directions are printed on the label." | `labelImage` |
| 13 | Delivery and returns | `PolicyDetails`: `<details>` "Delivery and returns" → 4 short paragraphs from `store-policies.ts` (§9.3); if `returnable === false`: "This item cannot be returned for a refund or exchange." first | always |
| 14 | Manufacturer | `--step-small` `--muted`: "Manufactured by {name}, {address}. Licence no. {licenceNo}." | `label.manufacturer` |

Draft rows render 1–8 (caution line 1 only), 12 (prominent), 13. No "coming soon" copy anywhere.

**Below the grid** (each a full-width section, `--section-gap` apart):

| Block | Spec | Renders when |
|---|---|---|
| Film plants | `FilmPlants`: h2 **Plants from the film**; one row per plate: 96 × 96 px plate image (`/plates/s02-{slug}-1024.webp`, `--surface` well, no multiply), common name Geist 500, binomial `<i>`, Sanskrit name, reference "Hort. Mal. XI, tab. 11" `--step-small` `--muted`, link "See all plants" → `/#plants` | `filmPlantSlugs.length > 0` |
| More of this form | `RelatedRow`: h2 "More {plural lower}" (e.g. "More thailams"), 4 cards (`ProductGrid` 4 / 2 / 2 columns) | ≥ 1 related item |
| Recently viewed | `RecentlyViewed exclude={handle}` | ≥ 1 entry after exclusion |
| Advice band | `AdviceBand medicine={name}` (WhatsApp prefilled with the medicine) | always |

#### 5.4.1 BuyPanel states (client, `src/components/store/BuyPanel.tsx`)

| State | Condition | Controls (top to bottom) |
|---|---|---|
| **Buy** | `purchasable` | `QuantityStepper` (three 48 px cells on `--surface`, `<input type="number" min=1 max=99>`, label "Quantity") → primary `lg` full width **"Add to cart"** (`aria-busy` → "Adding…"; on success opens the drawer) → secondary `lg` full width **"Ask a vaidyan before buying"** → `/consultation?medicine={handle}` → quiet link **"Ask on WhatsApp"** |
| **Gated** | `gate.kind === "consult"` | `--step-body` line **"This medicine is dispensed after a consultation."** → primary `lg` **"Book a consultation"** → `/consultation?medicine={handle}` → secondary `lg` **"Ask on WhatsApp"** |
| **Out of stock** | `!available` (and not gated) | `--step-body` **"Currently unavailable."** → primary `lg` **"Ask about availability on WhatsApp"** (text: "Hello, is {name} available? {url}") → quiet link "Ask a vaidyan before buying" |

WhatsApp href: `waHref(clinic.phones[whatsappPhoneIndex]) + "?text=" + encodeURIComponent("Hello, I have a question about {name}: {absolute PDP url}")`. Never any name, phone, email or order data in the URL.

The Add to cart button has `id="buy-primary"` (the sticky bar observes it). Errors from the cart store render under the button in `--error` `--step-small`: "Couldn't add to the cart. Try again."

#### 5.4.2 StickyBuyBar (client)

As store-revamp §4.6, with these values: fixed bottom, height 64 px + `env(safe-area-inset-bottom)`, `--bg` fill with `--shadow-float`; left 40 × 40 px `--photo-well` thumb (loader width 80), name (1 line, ellipsis) Geist 500 `--step-body`, pack `--step-small` `--muted`; right price Geist 500 tabular + primary `md` "Add to cart" (quantity 1, `source: "sticky"`). Shows when `#buy-primary` has scrolled **above** the viewport (`IntersectionObserver`, `threshold: 0`, `rootMargin: "0px 0px -64px 0px"`, visible = `!isIntersecting && boundingClientRect.top < 0`). Enter: `motion/react` `y: "100%" → 0`, 200 ms, ease `[0.16, 1, 0.3, 1]`; reduced motion: opacity 0 → 1, 0 ms. Hidden → `inert` + `aria-hidden`. While shown, `<main>` gets `padding-bottom: 64px`. Gated or out-of-stock: the button becomes secondary `md` "Ask a vaidyan" → `/consultation?medicine={handle}`.

#### 5.4.3 LabelViewer (client)

Zoom and pan logic lives in `src/components/ui/useZoomPan.ts` (shared with the film's `PlateInspect`, 04 §0.1 row): `useZoomPan({ maxScale: number }): { ref: RefObject<HTMLElement>; scale: number; zoomIn(): void; zoomOut(): void; reset(): void }`, step ×1.5 per button press, wheel `deltaY` → scale × `exp(−deltaY × 0.002)`, clamped to `[1, maxScale]`, pan clamped so the image edge never leaves the viewport edge, `reset()` on close. Native `<dialog>` opened with `showModal()`; `--bg` fill, `--shadow-float`, full viewport on phones, `min(92vw, 1100px) × min(92vh, 900px)` on desktop. Image at loader width `min(intrinsic, 2000)`. Zoom 1×–`maxScale` where `maxScale = max(1, min(3, intrinsicWidth / renderedWidth × 2))` (the 682 px labels allow little zoom; do not upscale beyond 2 image px per CSS px). Wheel, pinch (pointer events) and two buttons "Zoom in" / "Zoom out" (secondary `md`), drag to pan when zoomed, `transform: translate() scale()` only. "Close" quiet button top right, Esc closes, focus returns to the trigger. Alt: "Back label of {name}, showing composition and directions". Below the image, `--step-small` `--muted`: "Photograph of the printed label. If anything here differs from the pack you receive, the pack is correct." (TONE, NEEDS-AVVVS approval with M9.)

**PDP metadata:** title `{name} · {Form label}`; description `"{name}, {gloss lower if approved, else form label lower}{, pack if present}. Prepared by Arya Vaidya Vilasini Vaidya Sala, Kozhikode, since 1921. ₹{price}."`; `openGraph.images` = hero image at width 1200 (capped at intrinsic). **Never `body_html`.**
**PDP JSON-LD:** `Product` { `name`, `sku`, `image` (all image URLs), `description` (= meta description), `brand` { `@type: "Brand"`, `name: "AVVVS"` }, `manufacturer` { `@id`: organisation id from `src/lib/seo` }, `category` = form label, `offers` { `@type: "Offer"`, `price` (number string), `priceCurrency: "INR"`, `availability` InStock/OutOfStock, `url`, `itemCondition: NewCondition`, `seller` org id }, `additionalProperty` [`PropertyValue` for Form, Pack, Use] only when present }. No `aggregateRating`, no `review`. Plus `BreadcrumbList`.

**Dark:** gallery and thumbnails on light `--photo-well`; caution block on dark `--store-caution-bg`; LabelViewer dialog `--bg` dark, the label image sits on `--photo-well`.

**Acceptance — PDP**
1. `curl -s /products/dhanwantharam-thailam` contains: "Dhanwantharam Thailam", "₹270" (price from Shopify at test time), "Add to cart", "Ask a vaidyan before buying", "Delivered in an estimated 3–4 business days", "Read the label"; and contains **none** of "Paralysis", "Hernia", "Arthritis", "Pregnancy" (case-insensitive).
2. `grep -rn "descriptionHtml\|body_html\|dangerouslySetInnerHTML" src/app/products src/components/store` returns only the `<JsonLd>` script usage.
3. With a test sheet row `schedule_e1=yes` for one handle: its PDP, card, sticky bar and upsell have no "Add to cart"; the gated copy renders.
4. With an approved test row: facts rows render only for filled columns; composition shows 8 rows + "Show all {n}"; `nameMl` has `lang="ml"`.
5. Sticky bar: 375 × 812, scroll past `#buy-primary` → bar visible; scroll back → bar hidden and not focusable; with reduced motion it does not translate.
6. LabelViewer: opens on Enter/Space, traps focus, Esc closes, focus returns; zoom never exceeds `maxScale`.
7. Rich Results test: `Product` valid, no rating fields. Lighthouse mobile LCP ≤ 2.0 s; PDP HTML ≤ 90 KB; no three.js chunk requested.
8. axe: 0 serious/critical; inspector 0 FAIL in both themes at 390 / 768 / 1440.

### 5.5 Cart drawer (`src/components/store/CartDrawer.tsx`, client)

Keep the existing portal + focus-trap + `motion/react` mechanism (it works). Change durations to 01 tokens: panel `x: "100%" → 0` over **320 ms** `[0.16,1,0.3,1]`; overlay opacity over **200 ms**; reduced motion: opacity only, 120 ms.

| Part | Spec |
|---|---|
| Panel | right sheet, `width: min(440px, 100vw)`, `height: 100dvh`, `--bg`, `--shadow-float`; overlay `--overlay` |
| Header (64 px) | h2 "Cart" Boska 400 `--step-lead` + " ({totalQuantity})" Geist tabular; quiet "Close" button right (`data-autofocus`) |
| Lines | grid: 64 px `--photo-well` thumb (4:5) · name Geist 500 `--step-body` + pack `--step-small` `--muted` + quiet "Remove" · `QuantityStepper size={40}` · line total tabular right-aligned. 24 px between lines. Pending: stepper disabled. Error under the line: "Couldn't update. Try again." `--error` |
| Gated line (edge case) | a line whose medicine is no longer purchasable (policy flipped after it was added): `--store-caution-bg` block under the line "This medicine is now dispensed after a consultation. Remove it to check out." The checkout button is disabled while any such line exists |
| Footer (sticky, `--surface`, padding 24 px) | Subtotal: label Geist `--step-body`, amount Boska `--step-lead` tabular · `--step-small` `--muted` "Shipping and taxes are worked out at checkout." · `--step-small` `--muted` "Delivered in an estimated 3–4 business days after dispatch." · `CheckoutButton` primary `lg` full width **"Go to checkout"** · `--step-small` "You will pay on avvvsglobal.com, the AVVVS Shopify checkout." |
| Upsell | `CartUpsell` below the footer content, inside the scroll area: h3 "More {plural lower}" + up to 3 compact rows (thumb 48 px, name, price, secondary `md` "Add") (§6.9) |
| Help line | quiet link "Questions? Ask on WhatsApp" (prefill "Hello, I have a question about my order." — no order data) |
| Empty | "Your cart is empty." Boska `--step-lead` + secondary `md` "Browse medicines" → `/store` |

Purchasability of lines: on open, the drawer calls `getCardsAction(lineHandles)` once and flags lines whose card has `purchasable === false`.

**Acceptance — cart**
1. Esc closes; focus returns to `CartButton`; Tab stays inside.
2. Empty state shows exactly "Your cart is empty." and "Browse medicines".
3. Adding the same product twice increments one line; quantity 99 is the max.
4. Upsell never lists a product already in the cart, a gated product or an out-of-stock product; hidden at ≥ 5 distinct lines.
5. A forced-gated line disables "Go to checkout" and shows the caution.
6. No "free shipping", no countdown, no "only N left" anywhere (`check:claims` §8.3 covers the strings).

### 5.6 Checkout handoff (`CheckoutButton`, client)

- Renders `<a href={cart.checkoutUrl}>` (same tab), never a `<button>` that builds a URL later. Fallback mode: `cartPermalink(lines)` = `https://avvvsglobal.com/cart/{variant}:{qty},…`. Storefront mode: `cart.checkoutUrl`.
- On click: `track("begin_checkout", …)` (§11) then let the navigation proceed (no `preventDefault`). The tracker must use `navigator.sendBeacon` or a fire-and-forget call; it never delays navigation.
- `aria-disabled="true"` + `pointer-events: none` when `checkoutUrl` is null, when `pending > 0`, or when a gated line exists.
- No interstitial page. The copy line under the button (§5.5) is the disclosure that payment happens on Shopify.
- Fallback mode does **not** clear the local cart on click (the visitor may come back). Storefront mode: Shopify completes the cart; on next load `getCartAction()` returns null for a completed cart and the cookie is cleared (existing behaviour; verify in WP-R10).

**Acceptance — checkout**
1. Fallback: with 2 lines (qty 1 and 2) the href equals `https://avvvsglobal.com/cart/{v1}:1,{v2}:2`, and opening it shows those lines on Shopify.
2. Storefront (when M11 arrives): href equals the cart's `checkoutUrl`; the `avvvs_cart` cookie is `HttpOnly; Secure; SameSite=Lax`.
3. `begin_checkout` fires exactly once per click and navigation is not delayed (Performance panel: no long task before navigation).

---

## 6. Sales features

### 6.1 Chosen (launch)

| # | Feature | Data source | Spec |
|---|---|---|---|
| F1 | Shop by form | DER `form` | `FormIndex`, `/store/[collection]` |
| F2 | Phonetic and synonym search | DER + SHEET synonyms + glossary | §6.4 |
| F3 | Facets (form, collection, route, reference, in stock) | SH + SHEET | §5.3 |
| F4 | Signature band | `org.signatureProducts` | §5.1 |
| F5 | Quick add on cards | SH | §6.5 |
| F6 | Sticky buy bar | SH | §5.4.2 |
| F7 | "Ask a vaidyan before buying" + WhatsApp prefill | SITE | §5.4.1 |
| F8 | Recently viewed | visitor's own localStorage | §6.6 |
| F9 | "More {form}" related row | SHEET `related_handles` / DER | §6.8 |
| F10 | Same-form cart upsell | DER | §6.9 |
| F11 | Out-of-stock path to WhatsApp | SH + SITE | §5.4.1 |
| F12 | Exact delivery and returns summary on PDP and cart | POL | §9.3 |
| F13 | Label viewer (verified info now) | SH image | §5.4.3 |
| F14 | Film plants on PDP (ties the store to the film, verified only) | PLATE + composition | §3.7 |
| F15 | Advice band on every store page | SITE | §5.1 |
| F16 | Booking form prefill from `?medicine=` | SH name | §6.7 |
| F17 | Storefront API checkout (when the token arrives) | SH | §10 |

### 6.2 Rejected

| Feature | Reason |
|---|---|
| Reviews, star ratings, testimonials | None exist; inventing them is banned (brief rule 8); user statements of cure are objectionable advertising on the brand's page (store-revamp §4.9) |
| "Bestseller", "Most loved", "Trending" tags | No order data. A claim with no basis (CCPA misleading-ads guidelines) |
| Shop by concern / body system | A page grouping medicines under a condition advertises them for it; most groupings are on the DMR Schedule (store-revamp §4.2). Deferred to counsel (M2) |
| Searching indications text | "knee pain" returning medicines = recommending drugs for a condition |
| Free-shipping bar or threshold | The policy states none (store-revamp §4.5). Add only when `store-policies.ts` gains a sourced `freeShippingFrom` |
| Subscriptions / auto-reorder | Physician-directed dosing; a cadence implies dosing advice; needs an app (store-revamp §4.13) |
| Bundles / "frequently bought together" / regimens | No order data; a regimen is a prescription |
| Points, coupons, EMI, countdowns, "only N left", exit popups | No programme exists; urgency is a dark pattern (CCPA 2023 dark-pattern guidelines) and wrong for medicines |
| Pincode delivery checker | No delivery API; the policy gives only a flat estimate |
| Live chat / AI chat widget | No staffed channel known (M3); an AI answering medicine questions is dosing advice |
| Wishlist / accounts | No account system; recently viewed covers the repeat-purchase need without data collection |
| Back-in-stock email capture | No notification system (M10); WhatsApp covers it |
| 3D product viewer on PDP | Only allowed with real packaging scans (01 §2.11); v1 bottle is invented packaging |
| "Compare" tool | Comparing medicines invites comparing indications |

### 6.3 Card anatomy — `ProductCard` (server) + `QuickAddButton` (client)

```
<li class="card">
  <a href="/products/{handle}" class="cardLink">    ← image well + name are inside; ::after stretches over the card
    [well 4:5 --photo-well; hero img contain, inset 8%; hover img stacked, opacity 0 → 1 over 200 ms on :hover/:focus-visible]
    <h3 class="name">{name}</h3>                     ← Geist 500 --step-body, 2-line clamp
  </a>
  <p class="meta">{formLabel}{, packLabel}</p>       ← --step-small --muted
  <p class="price">₹{price} [<s>compareAt</s>]</p>    ← Geist 500 tabular
  {purchasable ? <QuickAddButton/> : <p class="muted">{available ? "Ask a vaidyan" link : "Out of stock"}</p>}
</li>
```
`QuickAddButton`: secondary `md`, full card width, text "Add to cart", `aria-label="Add {name} to cart"`, `position: relative; z-index: 1` above the stretched link. On success opens the drawer. Gated + available: a quiet link "Ask a vaidyan" → `/consultation?medicine={handle}` in place of the button.
Props: `ProductCard { item: MedicineCard; priority?: boolean; sizes?: string; headingLevel?: 2 | 3 }`. Default `sizes="(min-width:75rem) 25vw, (min-width:48rem) 33vw, 50vw"`. First 4 cards of a grid get `priority`.

### 6.4 Search — `src/lib/medicines/phonetic.ts`, `glossary.ts`, `query.ts`

`phoneticKey(word)`:
1. lower-case, NFKD, strip combining marks; keep `a-z`, U+0D00–U+0D7F, U+0900–U+097F; everything else is a separator.
2. Latin only, in this order: `zh→l`, `ksh→ks`, `sh→s`, `ch→c`, `th→t`, `dh→d`, `bh→b`, `gh→g`, `kh→k`, `ph→p`, `w→v`, `aa→a`, `ee→i`, `oo→u`, `ou→u`, `y$→i`.
3. collapse repeats `/(.)\1+/g → "$1"`.
4. drop a trailing `m` after a vowel `/([aeiou])m$/ → "$1"`.

Index per medicine (`searchKeys`, phonetic keys of each token): `name`, `shopifyTitle`, `synonyms`, form label, gloss (if approved), SKU (exact, not phonetic), `label.nameMl`, `label.nameHi`, composition names (approved rows and CAT blog lists). **Never** indications, `body_html`, CAT `indications`.

Glossary (query-side expansion, `glossary.ts`): `oil→thailam`, `ghee→ghritham`, `decoction→kashayam`, `powder→choornam`, `caps|capsule→capsule`, `syrup→syrup`, `jam|confection→lehyam`, `churna|churnam|choorna→choornam`, `taila|tailam→thailam`, `kwath|kwatha→` (no expansion; intentionally unmatched).

Matching: query tokens ≥ 2 letters after keying. A token matches a key when one is a prefix of the other **and the shorter is ≥ 3 chars**, or Levenshtein ≤ `Math.floor(longer.length / 5)`. Every query token must match some key. Relevance score: +3 name-key prefix match on the first token, +2 any name-key match, +1 other keys; ties by name.

Tests — `src/lib/medicines/phonetic.test.ts` (`node --test src/lib/medicines/*.test.ts`, relative `.ts` imports, no Next imports), run over `catalogue.generated.json` merged with an empty sheet:

| Query | Must include | Must exclude |
|---|---|---|
| `aswagandha` | `aswaganda-cap`, `aswagandha-choornam`, `aswagandharishtam` | — (note: `balaswagandhadi-thailam` may appear; it must rank below the three) |
| `dhanvantari taila` | `dhanwantharam-thailam` | |
| `churnam` | every `form=choornam` handle | |
| `rasnadi kwath` | — (0 results, zero state renders) | everything |
| `kulambu` | `dhanwantharam-kuzhambu` | |
| `ghee` | every `form=ghritham` handle | |
| `paralysis` | — (0 results) | everything |
| `knee pain` | — (0 results) | everything |

(Where store-revamp said `balaswagandhadi-thailam` must be excluded: prefix matching on "aswagandha" inside a compound title cannot be excluded without breaking "bala" compounds; ranking below is the testable rule.)

### 6.5 Quick add
Only when `purchasable`. Calls `useCart().add({ variantId, quantity: 1, handle, title: name, variantTitle: "Default Title", price, image: heroImage })` and `open()`; fires `add_to_cart` with `source: "card"`. Tab order per card: link, then button (2 stops).

### 6.6 Recently viewed
`src/components/store/recently-viewed.ts`: key `avvvs-recent-v1`, array of handles, max 8, most recent first, de-duplicated, every access in try/catch. `RecentlyViewedWriter` (client, renders null) writes on PDP mount. `RecentlyViewed` (client) reads, calls `getCardsAction`, renders a compact horizontal row: 72 px `--photo-well` thumb, name, price; each item one link; `overflow-x: auto` with scroll-snap; no quick add here. Store home: shows when ≥ 2 entries. PDP: excludes the current handle, shows when ≥ 1 remains. Renders nothing during SSR (no layout shift: the section is absent until data arrives and is placed below all server content on the PDP, and between form index and links on the store home with `min-height: 0`).

### 6.7 Booking prefill
`/consultation?medicine={handle}`: the route stays static (04 route table: "reads `?medicine=` client-side only"). `BookingForm` (already a client island) reads `useSearchParams().get("medicine")` inside the existing `<Suspense>` boundary (add one around the form in `src/app/consultation/page.tsx` if absent: `useSearchParams` in a prerendered route needs it), checks it against `/^[a-z0-9-]{1,120}$/`, then calls `getCardsAction([handle])` once. If a card comes back, the message field defaults to "Question about {name} before buying." (only if the visitor has not typed in it yet) and a `--step-small` line above the form reads "About: {name}" with a link to `/products/{handle}`. Unknown or invalid handle: ignored, no error shown. The form still sends through the existing SMTP action; success only after the server returns ok (CLAUDE.md).

### 6.8 Related ("More {form}")
`relatedHandles` from the sheet if set (max 4, purchasable or available first); else DER: same `form`, `available`, not this handle, sorted by name, first 4. If Storefront mode is on, `getRecommendations(handle)` results filtered to `available` and same form are placed first, then the DER fill (store-revamp §4.12.5). Heading never says "customers also bought".

### 6.9 Cart upsell
`getUpsellAction(cartHandles)`: take the form of the **last** handle in the list (the most recently added line); return up to 3 medicines of that form that are `purchasable`, not in `cartHandles`, sorted by name. Hidden when the cart is empty or has ≥ 5 distinct lines. `add_to_cart` `source: "upsell"`.

---

## 7. Component list with props

All under `src/components/store/` unless noted. (S) = Server Component, (C) = `"use client"`. Each component has a sibling `*.module.css`. Delete after replacement: `LedgerTable.*`, `CatalogueSkeleton.tsx` (replaced by `ResultsSkeleton`), `Catalogue.tsx` / `CatalogueControls.tsx` (replaced by `ProductGrid`, `BrowseBar`, `FilterPanel`, `SortLinks`), `catalogue-query.ts` (replaced by `src/lib/medicines/query.ts`), the 3D branch of `ProductGallery`.

| Component | Kind | Props | Notes |
|---|---|---|---|
| `StoreHead` | S | `{ title: string; lead: ReactNode; titleSize: "display" \| "head"; search?: ReactNode }` | h1 + lead + optional search slot |
| `StoreSearchField` | S | `{ id: string; size: "md" \| "lg"; defaultValue?: string; preset?: Partial<StoreQuery> }` | `<form role="search" action="/store/search" method="get">`, hidden inputs for `preset`; `<input type="search" name="q" maxLength={80}>` + secondary button "Search" |
| `SignatureBand` | S | `{ items: MedicineCard[] }` | weights `[5,2,3,2,2,2]` const; skip if `items.length < 3` |
| `FormIndex` | S | `{ forms: FormSummary[]; variant: "full" \| "compact"; headingLevel?: 2 }` | full = thumbs + counts; compact = one line each |
| `StoreIndexLinks` | S | `{ total: number; proprietary: number }` | |
| `AdviceBand` | S | `{ medicineName?: string; pdpUrl?: string }` | `--field-clinic`; copy §5.1 |
| `Breadcrumbs` | S | `{ items: { label: string; href?: string }[] }` | existing, restyled; slash separators as text |
| `BrowseBar` | S | `{ form: FormId \| "proprietary"; count: number }` | links into `/store/search` |
| `ProductGrid` | S | `{ items: MedicineCard[]; columns?: { phone: 2; tablet: 3; desktop: 3 \| 4 }; priorityCount?: number; headingLevel?: 2 \| 3 }` | `<ul>` grid |
| `ProductCard` | S | `{ item: MedicineCard; priority?: boolean; sizes?: string; headingLevel?: 2 \| 3 }` | §6.3 |
| `QuickAddButton` | C | `{ item: MedicineCard }` | |
| `SearchResults` | S | `{ searchParams: Promise<Record<string, string \| string[] \| undefined>> }` | the only `searchParams` reader |
| `ResultsSkeleton` | S | `{ count?: number }` | 8 static blocks |
| `FilterPanel` | S | `{ query: StoreQuery; facets: FacetCounts }` | §5.3 |
| `ActiveFilters` | S | `{ query: StoreQuery }` | quiet buttons as links |
| `SortLinks` | S | `{ query: StoreQuery; basePath?: string }` | `aria-current` on active |
| `Pagination` | S | `{ query: StoreQuery; pageCount: number }` | `<nav aria-label="Pagination">` |
| `ZeroResults` | S | `{ q: string; forms: FormSummary[] }` | |
| `ProductGallery` | C | `{ images: ProductImage[]; name: string; labelIndex: number \| null }` | thumbnails as buttons |
| `LabelViewer` | C | `{ image: ProductImage; name: string; prominent?: boolean }` | §5.4.3; uses `useZoomPan` |
| `useZoomPan` | hook (`src/components/ui/useZoomPan.ts`) | `{ maxScale: number }` → `{ ref; scale; zoomIn; zoomOut; reset }` | shared with the film's `PlateInspect` (04) |
| `PriceLine` | S | `{ price: Money; compareAt: Money \| null; pack: Pack \| null; isMrp: boolean; size: "lead" \| "body" }` | |
| `BuyPanel` | C | `{ item: MedicineCard; gate: Gate; available: boolean; consultHref: string; whatsappHref: string; whatsappAvailabilityHref: string }` | §5.4.1; `id="buy-primary"` |
| `QuantityStepper` | C | `{ value: number; onChange(n: number): void; min?: 1; max?: 99; size?: 48 \| 40; label: string; disabled?: boolean }` | existing, restyled |
| `StickyBuyBar` | C | `{ item: MedicineCard; gated: boolean; consultHref: string; targetId?: "buy-primary" }` | §5.4.2 |
| `DeliveryLine` | S | `{}` | reads `store-policies.ts` |
| `FactsList` | S | `{ facts: { term: string; value: ReactNode }[] }` | filters empty values |
| `CautionNote` | S | `{ extra: string \| null }` | standard line gated by `STANDARD_CAUTION_APPROVED` |
| `HowToTake` | S | `{ dosage: string; directions: string \| null }` | |
| `CompositionTable` | S | `{ basis: string \| null; rows: CompositionRow[]; source: "label" \| "avvvs-blog" }` | |
| `IndicationsDisclosure` | S | `{ text: string }` | |
| `PolicyDetails` | S | `{ returnable: boolean }` | |
| `ManufacturerNote` | S | `{ manufacturer: NonNullable<LabelFacts["manufacturer"]> }` | |
| `FilmPlants` | S | `{ slugs: string[] }` | reads `plates.ts` |
| `RelatedRow` | S | `{ title: string; items: MedicineCard[] }` | |
| `RecentlyViewed` | C | `{ exclude?: string; minItems: 1 \| 2 }` | |
| `RecentlyViewedWriter` | C | `{ handle: string }` | returns null |
| `ProductAnalytics` | C | `{ item: AnalyticsItem }` | fires `view_item` once |
| `CartButton` / `CartButtonClient` | S/C | existing | restyle: "Cart" + round badge |
| `CartDrawer` | C | existing `{ onClose(): void }` | §5.5 |
| `CartUpsell` | C | `{ handles: string[] }` | |
| `CheckoutButton` | C | `{ href: string \| null; disabled: boolean; items: AnalyticsItem[]; value: number }` | §5.6 |
| `WhatsAppLink` | S | `{ text: string; label: string; variant: "quiet" \| "secondary" \| "primary" }` (`src/components/ui/`) | builds the href with `whatsappPhoneIndex` |

---

## 8. Compliant copy rules for claims

### 8.1 The law in one table (detail and sources: store-revamp §5.1)

| Instrument | Effect on store copy |
|---|---|
| Drugs and Magic Remedies (Objectionable Advertisements) Act 1954, s.2(a), s.3, s.4, Schedule | A product page is an advertisement. No suggestion of use for the 54 Schedule conditions, contraception/miscarriage, sexual capacity, or menstrual correction. No false or misleading drug claims. |
| Drugs and Cosmetics Rules: Rule 161(2) | Internal ASU medicines with Schedule E(1) ingredients carry "Caution: To be taken under medical supervision" — reproduce verbatim when the label has it |
| Rule 170 | Omitted (July 2024; SC stay vacated Aug 2025). DMR Act still applies |
| CCPA advisory, 14 July 2022 | E(1) medicines online only with a prescription upload → our consult gate (§3.6) |
| CCPA misleading-ads guidelines 2022; dark-patterns guidelines 2023 | Substantiation for any health claim; no false urgency, basket sneaking, or disguised ads |
| ASCI code + AYUSH monitoring | "100% natural/Ayurvedic", "no side effects" found unsubstantiated; COVID claims banned |
| Consumer Protection (E-Commerce) Rules 2020; Legal Metrology (Packaged Commodities) Rules 2011, r.6(10) | Seller disclosures: manufacturer, net quantity, MRP, country of origin, consumer care. **Counsel to confirm** which declarations the PDP must show (M14) |

### 8.2 When indications may render (all must hold)
1. `INDICATIONS_ENABLED === true` in `policy.ts` (default `false`; flip only after M2).
2. Sheet row `status=approved` and `indications_display=show`.
3. `indications_label` non-empty and `findClaims(indications_label)` returns `[]`.
4. Rendered only inside the collapsed `<details>` "Indications as printed on the label", in `--step-body` text — never in headings, cards, meta, JSON-LD, search index, `llms.txt`, Open Graph or analytics.

### 8.3 Banned phrases (enforced by `npm run check:claims`)

The tripwire scans: every string literal in `src/app/store/**`, `src/app/products/**`, `src/components/store/**`, `src/content/store-policies.ts`, `src/content/medicines/sheet.generated.json` (`display_name`, `synonyms`, and C-group text of rows shown), plus `src/content/film.ts` and `src/content/plates.ts` (01 §4.1). Case-insensitive; word boundaries where shown.

**A. Disease and condition terms (DMR Schedule + common synonyms)** — banned on every store surface regardless of construction:
`paralys|hemipleg|quadripleg|facial palsy|palsy` · `diabet|blood sugar|sugar control` · `obes|weight loss|fat burn|slimming` · `\bfever|typhoid` · `heart|cardiac|cholesterol` · `blood pressure|hypertens|hypotens` · `epilep|\bfits\b|seizure|convulsion` · `cancer|tumou?r|malignan|\bgrowths?\b` · `kidney stone|gall ?stone|calculi|bladder stone` · `hernia|rupture|hydrocele` · `tuberculos|\bTB\b|pleurisy|pneumonia` · `leucoderma|vitiligo|leprosy|lupus` · `rheumat|arthrit|gout` · `asthma` (not on the Schedule; disease-specific, basis `CCPA`) · `ulcer` · `cataract|glaucoma|trachoma|blindness|deafness` · `goitre|thyroid` · `insanity|hysteria|nervous debility|neurolog|nervous system` · `prostat` · `dropsy|oedema|edema` · `gangrene|appendicitis|arteriosclerosis|blood poisoning|bright'?s disease|lockjaw|locomotor ataxia|plague|smallpox` · `venereal|\bSTD\b|\bSTI\b` · `stature|height increase|bust|breast (size|enlarg)` · `hepatitis|cirrhosis|jaundice|liver disease` · `piles|haemorrhoid|hemorrhoid`
**B. DMR s.3(a)–(c)**: `contracept|miscarriage|abortion|conceive|pregnan` · `impoten|erectile|premature ejaculation|libido|sexual|stamina|vigou?r|virility|aphrodisiac|performance enhanc` · `menstru|menorrh|dysmenorrh|metrorrh|\bperiods?\b|PCOS|PCOD|infertil|sterility|fertility`
**C. Cure and absolute language**: `\bcures?\b|\bcured\b|curing|heal(s|ing|ed)?\b|\btreats?\b|treatment for|remed(y|ies) for|relie(f|ves?)\b|permanent|guarantee|100\s?%|miracle|magic|instant|no side[- ]effects?|side[- ]effect free|completely safe|safe for (all|everyone)|clinically (proven|tested)|scientifically proven|doctor[- ]recommended|recommended by doctors|proven results?`
**D. Immunity and infection**: `immun|covid|corona|virus|viral|anti-?bacterial|protect(s|ion)? against|infection`
**E. Wellness and purity puffery**: `100% natural|all[- ]natural|pure herbal|chemical[- ]free|toxin|detox|anti-?ageing|anti-?aging|rejuvenat|boost|superfood|organic` (unless certified; none is) · `FDA|AYUSH[- ](approved|certified)|WHO[- ](approved|certified)|ISO[- ]certified` (no certificate on file; only the exact 01 wording "GMP-certified factory" is allowed)
**F. Sales pressure and fabricated proof**: `best[- ]?sell|bestseller|most loved|trending|top rated|\bstars?\b|reviews?|testimonial|trusted by|customers love|only \d+ left|limited stock|hurry|last chance|ends (soon|today)|today only|free shipping|free delivery|\bsale\b|% off|discount|500k\+?|lakh customers`
**G. Constructions** (disallowed with any noun): `\b(for|helps?( with| in)?|supports?|manages?|prevents?|useful in|indicated (in|for)|good for|works on|fights?)\s+[a-z]+` applied **only to store marketing strings**: literals in `src/app/store/**`, `src/app/products/**`, `src/components/store/**` and `src/content/store-policies.ts`. It is **not** applied to `src/content/film.ts` / `plates.ts` (01's verified lines "leaves we use for Elakizhi", "an oil used for Abhyanga", "roasted for the Podikizhi poultice" name clinic therapies, not conditions; Groups A–F and H still scan those files), nor to the facts labels, nor to `dosage_label` / `directions_label` (verbatim label text checked by AVVVS). Allow-list exceptions in `claims.ts` (`ALLOW`, matched as exact substrings and removed before testing): `"Ask a vaidyan before buying"`, `"Ask about availability"`, `"for a refund or exchange"`, `"for external use only"`, `"for the internal use only"`, `"right for you"`, `"for {name}"` is never used in templates (write "about {name}").

**Product names.** Medicine names come from Shopify titles (or `display_name`) and are scanned too, with Groups A–F. One live title hits today: `relieve-o` → "RELIEVE O CAPSULE" matches Group C `relie(f|ves?)`. It is a registered product name, so `claims.ts` exports `NAME_EXEMPT_HANDLES = ["relieve-o"] as const` (each entry with a comment `// NEEDS-AVVVS counsel (M16)`); the exemption covers only the name itself on that product's own card, PDP, cart line and breadcrumbs. Any new hit fails the build and is added only after counsel review.
**H. House banned words (01 §4.1)**: `journey|unlock|holistic|wellness journey|curated|artisanal|elevate|seamless|transform|ancient secrets|discover|magic|experience (the|our|ayurveda)` · `!` in UI strings · emoji (`\p{Extended_Pictographic}`)

`src/lib/medicines/claims.ts` exports `CLAIM_PATTERNS: { id: string; group: "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"; re: RegExp; basis: "DMR-schedule"|"DMR-s3"|"CCPA"|"ASCI"|"AYUSH-COVID"|"LegalMetrology"|"house" }[]`, `ALLOW: string[]` and `findClaims(text: string): { id: string; match: string }[]`. `scripts/check-claims.ts` extracts string literals and JSX text with a regex-based extractor (string/template literals and text between `>` and `<`), runs `findClaims`, prints `file:line  [id]  "match"` and exits 1 on any hit. `package.json`: `"check:claims": "node scripts/check-claims.ts"`.

Allowed statements (factual, from labels or `site.ts`): name, form, pack, price, "MRP, incl. of all taxes" (M5), composition as printed, "Dosage: As directed by the physician", "For external use only", "Reference: Ashtanga Hridayam", manufacturer, shelf life, "Arya Vaidya Vilasini Vaidya Sala has prepared Ayurveda medicines in Kozhikode since 1921", "Ask a vaidyan whether this medicine is right for you."

### 8.4 Standard caution (every PDP)
"Ayurveda medicines should be taken under the guidance of a qualified vaidyan. Dosage: as directed by the physician." — 01 §4.4; renders only when `STANDARD_CAUTION_APPROVED` (M9). No pregnancy, child-dose or interaction statements unless printed on the label.

### 8.5 Copy templates (use these exact patterns)

| Surface | Template | Example |
|---|---|---|
| Card meta | `{formLabel}{", " + packLabel}` | "Thailam, 200 ml" |
| PDP price line | `₹{price} · {pack}` | "₹270 · 200 ml" |
| Meta description (PDP) | §5.4 | "Dhanwantharam Thailam, thailam. Prepared by Arya Vaidya Vilasini Vaidya Sala, Kozhikode, since 1921. ₹270." |
| Collection lead | `{count} {plural lower}, prepared by Arya Vaidya Vilasini Vaidya Sala.` | "23 thailams, prepared by Arya Vaidya Vilasini Vaidya Sala." |
| WhatsApp prefill | `Hello, I have a question about {name}: {url}` | — |
| Gated | `This medicine is dispensed after a consultation.` | — |
| Out of stock | `Currently unavailable.` | — |
| Add success (live region) | `{name} added to the cart.` | — |

Money: `formatMoney()` → "₹1,250" (no decimals when `.00`; verify `formatMoney` output, adjust only if it prints decimals). Spelling: British/Indian.

**Acceptance — copy**
1. `npm run check:claims` exits 0 on the shipped tree.
2. Adding the literal `"Helps with knee pain and diabetes"` to any `src/components/store/*.tsx` makes it exit 1 naming that file (fixture in `claims.test.ts`).
3. `rg -i "journey|unlock|holistic|curated|artisanal|elevate|seamless" src/` returns nothing.
4. `claims.test.ts` fixtures: "Relieve O Capsule" as the name of `relieve-o` passes; the same string in a store UI literal fails; "One of three leaves we use for Elakizhi." in `film.ts` passes (Group G not applied); "Supports joint health" in `store-policies.ts` fails (Group G).

---

## 9. Content files

### 9.1 `src/content/store-merch.ts`
```ts
/** VERIFIED: org.signatureProducts; order from docs/plan/01-creative-direction.md §4.4. */
export const SIGNATURE_HANDLES = ["mezhuthailam", "rujanth-linment", "rujanth-capsule", "lakshol", "slepan-capsule", "red-irons-capsule"] as const;
export const SIGNATURE_WEIGHTS = [5, 2, 3, 2, 2, 2] as const;
```

### 9.2 `src/lib/site.ts` addition
`export const whatsappPhoneIndex = 0; // UNVERIFIED (docs/plan/05 M3): which clinic number has WhatsApp` — `policy.ts` re-exports it.

### 9.3 `src/content/store-policies.ts`
```ts
export const policies = {
  fetchedOn: "2026-11-04",
  shipping: {
    sourceUrl: "https://avvvsglobal.com/pages/shipping",
    pdpLine: "Delivered in an estimated 3–4 business days after dispatch (Sundays and holidays excluded). Shipping is calculated at checkout.",
    cartLine: "Delivered in an estimated 3–4 business days after dispatch.",
    detail: "Delivery times can vary slightly from state to state, and delays outside our control can happen.",
  },
  returns: {
    sourceUrl: "https://avvvsglobal.com/pages/return-policy",
    refund: "If an item arrives damaged, defective, past its expiry date, or is missing, you get a full refund. Email damaged@avvvsglobal.com or missing@avvvsglobal.com with your order ID as the subject and a photo.",
    window: "Unopened, unused items can be returned within 30 working days of receipt. A 20% restocking charge applies.",
    timing: "Refunds to card or net banking take 7–10 working days. Cash-on-delivery refunds can take up to 3 weeks.",
    notReturnable: "This item cannot be returned for a refund or exchange.",
  },
  cartFooter: "Shipping and taxes are worked out at checkout.",
} as const;
```
VERIFIED paraphrase of the two policy pages (store-revamp §3.5). Do **not** add a free-shipping threshold, charges, COD availability or international terms (M4). The restocking-charge waiver for a changed prescription is left out of the short form because it needs AVVVS verification wording; it stays on the linked policy page — add a "Full policy" link (`returns.sourceUrl`) at the end of `PolicyDetails`.

---

## 10. Shopify Storefront API upgrade path

| Phase | Trigger | Work | Verify |
|---|---|---|---|
| **P0 (now)** | — | Public JSON adapter, localStorage cart `avvvs-cart-v1`, cart-permalink checkout | §5.6 acceptance 1 |
| **P1 switch-over** | M11: AVVVS installs the **Headless** sales channel in Shopify admin and creates a public Storefront access token | `.env.local` / host env: `SHOPIFY_STORE_DOMAIN=avvvsglobal.myshopify.com` (exact domain from M11), `SHOPIFY_STOREFRONT_TOKEN=…`, `SHOPIFY_API_VERSION=2026-10`. Scopes: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_read_product_tags`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`. Token read only from `process.env` in server code; never `NEXT_PUBLIC_`, never logged. | 1. `shopMode()` = `storefront`. 2. Add to cart sets `avvvs_cart` (HttpOnly). 3. Checkout href = `cart.checkoutUrl`. 4. Existing localStorage cart migrated once (below). 5. Recommendations feed §6.8. |
| P1 code | same WP | (a) `initCart("storefront")`: if `avvvs-cart-v1` has lines, call `addToCartAction` for each (sequentially), then `localStorage.removeItem`; on any failure keep the key and show the drawer error. (b) `cartCreate` input adds `buyerIdentity: { countryCode: IN }` (delivery is India-only per policy). (c) Product and cart queries add `@inContext(country: IN, language: EN)`. (d) Do **not** request or render `quantityAvailable` (no "only N left"). | With the token unset everything behaves exactly as P0 (`npm run build` and the §5 acceptance pass in both modes). |
| P1 webhooks | after P1 | Shopify admin → Notifications → Webhooks: `products/create`, `products/update`, `products/delete`, `collections/update` → `https://{site}/api/shopify/revalidate`, same API version. Env `SHOPIFY_WEBHOOK_SECRET`. The route already verifies HMAC and revalidates `products` / `product:{handle}`; **add `revalidateTag("medicines")`** alongside. | Shopify "Send test notification" → 200; a price change appears on the PDP within one request after the webhook. |
| **P2 metafields (optional, after launch)** | AVVVS prefers editing medical fields in Shopify admin over the TSV | Create product metafield definitions in namespace `avvvs` with **Storefront access** enabled, one per sheet column (`avvvs.status` single-line text, `avvvs.composition` multi-line text using the same ` | ` / ` ; ` format, `avvvs.schedule_e1` single-line with choices, etc.). Add `metafields(identifiers: [...])` to the `ProductFields` fragment. Add `MEDICINE_SOURCE=sheet|metafields` env (default `sheet`); `mergeMedicine` reads rows from whichever is set, never both. The same zod schema validates both. | Switching the env between `sheet` and `metafields` with identical data yields identical PDP HTML (snapshot test). |
| P3 API version bumps | Each Shopify quarterly release | Bump `SHOPIFY_API_VERSION`, run `npm run build`, check the Shopify changelog for removed fields in `ProductFields` / `CartFields`. Shopify supports each version ≥ 12 months. | Build + §5 acceptance |

Out of scope: customer accounts, Shopify Checkout Kit, checkout UI extensions, prescription upload (needs a Shopify app; the consult gate is the route).

---

## 11. Analytics events

### 11.1 Module — `src/lib/analytics/track.ts` (client-safe, no dependencies)

```ts
export type AnalyticsItem = {
  item_id: string;        // SKU, else handle
  item_name: string;      // Medicine.name
  item_category: string;  // form label, e.g. "Thailam"
  item_variant?: string;  // pack label, e.g. "200 ml"
  price: number;          // unit price, rupees
  quantity: number;
};
type EventMap = {
  view_item:      { currency: "INR"; value: number; items: [AnalyticsItem] };
  add_to_cart:    { currency: "INR"; value: number; items: [AnalyticsItem]; source: "pdp" | "sticky" | "card" | "upsell" };
  begin_checkout: { currency: "INR"; value: number; items: AnalyticsItem[]; mode: "permalink" | "storefront" };
};
export function track<K extends keyof EventMap>(name: K, params: EventMap[K]): void;
```
Behaviour, in order, all wrapped in try/catch, never throwing, never awaiting:
1. If `process.env.NODE_ENV !== "production"`: `console.debug("[track]", name, params)`.
2. If `window.plausible` is a function: `window.plausible(name, { props: { item_id, item_category, value, source? } })` (first item only; Plausible props are flat).
3. If `Array.isArray(window.dataLayer)`: push `{ ecommerce: null }` then `{ event: name, ecommerce: params }` (GA4 recommended-event shape).
4. Otherwise do nothing.
No provider script is added by this plan; whichever provider AVVVS picks (M13) is loaded by a separate, consented WP.

### 11.2 Triggers

| Event | Fired by | When | Once? |
|---|---|---|---|
| `view_item` | `ProductAnalytics` on the PDP | first client mount for that handle (effect with a `useRef` guard; React Strict Mode double-mount must not double-fire) | once per page view |
| `add_to_cart` | `BuyPanel`, `StickyBuyBar`, `QuickAddButton`, `CartUpsell` | after `add()` resolves without error (fallback mode: right after the local add; storefront: after the server action returns ok) | per successful add |
| `begin_checkout` | `CheckoutButton` | `onClick`, before navigation proceeds | per click |

`value` = `price × quantity` (sum over items for checkout). Purchase/`purchase` events happen on Shopify's checkout and are out of scope.

### 11.3 Privacy note (put this text, shortened, on the privacy page when a provider is chosen)
- The site sets **no cookies** for analytics and stores nothing about the visitor except the cart (`avvvs-cart-v1`, or the httpOnly `avvvs_cart` id) and recently viewed handles (`avvvs-recent-v1`) in their own browser.
- Events carry **no personal data**: no name, phone, email, address, IP-derived identifier set by us, user id, or hashed identifier. No event is sent from the booking form.
- **Search queries are never sent** to analytics (people type symptoms into search). No `search` event exists.
- Product views of medicines can imply a health condition, so: analytics stays aggregate-only, no user-level export, no ad-network integrations (no Meta Pixel, no Google Ads remarketing) and no session replay.
- If AVVVS chooses a cookie-setting provider (e.g. GA4), it loads only after explicit opt-in consent (India's DPDP Act 2023 and its Rules; counsel to confirm), and the consent banner offers "Decline" with equal prominence. A cookieless provider (Plausible-type) is recommended.
- Shopify's checkout runs its own analytics and consent under Shopify's privacy policy; the site links to it from the checkout disclosure line.

**Acceptance — analytics**
1. With `window.dataLayer = []` set in DevTools: PDP load pushes exactly one `view_item`; Add to cart pushes one `add_to_cart` with `source: "pdp"`; Go to checkout pushes one `begin_checkout` and navigation proceeds.
2. `rg "track\(\"search\"|q:|query" src/lib/analytics` returns nothing; no event payload contains a key other than those in `EventMap`.
3. With neither provider present, no errors and no network requests are made by `track()`.

---

## 12. Global acceptance for the store

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run check:claims`, `node --test src/lib/medicines/*.test.ts` pass.
- [ ] `next build` lists `/store`, every `/store/[collection]` and every `/products/[handle]` as prerendered; `/store/search` as partially prerendered (static shell).
- [ ] `rg "#[0-9a-fA-F]{3,8}\b" src/components/store src/app/store src/app/products --glob '!*.md'` returns nothing.
- [ ] No `text-transform: uppercase`, `border:` with a visible width, `backdrop-filter`, `linear-gradient`, `border-radius` other than `0`/`999px` in store CSS modules.
- [ ] axe 0 serious/critical and taste-skill inspector 0 FAIL on `/store`, `/store/thailam`, `/store/search?q=thailam`, `/products/dhanwantharam-thailam`, cart open — light and dark, 390 / 768 / 1440 px.
- [ ] No horizontal page scroll at 375 px on any store page.
- [ ] `http://localhost:3000/store` and `/products/dhanwantharam-thailam` render in the dev server.

---

## 13. Work packages (Sonnet 5.5, medium effort, one at a time)

Prerequisite for R5–R9 (visual): the design-system WP from 01 §3 is done (tokens.css v2, Boska + Geist, `Button`, `ThemeToggle`). R1–R4 do not need it. Each WP ends with §12's first and last checkboxes plus its own acceptance. Read `node_modules/next/dist/docs/` before any Next API not already used in this repo.

| WP | Scope | Files | Acceptance |
|---|---|---|---|
| **R1 Medicine layer** | Types, forms, sheet schema + build script, seed script, merge, `getMedicines` / `getMedicine` / `getFormSummaries` / `getSignatureCards`, `policy.ts`, `store-merch.ts`, `store-policies.ts`, `whatsappPhoneIndex` | `src/lib/medicines/{types,forms,sheet-schema,merge,index,policy,actions}.ts`, `scripts/{build-medicine-sheet,seed-medicine-sheet}.mjs`, `src/content/medicines/sheet.tsv` (header only), `docs/data/medicine-sheet-template.tsv`, `src/content/{store-merch,store-policies}.ts`, `src/lib/site.ts`, `package.json` | `forms.test.ts`: all 165 products derive a form; `other` only for PROPRIETARY-type products matching no title rule (listed by handle in the test output). `merge.test.ts`: a draft row exposes `label === null`, `indications === null`; a sheet row with an unknown handle makes `medicines:build` exit 1 naming the handle; `schedule_e1=yes` on a draft row still gates. Seed template has 165 rows and 33 columns and no indications text. |
| **R2 Claims tripwire** | §8.3 patterns, extractor script, tests; stop rendering `body_html` anywhere (PDP summary, meta, JSON-LD) | `src/lib/medicines/{claims,claims.test}.ts`, `scripts/check-claims.ts`, `package.json`, `src/app/products/[handle]/page.tsx` (remove `descriptionHtml` / `summary()` use only) | §8 acceptance; PDP acceptance item 2 |
| **R3 Query + search** | `query.ts` (parse, build href, run, facets), `phonetic.ts`, `glossary.ts`, tests | `src/lib/medicines/{query,phonetic,glossary}.ts` + tests | §6.4 table passes; facet-count test passes; `buildStoreHref` drops defaults |
| **R4 Routes + redirects** | `/store/search` route (shell + Suspense child), `/store/[collection]` params (forms + proprietary), redirects, image loader, unstyled but correct markup for store home / collection / search using the new components | `src/app/store/{page,search/page,[collection]/page}.tsx`, `next.config.ts`, `src/lib/shopify/image-loader.ts`, new components from §7 with minimal CSS | §5.1 items 1–3, §5.2 items 1, 3, 5, §5.3 items 1–2, 4–6 |
| **R5 Store home + collection + search visual** | §4 tokens, §5.1–§5.3 layouts in both themes, `ProductCard` + `QuickAddButton`, `SignatureBand`, `FormIndex`, `FilterPanel`, `AdviceBand` | store components + `*.module.css`, `src/app/styles/tokens.css` (store tokens only) | §5.1 items 4–7, §5.2 items 2, 4, 6, §5.3 item 3 |
| **R6 PDP** | §5.4 in full: gallery, LabelViewer, facts, caution, composition, policy details, film plants, related, metadata, JSON-LD; delete the 3D fallback. Step 1: sample the four corner 16 × 16 px patches of 10 hero images (any method; record mean OKLCH L in the WP report) to confirm white grounds for R9 | `src/app/products/[handle]/*`, PDP components, `ProductGallery.tsx` | §5.4 items 1–8; contrast of `--ink` on `--store-caution-bg` recorded in `contrast.txt` |
| **R7 Buy flow aids** | `BuyPanel` states, `StickyBuyBar`, recently viewed (writer + row), related row logic, gate wiring everywhere | `BuyPanel.tsx`, `StickyBuyBar.tsx`, `recently-viewed.ts`, `RecentlyViewed*.tsx` | §5.4 items 3, 5; §6.6 storage-blocked check |
| **R8 Cart + checkout + booking prefill** | §5.5, §5.6, `CartUpsell`, `getUpsellAction`, gated-line handling, `/consultation?medicine=` | `CartDrawer.tsx`, `CartUpsell.tsx`, `CheckoutButton.tsx`, `src/lib/medicines/actions.ts`, `src/app/consultation/page.tsx`, `src/components/booking/BookingForm.tsx` | §5.5 items 1–6, §5.6 items 1, 3; booking prefill shows "About: {name}" and still only shows success after the server returns ok |
| **R9 Analytics** | §11 `track()`, `ProductAnalytics`, wiring in the 4 add sites and checkout | `src/lib/analytics/track.ts`, components | §11 acceptance |
| **R10 Storefront switch-over** | §10 P1 (runs when M11 arrives; can run any time after R8) | `cart-store.ts`, `storefront.ts`, `src/app/api/shopify/revalidate/route.ts` | §10 P1 verify column, in both modes |

Order: R1 → R2 → R3 → R4 → (design-system WP) → R5 → R6 → R7 → R8 → R9. R10 whenever M11 arrives.

---

## 14. Missing inputs (NEEDS-AVVVS)

| # | Needed | Blocks | Default until then |
|---|---|---|---|
| M1 | Which products contain Schedule E(1) ingredients; whether `unknown` blocks online sale | Launch decision, `E1_UNKNOWN_IS_GATED` | `false` (sell `unknown`, gate `yes`) |
| M2 | Counsel sign-off: claims policy (§8), whether indications may ever show, body-system navigation, reviews, Rich Meal food-vs-drug | `INDICATIONS_ENABLED` | `false` |
| M3 | Which phone number is on WhatsApp, and answering hours | WhatsApp links | `clinic.phones[0]` (UNVERIFIED) |
| M4 | Shipping charges, any free-delivery threshold, COD, international orders | Any shipping wording beyond §9.3 | Only §9.3 text |
| M5 | Does the Shopify price equal the printed MRP incl. taxes? | "MRP, incl. of all taxes" | Price shown without the MRP label |
| M6 | The content sheet, filled from physical labels and approved per row (start: 21 proprietary + 6 signature) | Every label fact on PDPs | Label viewer only |
| M7 | Manufacturing licence address (Kakkodi on the Lakshol label vs Taluk Road, Puthiyara in the Shopify terms) and licence number | Manufacturer note | Hidden |
| M8 | Photo for `aragwadharishtam`; high-resolution (≥ 2000 px) front and back label photos — all 48 back labels are 682 px wide, readable only at low zoom | Gallery quality, LabelViewer zoom | Name panel; zoom capped by `maxScale` |
| M9 | Approval of the form glosses, the standard caution line, and the LabelViewer note | Glosses, caution line 1, viewer note | Hidden (`FORMS_GLOSS_APPROVED`, `STANDARD_CAUTION_APPROVED` = false) |
| M10 | Back-in-stock notifications wanted? Which system? | — | WhatsApp path |
| M11 | Storefront API token + exact `*.myshopify.com` domain | R10 | Public JSON + permalink |
| M12 | Publish Cosmetics (Gloveda, 10 unpublished) or link out to glovedaherbals.com? | Cosmetics route | Redirect to `/store` |
| M13 | Analytics provider (recommended: cookieless) and, if cookie-based, a consent design | Loading any tracker | `track()` is a no-op in production |
| M14 | Counsel: which Legal Metrology / E-Commerce Rules declarations each PDP must show (MRP, net quantity, manufacturer, consumer-care contact, country of origin) | Facts list completeness | Shows what the sheet provides; "Country of origin: India" (DER: factory in Kozhikode, about.ts) |
| M15 | Confirm the signature set and order (6 handles in `store-merch.ts`; 01 §3.6 says five products, 01 §4.4 lists six) | `SignatureBand` | Six, per 01 §4.4 |
| M16 | Counsel: may the product name "Relieve O Capsule" (`relieve-o`) appear as is, given "relieve" is cure-adjacent wording? | `NAME_EXEMPT_HANDLES` | Shown as named in Shopify (exempted, flagged) |
