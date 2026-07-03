import browser from 'webextension-polyfill'
import { refreshPageIntegrationsOnly } from '@/shared/detection/syncPageIntegrations'
import {
  handleNativeHostRequest,
  isNativeHostRequest,
} from '@/shared/native/nativeClient'
import { ensureDefaultSettings, isExtensionEnabled } from '@/shared/storage/settingsStorage'
import {
  setTabWorkflowOutcome,
  setTabWorkflowProgress,
} from '@/shared/storage/workflowOutcomeStorage'
import { runAutomaticWorkflow } from '@/shared/workflow/automaticWorkflow'
import {
  isRunAutomaticWorkflowRequest,
  type RunAutomaticWorkflowRequest,
} from '@/shared/workflow/automaticWorkflowMessage'
import { getWorkflowOutcome } from '@/shared/workflow/outcomes'

browser.runtime.onInstalled.addListener(async () => {
  await ensureDefaultSettings()
})

async function runAutomaticWorkflowForTab({
  tabId,
  tabUrl,
  enabled,
}: Omit<RunAutomaticWorkflowRequest, 'type'>) {
  if (!tabUrl.startsWith('http')) {
    await setTabWorkflowOutcome(tabId, tabUrl, null)
    return null
  }

  const workflowEnabled = enabled ?? await isExtensionEnabled()

  if (!workflowEnabled) {
    await setTabWorkflowProgress(tabId, tabUrl, {
      status: 'running',
      message: 'Обновляем данные страницы',
    })
    await refreshPageIntegrationsOnly({
      tabId,
      tabUrl,
    })
    await setTabWorkflowOutcome(tabId, tabUrl, null)
    return null
  }

  try {
    await setTabWorkflowProgress(tabId, tabUrl, {
      status: 'running',
      message: 'Запускаем automatic workflow',
    })

    const { outcome } = await runAutomaticWorkflow({
      tabId,
      tabUrl,
      enabled: workflowEnabled,
    }, {
      onStepStart: (progress) => setTabWorkflowProgress(tabId, tabUrl, {
        status: 'running',
        message: progress.message,
        stepId: progress.id,
        stepIndex: progress.index,
        stepTotal: progress.total,
      }),
    })

    await setTabWorkflowOutcome(tabId, tabUrl, outcome)
    return outcome
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const outcome = {
      ...getWorkflowOutcome('EMAIL_HELPER_ERROR'),
      message: `Ошибка helper: ${message}`,
    }

    await setTabWorkflowOutcome(tabId, tabUrl, outcome)
    return outcome
  }
}

browser.runtime.onMessage.addListener((message: unknown) => {
  if (isNativeHostRequest(message)) {
    const { type: _type, ...request } = message
    return handleNativeHostRequest(request)
  }

  if (isRunAutomaticWorkflowRequest(message)) {
    const { type: _type, ...context } = message

    return runAutomaticWorkflowForTab(context)
      .then((outcome) => ({ ok: true, outcome }))
      .catch((error) => ({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }))
  }

  return undefined
})

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url?.startsWith('http')) {
    return
  }

  await runAutomaticWorkflowForTab({
    tabId,
    tabUrl: tab.url,
  })
})

export { runAutomaticWorkflow }
