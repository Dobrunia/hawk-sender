#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOST_NAME="hawk_sender"
EXTENSION_ID="hawk-sender@dobrunia.local"
INSTALL_DIR="$HOME/Library/Application Support/hawk-sender/native"
LAUNCHER="$INSTALL_DIR/run-host.sh"

migrate_legacy_config() {
  mkdir -p "$ROOT_DIR/native/data"

  if [[ -f "$ROOT_DIR/server/.env" && ! -f "$ROOT_DIR/native/.env" ]]; then
    cp "$ROOT_DIR/server/.env" "$ROOT_DIR/native/.env"
    echo "Migrated: server/.env → native/.env"
  fi

  if [[ -f "$ROOT_DIR/server/data/hawk-sender.db" && ! -f "$ROOT_DIR/native/data/hawk-sender.db" ]]; then
    cp "$ROOT_DIR/server/data/hawk-sender.db" "$ROOT_DIR/native/data/hawk-sender.db"
    echo "Migrated: server/data → native/data"
  fi

  if [[ ! -f "$ROOT_DIR/native/.env" && -f "$ROOT_DIR/native/.env.example" ]]; then
    cp "$ROOT_DIR/native/.env.example" "$ROOT_DIR/native/.env"
    echo "Created native/.env from example — fill SMTP settings"
  fi
}

chmod +x "$ROOT_DIR/native/run-host.sh"
migrate_legacy_config

if [[ -f "$ROOT_DIR/native/package.json" ]]; then
  npm install --prefix "$ROOT_DIR/native" --omit=dev
fi

mkdir -p "$INSTALL_DIR"
printf '%s\n' "$ROOT_DIR" > "$INSTALL_DIR/project-root"

cat > "$LAUNCHER" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cat "$INSTALL_DIR/project-root")"
ENV_FILE="$ROOT/native/.env"
HOST="$ROOT/native/host.js"

export DATABASE_PATH="$ROOT/native/data/hawk-sender.db"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy native/.env.example and fill SMTP" >&2
  exit 1
fi

if [[ ! -f "$HOST" ]]; then
  echo "Hawk Sender native host not found: $HOST" >&2
  exit 1
fi

exec node --env-file="$ENV_FILE" "$HOST"
EOF

chmod +x "$LAUNCHER"

write_manifest() {
  local target_dir="$1"
  mkdir -p "$target_dir"
  cat > "$target_dir/${HOST_NAME}.json" <<EOF
{
  "name": "${HOST_NAME}",
  "description": "Hawk Sender SMTP helper",
  "path": "${LAUNCHER}",
  "type": "stdio",
  "allowed_extensions": ["${EXTENSION_ID}"]
}
EOF
  echo "Installed: $target_dir/${HOST_NAME}.json"
}

write_manifest "$HOME/Library/Application Support/Mozilla/NativeMessagingHosts"
write_manifest "$HOME/Library/Application Support/zen/NativeMessagingHosts" 2>/dev/null || true
write_manifest "$HOME/Library/Application Support/Zen/NativeMessagingHosts" 2>/dev/null || true

echo "Launcher: $LAUNCHER"
echo "SMTP config: $ROOT_DIR/native/.env"
echo "Native helper ready. Reload the extension in about:debugging."
