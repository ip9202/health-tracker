import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/auth/signup/route'

// Mock password utility
vi.mock('@/lib/password', () => ({
  hashPassword: vi.fn((password: string) => `hashed_${password}`)
}))

// Mock Prisma module
const mockUserFindUnique = vi.fn()
const mockUserCreate = vi.fn()

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate
    }
  }))
}))

describe('POST /api/auth/signup - TASK-004', () => {
  beforeEach(() => {
    mockUserFindUnique.mockClear()
    mockUserCreate.mockClear()
  })

  it('should create a new user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User'
    }

    mockUserFindUnique.mockResolvedValue(null)
    mockUserCreate.mockResolvedValue({
      id: 'user_123',
      email: userData.email,
      name: userData.name,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(userData.email)
    expect(data.user.password).toBeUndefined() // 비밀번호는 응답에 포함되지 않음
  })

  it('should return 400 for invalid email format', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'SecurePass123!'
    }

    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
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

  it('should return 400 for weak password', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'weak' // 8자 미만, 복잡성 요구사항 미충족
    }

    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
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

  it('should return 409 if email already exists', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'SecurePass123!'
    }

    mockUserFindUnique.mockResolvedValue({
      id: 'existing_user',
      email: userData.email
    })

    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.error).toContain('이미 존재하는 이메일')
  })

  it('should hash password before saving', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!'
    }

    mockUserFindUnique.mockResolvedValue(null)
    mockUserCreate.mockResolvedValue({
      id: 'user_123',
      email: userData.email
    })

    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    await POST(request)

    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          password: `hashed_${userData.password}` // 해싱된 비밀번호
        })
      })
    )
  })

  it('should return 400 for missing required fields', async () => {
    const userData = {
      email: 'test@example.com'
      // password 누락
    }

    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
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
    const request = new Request('http://localhost:3000/api/auth/signup', {
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
})
