#!/usr/bin/env bash
set -euo pipefail

INSTALL_NODE_FILE="$HOME/Library/Application Support/hawk-sender/native/node-bin"

if [[ -f "$INSTALL_NODE_FILE" ]]; then
  NODE_BIN="$(cat "$INSTALL_NODE_FILE")"
else
  NODE_BIN="$(command -v node)"
fi

if [[ ! -x "$NODE_BIN" ]]; then
  echo "Configured Node.js binary is not executable: $NODE_BIN" >&2
  exit 1
fi

exec "$NODE_BIN" "$@"
