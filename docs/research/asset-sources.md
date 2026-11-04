# Asset sources and licensing for the cinematic film

Researched 2026-11-04. Every licence, resolution and file size below was **read from the source API or file page on that date**, unless it is marked `UNVERIFIED`. Commons data came from the MediaWiki API (`imageinfo` + `extmetadata`), Internet Archive data from `archive.org/metadata`, Poly Haven data from `api.polyhaven.com`, AmbientCG data from `ambientcg.com/api/v2`, Sketchfab data from `api.sketchfab.com/v3/search`, Freesound licences and durations from the sound pages, and Shopify data from `avvvsglobal.com/products.json`.

Executor: Claude Sonnet 5.5 at medium effort. Work through each section top to bottom. **Before you ship any asset, re-check its licence on its own page.** Licences can change, and this file is a snapshot.

---

## 0. Rules that apply to every asset

1. **Allowed licences:** `Public domain`, `PDM 1.0`, `CC0`, `CC BY 4.0/2.0` (with attribution), `"No restrictions"` (Flickr/IA Commons import, which is PD).
   **Not allowed:** anything `NC` (the site sells products, so it is commercial), anything `ND`, and anything `SA` unless the owner approves releasing the derived file under the same SA licence. Sketchfab "Free Standard" and Fab Standard are allowed only with sign-off (see §2.6).
2. **Credits page:** `src/content/credits.ts` must hold one entry per shipped asset: `{ id, title, author, source, sourceUrl, licence, licenceUrl, modified: boolean, usedIn: "S01"|"S02"|… }`. Render it on `/credits`, linked from the footer. CC BY requires the title, author, source link, licence link and a note that the file was modified. Public-domain items still get a courtesy credit.
3. **Raw files** go in `assets-src/` (git-ignored, large). Only optimised files go in `public/film/`. Name files `<scene>-<slug>-<w>.avif` / `.webp` / `.glb` / `.ktx2` / `.opus`.
4. **Plate image specification** (Scene 02). Retouch every engraving to this target:
   - Crop to the plate border plus 3% margin. Remove later pencil marginalia: the Internet Archive scans of Hortus Malabaricus vol. 10 carry 19th/20th-century pencil identifications, e.g. "Ocimum basilicum" written beside tab. 85.
   - Apply levels so paper = `oklch(0.94 0.025 85)` and ink = `oklch(0.28 0.035 55)`.
   - Export:
     - `*-2048.avif` (long edge 2048 px, quality 60)
     - `*-1024.webp` (quality 75)
     - `*-ink-2048.png`: luminance-keyed alpha (ink opaque, paper transparent), used for the ink-draws-itself effect and for compositing on the shared parchment texture.
   - Hard budget: 450 KB per AVIF plate.
5. **Facts:** a historical plate does not show that a plant is in an AVVVS product. The brief says the carousel ingredients are candidates. Do not caption any plate as an "AVVVS ingredient" until the ingredient check (a separate task) has confirmed it.

---

## 1. Historical botanical engravings (public domain)

### 1.1 Primary source: Hortus Indicus Malabaricus (Rheede, 12 vols, Amsterdam 1678–1693)

This is the Malabar/Kerala flora, and the plate captions are in Latin, Malayalam (Aryaezhuthu), Arabic (Konkani) and Devanagari. **It is the priority source.** Two scan sets are usable:

| Scan set | Where | Licence | Resolution | Notes |
|---|---|---|---|---|
| BHL scans imported to Commons (vol. 1–2 mainly) | `commons.wikimedia.org/wiki/Category:Hortus_Malabaricus_Volume_1` … `_12` | Public domain (Commons tag) | ~5100–5355 × 4200–4275 px, 2.0–2.7 MB JPG | Double-page landscape spreads (each plate is a folded double page). |
| Internet Archive full volumes | `archive.org/details/Hortus_Indicus_Malabaricus_Volume{N}` (N = 1–12) | IA `licenseurl` = PDM 1.0 for vols 1, 4, 11 (read 2026-11-04); vols 2, 9, 10 state no licence, but the work is 1679–1690 and PD by age | **Up to 10789 × 9031 px** (vol. 11 n27 measured); vol. 4 n149 = 7875 × 6313; vol. 10 n36 = 4973 × 8383 | Single page download: `https://archive.org/download/Hortus_Indicus_Malabaricus_Volume{N}/page/n{LEAF}.jpg` (full size), or append `_w2400` before `.jpg` for a resized copy. **Leaf numbers below are the IA "n" indexes, checked by viewing contact sheets.** In these scans the plate leaf comes immediately before its Latin text page. |
| Wellcome Collection photographs of HM plates | `Category:Hortus Malabaricus (Engravings in the Wellcome Collection)` (94 files) | **CC BY 4.0**: credit "Wellcome Collection" | ~3300 × 2650 px | Some are hand-coloured. Use the IA scan instead whenever one exists, to avoid the attribution. |

Standard attribution text for IA/BHL plates:
`Hendrik Adriaan van Rheede tot Drakestein, Hortus Indicus Malabaricus, vol. {V} ({year}), tab. {T}. Public domain. Scan: Internet Archive / Biodiversity Heritage Library.`

### 1.2 Per-plant table

**Status values:**
- **VERIFIED**: the plate heading was read on the scan, or the Commons file sits in the species category "botanical illustrations".
- **CATEGORY**: the species identification comes from the Commons category, and the plate number was not read.
- **UNVERIFIED**: needs a check.

| # | Plant (Malayalam/Sanskrit) | Best source (priority order) | URL | Licence | Resolution / size | Status | Fit-for-scene notes |
|---|---|---|---|---|---|---|---|
| 1 | *Curcuma longa*, Turmeric ("Manjella-kua") | **HM vol. 11 (1692) tab. 11 "Manjella Kua"**, IA leaf **n27** | https://archive.org/download/Hortus_Indicus_Malabaricus_Volume11/page/n27.jpg | PDM 1.0 | 10789 × 9031, 9.1 MB | VERIFIED (heading "MANJELLA KUA. TABULA XI." on n28; plate on n27) | Hero S02 plate. Full rhizome + leaf + inflorescence suits the "root system separates" beat. |
|  | alt: Köhler's Medizinal-Pflanzen (1887) pl. 178 | https://commons.wikimedia.org/wiki/File:K%C3%B6hler%27s_Medizinal-Pflanzen_in_naturgetreuen_Abbildungen_mit_kurz_erl%C3%A4uterndem_Texte_(Plate_178)_(8231755239).jpg | PD | 1438 × 1969, 617 KB | CATEGORY | Colour chromolithograph. Use as a colour reference for the S03 3D rhizome. |
|  | alt: Jacquin/Scheidl 1776 (Wellcome V0042925) | https://commons.wikimedia.org/wiki/File:Turmeric_(Curcuma_longa_L.);_rhizome_with_flowering_stem_and_Wellcome_V0042925.jpg | CC BY 4.0 (Wellcome Collection) | 1181 × 3109, 1.9 MB | VERIFIED (file description) | Coloured engraving, tall format. |
| 2 | *Zingiber officinale*, Ginger ("Inschi kua") | **HM vol. 11 tab. 12 "Inschi vel Inschi Kua"**, IA leaf **n29** | https://archive.org/download/Hortus_Indicus_Malabaricus_Volume11/page/n29.jpg | PDM 1.0 | ~10789 × 9031 (same volume; size not measured individually) | VERIFIED (heading on n30) | S02 plate. Rhizome detail. |
|  | alt: Köhler pl. 146, background removed | https://commons.wikimedia.org/wiki/File:Koeh-146-no_text.jpg | PD | 2731 × 3557, 2.2 MB | CATEGORY | Colour. Also `File:Zingiber_officinale_-_Köhler–s_Medizinal-Pflanzen-146.jpg` (2776 × 3824). |
| 3 | *Bacopa monnieri*, Brahmi ("Brami") | **HM vol. 10 (1690) tab. 14 "Brami"**, IA leaf **n36** | https://archive.org/download/Hortus_Indicus_Malabaricus_Volume10/page/n36.jpg | PD by age (IA states no licence) | 4973 × 8383, 2.0 MB | VERIFIED (heading "BRAMI. TABULA XIV." on n37) | Creeping habit with fine roots at each node. A delicate plate that reads well at small size. |
|  | alt: Blanco, Flora de Filipinas (1880–83) t. 230 | https://commons.wikimedia.org/wiki/File:Herpestis_monniera_Blanco1.230.png | PD | 2024 × 1399, 380 KB | CATEGORY | Colour lithograph. |
| 4 | *Phyllanthus emblica*, Amla ("Nelli") | **HM vol. 1 (1678) Fig. 38** (BHL page 463674) | https://commons.wikimedia.org/wiki/File:Hortus_Indicus_Malabaricus_(Fig._38)_BHL463674.jpg | PD | 5355 × 4275, 2.7 MB | CATEGORY (in "Phyllanthus emblica – botanical illustrations"); the tab. 38 = Nelli match is consistent but was not read | Pinnate leaflets + fruit. Hero S02 plate. |
|  | alt: Brandis/Bra52 | https://commons.wikimedia.org/wiki/File:Phyllanthus_emblica_Bra52.png | PD | 1195 × 1729 | CATEGORY | Low resolution. Fallback only. |
| 5 | *Azadirachta indica*, Neem ("Aria-bepou") | **HM vol. 4 (1683) tab. 52 "Aria-bepou, seu Nimbo"**, IA leaf **n149** | https://archive.org/download/Hortus_Indicus_Malabaricus_Volume4/page/n149.jpg | PDM 1.0 | 7875 × 6313, 3.5 MB | VERIFIED (heading on n150) | S02 plate. Branch with flowers and fruit. |
|  | alt: Wellcome V0042617 (same HM plate, photographed) | https://commons.wikimedia.org/wiki/File:Margosa_(Azadirachta_indica_A._Juss.);_branch_with_flowers_a_Wellcome_V0042617.jpg | CC BY 4.0 (Wellcome Collection) | 3315 × 2649, 3.7 MB | VERIFIED | Use only if the IA scan crops badly. |
|  | alt: Govindoo (Wight/Beddome school, c.1840s) | https://commons.wikimedia.org/wiki/File:Melia_azadirachta_Govindoo.jpg | PD | 2586 × 3369, 2.8 MB | CATEGORY | South-Indian artist. Good colour reference. |
| 6 | *Ocimum tenuiflorum*, Tulsi | **No safe HM plate.** HM vol. 10 tab. 85 "Nala-tirtava" (Brahmin name "Talassi", IA n186) carries a later annotation "Ocimum basilicum". Tab. 84 "Perim-tolassi" (IA n184) is unidentified. | — | — | — | UNVERIFIED: do not label either as *O. tenuiflorum* | Missing input. |
|  | use: Blanco, Flora de Filipinas t. 257 | https://commons.wikimedia.org/wiki/File:Ocimum_sp_Blanco2.257.png | PD | 1416 × 2091, 550 KB | CATEGORY (filed under O. tenuiflorum; the file name itself says "Ocimum sp.") | Treat the species identification as UNVERIFIED and get a botanist's check before captioning. |
| 7 | *Vitex negundo*, Nochi | **HM vol. 2 (1679)** BHL page 463761 | https://commons.wikimedia.org/wiki/File:Hortus_Indicus_Malabaricus_BHL463761.jpg | PD | 5124 × 4234, 2.2 MB | CATEGORY (tab. number UNVERIFIED) | S02 secondary plate. |
|  | alt: Curtis's Botanical Magazine pl. 364 (1797) | https://commons.wikimedia.org/wiki/File:The_Botanical_Magazine,_Plate_364_(Volume_11,_1797).png | PD | 1938 × 3258, 10 MB PNG | CATEGORY | Colour. |
| 8 | *Calotropis gigantea*, Erukku | **HM vol. 2** BHL page 463816 | https://commons.wikimedia.org/wiki/File:Hortus_Indicus_Malabaricus_BHL463816.jpg | PD | 5215 × 4209, 2.3 MB | CATEGORY | Strong flower geometry. Good macro-zoom candidate. |
|  | alt: Botanical Register pl. 58 | https://commons.wikimedia.org/wiki/File:The_Botanical_register_(Plate_58)_BHL8447.jpg | PD | 3072 × 4948 | CATEGORY | Colour. |
| 9 | *Datura metel*, Ummam | **HM vol. 2** BHL pages 463810 and 463813 (two plates) | https://commons.wikimedia.org/wiki/File:Hortus_Indicus_Malabaricus_BHL463810.jpg · https://commons.wikimedia.org/wiki/File:Hortus_Indicus_Malabaricus_BHL463813.jpg | PD | 5215 × 4209, 2.3 MB each | CATEGORY | Toxic plant: any traditional-use caption needs care. |
|  | alt: Curtis's Bot. Mag. pl. 1440 | https://commons.wikimedia.org/wiki/File:Curtis%27s_botanical_magazine_(Plate_1440)_(8247996102).jpg | PD | 1867 × 3200 | CATEGORY | |
| 10 | *Sida cordifolia*, Bala | **No HM plate found.** Warning: HM vol. 1 "Bala" tabs 12–14 (`File:Bala 1-12 Rheede 1678.png`) show **banana (Musa)**, the Malayalam name, **not Sida**. Do not use them. | — | — | — | — | Trap. |
|  | use: Martius, Flora Brasiliensis vol. 12(3) tab. 62 (1886–92) | https://commons.wikimedia.org/wiki/File:Sida_cordifolia.jpg | PD | 654 × 1000, 59 KB | CATEGORY | **Too small for a hero plate** (max 700 px display). Better: Kirtikar & Basu plates (see §1.3). Missing input. |
| 11 | *Ricinus communis*, Avanakku | **HM vol. 2** BHL page 463817 | https://commons.wikimedia.org/wiki/File:Hortus_Indicus_Malabaricus_BHL463817.jpg | PD | 5215 × 4209, 2.2 MB | CATEGORY | |
|  | alt: Köhler (high-res redraw) | https://commons.wikimedia.org/wiki/File:Illustration_Ricinus_communis0.jpg | PD | 1700 × 2301, 1.2 MB | search hit, author Köhler | Colour. |
| 12 | *Terminalia chebula*, Haritaki/Kadukka | Roxburgh, *Plants of the Coast of Coromandel* vol. 2 (1798) t. 197 | https://commons.wikimedia.org/wiki/File:Mobot31753000666237_0126.jpg | PD | 1953 × 2358, 2.5 MB | VERIFIED (file description + category) | Coromandel (east coast). Hand-coloured. |
|  | alt: Govindoo | https://commons.wikimedia.org/wiki/File:Terminalia_chebula_Govindoo.jpg | PD | 2568 × 3338, 4.4 MB | CATEGORY | |
|  | HM vol. 4 "Cadukka" plate | IA vol. 4, leaf not located | — | — | UNVERIFIED | To find it, build a contact sheet of `Volume4/page/n20…n60_w200.jpg` (see §1.4). |
| 13 | *Sesamum indicum*, Ellu ("Schit-elu") | **HM vol. 9 (1689) tab. 54 "Schit-Elu"**, IA leaf **n128**; tab. 55 "Car-Elu" (dark-seeded form) IA leaf **n131** | https://archive.org/download/Hortus_Indicus_Malabaricus_Volume9/page/n128.jpg | PD by age | not measured (vol. 9 jp2 zip is 361 MB, so expect ≥ 5000 px) | VERIFIED (headings on n129, n132) | Also usable for the sesame-oil base of the thailam products, if verified. |
|  | alt: Köhler pl. 129 hi-res | https://commons.wikimedia.org/wiki/File:Sesamum_indicum_drawing.jpg | PD | 642 × 907 | — | Low resolution. Alt: `File:Sesamum_indicum_CBM.png` (Curtis, 1678 × 2647). |
| 14 | *Santalum album*, Chandanam | Roxburgh, *Coromandel* vol. 1 (1795) t. 2 | https://commons.wikimedia.org/wiki/File:Plants_of_the_coast_of_Coromandel_(Plate_02)_BHL280060.jpg | PD | 4167 × 5892, 1.4 MB | VERIFIED (category) | Excellent resolution. AVVVS sells CHANDANASAVAM, so this plate is relevant if the ingredient is verified. |
|  | alt: Wellcome M0005901 | https://commons.wikimedia.org/wiki/File:Santalum_Album._Wellcome_M0005901.jpg | CC BY 4.0 | 2993 × 3778 | CATEGORY | |
| 15 | *Withania somnifera*, Ashwagandha | **No HM plate found** (not a Malabar plant in Rheede). Sibthorp & Smith, *Flora Graeca* vol. 3 t. 233 (1819) | https://commons.wikimedia.org/wiki/File:Withania_somnifera_illustration.jpg | PD | **714 × 1080, 83 KB: too small** | VERIFIED (credit field) | Hero candidate with no good scan. Get a hi-res Flora Graeca scan (Bodleian / BHL "Flora Graeca" t. 233) or use Kirtikar & Basu (§1.3). Missing input. |

### 1.3 Secondary sources for the gaps

| Source | URL | Licence | Notes |
|---|---|---|---|
| Kirtikar & Basu, *Indian Medicinal Plants*, plate vols 1–4 (1918) | https://archive.org/details/indianmedicinalp04kirt (vol. 4 also on Commons: `File:Indian Medicinal Plants (Plates Vol 4).djvu`, 2999 × 3840 per page) | PD (US: pub. 1918; India: Basu d. 1931, so 60 years post mortem has passed) | Line drawings covering most Ayurvedic species, including *Withania* and *Sida*. Plate numbers are UNVERIFIED: find them through the volume index. Style is plainer than HM. Use only to fill gaps. |
| Roxburgh, *Plants of the Coast of Coromandel* (3 vols) | Commons PDF `File:Plants of the coast of Coromandel - selected from drawings … (IA mobot31753000666245).pdf` (8318 × 11308 per page, 458 MB) | PD | Hand-coloured. Best resolution of any source. |
| Wight, *Icones Plantarum Indiae Orientalis* (1838–53) | BHL bibliography 92 (`biodiversitylibrary.org` blocks scripted fetches; open it in a browser) | PD | Not searched in depth. UNVERIFIED for each species. |
| Köhler's Medizinal-Pflanzen (1883–1914) | `Category:Köhler's Medizinal-Pflanzen` on Commons | PD | Colour chromolithographs. Good **colour references** for 3D specimens. Too European-pharmacopoeia in look to serve as Kerala hero plates. |
| Blanco, *Flora de Filipinas* (1880–83) | `Category:Flora de Filipinas` | PD | Colour lithographs, ~1400 × 2100 px. |

### 1.4 Method for locating any HM plate (verified on vols 4, 9, 10, 11)

1. Download the OCR text, `https://archive.org/download/Hortus_Indicus_Malabaricus_Volume{N}/Hortus_Malabaricus_Volume_{N}_djvu.txt`, and grep the index at the end for the Malayalam name. The index gives `tab. / page`.
2. Download leaves `n{a}…n{b}` at `_w200` and make a contact sheet. A plate leaf comes right before the text page headed `{NAME}. TABULA {roman}`. Leaf ≈ 2 × tab + 5 in vol. 11, ≈ 2 × tab + 8 in vol. 10, ≈ 2 × tab + 45 in vol. 4 (large trees use two plates). Expect drift.
3. Download the full-size leaf: `…/page/n{LEAF}.jpg`.

**Scene mapping for §1:**
- S02 carousel (7 plates). The defaults: Turmeric (HM 11-11), Brahmi (HM 10-14), Amla (HM 1-38), Neem (HM 4-52), Ginger (HM 11-12), and Sandalwood (Roxburgh 1-2) or Sesame (HM 9-54). These all have high-resolution, Kerala-relevant scans.
- Ashwagandha and Tulsi are in the brief's candidate list but **have no scan good enough for a hero plate**. Either source better scans or swap them out, and decide after the ingredient check.

---

## 2. 3D assets

Polycounts are the source's own figures. Sizes are the source's glTF download (mesh + textures). Every shipped model goes through:

```
npx @gltf-transform/cli@4.1.1 optimize in.gltf out.glb --compress meshopt --texture-compress ktx2 --texture-size 1024
npx @gltf-transform/cli@4.1.1 simplify out.glb out-lod.glb --ratio <r> --error 0.001
```

Polygon budgets (triangles):
- Hero object in close-up: ≤ 60k
- Mid-ground: ≤ 15k
- Background / instanced: ≤ 3k per instance

Whole-scene GPU budget: ≤ 400k tris on desktop, ≤ 150k on mobile.

### 2.1 Poly Haven: all **CC0** (no attribution needed; credit as a courtesy). URL pattern: `https://polyhaven.com/a/{id}`

| Asset id | Category | Polycount (tris) | glTF 1k / 2k | Decimation | Scene fit |
|---|---|---|---|---|---|
| `fern_02` | plant | 6,232 | 1.1 / 3.2 MB | none | S01 understorey, instanced ×40–80. Temperate fern: tint toward `oklch(0.45 0.10 140)`. |
| `calathea_orbifolia_01` | tropical plant | 16,688 | 1.8 / 5.5 MB | ratio 0.5 for mid-ground | S01 broadleaf mid-ground. Reads tropical. |
| `anthurium_botany_01` | tropical plant | 4,134 | 3.1 / 6.7 MB | none | S01 mid-ground. |
| `pachira_aquatica_01` | tropical tree | 76,914 | 4.9 / 11.8 MB | ratio 0.2 → ~15k | S01 background trunks/canopy. |
| `potted_plant_02` | plant | 69,806 | 2.5 / 4.7 MB | remove pot; ratio 0.25 | Optional. |
| `moss_01` | moss ground cover | 246,170 | 0.9 / 3.1 MB | **ratio 0.05 → ~12k**, or bake to a normal map on a plane | S01 forest floor. |
| `rock_moss_set_01` | mossy rocks | 63,127 | 1.8 / 3.1 MB | ratio 0.3 | S01 foreground rocks (laterite tone: shift albedo toward `oklch(0.45 0.08 40)`). |
| `rock_moss_set_02` | mossy rocks | 57,647 | 1.9 / 3.4 MB | ratio 0.3 | S01. |
| `root_cluster_01` | roots | 225,261 | 9.0 / 17.4 MB | ratio 0.15 → ~34k | S01 tree roots. S03 "roots separate" look-dev reference. |
| `root_cluster_02` | roots | 339,641 | 13.3 / 19.2 MB | ratio 0.1 | S01. |
| `single_root` | root | 114,424 | 3.7 / 8.8 MB | ratio 0.3 → ~34k | **S03 hero root**: suits the "roots float against earthy background" beat. |
| `tree_stump_01` | stump | 41,046 | 3.8 / 10.8 MB | ratio 0.4 | S01. |
| `dead_tree_trunk_02` | trunk | 155,864 | 4.7 / 12.7 MB | ratio 0.15 | S01 fallen log with moss. |
| `boulder_01` | rock | 123,976 | 5.5 / 12.9 MB | ratio 0.1 | S01 background. |
| `food_ginger_01` | ginger rhizome | 7,205 | 0.6 / 1.6 MB | none | **S02→S03 specimen for Ginger**: photoreal and tiny. |
| `brass_pot_01` | brass vessel | 3,760 | 1.5 / 5.0 MB | none | S04 apothecary vessel. Closest to an **uruli** (wide brass bowl), though it is not an uruli. |
| `brass_pot_02` | brass vessel | 3,344 | 1.3 / 4.5 MB | none | S04. |
| `brass_pan_01` | brass pan | 4,340 | 1.5 / 5.1 MB | none | S04. Shallow, so usable as an uruli stand-in. |
| `brass_vase_03` | brass vase | 2,616 | 1.5 / 5.0 MB | none | S04. Kindi-like silhouette (no spout; a spout would need modelling). |
| `brass_goblets` | brass | 9,600 | 4.6 / 16.5 MB | texture 1k | S04 optional. |
| `brass_diya_lantern` | brass lamp | 12,742 | 1.9 / 5.2 MB | none | S04/S05 warm practical light. North-Indian diya form, **not a Kerala nilavilakku** (see §2.3). |
| `wooden_bowl_01` | wood bowl | 14,122 | 1.7 / 6.2 MB | ratio 0.5 | S03 powder bowl. |
| `wooden_spoon` | wood | 6,576 | 1.9 / 7.1 MB | none | S03. |
| `antique_ceramic_vase_01` | ceramic | 9,408 | 0.5 / 1.1 MB | none | S04 shelf dressing. |
| `magnifying_glass_01` | glass/brass | 7,240 | 0.4 / 1.1 MB | none | S02 archive desk prop (optional). |
| `vintage_microscope` | brass instrument | 20,631 | 2.2 / 5.5 MB | — | **Avoid**: it implies a laboratory, which the brief rules out for S04. |

**Gaps on Poly Haven:**
- No Kerala-specific species: no *Piper*, *Areca*, or *Musa* leaves at hero quality.
- No glass laboratory vessels.
- No mortar and pestle.
- No hands.

### 2.2 AmbientCG: all **CC0**. URL pattern: `https://ambientcg.com/view?id={id}`. Sizes are the full zip of the JPG map set.

| Asset id | Type | 1K / 2K / 4K zip | Scene fit |
|---|---|---|---|
| `Paper001` | Paper PBR | 4.8 / 15.5 / 42.0 MB | **S02 parchment base**. Pick the warmest of Paper001–006 by eye. Ship the 2K colour + normal + roughness maps as KTX2 (~1.2 MB total). |
| `Paper002` | Paper PBR | 5.3 / 19.1 / 58.8 MB | S02 alt. |
| `Paper003` | Paper PBR | 2.4 / 7.3 / 40.2 MB | S02 alt (smallest). |
| `Paper004` | Paper PBR | 7.5 / 27.9 / 113.3 MB | S02 alt (heaviest grain). |
| `Paper005` / `Paper006` | Paper PBR | 5.1 / 17.2 / 63.0 · 4.5 / 17.1 / 68.6 MB | S02 alt. |
| `Moss001`–`Moss004` | Moss PBR | ~10 / ~36 / ~128–150 MB | S01 ground and trunk blend. |
| `Ground037`, `Ground068`, `Ground075` | Forest ground (tagged moss) | ~10 / ~34 / ~118–133 MB | S01 forest floor. |
| `ScatteredLeaves001` / `007` / `008` / `009` | Leaf litter | 9.5 / 30.0 / 100.5 MB (001) | S01 floor. |
| `Bark001`–`Bark016` | Bark PBR | 4–10 / 12–32 / 40–120 MB | S01 trunks. |
| `Rock058`–`Rock064` | Rock PBR | ~7.5 / ~25 / ~90–100 MB | S01. |
| `LeafSet004`–`LeafSet030` | **Leaf atlases** (alpha-cut leaves, colour + normal + opacity + translucency) | 2.2–5.5 / 5.2–16.7 / 17–57 MB | **S01 custom tropical foliage**: build cards with Blender geometry nodes. Pick broad-leaf sets by eye. |
| `Leaf001` | Single leaf material | 4.9 / 15.2 / 67.7 MB | S01 macro-leaf fallback. |

The parchment texture is also needed in 2D (CSS background for S06 and plate cards). Export `Paper00X_Color` at 1024 × 1024 → `public/film/s02-parchment-1024.avif`, ≤ 120 KB, and tile it.

### 2.3 Sketchfab (downloadable; licence per model). URL pattern: `https://sketchfab.com/3d-models/{uid}`

| Model | Author | Licence | Faces | GLB | Scene fit / action |
|---|---|---|---|---|---|
| Granite Mortar and Pestle (`a15530b559374595a9b7d61dddb16600`) | covid19digitalcollection | CC BY 4.0 | 409,968 | 15.6 MB | **S03/S04 mortar** (photogrammetry). Simplify ratio 0.05 → ~20k + normal bake. Granite, not Kerala laterite/stone: retint. Attribution required. |
| Pestle And Mortar (`923082ddddf64fbe8b2548e5819bad53`) | FlukierJupiter | CC BY | 2,808 | 15.4 MB (textures) | S04 alt. Downscale textures to 1k. |
| Kerala Lamp LowPoly Nilavilakku (`08bf16615d7945ac9f457ac6b359f584`) | connect2vineeth | CC BY | 1,950 | 0.1 MB | Low-poly silhouette only. Fine for distant S04/S05 dressing. Close-ups need a custom model. |
| Indian Traditional Banana Leaf (`6d2989ee224c4ba1a6d3899c1b6abf34`) | ronchoqa | CC BY | 222 | 0.6 MB | S01 background cards. |
| Banana leaf (`9441c1bf514b4bc8b8254100beb403e7`) | griffon.sebastien | CC BY | 26,224 | 1.9 MB | S01 mid-ground banana leaf (Kerala-typical). |
| big banana leaf (`e11d64ec73da4ff9a7e14c9e6d007633`) | sv1nks | CC BY | 23,564 | 2.5 MB | S01 alt. |
| Banana Tree (`43b0a0c41f0543d09f9501ca1fb1a7b1`) | duz_vr | CC BY | 31,426 | 12.0 MB | S01 background. Downscale textures. |
| Red Anthurium – Floral Scan (`9863058ac1e24915a35c6153c79111d6`) | David.Antalek | CC BY | 250,000 | 43.2 MB | Optional. Simplify heavily. |
| Bottles (`bc0bafee3e1c4ad28317596d7e0aee62`) | A9908244 | CC BY | 33,244 | 2.9 MB | S04 glass vessels candidate. **Check for AI-generated or fantasy styling before use.** |
| Vintage Glass Bottle with Leather Strap (`da3eeaea494d4231916a95380826ef9b`) | adib-mct | CC BY | 58,040 | 22.3 MB | S04 alt. Remove the strap. |
| Female Hand (`0144539af191427fb6b8185a17bac675`) | yanix | CC BY | 192,592 | 5.5 MB | Hand-scan reference only. A female hand, and not rigged. See §2.5. |
| Rigged hand (`eae97cc2a742413cb5338ab942b12c1e`) | elenaferfor | **CC BY-SA** | 28,994 | 3.6 MB | **Do not ship** without SA sign-off. |
| Hyangbal / Gagri / Karuwa | various | CC BY | 20k–1.4M | 12–45 MB | Korean/Nepali vessels: **wrong culture**. Do not use. |
| Puja Thali Set (`f195d91a298f4ed7a2581c9b0aebcc4b`) | ALEXMOt | Sketchfab Standard | 24,841 | 11.1 MB | Avoid: religious styling conflicts with brief rule 2. |

Not found as CC models: **uruli** (searched "uruli" and "kindi brass", zero downloadable results) and **kindi**. → **Custom model in Blender.** It is a lathe (spin) modifier job:
- uruli: Ø 30 cm, height 9 cm, wall 4 mm
- kindi: body Ø 11 cm, height 14 cm, spout 9 cm at 35°

Target: ≤ 6k tris each. Material: brass, PBR base colour `oklch(0.72 0.11 80)`, metallic 1, roughness 0.28 with a hammered normal map. Reference photos must come from the client or from CC0 photos.

### 2.4 Quixel Megascans: **do not use for the web build**

- Since Megascans moved to Fab (Oct 2024), assets fall under the Fab Standard License. They were free in all engines only until 31 Dec 2024 ([CG Channel](https://www.cgchannel.com/2024/10/epic-games-has-made-megascans-free-to-all-but-only-until-the-end-of-2024/); [80.lv](https://80.lv/articles/megascans-no-longer-free-after-2024/)).
- Assets downloaded earlier through Bridge carry the older Unreal-only licence.
- A three.js site serves GLB/KTX2 files at public URLs. Those files can be extracted, which risks breaching the "no redistribution of raw assets" terms ([Unreal forum discussion](https://forums.unrealengine.com/t/megascans-license/2081542)).
- **Allowed exception:** offline Blender renders (pre-rendered S01/S03/S04 frames shipped as video or image sequences), because no raw asset is distributed. This needs written confirmation of the current Fab EULA ([fab.com/cla](https://www.fab.com/cla)) by the client. UNVERIFIED.

### 2.5 HDRIs: Poly Haven, **CC0**. URL `https://polyhaven.com/a/{id}`

| HDRI | Max res | .hdr 1k / 2k / 4k | Scene fit |
|---|---|---|---|
| `forest_grove` | 20480 × 10240 | 1.8 / 7.3 / 28.5 MB | **S01 primary**: dappled forest light. |
| `forest_slope` | 19630 × 9815 | 1.8 / 7.2 / 28.4 MB | S01 alt. |
| `forest_cave` | 19634 × 9817 | 1.9 / 7.3 / 28.5 MB | S01 descent toward the leaf (darker, low contrast). |
| `hochsal_forest` | 16192 × 8096 | 1.7 / 6.9 / 27.7 MB | S01 overcast / misty. |
| `glasshouse_interior` | 24576 × 12288 | 1.6 / 6.2 / 24.8 MB | S01→S02 transition: green-filtered daylight. |
| `aloe_farm_shade_house` | 24576 × 12288 | 1.7 / 6.8 / 27.2 MB | S01 alt: soft shade-net light. |
| `abandoned_greenhouse` | 20650 × 10325 | 1.7 / 6.5 / 25.6 MB | S02 alt. |
| `industrial_wooden_attic` | 29696 × 14848 | 1.6 / 6.4 / 25.2 MB | **S02 warm archival light** (wood-panelled, window-lit). |
| `artist_workshop` | 17000 × 8500 | 1.6 / 6.4 / 25.3 MB | S02/S04 warm interior. |
| `brown_photostudio_02` | 16384 × 8192 | 1.6 / 6.2 / 24.3 MB | **S05 product reflections** (warm studio). |
| `studio_small_09` | — | 1.5 / 6.0 / 23.5 MB | S05 alt neutral studio. |

Shipping rule: real-time scenes use the 1k `.hdr`, converted to a prefiltered PMREM at runtime, or to `.ktx2`/RGBM. **≤ 2 MB per scene.** Use 4k only in offline Blender renders.

### 2.6 "A vaidyan's hands": recommendation and options

There is no CC0/CC-BY, rigged, photoreal **male, South-Asian** hand on Poly Haven, AmbientCG or Sketchfab (searches: "realistic hand rigged", "hand scan photogrammetry"). The options, in recommended order:

1. **Painted 2D stills plus WebGL displacement, as pear.no does.** Paint or generate hands as classical-realist oil stills (§3), animate them with depth-map parallax and dissolves, and keep them out of real-time 3D. This approach is cheapest and the most faithful to the pear.no technique.
2. **Photo reference session (required anyway, for 1 and 3).**
   - Subject: a real AVVVS vaidyan, with a **signed model release** (missing input).
   - Kit: 2 lights (key 45°, 3200 K; fill at −2 EV); 50 mm or 85 mm lens; f/8; ISO 100; neutral grey card in frame.
   - Shots: 12 poses (holding a leaf, crushing in a mortar, pouring oil, reading a palm-leaf manuscript, at rest on a wooden table).
   - Output: RAW + JPG, ≥ 24 MP.
3. **Photogrammetry of the same hands (only if real-time 3D hands are approved).**
   - Capture: 80–120 photos per pose in 360° orbits at 3 heights, cross-polarised light, a hand rest to hold the pose still for ~90 s.
   - Process in RealityScan or Metashape.
   - Retopologise to ≤ 20k tris, bake 4k → ship 2k albedo/normal.
   - Rig: MPFB2 hand skeleton, or the Higgsfield `3d_rigging` tool (see §3).
4. **MPFB2 (MakeHuman plugin for Blender).** Its asset licensing allows CC0 output (verify current terms at static.makehumancommunity.org; UNVERIFIED for the 2026 release). It produces a rigged base hand: set the skin tone and age, then sculpt the detail.

The Higgsfield `generate_3d` (`image_to_3d`, Meshy) single-image-to-mesh route is **not recommended for hero hands**: finger topology and the backs of the hands are hallucinated.

---

## 3. Image and video generation (Higgsfield MCP): schemas read, nothing generated

Tools inspected (schemas only; no credits spent): `generate_image`, `generate_video`, `generate_3d`, `models_explore` (read-only).

### 3.1 What is available

| Tool | Relevant models (ids from `models_explore` / tool docs) | Key params | Use |
|---|---|---|---|
| `generate_image` | `gpt_image_2_5` (tool default), `gpt_image_2` (1k/2k/4k; quality low/med/high), `nano_banana_2` (1k/2k/4k; **inpaint with mask**: `is_inpaint`, media role `mask`), `nano_banana_2_1` (adds `seed`, image + video references), `cinematic_studio_2_5` (Higgsfield, up to 4K) | `model`, `prompt`, `aspect_ratio` (`16:9`, `21:9`, `9:16`, `3:4` …), `medias:[{value: media_id, role}]`, `count` 1–4, `get_cost:true` preflight | Painterly stills for S01 forest keyframes, S03/S04 moods, the hand stills. |
| `generate_video` | `seedance_2_5` (general), `kling3_0` (multi-shot / motion transfer), `minimax_h3` (2K keyframes, mixed references) | `duration`, `aspect_ratio`, `medias` (start frame) | Short 4–8 s motion plates (mist drift, oil pour) to scrub as video. Optional. |
| `generate_3d` | `image_to_3d` / `meshy_image_to_3d` (`target_polycount` 100–300k, `enable_pbr`, `enable_rigging`), `multi_image_to_3d` (1–4 views), `sam_3_3d`, `tripo_h3_1_image_to_3d`, `3d_rigging` (takes a public GLB URL) | | Possible: rigging a photogrammetry hand mesh (§2.6.3). Not for botanical specimens (accuracy). |

Media inputs must be uploaded (`media_upload` → PUT → `media_confirm`) and passed as `media_id`. The tools do not accept raw URLs.

### 3.2 Licensing implications

- **Ownership.** Higgsfield's help centre says it does not claim ownership of inputs or outputs and does not restrict commercial use, and that this is not tied to a plan ([Higgsfield help](https://higgsfield.ai/creator-hub/help-center/account-and-privacy/who-owns-my-generations-and-can-i-use-them-commercially)). Third-party write-ups claim Free-plan outputs are for personal/evaluation use only ([Flowith FAQ](https://flowith.io/blog/higgsfield-faq-video-length-skin-rendering-commercial-rights)). **Generate on a paid plan only.**
- **Licence back to Higgsfield.** Higgsfield takes a perpetual, worldwide, sublicensable licence to outputs ([StartupFortune, Jul 2026](https://startupfortune.com/higgsfield-ai-tells-creators-they-own-their-videos-but-quietly-claims-a-perpetual-worldwide-license-to-train-on-them/)). AVVVS's hero imagery could therefore appear in Higgsfield promotion or training. The client must accept this in writing.
- **Indemnity.** IP indemnity is Enterprise-only (same sources). Upstream model terms (OpenAI, Google, ByteDance, Kuaishou) also apply.
- **Copyright.** In the US (USCO 2025 guidance) and likely in India, purely AI-generated images get **no copyright protection**, so competitors can copy them freely. Human retouching, compositing and painting-over add protectable authorship. Keep the PSD layers as evidence.
- **Disclosure.** Do not present AI stills as historical documents, real AVVVS premises or real AVVVS staff. **Never generate AVVVS packaging, labels or bottles** (brief rule 6). S05 uses real photography or a 3D model built from real packaging only.
- **Credits page entry:** "Selected painterly stills created with generative tools and retouched by [studio]."

### 3.3 Prompt style guide: classical-realist oil stills

Use the same template for every image, so the series reads as one painter's work:

```
[SUBJECT, concrete and physical], [SETTING: Kerala, specific], painted in the manner of a
19th-century academic realist oil study, visible directional brushwork, thin glazes over a warm
umber ground, soft lost-and-found edges, single motivated light source from [camera-left, high, 40°],
chiaroscuro with lifted shadows, restrained palette of raw umber, yellow ochre, terre verte,
lead white, ivory black, a touch of vermilion, matte varnish, fine canvas weave visible in the
highlights, no text, no signature, no frame, no border, no watermark
--aspect [16:9 for scene keyframes | 3:4 for plates/hands]
```

**Per-scene palette clause.** Append one of these, and grade the output toward the listed OKLCH targets in the grading pass:

| Scene | Clause | Shadow / mid / highlight targets |
|---|---|---|
| S01 | "deep forest greens, cool shadow, shafts of warm sun through mist" | `oklch(0.18 0.03 150)` / `oklch(0.45 0.09 140)` / `oklch(0.90 0.06 95)` |
| S02 | "aged ivory paper, sepia ink, warm archival window light" | `oklch(0.30 0.035 55)` / `oklch(0.75 0.04 75)` / `oklch(0.95 0.025 85)` |
| S03 | "earth brown, ochre, muted amber, macro" | `oklch(0.22 0.04 50)` / `oklch(0.55 0.10 65)` / `oklch(0.82 0.12 80)` |
| S04 | "champagne gold, amber glass, warm caustics" | `oklch(0.20 0.03 60)` / `oklch(0.65 0.11 80)` / `oklch(0.93 0.08 90)` |
| S05 | "deep forest green and black, gold rim light" | `oklch(0.14 0.02 155)` / `oklch(0.32 0.05 150)` / `oklch(0.85 0.12 85)` |

**Negative clause** (state it in prose; the models have no negative-prompt field): "no mandala, no lotus, no om symbol, no glowing particles, no gold dust, no fantasy, no glossy 3D render look, no smooth airbrushed skin, no extra fingers".

**Hand prompts.** Always give an exact pose and count, e.g. "two weathered male hands, right hand holding a single turmeric rhizome between thumb and index finger, left hand open beneath it, five fingers each, wrists entering from bottom edge, sleeves of unbleached cotton mundu-style cloth". Always attach a real reference photo from §2.6.2 as `medias` role `image` or `image_references`.

### 3.4 Risks and mitigations

| Risk | Detection (acceptance check) | Mitigation |
|---|---|---|
| Hand anatomy (extra or fused fingers, broken knuckles, mirrored thumbs) | Count the fingers per hand at 200% zoom. Check that each thumb sits on the correct side and that there are 3 knuckle creases per finger. | Generate from a **real reference photo**. Inpaint failures with `nano_banana_2` + `is_inpaint:true` + mask. Final fallback: a painter retouches over the photo. |
| AI tells (over-smooth skin, symmetrical leaves, bokeh mush, uniform brush texture, nonsense text) | Squint test at 25%. Check leaf venation against the HM plate of the same species. Check for faux text. | Grading pass (below). Add real canvas texture. Paint over botanically wrong parts. **Never use AI for botanical plates**: S02 uses only genuine engravings (§1). |
| Style drift between stills | Lay all stills side by side. Mean luminance must fall within ±0.05 L (OKLCH) of the scene target. | Same template, same model, fixed `seed` (`nano_banana_2_1`), re-use one approved still as a style reference. |
| Cultural inaccuracy (North-Indian or Hindu-temple tropes, wrong clothing) | Client review. | Brief: Kerala, no religious iconography. Client signs off on each still. |
| Implied claims | — | No stills show patients being "cured", lab coats or clinical imagery. |

**Grading pass (DaVinci Resolve, Photoshop or a custom LUT), applied to every still:**
1. Convert to linear space. Map shadow/mid/highlight to the OKLCH targets above.
2. Add a 2–3% monochrome film grain at 1.2 px.
3. Overlay a canvas-weave texture (CC0, e.g. AmbientCG `Fabric` weave) in soft-light mode at 8% opacity.
4. Vignette at −0.3 EV.
5. Export AVIF quality 55. Budget **≤ 350 KB at 2560 px wide**.

---

## 4. Ambient audio (Freesound): every row read as **CC0 1.0** on its own page

URL pattern: `https://freesound.org/people/{user}/sounds/{id}/`. No attribution is required; credit as a courtesy. Downloading needs a free Freesound account; the user does this, and the agent does not create accounts.

| id | Title | Author | Duration | Location (from description/tags) | Scene fit |
|---|---|---|---|---|---|
| 332419 | River side ambience in India, water flowing, birds, breeze | seventhsamurai | 1:57 | **Chalakudy River, Kerala** (tags: kerala, chalakudy) | **S01 bed layer**: genuinely Kerala. Phone-recorded, so high-pass at 60 Hz. |
| 644886 | Jungle ambience. Nagarhole Wildlife Sanctuary | seventhsamurai | 0:56 | Nagarhole, Karnataka (Western Ghats foothills) | S01 birds/insects layer. The description mentions "minor unwanted sounds": edit them out. |
| 644989 | Jungle / Forest Ambience | seventhsamurai | 0:39 | "a forest in India", 7–7:30 am | S01 morning layer. |
| 787307 | Dawn chorus in North Goa, India | HotCatMedia | 1:30 | North Goa (west coast) | S01 opening, the fade-up from black. |
| 162438 | KOLLAM.WAV | aumguy | 0:15 | "A night in India – Kerala" | Too short for a loop. Use as a one-shot accent. |
| 515141 | Firemountain Dusk After The Rain Frogs Etc | cottonsoundtechie | 17:41 | "Fire Mountain Retreat", India, monsoon (state UNVERIFIED) | S01→S02 post-rain frogs. Long take: pick 60 s. |
| 417872 | Jungle in Maharashtra at night | Agim | 1:02 | Maharashtra | S05 dark botanical environment bed. |
| 615747 | Tropical Rain – light in a forest with drop hitting the leaves | nyoz | 1:01 | not India | S01 light rain on leaves. |
| 614204 | Tropical Rain – Heavy with dripping on concrete | nyoz | 4:47 | Réunion Island | Monsoon-intensity rain (cut the concrete drips). Optional S01 variant. |
| 615011 | Insect Buildup Forest | absent1010 | 2:05 | not stated | S01 tension rise before the macro leaf. |
| 460466 | Koel-01-44k.wav | ramblinglibrarian | 0:08 | not stated | One-shot Asian koel call (a common Kerala bird). |
| 690626 | North India Countryside Birds chirping | Audiobaaz911 | 1:05 | North India | Fallback only (wrong region). |
| 524688 | Water-lap-against-rocks-lake | salilnair | 0:57 | not stated | S03/S04 liquid texture. |

**Processing specification.** Build one master loop per scene in a DAW:
- 60 s per loop, 2 s equal-power crossfade at the loop point.
- Loudness normalised to **−30 LUFS integrated**. Ambient sits under UI; the user can mute.
- Export Opus 96 kbps stereo → `public/film/audio/s01-forest.opus` (≈ 0.7 MB) + AAC `.m4a` fallback for older Safari.
- Playback: **off until the user presses the sound toggle**, which browsers require anyway. Fade in over 3 s. Honour `prefers-reduced-motion` (it does not mute audio, but the default stays off).

**Gap.** No CC0 recording from Kerala's Western Ghats forest proper (Silent Valley, Wayanad, Thattekad) was found. Commissioning a 30-minute field recording in Kozhikode district is a missing input (optional).

---

## 5. Real AVVVS product photography (Shopify)

Source: `https://avvvsglobal.com/products.json?limit=250&page=1`. That page lists 165 products and 236 images, and 164 of the products have at least one image. Most common image sizes: 682 × 1024 (112 images), 667 × 667 (30), 1333 × 1333 (24), 1167 × 1167 (22), 1024 × 683 (19), 1500 × 1500 (15).

Visual check (thumbnails viewed 2026-11-04): most products are **dark amber glass bottles with a green cap and a white label** carrying a gold "SINCE 1921" badge and "Arya Vaidya Vilasini Vaidyasala". They are shot or rendered on white with a floor reflection. The **bottle fills only ~55% of frame height**, so the effective bottle height in a 1500 px image is ~820 px.

**Best 10 by resolution and range coverage** (append `?width=N` to the CDN URL to resize):

| # | Product (type) | Handle | Resolution | Image URL |
|---|---|---|---|---|
| 1 | PADOLAKATUROHINYADI KASHAYAM (Kashayam) | `padolakaturohinyadi-kashayam` | **3333 × 3333** | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/PADOLAKATUROHINYADI-KASHAYAM.jpg |
| 2 | MENOCARE CAPSULE (Capsule) | `menocare-capsule` | 3247 × 2752 | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/MENOCARE-CASPULE.jpg |
| 3 | ASWAGANDHARISHTAM (Arishtam) | `aswagandharishtam` | 1500 × 1500 | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/ASWAGANDHARISHTAM.jpg |
| 4 | SARASWATARISHTAM (Arishtam) | `saraswatharishtam` | 1500 × 1500 | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/SARASWATARISHTAM.webp |
| 5 | CHANDANASAVAM (Arishtam) | `chandanasavam` | 1500 × 1500 | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/CHANDANASAVAM.jpg |
| 6 | DRAKSHARISHTAM (Arishtam) | `draksharishtam` | 1500 × 1500 | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/DRAKSHARISHTAM.jpg |
| 7 | SAHACHARADI THAILAM (Thailam) | `sahacharadi-thailam` | 1333 × 1333 | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/SAHACHARADI-THAILAM.jpg |
| 8 | NEELIBRINGADI KERAM (Thailam) | `neelibringadi-keram` | 1333 × 1333 | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/NEELIBRINGADI-KERAM.jpg |
| 9 | PUSHYANUGA CHOORNAM (Choornam, white jar) | `pushyanuga-choornam` | 1167 × 1167 | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/PUSHYANUGA_CHOORANAM.jpg |
| 10 | DADIMADI GHRITAM (Ghritham, white jar) | `dadimadi-gritham` | 1167 × 1167 | https://cdn.shopify.com/s/files/1/0683/7157/9177/products/DADIMADI_GHRITHAM.jpg |

Also noted:
- RED IRONS SYRUP is the only "lifestyle" shot (dark background with grapes), 1000 × 1122.
- RICH MEAL (pouch) is 1067 × 1600.
- RUJANTH LINIMENT (box + bottle) is 683 × 1024.

Their packaging differs from the classical range. If they appear in the film, they need separate packshots.

**Plain statement: these images are not good enough for Scene 05, and a professional packshot session is required.**

Reasons:
- The best bottle image gives ~1830 px of bottle height. Most give ≤ 820 px. S05 needs ≥ 3000 px of product height for a full-screen 4K-DPR hero.
- The images are front-only. An orbit needs 360° coverage.
- The label text is too small to read. The flat white lighting with baked reflections cannot be relit to the S05 "deep forest green, black, gold" look.

The brief forbids inventing bottles or labels, so S05 depends on this missing input.

**Packshot specification for the client's photographer:**
- Products: 3–5 hero SKUs (chosen after the ingredient check).
- For each SKU:
  - Front, back, both sides, and ¾ views at 24 MP or more.
  - A **36-frame turntable** (10° steps) on black and on white, with cross-polarised light to control glare.
  - Label flats: a scan, or the client's print PDFs/dielines. These are the best source for an accurate 3D label texture.
  - Real cap and glass colour measurements: a ColorChecker in frame.
- Deliverables: TIFF 16-bit + JPG. Model release / usage rights assigned to AVVVS for web use.
- Then: a 3D bottle modelled in Blender to measured dimensions (callipers: height, diameter, shoulder radius, cap height), with the label texture from the print PDF. Glass IOR 1.52; amber absorption tuned to match the photographed ColorChecker.

---

## 6. Missing inputs (consolidated)

1. Ingredient verification for each AVVVS product. It decides which 7 plates appear in S02. **Blocking for S02 captions.**
2. High-resolution *Withania somnifera* plate (Flora Graeca t. 233 hi-res, or the Kirtikar & Basu plate number). UNVERIFIED.
3. *Ocimum tenuiflorum* plate with a confirmed identification. HM 10-84/85 identification UNVERIFIED; the Blanco species identification also needs a botanist's check.
4. *Sida cordifolia* plate at ≥ 2000 px (the Kirtikar & Basu plate number is UNVERIFIED).
5. *Terminalia chebula* HM vol. 4 "Cadukka" leaf number (optional; Roxburgh is usable).
6. Tab numbers for the HM vol. 2 BHL files (Vitex 463761, Datura 463810/463813, Calotropis 463816, Ricinus 463817). Read them off the plate before captioning.
7. Professional packshot session + label print files (S05, **blocking**).
8. Vaidyan hand reference photos + model release (S01/S02 hand stills, and the hands storyline).
9. Uruli and kindi reference photos (from the client) for the custom models.
10. Client's written acceptance of the Higgsfield licence-back terms, plus a paid plan, before any generation.
11. Fab/Megascans EULA confirmation, only if offline renders will use Megascans.
12. Optional: a commissioned Kerala forest field recording.

## 7. Acceptance checks for whoever builds from this file

- [ ] Every file in `public/film/` has an entry in `src/content/credits.ts`, and `/credits` renders the list server-side.
- [ ] No asset is NC, ND or SA (`grep -i "NC\|ND\|SA" src/content/credits.ts` shows only approved exceptions).
- [ ] Each S02 plate AVIF is ≤ 450 KB and 2048 px on the long edge. Its ink PNG has alpha. No pencil marginalia remain (inspect at 100%).
- [ ] Each GLB is ≤ 2 MB for mid-ground items and ≤ 5 MB for hero items, meshopt + KTX2, and within the triangle budgets in §2.
- [ ] HDRIs shipped at 1k only. Each audio loop is ≤ 1 MB Opus, −30 LUFS ±1, and off by default.
- [ ] No AI-generated image shows packaging, labels, text, religious iconography, or a botanical plate.
- [ ] Every hand still passes the finger-count check in §3.4.
