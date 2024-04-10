/// <reference types="vitest" />

import path from 'node:path'
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    UnoCSS(),
  ],
  test: {
    environment: 'jsdom',
  },
})
