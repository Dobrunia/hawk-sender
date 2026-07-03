import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  readHawkInstalled,
  readSentryInstalled,
} from '@/shared/integrations/readPageIntegrations'
import { stopWorkflowIfHawkInstalled } from '@/shared/workflow/steps/stopWorkflowIfHawkInstalled'
import { WORKFLOW_OUTCOMES } from '@/shared/workflow/outcomes'
import type { WorkflowContext } from '@/shared/workflow/types'

vi.mock('@/shared/storage/pageIntegrationsStorage', () => ({
  getPageIntegrationsByTabId: vi.fn(),
}))

import { getPageIntegrationsByTabId } from '@/shared/storage/pageIntegrationsStorage'

const workflowContext: WorkflowContext = {
  tabId: 1,
  tabUrl: 'https://example.com',
}

describe('readPageIntegrations', () => {
  beforeEach(() => {
    vi.mocked(getPageIntegrationsByTabId).mockReset()
  })

  it('should read hawk installed from storage', async () => {
    // Arrange
    vi.mocked(getPageIntegrationsByTabId).mockResolvedValue({
      tabId: 1,
      tabUrl: 'https://example.com',
      domain: 'example.com',
      hawk: true,
      sentry: false,
      checkedAt: '2026-07-03T12:00:00.000Z',
    })

    // Act
    const result = await readHawkInstalled(1)

    // Assert
    expect(result).toBe(true)
  })

  it('should read sentry installed from storage', async () => {
    // Arrange
    vi.mocked(getPageIntegrationsByTabId).mockResolvedValue({
      tabId: 1,
      tabUrl: 'https://example.com',
      domain: 'example.com',
      hawk: false,
      sentry: true,
      checkedAt: '2026-07-03T12:00:00.000Z',
    })

    // Act
    const result = await readSentryInstalled(1)

    // Assert
    expect(result).toBe(true)
  })
})

describe('stopWorkflowIfHawkInstalled', () => {
  beforeEach(() => {
    vi.mocked(getPageIntegrationsByTabId).mockReset()
  })

  it('should stop workflow when hawk is installed on page', async () => {
    // Arrange
    vi.mocked(getPageIntegrationsByTabId).mockResolvedValue({
      tabId: 1,
      tabUrl: 'https://example.com',
      domain: 'example.com',
      hawk: true,
      sentry: false,
      checkedAt: '2026-07-03T12:00:00.000Z',
    })

    // Act
    const result = await stopWorkflowIfHawkInstalled(workflowContext)

    // Assert
    expect(result).toEqual({
      type: 'stop',
      outcome: WORKFLOW_OUTCOMES.HAWK_INSTALLED,
    })
  })

  it('should continue workflow when hawk is not installed', async () => {
    // Arrange
    vi.mocked(getPageIntegrationsByTabId).mockResolvedValue({
      tabId: 1,
      tabUrl: 'https://example.com',
      domain: 'example.com',
      hawk: false,
      sentry: true,
      checkedAt: '2026-07-03T12:00:00.000Z',
    })

    // Act
    const result = await stopWorkflowIfHawkInstalled(workflowContext)

    // Assert
    expect(result).toEqual({ type: 'continue' })
  })

  it('should continue workflow when integrations were not synced yet', async () => {
    // Arrange
    vi.mocked(getPageIntegrationsByTabId).mockResolvedValue(null)

    // Act
    const result = await stopWorkflowIfHawkInstalled(workflowContext)

    // Assert
    expect(result).toEqual({ type: 'continue' })
  })
})
