import browser from 'webextension-polyfill'

export const NATIVE_HOST_NAME = 'hawk_sender'

export type NativeHostAction = 'ping' | 'start' | 'stop' | 'status'

export interface NativeHostResponse {
  ok: boolean
  running?: boolean
  started?: boolean
  alreadyRunning?: boolean
  stopped?: boolean
  error?: string
  serverDir?: string
}

export async function sendNativeHostMessage(
  action: NativeHostAction,
): Promise<NativeHostResponse | null> {
  try {
    return (await browser.runtime.sendNativeMessage(NATIVE_HOST_NAME, {
      action,
    })) as NativeHostResponse
  } catch {
    return null
  }
}

export async function isNativeHostAvailable(): Promise<boolean> {
  const response = await sendNativeHostMessage('ping')
  return response?.ok === true
}

export async function startLocalServer(): Promise<NativeHostResponse | null> {
  return sendNativeHostMessage('start')
}

export async function stopLocalServer(): Promise<NativeHostResponse | null> {
  return sendNativeHostMessage('stop')
}
