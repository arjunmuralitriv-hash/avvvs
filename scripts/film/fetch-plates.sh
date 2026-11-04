#!/usr/bin/env bash
# Fetch the S02 botanical plates (public-domain Hortus Malabaricus engravings) and build web versions.
#
#   bash scripts/film/fetch-plates.sh            # download missing scans, then build
#   bash scripts/film/fetch-plates.sh --force    # re-download everything
#
# Sources and licences: docs/research/asset-sources.md §1 and docs/plan/01-creative-direction.md §5.2.
#   raw scans  -> assets-src/plates/raw/<slug>.jpg      (git-ignored, large)
#   web output -> public/plates/<slug>-2048.webp         (engraving on its own paper, for HTML)
#                 public/plates/<slug>-ink-2048.webp     (grayscale ink with paper levelled to white, for the shader)
#                 public/plates/<slug>-1024.webp         (phones and the static film)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RAW="$ROOT/assets-src/plates/raw"
OUT="$ROOT/public/plates"
FORCE="${1:-}"
UA="AVVVS-film-asset-fetch/1.0 (build script)"
mkdir -p "$RAW" "$OUT"

# slug | source URL | credit
PLATES=(
  "vitex-negundo|https://commons.wikimedia.org/wiki/Special:FilePath/Hortus_Indicus_Malabaricus_BHL463761.jpg|Hortus Malabaricus vol. 2 (1679), H. A. van Rheede tot Drakestein. Public domain, via Wikimedia Commons / BHL."
  "ricinus-communis|https://commons.wikimedia.org/wiki/Special:FilePath/Hortus_Indicus_Malabaricus_BHL463817.jpg|Hortus Malabaricus vol. 2 (1679), H. A. van Rheede tot Drakestein. Public domain, via Wikimedia Commons / BHL."
  "sesamum-indicum|https://archive.org/download/Hortus_Indicus_Malabaricus_Volume9/page/n128.jpg|Hortus Malabaricus vol. 9 (1689), tab. 54 'Schit-Elu'. Public domain, via Internet Archive."
  "curcuma-longa|https://archive.org/download/Hortus_Indicus_Malabaricus_Volume11/page/n27.jpg|Hortus Malabaricus vol. 11 (1692), tab. 11 'Manjella Kua'. Public Domain Mark 1.0, via Internet Archive."
  "zingiber-officinale|https://archive.org/download/Hortus_Indicus_Malabaricus_Volume11/page/n29.jpg|Hortus Malabaricus vol. 11 (1692), tab. 12 'Inschi Kua'. Public Domain Mark 1.0, via Internet Archive."
)

fail=0
for row in "${PLATES[@]}"; do
  IFS='|' read -r slug url credit <<<"$row"
  dest="$RAW/$slug.jpg"
  if [[ -s "$dest" && "$FORCE" != "--force" ]]; then
    echo "have   $slug ($(du -h "$dest" | cut -f1))"
    continue
  fi
  echo "fetch  $slug  <- $url"
  if ! curl -fSL --retry 3 --retry-delay 4 -A "$UA" -o "$dest.part" "$url"; then
    echo "FAILED $slug" >&2; rm -f "$dest.part"; fail=1; continue
  fi
  # Reject HTML error pages served with 200.
  if ! file "$dest.part" | grep -qiE 'JPEG|image'; then
    echo "FAILED $slug: not an image ($(file -b "$dest.part" | cut -c1-60))" >&2; rm -f "$dest.part"; fail=1; continue
  fi
  mv "$dest.part" "$dest"
done

# Build web versions with sharp (already in node_modules via Next).
node --input-type=module - "$RAW" "$OUT" <<'NODE'
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const [raw, out] = process.argv.slice(2);
for (const f of fs.readdirSync(raw).filter((n) => n.endsWith(".jpg"))) {
  const slug = f.replace(/\.jpg$/, "");
  const src = path.join(raw, f);
  const meta = await sharp(src).metadata();
  // Trim the scan's outer margin a little; the engraving sits inside it.
  const base = () => sharp(src, { limitInputPixels: false }).rotate();
  await base().resize({ width: 2048, height: 2048, fit: "inside" }).webp({ quality: 80 }).toFile(path.join(out, `${slug}-2048.webp`));
  await base().resize({ width: 1024, height: 1024, fit: "inside" }).webp({ quality: 78 }).toFile(path.join(out, `${slug}-1024.webp`));
  // Ink layer: grayscale, then levels so aged paper becomes white and the engraved line becomes deep.
  // The shader multiplies this onto procedural parchment.
  await base()
    .resize({ width: 2048, height: 2048, fit: "inside" })
    .grayscale()
    .normalise({ lower: 2, upper: 70 })
    .linear(1.35, -40)
    .webp({ quality: 82 })
    .toFile(path.join(out, `${slug}-ink-2048.webp`));
  const sizes = ["2048", "1024", "ink-2048"].map((s) => `${s}:${Math.round(fs.statSync(path.join(out, `${slug}-${s}.webp`)).size / 1024)}KB`);
  console.log(`built  ${slug}  ${meta.width}x${meta.height} -> ${sizes.join(" ")}`);
}
NODE

exit $fail
