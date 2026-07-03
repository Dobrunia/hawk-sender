<script setup lang="ts">
import IntegrationIndicator from './IntegrationIndicator.vue'

const {
  loading,
  actionLoading,
  online,
  nativeAvailable,
  message,
} = defineProps<{
  loading: boolean
  actionLoading: boolean
  online: boolean | null
  nativeAvailable: boolean
  message: string
}>()

const emit = defineEmits<{
  start: []
  stop: []
}>()

const helpText = 'Сервер запускается только через Terminal. Закройте окно — процесс завершится.'
</script>

<template>
  <section class="server-control" aria-label="Локальный сервер">
    <div class="server-control__row">
      <IntegrationIndicator
        label="Server"
        :present="loading ? null : online"
        title="Статус HTTP-сервера на localhost"
      />
      <button
        v-if="!loading && online !== true"
        type="button"
        class="server-control__button server-control__button--start"
        :disabled="actionLoading || !nativeAvailable"
        :title="nativeAvailable ? 'Открыть Terminal и запустить сервер' : helpText"
        @click="emit('start')"
      >
        {{ actionLoading ? '…' : 'Запустить' }}
      </button>
      <button
        v-else-if="!loading"
        type="button"
        class="server-control__button server-control__button--stop"
        :disabled="actionLoading || !nativeAvailable"
        title="Остановить сервер"
        @click="emit('stop')"
      >
        {{ actionLoading ? '…' : 'Остановить' }}
      </button>
    </div>

    <p class="server-control__help" :title="helpText">
      {{ nativeAvailable ? helpText : 'Helper не установлен. Один раз: npm run native:install' }}
    </p>

    <p v-if="message" class="server-control__message">
      {{ message }}
    </p>
  </section>
</template>

<style scoped>
.server-control {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.server-control__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.server-control__button {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
}

.server-control__button--start {
  background: #2563eb;
  color: #fff;
}

.server-control__button--stop {
  background: #fee2e2;
  color: #b91c1c;
}

.server-control__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.server-control__help {
  margin: 8px 0 0;
  font-size: 0.6875rem;
  line-height: 1.125rem;
  color: #64748b;
}

.server-control__message {
  margin: 6px 0 0;
  font-size: 0.75rem;
  color: #334155;
}
</style>
