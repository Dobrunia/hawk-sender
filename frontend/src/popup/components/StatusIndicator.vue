<script setup lang="ts">
import { computed } from 'vue'

const { label, present } = defineProps<{
  label: string
  /** true = есть, false = нет, null = неизвестно / загрузка */
  present: boolean | null
}>()

const ariaLabel = computed(() => {
  if (present === null) return `${label}: загрузка`
  return `${label}: ${present ? 'есть' : 'нет'}`
})
</script>

<template>
  <div class="status-indicator" :aria-label="ariaLabel">
    <span
      class="status-indicator__lamp"
      :class="{
        'status-indicator__lamp--on': present === true,
        'status-indicator__lamp--off': present === false,
        'status-indicator__lamp--unknown': present === null,
      }"
      aria-hidden="true"
    />
    <span class="status-indicator__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-indicator__lamp {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
}

.status-indicator__lamp--on {
  background: #16a34a;
  box-shadow: 0 0 4px rgb(22 163 74 / 0.6);
}

.status-indicator__lamp--off {
  background: #dc2626;
  box-shadow: 0 0 4px rgb(220 38 38 / 0.5);
}

.status-indicator__lamp--unknown {
  background: #94a3b8;
}

.status-indicator__label {
  font-size: 0.8125rem;
  line-height: 1;
  white-space: nowrap;
}
</style>
