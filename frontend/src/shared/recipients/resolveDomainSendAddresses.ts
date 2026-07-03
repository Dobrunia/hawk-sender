import {
  dedupeEmails,
  filterEmailsForDomain,
} from '@/shared/recipients/extractPageEmails'
import { getTabPageEmails } from '@/shared/recipients/getTabPageEmails'
import { buildStandardDomainAddresses } from '@/shared/recipients/standardLocalParts'

export interface ResolveDomainSendAddressesInput {
  tabId: number
  domain: string
}

export async function resolveDomainSendAddresses(
  input: ResolveDomainSendAddressesInput,
): Promise<string[]> {
  const pageEmails = await getTabPageEmails(input.tabId)
  const relevantPageEmails = filterEmailsForDomain(pageEmails, input.domain)
  const standardAddresses = buildStandardDomainAddresses(input.domain)

  return dedupeEmails([...relevantPageEmails, ...standardAddresses])
}
