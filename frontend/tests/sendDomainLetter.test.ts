import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendDomainLetter } from '@/shared/workflow/steps/sendDomainLetter'
import { WORKFLOW_OUTCOMES } from '@/shared/workflow/outcomes'
import type { WorkflowContext } from '@/shared/workflow/types'

vi.mock('@/shared/send/sendDomainLetterForTab', () => ({
  sendDomainLetterForTab: vi.fn(),
}))

import { sendDomainLetterForTab } from '@/shared/send/sendDomainLetterForTab'

const workflowContext: WorkflowContext = {
  tabId: 1,
  tabUrl: 'https://example.com/page',
}

describe('sendDomainLetter', () => {
  beforeEach(() => {
    vi.mocked(sendDomainLetterForTab).mockReset()
  })

  it('should stop workflow with EMAIL_SENT when core send succeeds', async () => {
    // Arrange
    vi.mocked(sendDomainLetterForTab).mockResolvedValue({
      status: 'success',
      domain: 'example.com',
      sentTo: [{ to: 'team@example.com', status: true }],
    })

    // Act
    const result = await sendDomainLetter(workflowContext)

    // Assert
    expect(sendDomainLetterForTab).toHaveBeenCalledWith({
      tabId: 1,
      tabUrl: 'https://example.com/page',
    })
    expect(result).toEqual({
      type: 'stop',
      outcome: WORKFLOW_OUTCOMES.EMAIL_SENT,
    })
  })

  it('should stop workflow with EMAIL_NO_DELIVERY when no address accepted mail', async () => {
    // Arrange
    vi.mocked(sendDomainLetterForTab).mockResolvedValue({
      status: 'failed',
      domain: 'example.com',
      reason: 'no_delivery',
    })

    // Act
    const result = await sendDomainLetter(workflowContext)

    // Assert
    expect(result).toEqual({
      type: 'stop',
      outcome: WORKFLOW_OUTCOMES.EMAIL_NO_DELIVERY,
    })
  })

  it('should include SMTP acceptance error in EMAIL_NO_DELIVERY outcome', async () => {
    // Arrange
    vi.mocked(sendDomainLetterForTab).mockResolvedValue({
      status: 'failed',
      domain: 'example.com',
      reason: 'no_delivery',
      error: 'team@example.com: Invalid login',
    })

    // Act
    const result = await sendDomainLetter(workflowContext)

    // Assert
    expect(result).toEqual({
      type: 'stop',
      outcome: {
        ...WORKFLOW_OUTCOMES.EMAIL_NO_DELIVERY,
        message: 'Ошибка SMTP: team@example.com: Invalid login',
      },
    })
  })

  it('should stop workflow with EMAIL_HELPER_ERROR when helper fails', async () => {
    // Arrange
    vi.mocked(sendDomainLetterForTab).mockResolvedValue({
      status: 'failed',
      domain: 'example.com',
      reason: 'helper_error',
      error: 'Native helper unavailable',
    })

    // Act
    const result = await sendDomainLetter(workflowContext)

    // Assert
    expect(result).toEqual({
      type: 'stop',
      outcome: {
        ...WORKFLOW_OUTCOMES.EMAIL_HELPER_ERROR,
        message: 'Ошибка helper: Native helper unavailable',
      },
    })
  })

  it('should continue workflow when domain cannot be extracted from tab url', async () => {
    // Arrange
    vi.mocked(sendDomainLetterForTab).mockResolvedValue({
      status: 'failed',
      domain: null,
      reason: 'no_domain',
    })

    // Act
    const result = await sendDomainLetter({
      tabId: 1,
      tabUrl: 'chrome://extensions',
    })

    // Assert
    expect(result).toEqual({ type: 'continue' })
  })
})
