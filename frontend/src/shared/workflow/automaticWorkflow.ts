import { runWorkflowSteps } from '@/shared/workflow/runner'
import {
  isOnlyRuDomainsEnabled,
  isOnlySentrySitesEnabled,
} from '@/shared/storage/settingsStorage'
import { checkDomainSendHistory } from '@/shared/workflow/steps/checkDomainSendHistory'
import { checkExtensionEnabled } from '@/shared/workflow/steps/checkExtensionEnabled'
import { checkRuDomain } from '@/shared/workflow/steps/checkRuDomain'
import { sendDomainLetter } from '@/shared/workflow/steps/sendDomainLetter'
import { stopWorkflowIfHawkInstalled } from '@/shared/workflow/steps/stopWorkflowIfHawkInstalled'
import { stopWorkflowIfSentryMissing } from '@/shared/workflow/steps/stopWorkflowIfSentryMissing'
import { syncPageIntegrationsStep } from '@/shared/workflow/steps/syncPageIntegrationsStep'
import type {
  WorkflowContext,
  WorkflowRunOptions,
  WorkflowRunResult,
  WorkflowStepDefinition,
} from '@/shared/workflow/types'

const CHECK_EXTENSION_ENABLED_STEP: WorkflowStepDefinition = {
  id: 'check_extension_enabled',
  message: 'Проверяем, включен ли automatic workflow',
  step: checkExtensionEnabled,
}

const CHECK_RU_DOMAIN_STEP: WorkflowStepDefinition = {
  id: 'check_ru_domain',
  message: 'Проверяем, что домен в зоне .ru',
  step: checkRuDomain,
}

const SYNC_PAGE_INTEGRATIONS_STEP: WorkflowStepDefinition = {
  id: 'sync_page_integrations',
  message: 'Проверяем страницу и интеграции',
  step: syncPageIntegrationsStep,
}

const CHECK_SENTRY_INSTALLED_STEP: WorkflowStepDefinition = {
  id: 'stop_if_sentry_missing',
  message: 'Проверяем, подключен ли Sentry',
  step: stopWorkflowIfSentryMissing,
}

const AUTOMATIC_WORKFLOW_FINAL_STEPS: readonly WorkflowStepDefinition[] = [
  {
    id: 'stop_if_hawk_installed',
    message: 'Проверяем, не подключен ли уже Hawk',
    step: stopWorkflowIfHawkInstalled,
  },
  {
    id: 'check_domain_send_history',
    message: 'Проверяем историю отправок по домену',
    step: checkDomainSendHistory,
  },
  {
    id: 'send_domain_letter',
    message: 'Отправляем письма по списку адресов',
    step: sendDomainLetter,
  },
] as const

async function getAutomaticWorkflowSteps(
  context: WorkflowContext,
): Promise<readonly WorkflowStepDefinition[]> {
  const onlyRuDomains = context.onlyRuDomains ?? (await isOnlyRuDomainsEnabled())
  const onlySentrySites = context.onlySentrySites
    ?? (await isOnlySentrySitesEnabled())
  const steps: WorkflowStepDefinition[] = [CHECK_EXTENSION_ENABLED_STEP]

  if (onlyRuDomains) {
    steps.push(CHECK_RU_DOMAIN_STEP)
  }

  steps.push(SYNC_PAGE_INTEGRATIONS_STEP)

  if (onlySentrySites) {
    steps.push(CHECK_SENTRY_INSTALLED_STEP)
  }

  steps.push(...AUTOMATIC_WORKFLOW_FINAL_STEPS)
  return steps
}

export async function runAutomaticWorkflow(
  context: WorkflowContext,
  options: WorkflowRunOptions = {},
): Promise<WorkflowRunResult> {
  const steps = await getAutomaticWorkflowSteps(context)

  return runWorkflowSteps(steps, context, options)
}
