/**
 * TASK-009: API 엔드포인트 확장 구현
 * POST /api/inbody/retry-extraction/[id] - 강화된 전처리로 추출 재시도
 *
 * RED Phase: 실패하는 테스트 작성
 */

import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    inBodyRecord: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('POST /api/inbody/retry-extraction/[id]', () => {
  const mockUserId = 'test-user-id';
  const mockRecordId = 'test-record-id';
  const mockSession = {
    user: {
      id: mockUserId,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('인증 검증', () => {
    it('인증되지 않은 요청은 401 Unauthorized를 반환해야 함', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);
      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '인증이 필요합니다',
        errorCode: 'UNAUTHORIZED',
      });
    });
  });

  describe('레코드 조회', () => {
    it('존재하지 않는 레코드 ID는 404 Not Found를 반환해야 함', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(null);
      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'InBody 레코드를 찾을 수 없습니다',
        errorCode: 'RECORD_NOT_FOUND',
      });
    });

    it('다른 사용자의 레코드는 403 Forbidden을 반환해야 함', async () => {
      // Arrange
      const otherUserId = 'other-user-id';
      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue({
        id: mockRecordId,
        userId: otherUserId,
        measuredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: '접근 권한이 없습니다',
        errorCode: 'FORBIDDEN',
      });
    });
  });

  describe('재시도 레벨별 동작', () => {
    it('처음 요청 시 enhancedLevel이 1이어야 함 (기본 전처리)', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 85,
        ocrConfidence: 92.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      vi.mocked(prisma.inBodyRecord.update).mockResolvedValue({
        ...mockRecord,
        ocrConfidence: 95.0,
      } as any);

      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.retryCount).toBe(1);
      expect(data.data.enhancedLevel).toBe(1);
    });

    it('두 번째 요청 시 enhancedLevel이 2이어야 함 (대비 강화 +20%)', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 85,
        ocrConfidence: 92.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      vi.mocked(prisma.inBodyRecord.update).mockResolvedValue({
        ...mockRecord,
        ocrConfidence: 96.0,
      } as any);

      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ retryCount: 1 }),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.retryCount).toBe(2);
      expect(data.data.enhancedLevel).toBe(2);
    });

    it('세 번째 요청 시 enhancedLevel이 3이어야 함 (대비 강화 +40%)', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 85,
        ocrConfidence: 92.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      vi.mocked(prisma.inBodyRecord.update).mockResolvedValue({
        ...mockRecord,
        ocrConfidence: 97.0,
      } as any);

      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ retryCount: 2 }),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.retryCount).toBe(3);
      expect(data.data.enhancedLevel).toBe(3);
    });

    it('최대 재시도 횟수(3회) 초과 시 400 Bad Request를 반환해야 함', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 85,
        ocrConfidence: 92.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);

      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ retryCount: 3 }),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.errorCode).toBe('MAX_RETRY_EXCEEDED');
    });
  });

  describe('ExtractionResult 업데이트', () => {
    it('재시도 후 ExtractionResult가 업데이트되어야 함', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 85,
        ocrConfidence: 92.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      vi.mocked(prisma.inBodyRecord.update).mockResolvedValue({
        ...mockRecord,
        ocrConfidence: 95.0,
      } as any);

      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.extractionResult).toBeDefined();
      expect(data.data.extractionResult.attempts).toBeInstanceOf(Array);
      expect(data.data.extractionResult.confidence).toBeGreaterThanOrEqual(0);
      expect(data.data.extractionResult.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('재시도 후 신뢰도가 개선되어야 함', async () => {
      // Arrange
      const originalConfidence = 92.5;
      const improvedConfidence = 95.0;

      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 85,
        ocrConfidence: originalConfidence,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      vi.mocked(prisma.inBodyRecord.update).mockResolvedValue({
        ...mockRecord,
        ocrConfidence: improvedConfidence,
      } as any);

      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.extractionResult.confidence).toBeGreaterThanOrEqual(originalConfidence);
    });
  });

  describe('오류 처리', () => {
    it('데이터베이스 오류 시 500 Internal Server Error를 반환해야 함', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockRejectedValue(
        new Error('Database connection failed')
      );
      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류');
      expect(data.errorCode).toBe('INTERNAL_ERROR');
    });

    it('잘못된 요청 바디 시 400 Bad Request를 반환해야 함', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(mockSession);
      const request = new NextRequest(
        new Request('http://localhost:3000/api/inbody/retry-extraction/test-id', {
          method: 'POST',
          body: 'invalid json',
        })
      );

      // Act
      const response = await POST(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.errorCode).toBe('BAD_REQUEST');
    });
  });
});
