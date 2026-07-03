import { onMounted, onUnmounted, ref } from 'vue'
import browser from 'webextension-polyfill'
import { refreshPageIntegrationsOnly } from '@/shared/detection/syncPageIntegrations'
import { PAGE_INTEGRATIONS_STORAGE_KEY } from '@/shared/storage/keys'
import { getPageIntegrationsByTabId } from '@/shared/storage/pageIntegrationsStorage'
import { getActiveTabContext } from '@/shared/tabs/getActiveTabContext'
import type { PageIntegrationState } from '@/shared/types/pageIntegrationState'

export { getActiveTabContext }

export function usePageIntegrations() {
  const hawk = ref<boolean | null>(null)
  const sentry = ref<boolean | null>(null)
  const loading = ref(true)
  const activeTabId = ref<number | null>(null)

  function applyState(state: PageIntegrationState | null) {
    hawk.value = state?.hawk ?? null
    sentry.value = state?.sentry ?? null
  }

  async function loadFromStorage(tabId: number) {
    activeTabId.value = tabId
    applyState(await getPageIntegrationsByTabId(tabId))
  }

  function onStorageChanged(
    changes: Record<string, browser.Storage.StorageChange>,
  ) {
    const change = changes[PAGE_INTEGRATIONS_STORAGE_KEY]
    if (!change?.newValue || activeTabId.value === null) return

    const store = change.newValue as Record<string, PageIntegrationState>
    applyState(store[String(activeTabId.value)] ?? null)
  }

  async function refresh() {
    loading.value = true

    const context = await getActiveTabContext()

    if (!context) {
      applyState(null)
      loading.value = false
      return
    }

    await loadFromStorage(context.tabId)
    loading.value = false
  }

  async function syncActiveTab() {
    loading.value = true

    const context = await getActiveTabContext()

    if (!context) {
      applyState(null)
      loading.value = false
      return
    }

    await refreshPageIntegrationsOnly(context)
    await loadFromStorage(context.tabId)
    loading.value = false
  }

  onMounted(async () => {
    await refresh()
    browser.storage.onChanged.addListener(onStorageChanged)
  })

  onUnmounted(() => {
    browser.storage.onChanged.removeListener(onStorageChanged)
  })

  return {
    hawk,
    sentry,
    loading,
    refresh,
    syncActiveTab,
  }
}
