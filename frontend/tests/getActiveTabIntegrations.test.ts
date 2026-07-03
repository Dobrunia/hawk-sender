import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getActiveTabIntegrations } from '@/shared/detection/getActiveTabIntegrations'

const executeScript = vi.fn()
const query = vi.fn()

vi.mock('webextension-polyfill', () => ({
  default: {
    tabs: {
      query: (...args: unknown[]) => query(...args),
    },
    scripting: {
      executeScript: (...args: unknown[]) => executeScript(...args),
    },
  },
}))

describe('getActiveTabIntegrations', () => {
  beforeEach(() => {
    executeScript.mockReset()
    query.mockReset()
  })

  it('should return unavailable status for non-http tabs', async () => {
    // Arrange
    query.mockResolvedValue([{ id: 1, url: 'about:blank' }])

    // Act
    const result = await getActiveTabIntegrations()

    // Assert
    expect(result).toEqual({ hawk: false, sentry: false, available: false })
    expect(executeScript).not.toHaveBeenCalled()
  })

  it('should probe integrations on active http tab', async () => {
    // Arrange
    query.mockResolvedValue([{ id: 42, url: 'https://example.com' }])
    executeScript.mockResolvedValue([{ result: { hawk: true, sentry: false } }])

    // Act
    const result = await getActiveTabIntegrations()

    // Assert
    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 42 },
        world: 'MAIN',
      }),
    )
    expect(result).toEqual({ hawk: true, sentry: false, available: true })
  })
})
