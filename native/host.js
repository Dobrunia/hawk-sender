#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_DIR = path.resolve(__dirname, '../server')
const PID_FILE = path.join(SERVER_DIR, 'data/server.pid')
const EXTENSION_ID = 'hawk-sender@dobrunia.local'

function readPort() {
  const envPath = path.join(SERVER_DIR, '.env')

  if (!fs.existsSync(envPath)) {
    return 8787
  }

  const match = fs.readFileSync(envPath, 'utf8').match(/^PORT=(\d+)/m)
  return match ? Number(match[1]) : 8787
}

function readExactly(byteCount) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0)

    function onReadable() {
      const chunk = process.stdin.read()

      if (!chunk) {
        return
      }

      buffer = Buffer.concat([buffer, chunk])

      if (buffer.length >= byteCount) {
        process.stdin.removeListener('readable', onReadable)
        process.stdin.removeListener('end', onEnd)
        resolve(buffer.subarray(0, byteCount))
      }
    }

    function onEnd() {
      reject(new Error('Native host stream ended'))
    }

    process.stdin.on('readable', onReadable)
    process.stdin.on('end', onEnd)
    onReadable()
  })
}

async function readMessage() {
  const header = await readExactly(4)
  const length = header.readUInt32LE(0)
  const body = await readExactly(length)
  return JSON.parse(body.toString('utf8'))
}

function sendMessage(message) {
  const body = Buffer.from(JSON.stringify(message), 'utf8')
  const header = Buffer.alloc(4)
  header.writeUInt32LE(body.length, 0)
  process.stdout.write(header)
  process.stdout.write(body)
}

function escapeAppleScript(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function cleanupStalePidFile() {
  if (!fs.existsSync(PID_FILE)) {
    return
  }

  try {
    const pid = Number(fs.readFileSync(PID_FILE, 'utf8').trim())
    process.kill(pid, 0)
  } catch {
    fs.unlinkSync(PID_FILE)
  }
}

function isPortInUse(port) {
  try {
    execSync(`lsof -ti tcp:${port}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function isServerRunning() {
  cleanupStalePidFile()

  if (fs.existsSync(PID_FILE)) {
    try {
      const pid = Number(fs.readFileSync(PID_FILE, 'utf8').trim())
      process.kill(pid, 0)
      return true
    } catch {
      cleanupStalePidFile()
    }
  }

  return isPortInUse(readPort())
}

function startServerInTerminal() {
  if (isServerRunning()) {
    return { ok: true, alreadyRunning: true }
  }

  const shellCommand = [
    `cd '${SERVER_DIR.replace(/'/g, `'\\''`)}'`,
    'exec node --env-file=.env src/index.js',
  ].join(' && ')

  const result = spawnSync('osascript', [
    '-e',
    'tell application "Terminal" to activate',
    '-e',
    `tell application "Terminal" to do script "${escapeAppleScript(shellCommand)}"`,
  ])

  if (result.status !== 0) {
    throw new Error(result.stderr?.toString() || 'Failed to open Terminal')
  }

  return { ok: true, started: true }
}

function stopServer() {
  const port = readPort()

  if (fs.existsSync(PID_FILE)) {
    try {
      const pid = Number(fs.readFileSync(PID_FILE, 'utf8').trim())
      process.kill(pid, 'SIGTERM')
    } catch {
      // pid file stale
    }
  }

  try {
    execSync(`lsof -ti tcp:${port} | xargs kill -TERM 2>/dev/null || true`, {
      stdio: 'ignore',
    })
  } catch {
    // no process on port
  }

  cleanupStalePidFile()

  return { ok: true, stopped: true }
}

async function handleMessage(message) {
  switch (message.action) {
    case 'ping':
      return {
        ok: true,
        extensionId: EXTENSION_ID,
        serverDir: SERVER_DIR,
        running: isServerRunning(),
      }
    case 'start':
      return startServerInTerminal()
    case 'stop':
      return stopServer()
    case 'status':
      return { ok: true, running: isServerRunning() }
    default:
      return { ok: false, error: `Unknown action: ${message.action}` }
  }
}

async function main() {
  while (true) {
    const message = await readMessage()
    const response = await handleMessage(message)
    sendMessage(response)
  }
}

main().catch((error) => {
  console.error('[hawk-sender-native-host]', error)
  process.exit(1)
})
