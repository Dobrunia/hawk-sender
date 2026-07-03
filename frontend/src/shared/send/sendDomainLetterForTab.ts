import type { SentToEntry } from '@/shared/api/types'
import {
  getSuccessfulRecipients,
  hasSuccessfulSend,
  sendLetter,
} from '@/shared/api/domainApi'
import { extractDomainFromUrl } from '@/shared/domain/extractDomain'
import { readSentryInstalled } from '@/shared/integrations/readPageIntegrations'
import { buildLetterContent } from '@/shared/letters/buildLetter'
import { resolveDomainSendAddresses } from '@/shared/recipients/resolveDomainSendAddresses'

export type SendDomainLetterFailureReason =
  | 'no_domain'
  | 'send_failed'
  | 'network_error'

export type SendDomainLetterResult =
  | {
      status: 'success'
      domain: string
      sentTo: SentToEntry[]
    }
  | {
      status: 'failed'
      domain: string | null
      reason: SendDomainLetterFailureReason
    }

export interface SendDomainLetterInput {
  tabId: number
  tabUrl: string
}

export async function sendDomainLetterForTab(
  input: SendDomainLetterInput,
): Promise<SendDomainLetterResult> {
  const domain = extractDomainFromUrl(input.tabUrl)

  if (!domain) {
    return {
      status: 'failed',
      domain: null,
      reason: 'no_domain',
    }
  }

  const sentry = await readSentryInstalled(input.tabId)
  const addresses = await resolveDomainSendAddresses({
    tabId: input.tabId,
    domain,
  })
  const letter = buildLetterContent(domain, sentry)

  try {
    const record = await sendLetter({
      name: domain,
      address: addresses,
      content: {
        subject: letter.subject,
        body: letter.body,
      },
    })

    if (!hasSuccessfulSend(record)) {
      return {
        status: 'failed',
        domain,
        reason: 'send_failed',
      }
    }

    return {
      status: 'success',
      domain,
      sentTo: getSuccessfulRecipients(record).map((to) => ({
        to,
        status: true,
      })),
    }
  } catch {
    return {
      status: 'failed',
      domain,
      reason: 'network_error',
    }
  }
}

export function formatManualSendResult(result: SendDomainLetterResult): {
  message: string
  color: 1 | 2
} {
  if (result.status === 'success') {
    const recipients = result.sentTo.map((entry) => entry.to).join(', ')

    return {
      message: recipients
        ? `Письмо отправлено: ${recipients}`
        : 'Письмо отправлено',
      color: 2,
    }
  }

  if (result.reason === 'no_domain') {
    return {
      message: 'Не удалось определить домен страницы',
      color: 1,
    }
  }

  return {
    message: 'Не удалось отправить письмо',
    color: 1,
  }
}
