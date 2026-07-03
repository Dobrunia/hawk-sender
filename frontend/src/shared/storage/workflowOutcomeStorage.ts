import browser from 'webextension-polyfill'
import type { WorkflowOutcome } from '@/shared/workflow/outcomes'
import { WORKFLOW_OUTCOMES_STORAGE_KEY } from '@/shared/storage/keys'

export interface TabWorkflowOutcomeRecord {
  tabUrl: string
  outcome: WorkflowOutcome | null
  updatedAt: string
}

type OutcomeStore = Record<string, TabWorkflowOutcomeRecord>

function readStore(raw: unknown): OutcomeStore {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  return raw as OutcomeStore
}

export async function setTabWorkflowOutcome(
  tabId: number,
  tabUrl: string,
  outcome: WorkflowOutcome | null,
): Promise<void> {
  const current = readStore(
    (await browser.storage.local.get(WORKFLOW_OUTCOMES_STORAGE_KEY))[
      WORKFLOW_OUTCOMES_STORAGE_KEY
    ],
  )

  current[String(tabId)] = {
    tabUrl,
    outcome,
    updatedAt: new Date().toISOString(),
  }

  await browser.storage.local.set({
    [WORKFLOW_OUTCOMES_STORAGE_KEY]: current,
  })
}

export async function getTabWorkflowOutcome(
  tabId: number,
): Promise<WorkflowOutcome | null> {
  const current = readStore(
    (await browser.storage.local.get(WORKFLOW_OUTCOMES_STORAGE_KEY))[
      WORKFLOW_OUTCOMES_STORAGE_KEY
    ],
  )

  return current[String(tabId)]?.outcome ?? null
}

export function onWorkflowOutcomeChanged(
  listener: (tabId: number, record: TabWorkflowOutcomeRecord | null) => void,
): () => void {
  function handleChange(
    changes: Record<string, browser.Storage.StorageChange>,
  ) {
    const change = changes[WORKFLOW_OUTCOMES_STORAGE_KEY]

    if (!change?.newValue) {
      return
    }

    const store = readStore(change.newValue)

    for (const [tabId, record] of Object.entries(store)) {
      listener(Number(tabId), record)
    }
  }

  browser.storage.onChanged.addListener(handleChange)

  return () => {
    browser.storage.onChanged.removeListener(handleChange)
  }
}
