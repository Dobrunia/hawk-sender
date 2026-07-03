export interface WorkflowOutcome {
  code: string
  message: string
  /** true — дальнейшие шаги pipeline не выполняются */
  terminal: boolean
}

export const WORKFLOW_OUTCOMES = {
  AUTO_SEND_INACTIVE: {
    code: 'AUTO_SEND_INACTIVE',
    message: 'Автоматическая отправка неактивна',
    terminal: true,
  },
} as const satisfies Record<string, WorkflowOutcome>

export type WorkflowOutcomeCode = keyof typeof WORKFLOW_OUTCOMES

export function getWorkflowOutcome(code: WorkflowOutcomeCode): WorkflowOutcome {
  return WORKFLOW_OUTCOMES[code]
}

export function isWorkflowOutcomeCode(value: string): value is WorkflowOutcomeCode {
  return value in WORKFLOW_OUTCOMES
}
