export interface SendLetterContent {
  subject: string
  body: string
}

export interface SendLetterPayload {
  name: string
  address: string[]
  content: SendLetterContent
  password: string
}

export interface SentToEntry {
  to: string
  status: boolean
}

export interface DomainCheckRecord {
  name: string
  sentTo: SentToEntry[]
  updatedAt: string
}

export type DomainCheckResponse = 'no record' | DomainCheckRecord

export type SendLetterResponse = DomainCheckRecord
