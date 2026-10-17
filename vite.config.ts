import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'grupohormesis.es',
      '.grupohormesis.es',
      'hormesis-front-production.up.railway.app',
      '.railway.app',
      '.up.railway.app',
      'localhost',
    ],
  },
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    allowedHosts: [
      'grupohormesis.es',
      '.grupohormesis.es',
      'hormesis-front-production.up.railway.app',
      '.railway.app',
      '.up.railway.app',
      'localhost',
    ],
  },
})
