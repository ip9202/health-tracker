import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/password'

describe('Password Utility - TASK-002', () => {
  describe('hashPassword', () => {
    it('should hash a plain text password', () => {
      const plainPassword = 'MySecurePassword123!'
      const hashedPassword = hashPassword(plainPassword)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(plainPassword)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for the same password (salt)', () => {
      const plainPassword = 'SamePassword123!'
      const hash1 = hashPassword(plainPassword)
      const hash2 = hashPassword(plainPassword)

      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty password', () => {
      const plainPassword = ''
      const hashedPassword = hashPassword(plainPassword)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(plainPassword)
    })

    it('should throw error for null or undefined password', () => {
      expect(() => hashPassword(null as any)).toThrow('Password is required')
      expect(() => hashPassword(undefined as any)).toThrow('Password is required')
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', () => {
      const plainPassword = 'CorrectPassword123!'
      const hashedPassword = hashPassword(plainPassword)

      const isValid = verifyPassword(plainPassword, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should return false for incorrect password', () => {
      const plainPassword = 'CorrectPassword123!'
      const wrongPassword = 'WrongPassword456!'
      const hashedPassword = hashPassword(plainPassword)

      const isValid = verifyPassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })

    it('should return false for empty password', () => {
      const plainPassword = 'CorrectPassword123!'
      const hashedPassword = hashPassword(plainPassword)

      const isValid = verifyPassword('', hashedPassword)
      expect(isValid).toBe(false)
    })

    it('should throw error for null or undefined password', () => {
      const hashedPassword = hashPassword('TestPassword123!')

      expect(() => verifyPassword(null as any, hashedPassword)).toThrow('Password is required')
      expect(() => verifyPassword(undefined as any, hashedPassword)).toThrow('Password is required')
    })

    it('should throw error for null or undefined hashed password', () => {
      const plainPassword = 'TestPassword123!'

      expect(() => verifyPassword(plainPassword, null as any)).toThrow('Hashed password is required')
      expect(() => verifyPassword(plainPassword, undefined as any)).toThrow('Hashed password is required')
    })
  })

  describe('Security Requirements', () => {
    it('should use bcrypt with appropriate work factor', () => {
      const plainPassword = 'SecurePassword123!'
      const hashedPassword = hashPassword(plainPassword)

      // bcrypt hashes start with $2b$ or $2a$
      expect(hashedPassword).toMatch(/^\$2[ab]\$/)
    })

    it('should hash password with consistent length', () => {
      const plainPassword = 'TestPassword123!'
      const hashedPassword = hashPassword(plainPassword)

      // bcrypt hashes are always 60 characters long
      expect(hashedPassword.length).toBe(60)
    })
  })
})
