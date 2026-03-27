import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8800,
    host: '127.0.0.1',
    allowedHosts: ['oz.120619.xyz', 'localhost', '127.0.0.1']
  }
})
