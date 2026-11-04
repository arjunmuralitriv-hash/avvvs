# AVVVS store revamp: research and build spec

Written 2026-11-04. Inputs: `docs/brief/creative-brief.md` (it wins every conflict), `PLAN.md` §4 and §6 (store, SEO and performance only), the store code in `src/app/store`, `src/app/products`, `src/components/store` and `src/lib/shopify`, the live pages at `http://localhost:3000/store` and `/products/dhanwantharam-thailam`, the live Shopify JSON at `https://avvvsglobal.com`, three back-label photos from the Shopify CDN, five reference stores, and Indian advertising law. A sibling audit, `docs/research/catalogue-audit.md`, covers catalogue completeness and ingredients. This file covers the store only, and it corrects that audit on one point (§3.2).

**Not legal advice.** §5 is a risk map for engineering decisions. AVVVS's counsel must sign off the claims policy before launch.

---

## 0. Decisions in one screen

| # | Decision | Why |
|---|---|---|
| D1 | **Keep the current data layer** (`src/lib/shopify/*`: two adapters, cached reads, cart store, permalink checkout). Rebuild the store's presentation and add a medicine content layer on top. | The adapter, cart and checkout work, are typed, and are cached with tags. Only the information model and the selling aids are weak. |
| D2 | **A medicine is Shopify data + an AVVVS content-sheet row + derived fields**, merged in `src/lib/medicines/`. Shopify owns price, stock, images, SKU and title. The sheet owns everything medical. | Shopify `body_html` is a loose indications list with no dose, no composition and no cautions. 59% of it contains regulated disease terms (§5.3). |
| D3 | **Indications are hidden by default.** They show only for a sheet row with `status=approved`, `indications_display=show`, and no hit in the claims blocklist (§5.5). | 98 of 165 current descriptions name at least one disease or condition that the Drugs and Magic Remedies Act Schedule or s.3 covers. A product page is an "advertisement" under s.2(a). |
| D4 | **The label photo is the interim source of truth.** Every PDP gets a "Read the label" zoom viewer over the Shopify back-label image. 64 products have 2 or more images, and on the 3 labels inspected the composition, the dosage line, the classical reference and the route are all printed. | It shows verified information right now, with no transcription risk, while AVVVS fills the sheet. |
| D5 | **Navigation is by form, by route (internal or external use) and by classical reference, not by disease.** Shop-by-body-system is deferred and flagged (§4.2). | Every one of those facets is printed on the label or carried by Shopify. A disease facet is an advertisement for treating that disease. |
| D6 | **No reviews, ratings, testimonials, subscriptions, bundles or free-shipping banners at launch.** | None exists in the data. The policy states no shipping threshold. Medicine testimonials carry DMR Act and ASCI risk. |
| D7 | **Selling aids that need no invented data:** quick add, a sticky buy bar, recently viewed, a same-form cart upsell, synonym search, "Ask a vaidyan" on WhatsApp and `/consultation`, an exact delivery and returns summary, and Storefront API checkout once the token arrives. | Each one uses only Shopify fields, the policies, `src/lib/site.ts`, or the visitor's own browser state. |
| D8 | **Medicines that contain Schedule E(1) ingredients are not sold through self-serve checkout** until AVVVS flags them and chooses a route (§5.4): enquiry only, or a prescription-upload flow. | The CCPA advisory of 14 July 2022 says e-commerce sale of these drugs needs an uploaded prescription from a registered ASU practitioner. |

---

## 1. Audit of the current store

### 1.1 What is there

| Area | Files | State |
|---|---|---|
| Data | `src/lib/shopify/index.ts`, `public-json.ts`, `storefront.ts`, `types.ts`, `format.ts`, `sanitize.ts` | Two adapters behind one `CatalogAdapter`, selected by `SHOPIFY_STOREFRONT_TOKEN`. Reads use `"use cache"`, `cacheLife("hours")` and tags `products` / `product:${handle}`. A webhook route exists at `src/app/api/shopify/revalidate`. |
| Cart | `src/components/store/cart-store.ts`, `CartDrawer.tsx`, `CartButtonClient.tsx`, `src/lib/shopify/cart-actions.ts` | A module store read through `useSyncExternalStore`. Fallback mode keeps the cart in localStorage (`avvvs-cart-v1`) and checks out through the cart permalink `https://avvvsglobal.com/cart/{variant}:{qty},…`. Storefront mode uses an httpOnly cookie `avvvs_cart` and zod-validated server actions. Updates are optimistic. |
| Catalogue | `src/app/store/page.tsx`, `src/app/store/[collection]/page.tsx`, `Catalogue.tsx`, `CatalogueControls.tsx`, `catalogue-query.ts`, `LedgerTable.tsx`, `ProductCard.tsx` | Built on the server from URL parameters (`q`, `type`, `sort`, `view`, `page`). It has collection tabs, form chips with counts, a substring search, 4 sorts, 48 per page, and a grid or "ledger" table view. |
| PDP | `src/app/products/[handle]/page.tsx`, `BuyPanel.tsx`, `ProductGallery.tsx`, `QuantityStepper.tsx`, `Breadcrumbs.tsx` | Title, price, quantity, add to cart, the sanitised Shopify description, Form / Collection / Item code facts, 4 related products, and `Product` + `BreadcrumbList` JSON-LD. A 3D viewer appears only when there is no photo. |

Live check, 2026-11-04 (dev server): `/store` returned 200 with 270 KB of HTML in 1.2 s. Its first flush is the shell plus a "Loading the catalogue" skeleton, and the grid streams in after it. `/products/dhanwantharam-thailam` returned 200 with 72 KB in 2.8 s.

### 1.2 What works (keep)

1. The checkout handoff is real today. Permalink checkout opens Shopify's hosted checkout with the lines, and Storefront mode needs only the env token (see `.env.example`).
2. The cart is honest: it is optimistic, but errors come back from the server, and it says "Shipping and tax are worked out at checkout" (`CartDrawer.tsx:116`).
3. The catalogue is URL-driven and works without JavaScript (the search form falls back to a GET). Every filter state can be shared and crawled.
4. Form chips count the filtered set, so a chip's number always matches the results it shows.
5. The HTML sanitiser is an allowlist, and links are limited to http(s), mailto, tel and relative URLs.
6. The SEO plumbing is in place: `generateMetadata`, per-variant `Offer` with availability, breadcrumbs, and `generateStaticParams` for all 165 PDPs.
7. `titleCase()` already converts the ALL-CAPS Shopify titles.

### 1.3 What is weak

**For information quality**

| # | Problem | Evidence |
|---|---|---|
| I1 | The PDP shows Shopify `body_html` raw as "About this medicine". It is an unedited indications list with typos ("Sagged Urinary retention", "defeciency", "odema") and regulated disease claims (§5.3). | `page.tsx` renders `descriptionHtml`. Dhanwantharam Thailam lists Paralysis, Hemiplegia, Hernia and "Pregnancy Care". |
| I2 | No pack size, composition, dosage, route, caution, shelf life or manufacturer on any PDP, even though the back-label photo shows most of these. | Only 8 of 165 titles carry a size. `grams` is not shown. |
| I3 | The back-label image is a thumbnail in the gallery. Nothing tells the visitor that the label holds the composition, and it cannot be read at the current size. | `ProductGallery.tsx` |
| I4 | `product_type` is not a form for 4 products (`PROPRIETARY`: Lakshol, Rich Meal, Abala Sudha, Prasoothikamritha Rasayanam). Asavams sit under ARISHTAM, Kerams and Kuzhambu under THAILAM, and Rasayanam/Gulam under LEHYAM. | `products.json` |
| I5 | Titles carry spelling drift and typos: GHRITHAM/GHRITAM/GRITHAM, THAILAM/TAILAM/THALAM ("KARPOORADI THALAM 200 ml"), double spaces ("RUJANTH  LINIMENT"), and sizes in some titles only. | `products.json` |
| I6 | No Malayalam name, although the labels print the Malayalam and Hindi names (for example ധാന്വന്തരം തൈലം on the Dhanwantharam label). | Back-label photos |
| I7 | There is no "consult a vaidyan" or WhatsApp route on the PDP, and no caution. | `page.tsx` |
| I8 | No delivery or returns facts on the PDP or in the cart. | The policies exist at `/pages/shipping` and `/pages/return-policy` (§3.5). |
| I9 | A "Cosmetics" collection tab is rendered, but that collection has 0 published products (`collections.json` says 10 because unpublished products count). | `COLLECTION_ORDER` includes `cosmetics`. |
| I10 | 5 products have an empty body and 1 (ARAGWADHARISHTAM) has no image. The page falls back to "No photograph yet", or to the procedural 3D bottle, which the brief rejects as invented packaging (rule 6). | `ProductCard.tsx`, `ProductGallery.tsx` |

**For sales**

| # | Problem |
|---|---|
| S1 | Cards have no quick add. Every purchase needs a PDP visit. |
| S2 | The buy panel scrolls away and nothing replaces it (no sticky bar). |
| S3 | Search is a whole-word substring match over title, type and description (`matchesSearch`). "aswagandha", "dhanvantari", "churnam" and "tailam" all miss their products. It also matches on indications text (claims risk, §4.4). |
| S4 | Related products are "same type, then same collection, alphabetical", and include out-of-stock items. They are not curated, and the cart has no upsell. |
| S5 | No recently viewed. Classical medicines are bought by name, often as repeat purchases, so getting back to a product matters. |
| S6 | 30 of 165 products (18%) are out of stock, with no "notify me" or "ask about availability" path. |
| S7 | The store index opens straight into a 48-card grid with no orientation: what the forms are, how to choose, or where to get advice. |
| S8 | Images go through `/_next/image` (a second optimisation pass) instead of Shopify CDN `width=` transforms, which PLAN §6 required. The `/store` HTML is 270 KB. |
| S9 | The streamed shell leaves the product list out of the first flush. For a commerce page, the first page of products should be in the initial HTML (see WP-S3 acceptance). |
| S10 | The design (v1 tokens, ledger metaphor) is rejected by the client. Restyling must follow the new design system, not the v1 CSS modules. |

---

## 2. Reference study

Five stores read on 2026-11-04. Aesop and Forest Essentials block automated fetches (HTTP 403), so their pages were read in the desktop browser pane. Hims returned 403 to every route, so Ritual is the DTC reference. Its regulatory model (US FDA) differs from India's; take only the UI patterns from it.

### 2.1 What each PDP does

| | Aesop (Camellia Nut Facial Hydrating Cream) | Forest Essentials (Kumkumadi Night Cream) | Kama Ayurveda (Kumkumadi Facial Oil) | Kottakkal AVS (Dasamularishtam; Kanasatahwadi Kashayam) | Ritual (Essential for Women 18+) |
|---|---|---|---|---|---|
| Order on page | Breadcrumb → name → price → one-line description → size → add to cart → "Suggested partners" (5 alternatives) → tabs (Description / Ingredients / Packaging and recycling) → "How to use" → "Suggested partners" as a 3-step regimen → Others also considered → Recently viewed | Representation disclaimer → name → one-line description → SIZE → price → "Free shipping and Complimentary samples on ₹999+" → points → offers → pincode CHECK → ADD TO BAG → "Why this works?" → What Is It? / What Does It Do? → tabs INGREDIENTS / HOW TO USE / ALL REVIEWS / FAQS → key-ingredient cards → "View full ingredient list" → You May Also Like → shelf life, country of origin, dimensions | Gallery ("Actual packaging and appearance may vary") → badge → name + tagline → review count → Country of Origin → short description → "MRP ₹1895.00 (incl. of all taxes)" → qty → "Available in: (Net Quantity)" 5/15/30 ml → Add to Bag → pincode "Check Estimated Delivery" → How To Use (3 steps) → Benefits → ritual → Overview → footnoted results claim → Product information (generic name, shelf life, manufacturer) | Name → SKU → price → pack ("450 Ml Pet Bottle") → In Stock → **Usage**: "To be taken twice daily after food" → **Dosage**: "15 to 30 ml for adults … or as directed by the Physician" → **Indication** → More Information: **Prescription: Yes/No**, **Returnable: No**. Prescription items show "*Need a valid prescription" and **no indications at all** | Gallery → badge → name → benefit bullets → price → add to cart → guarantee + shipping → subscription block → Supplement Facts (amount per nutrient) → How to Use → Certificate of Traceability (tests, sources) → per-ingredient cards (form, source, location of manufacture) → FAQ → reviews with filters and "Verified Buyer" |
| Usage / dose | "Morning and evening, massage into freshly cleansed and toned skin." Dosage: "Half a teaspoon". Texture, Aroma | "Nightly. After Cleansing & Toning Skin." plus a method | 3 steps | Verbatim from the label, adult and child dose | "Take one capsule per day" |
| Ingredients | Key ingredients line + full list tab | 10 key-ingredient cards + full list link | Only key ingredients | None shown | Every ingredient with dose, source and supplier |
| Reviews | None on the PDP | 4.8 from 254, distribution, Verified Buyer, Q&A | 44 reviews, no score shown | None | 4.6 from 1,226, filters, Verified Buyer, brand replies |
| Sales aids | Free-shipping threshold in the announcement bar, complimentary samples, gift wrapping, regimen partners | Free shipping + samples at ₹999+, points, EMI, gifting rituals priced as sets | Free shipping on prepaid orders, gift sets, price-band gifting | Wishlist, deals | Subscription club, bundles of 3+, money-back guarantee |
| Consult CTA | None (store staff in person) | None on the PDP | None | "Book an Appointment" in the header; prescription upload flow | Advisory-board profiles |
| Trust | Brand voice, packaging info | Award badges, shelf life, origin | Origin, shelf life, manufacturer, fraud warning | The institution's name | Third-party testing, certifications |

### 2.2 Navigation patterns

| Store | By form / category | By concern | By ritual / regimen | Other |
|---|---|---|---|---|
| Aesop | Category → sub-category (Skin Care → Moisturisers) | No (only "Suited to" on the PDP) | Yes: PDP regimen steps | Recently viewed |
| Forest Essentials | Face / Body / Hair / Wellness / Mom & Baby | "Shop by concern" grid (sun protection, anti-ageing, hair thinning, dandruff, acne-prone, dark circles, dull dry skin) | "Most loved rituals" as priced duos and sets | Gifting |
| Kama | By category inside Skin / Hair / Body | Per department (for example Hair Loss & Thinning, Dandruff) | "Night Routine", "Body Care Ayurvedic Ritual" | Ingredient-led signature collections, gifting by price |
| Kottakkal AVS | Gulikas, Non Prescription Medicines, OTC/FMCG, Skin, Hair, Baby care, Karkidaka Chikitsa | Partial: Immunity Boosters, Pain Management, Eye Care | Karkidaka (a seasonal regimen) | **Prescription vs non-prescription is a top-level split** |
| Ritual | By life stage (Daily Health, Pregnancy, Perimenopause) | Benefit bullets | Starter sets | Subscriptions |

### 2.3 What AVVVS should take, and what it must not

**Take**
1. Aesop's calm order: name, price, one line, size, buy; then structured facts in a fixed order; then a regimen. A fixed labelled grid ("Suited to / Skin feel / Key ingredients", "Dosage / Texture / Aroma") maps directly onto Form / Pack / Route / Dosage-as-labelled / Reference.
2. Kottakkal's medicine-specific facts: Usage, Dosage, Pack ("450 Ml Pet Bottle"), **Prescription Yes/No**, **Returnable Yes/No**. This is the closest peer, an older Kerala vaidyasala. Its choice to show no indications on prescription items is a useful precedent for D3.
3. Kama and Forest Essentials: net quantity with each size, "MRP (incl. of all taxes)", shelf life, country of origin, the manufacturer block, and the packaging-may-vary note.
4. Ritual: the per-ingredient table (name, part, amount per dose). AVVVS labels print exactly this, as "Each 10 ml contains" with botanical name, part and grams.
5. Aesop and Forest Essentials: "Recently viewed" and a quiet "suggested partner" row.

**Do not take**
1. Benefit bullets and results claims ("heals acne scars", "Reduces Hair Fall", "clinically proven to boost six youth markers"). For drugs in India this is the exact wording §5 rules out.
2. Star ratings and reviews on medicine pages (§4.9).
3. Free-shipping and sample thresholds. AVVVS's policy states none.
4. Concern grids that name diseases (§4.2).

---

## 3. The AVVVS medicine information model

### 3.1 Data sources

| Source | What it gives | Trust |
|---|---|---|
| Shopify (public JSON now, Storefront API later) | `handle`, `title`, `product_type`, `body_html`, `images[]` (front and back label photos), one variant (`id`, `price`, `sku`, `available`, `grams`), collection membership (classical 144, proprietary 21, cosmetics 0) | Live and authoritative for price, stock and images. **Not authoritative for medical text.** |
| Back-label photos on Shopify | Malayalam and Hindi names, composition ("Each 10 ml contains" botanical name, part, grams), "Dosage: As directed by the physician", "Reference: Astanga hridayam" / "Sahasra yogam", "Usage: For external use only" / "For the internal use only", net volume, manufacturer | Verified, because it is the printed label. It is a picture, so transcription must go into the sheet and be checked by AVVVS. |
| AVVVS content sheet (new) | Every medical field, transcribed from the physical label and approved by an AVVVS person | Authoritative once `status=approved` |
| Policies on `avvvsglobal.com/pages/*` | Delivery estimate, refunds and returns | Authoritative, quoted exactly |
| `src/lib/site.ts` | Phones, email, clinic address, booking time slots | Verified. Which number has WhatsApp is **UNVERIFIED** |
| `src/content/catalogue.generated.json` | A per-product seed (parsed indications, title herbs, `shipping_weight_g`, completeness) | Use as the pre-fill for the sheet only |

### 3.2 Correction to the catalogue audit

`catalogue-audit.md` says "the store publishes no ingredient lists". That is true of `body_html`. It is **not** true of the store as a whole: the back-label photo shows a full composition. Inspected:

| Product | Image | Printed on label |
|---|---|---|
| Dhanwantharam Thailam | `DHANWANTHARAMTHAILAMBACK.jpg` | Malayalam ധാന്വന്തരം തൈലം, Hindi धान्वन्तरं तैलं, "Each 10 ml contains" about 40 botanicals with part and grams, "Dosage: As directed by the physician", "Reference: Astanga hridayam", "Usage: For external use only" |
| Rasnadi Kashayam | `RASNADIKASHAYAMBACK.jpg` | 15 botanicals at 1.143 g each per 10 ml (Alpinia galanga, Ricinus communis, Sida, Strobilanthes ciliatus …), "Reference: Sahasra yogam", "Dosage: As directed by the physician", "Usage: For the internal use only", **200 ml** |
| Lakshol | `laksholback.jpg` | "Each 10 ml contains" 17 lines (Laccifer lacca, Withania somnifera, Curcuma longa …, 2.5 gm each), manufacturer "Arya Vaidya Vilasini Vaidyasala, N.V. Road, Kakkodi, Calicut, Kerala", customer care +91 495 2720 409 |

48 products have an image file named `*BACK*`, and 64 have 2 or more images. The label is the cheapest verified source for every medical field. The sheet transcribes it, and the PDP shows the photo at a readable size in the meantime (D4).

Note: the Lakshol label prints a third AVVVS address (Kakkodi) and a landline. The Shopify terms print a registered office at Taluk Road, Puthiyara PO, Kozhikode 673004. Neither is in `src/lib/site.ts`. Do not add them until AVVVS confirms which is the manufacturing licence address (missing input M7).

### 3.3 Field table

Legend: **SH** = Shopify, **SHEET** = AVVVS content sheet, **DER** = derived in code, **POL** = policy page, **SITE** = `src/lib/site.ts`.

| Field | Source | Rule | PDP placement |
|---|---|---|---|
| `handle` | SH | Join key with the sheet | URL `/products/{handle}` |
| `name` | SHEET `display_name`, else DER `titleCase(SH.title)` with sizes stripped (`/\s*\d+\s*(ml|gm?|gms)\b/i`) and spaces collapsed | Fixes typos such as THALAM. Never invent a name. | `<h1>` |
| `nameMl` | SHEET `name_ml` | Only from the label. Render with `lang="ml"`. | Under the `<h1>`, smaller |
| `nameHi` | SHEET `name_hi` | Only from the label. `lang="hi"` | Facts grid |
| `form` | SHEET `form`, else DER from `product_type` + title suffix (§3.4) | One enum value | Eyebrow-free facts grid; link to the form filter |
| `packSize` | SHEET `net_quantity` + `net_quantity_unit` | SH `grams` matches the printed net quantity on the 3 labels checked (200, 200 ml, 60), but the sibling audit treats it as shipping weight. **Never show `grams` as pack size** until the sheet confirms it. | Next to the price: "200 ml" |
| `price` | SH variant price | Format with `formatMoney`. Show "MRP" only if AVVVS confirms the Shopify price equals the printed MRP (M5). Otherwise label it "Price". | Buy panel |
| `available` | SH | — | Buy panel, cards |
| `sku` | SH | — | Facts grid "Item code" |
| `images` | SH | Image 0 is the hero. SHEET `label_image_index` (default: the first filename matching `/back/i`, else the last image when there are ≥2) is the label image. | Gallery + "Read the label" viewer |
| `composition[]` | SHEET `composition`: `Botanical name ; part ; amount` rows split by ` | ` | Exactly as printed, botanical names in italics. Basis line from `composition_basis` ("Each 10 ml contains"). | Table, collapsed after 8 rows ("Show all 40") |
| `route` | SHEET `route`: `internal` / `external` | From the label "Usage" line | Facts grid "Use: Internal" / "Use: External only". Filter facet |
| `classicalReference` | SHEET `classical_reference` | From the label "Reference" line (Ashtanga Hridayam, Sahasrayogam …) | Facts grid. Filter facet |
| `dosage` | SHEET `dosage_label` | **Verbatim from the label.** The 3 labels inspected all say "As directed by the physician", so show exactly that and pair it with the consult CTA. | "How to take" block |
| `directions` | SHEET `directions_label` | Verbatim, only if printed (for example "To be massaged gently into the skin…" for Lakshol) | "How to take" |
| `indications` | SHEET `indications_label` (from the **label**, not Shopify) | Shown only if D3 passes. Heading "Indications as printed on the label". Never as benefit bullets. | Collapsed disclosure, below the composition |
| `cautions` | SHEET `cautions_label` + DER standard lines (§5.6) | Rule 161(2) caution verbatim when the label carries it | Caution box above the composition |
| `scheduleE1` | SHEET `schedule_e1`: `yes` / `no` / `unknown` | `yes` or `unknown` affects buying (§5.4) | Not displayed as a word. Drives the buy panel. |
| `prescriptionRequired` | SHEET `prescription_required` | Kottakkal pattern | Facts grid "Prescription: Required / Not required" |
| `returnable` | SHEET `returnable`, default `yes` | The policy allows per-product exclusions | Facts grid + returns summary |
| `shelfLife` | SHEET `shelf_life_months` | From the label only | Facts grid |
| `storage` | SHEET `storage_label` | Verbatim | Facts grid |
| `manufacturer` | SHEET `manufacturer_name`, `manufacturer_address`, `licence_no` | As printed | Small print at the end |
| `consultCta` | DER | Always on: link to `/consultation?medicine={handle}` (WP-S6 makes the booking form read it) | Buy panel, secondary button |
| `whatsAppCta` | DER from SITE `clinic.phones[WA_INDEX]` | Prefilled text "Hello, I have a question about {name} ({url})". No personal data in the URL. | Buy panel, tertiary link |
| `delivery` | POL `/pages/shipping` | Verbatim summary (§3.5) | Under the buy button, one line + a disclosure |
| `returns` | POL `/pages/return-policy` | Verbatim summary (§3.5) | Disclosure |
| `related[]` | SHEET `related_handles`, else DER: same `form`, in stock, not this handle, sorted by title, max 4 | No "frequently bought together" claim: there is no order data | "More {form plural}" row |
| `searchKeys` | DER from `name`, `nameMl`, `nameHi`, SHEET `synonyms`, form glossary, composition botanicals | §4.4 | Not displayed |

### 3.4 Form enum and derivation

`src/lib/medicines/forms.ts`. The display label is the Malayalam/Sanskrit form name first, with a plain English gloss. The glosses are standard dictionary meanings of the dosage form, not product claims, but AVVVS should approve the wording (M9).

| `form` id | Label | English gloss | Derivation, first match wins (title upper-cased) |
|---|---|---|---|
| `asavam` | Asavam | Fermented herbal liquid | title matches `/ASAVAM$/` |
| `arishtam` | Arishtam | Fermented herbal decoction | `product_type=ARISHTAM` |
| `kashayam` | Kashayam | Decoction | `KASHAYAM` |
| `keram` | Keram | Medicated coconut oil | title matches `/KERAM\b/` |
| `kuzhambu` | Kuzhambu | Medicated oil blend | title matches `/KUZHAMBU/` |
| `thailam` | Thailam | Medicated oil | `THAILAM`, or title matches `/T[H]?A[I]?LAM\b/` |
| `choornam` | Choornam | Herbal powder | `CHOORNAM` |
| `ghritham` | Ghritham | Medicated ghee | `GHRITHAM`, or title matches `/GH?RU?ITH?AM|SARPIS/` |
| `lehyam` | Lehyam | Herbal confection | `LEHYAM`, or title matches `/RASAYANAM|GULAM|LEHYAM/` |
| `capsule` | Capsule | — | `CAPSULE` |
| `syrup` | Syrup | — | `SYRUP` |
| `liniment` | Liniment | — | `LINIMENT` |
| `other` | — | — | Fallback. A build warning names the handle. Expected for `PROPRIETARY` items (Lakshol, Rich Meal, Abala Sudha) until the sheet sets `form`. |

Acceptance: running the derivation over the 165 live products leaves `other` only on products whose `product_type` is `PROPRIETARY` and whose title matches no rule. The test lists them by handle.

### 3.5 Delivery and returns copy (verbatim source, short form)

From `https://avvvsglobal.com/pages/shipping` (the Shopify `/policies/*` URLs return 404):
- PDP line: **"Delivered in an estimated 3–4 business days after dispatch (Sundays and holidays excluded). Shipping is calculated at checkout."**
- Disclosure: the policy also says delays beyond AVVVS's control can happen and that the estimate "may vary slightly from state to state". Paraphrase that, don't add to it.
- **No free-shipping threshold, no charges and no international terms are stated.** The Shopify theme shows a currency switcher (INR, EUR, AUD, GBP, JPY), and the sibling audit saw a "SHIPPING WITH IN INDIA" banner. Show nothing about international delivery until AVVVS confirms (M4).

From `https://avvvsglobal.com/pages/return-policy`:
- Full refund if the item is defective, lost or damaged in transit, past expiry, or missing from the order. Email damaged@avvvsglobal.com (order ID as subject + photo) or missing@avvvsglobal.com.
- Unopened, unused items can be returned within 30 working days of receipt, with a 20% restocking charge. The charge may be waived (refund to wallet) when a doctor changes the prescription, after verification.
- Items marked "This item cannot be returned for a refund or exchange" are excluded. Drive this from SHEET `returnable=no`.
- Refunds to card or net banking take 7–10 working days. COD refunds can take up to 3 weeks.

Store these strings once, in `src/content/store-policies.ts`, with `sourceUrl` and `fetchedOn: "2026-11-04"`, so the PDP, the cart and the FAQ quote one source.

### 3.6 The AVVVS content sheet

One row per Shopify `handle`. It is edited by AVVVS in Google Sheets or Excel, exported as **TSV** (tabs avoid quoting bugs), and committed as `src/content/medicines/sheet.tsv`. A script converts and validates it. List cells use ` | ` as the separator. "Verbatim" means typed exactly as printed on the physical label, including its spelling.

| Column | Type | Required | Notes |
|---|---|---|---|
| `handle` | string | yes | Must exist in Shopify. The build fails on unknown handles. |
| `status` | `draft` / `approved` | yes | Only `approved` rows show medical fields |
| `approved_by` | string | if approved | Name of the AVVVS person (vaidyan or QA) |
| `approved_on` | `YYYY-MM-DD` | if approved | |
| `display_name` | string | no | Title-case correction, for example "Karpooradi Thailam" |
| `name_ml` | string | no | Malayalam, from the label |
| `name_hi` | string | no | Devanagari, from the label |
| `synonyms` | list | no | Other spellings people search for, for example `Dhanvantari Taila | Dhanwantaram` |
| `form` | enum §3.4 | no | Overrides the derivation |
| `net_quantity` | number | yes for approved | As printed |
| `net_quantity_unit` | `ml` / `g` / `capsules` / `tablets` | yes for approved | |
| `price_is_mrp` | `yes` / `no` | no | Allows the "MRP (incl. of all taxes)" wording |
| `route` | `internal` / `external` | yes for approved | Label "Usage" line |
| `classical_reference` | string | no | Label "Reference" line, normalised spelling (Ashtanga Hridayam, Sahasrayogam) |
| `composition_basis` | string | no | For example "Each 10 ml contains" |
| `composition` | list of `name ; part ; amount` | no | For example `Alpinia galanga ; rhizome ; 1.143 g` |
| `dosage_label` | string | yes for approved | Verbatim, for example "As directed by the physician" |
| `directions_label` | string | no | Verbatim |
| `indications_label` | string | no | Verbatim **from the label**. Leave it empty if the label has none. |
| `indications_display` | `show` / `hide` | yes | Default `hide`. `show` needs counsel sign-off (§5) |
| `cautions_label` | string | no | Verbatim, including "Caution: To be taken under medical supervision" if printed |
| `schedule_e1` | `yes` / `no` / `unknown` | yes | Whether any ingredient is in Schedule E(1) |
| `prescription_required` | `yes` / `no` | yes | AVVVS policy for online sale |
| `returnable` | `yes` / `no` | yes | |
| `shelf_life_months` | number | no | From the label |
| `storage_label` | string | no | Verbatim |
| `manufacturer_name` | string | no | As printed |
| `manufacturer_address` | string | no | As printed |
| `licence_no` | string | no | Drug manufacturing licence number, as printed |
| `label_image_index` | number | no | Index into the Shopify images |
| `related_handles` | list | no | AVVVS-curated, max 4 |
| `notes_internal` | string | no | Never rendered |

Seed it with `scripts/seed-medicine-sheet.mjs`, which reads `src/content/catalogue.generated.json` and writes `docs/data/medicine-sheet-template.tsv` with `handle`, `display_name` (titleCase), the derived `form`, `status=draft`, `indications_display=hide`, `schedule_e1=unknown` and `returnable=yes`. Everything else stays empty: never pre-fill medical columns from Shopify `body_html`.

---

## 4. Sales features (no fabricated data)

Every item lists its data source, a flag where AVVVS must confirm, and the acceptance check.

### 4.1 Shop by form, route and reference (launch)
- **Facets:** `form` (§3.4), `route` (internal / external), `classical_reference`, collection (Classical / Proprietary; hide any collection with 0 products), availability (in stock only, a toggle).
- URL keys: `form`, `route`, `ref`, `collection`, `stock=1`. Keep the server-rendered `buildHref` pattern from `catalogue-query.ts`.
- The route and reference facets render only once ≥10 approved rows carry them. Facets with too few values look broken.
- Store index top section: a 3-column (desktop ≥1024 px), 2-column (≥640 px) and 1-column grid of form tiles. Each tile has the form label, the gloss, a count, and one real product photo (the first in-stock product of that form). No illustration, no icons.
- Acceptance: every tile count equals the number of results its link shows. `/store?form=thailam` server-renders the products in the initial HTML.

### 4.2 Shop by body system (deferred, flagged)
- It would be built only from SHEET `indications_label` on approved rows, mapped by an AVVVS vaidyan to a small fixed list.
- **Risk:** a page titled "Joints and muscles" listing medicines is an advertisement suggesting their use for those conditions. Most of the obvious groupings sit on the Schedule: rheumatism, paralysis, disorders of the nervous system, female diseases (in general), fevers (in general), heart diseases, high or low blood pressure, diabetes, obesity. DMR Act s.3 bars these whatever the wording.
- **Recommendation:** do not build it. If AVVVS insists after counsel review, limit it to non-Schedule groupings that the label itself states. Counsel approves each group name. Name the groups as "traditionally used for" only if counsel approves that phrasing.

### 4.3 "Ask a vaidyan" (launch)
- In the buy panel, under Add to cart: a secondary button "Ask a vaidyan before buying" linking to `/consultation?medicine={handle}`, and a text link "Ask on WhatsApp" to `waHref(clinic.phones[WA_INDEX])` + `?text=` with `encodeURIComponent("Hello, I have a question about {name}: {absolute PDP url}")`.
- `WA_INDEX` is a new export in `src/lib/site.ts`, `export const whatsappPhoneIndex = 0`, with a comment marking it **UNVERIFIED**. The existing booking form already uses `phones[0]` for WhatsApp.
- No chat widget and no AI chat: no staffed live-chat channel is known (M3).
- Acceptance: the WhatsApp link opens `https://wa.me/918089202091?text=…` with no name, phone or email in it.

### 4.4 Search with synonyms (launch)
- New pure module `src/lib/medicines/phonetic.ts`. Export `phoneticKey(word: string): string`:
  1. lower-case and NFKD-normalise; strip anything other than `a-z`, Malayalam (U+0D00–U+0D7F) and Devanagari (U+0900–U+097F)
  2. for Latin text apply, in order: `zh→l`, `ksh→ks`, `sh→s`, `ch→c`, `th→t`, `dh→d`, `bh→b`, `gh→g`, `kh→k`, `ph→p`, `w→v`, `aa→a`, `ee→i`, `oo→u`, `ou→u`, `y$→i`
  3. collapse repeated letters (`/(.)\1+/g → $1`)
  4. drop a trailing `m` after a vowel (`/([aeiou])m$/ → $1`)
- Matching: query tokens with ≥2 letters. A token matches a product key when one is a prefix of the other, or when the Levenshtein distance is ≤ `Math.floor(len/5)` (len = the longer key). All query tokens must match.
- Index per product: `name`, `display_name`, SH `title`, `nameMl`, `nameHi`, `synonyms`, the form label and gloss, SKU, and composition botanical names (approved rows). **Do not index indications or Shopify `body_html`.** Searching "knee pain" and getting medicines back is the store recommending drugs for a condition. Flag it for AVVVS.
- English glossary (`src/lib/medicines/glossary.ts`): `oil→thailam`, `ghee→ghritham`, `decoction→kashayam`, `powder→choornam`, `capsule|caps→capsule`, `syrup→syrup`, `jam|confection→lehyam`.
- Zero results: show "No medicine matches '{q}'. Ask a vaidyan on WhatsApp or book a consultation." with both links, plus the form tiles.
- Tests (`src/lib/medicines/phonetic.test.ts`, run with `node --test src/lib/medicines/*.test.ts`; Node 25 strips types natively; use relative imports with `.ts` extensions and no Next imports):

| Query | Results must include (handle) |
|---|---|
| `aswagandha` | `aswaganda-cap` (title ASHWAGANDHA CAPSULE), `aswagandha-choornam`, `aswagandharishtam`; must not include `balaswagandhadi-thailam` |
| `dhanvantari taila` | `dhanwantharam-thailam` |
| `churnam` | every `form=choornam` product |
| `rasnadi kwath` | none (no false positive from "kwath"), and the zero-results state renders |
| `kulambu` | `dhanwantharam-kuzhambu` |
| `ghee` | every `form=ghritham` product |

### 4.5 Free-shipping threshold (not at launch)
The policy states none. Do not show a progress bar or banner. If AVVVS sets a threshold in Shopify shipping settings and adds it to `/pages/shipping`, add `freeShippingFrom` to `src/content/store-policies.ts` with the policy URL, and render "₹X more for free delivery" in the cart. Until then, the cart shows only "Shipping is calculated at checkout."

### 4.6 Sticky buy bar (launch)
- Component `src/components/store/StickyBuyBar.tsx` (`"use client"`). It watches the BuyPanel's submit button with `IntersectionObserver` (`threshold: 0`, `rootMargin: "0px 0px -64px 0px"`) and shows when the button is out of view **above** the viewport.
- Layout: fixed to the bottom at every width, height 64 px + `env(safe-area-inset-bottom)`, content max-width = the site container. Left: 40×40 px thumbnail (Shopify `&width=80`), name (1 line, ellipsis), pack size. Right: price + "Add to cart" (shares the BuyPanel's `add()` from `useCart`, quantity 1).
- Motion: `motion/react`, `y: "100%" → 0`, 200 ms, `ease: [0.2, 0, 0, 1]`. Under `prefers-reduced-motion`, opacity 0 → 1 over 0 ms. Transform and opacity only.
- It is hidden when the product is out of stock, or when the Schedule E(1) gate applies (§5.4). In those cases the bar shows "Ask a vaidyan" instead.
- Acceptance: on a 375×812 viewport, after scrolling past the buy button the bar is visible and does not cover the footer's last line (the page gets `padding-bottom: 64px` while the bar is shown). Keyboard: the bar's button is reachable, and focus never lands on the bar while it is hidden (`inert` when hidden).

### 4.7 Quick add (launch)
- On `ProductCard`, a button "Add" at the bottom-right of the card body, shown when `available && variants.length===1 && !gated`. All 165 products have 1 variant today. It calls `add()` with quantity 1 and opens the cart drawer.
- The card stays one link to the PDP. The button sits outside the `<a>` (no nested interactive elements): the card becomes a `<li>` with an `<a>` covering the media and title, and the button is a sibling.
- Acceptance: tabbing a card gives two stops (the link, then Add). Screen readers announce "Add {name} to cart".

### 4.8 Recently viewed (launch)
- `src/components/store/recently-viewed.ts`: localStorage key `avvvs-recent-v1`, an array of handles, max 8, most recent first, de-duplicated, every access in try/catch. Written from a tiny client effect on the PDP.
- Rendered on `/store` (above the grid, only when ≥2 entries) and at the end of the PDP (excluding the current product), as a horizontal row of `ProductCard`s. The product data comes from a server action, `getCardsAction(handles: string[])`, that reads the cached catalogue, validates the handles with zod (`z.array(z.string().max(120)).max(8)`), and drops unknown handles.
- Acceptance: the store renders identically with storage blocked (no row, no error).

### 4.9 Reviews policy (decision, not a feature)
- No reviews, star ratings or testimonials on medicine PDPs at launch. The data has none, the brief forbids invented ones, and user statements that a medicine cured a Schedule condition are themselves objectionable advertising on the brand's page.
- If AVVVS later wants reviews, take only verified-purchase reviews through a Shopify review app. Moderate them against the §5.5 blocklist before publishing. Show no aggregate stars in `Product` JSON-LD unless the reviews are real and on the page. Flag for counsel.

### 4.10 Cart upsell from the same form (launch)
- In `CartDrawer`, under the lines: "More {form plural}". Up to 3 in-stock products of the same `form` as the most recently added line, excluding items already in the cart, sorted by title, each with Add. No "customers also bought" wording: there is no order data.
- Hidden when the cart is empty, or when it has ≥5 distinct lines.

### 4.11 Out-of-stock path (launch)
- The buy panel replaces Add to cart with "Currently unavailable". The primary action becomes "Ask about availability on WhatsApp" (prefilled text). There is no email capture, because no back-in-stock system exists (M10).
- Out-of-stock products sort last within any sort order. Related rows show only in-stock products.

### 4.12 Storefront API checkout (when the token arrives)
- No code change is needed to switch. Set `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` in `.env.local` (scopes per `storefront.ts`: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_read_product_tags`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`).
- Verify after switching:
  1. `shopMode()` returns `storefront`
  2. adding to the cart sets the `avvvs_cart` cookie (httpOnly)
  3. the drawer's Checkout link points to the cart's `checkoutUrl` on Shopify
  4. a localStorage cart from fallback mode is not silently lost: on first load in storefront mode, if `avvvs-cart-v1` has lines, call `addToCartAction` for each line, then clear the key (new code in `initCart`)
  5. `getRecommendations` uses Shopify `productRecommendations` (already implemented), filtered to in-stock products, with the same-form fallback when it returns fewer than 4
- Optional later: Shopify `buyerIdentity.countryCode = "IN"` on cart create, because delivery is India-only (pending M4).

### 4.13 Not recommended at launch
| Feature | Reason |
|---|---|
| Subscriptions / auto-reorder | Needs a Shopify subscriptions app and selling plans. Courses are physician-directed ("As directed by the physician"), so a fixed cadence would amount to dosing advice. |
| Bundles, "frequently bought together" | There is no order data, and AVVVS has not defined any bundle. A "regimen" bundle is a prescription. |
| Points, EMI, coupons, countdown timers | No programme exists. Urgency patterns sit badly with medicines and with the CCPA's dark-pattern guidance. |
| Pincode delivery checker | There is no delivery API. The policy gives only a flat estimate. |

---

## 5. Regulatory sensitivities for product-page claims

### 5.1 The laws in play

| Instrument | What it does for this store | Status (2026-11-04) | Source |
|---|---|---|---|
| **Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954** | s.2(a): "advertisement" includes any notice, circular, **label, wrapper, or other document**. A product web page is within this. s.3 bars any advertisement suggesting a drug's use for (a) procuring miscarriage or preventing conception, (b) maintaining or improving capacity for sexual pleasure, (c) correcting menstrual disorder in women, or (d) the diagnosis, cure, mitigation, treatment or prevention of any of the **54 Schedule diseases and conditions**. s.4 bars false or misleading drug advertisements. s.7: up to 6 months and/or a fine on first conviction, up to 1 year on a later one. s.14 exemptions do not cover a manufacturer's own consumer site. | In force | [Indian Kanoon text](https://indiankanoon.org/doc/1929849/). Official copy: [thc.nic.in PDF](https://thc.nic.in/Central%20Governmental%20Acts/Drugs%20and%20Magic%20Remedies%20(Objectionable%20Advertisement)%20Act,%201954.pdf) |
| **Rule 170, Drugs and Cosmetics Rules, 1945** (state approval of ASU drug ads; bars misleading or exaggerated claims) | Omitted by AYUSH notification of 1 July 2024. The Supreme Court stayed the omission on 27 Aug 2024, then vacated the stay on 11 Aug 2025 while disposing of IMA's petition, leaving challenges open before other forums | **Omitted** (prior state approval no longer required), but liable to be challenged. DMR Act unaffected | [LiveLaw, 11 Aug 2025](https://www.livelaw.in/top-stories/supreme-court-vacates-stay-on-ayush-ministrys-notification-that-permitted-advertisements-of-ayurvedic-unani-siddha-drugs-300536); [Bar & Bench on the 2024 stay](https://www.barandbench.com/news/supreme-court-stays-centre-decision-omit-key-rule-misleading-ayush-ads) |
| **Rule 161(2), Drugs and Cosmetics Rules** | Internal-use ASU medicines containing a Schedule E(1) substance must carry "Caution: To be taken under medical supervision" in English and Hindi | In force | [BioSpectrum on the CCPA advisory](https://biospectrumindia.com/news/22/21633/govt-issues-advisory-to-e-commerce-platforms-selling-ayurvedic-drugs.html); [TaxGuru advisory text](https://taxguru.in/corporate-law/advisory-concerning-sale-ayurvedic-siddha-unani-drugs.html) |
| **CCPA advisory to e-commerce entities, 14 July 2022** | ASU drugs containing Schedule E(1) ingredients may be sold online only after the user uploads a valid prescription from a registered ASU practitioner | In force as an advisory | [BioSpectrum](https://biospectrumindia.com/news/22/21633/govt-issues-advisory-to-e-commerce-platforms-selling-ayurvedic-drugs.html) |
| **CCPA Guidelines for Prevention of Misleading Advertisements and Endorsements, 9 June 2022** (Consumer Protection Act 2019) | Health claims need adequate scientific substantiation from a recognised body. A disclaimer may clarify a claim but must not contradict it or hide material facts. Penalties up to ₹10 lakh, and ₹50 lakh for repeat offences | In force | [Khaitan & Co](https://khaitanco.com/thought-leaderships/CCPA-releases-guidelines-for-Prevention-of-Misleading-Advertisements-and-Endorsements-for-Misleading-Advertisements-2022); [Nishith Desai](https://www.nishithdesai.com/research-and-articles/hotline/technology-law-analysis/guidelines-on-misleading-advertisements-and-endorsements-notified-under-the-consumer-protection-act-2019-6172) |
| **ASCI Code + AYUSH monitoring mandate** | ASCI flags AYUSH ads to the Ministry. In 2024–25 it referred 233 health ads, mostly DMR Act breaches (cancer, diabetes, sexual weakness claims). Earlier rulings found "100% Ayurvedic" and "no side effects" claims unsubstantiated | Active | [The South First](https://thesouthfirst.com/news/from-cancer-cures-to-sexual-weakness-fixes-asci-flags-233-misleading-health-ads-to-ayush-ministry); [Campaign India](https://www.campaignindia.in/article/asci-joins-hands-with-the-ministry-of-ayush/433230) |
| **AYUSH order on COVID-19 claims, 1 April 2020** (via ASCI advisory) | No COVID cure or prevention claims | In force | [ASCI COVID advisory](https://www.ascionline.in/wp-content/uploads/2022/09/COVID-ADVISORY-ASCI.pdf) |
| **Consumer Protection (E-Commerce) Rules, 2020** | Seller disclosures such as country of origin. No fake reviews | In force | [Mondaq summary](https://mondaq.com/india/dodd-frank-consumer-protection-act/985606/the-consumer-protection-e-commerce-rules-2020) |

The DMR Schedule (from the Indian Kanoon copy): appendicitis; arteriosclerosis; blindness; blood poisoning; Bright's disease; cancer; cataract; deafness; diabetes; diseases and disorders of the brain; of the optical system; of the uterus; disorders of menstrual flow; disorders of the nervous system; disorders of the prostatic gland; dropsy; epilepsy; female diseases (in general); fevers (in general); fits; form and structure of the female bust; gall, kidney and bladder stones; gangrene; glaucoma; goitre; heart diseases; high or low blood pressure; hydrocele; hysteria; infantile paralysis; insanity; leprosy; leucoderma; lockjaw; locomotor ataxia; lupus; nervous debility; obesity; paralysis; plague; pleurisy; pneumonia; rheumatism; ruptures; sexual impotence; smallpox; stature of persons; sterility in women; trachoma; tuberculosis; tumours; typhoid fever; ulcers of the gastro-intestinal tract; venereal diseases. Check against the official gazette copy before encoding it (the Indian Kanoon page says its source could not be verified).

### 5.2 Open question for counsel
Is a verbatim reproduction of the **approved label's** indications on the manufacturer's own sales page an "advertisement" that s.3 catches? s.2(a) names the label itself, so treat the answer as "yes" until counsel says otherwise. That is why D3 defaults to hiding indications.

### 5.3 What the current Shopify copy contains
A regex pass over all 165 `body_html` values on 2026-11-04 (approximate: it counts "rheumatoid arthritis" under rheumatism and "oedema" under dropsy) found **98 products (59%)** with at least one term in a Schedule or s.3 category:

| Category | Products | Examples from live copy |
|---|---|---|
| Fevers (in general) | 23 | Dasamoola Haritaki "Fever" |
| Rheumatism | 20 | Rasnadi Kashayam "Rheumatoid arthritis" |
| Disorders of the nervous system | 20 | Dhanwantharam Thailam "Neurological … Disorders" |
| Menstrual disorder (s.3(c)) | 13 | Menocare "Irregular Menstruation", Abala Sudha "Menorrhagia" |
| Sterility in women / infertility | 10 | Abala Sudha "Infertility, PCOS" |
| Diabetes | 9 | Diastat Capsule "Type 2 Diabetes" |
| Sexual capacity (s.3(b)) | 8 | Desire Capsule "Erectile Dysfunction, Premature ejaculation"; Ashwagandha Capsule "Enhances sexual performance" |
| Obesity | 7 | Dasamoola Haritaki |
| Paralysis | 7 | Rasnadi Kashayam "Paralysis, Facial paralysis, Hemiplegia" |
| Tuberculosis | 6 | Yashti Madhu Capsule |
| GI ulcers | 6 | |
| Tumours / growths | 5 | Dasamoola Haritaki "Abdominal growths" |
| Epilepsy / fits | 5 | |
| Ruptures (hernia) | 4 | Dhanwantharam Thailam "Hernia" |
| Heart diseases | 4 | |
| COVID-19 | 1 | Relieve O Capsule "Viral infections including Covid 19" |

Also in the copy are cure-adjacent and absolute phrases: "Rehabilitation of hepatitis A and B, … Cirrhosis of liver" (Hepro), "boosts the immunity level and gives protection against various infections" (Ayushkwath), and "Promoted as healthy breakfast for all age groups" (Rich Meal, which is a food, so FSSAI rules apply rather than drug rules; flag for counsel).

**Consequence:** the new site must not republish Shopify `body_html` anywhere: not on the PDP, not in meta descriptions, not in JSON-LD `description`, not in search snippets, and not in `/llms.txt`. The current code does all four (`page.tsx` `summary()` and `descriptionHtml`). AVVVS should also review the copy on avvvsglobal.com itself. That is outside this build, but it is the same exposure.

### 5.4 Schedule E(1) gate
- Rows with `schedule_e1=yes`: no Add to cart, no quick add, no sticky bar, and no inclusion in cart upsells. The buy panel shows "This medicine is dispensed after a consultation" + "Book a consultation" + "Ask on WhatsApp". Price and label stay visible.
- Rows with `unknown` (the default for every row until AVVVS fills the sheet) are **AVVVS's call (M1).** Option A, the safest: treat `unknown` like `yes`, so nothing is sold online until the sheet is filled. Option B, the current behaviour: keep selling `unknown` and gate only `yes`. Ship with a single switch `E1_UNKNOWN_IS_GATED` in `src/lib/medicines/policy.ts`, default `false` (current behaviour), and AVVVS decides before launch.
- A prescription-upload flow (Kottakkal's pattern) is out of scope: Shopify's hosted checkout cannot take an upload without an app, and the booking flow is the existing route to a vaidyan.

### 5.5 Wording rules and the build-time blocklist

**Never on any store surface** (PDP, card, meta, JSON-LD, search, cart, emails):
1. Any Schedule disease or condition, or a synonym or narrower term, in a "for / treats / relieves / helps / supports / manages / prevents / protects against / useful in / indicated in" construction. Examples: "for diabetes", "relieves paralysis", "supports heart health", "manages blood pressure", "helps in obesity", "useful in infertility", "PCOS", "erectile dysfunction".
2. s.3(a)–(c) themes: contraception or miscarriage; sexual performance, libido, stamina in a sexual sense, "vitality" or "vigour" meant that way; menstrual correction (irregular periods, menorrhagia, dysmenorrhoea).
3. Cure language: cure, cures, permanent, guaranteed, 100% effective, miracle, magic, instant relief, no side effects, completely safe, side-effect free, doctor-recommended (unless a named AVVVS vaidyan has actually recommended it, and even then it needs counsel review), clinically proven or tested (unless a study by a recognised body exists and is cited).
4. COVID-19, "immunity booster" or "protection against infections" claims.
5. Before/after, results timelines ("in 7 days"), and percentages.
6. "100% natural" or "100% Ayurvedic" (ASCI found these unsubstantiated). "Ayurvedic Preparation" as printed on the label is fine.

**Allowed (factual, label-derived):** name, form, pack size, price, composition as printed, "Dosage: As directed by the physician", "For external use only", "Reference: Ashtanga Hridayam", manufacturer, shelf life, "Prepared at the AVVVS factory" (pending M7), "AVVVS has prepared Ayurveda medicines in Kozhikode since 1921" (verified in `site.ts`), and the consult prompt "Ask a vaidyan whether this medicine is right for you".

**Blocklist implementation:** `src/lib/medicines/claims.ts` exports `CLAIM_PATTERNS: { id: string; re: RegExp; basis: "DMR-s3" | "DMR-schedule" | "CCPA" | "ASCI" | "AYUSH-COVID" }[]` and `findClaims(text): { id; match }[]`. Build check `scripts/check-claims.ts` (run with `node scripts/check-claims.ts`, added to `package.json` as `"check:claims"`) scans:
- every SHEET text column on rows where `indications_display=show`, plus all `display_name` and `synonyms`
- `src/content/store-policies.ts`
- every string literal in `src/app/store/**` and `src/components/store/**`

It exits 1 on any hit, listing file or handle, column and pattern id. Seed patterns: one per Schedule entry with common synonyms (paralysis|hemiplegia|quadriplegia|facial palsy; diabet; obes; fever; heart|cardiac; blood pressure|hypertension; epilep|fits|seizure; cancer|tumou?r|growth; kidney stone|gall ?stone|calculi; hernia|rupture; tuberculosis|\bTB\b; leucoderma|vitiligo; impoten|erectile|premature ejaculation|libido|sexual (performance|power|stamina); sterility|infertil|PCOS; menstru|menorrh|dysmenorrh|periods; ulcer; asthma (not on the Schedule but disease-specific; flag as `CCPA`); covid|corona; immunity boost), plus the cure words in rule 3. Each pattern carries a short `basis`. This is a tripwire, not legal clearance.

Acceptance: `npm run check:claims` exits 0 on the shipped content and exits 1 when "Helps with knee pain and diabetes" is added to any store string. Add that as a fixture in `src/lib/medicines/claims.test.ts`.

### 5.6 Standard caution lines (DER, every PDP)
Shown in a bordered note, above the composition:
- "Ayurveda medicines should be taken under the guidance of a qualified vaidyan. Dosage: as directed by the physician." (Reworded from the labels. AVVVS to approve, M9.)
- Plus SHEET `cautions_label` verbatim, when present.
- No pregnancy, child-dose or interaction statements unless printed on the label.

Proposed store-only tokens (reconcile them with the new design system; components use tokens only):
`--store-caution-bg: oklch(0.965 0.025 85)` light / `oklch(0.27 0.025 85)` dark; `--store-caution-border: oklch(0.82 0.06 85)` light / `oklch(0.45 0.05 85)` dark. Text uses the system ink token. Contrast must be ≥ 4.5:1, checked in both themes.

---

## 6. Page specs

### 6.1 PDP layout (`/products/[handle]`)
Server Component, except BuyPanel, StickyBuyBar, LabelViewer and the recently-viewed writer.

Desktop ≥1024 px: a 12-column grid. Media in columns 1–7 (sticky at `top: header height + 24px` while the info column scrolls). Info in columns 8–12. Mobile: one column, media first at a 4:5 aspect ratio.

Info column, in order (all text server-rendered):
1. Breadcrumbs: Store › {Form label} › {name} (by form, not by collection)
2. `<h1>` name. Below it, `nameMl` (`lang="ml"`) if present
3. Price + pack size ("₹270 · 200 ml"). "MRP, incl. of all taxes" only if `price_is_mrp=yes`
4. BuyPanel: quantity stepper (1–99), Add to cart, "Ask a vaidyan before buying", "Ask on WhatsApp"; or the gated or out-of-stock variants
5. The delivery line (§3.5)
6. Facts grid as a `<dl>`, 2 columns: Form · Use (internal/external) · Pack · Reference · Prescription · Returnable · Item code. **Only rows with a value render.** No "—" placeholders.
7. Caution note (§5.6)
8. "How to take": dosage (verbatim) + directions
9. "Composition": the basis line + a table (Botanical name in italics · Part · Amount); first 8 rows, then a "Show all {n}" `<details>`
10. "Indications as printed on the label" in a `<details>`, only if D3 passes
11. "Read the label": a button opening LabelViewer on the label image
12. Delivery and returns `<details>` (§3.5)
13. Manufacturer small print

Below the grid: "More {form plural}" (4 cards) → Recently viewed.

For a `draft` row, items 8–10 do not render. Item 11 becomes prominent: "The full composition and directions are printed on the label" + the label thumbnail. No "information coming soon" copy.

**LabelViewer** (`src/components/store/LabelViewer.tsx`, client): a native `<dialog>` with the label image from Shopify at `&width=2000`, pinch and wheel zoom from 1× to 3× (CSS `transform: scale()` + translate; pointer events), "Close" button, Esc to close, focus returns to the trigger. Alt text: "Back label of {name}, showing composition and directions". It is not a substitute for the text, so once the sheet is approved the composition table must also exist in HTML.

**Metadata:** title `{name} · {Form label}`, description `"{name}, {form gloss lower-case}, {pack}. Prepared by Arya Vaidya Vilasini Vaidya Sala, Kozhikode, since 1921. ₹{price}."`. Never `body_html`.
**JSON-LD:** keep `Product` + `Offer` + `BreadcrumbList`. Set `description` to the same safe string. Leave out `aggregateRating` and `review`. Add `additionalProperty` for form, pack size and route only when present.

### 6.2 Store index (`/store`)
1. `<h1>` "Store", with one sentence: "Classical and proprietary Ayurveda medicines from the AVVVS factory in Kozhikode. Not sure what you need? Ask a vaidyan." (the link goes to `/consultation`). The word "factory" depends on M7.
2. Form tiles (§4.1)
3. Recently viewed (≥2 entries)
4. Controls: search (§4.4), sort (Name A–Z default, Price low–high, Price high–low), the facets, an in-stock toggle
5. The grid: 4 columns ≥1280 px, 3 ≥1024, 2 ≥640, 1 below. 24 per page (down from 48, to cut HTML weight). Server-render the first page into the initial HTML: move the `searchParams` read so the default, unfiltered page is static, and only filtered requests stream.
6. Remove the "ledger" view, which is part of the rejected v1 metaphor. Keep `LedgerTable.tsx` until WP-S3 deletes it.

### 6.3 Cart drawer
Lines with a 56 px thumbnail, name, pack, stepper and remove → subtotal → "Shipping is calculated at checkout. Delivered in an estimated 3–4 business days after dispatch." → Checkout → upsell (§4.10) → "Questions? Ask on WhatsApp".

### 6.4 Performance budgets (PLAN §6.1 still applies)
- Images: use a Shopify CDN loader (`src/lib/shopify/image-loader.ts`, `loader` prop on `next/image` returning `${src}&width=${w}`, or `?width=` when the URL has no query), so `/_next/image` is not used for Shopify images. Card `sizes` stays as today.
- `/store` initial HTML ≤ 120 KB uncompressed for page 1 (today: 270 KB).
- The PDP ships no Three.js. Delete the 3D fallback viewer from `ProductGallery` (rule 6: no invented packaging). With no image, show a neutral panel with the product name set in type.

---

## 7. Work packages (Sonnet 5.5, medium effort, one at a time)

Every WP ends with `npx tsc --noEmit`, `npm run lint`, and a check that `http://localhost:3000/store` and `/products/dhanwantharam-thailam` render. Read `node_modules/next/dist/docs/` before using any Next API you have not used in this repo.

| WP | Scope | Files | Acceptance |
|---|---|---|---|
| **S1 Medicine data layer** | Form enum + derivation; sheet TSV parser + zod schema; `getMedicine(handle)` and `getMedicines()` merging Shopify + sheet + derived; seed script; empty `sheet.tsv` with header only | `src/lib/medicines/{forms,sheet,index,policy}.ts`, `src/content/medicines/sheet.tsv`, `scripts/seed-medicine-sheet.mjs`, `docs/data/medicine-sheet-template.tsv` | `node --test src/lib/medicines/forms.test.ts` passes: the 165 live products map to `other` only for the PROPRIETARY-type exceptions, and those are listed. An unknown handle in the sheet fails the build with the handle in the message. A `draft` row exposes no medical fields from `getMedicine`. |
| **S2 Claims tripwire** | `claims.ts` patterns, `scripts/check-claims.ts`, `check:claims` script, tests | `src/lib/medicines/claims.ts`, `claims.test.ts`, `scripts/check-claims.ts`, `package.json` | Behaves per §5.5. `summary()` and `descriptionHtml` no longer render anywhere (grep `descriptionHtml` in `src/app` and `src/components` returns nothing). |
| **S3 PDP rebuild** | §6.1 layout, LabelViewer, facts grid, caution, delivery/returns from `store-policies.ts`, metadata and JSON-LD per §6.1; remove the 3D fallback | `src/app/products/[handle]/*`, `src/components/store/{BuyPanel,LabelViewer,FactsList,CautionNote,PolicyDetails}.tsx`, `src/content/store-policies.ts`, `ProductGallery.tsx` | Dhanwantharam Thailam PDP HTML contains: the name, ₹270, "Ask a vaidyan before buying", the delivery line, and the label button. It contains none of "Paralysis", "Hernia", "Arthritis". JSON-LD validates in the Rich Results test, with no `aggregateRating`. Lighthouse mobile LCP ≤ 2.0 s. |
| **S4 Catalogue rebuild** | §6.2: form tiles, facets, 24 per page, static first page, hide empty collections, remove the ledger view, Shopify image loader | `src/app/store/*`, `src/components/store/{Catalogue,CatalogueControls,catalogue-query,FormTiles,ProductCard}.tsx`, `src/lib/shopify/image-loader.ts` | `/store` HTML ≤ 120 KB and contains 24 product names in the first response (`curl` without JS). No "Cosmetics" tab while that collection is empty. Tile counts equal result counts. |
| **S5 Search** | §4.4 phonetic key, glossary, matching, zero-results state; stop indexing descriptions | `src/lib/medicines/{phonetic,glossary}.ts`, `phonetic.test.ts`, `catalogue-query.ts` | All six test queries in §4.4 pass. A search for "paralysis" returns 0 results. |
| **S6 Selling aids** | Sticky bar (§4.6), quick add (§4.7), recently viewed (§4.8), cart upsell (§4.10), out-of-stock path (§4.11), WhatsApp prefill (§4.3), `/consultation?medicine=` prefill of the booking form's message field | `StickyBuyBar.tsx`, `ProductCard.tsx`, `recently-viewed.ts`, `CartDrawer.tsx`, `src/lib/site.ts` (`whatsappPhoneIndex`), `src/components/booking/BookingForm.tsx` | The §4.6–4.8 acceptance checks pass. Reduced motion: the bar appears without translating. Axe: no nested interactive elements on cards. |
| **S7 E(1) gate** | §5.4 gating across the buy panel, quick add, sticky bar and upsell, driven by `policy.ts` | `src/lib/medicines/policy.ts`, the components above | With a test row `schedule_e1=yes`, that PDP has no Add to cart anywhere and the cart upsell skips it. Flipping `E1_UNKNOWN_IS_GATED` gates every `unknown` row. |
| **S8 Storefront switch-over** | §4.12 items 1–5, including migrating the localStorage cart | `cart-store.ts`, `src/lib/shopify/index.ts` | With the token set: the cookie is set, checkout goes to the Shopify `checkoutUrl`, and an old localStorage cart is migrated once. With the token unset: behaviour is unchanged. |
| **S9 Visual pass** | Apply the new design system (tokens and type from the redesign docs) to every store component. No raw hex values, no new fonts, no AI-slop patterns (CLAUDE.md) | `*.module.css` under `src/components/store` and `src/app/store`, `src/app/products` | Taste-skill inspector pass at 375, 768, 1280 and 1440 px in light and dark. No horizontal scroll at 375 px. |

Order: S1 → S2 → S3 → S4 → S5 → S6 → S7 → S9. S8 runs whenever the token arrives.

---

## 8. Missing inputs and confirmations (AVVVS)

| # | Needed | Blocks |
|---|---|---|
| M1 | Which products contain **Schedule E(1)** ingredients, and whether `unknown` should block online sale | S7, the launch decision |
| M2 | **Counsel sign-off** on the claims policy: whether indications may show at all (D3), body-system navigation (§4.2), reviews (§4.9), the Rich Meal food-vs-drug question | Indications display, §4.2, §4.9 |
| M3 | Which phone number is on **WhatsApp**, and the hours it is answered | §4.3 (UNVERIFIED; defaults to `+91 8089202091`) |
| M4 | Shipping: charges, any free-delivery threshold, whether international orders are accepted (the theme shows EUR, AUD, GBP, JPY), COD availability | §3.5, §4.5 |
| M5 | Whether the Shopify price equals the printed **MRP**, including taxes | The "MRP" wording |
| M6 | The **content sheet**, filled from the physical labels and approved per row (start with the 21 proprietary products and the top sellers) | Every medical field |
| M7 | Which address is the manufacturing licence address (Kakkodi on the Lakshol label; Taluk Road, Puthiyara in the Shopify terms), and the drug licence number | Manufacturer block, "factory" wording |
| M8 | Photos for ARAGWADHARISHTAM (none) and high-resolution front and back label photos for the 100 products with one image | Gallery, LabelViewer |
| M9 | Approval of the English form glosses (§3.4) and the standard caution line (§5.6) | S1, S3 |
| M10 | Whether a back-in-stock notification is wanted, and through which system | §4.11 |
| M11 | Shopify **Storefront API token** + store domain | S8 |
| M12 | Whether the Cosmetics collection (10 unpublished products, Gloveda) should be published, or linked out to glovedaherbals.com | Collection tabs |

UNVERIFIED items used in this document: WhatsApp number (M3); `grams` as pack size (sheet decides); MRP equivalence (M5); the international shipping scope (M4).

---

## 9. Sources

Store data (fetched 2026-11-04): `https://avvvsglobal.com/products.json?limit=250&page=1` (165 products, page 2 empty), `/collections.json`, `/collections/{classical,proprietary,cosmetics}/products.json`, `/pages.json` (shipping, return-policy, term-of-use), CDN back-label images for Dhanwantharam Thailam, Rasnadi Kashayam and Lakshol.

Reference stores:
- Aesop, [Camellia Nut Facial Hydrating Cream](https://www.aesop.com/skin-care/moisturisers/camellia-nut-facial-hydrating-cream/SK11.html) (read in the browser pane)
- Forest Essentials, [Kumkumadi Night Cream](https://www.forestessentialsindia.com/kumkumadi-night-cream.html) and [home](https://www.forestessentialsindia.com/) (browser pane)
- Kama Ayurveda, [Kumkumadi Youth-Revitalising Facial Oil](https://www.kamaayurveda.com/in/kumkumadi-youth-revitalising-facial-oil.html) and [home](https://www.kamaayurveda.com/)
- Kottakkal Arya Vaidya Sala, [store home](https://shop.aryavaidyasala.com/), [Dasamularishtam](https://shop.aryavaidyasala.com/product-detail/dasamularishtam), [Kanasatahwadi Kashayam](https://shop.aryavaidyasala.com/product-detail/kanasatahwadi-kashayam)
- Ritual, [Essential for Women 18+](https://ritual.com/products/essential-for-women-multivitamin). Hims ([forhims.com](https://www.forhims.com/hair-loss/finasteride)) returned 403 and was not used.

Law and regulation: see the links in §5.1. Secondary sources (law-firm notes, news) are marked as such there. The official gazette texts should be checked by counsel.
