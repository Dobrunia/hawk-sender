import type { WorkflowOutcome } from '@/shared/workflow/outcomes'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'

export function resolvePopupWorkflowOutcome(
  enabled: boolean,
  loading: boolean,
): WorkflowOutcome | null {
  if (loading) {
    return null
  }

  if (!enabled) {
    return getWorkflowOutcome('AUTO_SEND_INACTIVE')
  }

  return null
}

export function getPopupWorkflowLabel(
  enabled: boolean,
  loading: boolean,
): string {
  if (loading) {
    return 'Загрузка…'
  }

  const outcome = resolvePopupWorkflowOutcome(enabled, loading)

  if (outcome) {
    return outcome.message
  }

  return 'Активно'
}

export function isPopupWorkflowInactive(
  enabled: boolean,
  loading: boolean,
): boolean {
  return !loading && !enabled
}
