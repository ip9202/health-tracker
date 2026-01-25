/**
 * TAG-AI-005: AI 분석 결과 조회 API
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템
 *
 * GET /api/health/analysis/[recordId]
 * AI 분석 결과 조회 (캐싱 활용)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStoredAnalysis } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';

/**
 * AI 분석 결과 조회
 * REQ-AI-001: 인증 검증
 * REQ-AI-204: 캐싱 로직
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    // REQ-AI-001: 인증 검증
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { recordId } = await params;

    // InBody 기록 존재 확인 및 권한 검증
    const record = await prisma.inBodyRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'InBody 기록을 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // REQ-AI-302: 다른 사용자 데이터 접근 차단
    if (record.userId !== session.user.id) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // REQ-AI-204: 저장된 분석 결과 조회
    const analysis = await getStoredAnalysis(recordId);

    if (!analysis) {
      return NextResponse.json(
        {
          error: '분석 결과가 없습니다',
          code: 'NOT_ANALYZED',
          message: 'AI 분석을 먼저 요청해 주세요',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analysis,
      cached: true, // REQ-AI-204: 캐시된 결과임을 표시
    });
  } catch (error) {
    console.error('[API] 분석 결과 조회 실패:', error);

    const errorMessage = error instanceof Error ? error.message : '조회에 실패했습니다';

    return NextResponse.json(
      {
        error: errorMessage,
        code: 'FETCH_FAILED',
      },
      { status: 500 }
    );
  }
}
