#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOST_SCRIPT="$ROOT_DIR/native/run-host.sh"
HOST_NAME="hawk_sender"
EXTENSION_ID="hawk-sender@dobrunia.local"

chmod +x "$HOST_SCRIPT"

write_manifest() {
  local target_dir="$1"
  mkdir -p "$target_dir"
  cat > "$target_dir/${HOST_NAME}.json" <<EOF
{
  "name": "${HOST_NAME}",
  "description": "Hawk Sender local server control",
  "path": "${HOST_SCRIPT}",
  "type": "stdio",
  "allowed_extensions": ["${EXTENSION_ID}"]
}
EOF
  echo "Installed: $target_dir/${HOST_NAME}.json"
}

write_manifest "$HOME/Library/Application Support/Mozilla/NativeMessagingHosts"
write_manifest "$HOME/Library/Application Support/zen/NativeMessagingHosts" 2>/dev/null || true
write_manifest "$HOME/Library/Application Support/Zen/NativeMessagingHosts" 2>/dev/null || true

echo "Native host ready. Reload the extension in about:debugging."
