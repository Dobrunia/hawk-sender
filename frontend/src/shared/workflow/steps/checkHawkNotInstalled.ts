import { getTabIntegrations } from '@/shared/detection/getActiveTabIntegrations'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'
import type { WorkflowStep } from '@/shared/workflow/types'

export const checkHawkNotInstalled: WorkflowStep = async ({ tabId }) => {
  const integrations = await getTabIntegrations(tabId)

  if (integrations.hawk) {
    return {
      type: 'stop',
      outcome: getWorkflowOutcome('HAWK_INSTALLED'),
    }
  }

  return { type: 'continue' }
}
