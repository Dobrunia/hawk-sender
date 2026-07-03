import { STANDARD_EMAIL_LOCAL_PARTS } from '@/shared/recipients/standardLocalParts'

const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function extractEmailsFromText(text: string): string[] {
  const matches = deobfuscateEmailText(text).match(EMAIL_PATTERN) ?? []
  const emails = new Set<string>()

  for (const match of matches) {
    const normalized = normalizeEmail(match)

    if (isValidEmail(normalized)) {
      emails.add(normalized)
    }
  }

  return prioritizeEmails([...emails])
}

export function extractEmailsFromDocument(root: Document): string[] {
  const emails = new Set<string>()

  root.querySelectorAll('a[href^="mailto:"], a[href^="MAILTO:"]').forEach((node) => {
    const href = node.getAttribute('href')

    if (!href) {
      return
    }

    const rawEmail = href.replace(/^mailto:/i, '').split('?')[0]?.split(',')[0]?.trim()

    if (!rawEmail) {
      return
    }

    const normalized = normalizeEmail(rawEmail)

    if (isValidEmail(normalized)) {
      emails.add(normalized)
    }
  })

  for (const email of extractEmailsFromText(getDocumentText(root))) {
    emails.add(email)
  }

  return prioritizeEmails([...emails])
}

export function deobfuscateEmailText(text: string): string {
  return text
    .replace(/\s*(?:\[(?:at|собака)\]|\((?:at|собака)\)|\s+(?:at|собака)\s+)\s*/gi, '@')
    .replace(/\s*(?:\[(?:dot|точка)\]|\((?:dot|точка)\)|\s+(?:dot|точка)\s+)\s*/gi, '.')
}

export function prioritizeEmails(emails: string[]): string[] {
  return [...emails].sort((left, right) => {
    return getEmailPriority(left) - getEmailPriority(right)
  })
}

function getEmailPriority(email: string): number {
  const localPart = email.split('@')[0] ?? ''
  const contactIndex = STANDARD_EMAIL_LOCAL_PARTS.indexOf(
    localPart as typeof STANDARD_EMAIL_LOCAL_PARTS[number],
  )

  return contactIndex === -1 ? STANDARD_EMAIL_LOCAL_PARTS.length : contactIndex
}

function getDocumentText(root: Document): string {
  return root.body?.innerText || root.body?.textContent || ''
}

export function belongsToDomain(email: string, domain: string): boolean {
  const emailDomain = email.split('@')[1]

  if (!emailDomain) {
    return false
  }

  return emailDomain === domain || emailDomain.endsWith(`.${domain}`)
}

export function filterEmailsForDomain(emails: string[], domain: string): string[] {
  return emails.filter((email) => belongsToDomain(email, domain))
}

/** Runs in page MAIN world */
export function probeEmailsInPage(): string[] {
  return extractEmailsFromDocument(document)
}

export function dedupeEmails(emails: string[]): string[] {
  return [...new Set(emails.map(normalizeEmail))]
}
