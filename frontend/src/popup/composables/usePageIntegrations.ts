import { onMounted, ref } from 'vue'
import { getActiveTabIntegrations } from '@/shared/detection/getActiveTabIntegrations'

export function usePageIntegrations() {
  const hawk = ref<boolean | null>(null)
  const sentry = ref<boolean | null>(null)
  const loading = ref(true)

  async function refresh() {
    loading.value = true
    hawk.value = null
    sentry.value = null

    const integrations = await getActiveTabIntegrations()

    hawk.value = integrations.available ? integrations.hawk : null
    sentry.value = integrations.available ? integrations.sentry : null
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
