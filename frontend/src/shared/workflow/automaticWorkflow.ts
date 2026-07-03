import { runWorkflowSteps } from '@/shared/workflow/runner'
import { checkExtensionEnabled } from '@/shared/workflow/steps/checkExtensionEnabled'
import type { WorkflowContext, WorkflowRunResult } from '@/shared/workflow/types'

const AUTOMATIC_WORKFLOW_STEPS = [
  checkExtensionEnabled,
  // checkHawkNotConnected,
  // checkDomainNotInList,
  // checkDomainSentRecently,
  // detectSentryAndSendEmail,
  // recordSentDomain,
] as const

export async function runAutomaticWorkflow(
  context: WorkflowContext,
): Promise<WorkflowRunResult> {
  return runWorkflowSteps(AUTOMATIC_WORKFLOW_STEPS, context)
}
