import { getPageIntegrationsByTabId } from '@/shared/storage/pageIntegrationsStorage'

export async function readHawkInstalled(tabId: number): Promise<boolean> {
  const integrations = await getPageIntegrationsByTabId(tabId)
  return integrations?.hawk === true
}

export async function readSentryInstalled(tabId: number): Promise<boolean> {
  const integrations = await getPageIntegrationsByTabId(tabId)
  return integrations?.sentry === true
}
