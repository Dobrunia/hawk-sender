import type { DomainCheckRecord } from '@/shared/api/types'

export function hasSuccessfulSend(record: DomainCheckRecord): boolean {
  return record.sentTo.some((entry) => entry.status)
}

export function getSuccessfulRecipients(record: DomainCheckRecord): string[] {
  return record.sentTo.filter((entry) => entry.status).map((entry) => entry.to)
}
