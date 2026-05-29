import react from '@vitejs/plugin-react'

import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const defineEnv = Object.entries(env)
    .filter(([key]) => key.startsWith('VITE_'))
    .reduce(
      (acc, [key, value]) => {
        acc[`process.env.${key}`] = JSON.stringify(value)

        return acc
      },
      {} as Record<string, string>,
    )

  return {
    plugins: [react()],
    define: defineEnv,
  }
})
