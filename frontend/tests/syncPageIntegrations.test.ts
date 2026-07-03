import { beforeEach, describe, expect, it, vi } from 'vitest'
import { syncPageIntegrations } from '@/shared/detection/syncPageIntegrations'

vi.mock('@/shared/detection/getActiveTabIntegrations', () => ({
  getTabIntegrations: vi.fn(),
}))

vi.mock('@/shared/storage/pageIntegrationsStorage', () => ({
  setPageIntegrations: vi.fn(),
}))

import { getTabIntegrations } from '@/shared/detection/getActiveTabIntegrations'
import { setPageIntegrations } from '@/shared/storage/pageIntegrationsStorage'

describe('syncPageIntegrations', () => {
  beforeEach(() => {
    vi.mocked(getTabIntegrations).mockReset()
    vi.mocked(setPageIntegrations).mockReset()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-03T12:00:00.000Z'))
  })

  it('should probe page and persist hawk and sentry state to storage', async () => {
    // Arrange
    vi.mocked(getTabIntegrations).mockResolvedValue({
      hawk: true,
      sentry: false,
      available: true,
    })

    // Act
    const state = await syncPageIntegrations({
      tabId: 42,
      tabUrl: 'https://app.example.com/page',
    })

    // Assert
    expect(getTabIntegrations).toHaveBeenCalledWith(42)
    expect(setPageIntegrations).toHaveBeenCalledWith({
      tabId: 42,
      tabUrl: 'https://app.example.com/page',
      domain: 'example.com',
      hawk: true,
      sentry: false,
      checkedAt: '2026-07-03T12:00:00.000Z',
    })
    expect(state.hawk).toBe(true)
    expect(state.sentry).toBe(false)
  })

  it('should persist null hawk and sentry when detection is unavailable', async () => {
    // Arrange
    vi.mocked(getTabIntegrations).mockResolvedValue({
      hawk: false,
      sentry: false,
      available: false,
    })

    // Act
    const state = await syncPageIntegrations({
      tabId: 1,
      tabUrl: 'https://example.com',
    })

    // Assert
    expect(state.hawk).toBeNull()
    expect(state.sentry).toBeNull()
  })
})
