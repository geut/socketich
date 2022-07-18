import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

import esbuild from 'esbuild'

import { ASSETS_PATH } from '../config.js'

const require = createRequire(import.meta.url)
const entryPoint = require.resolve('@geut/socketich-client')

const __dirname = dirname(fileURLToPath(import.meta.url))

function buildJsClient (format, minify = false) {
  return esbuild.build({
    entryPoints: [entryPoint],
    outfile: join(ASSETS_PATH, format, `client${minify ? '.min' : ''}.js`),
    bundle: true,
    format,
    minify,
    absWorkingDir: __dirname,
    globalName: '__socketich',
    footer: {
      js: format === 'iife' ? 'window.Socketich = __socketich.Client' : undefined
    },
    sourcemap: process.env.NODE_ENV !== 'production' ? 'inline' : undefined
  })
}

for (const format of ['esm', 'iife']) {
  await buildJsClient(format)
  await buildJsClient(format, true)
}
