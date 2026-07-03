import { describe, expect, it } from 'vitest'
import {
  STANDARD_EMAIL_LOCAL_PARTS,
  buildStandardDomainAddresses,
} from '@/shared/recipients/standardLocalParts'

describe('buildStandardDomainAddresses', () => {
  it('should build standard outreach addresses for domain', () => {
    // Arrange
    const domain = 'example.com'

    // Act
    const addresses = buildStandardDomainAddresses(domain)

    // Assert
    expect(addresses).toHaveLength(STANDARD_EMAIL_LOCAL_PARTS.length)
    expect(addresses).toContain('contact@example.com')
    expect(addresses).toContain('hello@example.com')
    expect(addresses).toContain('sales@example.com')
  })
})
