import browser from 'webextension-polyfill'
import { refreshPageIntegrationsOnly } from '@/shared/detection/syncPageIntegrations'
import { ensureDefaultSettings, isExtensionEnabled } from '@/shared/storage/settingsStorage'
import { runAutomaticWorkflow } from '@/shared/workflow/automaticWorkflow'

browser.runtime.onInstalled.addListener(async () => {
  await ensureDefaultSettings()
})

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url?.startsWith('http')) {
    return
  }

  const enabled = await isExtensionEnabled()

  if (!enabled) {
    await refreshPageIntegrationsOnly({
      tabId,
      tabUrl: tab.url,
    })
    return
  }

  const { outcome } = await runAutomaticWorkflow({
    tabId,
    tabUrl: tab.url,
    enabled,
  })

  if (outcome?.terminal) {
    return
  }

  // TODO: завершение pipeline для текущей вкладки
})

export { runAutomaticWorkflow }
