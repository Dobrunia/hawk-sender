import browser from 'webextension-polyfill'
import { probeIntegrationsInPage } from '@/shared/detection/checkIntegrations'
import type { PageIntegrations, TabPageIntegrations } from '@/shared/types/integrations'

const UNAVAILABLE: TabPageIntegrations = {
  hawk: false,
  sentry: false,
  available: false,
}

export async function getTabIntegrations(tabId: number): Promise<TabPageIntegrations> {
  let result: browser.Scripting.InjectionResult | undefined

  try {
    [result] = await browser.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: probeIntegrationsInPage,
    })
  } catch {
    return UNAVAILABLE
  }

  if (!result?.result) {
    return UNAVAILABLE
  }

  const integrations = result.result as PageIntegrations

  return {
    ...integrations,
    available: true,
  }
}

export async function getActiveTabIntegrations(): Promise<TabPageIntegrations> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })

  if (!tab?.id || !tab.url?.startsWith('http')) {
    return UNAVAILABLE
  }

  return getTabIntegrations(tab.id)
}
