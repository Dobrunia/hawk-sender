import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NATIVE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function getDatabasePath() {
  const configuredPath = process.env.DATABASE_PATH?.trim() || './data/hawk-sender.db'

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(NATIVE_DIR, configuredPath)
}
