# AVVVS catalogue and ingredient audit

Fetched 2026-11-04 from the live store `https://avvvsglobal.com` (Shopify public JSON). Old-site facts come from text already scraped from avvvs.com into `src/content/*` (the Wayback Machine returned HTTP 429 on every request today, so nothing new was read from the archive).

**Outputs**
- `src/content/catalogue.generated.json`: 165 records, one per store product, sorted by title.
- Generator: `C:\Users\arjun\AppData\Local\Temp\claude\e1a83596d2f2787f\64474873-01ab-4444-aa78-667ad7c397cd\scratchpad\build-catalogue.mjs` (run `node build-catalogue.mjs <rawDir> <outJson> <outStats>`; raw store JSON is in `...\scratchpad\raw\`). If the catalogue must be regenerated in the repo, copy this script to `scripts/build-catalogue.mjs` first.
- `src/content/treatments.ts`: already listed every herb that has a botanical name on the old Treatments page (Elakizhi: *Calotropis gigantea*, *Datura metel*, *Vitex negundo*; Podikizhi: *Zizyphus jujuba*, *Dolichos biflorus*, Triphala, *Saussurea costus*, *Zingiber officinale*; Naranga kizhi: *Citrus limon*, *Trigonella foenum*, fennel). This pass added the two materials the page names without a botanical name: "Sesame oil" (Abhyanga) and "Navara rice" (Njavarakizhi). No botanical names were added.

## 1. Headline findings

1. **The store publishes no ingredient lists.** No `body_html` names a single ingredient. A product page (`/products/abala-sudha`, `/products/dhanwantharam-thailam`) carries nothing more than the JSON. The only verified compositions are four AVVVS blog posts on the old site (Rujanth Capsule, Rujanth Liniment, Mezhu Thailam, Lakshol). A fifth post covers Hairgreens hair oil, which is **not sold** on the store.
2. **Herb names in product titles are the next-best evidence.** 102 of 165 titles contain a herb's classical name (for example RASNADI KASHAYAM). In classical naming, "-adi" means "beginning with", so the named herb is the lead ingredient. This shows the herb is in the formula. It does not give the full formula or amounts. In the JSON these are kept apart from `ingredients`, under `title_herbs`.
3. **Body text is indications only.** 157 of 165 products have some body text: 66 have an "Indications:" list and 92 have a sentence of description. 8 are empty. Only 1 states anything about use, and none gives a dose or a warning.
4. **Of the brief's candidates, only Ashwagandha has strong evidence.** It is named in 4 products. Amla (3) and Neem (2) are named only in titles. Brahmi is in 1 title, and that product is out of stock. Turmeric appears only as "Nisa" in one title, a product that has no body text. Ginger is in 1 verified list plus 1 title. **Tulsi does not appear anywhere.**
5. **Better plate candidates:** Rasna (*Alpinia galanga*, 8 products), Bala (*Sida cordifolia*, 7), Guduchi (*Tinospora cordifolia*, 7), Sahachara (*Strobilanthes ciliatus*, 5) and Eranda (*Ricinus communis*, 5). AVVVS's own blog prints the botanical name for each. Each also ties to the Rujanth range, and Sahachara is a typically Kerala herb.

## 2. Catalogue shape

| Metric | Value |
|---|---|
| Products (`products.json?limit=250`, page 2 empty) | 165 |
| Collections (`/collections.json`) | classical 144, proprietary 21, cosmetics 0 (the collection exists but is empty) |
| product_type | KASHAYAM 60, ARISHTAM 27, THAILAM 23, CHOORNAM 21, CAPSULE 11, GHRITHAM 9, LEHYAM 7, PROPRIETARY 4, SYRUP 2, LINIMENT 1 |
| Variants | Every product has 1 variant. RICH MEAL's single option is "Powder"; all others use "Default Title". |
| Price range | INR 12 to INR 1,400 (single variant price, `taxable:false`) |
| Out of stock (`available:false`) | 30 products (marked in the gap table) |
| Tags, vendor | No tags on any product. Vendor is always "avvvsglobal". |
| `grams` | Present on every variant, but it is the **shipping weight**, not the pack size. Stored as `shipping_weight_g`. |
| Image sizes | 112 at 682x1024 (portrait), 30 at 667x667, 24 at 1333x1333, 22 at 1167x1167, 19 at 1024x683, 15 at 1500x1500, and others. 2 are 335x284 (too small for hero use). |

## 3. Field completeness (165 products)

Fields are parsed by `build-catalogue.mjs`. A field counts as complete only when the source text actually states it. Nothing is inferred.

| Field | Rule | Products with field | % |
|---|---|---|---|
| price | variant price > 0 | 165 | 100% |
| images | ≥1 image | 164 | 99% (ARAGWADHARISHTAM has none; 100 products have exactly 1) |
| description | body text before any "Indications:" | 92 | 56% |
| indications | "Indications:" list split on commas | 66 | 40% |
| description OR indications | any body text | 157 | 95% |
| ingredients | from AVVVS blog posts only (body_html has none) | 4 | 2% |
| title_herbs | herb name found in title (not a full composition) | 102 | 62% |
| usage / dosage | sentence with dose, ml, tsp, apply, massage, times a day | 1 | 0.6% (LAKSHADI THAILAM: "Can also be used as a massage oil for carrying women and nursing mother.") |
| pack_size | number + ml/gm in title | 8 | 5% |
| warnings | warning, caution, contraindication, avoid | 0 | 0% |
| form | from product_type (blank for PROPRIETARY) | 161 | 98% |

Per-record `completeness` in the JSON scores 8 fields (description, indications, ingredients, usage, pack_size, warnings, images, price) as 0 or 1, with `score` = mean.

**JSON record shape** (read this before consuming the file): `{handle, title, product_type, form, collections[], price:{amount,currency:"INR",variants}, available, images:[{src,width,height}], description, ingredients:[{name,botanical,part,amount}], ingredients_source, title_herbs:[{id,name,botanical_reference}], title_groups[], indications[], usage, pack_size, shipping_weight_g, sku, warnings, source:"shopify body_html", source_url, completeness}`. `ingredients[].botanical` is as printed by AVVVS. `title_herbs[].botanical_reference` is a standard pharmacopoeia identification and was **not** printed by AVVVS, except where the blog prints the same pairing (Rasna, Bala, Guduchi, Guggulu, Sahachara, Eranda, Shunti, Devadaru, Karpoora, Neeli).

## 4. Verified compositions (AVVVS text)

| Product (store handle) | Ingredients exactly as printed | Source |
|---|---|---|
| RUJANTH CAPSULE (`rujanth-capsule`) | Guggulu *Commiphora mukul*, Shallaki *Boswellia serrata*, Rasna *Alpinia galanga*, Eranda *Ricinus communis*, Guduchi *Tinospora cordifolia*, Sahachara *Strobilanthes ciliatus*, Shunti *Zingiber officinale* | avvvs.com/rujanth-capsules-avvvs-solution-for-a-pain-free-flexible-body/ |
| RUJANTH LINIMENT (`rujanth-linment`) | Bala *Sida cordifolia*, Raktamaricha *Capsicum annuum*, Sahachara *Strobilanthes ciliatus*, Shigru *Moringa oleifera*, Nirgundi *Vitex negundo*, Eranda *Ricinus communis*, Tila *Sesamum indicum*, Karpoora *Cinnamomum camphora*; also liquid paraffin, methyl salicylate, menthol | avvvs.com/soothing-healing-pain-reliever-rujanth-liniment/ |
| MEZHU THAILAM (`mezhuthailam`) | Tila Thailam (sesame oil), Madhucchista beeswax of *Apis cerana indica*, Sarjarasa (exudate of *Vateria indica*), Karpoora (bark extract of *Cinnamomum camphora*), Devadaru *Cedrus deodara*, Sambrani (extract of *Styrax benzoin*), Shallaki *Boswellia serrata* | avvvs.com/avvvs-mezhu-thailam-the-sure-shot-remedy-for-aches-and-pains/ |
| LAKSHOL (`lakshol`) | Laksha, lac resin by *Laccifer lacca*; Karpoora *Cinnamomum camphora*; Devadaru *Cedrus deodara* | avvvs.com/active-lifestyle-with-pain-free-flexible-youthful-bones-and-joints-with-avvvs-lakshol/ |
| Hairgreens hair oil (**not on store**) | "Terminalia chebula or Vibheetaki" (source error: Vibhitaki is *T. bellirica*), Bhringaraja *Eclipta prostrata*, Amalaki *Emblica officinalis*, Neelini *Indigofera tinctoria* | avvvs.com/ayurveda-traditional-complete-hair-care-avvvs-is-here-for-complete-haircare/ |

None of these lists gives amounts. Store handle typos to keep: `rujanth-linment` and `mezhuthailam`.

## 5. Top 15 botanicals by product count (verified lists + herbs named in titles, distinct products)

| Rank | Herb (classical / Malayalam) | Botanical | Products | Evidence |
|---|---|---|---|---|
| 1 | Rasna | *Alpinia galanga* (AVVVS print) | 8 | 7 titles (RASNADI KASHAYAM, MAHARASNADI KASHAYAM, RASNADI CHOORNAM 10 GM & 50 GM, RASNAIRANDADI, RASNAPANCHAKAM, RASNASAPTHAKAM) + Rujanth Capsule list |
| 2 | Guduchi / Amrita | *Tinospora cordifolia* (AVVVS print) | 7 | 6 titles (AMRITARISHTAM, AMRITHOTHARAM, GULOOCHYADI, BALAGULOOCHYADI, VASAGULOOCHYADI, GUDOOCHIPARPATAKADI) + Rujanth Capsule |
| 3 | Bala | *Sida cordifolia* (AVVVS print) | 7 | 6 titles (BALARISHTAM, KSHEERABALA THAILAM, BALASWAGANDHADI THAILAM, BALAGULOOCHYADI, BALAJEERAKADI, SAHACHARABALADI) + Rujanth Liniment |
| 4 | Haritaki | *Terminalia chebula* | 5 | ABHAYARISHTAM, DASAMOOLA HARITAKI, PATHYAKSHADATHRYADI KASHAYAM, TRIPHALA CHOORNAM, THRIPHALADI KERAM |
| 5 | Eranda / Gandharvahasta | *Ricinus communis* (AVVVS print) | 5 | GANDHARVAHASTADI CASTOR OIL, GANDHARVAHASTHADI KASHAYAM, RASNAIRANDADI + Rujanth Capsule, Rujanth Liniment |
| 6 | Sahachara | *Strobilanthes ciliatus* (AVVVS print) | 5 | SAHACHARADI KASHAYAM, SAHACHARADI THAILAM, SAHACHARABALADI + Rujanth Capsule, Rujanth Liniment |
| 7 | Ashwagandha | *Withania somnifera* | 4 | ASHWAGANDHA CAPSULE, ASWAGANDHA CHOORNAM, ASWAGANDHARISHTAM, BALASWAGANDHADI THAILAM |
| 8 | Guggulu | *Commiphora mukul* (AVVVS print) | 4 | GUGGULUTHIKTHAKAM KASHAYAM, GUGGULUTIKTAKA GHRITAM, GUGGULUPACHAPALAM CHOORNAM + Rujanth Capsule |
| 9 | Karpoora (camphor) | *Cinnamomum camphora* (AVVVS print) | 4 | KARPOORADI THALAM + Lakshol, Mezhu Thailam, Rujanth Liniment |
| 10 | Devadaru | *Cedrus deodara* (AVVVS print) | 3 | BHADRADHARVADI KASHAYAM + Lakshol, Mezhu Thailam |
| 11 | Amalaki (Amla) | *Phyllanthus emblica* | 3 | TRIPHALA CHOORNAM, THRIPHALADI KERAM, PATHYAKSHADATHRYADI KASHAYAM ("dhatri") |
| 12 | Vibhitaki | *Terminalia bellirica* | 3 | same three Triphala-named products |
| 13 | Bhringaraja / Kayyunyam | *Eclipta prostrata* | 3 | BRINGARAJASAVAM, KAYYUNYADI KERAM, NEELIBRINGADI KERAM |
| 14 | Ela (cardamom) | *Elettaria cardamomum* | 3 | ELADI CHOORNAM, ELADI KERAM, ELAKANADI KASHAYAM |
| 15 | Khadira | *Senegalia catechu* | 3 | KHADIRARISHTAM, KATAKAKHADIRADI, MUSALIKHADIRADI |

Next with 2 each: Aragwadha *Cassia fistula*, Arjuna *Terminalia arjuna*, Jeeraka, Dadima, Draksha, Manjishta *Rubia cordifolia*, Nimba (neem), Patola, Punarnava, Vasa, Shallaki *Boswellia serrata* (2 verified lists), Kataka, Durdura/Kanaka *Datura metel*. Full counts: `title_herbs` in the JSON.

Group names in titles (members are implied, not printed): Dashamoola (4 products), Katutrayam (1: includes ginger), Panchakola (1: includes ginger), Nalpamara (1), Panchatiktaka (1), Ashtavarga (1). These are not counted above.

## 6. Brief candidate verification

| Candidate | Appears? | Products | Strength | Plate verdict |
|---|---|---|---|---|
| Ashwagandha *Withania somnifera* | **Yes** | ASHWAGANDHA CAPSULE, ASWAGANDHA CHOORNAM, ASWAGANDHARISHTAM, BALASWAGANDHADI THAILAM | Named in 4 titles; no AVVVS composition list | Use it. It is the only candidate with a single-herb product (the capsule and the choornam). |
| Turmeric *Curcuma longa* | **Weak** | NISAKATHAKADI KASHAYAM ("Nisa" = Haridra) | 1 title. The product has no body text. | Drop it, or ask AVVVS to confirm turmeric in a named product. |
| Brahmi *Bacopa monnieri* | **Weak** | BRAHMI GHRITAM (out of stock) | 1 title. Botanical not printed; Kerala usage can mean *Bacopa monnieri* or *Centella asiatica*. UNVERIFIED which. | Use only after AVVVS confirms the species and restocks. |
| Amla *Phyllanthus emblica* | **Yes (title)** | TRIPHALA CHOORNAM, THRIPHALADI KERAM, PATHYAKSHADATHRYADI KASHAYAM | 3 titles (Triphala is by definition Haritaki + Vibhitaki + Amalaki). CHYAVANAPRASH is not counted: its title does not name Amla. | Use it as a "Triphala" plate (three fruits on one plate). |
| Neem *Azadirachta indica* | **Yes (title)** | NIMBADI CHOORNAM, NIMBADI KASHAYAM | 2 titles | Usable but low priority |
| Ginger *Zingiber officinale* | **Yes** | RUJANTH CAPSULE (verified list, "Shunti"), KOTTAMCHUKKADI CHOORNAM ("Chukku") | 1 verified + 1 title (+ implied in Katutrayam, Panchakola). It is also a Podikizhi herb on the Treatments page. | Use it. It links store to clinic. |
| Tulsi *Ocimum tenuiflorum* | **No** | none | Not in any title, body, blog list or treatment | **Drop it.** |

## 7. Recommended plate set (verified, Kerala-led)

Choose 7 plates in this order. Each pairs a herb with real products and, where possible, with a clinic therapy.

| # | Plate | Botanical (print) | Why | Products to link |
|---|---|---|---|---|
| 1 | Rasna | *Alpinia galanga* | Most frequent (8). AVVVS prints the binomial. Kerala reads Rasna as *A. galanga*, not North India's *Pluchea lanceolata*. | rasnadi-kashayam, rasnadi-choornam-50-gm, rujanth-capsule |
| 2 | Sahachara | *Strobilanthes ciliatus* | Kerala-specific herb. AVVVS prints it. Used in 5 products, including both Rujanth lines. | sahacharadi-thailam, rujanth-linment |
| 3 | Bala | *Sida cordifolia* | 7 products; Ksheerabala and Balaswagandhadi are classic Kerala oils | ksheerabala-thailam-200-ml, balaswagandhadi-thailam |
| 4 | Guduchi | *Tinospora cordifolia* | 7 products, AVVVS print | amritharishtam, guloochyadi-kashayam |
| 5 | Ashwagandha | *Withania somnifera* | Brief's own example; 4 products | aswaganda-cap, aswagandha-choornam |
| 6 | Nirgundi / Karinochi | *Vitex negundo* | In Rujanth Liniment (AVVVS print) and in the Elakizhi therapy ("Karinochiyila"); links store and clinic | rujanth-linment; therapy elakizhi |
| 7 | Chukku (dry ginger) | *Zingiber officinale* | Rujanth Capsule, Kottamchukkadi Choornam, Podikizhi therapy | kottam-chukkadi-choornam, rujanth-capsule; therapy podikizhi |

Reserve plates: Ummam/Durdura *Datura metel* (Elakizhi therapy, DURDURAPATRADI KERAM, KANAKASAVAM); Kottam *Saussurea costus* (Podikizhi, KOTTAMCHUKKADI); Triphala (Amla, Haritaki, Vibhitaki); Chemparuthi *Hibiscus rosa-sinensis* (CHEMPERUTHYADI KERAM, Malayalam-named); Ayyappana *Ayapana triplinervis* (AYYAPPALA KERAM, Malayalam-named).

**Dhanwantharam** (DHANWANTHARAM THAILAM, DHANWANTHARAM KUZHAMBU, DHANWATHARAM KASHAYAM) is named after Dhanvantari, not after a herb. Its classical composition (Bala root base and more) is textbook knowledge, but AVVVS has not published it. UNVERIFIED for AVVVS: do not show its components as AVVVS ingredients until AVVVS supplies the label.

Every plate's "traditional use" line must quote AVVVS text: an indication from the linked product's body, or a benefit from `treatments.ts`. No herb-level health claims.

## 8. Policies (as stated on avvvsglobal.com)

`/policies/shipping-policy`, `/policies/refund-policy`, `/policies/privacy-policy` and `/policies/terms-of-service` all return **404**. The store's policies live as Pages instead (`/pages.json`):

| Page | Updated | What it states |
|---|---|---|
| `/pages/shipping` | 2023-09-09 | "Estimated delivery time is 3-4 days (post shipping, business days exclude sundays and other holidays)." Delivery estimate "may vary slightly from state to state". Delays from logistics are excluded from liability. **No charges or regions stated.** |
| Site header (home page) | live | Banner "SHIPPING WITH IN INDIA". Cart text "Taxes and shipping calculated at checkout". The theme has a free-delivery message string, but no threshold is visible. **Regions:** India only, as the banner states. **Charges:** UNVERIFIED. |
| `/pages/return-policy` | 2023-09-09 | Full refund if the item is defective, lost or damaged in transit, past expiry, or missing from the order. Card/net-banking refunds take 7–10 working days. COD refunds need a voided cheque or bank statement image and "may take as long as 3 weeks"; the "customer wallet" is faster. Damaged items: email damaged@avvvsglobal.com with the order ID as subject and a photo. Missing items: email missing@avvvsglobal.com; AVVVS reviews the packing video. Non-defective returns: unopened, unused, within **30 working days** of receipt, minus a **20% restocking charge**. That charge may be waived (100% refund to wallet) when a doctor changes the prescription, after verification. Products marked "Note: This item cannot be returned for a refund or exchange." are excluded. |
| `/pages/privacy-policy` | 2023-09-09 | 19k characters. Operator: Arya Vaidya Vilasini Vaidya Sala, registered office Taluk Road, Puthiyara PO, Kozhikode, Kerala 673004. It still refers to `www.avvvsglobal.shopify.com` and avvvs.com. |
| `/pages/term-of-use` | 2023-09-09 | Contract concludes on "Shipment Confirmation". There is a **prescription medication policy**: some products are sold only "against a valid medical prescription issued by an Ayurveda doctor", and AVVVS cancels the order if the prescription shows a discrepancy. Products are sold "through its licensed premises". No shipping charges or countries. |
| `/pages/contact`, `/faqs`, `/payments`, `/tracking` | 2023-09 | Empty bodies |

The store's export claim (Russia, Austria, Slovenia, Colombia) refers to the medicines business, not to online orders. Online shipping stays India-only unless AVVVS says otherwise.

## 9. Certification evidence

| Claim | Where | Quote |
|---|---|---|
| GMP-certified factory | Store About Us page, `https://avvvsglobal.com/pages/about-us` (updated 2023-09-09), fetched today | "The present GMP-certified factory with state-of-the-art technology..." |
| GMP-certified factory | Old site About page, `avvvs.com/about-us` (scraped to `src/content/about.ts` line 54) | same sentence |
| GMP standard | Old-site blog: Mezhu Thailam, Lakshol and Rujanth Liniment posts (`src/content/blog.ts` lines 76, 116, 212); blog intro line 8 | "manufactured ... in GMP standard facility"; "manufactured and packed according to GMP quality standards" |
| Licensed premises | Store Term of Use | "sold by AVVVS ... through its licensed premises" |
| "International standards" | Store About Us | "raw material sourcing ... are all of the international standards" (vague; no standard named) |

**Not found anywhere:** a GMP certificate number, the issuing authority (for example the Kerala Drugs Control Department under AYUSH), drug manufacturing licence numbers, ISO, AYUSH Premium Mark, FSSAI (relevant to RICH MEAL, a food), or any export certification. Wording the site can use: "GMP-certified factory in Kozhikode". It must not name a certifying body or number until AVVVS supplies the certificate.

**Claims to keep off the new site:** the store's product SEO description for ABALA SUDHA calls it "A clinically Proven Ayurvedic Medicine". The blog says "100% natural", "side effect free" and "complete cure". These are unsupported medical claims (brief rule 7). Do not reuse them.

## 10. Missing inputs to request from AVVVS

1. **Label ingredient lists with amounts** for every product, starting with the 7 plate products and the 59 whose titles name no herb (for example DHANWANTHARAM THAILAM, CHYAVANAPRASH, MURIVENNA, PINDA THAILAM, the proprietary capsules HEPRO, DESIRE, AVLAX, SLEPAN, RED IRONS, DIASTAT, RELIEVE O, MENOCARE, JEEVANA, ABALA SUDHA, PRASOOTHIKA SUDHA, DIGENOL, RICH MEAL).
2. **Dosage and directions** as printed on labels (164 of 165 have none).
3. **Warnings/contraindications** (0 of 165), especially for products sold for pregnancy and nursing (PRASOOTHIKA SUDHA, PRASOOTHIKAMRITHA RASAYANAM, LAKSHADI THAILAM).
4. **Pack size / net quantity** (157 of 165 missing; only 8 titles carry it).
5. **Which products need a prescription** (Term of Use says some do; no product is marked).
6. **Which products are non-returnable** (policy refers to a per-product note; none seen).
7. **Shipping charges, free-shipping threshold, COD availability, international shipping yes/no.**
8. **GMP certificate** (issuer, number, validity) and the drug manufacturing licence number. Also confirm the "international standards" claim or withdraw it.
9. **Brahmi species** used in BRAHMI GHRITAM (*Bacopa monnieri* or *Centella asiatica*), and whether it will be restocked.
10. **Product photography**: ARAGWADHARISHTAM has no image. 100 products have only one. 2 images are 335x284. The Scene 05 hero needs high-resolution packshots (≥3000 px, transparent or neutral background) of the hero products, plus label artwork or dielines for 3D packaging.
11. **Product descriptions** for the 8 empty bodies: ARJUNADI, GUDOOCHIPARPATAKADI, MAHATHIKTHAKAM, NISAKATHAKADI, PALASHADI, PATADI, PRASARANYADI and YAVADI KASHAYAM.
12. **Hairgreens hair oil and shampoo**: still made? Not on the store. The empty `cosmetics` collection suggests a cosmetics line exists or is planned.
13. **Sourcing and manufacturing facts** for Scenes 03–04 (raw-material sourcing regions, the real extraction/decoction process). Without them, those scenes stay labelled as a visual metaphor.
14. Correction of the blog's "Terminalia chebula or Vibheetaki" pairing, if the Hairgreens list is reused.

## 11. Per-product data gaps

**Bold** = missing. "Title herbs" are the herbs named in the title, not a composition. Every product lacks warnings, so that column is omitted. 30 products are out of stock.

| # | Title | Type | INR | In stock | Images | Indications/description | Ingredients | Usage | Pack size | Title herbs |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ABALA SUDHA | PROPRIETARY | 122 | yes | 1 | yes | **no** | **no** | **no** | - |
| 2 | ABHAYARISHTAM 450 ml | ARISHTAM | 150 | yes | 1 | yes | **no** | **no** | 450 ml | Haritaki |
| 3 | AJAMAMSA RASAYANAM | LEHYAM | 400 | yes | 2 | yes | **no** | **no** | **no** | - |
| 4 | AMRITARISHTAM | ARISHTAM | 140 | yes | 1 | yes | **no** | **no** | **no** | Guduchi |
| 5 | AMRITHOTHARAM KASHAYAM | KASHAYAM | 165 | yes | 1 | yes | **no** | **no** | **no** | Guduchi |
| 6 | ARAGWADHADI KASHAYAM | KASHAYAM | 180 | yes | 1 | yes | **no** | **no** | **no** | Aragwadha |
| 7 | ARAGWADHARISHTAM | ARISHTAM | 130 | yes | **0** | yes | **no** | **no** | **no** | Aragwadha |
| 8 | ARAVINDASAVAM | ARISHTAM | 155 | **no** | 1 | yes | **no** | **no** | **no** | Aravinda |
| 9 | ARDHAVILWAM KASHAYAM | KASHAYAM | 190 | yes | 2 | yes | **no** | **no** | **no** | Bilva |
| 10 | ARIMEDADI TAILAM | THAILAM | 220 | yes | 2 | yes | **no** | **no** | **no** | Arimeda |
| 11 | ARJUNADI KASHAYAM | KASHAYAM | 230 | yes | 2 | **no** | **no** | **no** | **no** | Arjuna |
| 12 | ASANADIGANA KASHAYAM | KASHAYAM | 225 | yes | 3 | yes | **no** | **no** | **no** | Asana |
| 13 | ASHTACHOORNAM | CHOORNAM | 100 | yes | 1 | yes | **no** | **no** | **no** | - |
| 14 | ASHTAVARGAM KASHAYAM | KASHAYAM | 185 | yes | 1 | yes | **no** | **no** | **no** | - |
| 15 | ASHWAGANDHA CAPSULE | CAPSULE | 120 | yes | 2 | yes | **no** | **no** | **no** | Ashwagandha |
| 16 | ASOKARISHTAM | ARISHTAM | 155 | yes | 1 | yes | **no** | **no** | **no** | Ashoka |
| 17 | ASWAGANDHA CHOORNAM | CHOORNAM | 110 | yes | 1 | yes | **no** | **no** | **no** | Ashwagandha |
| 18 | ASWAGANDHARISHTAM | ARISHTAM | 225 | yes | 1 | yes | **no** | **no** | **no** | Ashwagandha |
| 19 | AVIPATHY CHOORNAM | CHOORNAM | 85 | yes | 1 | yes | **no** | **no** | **no** | - |
| 20 | AVLAX CAPSULE | CAPSULE | 226 | yes | 2 | yes | **no** | **no** | **no** | - |
| 21 | AYUSHKWATH CHOORNAM | CHOORNAM | 160 | yes | 2 | yes | **no** | **no** | **no** | - |
| 22 | AYYAPPALA KERAM | THAILAM | 280 | yes | 2 | yes | **no** | **no** | **no** | Ayyappana |
| 23 | BALAGULOOCHYADI KASHAYAM | KASHAYAM | 155 | **no** | 1 | yes | **no** | **no** | **no** | Bala, Guduchi |
| 24 | BALAJEERAKADI KASHAYAM | KASHAYAM | 175 | **no** | 1 | yes | **no** | **no** | **no** | Bala, Jeeraka |
| 25 | BALARISHTAM | ARISHTAM | 170 | yes | 1 | yes | **no** | **no** | **no** | Bala |
| 26 | BALASWAGANDHADI THAILAM | THAILAM | 265 | yes | 2 | yes | **no** | **no** | **no** | Ashwagandha, Bala |
| 27 | BHADRADHARVADI KASHAYAM | KASHAYAM | 135 | **no** | 2 | yes | **no** | **no** | **no** | Devadaru |
| 28 | BRAHMI GHRITAM | GHRITHAM | 330 | **no** | 1 | yes | **no** | **no** | **no** | Brahmi |
| 29 | BRIHATYADI KASHAYAM | KASHAYAM | 170 | yes | 1 | yes | **no** | **no** | **no** | Brihati |
| 30 | BRINGARAJASAVAM | ARISHTAM | 170 | **no** | 2 | yes | **no** | **no** | **no** | Bhringaraja |
| 31 | CHANDANASAVAM | ARISHTAM | 130 | yes | 1 | yes | **no** | **no** | **no** | Chandana |
| 32 | CHANDRASOORADI KASHAYAM | KASHAYAM | 190 | **no** | 1 | yes | **no** | **no** | **no** | Chandrasura |
| 33 | CHAVIKASAVAM | ARISHTAM | 150 | yes | 1 | yes | **no** | **no** | **no** | Chavika |
| 34 | CHEMPERUTHYADI KERAM | THAILAM | 245 | yes | 1 | yes | **no** | **no** | **no** | Chemparuthi |
| 35 | CHIRUVILWADI KASHAYAM | KASHAYAM | 225 | yes | 2 | yes | **no** | **no** | **no** | Chirubilva |
| 36 | CHYAVANAPRASH | LEHYAM | 330 | yes | 2 | yes | **no** | **no** | **no** | - |
| 37 | DADIMADI GHRITAM | GHRITHAM | 350 | **no** | 1 | yes | **no** | **no** | **no** | Dadima |
| 38 | DADIMASHTAKA CHOORNAM | CHOORNAM | 12 | yes | 1 | yes | **no** | **no** | **no** | Dadima |
| 39 | DANTHYARISHTAM | ARISHTAM | 130 | yes | 2 | yes | **no** | **no** | **no** | Danti |
| 40 | DASAMOOLA HARITAKI | LEHYAM | 144 | **no** | 2 | yes | **no** | **no** | **no** | Haritaki |
| 41 | DASAMOOLA KATUTHRAYAM KASHAYAM | KASHAYAM | 200 | yes | 1 | yes | **no** | **no** | **no** | - |
| 42 | DASAMOOLAM KASHAYAM | KASHAYAM | 180 | yes | 1 | yes | **no** | **no** | **no** | - |
| 43 | DASAMOOLARISHTAM | ARISHTAM | 185 | yes | 1 | yes | **no** | **no** | **no** | - |
| 44 | DESIRE CAPSULE | CAPSULE | 300 | yes | 2 | yes | **no** | **no** | **no** | - |
| 45 | DHANADANAYANADI KASHAYAM | KASHAYAM | 220 | yes | 3 | yes | **no** | **no** | **no** | - |
| 46 | DHANWANTHARAM KUZHAMBU | THAILAM | 240 | yes | 2 | yes | **no** | **no** | **no** | - |
| 47 | DHANWANTHARAM THAILAM | THAILAM | 270 | yes | 2 | yes | **no** | **no** | **no** | - |
| 48 | DHANWATHARAM KASHAYAM | KASHAYAM | 215 | yes | 3 | yes | **no** | **no** | **no** | - |
| 49 | DIASTAT CAPSULE | CAPSULE | 210 | yes | 2 | yes | **no** | **no** | **no** | - |
| 50 | DIGENOL SYRUP | SYRUP | 160 | yes | 2 | yes | **no** | **no** | **no** | - |
| 51 | DRAKSHADI KASHAYAM | KASHAYAM | 220 | yes | 1 | yes | **no** | **no** | **no** | Draksha |
| 52 | DRAKSHARISHTAM | ARISHTAM | 175 | yes | 1 | yes | **no** | **no** | **no** | Draksha |
| 53 | DURDURAPATRADI KERAM 200 ml | THAILAM | 300 | yes | 1 | yes | **no** | **no** | 200 ml | Durdura |
| 54 | DUSPARSAKADI KASHAYAM | KASHAYAM | 230 | yes | 1 | yes | **no** | **no** | **no** | - |
| 55 | ELADI CHOORNAM | CHOORNAM | 120 | yes | 1 | yes | **no** | **no** | **no** | Ela |
| 56 | ELADI KERAM | THAILAM | 265 | yes | 1 | yes | **no** | **no** | **no** | Ela |
| 57 | ELAKANADI KASHAYAM | KASHAYAM | 205 | **no** | 1 | yes | **no** | **no** | **no** | Ela |
| 58 | GANDHARVAHASTADI CASTOR OIL | THAILAM | 210 | yes | 2 | yes | **no** | **no** | **no** | Eranda |
| 59 | GANDHARVAHASTHADI KASHAYAM | KASHAYAM | 175 | yes | 1 | yes | **no** | **no** | **no** | Eranda |
| 60 | GOKSHURA CHOORNAM | CHOORNAM | 95 | yes | 1 | yes | **no** | **no** | **no** | Gokshura |
| 61 | GUDOOCHIPARPATAKADI KASHAYAM | KASHAYAM | 190 | **no** | 1 | **no** | **no** | **no** | **no** | Guduchi |
| 62 | GUGGULUPACHAPALAM CHOORNAM | CHOORNAM | 130 | **no** | 1 | yes | **no** | **no** | **no** | Guggulu |
| 63 | GUGGULUTHIKTHAKAM KASHAYAM | KASHAYAM | 270 | yes | 2 | yes | **no** | **no** | **no** | Guggulu |
| 64 | GUGGULUTIKTAKA GHRITAM | GHRITHAM | 445 | yes | 1 | yes | **no** | **no** | **no** | Guggulu |
| 65 | GULOOCHYADI KASHAYAM | KASHAYAM | 235 | yes | 1 | yes | **no** | **no** | **no** | Guduchi |
| 66 | HEPRO CAPSULE | CAPSULE | 210 | **no** | 2 | yes | **no** | **no** | **no** | - |
| 67 | HIMASAGARA THAILAM | THAILAM | 320 | **no** | 2 | yes | **no** | **no** | **no** | - |
| 68 | HINGUVACHADI CHOORNAM | CHOORNAM | 90 | **no** | 1 | yes | **no** | **no** | **no** | Hingu, Vacha |
| 69 | INDUKANTHA GRITHAM | GHRITHAM | 370 | yes | 2 | yes | **no** | **no** | **no** | - |
| 70 | INDUKANTHAM KASHAYAM | KASHAYAM | 175 | yes | 1 | yes | **no** | **no** | **no** | - |
| 71 | JATAMAYADI CHOORNAM | CHOORNAM | 80 | yes | 1 | yes | **no** | **no** | **no** | - |
| 72 | JEERAKADYARISHTAM | ARISHTAM | 190 | yes | 2 | yes | **no** | **no** | **no** | Jeeraka |
| 73 | JEEVANA | LEHYAM | 160 | yes | 2 | yes | **no** | **no** | **no** | - |
| 74 | JEEVANTYADI KASHAYAM | KASHAYAM | 195 | **no** | 1 | yes | **no** | **no** | **no** | Jeevanti |
| 75 | KALYANA GULAM | LEHYAM | 70 | yes | 2 | yes | **no** | **no** | **no** | - |
| 76 | KALYANAKA GHRITAM | GHRITHAM | 365 | yes | 1 | yes | **no** | **no** | **no** | - |
| 77 | KALYANAKAM KASHAYAM | KASHAYAM | 270 | yes | 2 | yes | **no** | **no** | **no** | - |
| 78 | KANAKASAVAM | ARISHTAM | 140 | yes | 1 | yes | **no** | **no** | **no** | Durdura |
| 79 | KAPIKACHU CHOORNAM | CHOORNAM | 70 | yes | 2 | yes | **no** | **no** | **no** | Kapikachu |
| 80 | KARPASASTYADI THAILAM 200ml | THAILAM | 215 | yes | 2 | yes | **no** | **no** | 200 ml | Karpasa |
| 81 | KARPOORADI THALAM 200 ml | THAILAM | 220 | yes | 2 | yes | **no** | **no** | 200 ml | Karpoora |
| 82 | KATAKAKHADIRADI KASHAYAM | KASHAYAM | 160 | **no** | 1 | yes | **no** | **no** | **no** | Khadira, Kataka |
| 83 | KAYYUNYADI KERAM | THAILAM | 250 | yes | 1 | yes | **no** | **no** | **no** | Bhringaraja |
| 84 | KHADIRARISHTAM | ARISHTAM | 185 | yes | 1 | yes | **no** | **no** | **no** | Khadira |
| 85 | KOKILAKSHAM KASHAYAM | KASHAYAM | 160 | yes | 1 | yes | **no** | **no** | **no** | Kokilaksha |
| 86 | KOLAKULATHADI CHOORNAM | CHOORNAM | 60 | yes | 1 | yes | **no** | **no** | **no** | Kola, Kulattha |
| 87 | KOTTAMCHUKKADI CHOORNAM | CHOORNAM | 60 | yes | 1 | yes | **no** | **no** | **no** | Chukku, Kottam |
| 88 | KSHEERABALA THAILAM 200 ml | THAILAM | 325 | yes | 2 | yes | **no** | **no** | 200 ml | Bala |
| 89 | KUMARYASAVAM | ARISHTAM | 165 | yes | 1 | yes | **no** | **no** | **no** | Kumari |
| 90 | KUTAJARISHTAM | ARISHTAM | 150 | yes | 2 | yes | **no** | **no** | **no** | Kutaja |
| 91 | LAKSHADI THAILAM | THAILAM | 240 | yes | 2 | yes | **no** | yes | **no** | - |
| 92 | LAKSHOL | PROPRIETARY | 95 | yes | 3 | yes | yes (blog) | **no** | **no** | - |
| 93 | LOHASAVAM | ARISHTAM | 155 | yes | 1 | yes | **no** | **no** | **no** | - |
| 94 | MAHAMANJISHTADI KASHAYAM | KASHAYAM | 235 | yes | 1 | yes | **no** | **no** | **no** | Manjishta |
| 95 | MAHAMASHA THAILAM 200ml | THAILAM | 345 | **no** | 1 | yes | **no** | **no** | 200 ml | Masha |
| 96 | MAHARASNADI KASHAYAM | KASHAYAM | 245 | **no** | 2 | yes | **no** | **no** | **no** | Rasna |
| 97 | MAHATHIKTHAKAM KASHAYAM | KASHAYAM | 265 | yes | 1 | **no** | **no** | **no** | **no** | - |
| 98 | MAHATIKTAKAM GHRITAM | GHRITHAM | 375 | yes | 1 | yes | **no** | **no** | **no** | - |
| 99 | MANJISHTADI KASHAYAM | KASHAYAM | 230 | yes | 1 | yes | **no** | **no** | **no** | Manjishta |
| 100 | MENOCARE CAPSULE | CAPSULE | 210 | yes | 1 | yes | **no** | **no** | **no** | - |
| 101 | MEZHU THAILAM | THAILAM | 99 | yes | 2 | yes | yes (blog) | **no** | **no** | - |
| 102 | MURIVENNA | THAILAM | 200 | yes | 2 | yes | **no** | **no** | **no** | - |
| 103 | MUSALIKHADIRADI KASHAYAM | KASHAYAM | 155 | **no** | 1 | yes | **no** | **no** | **no** | Khadira, Musali |
| 104 | MUSTARISHTAM | ARISHTAM | 145 | yes | 1 | yes | **no** | **no** | **no** | Musta |
| 105 | NADI KASHAYAM | KASHAYAM | 215 | yes | 1 | yes | **no** | **no** | **no** | - |
| 106 | NALPAMARADI KERAM | THAILAM | 240 | yes | 1 | yes | **no** | **no** | **no** | - |
| 107 | NAYOPAYAM KASHAYAM | KASHAYAM | 225 | yes | 1 | yes | **no** | **no** | **no** | - |
| 108 | NEELIBRINGADI KERAM | THAILAM | 305 | yes | 1 | yes | **no** | **no** | **no** | Bhringaraja, Neeli |
| 109 | NIMBADI CHOORNAM | CHOORNAM | 75 | yes | 1 | yes | **no** | **no** | **no** | Nimba |
| 110 | NIMBADI KASHAYAM | KASHAYAM | 175 | yes | 1 | yes | **no** | **no** | **no** | Nimba |
| 111 | NISAKATHAKADI KASHAYAM | KASHAYAM | 180 | yes | 1 | **no** | **no** | **no** | **no** | Nisha, Kataka |
| 112 | PADOLAKATUROHINYADI KASHAYAM | KASHAYAM | 260 | yes | 1 | yes | **no** | **no** | **no** | Patola, Katurohini |
| 113 | PALASHADI KASHAYAM | KASHAYAM | 220 | yes | 2 | **no** | **no** | **no** | **no** | Palasha |
| 114 | PANCHAKOLA CHOORNAM | CHOORNAM | 110 | **no** | 1 | yes | **no** | **no** | **no** | - |
| 115 | PANCHATHIKTHAKAM KASHAYAM | KASHAYAM | 205 | yes | 1 | yes | **no** | **no** | **no** | - |
| 116 | PARTHADYARISHTAM | ARISHTAM | 155 | yes | 1 | yes | **no** | **no** | **no** | Arjuna |
| 117 | PATADI KASHAYAM | KASHAYAM | 200 | **no** | 1 | **no** | **no** | **no** | **no** | Patha |
| 118 | PATHYAKSHADATHRYADI KASHAYAM | KASHAYAM | 180 | yes | 2 | yes | **no** | **no** | **no** | Haritaki, Vibhitaki, Amalaki |
| 119 | PATOLAMOOLADI KASHAYAM | KASHAYAM | 200 | yes | 3 | yes | **no** | **no** | **no** | Patola |
| 120 | PHALASARPIS | GHRITHAM | 322 | **no** | 1 | yes | **no** | **no** | **no** | - |
| 121 | PINDA THAILAM | THAILAM | 220 | yes | 2 | yes | **no** | **no** | **no** | - |
| 122 | PIPPALYASAVAM | ARISHTAM | 140 | yes | 1 | yes | **no** | **no** | **no** | Pippali |
| 123 | PRASARANYADI KASHAYAM | KASHAYAM | 180 | **no** | 1 | **no** | **no** | **no** | **no** | - |
| 124 | PRASOOTHIKA SUDHA | ARISHTAM | 150 | **no** | 2 | yes | **no** | **no** | **no** | - |
| 125 | PRASOOTHIKAMRITHA RASAYANAM | PROPRIETARY | 290 | yes | 2 | yes | **no** | **no** | **no** | - |
| 126 | PUNARNAVADI KASHAYAM | KASHAYAM | 175 | yes | 1 | yes | **no** | **no** | **no** | Punarnava |
| 127 | PUNARNAVASAVAM | ARISHTAM | 160 | yes | 1 | yes | **no** | **no** | **no** | Punarnava |
| 128 | PUSHYANUGA CHOORNAM | CHOORNAM | 170 | **no** | 1 | yes | **no** | **no** | **no** | - |
| 129 | RASNADI CHOORNAM 10 GM | CHOORNAM | 30 | yes | 1 | yes | **no** | **no** | 10 gm | Rasna |
| 130 | RASNADI CHOORNAM 50 GM | CHOORNAM | 100 | yes | 1 | yes | **no** | **no** | 50 gm | Rasna |
| 131 | RASNADI KASHAYAM | KASHAYAM | 260 | yes | 2 | yes | **no** | **no** | **no** | Rasna |
| 132 | RASNAIRANDADI KASHAYAM | KASHAYAM | 260 | yes | 1 | yes | **no** | **no** | **no** | Rasna, Eranda |
| 133 | RASNAPANCHAKAM KASHAYAM | KASHAYAM | 240 | yes | 1 | yes | **no** | **no** | **no** | Rasna |
| 134 | RASNASAPTHAKAM KASHAYAM | KASHAYAM | 200 | yes | 1 | yes | **no** | **no** | **no** | Rasna |
| 135 | RASONADI KASHAYAM | KASHAYAM | 240 | **no** | 1 | yes | **no** | **no** | **no** | Rasona |
| 136 | RED IRONS CAPSULE | CAPSULE | 180 | yes | 2 | yes | **no** | **no** | **no** | - |
| 137 | RED IRONS SYRUP | SYRUP | 170 | yes | 1 | yes | **no** | **no** | **no** | - |
| 138 | RELIEVE O CAPSULE | CAPSULE | 210 | yes | 2 | yes | **no** | **no** | **no** | - |
| 139 | RICH MEAL | PROPRIETARY | 390 | yes | 1 | yes | **no** | **no** | **no** | - |
| 140 | RUJANTH CAPSULE | CAPSULE | 210 | yes | 2 | yes | yes (blog) | **no** | **no** | - |
| 141 | RUJANTH LINIMENT | LINIMENT | 140 | yes | 3 | yes | yes (blog) | **no** | **no** | - |
| 142 | SAHACHARABALADI KASHAYAM | KASHAYAM | 150 | **no** | 1 | yes | **no** | **no** | **no** | Bala, Sahachara |
| 143 | SAHACHARADI KASHAYAM | KASHAYAM | 175 | yes | 3 | yes | **no** | **no** | **no** | Sahachara |
| 144 | SAHACHARADI THAILAM | THAILAM | 240 | yes | 2 | yes | **no** | **no** | **no** | Sahachara |
| 145 | SAPTHASARAM KASHAYAM | KASHAYAM | 200 | yes | 1 | yes | **no** | **no** | **no** | - |
| 146 | SARASWATARISHTAM | ARISHTAM | 1400 | yes | 1 | yes | **no** | **no** | **no** | - |
| 147 | SARIBADYASAVAM | ARISHTAM | 165 | yes | 1 | yes | **no** | **no** | **no** | Sariba |
| 148 | SATAVARI GULAM | LEHYAM | 390 | yes | 2 | yes | **no** | **no** | **no** | Satavari |
| 149 | SLEPAN CAPSULE | CAPSULE | 210 | yes | 2 | yes | **no** | **no** | **no** | - |
| 150 | SUKUMARA GHRITAM | GHRITHAM | 440 | yes | 2 | yes | **no** | **no** | **no** | - |
| 151 | SUKUMARAM KASHAYAM | KASHAYAM | 205 | yes | 1 | yes | **no** | **no** | **no** | - |
| 152 | THALEESADI CHOORNAM | CHOORNAM | 75 | yes | 1 | yes | **no** | **no** | **no** | Talisa |
| 153 | THIKTAKA GHRITAM | GHRITHAM | 315 | yes | 2 | yes | **no** | **no** | **no** | - |
| 154 | THRIPHALADI KERAM | THAILAM | 200 | **no** | 2 | yes | **no** | **no** | **no** | Haritaki, Vibhitaki, Amalaki |
| 155 | TIKTAKAM KASHAYAM | KASHAYAM | 240 | yes | 1 | yes | **no** | **no** | **no** | - |
| 156 | TRIPHALA CHOORNAM | CHOORNAM | 80 | yes | 1 | yes | **no** | **no** | **no** | Haritaki, Vibhitaki, Amalaki |
| 157 | TRIVRIT LEHYAM | LEHYAM | 90 | yes | 2 | yes | **no** | **no** | **no** | Trivrit |
| 158 | VAISWANARA CHOORNAM | CHOORNAM | 85 | yes | 1 | yes | **no** | **no** | **no** | - |
| 159 | VARANADI KASHAYAM | KASHAYAM | 160 | yes | 1 | yes | **no** | **no** | **no** | Varana |
| 160 | VARASANADI KASHAYAM | KASHAYAM | 165 | **no** | 1 | yes | **no** | **no** | **no** | - |
| 161 | VASAGULOOCHYADI KASHAYAM | KASHAYAM | 170 | yes | 2 | yes | **no** | **no** | **no** | Guduchi, Vasa |
| 162 | VASARISHTAM | ARISHTAM | 200 | yes | 1 | yes | **no** | **no** | **no** | Vasa |
| 163 | VIDARYADI KASHAYAM | KASHAYAM | 185 | yes | 3 | yes | **no** | **no** | **no** | - |
| 164 | YASHTI MADHU CAPSULE | CAPSULE | 120 | yes | 2 | yes | **no** | **no** | **no** | Yashtimadhu |
| 165 | YAVADI KASHAYAM | KASHAYAM | 225 | yes | 1 | **no** | **no** | **no** | **no** | Yava |
