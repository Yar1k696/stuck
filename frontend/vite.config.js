import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/static/', // 👈 теперь пути будут /static/assets/...
  plugins: [react()],
  build: {
    outDir: 'dist', // папка билда
    assetsDir: 'assets', // папка для ассетов внутри билда
  }
})
