import { describe, it, expect } from 'vitest'
import {
  signUpSchema,
  signInSchema,
  SignUpInput,
  SignInInput
} from '@/lib/validations'

describe('Validation Schemas - TASK-003', () => {
  describe('signUpSchema', () => {
    const validInput: SignUpInput = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User'
    }

    it('should validate correct sign up input', () => {
      const result = signUpSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should require email', () => {
      const input = { ...validInput, email: '' }
      const result = signUpSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should validate email format', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@.com'
      ]

      invalidEmails.forEach(email => {
        const input = { ...validInput, email }
        const result = signUpSchema.safeParse(input)
        expect(result.success).toBe(false)
      })
    })

    it('should require password with minimum 8 characters', () => {
      const input = { ...validInput, password: 'Short1!' }
      const result = signUpSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require password with uppercase letter', () => {
      const input = { ...validInput, password: 'lowercase123!' }
      const result = signUpSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require password with lowercase letter', () => {
      const input = { ...validInput, password: 'UPPERCASE123!' }
      const result = signUpSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require password with number', () => {
      const input = { ...validInput, password: 'NoNumbers!' }
      const result = signUpSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should require password with special character', () => {
      const input = { ...validInput, password: 'NoSpecialChars123' }
      const result = signUpSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should accept optional name field', () => {
      const input = { email: 'test@example.com', password: 'SecurePass123!' }
      const result = signUpSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should trim whitespace from email', () => {
      const input = { ...validInput, email: '  test@example.com  ' }
      const result = signUpSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })
  })

  describe('signInSchema', () => {
    const validInput: SignInInput = {
      email: 'test@example.com',
      password: 'SecurePass123!'
    }

    it('should validate correct sign in input', () => {
      const result = signInSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should require email', () => {
      const input = { ...validInput, email: '' }
      const result = signInSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should validate email format', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com'
      ]

      invalidEmails.forEach(email => {
        const input = { ...validInput, email }
        const result = signInSchema.safeParse(input)
        expect(result.success).toBe(false)
      })
    })

    it('should require password', () => {
      const input = { email: 'test@example.com', password: '' }
      const result = signInSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should not validate password complexity for sign in', () => {
      const input = { ...validInput, password: 'simple' }
      const result = signInSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should trim whitespace from email', () => {
      const input = { ...validInput, email: '  test@example.com  ' }
      const result = signInSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })
  })

  describe('Type Safety', () => {
    it('should infer correct types from schemas', () => {
      const signUpInput: SignUpInput = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      }
      expect(signUpInput.email).toBeDefined()
      expect(signUpInput.password).toBeDefined()
    })

    it('should make name optional in SignUpInput', () => {
      const signUpInput: SignUpInput = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      }
      expect(signUpInput.name).toBeUndefined()
    })
  })
})
