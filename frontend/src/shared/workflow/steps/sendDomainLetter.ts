import { sendDomainLetterForTab } from '@/shared/send/sendDomainLetterForTab'
import { toSendDomainLetterWorkflowOutcome } from '@/shared/workflow/sendDomainLetterOutcome'
import type { WorkflowStep } from '@/shared/workflow/types'

export const sendDomainLetter: WorkflowStep = async ({ tabId, tabUrl }) => {
  const result = await sendDomainLetterForTab({ tabId, tabUrl })
  const outcome = toSendDomainLetterWorkflowOutcome(result)

  if (!outcome) {
    return { type: 'continue' }
  }

  return {
    type: 'stop',
    outcome,
  }
}
