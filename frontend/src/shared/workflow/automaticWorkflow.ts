import { runWorkflowSteps } from '@/shared/workflow/runner'
import { checkDomainSendHistory } from '@/shared/workflow/steps/checkDomainSendHistory'
import { checkExtensionEnabled } from '@/shared/workflow/steps/checkExtensionEnabled'
import { checkRuDomain } from '@/shared/workflow/steps/checkRuDomain'
import { sendDomainLetter } from '@/shared/workflow/steps/sendDomainLetter'
import { stopWorkflowIfHawkInstalled } from '@/shared/workflow/steps/stopWorkflowIfHawkInstalled'
import { syncPageIntegrationsStep } from '@/shared/workflow/steps/syncPageIntegrationsStep'
import type {
  WorkflowContext,
  WorkflowRunOptions,
  WorkflowRunResult,
  WorkflowStepDefinition,
} from '@/shared/workflow/types'

const AUTOMATIC_WORKFLOW_STEPS: readonly WorkflowStepDefinition[] = [
  {
    id: 'check_extension_enabled',
    message: 'Проверяем, включен ли automatic workflow',
    step: checkExtensionEnabled,
  },
  {
    id: 'check_ru_domain',
    message: 'Проверяем, что домен в зоне .ru',
    step: checkRuDomain,
  },
  {
    id: 'sync_page_integrations',
    message: 'Проверяем страницу и интеграции',
    step: syncPageIntegrationsStep,
  },
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

export async function runAutomaticWorkflow(
  context: WorkflowContext,
  options: WorkflowRunOptions = {},
): Promise<WorkflowRunResult> {
  return runWorkflowSteps(AUTOMATIC_WORKFLOW_STEPS, context, options)
}
