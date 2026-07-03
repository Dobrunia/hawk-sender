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

export function isSmtpConfigured() {
  return getSmtpConfig() !== null
}

export async function sendEmails({
  addresses,
  subject,
  body,
  stopOnFirstSuccess = true,
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
      results.push({ to, status: true })

      if (stopOnFirstSuccess) {
        break
      }
    } catch (error) {
      console.error(`[smtp] failed to send to ${to}:`, error.message)
      results.push({ to, status: false })
    }
  }

  return results
}
