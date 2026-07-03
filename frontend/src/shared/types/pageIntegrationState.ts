export interface PageIntegrationState {
  tabId: number
  tabUrl: string
  domain: string | null
  hawk: boolean | null
  sentry: boolean | null
  checkedAt: string
}

export type PageIntegrationsStore = Record<string, PageIntegrationState>
