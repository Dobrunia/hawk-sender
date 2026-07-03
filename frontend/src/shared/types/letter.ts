export type LetterTemplateType = 'sentry_migration' | 'standard_offer'

export interface LetterContent {
  template: LetterTemplateType
  subject: string
  body: string
}
