import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { getDatabasePath } from '../lib/databasePath.js'

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

const result = db.prepare('DELETE FROM domain_records').run()

console.info(`[db:clear] removed ${result.changes} record(s) from ${databasePath}`)
