import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://eeriest-asymptotically-sherie.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        ws: true,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      },
      '/uploads': {
        target: 'https://eeriest-asymptotically-sherie.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    }
  }
})
