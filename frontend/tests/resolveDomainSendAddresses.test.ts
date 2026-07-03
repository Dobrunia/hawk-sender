import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveDomainSendAddresses } from '@/shared/recipients/resolveDomainSendAddresses'

vi.mock('@/shared/recipients/getTabPageEmails', () => ({
  getTabPageEmails: vi.fn(),
}))

import { getTabPageEmails } from '@/shared/recipients/getTabPageEmails'

describe('resolveDomainSendAddresses', () => {
  beforeEach(() => {
    vi.mocked(getTabPageEmails).mockReset()
  })

  it('should combine page emails with standard domain addresses', async () => {
    // Arrange
    vi.mocked(getTabPageEmails).mockResolvedValue([
      'team@example.com',
      'other@gmail.com',
      'team@example.com',
    ])

    // Act
    const addresses = await resolveDomainSendAddresses({
      tabId: 1,
      domain: 'example.com',
    })

    // Assert
    expect(getTabPageEmails).toHaveBeenCalledWith(1)
    expect(addresses[0]).toBe('team@example.com')
    expect(addresses).toContain('contact@example.com')
    expect(addresses).toContain('hello@example.com')
    expect(addresses).not.toContain('other@gmail.com')
  })

  it('should return standard addresses when page has no relevant emails', async () => {
    // Arrange
    vi.mocked(getTabPageEmails).mockResolvedValue([])

    // Act
    const addresses = await resolveDomainSendAddresses({
      tabId: 2,
      domain: 'example.com',
    })

    // Assert
    expect(addresses).toContain('contact@example.com')
    expect(addresses.length).toBeGreaterThan(10)
  })
})
