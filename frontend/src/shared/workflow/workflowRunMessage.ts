import browser from 'webextension-polyfill'
import type { WorkflowOutcome } from '@/shared/workflow/outcomes'

export type WorkflowRunMode = 'automatic' | 'manual'

export interface RunWorkflowRequest {
  type: 'run-workflow'
  mode: WorkflowRunMode
  tabId: number
  tabUrl: string
  enabled?: boolean
  onlyRuDomains?: boolean
  onlySentrySites?: boolean
}

export interface RunWorkflowResponse {
  ok: boolean
  outcome?: WorkflowOutcome | null
  error?: string
}

export function isRunWorkflowRequest(
  message: unknown,
): message is RunWorkflowRequest {
  return (
    typeof message === 'object'
    && message !== null
    && 'type' in message
    && message.type === 'run-workflow'
    && 'mode' in message
    && 'tabId' in message
    && 'tabUrl' in message
  )
}

export async function requestWorkflowRun(
  context: Omit<RunWorkflowRequest, 'type'>,
): Promise<WorkflowOutcome | null> {
  const response = (await browser.runtime.sendMessage({
    type: 'run-workflow',
    ...context,
  } satisfies RunWorkflowRequest)) as RunWorkflowResponse

  if (!response?.ok) {
    throw new Error(response?.error ?? 'Workflow failed')
  }

  return response.outcome ?? null
}
