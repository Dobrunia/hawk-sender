#!/usr/bin/env bash
set -euo pipefail

LAUNCHER="$HOME/Library/Application Support/hawk-sender/native/run-host.sh"

if [[ ! -x "$LAUNCHER" ]]; then
  echo "Native launcher missing. Run: npm run native:install" >&2
  exit 1
fi

node -e "
const { spawn } = require('child_process');
const launcher = process.argv[1];
const msg = JSON.stringify({ action: 'ping' });
const body = Buffer.from(msg);
const header = Buffer.alloc(4);
header.writeUInt32LE(body.length, 0);
const child = spawn(launcher, [], { stdio: ['pipe', 'pipe', 'pipe'] });
child.stdin.write(Buffer.concat([header, body]));
child.stdin.end();
let out = Buffer.alloc(0);
let err = '';
child.stderr.on('data', (chunk) => { err += chunk.toString(); });
child.stdout.on('data', (chunk) => { out = Buffer.concat([out, chunk]); });
child.on('close', (code) => {
  if (code !== 0 || out.length < 4) {
    console.error('Native host failed:', err || 'empty response');
    process.exit(1);
  }
  const len = out.readUInt32LE(0);
  const payload = JSON.parse(out.subarray(4, 4 + len).toString());
  console.log(JSON.stringify(payload, null, 2));
});
" "$LAUNCHER"
