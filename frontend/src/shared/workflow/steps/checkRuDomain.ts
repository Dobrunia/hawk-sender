import { getWorkflowOutcome } from '@/shared/workflow/outcomes'
import type { WorkflowStep } from '@/shared/workflow/types'

export function isRuDomainUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/\.$/, '')

    return hostname === 'ru' || hostname.endsWith('.ru')
  } catch {
    return false
  }
}

export const checkRuDomain: WorkflowStep = async ({ tabUrl }) => {
  if (!isRuDomainUrl(tabUrl)) {
    return {
      type: 'stop',
      outcome: getWorkflowOutcome('DOMAIN_NOT_RU'),
    }
  }

  return { type: 'continue' }
}
