import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
    strictPort: true
  },
  preview: {
    host: true,
    port: Number(process.env.PORT) || 3000,
    allowedHosts: true,
  },
  esbuild: {
    target: 'es2020'
  }
})
