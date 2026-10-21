#!/usr/bin/env bash
# Hourly news run on the VPS (scripts/systemd/game-over-news.service): writes
# the missing articles into the database, then redeploys the site if the
# published news changed. See docs/actus.md.
#
# Env: those of scripts/deploy.sh (deploy.env), and .env.local for
# scripts/publish-news.ts
set -uo pipefail
cd "$(dirname "$0")/.."

# A rejected article fails the run, but the others are saved: deploy anyway
pnpm tsx scripts/publish-news.ts
written=$?

scripts/deploy.sh --news || exit
exit "$written"
