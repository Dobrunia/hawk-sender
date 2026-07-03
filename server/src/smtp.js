import nodemailer from 'nodemailer'

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const from = process.env.SMTP_FROM?.trim()

  if (!host || !user || !pass || !from) {
    return null
  }

  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
    from,
  }
}

let transporter = null
let fromAddress = null

function getTransporter() {
  const config = getSmtpConfig()

  if (!config) {
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    })
    fromAddress = config.from
  }

  return transporter
}

export function isSmtpConfigured() {
  return getSmtpConfig() !== null
}

export async function sendEmails({ addresses, subject, body }) {
  const mailer = getTransporter()

  if (!mailer) {
    throw new Error('SMTP is not configured')
  }

  const results = []

  for (const to of addresses) {
    try {
      await mailer.sendMail({
        from: fromAddress,
        to,
        subject,
        text: body,
      })
      results.push({ to, status: true })
    } catch (error) {
      console.error(`[smtp] failed to send to ${to}:`, error.message)
      results.push({ to, status: false })
    }
  }

  return results
}
