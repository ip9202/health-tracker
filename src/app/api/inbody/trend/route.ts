/**
 * GET /api/inbody/trend
 * Body Composition Trend API
 *
 * 체중, 체지방률, 골격근량의 시계열 데이터 반환
 * 날짜 범위 필터 지원
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 0. 인증 검증
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다', errorCode: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    // 1. 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const metrics = searchParams.get('metrics') || 'weight,bodyFatPercentage,skeletalMuscle';

    // 2. 날짜 범위 필터 구성
    const whereClause: any = { userId };

    if (from || to) {
      whereClause.measuredAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { error: '잘못된 from 날짜 형식', errorCode: 'INVALID_DATE_FORMAT' },
            { status: 400 },
          );
        }
        whereClause.measuredAt.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
          return NextResponse.json(
            { error: '잘못된 to 날짜 형식', errorCode: 'INVALID_DATE_FORMAT' },
            { status: 400 },
          );
        }
        // 종료일은 하루 끝까지 포함
        toDate.setHours(23, 59, 59, 999);
        whereClause.measuredAt.lte = toDate;
      }
    }

    // 3. 기록 조회 (측정일 오름차순 - 차트용)
    const records = await prisma.inBodyRecord.findMany({
      where: whereClause,
      orderBy: { measuredAt: 'asc' },
      select: {
        measuredAt: true,
        weight: true,
        bodyFatPercentage: true,
        skeletalMuscle: true,
        muscle: true,
      },
    });

    // 4. 차트 데이터 포맷으로 변환
    const requestedMetrics = metrics.split(',') as Array<'weight' | 'bodyFatPercentage' | 'skeletalMuscle'>;

    const trendData = records.map(record => {
      const dataPoint: Record<string, string | number | null> = {
        date: record.measuredAt.toISOString().split('T')[0], // YYYY-MM-DD
      };

      if (requestedMetrics.includes('weight')) {
        dataPoint.weight = record.weight ?? null;
      }
      if (requestedMetrics.includes('bodyFatPercentage')) {
        dataPoint.bodyFatPercentage = record.bodyFatPercentage ?? null;
      }
      if (requestedMetrics.includes('skeletalMuscle')) {
        dataPoint.skeletalMuscle = record.skeletalMuscle ?? null;
      }

      return dataPoint;
    });

    // 5. 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        trend: trendData,
        metrics: requestedMetrics,
        count: trendData.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: '서버 오류',
        errorCode: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 },
    );
  }
}
