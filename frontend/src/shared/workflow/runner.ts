import type {
  WorkflowContext,
  WorkflowRunOptions,
  WorkflowRunResult,
  WorkflowStepDefinition,
} from '@/shared/workflow/types'

export async function runWorkflowSteps(
  steps: readonly WorkflowStepDefinition[],
  context: WorkflowContext,
  options: WorkflowRunOptions = {},
): Promise<WorkflowRunResult> {
  for (const [index, step] of steps.entries()) {
    await options.onStepStart?.({
      id: step.id,
      message: step.message,
      index,
      total: steps.length,
    })

    const result = await step.step(context)

    if (result.type === 'stop') {
      return { outcome: result.outcome }
    }
  }

  return { outcome: null }
}
