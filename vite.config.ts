/**
 * Vite configuration.
 * Uses the React plugin (Oxc-based) and Tailwind CSS v4 plugin.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: ['es2020', 'chrome87', 'safari14', 'firefox78'],
  },
})
