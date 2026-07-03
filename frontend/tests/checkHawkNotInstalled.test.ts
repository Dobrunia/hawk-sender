import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkHawkNotInstalled } from '@/shared/workflow/steps/checkHawkNotInstalled'
import { WORKFLOW_OUTCOMES } from '@/shared/workflow/outcomes'
import type { WorkflowContext } from '@/shared/workflow/types'

vi.mock('@/shared/detection/getActiveTabIntegrations', () => ({
  getTabIntegrations: vi.fn(),
}))

import { getTabIntegrations } from '@/shared/detection/getActiveTabIntegrations'

const workflowContext: WorkflowContext = {
  tabId: 1,
  tabUrl: 'https://example.com',
}

describe('checkHawkNotInstalled', () => {
  beforeEach(() => {
    vi.mocked(getTabIntegrations).mockReset()
  })

  it('should stop workflow when Hawk is installed on page', async () => {
    // Arrange
    vi.mocked(getTabIntegrations).mockResolvedValue({
      hawk: true,
      sentry: false,
      available: true,
    })

    // Act
    const result = await checkHawkNotInstalled(workflowContext)

    // Assert
    expect(getTabIntegrations).toHaveBeenCalledWith(workflowContext.tabId)
    expect(result).toEqual({
      type: 'stop',
      outcome: WORKFLOW_OUTCOMES.HAWK_INSTALLED,
    })
  })

  it('should continue workflow when Hawk is not installed on page', async () => {
    // Arrange
    vi.mocked(getTabIntegrations).mockResolvedValue({
      hawk: false,
      sentry: true,
      available: true,
    })

    // Act
    const result = await checkHawkNotInstalled(workflowContext)

    // Assert
    expect(result).toEqual({ type: 'continue' })
  })

  it('should continue workflow when Hawk detection is unavailable', async () => {
    // Arrange
    vi.mocked(getTabIntegrations).mockResolvedValue({
      hawk: false,
      sentry: false,
      available: false,
    })

    // Act
    const result = await checkHawkNotInstalled(workflowContext)

    // Assert
    expect(result).toEqual({ type: 'continue' })
  })
})
