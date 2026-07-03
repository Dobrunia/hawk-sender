import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = join(rootDir, 'assets')
const svg = readFileSync(join(assetsDir, 'icon.svg'))
const sizes = [16, 32, 48, 96, 128]

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(assetsDir, `icon-${size}.png`))
}

console.log(`Generated ${sizes.length} PNG icons in assets/`)
