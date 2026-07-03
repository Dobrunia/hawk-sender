<script setup lang="ts">
import { computed } from 'vue'
import EnableToggle from './components/EnableToggle.vue'
import HawkIcon from './components/HawkIcon.vue'
import IntegrationIndicator from './components/IntegrationIndicator.vue'
import ManualSendButton from './components/ManualSendButton.vue'
import { useAutomaticWorkflowOutcome } from './composables/useAutomaticWorkflowOutcome'
import { useExtensionSettings } from './composables/useExtensionSettings'
import { useManualSend } from './composables/useManualSend'
import { usePageIntegrations } from './composables/usePageIntegrations'
import {
  getOutcomeColorValue,
  resolvePopupOutcome,
} from '@/shared/workflow/outcomes'

const { enabled, loading: settingsLoading, setEnabled } = useExtensionSettings()
const { outcome, loading: workflowLoading, refresh: refreshWorkflow } = useAutomaticWorkflowOutcome(
  enabled,
  settingsLoading,
)
const {
  hawk,
  sentry,
  loading: integrationsLoading,
} = usePageIntegrations()
const {
  loading: manualSendLoading,
  display: manualSendDisplay,
  send: sendManually,
} = useManualSend()

const loading = computed(() => settingsLoading.value || workflowLoading.value)
const workflowDisplay = computed(() => resolvePopupOutcome(outcome.value, loading.value))
const workflowColor = computed(() =>
  workflowDisplay.value.color
    ? getOutcomeColorValue(workflowDisplay.value.color)
    : '#64748b',
)
const manualSendColor = computed(() =>
  manualSendDisplay.value
    ? getOutcomeColorValue(manualSendDisplay.value.color)
    : '#64748b',
)

async function handleSetEnabled(value: boolean) {
  await setEnabled(value)
  await refreshWorkflow()
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
        v-if="enabled && workflowDisplay.message"
        class="popup__workflow"
        :style="{ color: workflowColor }"
      >
        {{ workflowDisplay.message }}
      </p>
    </header>

    <EnableToggle
      :model-value="enabled"
      :disabled="settingsLoading"
      @update:model-value="handleSetEnabled"
    />

    <ManualSendButton
      :loading="manualSendLoading"
      :disabled="settingsLoading"
      @send="sendManually"
    />

    <p
      v-if="manualSendDisplay?.message"
      class="popup__manual-send"
      :style="{ color: manualSendColor }"
    >
      {{ manualSendDisplay.message }}
    </p>

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
}

.popup__manual-send {
  margin: 8px 0 0;
  font-size: 0.75rem;
  line-height: 1.125rem;
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
