import { runWorkflowSteps } from '@/shared/workflow/runner'
import { checkDomainSendHistory } from '@/shared/workflow/steps/checkDomainSendHistory'
import { checkExtensionEnabled } from '@/shared/workflow/steps/checkExtensionEnabled'
import { sendDomainLetter } from '@/shared/workflow/steps/sendDomainLetter'
import { stopWorkflowIfHawkInstalled } from '@/shared/workflow/steps/stopWorkflowIfHawkInstalled'
import { syncPageIntegrationsStep } from '@/shared/workflow/steps/syncPageIntegrationsStep'
import type { WorkflowContext, WorkflowRunResult } from '@/shared/workflow/types'

const AUTOMATIC_WORKFLOW_STEPS = [
  checkExtensionEnabled,
  syncPageIntegrationsStep,
  stopWorkflowIfHawkInstalled,
  checkDomainSendHistory,
  sendDomainLetter,
] as const

export async function runAutomaticWorkflow(
  context: WorkflowContext,
): Promise<WorkflowRunResult> {
  return runWorkflowSteps(AUTOMATIC_WORKFLOW_STEPS, context)
}
