/**
 * 공개 라우트 목록
 * 이 라우트들은 인증이 필요 없습니다.
 */
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/api/auth',
]

/**
 * 보호된 라우트 패턴 목록
 * 이 패턴으로 시작하는 모든 라우트는 인증이 필요합니다.
 */
const protectedRoutePatterns = [
  '/dashboard',
  '/profile',
  '/settings',
]

/**
 * 주어진 경로가 보호된 라우트인지 확인합니다.
 * @param path - 확인할 경로 (쿼리 파라미터 포함 가능)
 * @returns 보호된 라우트이면 true, 공개 라우트이면 false
 */
export function isProtectedRoute(path: string): boolean {
  // 쿼리 파라미터 제거
  const url = new URL(path, 'http://localhost')
  const pathname = url.pathname

  // 공개 라우트 확인
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return false
  }

  // API auth routes는 공개
  if (pathname.startsWith('/api/auth')) {
    return false
  }

  // 보호된 라우트 패턴 확인
  return protectedRoutePatterns.some(pattern => pathname.startsWith(pattern))
}

/**
 * 보호된 라우트에 대한 리다이렉트 URL을 생성합니다.
 * @param currentPath - 현재 경로
 * @returns 리다이렉트할 URL 또는 null (리다이렉트 불필요 시)
 */
export function getRedirectUrl(currentPath: string): string | null {
  if (!isProtectedRoute(currentPath)) {
    return null
  }

  // 쿼리 파라미터 제거
  const url = new URL(currentPath, 'http://localhost')
  const pathname = url.pathname

  // 현재 경로를 callbackUrl로 인코딩
  const callbackUrl = encodeURIComponent(pathname)

  return `/auth/signin?callbackUrl=${callbackUrl}`
}
