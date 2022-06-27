import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

import esbuild from 'esbuild'

const require = createRequire(import.meta.url)
const entryPoint = require.resolve('@geut/socketich-client')

const __dirname = dirname(fileURLToPath(import.meta.url))

export const ASSETS_PATH = join(__dirname, '..', '..', 'dist')

export function buildJsClient (format, minify = false) {
  return esbuild.build({
    entryPoints: [entryPoint],
    outfile: join(ASSETS_PATH, format, `client${minify ? '.min' : ''}.js`),
    bundle: true,
    format,
    minify,
    absWorkingDir: __dirname,
    globalName: '__client',
    footer: {
      js: format === 'iife' ? 'window.Client = __client.Client' : undefined
    },
    sourcemap: process.env.NODE_ENV !== 'production' ? 'inline' : undefined
  })
}
