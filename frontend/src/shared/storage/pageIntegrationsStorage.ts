import browser from 'webextension-polyfill'
import { PAGE_INTEGRATIONS_STORAGE_KEY } from '@/shared/storage/keys'
import type {
  PageIntegrationState,
  PageIntegrationsStore,
} from '@/shared/types/pageIntegrationState'

async function readStore(): Promise<PageIntegrationsStore> {
  const stored = await browser.storage.local.get(PAGE_INTEGRATIONS_STORAGE_KEY)
  return (stored[PAGE_INTEGRATIONS_STORAGE_KEY] as PageIntegrationsStore | undefined) ?? {}
}

export async function getPageIntegrationsByTabId(
  tabId: number,
): Promise<PageIntegrationState | null> {
  const store = await readStore()
  return store[String(tabId)] ?? null
}

export async function setPageIntegrations(
  state: PageIntegrationState,
): Promise<void> {
  const store = await readStore()
  store[String(state.tabId)] = state
  await browser.storage.local.set({ [PAGE_INTEGRATIONS_STORAGE_KEY]: store })
}
