const SECOND_LEVEL_PUBLIC_SUFFIXES = new Set([
  'ac.jp',
  'ac.nz',
  'ac.uk',
  'co.jp',
  'co.kr',
  'co.nz',
  'co.uk',
  'com.au',
  'com.br',
  'com.cn',
  'com.hk',
  'com.sg',
  'com.tr',
  'edu.au',
  'go.jp',
  'go.kr',
  'gov.au',
  'gov.uk',
  'govt.nz',
  'ltd.uk',
  'me.uk',
  'ne.jp',
  'net.au',
  'net.cn',
  'net.hk',
  'net.nz',
  'net.sg',
  'net.uk',
  'or.jp',
  'or.kr',
  'org.au',
  'org.br',
  'org.cn',
  'org.hk',
  'org.nz',
  'org.sg',
  'org.uk',
  'plc.uk',
])

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

  const suffix = parts.slice(-2).join('.')

  if (SECOND_LEVEL_PUBLIC_SUFFIXES.has(suffix)) {
    return parts.length > 2
      ? parts.slice(-3).join('.')
      : null
  }

  return parts.slice(-2).join('.')
}
