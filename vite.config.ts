import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Project Pages: https://edopaz798.github.io/pomodoro-vs-agent/
  base: '/pomodoro-vs-agent/',
})
