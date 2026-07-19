<script setup lang="ts">
const enabled = defineModel<boolean>({ required: true })

const { disabled = false, label = 'Автосбор и отправка' } = defineProps<{
  disabled?: boolean
  label?: string
}>()
</script>

<template>
  <label class="toggle" :class="{ 'toggle--disabled': disabled }">
    <span class="toggle__label">{{ label }}</span>
    <button
      type="button"
      role="switch"
      class="toggle__switch"
      :aria-checked="enabled"
      :aria-label="label"
      :disabled="disabled"
      @click="enabled = !enabled"
    >
      <span class="toggle__thumb" />
    </button>
  </label>
</template>

<style scoped>
.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toggle--disabled {
  opacity: 0.6;
}

.toggle__label {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.toggle__switch {
  position: relative;
  width: 44px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: #cbd5e1;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.toggle__switch[aria-checked='true'] {
  background: #2563eb;
}

.toggle__switch:disabled {
  cursor: not-allowed;
}

.toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.toggle__switch[aria-checked='true'] .toggle__thumb {
  transform: translateX(20px);
}
</style>
