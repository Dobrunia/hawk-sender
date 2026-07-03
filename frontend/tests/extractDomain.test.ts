import { describe, expect, it } from 'vitest'
import {
  extractDomainFromHostname,
  extractDomainFromUrl,
} from '@/shared/domain/extractDomain'

describe('extractDomainFromUrl', () => {
  it('should extract apex domain without www and query params', () => {
    // Arrange
    const url = 'https://www.app.example.com/path?foo=bar'

    // Act
    const domain = extractDomainFromUrl(url)

    // Assert
    expect(domain).toBe('example.com')
  })

  it('should return null for invalid url', () => {
    // Arrange
    const url = 'not-a-url'

    // Act
    const domain = extractDomainFromUrl(url)

    // Assert
    expect(domain).toBeNull()
  })
})

describe('extractDomainFromHostname', () => {
  it('should strip www prefix', () => {
    // Arrange
    const hostname = 'www.example.com'

    // Act
    const domain = extractDomainFromHostname(hostname)

    // Assert
    expect(domain).toBe('example.com')
  })
})
