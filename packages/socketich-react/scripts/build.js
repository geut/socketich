import esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

const isProduction = process.env.NODE_ENV === 'production'

for (const format of ['esm', 'cjs']) {
  esbuild.build({
    entryPoints: ['index.js'],
    outdir: `dist/${format}`,
    bundle: true,
    sourcemap: !isProduction,
    minify: isProduction,
    splitting: format === 'esm',
    format,
    target: 'esnext',
    loader: {
      '.js': 'jsx'
    },
    external: ['react', 'react-dom'],
    // inject: [`import * as React from 'react'`]
    plugins: [nodeExternalsPlugin()]
  })
}
