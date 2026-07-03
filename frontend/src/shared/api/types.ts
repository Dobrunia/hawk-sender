export interface SendLetterContent {
  subject: string
  body: string
}

export interface SendLetterPayload {
  name: string
  address: string[]
  content: SendLetterContent
}

export interface SentToEntry {
  to: string
  /** true means the outgoing SMTP server accepted the message, not final delivery. */
  status: boolean
  error?: string
}

export interface DomainCheckRecord {
  name: string
  sentTo: SentToEntry[]
  updatedAt: string
}

export type DomainCheckResponse = 'no record' | DomainCheckRecord

export type SendLetterResponse = DomainCheckRecord
