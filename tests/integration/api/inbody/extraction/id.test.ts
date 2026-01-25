/**
 * TASK-009: API 엔드포인트 확장 구현
 * GET /api/inbody/extraction/[id] - InBody 레코드의 추출 상세 정보 반환
 *
 * RED Phase: 실패하는 테스트 작성
 */

import { GET } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    inBodyRecord: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('GET /api/inbody/extraction/[id]', () => {
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
        new Request(`http://localhost:3000/api/inbody/extraction/${mockRecordId}`)
      );

      // Act
      const response = await GET(request, { params: { id: mockRecordId } });
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
        new Request(`http://localhost:3000/api/inbody/extraction/${mockRecordId}`)
      );

      // Act
      const response = await GET(request, { params: { id: mockRecordId } });
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
        userId: otherUserId, // 다른 사용자
        measuredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      const request = new NextRequest(
        new Request(`http://localhost:3000/api/inbody/extraction/${mockRecordId}`)
      );

      // Act
      const response = await GET(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: '접근 권한이 없습니다',
        errorCode: 'FORBIDDEN',
      });
    });
  });

  describe('ExtractionResult 반환', () => {
    it('성공 시 ExtractionResult를 포함한 응답을 반환해야 함', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date('2025-01-15T10:00:00Z'),
        bodyScore: 85,
        scoreDescription: '우수',
        weight: 70.5,
        height: 175,
        age: 30,
        gender: 'male',
        ocrConfidence: 92.5,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      const request = new NextRequest(
        new Request(`http://localhost:3000/api/inbody/extraction/${mockRecordId}`)
      );

      // Act
      const response = await GET(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id', mockRecordId);
      expect(data.data).toHaveProperty('extractionResult');
      expect(data.data.extractionResult).toHaveProperty('attempts');
      expect(data.data.extractionResult).toHaveProperty('confidence');
      expect(data.data.extractionResult).toHaveProperty('processingTimeMs');
      expect(data.data.extractionResult).toHaveProperty('timestamp');
    });

    it('ExtractionResult.attempts는 배열이어야 함', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 75,
        ocrConfidence: 88.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      const request = new NextRequest(
        new Request(`http://localhost:3000/api/inbody/extraction/${mockRecordId}`)
      );

      // Act
      const response = await GET(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(data.data.extractionResult.attempts)).toBe(true);
    });

    it('ExtractionResult.confidence는 숫자여야 함 (0-100)', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 80,
        ocrConfidence: 95.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      const request = new NextRequest(
        new Request(`http://localhost:3000/api/inbody/extraction/${mockRecordId}`)
      );

      // Act
      const response = await GET(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(typeof data.data.extractionResult.confidence).toBe('number');
      expect(data.data.extractionResult.confidence).toBeGreaterThanOrEqual(0);
      expect(data.data.extractionResult.confidence).toBeLessThanOrEqual(100);
    });

    it('ExtractionResult.processingTimeMs는 숫자여야 함', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 70,
        ocrConfidence: 85.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      const request = new NextRequest(
        new Request(`http://localhost:3000/api/inbody/extraction/${mockRecordId}`)
      );

      // Act
      const response = await GET(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(typeof data.data.extractionResult.processingTimeMs).toBe('number');
      expect(data.data.extractionResult.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('ExtractionResult.timestamp는 유효한 ISO 8601 날짜여야 함', async () => {
      // Arrange
      const mockRecord = {
        id: mockRecordId,
        userId: mockUserId,
        measuredAt: new Date(),
        bodyScore: 90,
        ocrConfidence: 98.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(auth).mockResolvedValue(mockSession);
      vi.mocked(prisma.inBodyRecord.findUnique).mockResolvedValue(mockRecord as any);
      const request = new NextRequest(
        new Request(`http://localhost:3000/api/inbody/extraction/${mockRecordId}`)
      );

      // Act
      const response = await GET(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(typeof data.data.extractionResult.timestamp).toBe('string');
      expect(new Date(data.data.extractionResult.timestamp)).toBeInstanceOf(Date);
      expect(isNaN(new Date(data.data.extractionResult.timestamp).getTime())).toBe(false);
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
        new Request(`http://localhost:3000/api/inbody/extraction/${mockRecordId}`)
      );

      // Act
      const response = await GET(request, { params: { id: mockRecordId } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('서버 오류');
      expect(data.errorCode).toBe('INTERNAL_ERROR');
    });
  });
});
