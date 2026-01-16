/**
 * TASK-009: API 엔드포인트 확장 구현
 * GET /api/inbody/extraction/[id] - InBody 레코드의 추출 상세 정보 반환
 *
 * REFACTOR Phase: 타입 안정성 강화 및 코드 개선
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { ExtractionDetailResponse } from '@/lib/types/inbody';

/**
 * API 오류 응답 타입
 */
interface ApiErrorResponse {
  error: string;
  errorCode: string;
  details?: string;
}

/**
 * ExtractionResult 생성 헬퍼 함수
 * InBody 레코드에서 ExtractionResult를 생성합니다
 */
function createExtractionResult(record: {
  ocrConfidence: number | null;
  createdAt: Date;
}): ExtractionDetailResponse['data']['extractionResult'] {
  return {
    attempts: [], // TODO: TASK-010에서 실제 추출 시도 기록 저장 기능 구현
    confidence: record.ocrConfidence ?? 0,
    processingTimeMs: 0, // TODO: TASK-010에서 실제 처리 시간 측정 기능 구현
    timestamp: record.createdAt.toISOString(),
  };
}

/**
 * GET /api/inbody/extraction/[id]
 * InBody 레코드의 추출 상세 정보 반환
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 인증 검증 (SPEC-AUTH-001)
    const session = await auth();
    if (!session?.user?.id) {
      const errorResponse: ApiErrorResponse = {
        error: '인증이 필요합니다',
        errorCode: 'UNAUTHORIZED',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userId = session.user.id;

    // 2. 레코드 조회
    const record = await prisma.inBodyRecord.findUnique({
      where: { id: params.id },
    });

    // 3. 레코드 존재 확인
    if (!record) {
      const errorResponse: ApiErrorResponse = {
        error: 'InBody 레코드를 찾을 수 없습니다',
        errorCode: 'RECORD_NOT_FOUND',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // 4. 소유권 확인
    if (record.userId !== userId) {
      const errorResponse: ApiErrorResponse = {
        error: '접근 권한이 없습니다',
        errorCode: 'FORBIDDEN',
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // 5. ExtractionResult 생성
    const extractionResult = createExtractionResult(record);

    // 6. 성공 응답 반환
    const successResponse: ExtractionDetailResponse = {
      success: true,
      data: {
        id: record.id,
        extractionResult,
      },
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    // 7. 오류 처리
    const errorResponse: ApiErrorResponse = {
      error: '서버 오류',
      errorCode: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
