import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Docker 환경에서 접근 가능하도록 설정
    port: 3003,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0', // Docker 환경에서 접근 가능하도록 설정
    port: 3003,
    strictPort: true
  },
  build: {
    outDir: 'dist'
  }
}) 