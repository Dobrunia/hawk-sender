import type { WorkflowOutcome } from '@/shared/workflow/outcomes'

export type WorkflowStepId =
  | 'check_extension_enabled'
  | 'check_ru_domain'
  | 'sync_page_integrations'
  | 'stop_if_sentry_missing'
  | 'stop_if_hawk_installed'
  | 'check_domain_send_history'
  | 'send_domain_letter'

export interface WorkflowContext {
  tabId: number
  tabUrl: string
  /** актуальное значение toggle — для popup без гонки со storage */
  enabled?: boolean
  /** актуальное значение RU-фильтра — для popup без гонки со storage */
  onlyRuDomains?: boolean
  /** актуальное значение Sentry-фильтра — для popup без гонки со storage */
  onlySentrySites?: boolean
}

export type WorkflowStepResult =
  | { type: 'continue' }
  | { type: 'stop'; outcome: WorkflowOutcome }

export type WorkflowStep = (
  context: WorkflowContext,
) => Promise<WorkflowStepResult>

export interface WorkflowStepDefinition {
  id: WorkflowStepId
  message: string
  step: WorkflowStep
}

export interface WorkflowStepProgress {
  id: WorkflowStepId
  message: string
  index: number
  total: number
}

export interface WorkflowRunOptions {
  onStepStart?: (progress: WorkflowStepProgress) => void | Promise<void>
}

export type WorkflowRunResult = {
  outcome: WorkflowOutcome | null
}
