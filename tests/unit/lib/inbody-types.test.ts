/**
 * TAG-FE-001-TYPE-001: InBody 타입 정의 테스트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 데이터 관리를 위한 TypeScript 타입 정의 검증
 */

import { describe, it, expect } from 'vitest'
// 이 import는 파일이 존재하지 않으므로 실패해야 함 (RED)
import { InBodyData, InBodyRecord, UploadResponse, HistoryResponse } from '@/lib/types/inbody'

describe('InBody 타입 정의', () => {
  it('InBodyData 타입이 정의되어 있어야 함', () => {
    const mockData: InBodyData = {
      id: 'test-id',
      userId: 'user-123',
      measuredAt: new Date('2026-01-14'),
      imagePath: '/uploads/test.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    expect(mockData.id).toBe('test-id')
    expect(mockData.userId).toBe('user-123')
  })

  it('InBodyRecord 타입이 정의되어 있어야 함', () => {
    const mockRecord: InBodyRecord = {
      id: 'record-1',
      measuredAt: new Date('2026-01-14'),
      weight: 70.5,
      bodyFat: 15.2,
    }

    expect(mockRecord.weight).toBe(70.5)
  })

  it('UploadResponse 타입이 정의되어 있어야 함', () => {
    const mockResponse: UploadResponse = {
      success: true,
      data: {
        id: 'upload-1',
        measuredAt: new Date(),
        ocrConfidence: 95.5,
      },
    }

    expect(mockResponse.success).toBe(true)
    expect(mockResponse.data?.ocrConfidence).toBe(95.5)
  })

  it('HistoryResponse 타입이 정의되어 있어야 함', () => {
    const mockHistory: HistoryResponse = {
      records: [
        {
          id: 'record-1',
          measuredAt: new Date('2026-01-14'),
          weight: 70.5,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    }

    expect(mockHistory.records).toHaveLength(1)
    expect(mockHistory.total).toBe(1)
  })
})
