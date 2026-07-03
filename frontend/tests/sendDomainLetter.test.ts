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

  it('should stop workflow with EMAIL_SEND_FAILED when core send fails', async () => {
    // Arrange
    vi.mocked(sendDomainLetterForTab).mockResolvedValue({
      status: 'failed',
      domain: 'example.com',
      reason: 'send_failed',
    })

    // Act
    const result = await sendDomainLetter(workflowContext)

    // Assert
    expect(result).toEqual({
      type: 'stop',
      outcome: WORKFLOW_OUTCOMES.EMAIL_SEND_FAILED,
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
