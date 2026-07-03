export type WorkflowOutcomeColor = 1 | 2 | 3

/** 1 — красный, 2 — зелёный, 3 — нейтральный (инфо) */
export const WORKFLOW_OUTCOME_COLORS: Record<WorkflowOutcomeColor, string> = {
  1: '#dc2626',
  2: '#16a34a',
  3: '#64748b',
}

export interface WorkflowOutcome {
  code: string
  message: string
  /** 1 — красный, 2 — зелёный, 3 — нейтральный */
  color: WorkflowOutcomeColor
  /** true — дальнейшие шаги pipeline не выполняются */
  terminal: boolean
}

export const WORKFLOW_OUTCOMES = {
  AUTO_SEND_INACTIVE: {
    code: 'AUTO_SEND_INACTIVE',
    message: 'Автоматическая отправка неактивна',
    color: 3,
    terminal: true,
  },
  HAWK_INSTALLED: {
    code: 'HAWK_INSTALLED',
    message: 'Hawk установлен',
    color: 2,
    terminal: true,
  },
  DOMAIN_NOT_RU: {
    code: 'DOMAIN_NOT_RU',
    message: 'Домен не в зоне .ru',
    color: 3,
    terminal: true,
  },
  PAGE_ACCESS_UNAVAILABLE: {
    code: 'PAGE_ACCESS_UNAVAILABLE',
    message: 'Нет доступа к проверке страницы',
    color: 3,
    terminal: true,
  },
  EMAIL_ALREADY_SENT_WITHIN_HALF_YEAR: {
    code: 'EMAIL_ALREADY_SENT_WITHIN_HALF_YEAR',
    message: 'SMTP уже принимал письмо за последние полгода',
    color: 3,
    terminal: true,
  },
  EMAIL_SENT: {
    code: 'EMAIL_SENT',
    message: 'SMTP принял письмо к отправке',
    color: 2,
    terminal: true,
  },
  EMAIL_NO_DELIVERY: {
    code: 'EMAIL_NO_DELIVERY',
    message: 'Ошибка отправки: SMTP не принял письмо ни на один адрес',
    color: 1,
    terminal: true,
  },
  EMAIL_HELPER_ERROR: {
    code: 'EMAIL_HELPER_ERROR',
    message: 'Ошибка helper',
    color: 1,
    terminal: true,
  },
  EMAIL_SEND_FAILED: {
    code: 'EMAIL_SEND_FAILED',
    message: 'Ошибка отправки',
    color: 1,
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

export function getOutcomeColorValue(color: WorkflowOutcomeColor): string {
  return WORKFLOW_OUTCOME_COLORS[color]
}

export function resolvePopupOutcome(
  outcome: WorkflowOutcome | null,
  loading: boolean,
): { message: string; color: WorkflowOutcomeColor | null } {
  if (loading) {
    return { message: 'Загрузка…', color: null }
  }

  if (!outcome) {
    return { message: '', color: null }
  }

  return {
    message: outcome.message,
    color: outcome.color,
  }
}
