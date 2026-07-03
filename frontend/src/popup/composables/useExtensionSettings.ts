import { onMounted, onUnmounted, ref } from 'vue'
import browser from 'webextension-polyfill'
import { getSettings, setSettings } from '@/shared/storage/settingsStorage'
import { SETTINGS_STORAGE_KEY } from '@/shared/storage/keys'
import type { ExtensionSettings } from '@/shared/types/settings'

export function useExtensionSettings() {
  const enabled = ref(true)
  const loading = ref(true)

  function applySettings(settings: ExtensionSettings) {
    enabled.value = settings.enabled
  }

  function onStorageChanged(
    changes: Record<string, browser.Storage.StorageChange>,
  ) {
    const change = changes[SETTINGS_STORAGE_KEY]
    if (!change?.newValue) return

    applySettings(change.newValue as ExtensionSettings)
  }

  onMounted(async () => {
    applySettings(await getSettings())
    loading.value = false
    browser.storage.onChanged.addListener(onStorageChanged)
  })

  onUnmounted(() => {
    browser.storage.onChanged.removeListener(onStorageChanged)
  })

  async function setEnabled(value: boolean) {
    enabled.value = value
    await setSettings({ enabled: value })
  }

  return {
    enabled,
    loading,
    setEnabled,
  }
}
