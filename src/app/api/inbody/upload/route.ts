/**
 * TAG-DATA-TASK-006: POST /api/inbody/upload 엔드포인트 구현
 * SPEC-DATA-005-01: 이미지 업로드 및 OCR 처리 파이프라인
 * 클라이언트 OCR: 브라우저에서 OCR 수행 후 텍스트만 서버 전송
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseInBodyData } from '@/lib/parser-service';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 0. 인증 검증 (SPEC-AUTH-001 통합)
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다', errorCode: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    // 1. 요청 타입 확인 (JSON 또는 FormData)
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // JSON 요청: 클라이언트 OCR 결과
      return await handleJSONUpload(request, userId);
    } else {
      // FormData 요청: 레거시 파일 업로드 (더미 데이터)
      return await handleFormDataUpload(request, userId);
    }
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

/**
 * JSON 요청 처리 (클라이언트 OCR 결과)
 */
async function handleJSONUpload(request: NextRequest, userId: string) {
  try {
    const body = await request.json();
    const { ocrText, ocrConfidence } = body;

    if (!ocrText) {
      return NextResponse.json(
        { error: 'OCR 텍스트가 없습니다', errorCode: 'NO_OCR_TEXT' },
        { status: 400 },
      );
    }

    // OCR 텍스트 파싱
    const parseResult = parseInBodyData(ocrText);

    // 데이터베이스 저장
    return await saveInBodyRecord(userId, parseResult, ocrConfidence || 0);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'JSON 처리 실패',
        errorCode: 'JSON_PARSE_ERROR',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 400 },
    );
  }
}

/**
 * FormData 요청 처리 (레거시 - 더미 데이터)
 */
async function handleFormDataUpload(request: NextRequest, userId: string) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: '파일이 없습니다', errorCode: 'NO_FILE' },
      { status: 400 },
    );
  }

  // TODO: 파일 검증 로직 (필요시 추가)

  // 빈 텍스트로 파싱 (더미 데이터 반환)
  const parseResult = parseInBodyData('');

  return await saveInBodyRecord(userId, parseResult, 0);
}

/**
 * InBody 기록 저장 공통 함수
 */
async function saveInBodyRecord(
  userId: string,
  parseResult: ReturnType<typeof parseInBodyData>,
  ocrConfidence: number,
) {
  try {
    const inbodyRecord = await prisma.inBodyRecord.create({
      data: {
        userId,
        measuredAt: parseResult.data.measuredAt || new Date(),
        // 개인정보
        name: parseResult.data.name,
        gender: parseResult.data.gender,
        age: parseResult.data.age,
        height: parseResult.data.height,
        // 체성분 데이터
        weight: parseResult.data.weight,
        bodyFatPercentage: parseResult.data.bodyFatPercentage,
        muscle: parseResult.data.muscle,
        protein: parseResult.data.protein,
        bodyWater: parseResult.data.bodyWater,
        skeletalMuscle: parseResult.data.skeletalMuscle,
        // 신체 점수
        bodyScore: parseResult.data.bodyScore,
        scoreDescription: parseResult.data.scoreDescription,
        // 비만 판정
        bmi: parseResult.data.bmi,
        bmiStatus: parseResult.data.bmiStatus,
        // 체중 조절
        weightControl: parseResult.data.weightControl,
        // 신체 유형
        bodyType: parseResult.data.bodyType,
        // 기타 지표
        calorieNeeds: parseResult.data.calorieNeeds,
        // OCR 메타데이터
        ocrConfidence: ocrConfidence,
      },
    });

    // REQ-AI-101: InBody 기록 저장 후 AI 분석 자동 트리거
    setImmediate(async () => {
      try {
        const { analyzeWithAI } = await import('@/lib/ai-service');
        await analyzeWithAI(parseResult.data);
      } catch (aiError) {
        console.error('[AI Analysis] Background task failed:', aiError);
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: inbodyRecord.id,
          measuredAt: inbodyRecord.measuredAt,
          extractedData: parseResult.data,
          ocrConfidence: ocrConfidence,
          warnings: parseResult.warnings,
          analysisPending: true,
        },
      },
      { status: 201 },
    );
  } catch (dbError) {
    return NextResponse.json(
      {
        error: '데이터베이스 저장 실패',
        errorCode: 'DB_FAILURE',
        details: dbError instanceof Error ? dbError.message : '알 수 없는 오류',
      },
      { status: 500 },
    );
  }
}
