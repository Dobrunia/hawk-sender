import { runWorkflowSteps } from '@/shared/workflow/runner'
import { sendDomainLetter } from '@/shared/workflow/steps/sendDomainLetter'
import { syncPageIntegrationsStep } from '@/shared/workflow/steps/syncPageIntegrationsStep'
import type {
  WorkflowContext,
  WorkflowRunOptions,
  WorkflowRunResult,
  WorkflowStepDefinition,
} from '@/shared/workflow/types'

const MANUAL_WORKFLOW_STEPS: readonly WorkflowStepDefinition[] = [
  {
    id: 'sync_page_integrations',
    message: 'Собираем контакты со страницы',
    step: syncPageIntegrationsStep,
  },
  {
    id: 'send_domain_letter',
    message: 'Отправляем письма по списку адресов',
    step: sendDomainLetter,
  },
] as const

export async function runManualWorkflow(
  context: WorkflowContext,
  options: WorkflowRunOptions = {},
): Promise<WorkflowRunResult> {
  return runWorkflowSteps(MANUAL_WORKFLOW_STEPS, context, options)
}
