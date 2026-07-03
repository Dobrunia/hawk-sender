import { readHawkInstalled } from '@/shared/integrations/readPageIntegrations'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'
import type { WorkflowStep } from '@/shared/workflow/types'

export const stopWorkflowIfHawkInstalled: WorkflowStep = async ({ tabId }) => {
  if (await readHawkInstalled(tabId)) {
    return {
      type: 'stop',
      outcome: getWorkflowOutcome('HAWK_INSTALLED'),
    }
  }

  return { type: 'continue' }
}
