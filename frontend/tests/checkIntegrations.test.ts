import { describe, expect, it } from 'vitest'
import {
  checkIntegrations,
  hasHawkRelease,
  hasSentry,
} from '@/shared/detection/checkIntegrations'

describe('checkIntegrations', () => {
  it('should return true when HAWK_RELEASE is defined', () => {
    // Arrange
    const windowObj = { HAWK_RELEASE: '1.0.0' }

    // Act
    const result = hasHawkRelease(windowObj)

    // Assert
    expect(result).toBe(true)
  })

  it('should return false when HAWK_RELEASE is missing', () => {
    // Arrange
    const windowObj = {}

    // Act
    const result = hasHawkRelease(windowObj)

    // Assert
    expect(result).toBe(false)
  })

  it('should return false when HAWK_RELEASE is null', () => {
    // Arrange
    const windowObj = { HAWK_RELEASE: null }

    // Act
    const result = hasHawkRelease(windowObj)

    // Assert
    expect(result).toBe(false)
  })

  it('should return true when Sentry SDK is present', () => {
    // Arrange
    const windowObj = { Sentry: { init: () => undefined } }

    // Act
    const result = hasSentry(windowObj)

    // Assert
    expect(result).toBe(true)
  })

  it('should return true when __SENTRY__ hub is present', () => {
    // Arrange
    const windowObj = { __SENTRY__: { hub: {} } }

    // Act
    const result = hasSentry(windowObj)

    // Assert
    expect(result).toBe(true)
  })

  it('should return false when Sentry is missing', () => {
    // Arrange
    const windowObj = {}

    // Act
    const result = hasSentry(windowObj)

    // Assert
    expect(result).toBe(false)
  })

  it('should return combined hawk and sentry detection', () => {
    // Arrange
    const windowObj = {
      HAWK_RELEASE: '2.0.0',
      Sentry: {},
    }

    // Act
    const result = checkIntegrations(windowObj)

    // Assert
    expect(result).toEqual({ hawk: true, sentry: true })
  })
})
