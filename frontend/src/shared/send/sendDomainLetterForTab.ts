import type { SentToEntry } from '@/shared/api/types'
import { sendLetter } from '@/shared/api/domainApi'
import {
  getSuccessfulRecipients,
  hasSuccessfulSend,
} from '@/shared/api/sendRecord'
import { extractDomainFromUrl } from '@/shared/domain/extractDomain'
import { readSentryInstalled } from '@/shared/integrations/readPageIntegrations'
import { buildLetterContent } from '@/shared/letters/buildLetter'
import { resolveDomainSendAddresses } from '@/shared/recipients/resolveDomainSendAddresses'

export type SendDomainLetterFailureReason =
  | 'no_domain'
  | 'no_delivery'
  | 'helper_error'

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
      error?: string
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
      const smtpError = getSmtpError(record.sentTo)

      return {
        status: 'failed',
        domain,
        reason: 'no_delivery',
        ...(smtpError ? { error: smtpError } : {}),
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
  } catch (error) {
    return {
      status: 'failed',
      domain,
      reason: 'helper_error',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export function formatManualSendResult(result: SendDomainLetterResult): {
  message: string
  color: 1 | 2 | 3
} {
  if (result.status === 'success') {
    const recipients = result.sentTo.map((entry) => entry.to).join(', ')

    return {
      message: recipients
        ? `SMTP принял письмо: ${recipients}`
        : 'SMTP принял письмо к отправке',
      color: 2,
    }
  }

  if (result.reason === 'no_domain') {
    return {
      message: 'Не удалось определить домен страницы',
      color: 1,
    }
  }

  if (result.reason === 'no_delivery') {
    return {
      message: result.error
        ? formatSmtpFailureMessage(result.error)
        : 'Ошибка отправки: SMTP не принял письмо ни на один адрес',
      color: 1,
    }
  }

  return {
    message: result.error
      ? `Ошибка helper: ${result.error}`
      : 'Ошибка helper',
    color: 1,
  }
}

function formatSmtpFailureMessage(error: string): string {
  if (error.startsWith('SMTP лимит отправки:')) {
    return error
  }

  return `Ошибка SMTP: ${error}`
}

function getSmtpError(sentTo: SentToEntry[]): string | undefined {
  const rateLimit = sentTo.find((entry) => entry.errorCode === 'rate_limit')

  if (rateLimit?.error) {
    return rateLimit.error
  }

  const errors = sentTo
    .filter((entry) => !entry.status && entry.error)
    .map((entry) => `${entry.to}: ${entry.error}`)

  return errors.length > 0 ? errors.join('; ') : undefined
}
