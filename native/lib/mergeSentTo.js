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

export function mergeSentToEntries(existing = [], incoming = []) {
  const byEmail = new Map()

  for (const entry of existing) {
    if (!entry?.to) {
      continue
    }

    byEmail.set(normalizeSentToEmail(entry.to), {
      to: entry.to,
      status: Boolean(entry.status),
    })
  }

  for (const entry of incoming) {
    if (!entry?.to) {
      continue
    }

    byEmail.set(normalizeSentToEmail(entry.to), {
      to: entry.to,
      status: Boolean(entry.status),
    })
  }

  return [...byEmail.values()]
}
