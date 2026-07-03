import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatSmtpError } from '../lib/smtp.js'

describe('formatSmtpError', () => {
  it('returns one short message for rate limit errors', () => {
    const message = formatSmtpError([
      {
        to: 'contact@example.ru',
        status: false,
        error: 'SMTP лимит отправки: подождите до 1 часа',
        errorCode: 'rate_limit',
        retryAfter: 'до 1 часа',
      },
      {
        to: 'info@example.ru',
        status: false,
        error: 'Repeated SMTP error',
      },
    ])

    assert.equal(message, 'SMTP лимит отправки: подождите до 1 часа')
  })
})
