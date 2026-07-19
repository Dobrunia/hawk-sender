import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/shared/types/settings'
import { SETTINGS_STORAGE_KEY } from '@/shared/storage/keys'
import {
  ensureDefaultSettings,
  getSettings,
  isExtensionEnabled,
  isOnlyRuDomainsEnabled,
  isOnlySentrySitesEnabled,
  setSettings,
} from '@/shared/storage/settingsStorage'

const storage = new Map<string, unknown>()

vi.mock('webextension-polyfill', () => ({
  default: {
    storage: {
      local: {
        get: vi.fn(async (key: string) => {
          const value = storage.get(key)
          return value === undefined ? {} : { [key]: value }
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(items)) {
            storage.set(key, value)
          }
        }),
      },
    },
  },
}))

describe('settingsStorage', () => {
  beforeEach(() => {
    storage.clear()
  })

  it('should return default settings when storage is empty', async () => {
    // Arrange
    // storage is empty after beforeEach

    // Act
    const settings = await getSettings()

    // Assert
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })

  it('should merge legacy settings with new defaults', async () => {
    // Arrange
    storage.set(SETTINGS_STORAGE_KEY, { enabled: false })

    // Act
    const settings = await getSettings()

    // Assert
    expect(settings).toEqual({
      enabled: false,
      onlyRuDomains: true,
      onlySentrySites: false,
    })
  })

  it('should persist enabled flag and reflect it in isExtensionEnabled', async () => {
    // Arrange
    // storage is empty after beforeEach

    // Act
    await setSettings({ enabled: false })
    const settings = await getSettings()
    const enabled = await isExtensionEnabled()

    // Assert
    expect(settings).toEqual({
      enabled: false,
      onlyRuDomains: true,
      onlySentrySites: false,
    })
    expect(enabled).toBe(false)
  })

  it('should persist RU filter flag and reflect it in isOnlyRuDomainsEnabled', async () => {
    // Arrange
    // storage is empty after beforeEach

    // Act
    await setSettings({ onlyRuDomains: false })
    const settings = await getSettings()
    const onlyRuDomains = await isOnlyRuDomainsEnabled()

    // Assert
    expect(settings).toEqual({
      enabled: true,
      onlyRuDomains: false,
      onlySentrySites: false,
    })
    expect(onlyRuDomains).toBe(false)
  })

  it('should persist Sentry filter flag', async () => {
    // Act
    await setSettings({ onlySentrySites: true })
    const settings = await getSettings()
    const onlySentrySites = await isOnlySentrySitesEnabled()

    // Assert
    expect(settings).toEqual({
      enabled: true,
      onlyRuDomains: true,
      onlySentrySites: true,
    })
    expect(onlySentrySites).toBe(true)
  })

  it('should write default settings on first install', async () => {
    // Arrange
    // storage is empty after beforeEach

    // Act
    await ensureDefaultSettings()

    // Assert
    expect(storage.get(SETTINGS_STORAGE_KEY)).toEqual(DEFAULT_SETTINGS)
  })
})
