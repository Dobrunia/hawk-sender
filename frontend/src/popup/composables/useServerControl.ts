import { onMounted, onUnmounted, ref } from 'vue'
import {
  checkServerHealth,
  isServerOnline,
  type ServerHealth,
} from '@/shared/server/checkServerHealth'
import {
  isNativeHostAvailable,
  startLocalServer,
  stopLocalServer,
} from '@/shared/server/serverControl'

const POLL_INTERVAL_MS = 3000

export function useServerControl() {
  const loading = ref(true)
  const actionLoading = ref(false)
  const online = ref<boolean | null>(null)
  const smtpConfigured = ref<boolean | null>(null)
  const nativeAvailable = ref(false)
  const message = ref('')

  let pollTimer: ReturnType<typeof setInterval> | null = null

  async function refreshStatus() {
    const [health, nativeReady] = await Promise.all([
      checkServerHealth(),
      isNativeHostAvailable(),
    ])

    nativeAvailable.value = nativeReady
    applyHealth(health)
    loading.value = false
  }

  function applyHealth(health: ServerHealth | null) {
    online.value = isServerOnline(health)
    smtpConfigured.value = health?.smtp ?? null
  }

  async function start() {
    if (!nativeAvailable.value) {
      message.value = 'Установите helper: npm run native:install'
      return
    }

    actionLoading.value = true
    message.value = ''

    const response = await startLocalServer()

    if (!response?.ok) {
      message.value = 'Не удалось запустить сервер'
      actionLoading.value = false
      return
    }

    if (response.alreadyRunning) {
      message.value = 'Сервер уже запущен'
    } else {
      message.value = 'Открыто окно Terminal — не закрывайте его во время работы'
    }

    await waitForServer(15000)
    actionLoading.value = false
  }

  async function stop() {
    if (!nativeAvailable.value) {
      message.value = 'Установите helper: npm run native:install'
      return
    }

    actionLoading.value = true
    message.value = ''

    const response = await stopLocalServer()

    if (!response?.ok) {
      message.value = 'Не удалось остановить сервер'
    } else {
      message.value = 'Сервер остановлен'
    }

    await refreshStatus()
    actionLoading.value = false
  }

  async function waitForServer(timeoutMs: number) {
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
      const health = await checkServerHealth()
      applyHealth(health)

      if (isServerOnline(health)) {
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    await refreshStatus()
  }

  onMounted(async () => {
    await refreshStatus()
    pollTimer = setInterval(refreshStatus, POLL_INTERVAL_MS)
  })

  onUnmounted(() => {
    if (pollTimer) {
      clearInterval(pollTimer)
    }
  })

  return {
    loading,
    actionLoading,
    online,
    smtpConfigured,
    nativeAvailable,
    message,
    start,
    stop,
    refreshStatus,
  }
}
