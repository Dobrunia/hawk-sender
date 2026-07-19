import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import browser from 'webextension-polyfill'
import { refreshPageIntegrationsOnly } from '@/shared/detection/syncPageIntegrations'
import {
  getTabWorkflowRecord,
  onWorkflowOutcomeChanged,
  type TabWorkflowProgress,
} from '@/shared/storage/workflowOutcomeStorage'
import {
  requestWorkflowRun,
  type WorkflowRunMode,
} from '@/shared/workflow/workflowRunMessage'
import type { WorkflowOutcome } from '@/shared/workflow/outcomes'

export function useAutomaticWorkflowOutcome(
  enabled: Ref<boolean>,
  onlyRuDomains: Ref<boolean>,
  onlySentrySites: Ref<boolean>,
  settingsLoading: Ref<boolean>,
) {
  const outcome = ref<WorkflowOutcome | null>(null)
  const progress = ref<TabWorkflowProgress | null>(null)
  const loading = ref(true)
  let activeTabId: number | null = null
  let unsubscribe: (() => void) | null = null

  async function refresh() {
    loading.value = true

    try {
      if (settingsLoading.value) {
        return
      }

      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })

      if (!tab?.id || !tab.url?.startsWith('http')) {
        activeTabId = null
        outcome.value = null
        progress.value = null
        return
      }

      activeTabId = tab.id

      if (!enabled.value) {
        await refreshPageIntegrationsOnly({
          tabId: tab.id,
          tabUrl: tab.url,
        })
        outcome.value = null
        progress.value = null
        return
      }

      const record = await getTabWorkflowRecord(tab.id)
      outcome.value = record?.outcome ?? null
      progress.value = record?.progress ?? null
    } finally {
      loading.value = false
    }
  }

  async function rerunForActiveTab(
    nextEnabled = enabled.value,
    mode: WorkflowRunMode = 'automatic',
    nextOnlyRuDomains = onlyRuDomains.value,
    nextOnlySentrySites = onlySentrySites.value,
  ) {
    loading.value = true

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })

      if (!tab?.id || !tab.url?.startsWith('http')) {
        activeTabId = null
        outcome.value = null
        progress.value = null
        return
      }

      activeTabId = tab.id
      progress.value = {
        status: 'running',
        message: 'Запускаем workflow',
      }
      outcome.value = await requestWorkflowRun({
        mode,
        tabId: tab.id,
        tabUrl: tab.url,
        enabled: nextEnabled,
        onlyRuDomains: nextOnlyRuDomains,
        onlySentrySites: nextOnlySentrySites,
      })
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void refresh()

    unsubscribe = onWorkflowOutcomeChanged((tabId, record) => {
      if (tabId !== activeTabId) {
        return
      }

      outcome.value = record?.outcome ?? null
      progress.value = record?.progress ?? null
      loading.value = false
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  watch([enabled, onlyRuDomains, onlySentrySites, settingsLoading], refresh)

  return {
    outcome,
    progress,
    loading,
    refresh,
    rerunForActiveTab,
  }
}
