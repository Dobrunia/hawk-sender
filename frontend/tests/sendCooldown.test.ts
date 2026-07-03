import { describe, expect, it } from 'vitest'
import { isWithinSixMonths } from '@/shared/domain/sendCooldown'

describe('isWithinSixMonths', () => {
  it('should return true when date is less than six months ago', () => {
    // Arrange
    const now = new Date('2026-07-03T12:00:00.000Z').getTime()
    const recentDate = '2026-04-01T12:00:00.000Z'

    // Act
    const result = isWithinSixMonths(recentDate, now)

    // Assert
    expect(result).toBe(true)
  })

  it('should return false when date is older than six months', () => {
    // Arrange
    const now = new Date('2026-07-03T12:00:00.000Z').getTime()
    const oldDate = '2025-01-01T12:00:00.000Z'

    // Act
    const result = isWithinSixMonths(oldDate, now)

    // Assert
    expect(result).toBe(false)
  })
})
