import Database from 'better-sqlite3'

const databasePath = process.env.DATABASE_PATH ?? './data/hawk-sender.db'
const db = new Database(databasePath)

const result = db.prepare('DELETE FROM domain_records').run()

console.info(`[db:clear] removed ${result.changes} record(s) from ${databasePath}`)
