import type { WorkflowOutcome } from '@/shared/workflow/outcomes'

export interface WorkflowContext {
  tabId: number
  tabUrl: string
  /** актуальное значение toggle — для popup без гонки со storage */
  enabled?: boolean
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
