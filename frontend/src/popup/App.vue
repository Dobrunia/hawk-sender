<script setup lang="ts">
import { computed } from 'vue'
import browser from 'webextension-polyfill'
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

const {
  enabled,
  onlyRuDomains,
  onlySentrySites,
  loading: settingsLoading,
  setEnabled,
  setOnlyRuDomains,
  setOnlySentrySites,
} = useExtensionSettings()
const {
  outcome,
  progress,
  loading: workflowLoading,
  rerunForActiveTab,
} = useAutomaticWorkflowOutcome(
  enabled,
  onlyRuDomains,
  onlySentrySites,
  settingsLoading,
)
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
  await rerunForActiveTab(
    value,
    'automatic',
    onlyRuDomains.value,
    onlySentrySites.value,
  )
}

async function handleSetOnlyRuDomains(value: boolean) {
  await setOnlyRuDomains(value)
  await rerunForActiveTab(
    enabled.value,
    'automatic',
    value,
    onlySentrySites.value,
  )
}

async function handleSetOnlySentrySites(value: boolean) {
  await setOnlySentrySites(value)
  await rerunForActiveTab(
    enabled.value,
    'automatic',
    onlyRuDomains.value,
    value,
  )
}

async function sendManually() {
  await rerunForActiveTab(true, 'manual')
}

async function openDatabase() {
  await browser.tabs.create({
    url: browser.runtime.getURL('db/index.html'),
  })
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
        class="popup__workflow"
        :style="{ color: workflowColor }"
        :title="[workflowMessage, workflowStepLabel].filter(Boolean).join(' · ')"
        aria-live="polite"
        aria-atomic="true"
      >
        <span class="popup__workflow-message">{{ workflowMessage }}</span>
        <span
          v-if="workflowStepLabel"
          class="popup__workflow-step"
        >
          · {{ workflowStepLabel }}
        </span>
      </p>
    </header>

    <section class="popup__settings" aria-label="Настройки отправки">
      <EnableToggle
        :model-value="enabled"
        :disabled="settingsLoading"
        @update:model-value="handleSetEnabled"
      />

      <EnableToggle
        :model-value="onlyRuDomains"
        label="Только .ru-домены"
        :disabled="settingsLoading"
        @update:model-value="handleSetOnlyRuDomains"
      />

      <EnableToggle
        :model-value="onlySentrySites"
        label="Только сайты с Sentry"
        :disabled="settingsLoading"
        @update:model-value="handleSetOnlySentrySites"
      />
    </section>

    <ManualSendButton
      :loading="workflowLoading"
      :disabled="settingsLoading"
      @send="sendManually"
    />

    <button
      type="button"
      class="popup__database"
      @click="openDatabase"
    >
      Открыть базу
    </button>

    <section class="popup__integrations" aria-label="На текущей странице">
      <IntegrationIndicator
        label="Hawk"
        :loading="integrationsLoading"
        :present="hawk"
      />
      <IntegrationIndicator
        label="Sentry"
        :loading="integrationsLoading"
        :present="sentry"
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

.popup__settings {
  display: grid;
  gap: 10px;
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
  display: flex;
  align-items: baseline;
  gap: 4px;
  height: 1.125rem;
  overflow: hidden;
  margin: 4px 0 0;
  font-size: 0.75rem;
  line-height: 1.125rem;
  white-space: nowrap;
}

.popup__workflow-message {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popup__workflow-step {
  flex-shrink: 0;
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

.popup__database {
  width: 100%;
  margin-top: 8px;
  padding: 9px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.popup__database:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}
</style>
