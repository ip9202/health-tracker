import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    poolOptions: {
      threads: {
        singleThread: true,
        minThreads: 1,
        maxThreads: 1
      }
    },
    // 메모리 사용량 최적화
    maxConcurrency: 1,
    fileParallelism: false,
    isolate: false,
    // Watch 모드에서 무한 실행 방지 - 파일 변경 시 테스트 자동 재실행만 수행
    watch: false,
    // 테스트 타임아웃 설정 (무한 루프 방지)
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        '.next/',
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
