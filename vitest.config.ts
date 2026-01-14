import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/types/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.*',
        'vitest.setup.ts'
      ],
      thresholds: {
        statements: 85,
        branches: 85,
        functions: 85,
        lines: 85
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['next-auth']
  }
})
