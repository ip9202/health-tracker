/**
 * TAG-FE-002-HOOK-001: InBody TanStack Query Hooks
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 데이터 관리를 위한 TanStack Query hooks
 */

import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query'
import { uploadInBodyImage, fetchInBodyHistory, deleteInBodyRecord } from '@/lib/api/inbody-api'
import type { UploadResponse, HistoryResponse } from '@/lib/types/inbody'

/**
 * InBody 측정 기록 조회 Query Hook
 * @param options 페이지네이션 및 필터 옵션
 */
export function useInBodyHistory(options: {
  page?: number
  pageSize?: number
  from?: Date
  to?: Date
} = {}): UseQueryResult<HistoryResponse> {
  return useQuery({
    queryKey: ['inbody', 'history', options],
    queryFn: () => fetchInBodyHistory(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * InBody 이미지 업로드 Mutation Hook
 * @param options 업로드 성공 후 실행할 콜백
 */
export function useInBodyUpload(options?: {
  onSuccess?: (data: UploadResponse) => void
  onError?: (error: Error) => void
}): UseMutationResult<UploadResponse, Error, File, unknown> {
  return useMutation({
    mutationFn: uploadInBodyImage,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

/**
 * InBody 기록 삭제 Mutation Hook
 * @param options 삭제 성공 후 실행할 콜백
 */
export function useDeleteInBody(options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}): UseMutationResult<{ success: boolean }, Error, string, unknown> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInBodyRecord,
    onSuccess: () => {
      // 기록 삭제 후 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['inbody', 'history'] })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}
