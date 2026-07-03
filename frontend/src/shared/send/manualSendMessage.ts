import browser from 'webextension-polyfill'
import type { SendDomainLetterResult } from '@/shared/send/sendDomainLetterForTab'

export interface ManualSendRequest {
  type: 'manual-send'
  tabId: number
  tabUrl: string
}

interface ManualSendResponse {
  ok: boolean
  result?: SendDomainLetterResult
  error?: string
}

export function isManualSendRequest(
  message: unknown,
): message is ManualSendRequest {
  return (
    typeof message === 'object'
    && message !== null
    && 'type' in message
    && message.type === 'manual-send'
    && 'tabId' in message
    && 'tabUrl' in message
  )
}

export async function runManualSend(
  context: Omit<ManualSendRequest, 'type'>,
): Promise<SendDomainLetterResult> {
  const response = (await browser.runtime.sendMessage({
    type: 'manual-send',
    ...context,
  } satisfies ManualSendRequest)) as ManualSendResponse

  if (!response?.ok || !response.result) {
    return {
      status: 'failed',
      domain: null,
      reason: 'helper_error',
      error: response?.error ?? 'Manual send failed',
    }
  }

  return response.result
}
