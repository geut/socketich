import path from 'node:path'
import url from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectSrc = path.dirname(url.fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(mode => ({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(projectSrc, 'index.jsx'),
      name: 'SocketichReact',
      fileName: (format) => `socketich-react.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
}))
