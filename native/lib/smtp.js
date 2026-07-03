import nodemailer from 'nodemailer'

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const from = process.env.SMTP_FROM?.trim()
  const port = Number(process.env.SMTP_PORT ?? 587)

  if (!host || !user || !pass || !from) {
    return null
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === 'true'
      : port === 465,
    auth: { user, pass },
    from,
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

export function formatSmtpError(results) {
  return results
    .filter((entry) => !entry.status && entry.error)
    .map((entry) => `${entry.to}: ${entry.error}`)
    .join('; ')
}

export function isSmtpConfigured() {
  return getSmtpConfig() !== null
}

export async function sendEmails({
  addresses,
  subject,
  body,
}) {
  const config = getSmtpConfig()

  if (!config) {
    throw new Error('SMTP is not configured')
  }

  const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    tls: {
      rejectUnauthorized,
    },
  })

  const results = []

  for (const to of addresses) {
    try {
      await transporter.sendMail({
        from: config.from,
        to,
        subject,
        text: body,
      })
      // SMTP acceptance is not final delivery; recipient MTAs can still
      // reject later and send a bounce message to the sender mailbox.
      results.push({ to, status: true })
    } catch (error) {
      const message = getErrorMessage(error)
      console.error(`[smtp] failed to send to ${to}:`, message)
      results.push({ to, status: false, error: message })
    }
  }

  return results
}
