#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDomainRecord, saveSendResult } from './lib/db.js'
import { dedupeAddresses } from './lib/mergeSentTo.js'
import { isSmtpConfigured, sendEmails } from './lib/smtp.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')

if (!process.env.DATABASE_PATH) {
  process.env.DATABASE_PATH = path.join(ROOT_DIR, 'native/data/hawk-sender.db')
}

function readMessage() {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0)

    function tryParse() {
      if (buffer.length < 4) {
        return false
      }

      const length = buffer.readUInt32LE(0)

      if (buffer.length < 4 + length) {
        return false
      }

      const body = buffer.subarray(4, 4 + length)
      resolve(JSON.parse(body.toString('utf8')))
      return true
    }

    function onReadable() {
      let chunk = process.stdin.read()

      while (chunk) {
        buffer = Buffer.concat([buffer, chunk])
        chunk = process.stdin.read()

        if (tryParse()) {
          cleanup()
          return
        }
      }
    }

    function onEnd() {
      if (!tryParse()) {
        reject(new Error('Incomplete native message'))
      }

      cleanup()
    }

    function cleanup() {
      process.stdin.removeListener('readable', onReadable)
      process.stdin.removeListener('end', onEnd)
    }

    process.stdin.on('readable', onReadable)
    process.stdin.on('end', onEnd)
    onReadable()
  })
}

function sendMessage(message) {
  const body = Buffer.from(JSON.stringify(message), 'utf8')
  const header = Buffer.alloc(4)
  header.writeUInt32LE(body.length, 0)
  process.stdout.write(header)
  process.stdout.write(body)
}

async function handleCheck(name) {
  const normalizedName = name?.trim().toLowerCase()

  if (!normalizedName) {
    return { ok: false, error: 'Field "name" is required' }
  }

  const record = getDomainRecord(normalizedName)

  return {
    ok: true,
    data: record ?? 'no record',
  }
}

async function handleSend(message) {
  const { name, address, content } = message

  if (!name || typeof name !== 'string') {
    return { ok: false, error: 'Field "name" is required' }
  }

  if (!Array.isArray(address) || address.length === 0) {
    return { ok: false, error: 'Field "address" must be a non-empty array' }
  }

  if (!content?.subject || !content?.body) {
    return {
      ok: false,
      error: 'Field "content.subject" and "content.body" are required',
    }
  }

  if (!isSmtpConfigured()) {
    return { ok: false, error: 'SMTP is not configured in native/.env' }
  }

  try {
    const uniqueAddresses = dedupeAddresses(address)
    const sentTo = await sendEmails({
      addresses: uniqueAddresses,
      subject: content.subject,
      body: content.body,
    })

    return {
      ok: true,
      data: saveSendResult(name, sentTo),
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function handleMessage(message) {
  switch (message.action) {
    case 'ping':
      return {
        ok: true,
        smtp: isSmtpConfigured(),
      }
    case 'check':
      return handleCheck(message.name)
    case 'send':
      return handleSend(message)
    default:
      return { ok: false, error: `Unknown action: ${message.action}` }
  }
}

async function main() {
  try {
    const message = await readMessage()
    const response = await handleMessage(message)
    sendMessage(response)
  } catch (error) {
    sendMessage({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

main()
