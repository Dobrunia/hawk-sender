import type {
  WorkflowContext,
  WorkflowRunOptions,
  WorkflowRunResult,
  WorkflowStep,
  WorkflowStepDefinition,
} from '@/shared/workflow/types'

function normalizeStep(
  step: WorkflowStep | WorkflowStepDefinition,
): WorkflowStepDefinition {
  if ('step' in step) {
    return step
  }

  return {
    id: 'send_domain_letter',
    message: 'Выполняем шаг workflow',
    step,
  }
}

export async function runWorkflowSteps(
  steps: readonly (WorkflowStep | WorkflowStepDefinition)[],
  context: WorkflowContext,
  options: WorkflowRunOptions = {},
): Promise<WorkflowRunResult> {
  for (const [index, rawStep] of steps.entries()) {
    const step = normalizeStep(rawStep)

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
