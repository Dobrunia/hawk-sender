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
}))

vi.mock('@/shared/api/sendRecord', () => ({
  hasSuccessfulSend: vi.fn(),
  getSuccessfulRecipients: vi.fn(),
}))

import { sendLetter } from '@/shared/api/domainApi'
import { getSuccessfulRecipients, hasSuccessfulSend } from '@/shared/api/sendRecord'
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

  it('should return success with recipients accepted by SMTP', async () => {
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

  it('should return failed when SMTP accepts no recipients', async () => {
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
      reason: 'no_delivery',
    })
  })

  it('should include SMTP errors when every SMTP attempt fails', async () => {
    // Arrange
    vi.mocked(sendLetter).mockResolvedValue({
      name: 'example.com',
      sentTo: [
        {
          to: 'team@example.com',
          status: false,
          error: 'Invalid login',
        },
      ],
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
      reason: 'no_delivery',
      error: 'team@example.com: Invalid login',
    })
  })

  it('should collapse SMTP rate limit errors into a short message', async () => {
    // Arrange
    vi.mocked(sendLetter).mockResolvedValue({
      name: 'example.com',
      sentTo: [
        {
          to: 'contact@example.com',
          status: false,
          error: 'SMTP лимит отправки: подождите до 1 часа',
          errorCode: 'rate_limit',
          retryAfter: 'до 1 часа',
        },
        {
          to: 'info@example.com',
          status: false,
          error: 'Another repeated rate limit error',
        },
      ],
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
      reason: 'no_delivery',
      error: 'SMTP лимит отправки: подождите до 1 часа',
    })
  })

  it('should return helper_error when native send throws', async () => {
    // Arrange
    vi.mocked(sendLetter).mockRejectedValue(new Error('Native helper unavailable'))

    // Act
    const result = await sendDomainLetterForTab({
      tabId: 1,
      tabUrl: 'https://example.com/page',
    })

    // Assert
    expect(result).toEqual({
      status: 'failed',
      domain: 'example.com',
      reason: 'helper_error',
      error: 'Native helper unavailable',
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
      'SMTP принял письмо: team@example.com, contact@example.com',
    )
    expect(formatted.color).toBe(2)
  })

  it('should format no delivery as send error', () => {
    // Act
    const formatted = formatManualSendResult({
      status: 'failed',
      domain: 'example.com',
      reason: 'no_delivery',
    })

    // Assert
    expect(formatted.message).toBe(
      'Ошибка отправки: SMTP не принял письмо ни на один адрес',
    )
    expect(formatted.color).toBe(1)
  })

  it('should format no delivery with SMTP error', () => {
    // Act
    const formatted = formatManualSendResult({
      status: 'failed',
      domain: 'example.com',
      reason: 'no_delivery',
      error: 'team@example.com: Invalid login',
    })

    // Assert
    expect(formatted.message).toBe(
      'Ошибка SMTP: team@example.com: Invalid login',
    )
    expect(formatted.color).toBe(1)
  })

  it('should format rate limit without duplicating SMTP prefix', () => {
    // Act
    const formatted = formatManualSendResult({
      status: 'failed',
      domain: 'example.com',
      reason: 'no_delivery',
      error: 'SMTP лимит отправки: подождите до 1 часа',
    })

    // Assert
    expect(formatted.message).toBe('SMTP лимит отправки: подождите до 1 часа')
    expect(formatted.color).toBe(1)
  })

  it('should format helper error message', () => {
    // Act
    const formatted = formatManualSendResult({
      status: 'failed',
      domain: 'example.com',
      reason: 'helper_error',
      error: 'Native helper unavailable',
    })

    // Assert
    expect(formatted.message).toBe('Ошибка helper: Native helper unavailable')
    expect(formatted.color).toBe(1)
  })
})
