import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/auth/signout/route'

describe('POST /api/auth/signout - TASK-007', () => {
  it('should return success response for signout', async () => {
    const request = new Request('http://localhost:3000/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBeDefined()
  })

  it('should handle signout request without body', async () => {
    const request = new Request('http://localhost:3000/api/auth/signout', {
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should return consistent response format', async () => {
    const request = new Request('http://localhost:3000/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('message')
    expect(typeof data.success).toBe('boolean')
    expect(typeof data.message).toBe('string')
  })
})
