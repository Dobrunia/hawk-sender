import { readSentryInstalled } from '@/shared/integrations/readPageIntegrations'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'
import type { WorkflowStep } from '@/shared/workflow/types'

export const stopWorkflowIfSentryMissing: WorkflowStep = async ({ tabId }) => {
  if (!(await readSentryInstalled(tabId))) {
    return {
      type: 'stop',
      outcome: getWorkflowOutcome('SENTRY_NOT_INSTALLED'),
    }
  }

  return { type: 'continue' }
}
