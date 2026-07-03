import browser from 'webextension-polyfill'
import {
  ensureDefaultSettings,
  isExtensionEnabled,
} from '@/shared/storage/settingsStorage'

browser.runtime.onInstalled.addListener(async () => {
  await ensureDefaultSettings()
})

browser.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url?.startsWith('http')) {
    return
  }

  if (!(await isExtensionEnabled())) {
    return
  }

  // TODO: pipeline проверок и отправки
})

export { isExtensionEnabled }
