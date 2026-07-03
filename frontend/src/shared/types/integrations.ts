export interface IntegrationStatus {
  hawk: boolean
  sentry: boolean
}

export interface TabIntegrationStatus extends IntegrationStatus {
  /** false for system pages where detection is not possible */
  available: boolean
}
