import { getApiBaseUrl } from '@/shared/api/config'

export interface ServerHealth {
  ok: boolean
  smtp: boolean
}

export async function checkServerHealth(): Promise<ServerHealth | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      signal: AbortSignal.timeout(3000),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as ServerHealth
  } catch {
    return null
  }
}

export function isServerOnline(health: ServerHealth | null): boolean {
  return health?.ok === true
}
