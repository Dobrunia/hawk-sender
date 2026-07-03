import { syncPageIntegrations } from '@/shared/detection/syncPageIntegrations'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'
import type { WorkflowStep } from '@/shared/workflow/types'

export const syncPageIntegrationsStep: WorkflowStep = async (context) => {
  const state = await syncPageIntegrations(context)

  if (state.hawk === null && state.sentry === null) {
    return {
      type: 'stop',
      outcome: getWorkflowOutcome('PAGE_ACCESS_UNAVAILABLE'),
    }
  }

  return { type: 'continue' }
}
