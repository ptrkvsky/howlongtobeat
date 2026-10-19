#!/usr/bin/env bash
# Build the site locally (VPS or laptop) and deploy the prebuilt output to
# Vercel production. Run weekly by scripts/systemd/game-over-deploy.timer.
#
#   scripts/deploy.sh            pull, update data, build, check, deploy
#   FORCE=1 scripts/deploy.sh    deploy even if the page count dropped
#
# Env (see scripts/systemd/deploy.env.example):
#   VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID   required
#   UPDATE_CMD        optional data update run before the build
#   HEALTHCHECK_URL   optional healthchecks.io ping URL
#   MIN_PAGE_RATIO    minimum share of the previous page count (default 0.95)
#   STATE_DIR         where the lock and last page count live
#
# The build reads .env.local (SANITY_ID, SANITY_DATASET...) like a local build.
set -euo pipefail

cd "$(dirname "$0")/.."

: "${VERCEL_TOKEN:?missing VERCEL_TOKEN}"
: "${VERCEL_ORG_ID:?missing VERCEL_ORG_ID}"
: "${VERCEL_PROJECT_ID:?missing VERCEL_PROJECT_ID}"
export VERCEL_ORG_ID VERCEL_PROJECT_ID

MIN_PAGE_RATIO="${MIN_PAGE_RATIO:-0.95}"
STATE_DIR="${STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/game-over}"
PAGE_COUNT_FILE="$STATE_DIR/page-count"
OUTPUT_DIR=".vercel/output/static"

mkdir -p "$STATE_DIR"

# Never run two deployments at once
exec 9>"$STATE_DIR/deploy.lock"
if ! flock -n 9; then
  echo "Another deployment is running, exiting."
  exit 1
fi

ping_healthcheck() {
  [[ -n "${HEALTHCHECK_URL:-}" ]] || return 0
  curl -fsS -m 10 --retry 3 -o /dev/null "$HEALTHCHECK_URL$1" || true
}

trap 'ping_healthcheck /fail' ERR
ping_healthcheck /start

log() { echo "[$(date '+%F %T')] $*"; }

log "Pulling main"
git pull --ff-only

log "Installing dependencies"
pnpm install --frozen-lockfile

if [[ -n "${UPDATE_CMD:-}" ]]; then
  log "Updating data: $UPDATE_CMD"
  bash -c "$UPDATE_CMD"
fi

log "Building"
vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
vercel build --prod --token="$VERCEL_TOKEN"

# A failed API or an empty dataset can build fine with far fewer pages:
# refuse to replace production with it.
pages=$(find "$OUTPUT_DIR" -name '*.html' | wc -l)
previous=$(cat "$PAGE_COUNT_FILE" 2>/dev/null || echo 0)
log "Pages: $pages (previous deployment: $previous)"
if [[ "${FORCE:-0}" != 1 ]] &&
  awk -v p="$pages" -v q="$previous" -v r="$MIN_PAGE_RATIO" \
    'BEGIN { exit !(p < q * r) }'; then
  log "Page count dropped below ${MIN_PAGE_RATIO} of the previous deployment, not deploying (FORCE=1 to override)."
  false
fi

log "Deploying"
vercel deploy --prebuilt --prod --archive=tgz --token="$VERCEL_TOKEN"

echo "$pages" >"$PAGE_COUNT_FILE"
ping_healthcheck ""
log "Done"
