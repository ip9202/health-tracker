import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignUpForm from '@/components/auth/signup-form'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock fetch for API calls
global.fetch = vi.fn()

describe('SignUpForm Component - TASK-009', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render signup form with required fields', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^비밀번호$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호 확인/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /회원가입/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    render(<SignUpForm />)

    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/이메일을 입력해주세요/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid email format', async () => {
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/이메일/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })

    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/i)
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass123!' } })

    // Prevent form submission by mocking window.fetch
    const mockFetch = vi.fn(() => Promise.reject(new Error('Should not reach here')))
    global.fetch = mockFetch

    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/유효한 이메일/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for weak password', async () => {
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/이메일/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    fireEvent.change(passwordInput, { target: { value: 'weak' } })

    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/비밀번호는 최소 8자/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for password mismatch', async () => {
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/이메일/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })

    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/i)
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } })

    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/비밀번호가 일치하지 않습니다/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const mockSuccess = true
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: mockSuccess,
      json: async () => ({ success: true, user: { id: '123', email: 'test@example.com' } })
    } as Response)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/이메일/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })

    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/i)
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass123!' } })

    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }))
    })
  })

  it('should handle API errors gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: '이미 존재하는 이메일입니다.' })
    } as Response)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/이메일/i)
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })

    const passwordInput = screen.getByLabelText(/^비밀번호$/i)
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })

    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/i)
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass123!' } })

    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/이미 존재하는 이메일/i)).toBeInTheDocument()
    })
  })

  it('should have link to signin page', () => {
    render(<SignUpForm />)

    const signinLink = screen.getByRole('link', { name: /로그인/i })
    expect(signinLink).toBeInTheDocument()
    expect(signinLink).toHaveAttribute('href', '/auth/signin')
  })
})
