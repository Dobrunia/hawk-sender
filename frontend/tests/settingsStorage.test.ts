import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/shared/types/settings'
import { SETTINGS_STORAGE_KEY } from '@/shared/storage/keys'
import {
  ensureDefaultSettings,
  getSettings,
  isExtensionEnabled,
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

  it('should persist enabled flag and reflect it in isExtensionEnabled', async () => {
    // Arrange
    // storage is empty after beforeEach

    // Act
    await setSettings({ enabled: false })
    const settings = await getSettings()
    const enabled = await isExtensionEnabled()

    // Assert
    expect(settings).toEqual({ enabled: false })
    expect(enabled).toBe(false)
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
