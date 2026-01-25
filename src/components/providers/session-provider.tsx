/**
 * SessionProvider 컴포넌트
 * NextAuth.js 세션 프로바이더 설정
 * SPEC: SPEC-AUTH-001
 */

'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
