/**
 * TAG-FE-002-API-001: InBody API 클라이언트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 데이터 관리 API 호출 함수
 */

import type { UploadResponse, HistoryResponse, DateRangeFilter } from '@/lib/types/inbody'

/**
 * 클라이언트 OCR 결과와 함께 InBody 데이터 업로드
 * @param ocrText OCR로 추출된 텍스트
 * @param ocrConfidence OCR 신뢰도
 * @returns 업로드 결과
 */
export async function uploadInBodyDataWithOCR(
  ocrText: string,
  ocrConfidence: number,
): Promise<UploadResponse> {
  const response = await fetch('/api/inbody/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ocrText,
      ocrConfidence,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
    return {
      success: false,
      error: errorData.error || `Upload failed with status ${response.status}`,
    }
  }

  return response.json()
}

/**
 * InBody 이미지 업로드 (레거시 - 더미 데이터용)
 * @param file 업로드할 이미지 파일
 * @returns 업로드 결과
 */
export async function uploadInBodyImage(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/inbody/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
    return {
      success: false,
      error: errorData.error || `Upload failed with status ${response.status}`,
    }
  }

  return response.json()
}

/**
 * InBody 측정 기록 조회
 * @param options 페이지네이션 및 필터 옵션
 * @returns 측정 기록 목록
 */
export async function fetchInBodyHistory(options: {
  page?: number
  pageSize?: number
  from?: Date
  to?: Date
} = {}): Promise<HistoryResponse> {
  const params = new URLSearchParams()

  if (options.page) params.append('page', options.page.toString())
  if (options.pageSize) params.append('pageSize', options.pageSize.toString())
  if (options.from) params.append('from', options.from.toISOString())
  if (options.to) params.append('to', options.to.toISOString())

  const url = `/api/inbody/history${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status}`)
  }

  return response.json()
}

/**
 * InBody 기록 삭제
 * @param id 삭제할 기록 ID
 * @returns 삭제 결과
 */
export async function deleteInBodyRecord(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/inbody/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete record: ${response.status}`)
  }

  return response.json()
}
