import browser from 'webextension-polyfill'
import {
  DEFAULT_SETTINGS,
  type ExtensionSettings,
} from '@/shared/types/settings'
import { SETTINGS_STORAGE_KEY } from './keys'

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await browser.storage.local.get(SETTINGS_STORAGE_KEY)
  const settings = stored[SETTINGS_STORAGE_KEY] as Partial<ExtensionSettings> | undefined

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  }
}

export async function setSettings(
  partial: Partial<ExtensionSettings>,
): Promise<ExtensionSettings> {
  const next = {
    ...(await getSettings()),
    ...partial,
  }

  await browser.storage.local.set({ [SETTINGS_STORAGE_KEY]: next })
  return next
}

export async function isExtensionEnabled(): Promise<boolean> {
  const settings = await getSettings()
  return settings.enabled
}

export async function isOnlyRuDomainsEnabled(): Promise<boolean> {
  const settings = await getSettings()
  return settings.onlyRuDomains
}

export async function isOnlySentrySitesEnabled(): Promise<boolean> {
  const settings = await getSettings()
  return settings.onlySentrySites
}

export async function ensureDefaultSettings(): Promise<void> {
  const stored = await browser.storage.local.get(SETTINGS_STORAGE_KEY)

  if (!stored[SETTINGS_STORAGE_KEY]) {
    await browser.storage.local.set({ [SETTINGS_STORAGE_KEY]: DEFAULT_SETTINGS })
  }
}
