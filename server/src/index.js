import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDomainRecord, saveSendResult } from './db.js'
import { isSmtpConfigured, sendEmails } from './smtp.js'

const port = Number(process.env.PORT ?? 8787)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pidFile = path.join(__dirname, '../data/server.pid')

function writePidFile() {
  fs.mkdirSync(path.dirname(pidFile), { recursive: true })
  fs.writeFileSync(pidFile, String(process.pid))
}

function removePidFile() {
  try {
    fs.unlinkSync(pidFile)
  } catch {
    // ignore
  }
}

function shutdown() {
  removePidFile()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGHUP', shutdown)
process.on('exit', removePidFile)

if (process.stdin.isTTY) {
  process.stdin.resume()
  process.stdin.on('end', shutdown)
  process.stdin.on('close', shutdown)
}

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    smtp: isSmtpConfigured(),
  })
})

app.get('/check/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name).trim().toLowerCase()

  if (!name) {
    return res.status(400).json({ error: 'Domain name is required' })
  }

  const record = getDomainRecord(name)

  if (!record) {
    return res.json('no record')
  }

  return res.json(record)
})

app.post('/send', async (req, res) => {
  const { name, address, content } = req.body ?? {}

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Field "name" is required' })
  }

  if (!Array.isArray(address) || address.length === 0) {
    return res.status(400).json({ error: 'Field "address" must be a non-empty array' })
  }

  if (!content?.subject || !content?.body) {
    return res.status(400).json({ error: 'Field "content.subject" and "content.body" are required' })
  }

  if (!isSmtpConfigured()) {
    return res.status(503).json({ error: 'SMTP is not configured' })
  }

  try {
    const sentTo = await sendEmails({
      addresses: address,
      subject: content.subject,
      body: content.body,
    })

    const record = saveSendResult(name, sentTo)
    return res.json(record)
  } catch (error) {
    console.error('[send]', error)
    return res.status(500).json({ error: 'Failed to send emails' })
  }
})

app.listen(port, () => {
  writePidFile()
  console.info(`[hawk-sender-server] http://localhost:${port}`)
  console.info(`[hawk-sender-server] SMTP configured: ${isSmtpConfigured()}`)
  console.info('[hawk-sender-server] Close this Terminal window to stop the server')
})
