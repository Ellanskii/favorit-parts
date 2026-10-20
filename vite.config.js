import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const key = env.API_KEY || '00000000-0000-0000-0000-000000000001'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://api.favorit-parts.ru',
          changeOrigin: true,
          // так же, как в nginx.conf: ключ добавляется на прокси
          rewrite: (path) => path.replace(/^\/api\/?\??/, `/hs/hsprice/?key=${key}&`),
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
    },
  }
})
