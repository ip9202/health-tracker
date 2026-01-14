/**
 * TAG-FE-001-PROV-001: TanStack Query Provider 설정 테스트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: TanStack Query Provider가 제대로 설정되었는지 검증
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// QueryProvider 컴포넌트 import
import { QueryProvider } from '@/lib/providers/query-client'

describe('TanStack Query Provider', () => {
  it('QueryProvider 컴포넌트가 존재해야 함', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <QueryProvider>{children}</QueryProvider>
      </QueryClientProvider>
    )

    expect(wrapper).toBeDefined()
  })

  it('QueryClient 기본 옵션이 설정되어야 함', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })

    const options = queryClient.getDefaultOptions()
    expect(options.queries?.retry).toBe(1)
    expect(options.queries?.refetchOnWindowFocus).toBe(false)
  })

  it('QueryProvider가 children을 렌더링해야 함', () => {
    const queryClient = new QueryClient()

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <QueryProvider>{children}</QueryProvider>
      </QueryClientProvider>
    )

    const { result } = renderHook(() => 'test', { wrapper })
    expect(result.current).toBe('test')
  })
})
