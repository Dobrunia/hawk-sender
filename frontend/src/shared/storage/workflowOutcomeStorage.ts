import browser from 'webextension-polyfill'
import type { WorkflowOutcome } from '@/shared/workflow/outcomes'
import { WORKFLOW_OUTCOMES_STORAGE_KEY } from '@/shared/storage/keys'
import type { WorkflowStepId } from '@/shared/workflow/types'

export interface TabWorkflowProgress {
  status: 'running' | 'done' | 'idle'
  message: string
  stepId?: WorkflowStepId
  stepIndex?: number
  stepTotal?: number
}

export interface TabWorkflowOutcomeRecord {
  tabUrl: string
  outcome: WorkflowOutcome | null
  progress: TabWorkflowProgress | null
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
  progress: TabWorkflowProgress | null = {
    status: 'done',
    message: outcome?.message ?? '',
  },
): Promise<void> {
  const current = readStore(
    (await browser.storage.local.get(WORKFLOW_OUTCOMES_STORAGE_KEY))[
      WORKFLOW_OUTCOMES_STORAGE_KEY
    ],
  )

  current[String(tabId)] = {
    tabUrl,
    outcome,
    progress,
    updatedAt: new Date().toISOString(),
  }

  await browser.storage.local.set({
    [WORKFLOW_OUTCOMES_STORAGE_KEY]: current,
  })
}

export async function setTabWorkflowProgress(
  tabId: number,
  tabUrl: string,
  progress: TabWorkflowProgress | null,
): Promise<void> {
  const current = readStore(
    (await browser.storage.local.get(WORKFLOW_OUTCOMES_STORAGE_KEY))[
      WORKFLOW_OUTCOMES_STORAGE_KEY
    ],
  )
  const existing = current[String(tabId)]

  current[String(tabId)] = {
    tabUrl,
    outcome: existing?.outcome ?? null,
    progress,
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

export async function getTabWorkflowRecord(
  tabId: number,
): Promise<TabWorkflowOutcomeRecord | null> {
  const current = readStore(
    (await browser.storage.local.get(WORKFLOW_OUTCOMES_STORAGE_KEY))[
      WORKFLOW_OUTCOMES_STORAGE_KEY
    ],
  )

  return current[String(tabId)] ?? null
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
