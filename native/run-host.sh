#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
ENV_FILE="$ROOT/native/.env"

export DATABASE_PATH="$ROOT/native/data/hawk-sender.db"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — run: npm run native:install" >&2
  exit 1
fi

exec node --env-file="$ENV_FILE" "$DIR/host.js"
