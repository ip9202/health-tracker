import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/auth/signout/route'

describe('POST /api/auth/signout - TASK-007', () => {
  it('should return success response', async () => {
    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('로그아웃')
  })

  it('should return correct response structure', async () => {
    const response = await POST()
    const data = await response.json()

    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('message')
    expect(typeof data.message).toBe('string')
  })
})
