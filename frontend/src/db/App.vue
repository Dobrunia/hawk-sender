<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { dumpDomainRecords } from '@/shared/api/domainApi'
import type { DomainCheckRecord } from '@/shared/api/types'

const records = ref<DomainCheckRecord[]>([])
const loading = ref(true)
const error = ref('')

const json = computed(() => JSON.stringify(records.value, null, 2))

async function load() {
  loading.value = true
  error.value = ''

  try {
    records.value = await dumpDomainRecords()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught)
  } finally {
    loading.value = false
  }
}

async function copyJson() {
  await navigator.clipboard.writeText(json.value)
}

onMounted(load)
</script>

<template>
  <main class="db-page">
    <header class="db-page__header">
      <div>
        <h1>Hawk Sender DB</h1>
        <p>{{ records.length }} записей</p>
      </div>
      <div class="db-page__actions">
        <button type="button" :disabled="loading" @click="load">Обновить</button>
        <button type="button" :disabled="loading || Boolean(error)" @click="copyJson">
          Копировать JSON
        </button>
      </div>
    </header>

    <p v-if="loading" class="db-page__status">Загрузка базы...</p>
    <p v-else-if="error" class="db-page__error">{{ error }}</p>
    <pre v-else class="db-page__json">{{ json }}</pre>
  </main>
</template>
