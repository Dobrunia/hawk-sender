export interface PageIntegrations {
  hawk: boolean
  sentry: boolean
}

export interface TabPageIntegrations extends PageIntegrations {
  /** false for system pages where detection is not possible */
  available: boolean
}
