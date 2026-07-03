import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatManualSendResult,
  sendDomainLetterForTab,
} from '@/shared/send/sendDomainLetterForTab'

vi.mock('@/shared/recipients/resolveDomainSendAddresses', () => ({
  resolveDomainSendAddresses: vi.fn(),
}))

vi.mock('@/shared/integrations/readPageIntegrations', () => ({
  readSentryInstalled: vi.fn(),
}))

vi.mock('@/shared/api/domainApi', () => ({
  sendLetter: vi.fn(),
  hasSuccessfulSend: vi.fn(),
  getSuccessfulRecipients: vi.fn(),
}))

import { getSuccessfulRecipients, hasSuccessfulSend, sendLetter } from '@/shared/api/domainApi'
import { readSentryInstalled } from '@/shared/integrations/readPageIntegrations'
import { resolveDomainSendAddresses } from '@/shared/recipients/resolveDomainSendAddresses'

describe('sendDomainLetterForTab', () => {
  beforeEach(() => {
    vi.mocked(resolveDomainSendAddresses).mockReset()
    vi.mocked(readSentryInstalled).mockReset()
    vi.mocked(sendLetter).mockReset()
    vi.mocked(hasSuccessfulSend).mockReset()
    vi.mocked(getSuccessfulRecipients).mockReset()
    vi.mocked(resolveDomainSendAddresses).mockResolvedValue(['team@example.com'])
    vi.mocked(readSentryInstalled).mockResolvedValue(false)
  })

  it('should return success with sent recipients when delivery succeeds', async () => {
    // Arrange
    const record = {
      name: 'example.com',
      sentTo: [{ to: 'team@example.com', status: true }],
      updatedAt: '2026-07-03T12:00:00.000Z',
    }
    vi.mocked(sendLetter).mockResolvedValue(record)
    vi.mocked(hasSuccessfulSend).mockReturnValue(true)
    vi.mocked(getSuccessfulRecipients).mockReturnValue(['team@example.com'])

    // Act
    const result = await sendDomainLetterForTab({
      tabId: 1,
      tabUrl: 'https://example.com',
    })

    // Assert
    expect(readSentryInstalled).toHaveBeenCalledWith(1)
    expect(result).toEqual({
      status: 'success',
      domain: 'example.com',
      sentTo: [{ to: 'team@example.com', status: true }],
    })
  })

  it('should return failed when server reports no successful delivery', async () => {
    // Arrange
    vi.mocked(readSentryInstalled).mockResolvedValue(true)
    vi.mocked(sendLetter).mockResolvedValue({
      name: 'example.com',
      sentTo: [{ to: 'team@example.com', status: false }],
      updatedAt: '2026-07-03T12:00:00.000Z',
    })
    vi.mocked(hasSuccessfulSend).mockReturnValue(false)

    // Act
    const result = await sendDomainLetterForTab({
      tabId: 1,
      tabUrl: 'https://example.com',
    })

    // Assert
    expect(result).toEqual({
      status: 'failed',
      domain: 'example.com',
      reason: 'send_failed',
    })
  })

  it('should return failed with no_domain when tab url has no domain', async () => {
    // Act
    const result = await sendDomainLetterForTab({
      tabId: 1,
      tabUrl: 'chrome://extensions',
    })

    // Assert
    expect(result).toEqual({
      status: 'failed',
      domain: null,
      reason: 'no_domain',
    })
    expect(sendLetter).not.toHaveBeenCalled()
  })
})

describe('formatManualSendResult', () => {
  it('should format success message with recipient addresses', () => {
    // Act
    const formatted = formatManualSendResult({
      status: 'success',
      domain: 'example.com',
      sentTo: [
        { to: 'team@example.com', status: true },
        { to: 'contact@example.com', status: true },
      ],
    })

    // Assert
    expect(formatted.message).toBe(
      'Письмо отправлено: team@example.com, contact@example.com',
    )
    expect(formatted.color).toBe(2)
  })

  it('should format failure message', () => {
    // Act
    const formatted = formatManualSendResult({
      status: 'failed',
      domain: 'example.com',
      reason: 'send_failed',
    })

    // Assert
    expect(formatted.message).toBe('Не удалось отправить письмо')
    expect(formatted.color).toBe(1)
  })
})
