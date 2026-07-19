import type { SendDomainLetterResult } from '@/shared/send/sendDomainLetterForTab'
import {
  formatHelperFailureMessage,
  formatNoDeliveryMessage,
} from '@/shared/send/sendDomainLetterMessages'
import {
  getWorkflowOutcome,
  type WorkflowOutcome,
} from '@/shared/workflow/outcomes'

export function toSendDomainLetterWorkflowOutcome(
  result: SendDomainLetterResult,
): WorkflowOutcome | null {
  if (result.status === 'success') {
    return getWorkflowOutcome('EMAIL_SENT')
  }

  if (result.reason === 'no_domain') {
    return null
  }

  if (result.reason === 'no_delivery') {
    return {
      ...getWorkflowOutcome('EMAIL_NO_DELIVERY'),
      message: formatNoDeliveryMessage(result.error),
    }
  }

  return {
    ...getWorkflowOutcome('EMAIL_HELPER_ERROR'),
    message: formatHelperFailureMessage(result.error),
  }
}
