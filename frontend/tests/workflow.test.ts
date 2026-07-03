import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runAutomaticWorkflow } from '@/shared/workflow/automaticWorkflow'
import { runWorkflowSteps } from '@/shared/workflow/runner'
import { checkExtensionEnabled } from '@/shared/workflow/steps/checkExtensionEnabled'
import { getWorkflowOutcome, WORKFLOW_OUTCOMES } from '@/shared/workflow/outcomes'
import type { WorkflowContext, WorkflowStep } from '@/shared/workflow/types'
import {
  getPopupWorkflowLabel,
  isPopupWorkflowInactive,
  resolvePopupWorkflowOutcome,
} from '@/shared/workflow/popupWorkflow'

vi.mock('@/shared/storage/settingsStorage', () => ({
  isExtensionEnabled: vi.fn(),
}))

vi.mock('@/shared/detection/getActiveTabIntegrations', () => ({
  getTabIntegrations: vi.fn(),
}))

import { isExtensionEnabled } from '@/shared/storage/settingsStorage'
import { getTabIntegrations } from '@/shared/detection/getActiveTabIntegrations'

const workflowContext: WorkflowContext = {
  tabId: 1,
  tabUrl: 'https://example.com',
}

describe('WORKFLOW_OUTCOMES', () => {
  it('should contain AUTO_SEND_INACTIVE outcome with terminal flag', () => {
    // Arrange
    const outcome = WORKFLOW_OUTCOMES.AUTO_SEND_INACTIVE

    // Act
    const resolved = getWorkflowOutcome('AUTO_SEND_INACTIVE')

    // Assert
    expect(outcome.message).toBe('Автоматическая отправка неактивна')
    expect(resolved.terminal).toBe(true)
  })
})

describe('runWorkflowSteps', () => {
  it('should stop on first step that returns stop result', async () => {
    // Arrange
    const firstStep = vi.fn<WorkflowStep>().mockResolvedValue({
      type: 'stop',
      outcome: WORKFLOW_OUTCOMES.AUTO_SEND_INACTIVE,
    })
    const secondStep = vi.fn<WorkflowStep>().mockResolvedValue({ type: 'continue' })

    // Act
    const result = await runWorkflowSteps([firstStep, secondStep], workflowContext)

    // Assert
    expect(result.outcome).toEqual(WORKFLOW_OUTCOMES.AUTO_SEND_INACTIVE)
    expect(secondStep).not.toHaveBeenCalled()
  })

  it('should run all steps when every step continues', async () => {
    // Arrange
    const firstStep = vi.fn<WorkflowStep>().mockResolvedValue({ type: 'continue' })
    const secondStep = vi.fn<WorkflowStep>().mockResolvedValue({ type: 'continue' })

    // Act
    const result = await runWorkflowSteps([firstStep, secondStep], workflowContext)

    // Assert
    expect(result.outcome).toBeNull()
    expect(firstStep).toHaveBeenCalledWith(workflowContext)
    expect(secondStep).toHaveBeenCalledWith(workflowContext)
  })
})

describe('checkExtensionEnabled', () => {
  it('should stop workflow when extension is disabled', async () => {
    // Arrange
    vi.mocked(isExtensionEnabled).mockResolvedValue(false)

    // Act
    const result = await checkExtensionEnabled(workflowContext)

    // Assert
    expect(result).toEqual({
      type: 'stop',
      outcome: WORKFLOW_OUTCOMES.AUTO_SEND_INACTIVE,
    })
  })

  it('should continue workflow when extension is enabled', async () => {
    // Arrange
    vi.mocked(isExtensionEnabled).mockResolvedValue(true)

    // Act
    const result = await checkExtensionEnabled(workflowContext)

    // Assert
    expect(result).toEqual({ type: 'continue' })
  })
})

describe('runAutomaticWorkflow', () => {
  beforeEach(() => {
    vi.mocked(getTabIntegrations).mockResolvedValue({
      hawk: false,
      sentry: false,
      available: true,
    })
  })

  it('should return AUTO_SEND_INACTIVE when extension is disabled', async () => {
    // Arrange
    vi.mocked(isExtensionEnabled).mockResolvedValue(false)

    // Act
    const result = await runAutomaticWorkflow(workflowContext)

    // Assert
    expect(result.outcome).toEqual(WORKFLOW_OUTCOMES.AUTO_SEND_INACTIVE)
  })

  it('should return null outcome when extension is enabled and Hawk is not installed', async () => {
    // Arrange
    vi.mocked(isExtensionEnabled).mockResolvedValue(true)

    // Act
    const result = await runAutomaticWorkflow(workflowContext)

    // Assert
    expect(result.outcome).toBeNull()
  })

  it('should return HAWK_INSTALLED when Hawk is detected on page', async () => {
    // Arrange
    vi.mocked(isExtensionEnabled).mockResolvedValue(true)
    vi.mocked(getTabIntegrations).mockResolvedValue({
      hawk: true,
      sentry: false,
      available: true,
    })

    // Act
    const result = await runAutomaticWorkflow(workflowContext)

    // Assert
    expect(result.outcome).toEqual(WORKFLOW_OUTCOMES.HAWK_INSTALLED)
  })
})

describe('popupWorkflow', () => {
  it('should show AUTO_SEND_INACTIVE message when extension is disabled', () => {
    // Arrange
    // extension disabled, not loading

    // Act
    const label = getPopupWorkflowLabel(false, false)
    const outcome = resolvePopupWorkflowOutcome(false, false)

    // Assert
    expect(label).toBe('Автоматическая отправка неактивна')
    expect(outcome).toEqual(WORKFLOW_OUTCOMES.AUTO_SEND_INACTIVE)
    expect(isPopupWorkflowInactive(false, false)).toBe(true)
  })

  it('should show loading label while settings are loading', () => {
    // Arrange
    // loading state

    // Act
    const label = getPopupWorkflowLabel(true, true)

    // Assert
    expect(label).toBe('Загрузка…')
    expect(resolvePopupWorkflowOutcome(true, true)).toBeNull()
  })

  it('should show active label when extension is enabled', () => {
    // Arrange
    // extension enabled, not loading

    // Act
    const label = getPopupWorkflowLabel(true, false)

    // Assert
    expect(label).toBe('Активно')
    expect(isPopupWorkflowInactive(true, false)).toBe(false)
  })
})
