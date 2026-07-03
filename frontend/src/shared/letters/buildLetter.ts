import type { LetterContent } from '@/shared/types/letter'

type LetterTemplate = {
  type: LetterContent['template']
  build: (domain: string) => Omit<LetterContent, 'template'>
}

const SENTRY_MIGRATION_TEMPLATE: LetterTemplate = {
  type: 'sentry_migration',
  build: (domain) => ({
    subject: `Миграция с Sentry на Hawk — ${domain}`,
    body: [
      'Здравствуйте!',
      '',
      `На сайте ${domain} обнаружен Sentry. Hawk поможет перенести мониторинг ошибок без потери привычного workflow.`,
      '',
      'Готовы обсудить миграцию и показать, как Hawk закроет ваши текущие сценарии.',
      '',
      'С уважением,',
      'Команда Hawk',
    ].join('\n'),
  }),
}

const STANDARD_OFFER_TEMPLATE: LetterTemplate = {
  type: 'standard_offer',
  build: (domain) => ({
    subject: `Hawk для ${domain} — мониторинг ошибок`,
    body: [
      'Здравствуйте!',
      '',
      `Мы заметили сайт ${domain} и хотим предложить Hawk — сервис мониторинга ошибок и стабильности фронтенда.`,
      '',
      'Можем показать, как быстро подключить Hawk и начать получать полезные алерты.',
      '',
      'С уважением,',
      'Команда Hawk',
    ].join('\n'),
  }),
}

export function buildLetterContent(
  domain: string,
  sentry: boolean,
): LetterContent {
  const template = sentry ? SENTRY_MIGRATION_TEMPLATE : STANDARD_OFFER_TEMPLATE
  const content = template.build(domain)

  return {
    template: template.type,
    ...content,
  }
}
