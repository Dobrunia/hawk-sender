import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { runAutomaticWorkflow } from '@/shared/workflow/automaticWorkflow'
import type { WorkflowContext, WorkflowStep } from '@/shared/workflow/types'
import { runWorkflowSteps } from '@/shared/workflow/runner'
import { checkExtensionEnabled } from '@/shared/workflow/steps/checkExtensionEnabled'
import {
  getWorkflowOutcome,
  resolvePopupOutcome,
  WORKFLOW_OUTCOMES,
} from '@/shared/workflow/outcomes'

vi.mock('@/shared/storage/settingsStorage', () => ({
  isExtensionEnabled: vi.fn(),
}))

vi.mock('@/shared/detection/getActiveTabIntegrations', () => ({
  getTabIntegrations: vi.fn(),
}))

vi.mock('@/shared/storage/pageIntegrationsStorage', () => {
  const store: Record<string, import('@/shared/types/pageIntegrationState').PageIntegrationState> =
    {}

  return {
    getPageIntegrationsByTabId: vi.fn(async (tabId: number) => store[String(tabId)] ?? null),
    setPageIntegrations: vi.fn(async (state) => {
      store[String(state.tabId)] = state
    }),
  }
})

vi.mock('@/shared/api/domainApi', () => ({
  checkDomain: vi.fn(),
  sendLetter: vi.fn(),
}))

vi.mock('@/shared/recipients/resolveDomainSendAddresses', () => ({
  resolveDomainSendAddresses: vi.fn(),
}))

import { isExtensionEnabled } from '@/shared/storage/settingsStorage'
import { getTabIntegrations } from '@/shared/detection/getActiveTabIntegrations'
import { getPageIntegrationsByTabId } from '@/shared/storage/pageIntegrationsStorage'
import { checkDomain, sendLetter } from '@/shared/api/domainApi'
import { resolveDomainSendAddresses } from '@/shared/recipients/resolveDomainSendAddresses'

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

  it('should continue workflow when extension is enabled via context', async () => {
    // Arrange
    vi.mocked(isExtensionEnabled).mockResolvedValue(false)

    // Act
    const result = await checkExtensionEnabled({
      ...workflowContext,
      enabled: true,
    })

    // Assert
    expect(result).toEqual({ type: 'continue' })
  })

  it('should continue workflow when extension is enabled in storage', async () => {
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
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-03T12:00:00.000Z'))
    vi.mocked(getTabIntegrations).mockReset()
    vi.mocked(checkDomain).mockReset()
    vi.mocked(getTabIntegrations).mockResolvedValue({
      hawk: false,
      sentry: false,
      available: true,
    })
    vi.mocked(checkDomain).mockResolvedValue('no record')
    vi.mocked(sendLetter).mockResolvedValue({
      name: 'example.com',
      sentTo: [{ to: 'contact@example.com', status: true }],
      updatedAt: '2026-07-03T12:00:00.000Z',
    })
    vi.mocked(resolveDomainSendAddresses).mockResolvedValue(['contact@example.com'])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return AUTO_SEND_INACTIVE when extension is disabled', async () => {
    // Arrange
    vi.mocked(isExtensionEnabled).mockResolvedValue(false)

    // Act
    const result = await runAutomaticWorkflow(workflowContext)

    // Assert
    expect(result.outcome).toEqual(WORKFLOW_OUTCOMES.AUTO_SEND_INACTIVE)
  })

  it('should return EMAIL_SENT when extension is enabled and letter is delivered', async () => {
    // Arrange
    vi.mocked(isExtensionEnabled).mockResolvedValue(true)

    // Act
    const result = await runAutomaticWorkflow(workflowContext)

    // Assert
    expect(result.outcome).toEqual(WORKFLOW_OUTCOMES.EMAIL_SENT)
    expect(sendLetter).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'example.com',
        address: expect.any(Array),
        content: expect.objectContaining({
          subject: expect.stringContaining('example.com'),
          body: expect.stringContaining('example.com'),
        }),
      }),
    )
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
    expect(await getPageIntegrationsByTabId(workflowContext.tabId)).toMatchObject({
      hawk: true,
      sentry: false,
    })
  })

  it('should return EMAIL_ALREADY_SENT_WITHIN_HALF_YEAR when domain was sent recently', async () => {
    // Arrange
    vi.mocked(isExtensionEnabled).mockResolvedValue(true)
    vi.mocked(checkDomain).mockResolvedValue({
      name: 'example.com',
      sentTo: [{ to: 'sales@example.com', status: true }],
      updatedAt: '2026-04-01T12:00:00.000Z',
    })

    // Act
    const result = await runAutomaticWorkflow(workflowContext)

    // Assert
    expect(result.outcome).toEqual(WORKFLOW_OUTCOMES.EMAIL_ALREADY_SENT_WITHIN_HALF_YEAR)
  })
})

describe('resolvePopupOutcome', () => {
  it('should show AUTO_SEND_INACTIVE message and red color from outcome', () => {
    // Arrange
    const outcome = WORKFLOW_OUTCOMES.AUTO_SEND_INACTIVE

    // Act
    const display = resolvePopupOutcome(outcome, false)

    // Assert
    expect(display.message).toBe('Автоматическая отправка неактивна')
    expect(display.color).toBe(1)
  })

  it('should show HAWK_INSTALLED message and green color from outcome', () => {
    // Arrange
    const outcome = WORKFLOW_OUTCOMES.HAWK_INSTALLED

    // Act
    const display = resolvePopupOutcome(outcome, false)

    // Assert
    expect(display.message).toBe('Hawk установлен')
    expect(display.color).toBe(2)
  })

  it('should show EMAIL_ALREADY_SENT_WITHIN_HALF_YEAR message and neutral color from outcome', () => {
    // Arrange
    const outcome = WORKFLOW_OUTCOMES.EMAIL_ALREADY_SENT_WITHIN_HALF_YEAR

    // Act
    const display = resolvePopupOutcome(outcome, false)

    // Assert
    expect(display.message).toBe('Письмо уже отправлялось за последние полгода')
    expect(display.color).toBe(3)
  })

  it('should show EMAIL_SENT message and green color from outcome', () => {
    // Arrange
    const outcome = WORKFLOW_OUTCOMES.EMAIL_SENT

    // Act
    const display = resolvePopupOutcome(outcome, false)

    // Assert
    expect(display.message).toBe('Письмо отправлено')
    expect(display.color).toBe(2)
  })

  it('should show EMAIL_HELPER_ERROR message and red color from outcome', () => {
    // Arrange
    const outcome = WORKFLOW_OUTCOMES.EMAIL_HELPER_ERROR

    // Act
    const display = resolvePopupOutcome(outcome, false)

    // Assert
    expect(display.message).toBe('Ошибка helper')
    expect(display.color).toBe(1)
  })

  it('should show EMAIL_NO_DELIVERY message and neutral color from outcome', () => {
    // Arrange
    const outcome = WORKFLOW_OUTCOMES.EMAIL_NO_DELIVERY

    // Act
    const display = resolvePopupOutcome(outcome, false)

    // Assert
    expect(display.message).toBe('Ни на один адрес не доставлено')
    expect(display.color).toBe(3)
  })

  it('should show loading message without outcome color while loading', () => {
    // Act
    const display = resolvePopupOutcome(null, true)

    // Assert
    expect(display.message).toBe('Загрузка…')
    expect(display.color).toBeNull()
  })

  it('should return empty display when workflow has no outcome', () => {
    // Act
    const display = resolvePopupOutcome(null, false)

    // Assert
    expect(display).toEqual({ message: '', color: null })
  })
})
