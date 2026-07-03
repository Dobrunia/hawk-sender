import browser from 'webextension-polyfill'
import { probeIntegrationsInPage } from '@/shared/detection/checkIntegrations'
import type { IntegrationStatus, TabIntegrationStatus } from '@/shared/types/integrations'

const UNAVAILABLE: TabIntegrationStatus = {
  hawk: false,
  sentry: false,
  available: false,
}

export async function getActiveTabIntegrations(): Promise<TabIntegrationStatus> {
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

  const integrations = result.result as IntegrationStatus

  return {
    ...integrations,
    available: true,
  }
}
