import { getTabIntegrations } from '@/shared/detection/getActiveTabIntegrations'
import { extractDomainFromUrl } from '@/shared/domain/extractDomain'
import { setPageIntegrations } from '@/shared/storage/pageIntegrationsStorage'
import type { PageIntegrationState } from '@/shared/types/pageIntegrationState'

export interface PageIntegrationSyncContext {
  tabId: number
  tabUrl: string
}

export async function syncPageIntegrations(
  context: PageIntegrationSyncContext,
): Promise<PageIntegrationState> {
  const integrations = await getTabIntegrations(context.tabId)
  const domain = extractDomainFromUrl(context.tabUrl)

  const state: PageIntegrationState = {
    tabId: context.tabId,
    tabUrl: context.tabUrl,
    domain,
    hawk: integrations.available ? integrations.hawk : null,
    sentry: integrations.available ? integrations.sentry : null,
    checkedAt: new Date().toISOString(),
  }

  await setPageIntegrations(state)
  return state
}

export async function refreshPageIntegrationsOnly(
  context: PageIntegrationSyncContext,
): Promise<PageIntegrationState> {
  return syncPageIntegrations(context)
}
