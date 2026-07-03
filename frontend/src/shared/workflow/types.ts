import type { WorkflowOutcome } from '@/shared/workflow/outcomes'

export interface WorkflowContext {
  tabId: number
  tabUrl: string
}

export type WorkflowStepResult =
  | { type: 'continue' }
  | { type: 'stop'; outcome: WorkflowOutcome }

export type WorkflowStep = (
  context: WorkflowContext,
) => Promise<WorkflowStepResult>

export type WorkflowRunResult = {
  outcome: WorkflowOutcome | null
}
