import browser from 'webextension-polyfill'
import { probeIntegrationsInPage } from '@/shared/detection/checkIntegrations'
import type { PageIntegrations, TabPageIntegrations } from '@/shared/types/integrations'

const UNAVAILABLE: TabPageIntegrations = {
  hawk: false,
  sentry: false,
  available: false,
}

export async function getActiveTabIntegrations(): Promise<TabPageIntegrations> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })

  if (!tab?.id || !tab.url?.startsWith('http')) {
    return UNAVAILABLE
  }

  const [result] = await browser.scripting.executeScript({
    target: { tabId: tab.id },
    world: 'MAIN',
    func: probeIntegrationsInPage,
  })

  if (!result?.result) {
    return UNAVAILABLE
  }

  const integrations = result.result as PageIntegrations

  return {
    ...integrations,
    available: true,
  }
}
