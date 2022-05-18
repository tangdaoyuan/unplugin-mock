import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VitePluginReload from 'vite-plugin-reload'
import vitePlugin from '../src/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePluginReload({
      includes: ['../src/**/*.{ts,tsx}'],
    }),
    vitePlugin(),
  ],
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
})
