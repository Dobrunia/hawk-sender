export interface ExtensionSettings {
  /** Автоматический сбор данных и отправка писем */
  enabled: boolean
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
}
