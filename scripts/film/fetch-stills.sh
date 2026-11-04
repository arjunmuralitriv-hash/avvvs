#!/usr/bin/env bash
# Fetch the S01 source photographs (Kerala forest + Vitex leaf) from Wikimedia Commons and build web stills.
# The film paints these at runtime with an oil-paint (Kuwahara) shader and a grade, so they read as
# academic oil painting (docs/plan/01-creative-direction.md §2.1). Credits are written to public/film/stills/CREDITS.txt.
#
#   bash scripts/film/fetch-stills.sh [--force]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RAW="$ROOT/assets-src/stills/raw"
OUT="$ROOT/public/film/stills"
FORCE="${1:-}"
UA="AVVVS-film-asset-fetch/1.0 (build script)"
mkdir -p "$RAW" "$OUT"

# slug | Commons file name | licence | author/credit
STILLS=(
  "s01-evergreen|Evergreen_forest_of_Silent_Valley_Np_Kerala.jpg|CC0|Silent Valley National Park, Kerala. Wikimedia Commons, CC0."
  "s01-shola-1|Shola_Forest_Silent_valley_NP_(1).jpg|CC0|Shola forest, Silent Valley National Park, Kerala. Wikimedia Commons, CC0."
  "s01-shola-2|Shola_Forest_Silent_valley_NP_(2).jpg|CC0|Shola forest, Silent Valley National Park, Kerala. Wikimedia Commons, CC0."
  "s01-shola-3|Shola_Forest_Silent_valley_NP_(3).jpg|CC0|Shola forest, Silent Valley National Park, Kerala. Wikimedia Commons, CC0."
  "s01-vitex-1|Vitex_negundo-1-bsi-yercaud-salem-India.JPG|CC BY-SA 4.0|Vitex negundo, Botanical Survey of India garden, Yercaud. Wikimedia Commons, CC BY-SA 4.0."
  "s01-vitex-2|Vitex_negundo-2-bsi-yercaud-salem-India.JPG|CC BY-SA 4.0|Vitex negundo, Botanical Survey of India garden, Yercaud. Wikimedia Commons, CC BY-SA 4.0."
  "s01-vitex-3|Vitex_negundo-3-bsi-yercaud-salem-India.JPG|CC BY-SA 4.0|Vitex negundo, Botanical Survey of India garden, Yercaud. Wikimedia Commons, CC BY-SA 4.0."
)

fail=0
: > "$OUT/CREDITS.txt.part"
for row in "${STILLS[@]}"; do
  IFS='|' read -r slug file licence credit <<<"$row"
  dest="$RAW/$slug.jpg"
  printf '%s\t%s\thttps://commons.wikimedia.org/wiki/File:%s\t%s\n' "$slug" "$licence" "$file" "$credit" >> "$OUT/CREDITS.txt.part"
  if [[ -s "$dest" && "$FORCE" != "--force" ]]; then echo "have   $slug"; continue; fi
  echo "fetch  $slug"
  if ! curl -fsSL --retry 3 --retry-delay 4 -A "$UA" -o "$dest.part" "https://commons.wikimedia.org/wiki/Special:FilePath/$file"; then
    echo "FAILED $slug" >&2; rm -f "$dest.part"; fail=1; continue
  fi
  file -b "$dest.part" | grep -qiE 'JPEG|image' || { echo "FAILED $slug: not an image" >&2; rm -f "$dest.part"; fail=1; continue; }
  mv "$dest.part" "$dest"
done
mv "$OUT/CREDITS.txt.part" "$OUT/CREDITS.txt"

node --input-type=module - "$RAW" "$OUT" <<'NODE'
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const [raw, out] = process.argv.slice(2);
for (const f of fs.readdirSync(raw).filter((n) => n.endsWith(".jpg"))) {
  const slug = f.replace(/\.jpg$/, "");
  const src = path.join(raw, f);
  // d = desktop 2400 wide (headroom for the slow push-in), m = phone 1280 tall crop.
  await sharp(src).rotate().resize({ width: 2400, height: 1350, fit: "cover", position: "attention" }).webp({ quality: 78 }).toFile(path.join(out, `${slug}-d.webp`));
  await sharp(src).rotate().resize({ width: 900, height: 1600, fit: "cover", position: "attention" }).webp({ quality: 76 }).toFile(path.join(out, `${slug}-m.webp`));
  const kb = (s) => Math.round(fs.statSync(path.join(out, `${slug}-${s}.webp`)).size / 1024);
  console.log(`built  ${slug}  d:${kb("d")}KB m:${kb("m")}KB`);
}
NODE
exit $fail
