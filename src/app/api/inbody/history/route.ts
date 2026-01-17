/**
 * TAG-DATA-TASK-007: GET /api/inbody/history 엔드포인트 구현
 * SPEC-DATA-005-02: 사용자별 측정 기록 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 인증 검증 (SPEC-AUTH-001 통합)
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다', errorCode: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    // 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 기록 조회 (최신순) - 전체 필드 반환
    const records = await prisma.inBodyRecord.findMany({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // 전체 개수 조회
    const total = await prisma.inBodyRecord.count({
      where: { userId },
    });

    // InBodyData 형식으로 변환 (필드명 매핑)
    const mappedRecords = records.map((record) => ({
      ...record,
      // InBodyData 형식에 맞춰 필드명 변환
      bodyFat: record.bodyFatPercentage,
      weightChangeRecommendation: record.weightControl,
      dailyCalories: record.calorieNeeds,
      // imagePath 필드 추가 (데이터베이스에 없으므로 빈 문자열)
      imagePath: '',
    }));

    return NextResponse.json({
      records: mappedRecords,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: '기록 조회 실패',
        errorCode: 'QUERY_FAILURE',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 },
    );
  }
}
