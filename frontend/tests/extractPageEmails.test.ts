import { describe, expect, it } from 'vitest'
import {
  belongsToDomain,
  dedupeEmails,
  extractEmailsFromDocument,
  extractEmailsFromText,
  filterEmailsForDomain,
} from '@/shared/recipients/extractPageEmails'

function createDocument(html: string): Document {
  const parser = new DOMParser()
  return parser.parseFromString(html, 'text/html')
}

describe('extractEmailsFromText', () => {
  it('should extract emails from plain text', () => {
    // Arrange
    const text = 'Reach us at team@example.com or sales@sub.example.com'

    // Act
    const emails = extractEmailsFromText(text)

    // Assert
    expect(emails).toEqual(['team@example.com', 'sales@sub.example.com'])
  })
})

describe('extractEmailsFromDocument', () => {
  it('should extract emails from mailto links and visible text', () => {
    // Arrange
    const document = createDocument(`
      <html>
        <body>
          <a href="mailto:Contact@Example.com?subject=Hi">Contact</a>
          <p>Write to support@example.com</p>
        </body>
      </html>
    `)

    // Act
    const emails = extractEmailsFromDocument(document)

    // Assert
    expect(emails).toContain('contact@example.com')
    expect(emails).toContain('support@example.com')
  })
})

describe('filterEmailsForDomain', () => {
  it('should keep emails on domain and its subdomains', () => {
    // Arrange
    const emails = [
      'team@example.com',
      'hello@mail.example.com',
      'other@gmail.com',
    ]

    // Act
    const filtered = filterEmailsForDomain(emails, 'example.com')

    // Assert
    expect(filtered).toEqual(['team@example.com', 'hello@mail.example.com'])
  })
})

describe('belongsToDomain', () => {
  it('should match exact domain and subdomain', () => {
    // Assert
    expect(belongsToDomain('info@example.com', 'example.com')).toBe(true)
    expect(belongsToDomain('info@mail.example.com', 'example.com')).toBe(true)
    expect(belongsToDomain('info@gmail.com', 'example.com')).toBe(false)
  })
})

describe('dedupeEmails', () => {
  it('should deduplicate emails case-insensitively', () => {
    // Act
    const result = dedupeEmails(['A@Example.com', 'a@example.com', 'b@example.com'])

    // Assert
    expect(result).toEqual(['a@example.com', 'b@example.com'])
  })
})
