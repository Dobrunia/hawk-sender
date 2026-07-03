import { onMounted, ref, watch, type Ref } from 'vue'
import browser from 'webextension-polyfill'
import { runAutomaticWorkflow } from '@/shared/workflow/automaticWorkflow'
import type { WorkflowOutcome } from '@/shared/workflow/outcomes'

export function useAutomaticWorkflowOutcome(enabled: Ref<boolean>) {
  const outcome = ref<WorkflowOutcome | null>(null)
  const loading = ref(true)

  async function refresh() {
    loading.value = true
    outcome.value = null

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })

    if (!tab?.id || !tab.url?.startsWith('http')) {
      loading.value = false
      return
    }

    const result = await runAutomaticWorkflow({
      tabId: tab.id,
      tabUrl: tab.url,
      enabled: enabled.value,
    })

    outcome.value = result.outcome
    loading.value = false
  }

  onMounted(refresh)
  watch(enabled, refresh)

  return {
    outcome,
    loading,
    refresh,
  }
}
