<script setup lang="ts">
const { disabled = false, loading = false } = defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  send: []
}>()
</script>

<template>
  <button
    type="button"
    class="manual-send"
    :disabled="disabled || loading"
    @click="emit('send')"
  >
    {{ loading ? 'Отправка…' : 'Отправить вручную' }}
  </button>
</template>

<style scoped>
.manual-send {
  width: 100%;
  margin-top: 16px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.manual-send:hover:not(:disabled) {
  background: #1d4ed8;
}

.manual-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
