import { describe, expect, it } from 'vitest'
import { buildLetterContent } from '@/shared/letters/buildLetter'

describe('buildLetterContent', () => {
  it('should build sentry migration template when sentry is detected', () => {
    // Arrange
    const domain = 'example.com'

    // Act
    const letter = buildLetterContent(domain, true)

    // Assert
    expect(letter.template).toBe('sentry_migration')
    expect(letter.subject).toContain('Sentry')
    expect(letter.body).toContain('example.com')
    expect(letter.body).toContain('dsn')
    expect(letter.body).toContain('заменить одну строку')
    expect(letter.body).toContain('серверами в РФ')
  })

  it('should build standard offer template when sentry is absent', () => {
    // Arrange
    const domain = 'example.com'

    // Act
    const letter = buildLetterContent(domain, false)

    // Assert
    expect(letter.template).toBe('standard_offer')
    expect(letter.subject).toContain('example.com')
    expect(letter.body).toContain('трекер ошибок')
    expect(letter.body).toContain('dsn')
    expect(letter.body).toContain('открытый исходный код')
  })
})
