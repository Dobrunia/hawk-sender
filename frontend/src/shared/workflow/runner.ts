import type {
  WorkflowContext,
  WorkflowRunResult,
  WorkflowStep,
} from '@/shared/workflow/types'

export async function runWorkflowSteps(
  steps: readonly WorkflowStep[],
  context: WorkflowContext,
): Promise<WorkflowRunResult> {
  for (const step of steps) {
    const result = await step(context)

    if (result.type === 'stop') {
      return { outcome: result.outcome }
    }
  }

  return { outcome: null }
}
