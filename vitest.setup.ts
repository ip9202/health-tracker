import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {}
  }),
  useSearchParams: () => ({
    get: vi.fn()
  }),
  usePathname: () => '/'
}))

// Mock Next.js server components
vi.mock('next/server', () => ({
  NextResponse: class NextResponse {
    static json(data: any, init?: ResponseInit) {
      return new Response(JSON.stringify(data), init)
    }
    static redirect(url: string, init?: number | ResponseInit) {
      const status = typeof init === 'number' ? init : init?.status || 307
      return new Response(null, { status, headers: { Location: url } })
    }
  },
  NextRequest: class NextRequest extends Request {
    constructor(input: string | RequestInfo, init?: RequestInit) {
      super(input, init)
    }
  }
}))

// Mock Next.js config
vi.mock('next/config', () => ({
  getConfig: () => ({
    publicRuntimeConfig: {},
    serverRuntimeConfig: {}
  })
}))

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated'
  })),
  signIn: vi.fn(),
  signOut: vi.fn()
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})
