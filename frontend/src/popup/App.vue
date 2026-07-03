<script setup lang="ts">
import { computed } from 'vue'
import EnableToggle from './components/EnableToggle.vue'
import HawkIcon from './components/HawkIcon.vue'
import IntegrationIndicator from './components/IntegrationIndicator.vue'
import ManualSendButton from './components/ManualSendButton.vue'
import { useAutomaticWorkflowOutcome } from './composables/useAutomaticWorkflowOutcome'
import { useExtensionSettings } from './composables/useExtensionSettings'
import { usePageIntegrations } from './composables/usePageIntegrations'
import {
  getOutcomeColorValue,
  resolvePopupOutcome,
} from '@/shared/workflow/outcomes'

const { enabled, loading: settingsLoading, setEnabled } = useExtensionSettings()
const {
  outcome,
  progress,
  loading: workflowLoading,
  rerunForActiveTab,
} = useAutomaticWorkflowOutcome(enabled, settingsLoading)
const {
  hawk,
  sentry,
  loading: integrationsLoading,
} = usePageIntegrations()
const loading = computed(() => settingsLoading.value || workflowLoading.value)
const workflowDisplay = computed(() => resolvePopupOutcome(outcome.value, loading.value))
const workflowMessage = computed(() => {
  if (progress.value?.status === 'running') {
    return progress.value.message
  }

  return workflowDisplay.value.message
})
const workflowColor = computed(() =>
  progress.value?.status === 'running'
    ? '#2563eb'
    : workflowDisplay.value.color
    ? getOutcomeColorValue(workflowDisplay.value.color)
    : '#64748b',
)
const workflowStepLabel = computed(() => {
  if (
    progress.value?.status !== 'running'
    || progress.value.stepIndex === undefined
    || progress.value.stepTotal === undefined
  ) {
    return ''
  }

  return `Шаг ${progress.value.stepIndex + 1} из ${progress.value.stepTotal}`
})

async function handleSetEnabled(value: boolean) {
  await setEnabled(value)
  await rerunForActiveTab(value, 'automatic')
}

async function sendManually() {
  await rerunForActiveTab(true, 'manual')
}
</script>

<template>
  <main class="popup">
    <header class="popup__header">
      <h1 class="popup__title">
        Hawk Sender
        <HawkIcon class="popup__title-icon" />
      </h1>
      <p
        v-if="workflowMessage"
        class="popup__workflow"
        :style="{ color: workflowColor }"
      >
        {{ workflowMessage }}
        <span
          v-if="workflowStepLabel"
          class="popup__workflow-step"
        >
          {{ workflowStepLabel }}
        </span>
      </p>
    </header>

    <EnableToggle
      :model-value="enabled"
      :disabled="settingsLoading"
      @update:model-value="handleSetEnabled"
    />

    <ManualSendButton
      :loading="workflowLoading"
      :disabled="settingsLoading"
      @send="sendManually"
    />

    <section class="popup__integrations" aria-label="На текущей странице">
      <IntegrationIndicator
        label="Hawk"
        :present="integrationsLoading ? null : hawk"
      />
      <IntegrationIndicator
        label="Sentry"
        :present="integrationsLoading ? null : sentry"
      />
    </section>
  </main>
</template>

<style scoped>
.popup {
  width: 320px;
  padding: 16px;
  font-family: system-ui, sans-serif;
  color: #0f172a;
}

.popup__header {
  margin-bottom: 16px;
}

.popup__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.popup__title-icon {
  flex-shrink: 0;
  font-size: 1.125rem;
  color: #2563eb;
}

.popup__workflow {
  margin: 4px 0 0;
  font-size: 0.75rem;
  line-height: 1.125rem;
}

.popup__workflow-step {
  display: block;
  margin-top: 2px;
  color: #64748b;
}

.popup__integrations {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}
</style>
