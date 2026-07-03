import { checkDomain } from '@/shared/api/domainApi'
import { hasSuccessfulSend } from '@/shared/api/sendRecord'
import { extractDomainFromUrl } from '@/shared/domain/extractDomain'
import { isWithinSixMonths } from '@/shared/domain/sendCooldown'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'
import type { WorkflowStep } from '@/shared/workflow/types'

export const checkDomainSendHistory: WorkflowStep = async ({ tabUrl }) => {
  const domain = extractDomainFromUrl(tabUrl)

  if (!domain) {
    return { type: 'continue' }
  }

  const record = await checkDomain(domain)

  if (record === 'no record') {
    return { type: 'continue' }
  }

  if (hasSuccessfulSend(record) && isWithinSixMonths(record.updatedAt)) {
    return {
      type: 'stop',
      outcome: getWorkflowOutcome('EMAIL_ALREADY_SENT_WITHIN_HALF_YEAR'),
    }
  }

  return { type: 'continue' }
}
