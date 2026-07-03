import browser from 'webextension-polyfill'
import { probeEmailsInPage } from '@/shared/recipients/extractPageEmails'

export async function getTabPageEmails(tabId: number): Promise<string[]> {
  let result: browser.Scripting.InjectionResult | undefined

  try {
    [result] = await browser.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: probeEmailsInPage,
    })
  } catch {
    return []
  }

  if (!result?.result || !Array.isArray(result.result)) {
    return []
  }

  return result.result as string[]
}
