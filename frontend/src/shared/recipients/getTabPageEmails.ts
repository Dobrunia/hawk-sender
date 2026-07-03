import browser from 'webextension-polyfill'
import { probeEmailsInPage } from '@/shared/recipients/extractPageEmails'

export async function getTabPageEmails(tabId: number): Promise<string[]> {
  const [result] = await browser.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: probeEmailsInPage,
  })

  if (!result?.result || !Array.isArray(result.result)) {
    return []
  }

  return result.result as string[]
}
