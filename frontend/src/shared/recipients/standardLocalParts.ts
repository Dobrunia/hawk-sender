/** Типовые local-part для outreach на домен */
export const STANDARD_EMAIL_LOCAL_PARTS = [
  'contact',
  'hello',
  'info',
  'sales',
  'support',
  'team',
  'mail',
  'office',
  'business',
  'partnerships',
  'marketing',
  'press',
  'careers',
  'jobs',
  'hr',
] as const

export function buildStandardDomainAddresses(domain: string): string[] {
  return STANDARD_EMAIL_LOCAL_PARTS.map((localPart) => `${localPart}@${domain}`)
}
