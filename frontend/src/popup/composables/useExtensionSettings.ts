import { onMounted, onUnmounted, ref } from 'vue'
import browser from 'webextension-polyfill'
import {
  DEFAULT_SETTINGS,
  type ExtensionSettings,
} from '@/shared/types/settings'
import { getSettings, setSettings } from '@/shared/storage/settingsStorage'
import { SETTINGS_STORAGE_KEY } from '@/shared/storage/keys'

export function useExtensionSettings() {
  const enabled = ref(false)
  const onlyRuDomains = ref(DEFAULT_SETTINGS.onlyRuDomains)
  const onlySentrySites = ref(DEFAULT_SETTINGS.onlySentrySites)
  const loading = ref(true)

  function applySettings(settings: Partial<ExtensionSettings>) {
    const normalized = {
      ...DEFAULT_SETTINGS,
      ...settings,
    }

    enabled.value = normalized.enabled
    onlyRuDomains.value = normalized.onlyRuDomains
    onlySentrySites.value = normalized.onlySentrySites
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

  async function setOnlyRuDomains(value: boolean) {
    onlyRuDomains.value = value
    await setSettings({ onlyRuDomains: value })
  }

  async function setOnlySentrySites(value: boolean) {
    onlySentrySites.value = value
    await setSettings({ onlySentrySites: value })
  }

  return {
    enabled,
    onlyRuDomains,
    onlySentrySites,
    loading,
    setEnabled,
    setOnlyRuDomains,
    setOnlySentrySites,
  }
}
