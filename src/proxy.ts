import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * NextAuth.js 프록시
 * 인증이 필요한 라우트를 보호하고, 인증되지 않은 사용자를 로그인 페이지로 리다이렉트합니다.
 * TAG-TASK-008: 인증이 필요한 라우트 보호 프록시 구현
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
export default auth((req) => {
  const { pathname } = req.nextUrl

  // 공개 라우트: 인증 확인 없음
  const publicRoutes = ['/', '/auth/signin', '/auth/signup']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  // API auth routes: 공개
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // 공개 라우트인 경우 통과
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // 보호된 라우트 확인
  const protectedRoutePatterns = ['/dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutePatterns.some(pattern => pathname.startsWith(pattern))

  // 보호된 라우트이고 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (isProtectedRoute && !req.auth) {
    const callbackUrl = encodeURIComponent(pathname)
    const signInUrl = `/auth/signin?callbackUrl=${callbackUrl}`
    return NextResponse.redirect(new URL(signInUrl, req.url))
  }

  // 인증된 사용자 또는 공개 라우트: 통과
  return NextResponse.next()
})

/**
 * 프록시가 실행될 라우트를 설정합니다.
 * 정적 파일, 이미지, _next 내부 경로는 제외됩니다.
 */
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더 내 파일
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
