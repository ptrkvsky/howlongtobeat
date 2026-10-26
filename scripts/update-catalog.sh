#!/usr/bin/env bash
# Catalog update, run before the build by scripts/deploy.sh (UPDATE_CMD):
# imports the games that pass the threshold (resumes an interrupted import),
# enriches them, translates their descriptions and publishes the ready ones.
#
#   UPDATE_CMD=scripts/update-catalog.sh scripts/deploy.sh
#
# Env (.env.local): DATABASE_URL, IGDB_CLIENT_ID + IGDB_CLIENT_SECRET,
# STEAM_API_KEY, ITAD_API_KEY, OPENAI_API_KEY + OPENAI_MODEL
#   TRANSLATE_MAX_USD  OpenAI budget of a run (default 5)
set -euo pipefail

cd "$(dirname "$0")/.."

log() { echo "[$(date '+%F %T')] $*"; }

log "Importing new games"
pnpm tsx scripts/import-games.ts

log "Enriching the imported games"
pnpm tsx scripts/sync.ts ids --unpublished
pnpm tsx scripts/sync.ts igdb --unpublished
# Steam is a nice to have: a failure or a long throttling must not block the
# publication, the games left are fetched by the next run
STEAM_TIMEOUT="${STEAM_TIMEOUT:-30m}"
steam() {
  timeout "$STEAM_TIMEOUT" pnpm tsx scripts/sync.ts steam "$@" ||
    log "Steam enrichment incomplete (exit $?), continuing"
}
steam --unpublished

# Prices change every week: refreshed for the published games too
log "Refreshing the prices"
if [[ -n "${ITAD_API_KEY:-}" ]] || grep -qs '^ITAD_API_KEY=.' .env.local .env; then
  pnpm tsx scripts/sync.ts prices --unpublished
  pnpm tsx scripts/sync.ts prices
else
  log "ITAD_API_KEY not set: prices skipped"
fi

log "Translating their descriptions"
translations=".translations/catalog-$(date '+%F').jsonl"
pnpm tsx scripts/translate-games.ts --imported --limit 100000 \
  --max-usd "${TRANSLATE_MAX_USD:-5}" --out "$translations"
if [[ -s "$translations" ]]; then
  pnpm tsx scripts/translate-games.ts --write "$translations"
fi

log "Publishing the ready games"
pnpm tsx scripts/import-games.ts --publish
