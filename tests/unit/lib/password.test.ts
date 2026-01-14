import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/password'

describe('Password Utility - TASK-002', () => {
  describe('hashPassword', () => {
    it('should hash a plain text password', async () => {
      const plainPassword = 'MySecurePassword123!'
      const hashedPassword = await hashPassword(plainPassword)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(plainPassword)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for the same password (salt)', async () => {
      const plainPassword = 'SamePassword123!'
      const hash1 = await hashPassword(plainPassword)
      const hash2 = await hashPassword(plainPassword)

      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty password', async () => {
      const plainPassword = ''
      const hashedPassword = await hashPassword(plainPassword)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(plainPassword)
    })

    it('should throw error for null or undefined password', async () => {
      await expect(hashPassword(null as any)).rejects.toThrow('Password is required')
      await expect(hashPassword(undefined as any)).rejects.toThrow('Password is required')
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'CorrectPassword123!'
      const hashedPassword = await hashPassword(plainPassword)

      const isValid = await verifyPassword(plainPassword, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const plainPassword = 'CorrectPassword123!'
      const wrongPassword = 'WrongPassword456!'
      const hashedPassword = await hashPassword(plainPassword)

      const isValid = await verifyPassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })

    it('should return false for empty password', async () => {
      const plainPassword = 'CorrectPassword123!'
      const hashedPassword = await hashPassword(plainPassword)

      const isValid = await verifyPassword('', hashedPassword)
      expect(isValid).toBe(false)
    })

    it('should throw error for null or undefined password', async () => {
      const hashedPassword = await hashPassword('TestPassword123!')

      await expect(verifyPassword(null as any, hashedPassword)).rejects.toThrow('Password is required')
      await expect(verifyPassword(undefined as any, hashedPassword)).rejects.toThrow('Password is required')
    })

    it('should throw error for null or undefined hashed password', async () => {
      const plainPassword = 'TestPassword123!'

      await expect(verifyPassword(plainPassword, null as any)).rejects.toThrow('Hashed password is required')
      await expect(verifyPassword(plainPassword, undefined as any)).rejects.toThrow('Hashed password is required')
    })
  })

  describe('Security Requirements', () => {
    it('should use bcrypt with appropriate work factor', async () => {
      const plainPassword = 'SecurePassword123!'
      const hashedPassword = await hashPassword(plainPassword)

      // bcrypt hashes start with $2b$ or $2a$
      expect(hashedPassword).toMatch(/^\$2[ab]\$/)
    })

    it('should hash password with consistent length', async () => {
      const plainPassword = 'TestPassword123!'
      const hashedPassword = await hashPassword(plainPassword)

      // bcrypt hashes are always 60 characters long
      expect(hashedPassword.length).toBe(60)
    })
  })
})
