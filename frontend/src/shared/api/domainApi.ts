import { getApiBaseUrl } from '@/shared/api/config'
import type {
  DomainCheckRecord,
  DomainCheckResponse,
  SendLetterPayload,
  SendLetterResponse,
} from '@/shared/api/types'

function buildApiUrl(path: string): string {
  return `${getApiBaseUrl().replace(/\/$/, '')}${path}`
}

export async function checkDomain(name: string): Promise<DomainCheckResponse> {
  const response = await fetch(buildApiUrl(`/check/${encodeURIComponent(name)}`))

  if (!response.ok) {
    throw new Error(`Domain check failed with status ${response.status}`)
  }

  const data: unknown = await response.json()

  if (data === 'no record') {
    return 'no record'
  }

  return data as DomainCheckRecord
}

export async function sendLetter(
  payload: SendLetterPayload,
): Promise<SendLetterResponse> {
  const response = await fetch(buildApiUrl('/send'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Send letter failed with status ${response.status}`)
  }

  return (await response.json()) as SendLetterResponse
}

export function hasSuccessfulSend(record: DomainCheckRecord): boolean {
  return record.sentTo.some((entry) => entry.status)
}

export function getSuccessfulRecipients(record: DomainCheckRecord): string[] {
  return record.sentTo.filter((entry) => entry.status).map((entry) => entry.to)
}
