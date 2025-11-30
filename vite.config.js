import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/EduAI-Rural-Web/',   // <-- IMPORTANT (your repo name)
})
