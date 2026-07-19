export function formatSmtpFailureMessage(error: string): string {
  if (error.startsWith('SMTP лимит отправки:')) {
    return error
  }

  return `Ошибка SMTP: ${error}`
}

export function formatNoDeliveryMessage(error?: string): string {
  return error
    ? formatSmtpFailureMessage(error)
    : 'Ошибка отправки: SMTP не принял письмо ни на один адрес'
}

export function formatHelperFailureMessage(error?: string): string {
  return error
    ? `Ошибка helper: ${error}`
    : 'Ошибка helper'
}
