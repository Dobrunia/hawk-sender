export function normalizeSentToEmail(email) {
  return email.trim().toLowerCase()
}

export function dedupeAddresses(addresses = []) {
  const seen = new Set()
  const result = []

  for (const address of addresses) {
    if (typeof address !== 'string') {
      continue
    }

    const trimmed = address.trim()

    if (!trimmed) {
      continue
    }

    const key = normalizeSentToEmail(trimmed)

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(trimmed)
  }

  return result
}

function setSentToEntry(byEmail, entry) {
  if (!entry?.to) {
    return
  }

  const key = normalizeSentToEmail(entry.to)
  const existing = byEmail.get(key)

  byEmail.set(key, {
    to: existing?.to ?? entry.to,
    status: Boolean(entry.status),
    ...(entry.error ? { error: String(entry.error) } : {}),
    ...(entry.errorCode ? { errorCode: String(entry.errorCode) } : {}),
    ...(entry.retryAfter ? { retryAfter: String(entry.retryAfter) } : {}),
  })
}

export function mergeSentToEntries(existing = [], incoming = []) {
  const byEmail = new Map()

  for (const entry of existing) {
    setSentToEntry(byEmail, entry)
  }

  for (const entry of incoming) {
    setSentToEntry(byEmail, entry)
  }

  return [...byEmail.values()]
}
