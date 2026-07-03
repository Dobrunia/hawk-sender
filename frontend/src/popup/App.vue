<script setup lang="ts">
import EnableToggle from './components/EnableToggle.vue'
import HawkIcon from './components/HawkIcon.vue'
import IntegrationIndicator from './components/IntegrationIndicator.vue'
import { useExtensionSettings } from './composables/useExtensionSettings'
import { usePageIntegrations } from './composables/usePageIntegrations'
import {
  getPopupWorkflowLabel,
  isPopupWorkflowInactive,
} from '@/shared/workflow/popupWorkflow'

const { enabled, loading, setEnabled } = useExtensionSettings()
const {
  hawk,
  sentry,
  loading: integrationsLoading,
} = usePageIntegrations()
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
        :class="{ 'popup__workflow--off': isPopupWorkflowInactive(enabled, loading) }"
      >
        {{ getPopupWorkflowLabel(enabled, loading) }}
      </p>
    </header>

    <EnableToggle
      :model-value="enabled"
      :disabled="loading"
      @update:model-value="setEnabled"
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
  color: #16a34a;
}

.popup__workflow--off {
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
