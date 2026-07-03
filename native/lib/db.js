import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { getDatabasePath } from './databasePath.js'
import { mergeSentToEntries } from './mergeSentTo.js'

const databasePath = getDatabasePath()

fs.mkdirSync(path.dirname(databasePath), { recursive: true })

const db = new Database(databasePath)

db.exec(`
  CREATE TABLE IF NOT EXISTS domain_records (
    name TEXT PRIMARY KEY,
    sent_to_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

const selectRecord = db.prepare(`
  SELECT name, sent_to_json AS sentToJson, updated_at AS updatedAt
  FROM domain_records
  WHERE name = ?
`)

const upsertRecord = db.prepare(`
  INSERT INTO domain_records (name, sent_to_json, updated_at)
  VALUES (@name, @sentToJson, @updatedAt)
  ON CONFLICT(name) DO UPDATE SET
    sent_to_json = excluded.sent_to_json,
    updated_at = excluded.updated_at
`)

export function getDomainRecord(name) {
  const row = selectRecord.get(name)

  if (!row) {
    return null
  }

  return {
    name: row.name,
    sentTo: JSON.parse(row.sentToJson),
    updatedAt: row.updatedAt,
  }
}

const saveSendResultTx = db.transaction((name, sentTo) => {
  const normalizedName = name.toLowerCase()
  const existing = getDomainRecord(normalizedName)
  const mergedSentTo = mergeSentToEntries(existing?.sentTo, sentTo)
  const updatedAt = new Date().toISOString()

  upsertRecord.run({
    name: normalizedName,
    sentToJson: JSON.stringify(mergedSentTo),
    updatedAt,
  })

  return {
    name: normalizedName,
    sentTo: mergedSentTo,
    updatedAt,
  }
})

export function saveSendResult(name, sentTo) {
  return saveSendResultTx(name, sentTo)
}
