import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkDomain } from '@/shared/api/domainApi'
import { checkDomainSendHistory } from '@/shared/workflow/steps/checkDomainSendHistory'
import { WORKFLOW_OUTCOMES } from '@/shared/workflow/outcomes'
import type { WorkflowContext } from '@/shared/workflow/types'

vi.mock('@/shared/api/domainApi', () => ({
  checkDomain: vi.fn(),
}))

const workflowContext: WorkflowContext = {
  tabId: 1,
  tabUrl: 'https://app.example.com/page',
}

describe('checkDomainSendHistory', () => {
  beforeEach(() => {
    vi.mocked(checkDomain).mockReset()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-03T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should continue when domain has no send record', async () => {
    // Arrange
    vi.mocked(checkDomain).mockResolvedValue('no record')

    // Act
    const result = await checkDomainSendHistory(workflowContext)

    // Assert
    expect(checkDomain).toHaveBeenCalledWith('example.com')
    expect(result).toEqual({ type: 'continue' })
  })

  it('should stop when domain was sent to within six months', async () => {
    // Arrange
    vi.mocked(checkDomain).mockResolvedValue({
      name: 'example.com',
      sentTo: [{ to: 'sales@example.com', status: true }],
      updatedAt: '2026-04-01T12:00:00.000Z',
    })

    // Act
    const result = await checkDomainSendHistory(workflowContext)

    // Assert
    expect(result).toEqual({
      type: 'stop',
      outcome: WORKFLOW_OUTCOMES.EMAIL_ALREADY_SENT_WITHIN_HALF_YEAR,
    })
  })

  it('should continue when last send is older than six months', async () => {
    // Arrange
    vi.mocked(checkDomain).mockResolvedValue({
      name: 'example.com',
      sentTo: [{ to: 'sales@example.com', status: true }],
      updatedAt: '2025-01-01T12:00:00.000Z',
    })

    // Act
    const result = await checkDomainSendHistory(workflowContext)

    // Assert
    expect(result).toEqual({ type: 'continue' })
  })
})
