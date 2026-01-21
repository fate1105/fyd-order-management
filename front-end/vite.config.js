import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
    port: 5174,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@admin': path.resolve(__dirname, './src/features/admin'),
      '@shop': path.resolve(__dirname, './src/features/shop'),
      '@auth': path.resolve(__dirname, './src/features/auth'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
})
