import browser from 'webextension-polyfill'
import type { WorkflowOutcome } from '@/shared/workflow/outcomes'

export interface RunAutomaticWorkflowRequest {
  type: 'run-automatic-workflow'
  tabId: number
  tabUrl: string
  enabled?: boolean
}

export interface RunAutomaticWorkflowResponse {
  ok: boolean
  outcome?: WorkflowOutcome | null
  error?: string
}

export function isRunAutomaticWorkflowRequest(
  message: unknown,
): message is RunAutomaticWorkflowRequest {
  return (
    typeof message === 'object'
    && message !== null
    && 'type' in message
    && message.type === 'run-automatic-workflow'
    && 'tabId' in message
    && 'tabUrl' in message
  )
}

export async function requestAutomaticWorkflowRun(
  context: Omit<RunAutomaticWorkflowRequest, 'type'>,
): Promise<WorkflowOutcome | null> {
  const response = (await browser.runtime.sendMessage({
    type: 'run-automatic-workflow',
    ...context,
  } satisfies RunAutomaticWorkflowRequest)) as RunAutomaticWorkflowResponse

  if (!response?.ok) {
    throw new Error(response?.error ?? 'Automatic workflow failed')
  }

  return response.outcome ?? null
}
