import browser from 'webextension-polyfill'
import { refreshPageIntegrationsOnly } from '@/shared/detection/syncPageIntegrations'
import {
  handleNativeHostRequest,
  isNativeHostRequest,
} from '@/shared/native/nativeClient'
import { sendDomainLetterForTab } from '@/shared/send/sendDomainLetterForTab'
import { isManualSendRequest } from '@/shared/send/manualSendMessage'
import { ensureDefaultSettings, isExtensionEnabled } from '@/shared/storage/settingsStorage'
import { setTabWorkflowOutcome } from '@/shared/storage/workflowOutcomeStorage'
import { runAutomaticWorkflow } from '@/shared/workflow/automaticWorkflow'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'

browser.runtime.onInstalled.addListener(async () => {
  await ensureDefaultSettings()
})

browser.runtime.onMessage.addListener((message) => {
  if (isNativeHostRequest(message)) {
    const { type: _type, ...request } = message
    return handleNativeHostRequest(request)
  }

  if (isManualSendRequest(message)) {
    return sendDomainLetterForTab({
      tabId: message.tabId,
      tabUrl: message.tabUrl,
    }).then((result) => ({ ok: true, result }))
  }

  return undefined
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
    await setTabWorkflowOutcome(tabId, tab.url, null)
    return
  }

  try {
    const { outcome } = await runAutomaticWorkflow({
      tabId,
      tabUrl: tab.url,
      enabled,
    })

    await setTabWorkflowOutcome(tabId, tab.url, outcome)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await setTabWorkflowOutcome(tabId, tab.url, {
      ...getWorkflowOutcome('EMAIL_HELPER_ERROR'),
      message: `Ошибка helper: ${message}`,
    })
  }
})

export { runAutomaticWorkflow }
