/**
 * TAG-AI-005: AI 분석 API 엔드포인트
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템
 *
 * POST /api/health/analyze/[recordId]
 * InBody 기록에 대한 AI 분석 요청
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { analyzeHealthData } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';

/**
 * AI 분석 요청 처리
 * REQ-AI-001: 인증 검증
 * REQ-AI-101: 자동 트리거
 * REQ-AI-103: 재시도 로직 (ai-service.ts 내부)
 */
export async function POST(
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

    // 쿼리 파라미터 확인
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('force') === 'true';

    // 과거 기록 조회 (추이 분석용)
    const historicalRecords = await prisma.inBodyRecord.findMany({
      where: {
        userId: session.user.id,
        measuredAt: { lt: record.measuredAt },
      },
      orderBy: { measuredAt: 'desc' },
      take: 10,
    });

    // REQ-AI-101: AI 분석 실행
    const analysis = await analyzeHealthData(
      recordId,
      record,
      historicalRecords,
      forceRefresh
    );

    return NextResponse.json({
      success: true,
      analysisId: recordId,
      status: 'completed',
      result: analysis,
    });
  } catch (error) {
    console.error('[API] AI 분석 요청 실패:', error);

    const errorMessage = error instanceof Error ? error.message : '분석에 실패했습니다';

    return NextResponse.json(
      {
        error: errorMessage,
        code: 'ANALYSIS_FAILED',
        message: '다시 시도해 주세요',
      },
      { status: 500 }
    );
  }
}
