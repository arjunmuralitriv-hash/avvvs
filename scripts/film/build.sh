#!/usr/bin/env bash
# AVVVS film: one script that does everything, in order. Safe to re-run (each step skips work already done).
#
#   bash scripts/film/build.sh            # install, fetch assets, check, then start the dev server at /film
#   bash scripts/film/build.sh --no-dev   # everything except starting the dev server
#   bash scripts/film/build.sh --force    # re-download every asset
#
# Steps
#   1. Node deps (npm ci if the lockfile changed, else skip)
#   2. S02 plates  — public-domain Hortus Malabaricus engravings  → public/plates/      (fetch-plates.sh)
#   3. S01 stills  — Kerala forest + Vitex photographs (CC0 / CC BY-SA) → public/film/stills/ (fetch-stills.sh)
#   4. Type-check and lint the film code
#   5. Dev server  → http://localhost:3000/film
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
FORCE=""; DEV=1
for a in "$@"; do case "$a" in --force) FORCE="--force";; --no-dev) DEV=0;; esac; done

step() { printf '\n\033[1m== %s\033[0m\n' "$1"; }

step "1/5 Dependencies"
need_node() { command -v node >/dev/null || { echo "Node.js 20+ is required: https://nodejs.org" >&2; exit 1; }; }
need_node
STAMP="node_modules/.avvvs-lock-hash"
HASH="$(sha1sum package-lock.json | cut -c1-12)"
if [[ ! -d node_modules || ! -f "$STAMP" || "$(cat "$STAMP")" != "$HASH" ]]; then
  npm ci --no-audit --no-fund
  echo "$HASH" > "$STAMP"
else
  echo "up to date"
fi

step "2/5 Botanical plates (S02)"
bash scripts/film/fetch-plates.sh $FORCE

step "3/5 Forest and leaf stills (S01)"
bash scripts/film/fetch-stills.sh $FORCE

step "4/5 Type-check and lint"
npx tsc --noEmit
npx eslint src/lib/film src/components/film src/components/three/film src/app/film src/content/plates.ts

step "5/5 Dev server"
if [[ "$DEV" == 1 ]]; then
  echo "Open http://localhost:3000/film and scroll."
  exec npm run dev
else
  echo "Done. Start it with: npm run dev, then open http://localhost:3000/film"
fi
