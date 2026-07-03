import { onMounted, ref } from 'vue'
import { getActiveTabIntegrations } from '@/shared/detection/getActiveTabIntegrations'

export function useIntegrationStatus() {
  const hawk = ref<boolean | null>(null)
  const sentry = ref<boolean | null>(null)
  const loading = ref(true)

  async function refresh() {
    loading.value = true
    hawk.value = null
    sentry.value = null

    const status = await getActiveTabIntegrations()

    hawk.value = status.available ? status.hawk : null
    sentry.value = status.available ? status.sentry : null
    loading.value = false
  }

  onMounted(refresh)

  return {
    hawk,
    sentry,
    loading,
    refresh,
  }
}
