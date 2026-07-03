export function extractDomainFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return extractDomainFromHostname(hostname)
  }
  catch {
    return null
  }
}

export function extractDomainFromHostname(hostname: string): string | null {
  const normalized = hostname.replace(/^www\./, '')
  const parts = normalized.split('.').filter(Boolean)

  if (parts.length < 2) {
    return null
  }

  return parts.slice(-2).join('.')
}
