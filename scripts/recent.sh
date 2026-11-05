#!/usr/bin/env bash
# Run every two days on the VPS (scripts/systemd/game-over-recent.service):
# adds the recent games that have no HowLongToBeat id on Wikidata yet, takes
# the ones that pass the threshold through the usual steps (ids, IGDB, Steam,
# translation, publication), then redeploys the site if the number of
# published games changed. See docs/enrichissement-fiches-jeux.md.
#
# The weekly run (scripts/update-catalog.sh) stays the one that refreshes the
# prices and computes the tags, embeddings and recommendations: a game
# published here has the fallback recommendations until the next Monday.
#
#   scripts/recent.sh               normal run (skipped within 40 h of the last)
#   FORCE=1 scripts/recent.sh       run anyway, and deploy even if unchanged
#
# Env: those of scripts/deploy.sh (deploy.env), and .env.local for the scripts
#   RECENT_SCAN_LIMIT  HLTB pages read by the walk per run (default 3000)
#   RECENT_MIN_HOURS   minimum time between two runs (default 40)
#   TRANSLATE_MAX_USD  OpenAI budget of a run (default 5)
#   STEAM_TIMEOUT      Steam enrichment time limit (default 30m)
set -uo pipefail
cd "$(dirname "$0")/.."

STATE_DIR="${STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/game-over}"
LAST_RUN_FILE="$STATE_DIR/recent-last-run"
MIN_HOURS="${RECENT_MIN_HOURS:-40}"

log() { echo "[$(date '+%F %T')] $*"; }

mkdir -p "$STATE_DIR"

# The timer fires every two days, but also at boot (Persistent): do not walk
# HLTB twice within a day
if [[ "${FORCE:-0}" != 1 && -f "$LAST_RUN_FILE" ]]; then
  age_hours=$((($(date +%s) - $(stat -c %Y "$LAST_RUN_FILE")) / 3600))
  if ((age_hours < MIN_HOURS)); then
    log "Last run ${age_hours} h ago (< ${MIN_HOURS} h), nothing to do."
    exit 0
  fi
fi

log "Looking for recent games"
pnpm tsx scripts/import-recent.ts --scan-limit "${RECENT_SCAN_LIMIT:-3000}" || exit

log "Enriching the imported games"
pnpm tsx scripts/sync.ts ids --unpublished || exit
pnpm tsx scripts/sync.ts igdb --unpublished || exit
# A failure or a long throttling must not block the publication, the games left
# are fetched by the next run
STEAM_TIMEOUT="${STEAM_TIMEOUT:-30m}"
timeout "$STEAM_TIMEOUT" pnpm tsx scripts/sync.ts steam --unpublished ||
  log "Steam enrichment incomplete (exit $?), continuing"

log "Translating their descriptions"
translations=".translations/recent-$(date '+%F').jsonl"
pnpm tsx scripts/translate-games.ts --imported --limit 100000 \
  --max-usd "${TRANSLATE_MAX_USD:-5}" --out "$translations" || exit
if [[ -s "$translations" ]]; then
  pnpm tsx scripts/translate-games.ts --write "$translations" || exit
fi

log "Publishing the ready games"
pnpm tsx scripts/import-games.ts --publish || exit

# Recorded here, not at the start: a failed run is retried by the next timer
touch "$LAST_RUN_FILE"

scripts/deploy.sh --recent
