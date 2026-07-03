import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import browser from 'webextension-polyfill'
import { refreshPageIntegrationsOnly } from '@/shared/detection/syncPageIntegrations'
import {
  getTabWorkflowOutcome,
  onWorkflowOutcomeChanged,
} from '@/shared/storage/workflowOutcomeStorage'
import type { WorkflowOutcome } from '@/shared/workflow/outcomes'

export function useAutomaticWorkflowOutcome(
  enabled: Ref<boolean>,
  settingsLoading: Ref<boolean>,
) {
  const outcome = ref<WorkflowOutcome | null>(null)
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
        return
      }

      activeTabId = tab.id

      if (!enabled.value) {
        await refreshPageIntegrationsOnly({
          tabId: tab.id,
          tabUrl: tab.url,
        })
        outcome.value = null
        return
      }

      outcome.value = await getTabWorkflowOutcome(tab.id)
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
      loading.value = false
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  watch([enabled, settingsLoading], refresh)

  return {
    outcome,
    loading,
    refresh,
  }
}
