import { describe, it, expect, vi } from 'vitest'
import { isProtectedRoute, getRedirectUrl } from '@/lib/middleware'

describe('Middleware Route Protection - TASK-008', () => {
  describe('isProtectedRoute', () => {
    it('should identify protected routes', () => {
      const protectedRoutes = ['/dashboard', '/profile', '/settings']

      protectedRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(true)
      })
    })

    it('should not identify public routes as protected', () => {
      const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/api/auth']

      publicRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(false)
      })
    })

    it('should identify nested protected routes', () => {
      const nestedProtectedRoutes = ['/dashboard/overview', '/profile/settings', '/settings/account']

      nestedProtectedRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(true)
      })
    })

    it('should handle query parameters', () => {
      const protectedRoutesWithQuery = ['/dashboard?tab=overview', '/profile?id=123']

      protectedRoutesWithQuery.forEach(route => {
        expect(isProtectedRoute(route)).toBe(true)
      })
    })
  })

  describe('getRedirectUrl', () => {
    it('should return signin URL with callback for protected routes', () => {
      const currentPath = '/dashboard'
      const redirectUrl = getRedirectUrl(currentPath)

      expect(redirectUrl).toContain('/auth/signin')
      expect(redirectUrl).toContain('callbackUrl')
    })

    it('should not redirect for public routes', () => {
      const currentPath = '/auth/signin'
      const redirectUrl = getRedirectUrl(currentPath)

      expect(redirectUrl).toBeNull()
    })

    it('should handle nested routes correctly', () => {
      const currentPath = '/profile/settings'
      const redirectUrl = getRedirectUrl(currentPath)

      expect(redirectUrl).toContain('/auth/signin')
      expect(redirectUrl).toContain(encodeURIComponent(currentPath))
    })

    it('should not redirect for API auth routes', () => {
      const apiAuthRoutes = ['/api/auth/signin', '/api/auth/signup', '/api/auth/signout']

      apiAuthRoutes.forEach(route => {
        const redirectUrl = getRedirectUrl(route)
        expect(redirectUrl).toBeNull()
      })
    })
  })

  describe('Route Configuration', () => {
    it('should have correct public routes defined', () => {
      // 이 테스트는 미들웨어 구성이 올바른지 확인
      const publicRoutes = ['/', '/auth/signin', '/auth/signup']

      publicRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(false)
      })
    })

    it('should have correct protected route patterns', () => {
      const dashboardRoutes = ['/dashboard', '/dashboard/anything', '/dashboard/anything/nested']

      dashboardRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(true)
      })
    })
  })
})
