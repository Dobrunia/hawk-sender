<script setup lang="ts">
import EnableToggle from './components/EnableToggle.vue'
import HawkIcon from './components/HawkIcon.vue'
import StatusIndicator from './components/StatusIndicator.vue'
import { useExtensionSettings } from './composables/useExtensionSettings'
import { useIntegrationStatus } from './composables/useIntegrationStatus'

const { enabled, loading, setEnabled } = useExtensionSettings()
const {
  hawk,
  sentry,
  loading: integrationsLoading,
} = useIntegrationStatus()
</script>

<template>
  <main class="popup">
    <header class="popup__header">
      <h1 class="popup__title">
        <HawkIcon class="popup__title-icon" />
        Hawk Sender
      </h1>
      <p class="popup__status" :class="{ 'popup__status--off': !enabled && !loading }">
        {{ loading ? 'Загрузка…' : enabled ? 'Активно' : 'Выключено' }}
      </p>
    </header>

    <EnableToggle
      :model-value="enabled"
      :disabled="loading"
      @update:model-value="setEnabled"
    />

    <section class="popup__integrations" aria-label="На текущей странице">
      <StatusIndicator
        label="Hawk"
        :present="integrationsLoading ? null : hawk"
      />
      <StatusIndicator
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

.popup__status {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #16a34a;
}

.popup__status--off {
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
