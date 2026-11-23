import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The question bank lives in ../items so the harness and the game share it.
  server: { fs: { allow: ['..'] } },
})
