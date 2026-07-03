import { sendDomainLetterForTab } from '@/shared/send/sendDomainLetterForTab'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'
import type { WorkflowStep } from '@/shared/workflow/types'

export const sendDomainLetter: WorkflowStep = async ({ tabId, tabUrl }) => {
  const result = await sendDomainLetterForTab({ tabId, tabUrl })

  if (result.status === 'success') {
    return {
      type: 'stop',
      outcome: getWorkflowOutcome('EMAIL_SENT'),
    }
  }

  if (result.reason === 'no_domain') {
    return { type: 'continue' }
  }

  return {
    type: 'stop',
    outcome: getWorkflowOutcome('EMAIL_SEND_FAILED'),
  }
}
