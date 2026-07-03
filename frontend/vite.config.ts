import { existsSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import webExtension from 'vite-plugin-web-extension'
import { fileURLToPath, URL } from 'node:url'

const ZEN_BROWSER_PATHS = [
  '/Applications/Zen.app/Contents/MacOS/zen',
  '/Applications/Zen Browser.app/Contents/MacOS/zen',
  '/Applications/Firefox.app/Contents/MacOS/firefox',
]

function resolveBrowserBinary(): string | undefined {
  const fromEnv = process.env.FIREFOX_BINARY
  if (fromEnv && existsSync(fromEnv)) {
    return fromEnv
  }

  return ZEN_BROWSER_PATHS.find(existsSync)
}

/** Set OPEN_BROWSER=1 to spawn a separate Zen instance (web-ext default behaviour) */
const autoLaunchBrowser = process.env.OPEN_BROWSER === '1'
const browserBinary = resolveBrowserBinary()

if (!autoLaunchBrowser) {
  console.info(
    '[hawk-sender] dev: using your existing browser (no new window).\n'
    + '  First time: about:debugging → Load Temporary Add-on → dist/manifest.json\n'
    + '  After edits: Reload in about:debugging\n'
    + '  Isolated window: npm run dev:browser',
  )
}
else if (!browserBinary) {
  console.warn(
    '[hawk-sender] OPEN_BROWSER=1 but Zen/Firefox not found.\n'
    + 'Set FIREFOX_BINARY=/path/to/zen npm run dev:browser',
  )
}

export default defineConfig({
  root: 'src',
  publicDir: '../assets',
  plugins: [
    vue(),
    webExtension({
      manifest: 'manifest.json',
      browser: 'firefox',
      disableAutoLaunch: !autoLaunchBrowser || !browserBinary,
      webExtConfig: autoLaunchBrowser && browserBinary
        ? { firefox: browserBinary }
        : undefined,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
