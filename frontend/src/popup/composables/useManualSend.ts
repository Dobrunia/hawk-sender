import { ref } from 'vue'
import { refreshPageIntegrationsOnly } from '@/shared/detection/syncPageIntegrations'
import {
  formatManualSendResult,
  sendDomainLetterForTab,
  type SendDomainLetterResult,
} from '@/shared/send/sendDomainLetterForTab'
import { getActiveTabContext } from '@/shared/tabs/getActiveTabContext'

export function useManualSend() {
  const loading = ref(false)
  const result = ref<SendDomainLetterResult | null>(null)
  const display = ref<{ message: string; color: 1 | 2 } | null>(null)

  async function send() {
    loading.value = true
    result.value = null
    display.value = null

    const context = await getActiveTabContext()

    if (!context) {
      result.value = {
        status: 'failed',
        domain: null,
        reason: 'no_domain',
      }
      display.value = formatManualSendResult(result.value)
      loading.value = false
      return
    }

    await refreshPageIntegrationsOnly(context)

    result.value = await sendDomainLetterForTab(context)
    display.value = formatManualSendResult(result.value)
    loading.value = false
  }

  return {
    loading,
    result,
    display,
    send,
  }
}
