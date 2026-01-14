/**
 * TAG-FE-001-PROV-001: TanStack Query Provider 설정
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 대시보드를 위한 TanStack Query 설정 및 Provider
 */

'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider as TanStackQueryProvider } from '@tanstack/react-query'

/**
 * TanStack Query 기본 설정
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

/**
 * 브라우저 환경에서 QueryClient 싱글톤获取
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: 항상 새로운 QueryClient 생성
    return makeQueryClient()
  } else {
    // Browser: 기존 QueryClient 재사용
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

/**
 * QueryProvider 컴포넌트
 * TanStack Query를 애플리케이션에 제공
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <TanStackQueryProvider client={queryClient}>
      {children}
    </TanStackQueryProvider>
  )
}
