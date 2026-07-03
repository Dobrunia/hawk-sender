import browser from 'webextension-polyfill'

export async function getActiveTabContext(): Promise<{
  tabId: number
  tabUrl: string
} | null> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })

  if (!tab?.id || !tab.url?.startsWith('http')) {
    return null
  }

  return {
    tabId: tab.id,
    tabUrl: tab.url,
  }
}
