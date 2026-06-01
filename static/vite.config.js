import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { transformSync } from 'rolldown/utils'

// Vite 8 (rolldown/OXC) does not parse JSX in .js files by default.
// This plugin pre-transforms .js source files that contain JSX using OXC,
// so that rolldown's built-in transform sees plain JS output.
function jsAsJsxPlugin() {
  return {
    name: 'js-as-jsx',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.js') || id.includes('node_modules')) return null
      if (!code.includes('<') && !code.includes('React')) return null
      const result = transformSync(id, code, {
        lang: 'jsx',
        jsx: { runtime: 'classic' },
        sourcemap: true
      })
      return { code: result.code, map: result.map }
    }
  }
}

export default defineConfig({
  plugins: [jsAsJsxPlugin(), react()],
  base: '/build/',
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/build': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'dist'
  }
})
