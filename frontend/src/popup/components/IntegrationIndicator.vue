<script setup lang="ts">
import { computed } from 'vue'

const { label, loading = false, present } = defineProps<{
  label: string
  loading?: boolean
  /** true = есть, false = нет, null = неизвестно / загрузка */
  present: boolean | null
}>()

const statusText = computed(() => {
  if (loading) return 'Проверка'
  if (present === null) return 'Неизвестно'
  return present ? 'Есть' : 'Нет'
})

const ariaLabel = computed(() => {
  return `${label}: ${statusText.value.toLowerCase()}`
})
</script>

<template>
  <div class="integration-indicator" :aria-label="ariaLabel">
    <span
      class="integration-indicator__lamp"
      :class="{
        'integration-indicator__lamp--on': present === true,
        'integration-indicator__lamp--off': present === false,
        'integration-indicator__lamp--unknown': present === null,
      }"
      aria-hidden="true"
    />
    <span class="integration-indicator__label">{{ label }}</span>
    <span class="integration-indicator__status">{{ statusText }}</span>
  </div>
</template>

<style scoped>
.integration-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.integration-indicator__lamp {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
}

.integration-indicator__lamp--on {
  background: #16a34a;
  box-shadow: 0 0 4px rgb(22 163 74 / 0.6);
}

.integration-indicator__lamp--off {
  background: #dc2626;
  box-shadow: 0 0 4px rgb(220 38 38 / 0.5);
}

.integration-indicator__lamp--unknown {
  background: #94a3b8;
}

.integration-indicator__label {
  font-size: 0.8125rem;
  line-height: 1;
  white-space: nowrap;
}

.integration-indicator__status {
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1;
  white-space: nowrap;
}
</style>
