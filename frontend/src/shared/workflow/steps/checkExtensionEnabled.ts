import { isExtensionEnabled } from '@/shared/storage/settingsStorage'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'
import type { WorkflowStep } from '@/shared/workflow/types'

export const checkExtensionEnabled: WorkflowStep = async (context) => {
  const enabled = context.enabled ?? await isExtensionEnabled()

  if (!enabled) {
    return {
      type: 'stop',
      outcome: getWorkflowOutcome('AUTO_SEND_INACTIVE'),
    }
  }

  return { type: 'continue' }
}
