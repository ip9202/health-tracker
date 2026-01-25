/**
 * TAG-FE-002-API-001: InBody API 클라이언트 테스트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody API 클라이언트 함수 및 TanStack Query hooks 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// API 클라이언트 함수 import (존재하지 않으므로 실패 예상)
import * as inbodyApi from '@/lib/api/inbody-api'

// TanStack Query hooks import (존재하지 않으므로 실패 예상)
import { useInBodyHistory, useInBodyUpload, useDeleteInBody } from '@/lib/hooks/use-inbody'

describe('InBody API 클라이언트', () => {
  beforeEach(() => {
    // fetch mock 초기화
    global.fetch = vi.fn()
  })

  describe('uploadInBodyImage', () => {
    it('이미지 업로드 API를 호출해야 함', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'upload-1',
            measuredAt: new Date().toISOString(),
            ocrConfidence: 95.5,
          },
        }),
      }

      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any)

      const result = await inbodyApi.uploadInBodyImage(mockFile)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('upload-1')
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/inbody/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )
    })

    it('이미지 업로드 실패 시 에러를 반환해야 함', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Invalid image format',
        }),
      }

      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any)

      const result = await inbodyApi.uploadInBodyImage(mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid image format')
    })
  })

  describe('fetchInBodyHistory', () => {
    it('측정 기록을 조회해야 함', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          records: [
            {
              id: 'record-1',
              measuredAt: '2026-01-14T00:00:00.000Z',
              weight: 70.5,
              bodyFat: 15.2,
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        }),
      }

      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any)

      const result = await inbodyApi.fetchInBodyHistory({ page: 1, pageSize: 20 })

      expect(result.records).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/inbody/history?page=1&pageSize=20'
      )
    })

    it('날짜 범위 필터링을 지원해야 함', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          records: [],
          total: 0,
          page: 1,
          pageSize: 20,
        }),
      }

      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any)

      const fromDate = new Date('2026-01-01')
      const toDate = new Date('2026-01-31')

      await inbodyApi.fetchInBodyHistory({
        page: 1,
        pageSize: 20,
        from: fromDate,
        to: toDate,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('from=2026-01-01')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('to=2026-01-31')
      )
    })
  })

  describe('deleteInBodyRecord', () => {
    it('기록을 삭제해야 함', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
        }),
      }

      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any)

      const result = await inbodyApi.deleteInBodyRecord('record-1')

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/inbody/record-1', {
        method: 'DELETE',
      })
    })
  })
})

describe('InBody TanStack Query Hooks', () => {
  let queryClient: QueryClient
  let wrapper: React.FC<{ children: React.ReactNode }>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    global.fetch = vi.fn()
  })

  describe('useInBodyHistory', () => {
    it('측정 기록을 불러와야 함', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          records: [
            {
              id: 'record-1',
              measuredAt: '2026-01-14T00:00:00.000Z',
              weight: 70.5,
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        }),
      }

      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any)

      const { result } = renderHook(
        () => useInBodyHistory({ page: 1, pageSize: 20 }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data?.records).toHaveLength(1)
    })
  })

  describe('useInBodyUpload', () => {
    it('이미지 업로드 mutation을 제공해야 함', async () => {
      const { result } = renderHook(() => useInBodyUpload(), { wrapper })

      expect(result.current.mutate).toBeDefined()
      expect(typeof result.current.mutate).toBe('function')
    })
  })

  describe('useDeleteInBody', () => {
    it('삭제 mutation을 제공해야 함', async () => {
      const { result } = renderHook(() => useDeleteInBody(), { wrapper })

      expect(result.current.mutate).toBeDefined()
      expect(typeof result.current.mutate).toBe('function')
    })
  })
})
