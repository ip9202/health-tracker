import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock modules before imports
vi.mock('@/lib/password', () => ({
  verifyPassword: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  }
}))

import { POST } from '@/app/api/auth/signin/route'
import { verifyPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'

// Type assertion for mocked functions
const mockedVerifyPassword = verifyPassword as vi.MockedFunction<typeof verifyPassword>
const mockedFindUnique = prisma.user.findUnique as unknown as vi.MockedFunction<typeof prisma.user.findUnique>

describe('POST /api/auth/signin - TASK-006', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should authenticate user with valid credentials', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'CorrectPassword123!'
    }

    // Mock user found in database
    mockedFindUnique.mockResolvedValue({
      id: 'user_123',
      email: credentials.email,
      password: 'hashed_CorrectPassword123!',
      name: 'Test User',
      image: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Mock password verification success
    mockedVerifyPassword.mockReturnValue(true)

    const request = new Request('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(credentials.email)
    expect(data.user.password).toBeUndefined() // 비밀번호는 응답에 포함되지 않음
  })

  it('should return 401 for invalid email', async () => {
    const credentials = {
      email: 'nonexistent@example.com',
      password: 'SomePassword123!'
    }

    // Mock user not found
    mockedFindUnique.mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toContain('이메일 또는 비밀번호')
  })

  it('should return 401 for invalid password', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'WrongPassword123!'
    }

    // Mock user found
    mockedFindUnique.mockResolvedValue({
      id: 'user_123',
      email: credentials.email,
      password: 'hashed_CorrectPassword123!',
      name: 'Test User',
      image: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Mock password verification failure
    mockedVerifyPassword.mockReturnValue(false)

    const request = new Request('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toContain('이메일 또는 비밀번호')
  })

  it('should return 400 for invalid email format', async () => {
    const credentials = {
      email: 'invalid-email',
      password: 'SomePassword123!'
    }

    const request = new Request('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for missing required fields', async () => {
    const credentials = {
      email: 'test@example.com'
      // password 누락
    }

    const request = new Request('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should handle malformed JSON', async () => {
    const request = new Request('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should handle database errors gracefully', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'SomePassword123!'
    }

    // Mock database error
    mockedFindUnique.mockRejectedValue(new Error('Database connection failed'))

    const request = new Request('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
