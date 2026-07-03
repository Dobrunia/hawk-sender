import browser from 'webextension-polyfill'

export const NATIVE_HOST_NAME = 'hawk_sender'

export type NativeHostAction = 'ping' | 'check' | 'dump' | 'send'

export interface NativeHostRequest {
  action: NativeHostAction
  name?: string
  address?: string[]
  content?: {
    subject: string
    body: string
  }
}

export interface NativeHostPingResponse {
  ok: boolean
  smtp?: boolean
  error?: string
}

export interface NativeHostDataResponse<T> {
  ok: boolean
  data?: T
  error?: string
}

async function callNativeHost<T>(request: NativeHostRequest): Promise<T> {
  return (await browser.runtime.sendNativeMessage(
    NATIVE_HOST_NAME,
    request,
  )) as T
}

export async function invokeNativeHost<T extends { ok: boolean }>(
  request: NativeHostRequest,
): Promise<T> {
  try {
    const response = await callNativeHost<T>(request)

    if (!response || typeof response !== 'object') {
      throw new Error('Native helper returned empty response')
    }

    return response
  } catch (directError) {
    try {
      const response = await browser.runtime.sendMessage({
        type: 'native-host',
        ...request,
      })

      if (response && typeof response === 'object') {
        return response as T
      }
    } catch {
      // fall through
    }

    throw directError instanceof Error
      ? directError
      : new Error(String(directError))
  }
}

export async function pingNativeHost(): Promise<NativeHostPingResponse> {
  try {
    return await invokeNativeHost<NativeHostPingResponse>({ action: 'ping' })
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export function isNativeHostRequest(
  message: unknown,
): message is NativeHostRequest & { type: 'native-host' } {
  return (
    typeof message === 'object'
    && message !== null
    && 'type' in message
    && message.type === 'native-host'
    && 'action' in message
  )
}

export async function handleNativeHostRequest(
  request: NativeHostRequest,
): Promise<{ ok: boolean; smtp?: boolean; data?: unknown; error?: string }> {
  try {
    return await callNativeHost(request)
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
