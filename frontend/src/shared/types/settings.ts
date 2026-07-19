export interface ExtensionSettings {
  /** Автоматический сбор данных и отправка писем */
  enabled: boolean
  /** Ограничивать automatic workflow доменами в зоне .ru */
  onlyRuDomains: boolean
  /** Ограничивать automatic workflow сайтами с подключенным Sentry */
  onlySentrySites: boolean
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  onlyRuDomains: true,
  onlySentrySites: false,
}
