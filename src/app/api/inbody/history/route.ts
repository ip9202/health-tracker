/**
 * GET /api/inbody/history
 * Measurement History API
 *
 * 사용자의 InBody 측정 기록을 최신순으로 반환
 * 페이지네이션 및 날짜 범위 필터 지원
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // 페이지네이션 파라미터 검증
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: '잘못된 페이지네이션 파라미터', errorCode: 'INVALID_PAGINATION' },
        { status: 400 },
      );
    }

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

    // 3. 전체 레코드 수 조회
    const total = await prisma.inBodyRecord.count({ where: whereClause });

    // 4. 기록 조회 (최신순)
    const records = await prisma.inBodyRecord.findMany({
      where: whereClause,
      orderBy: { measuredAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 5. 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        records: records.map(record => ({
          id: record.id,
          userId: record.userId,
          measuredAt: record.measuredAt,
          // 개인정보
          name: record.name,
          gender: record.gender,
          age: record.age,
          height: record.height,
          // 체성분 데이터
          weight: record.weight,
          bodyFatPercentage: record.bodyFatPercentage,
          muscle: record.muscle,
          skeletalMuscle: record.skeletalMuscle,
          // 신체 점수
          bodyScore: record.bodyScore,
          scoreDescription: record.scoreDescription,
          // 비만 판정
          bmi: record.bmi,
          bmiStatus: record.bmiStatus,
          // 신체 유형
          bodyType: record.bodyType,
          // OCR 메타데이터
          ocrConfidence: record.ocrConfidence,
          // 메타데이터
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        })),
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
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
