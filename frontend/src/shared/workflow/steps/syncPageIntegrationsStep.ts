import { syncPageIntegrations } from '@/shared/detection/syncPageIntegrations'
import type { WorkflowStep } from '@/shared/workflow/types'

export const syncPageIntegrationsStep: WorkflowStep = async (context) => {
  await syncPageIntegrations(context)
  return { type: 'continue' }
}
