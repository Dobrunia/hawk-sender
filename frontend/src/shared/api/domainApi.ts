import {
  invokeNativeHost,
  type NativeHostDataResponse,
} from '@/shared/native/nativeClient'
import type {
  DomainCheckRecord,
  DomainCheckResponse,
  SendLetterPayload,
  SendLetterResponse,
} from '@/shared/api/types'

export async function checkDomain(name: string): Promise<DomainCheckResponse> {
  const response = await invokeNativeHost<
    NativeHostDataResponse<DomainCheckRecord | 'no record'>
  >({
    action: 'check',
    name,
  })

  if (!response.ok) {
    throw new Error(response.error ?? 'Domain check failed')
  }

  return response.data ?? 'no record'
}

export async function sendLetter(
  payload: SendLetterPayload,
): Promise<SendLetterResponse> {
  const response = await invokeNativeHost<NativeHostDataResponse<SendLetterResponse>>({
    action: 'send',
    name: payload.name,
    address: payload.address,
    content: payload.content,
  })

  if (!response.ok || !response.data) {
    throw new Error(response.error ?? 'Send letter failed')
  }

  return response.data
}

export { getSuccessfulRecipients, hasSuccessfulSend } from '@/shared/api/sendRecord'
