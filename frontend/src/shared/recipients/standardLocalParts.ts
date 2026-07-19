/** Типовые local-part для outreach на домен */
export const STANDARD_EMAIL_LOCAL_PARTS = [
  'contact',
  'info',
  'hello',
  'support',
  'team',
  'mail',
  'office',
  'sales',
  'admin',
  // 'webmaster',
  // 'postmaster',
  'service',
  'help',
  'feedback',
  // 'clients',
  // 'client',
  // 'business',
  // 'commercial',
  // 'partner',
  // 'partners',
  // 'partnership',
  'partnerships',
  // 'marketing',
  // 'press',
  // 'pr',
  // 'media',
  // 'hr',
  'jobs',
  // 'careers',
] as const

export function buildStandardDomainAddresses(domain: string): string[] {
  return STANDARD_EMAIL_LOCAL_PARTS.map((localPart) => `${localPart}@${domain}`)
}
