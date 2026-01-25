/**
 * Vision 기반 InBody 업로드 API
 * GLM-4 Vision을 사용하여 이미지에서 직접 데이터 추출
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { extractInBodyFromImage, type InBodyExtraction } from '@/lib/ai-service';

/**
 * API 오류 응답 타입
 */
interface ApiErrorResponse {
  error: string;
  errorCode: string;
  details?: string;
}

/**
 * API 성공 응답 타입
 */
interface VisionUploadResponse {
  success: true;
  data: {
    id: string;
    extractedData: InBodyExtraction;
  };
}

/**
 * POST /api/inbody/vision-upload
 * GLM Vision으로 이미지에서 InBody 데이터 추출
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 인증 검증
    const session = await auth();
    if (!session?.user?.id) {
      const errorResponse: ApiErrorResponse = {
        error: '인증이 필요합니다',
        errorCode: 'UNAUTHORIZED',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userId = session.user.id;

    // 2. 요청 바디 파싱
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      const errorResponse: ApiErrorResponse = {
        error: '이미지 데이터가 필요합니다',
        errorCode: 'MISSING_IMAGE',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    console.log('[Vision Upload] 이미지 수신, 사용자:', userId);

    // 3. Vision API로 데이터 추출
    console.log('[Vision Upload] Vision API 호출 시작...');
    const extractedData = await extractInBodyFromImage(imageBase64);

    // 4. 데이터베이스 저장
    console.log('[Vision Upload] 데이터베이스 저장 시작...');
    const record = await prisma.inBodyRecord.create({
      data: {
        userId,
        // 개인정보
        name: extractedData.name,
        gender: extractedData.gender,
        age: extractedData.age,
        height: extractedData.height,
        measuredAt: extractedData.measuredAt ? new Date(extractedData.measuredAt) : new Date(),

        // 체성분 데이터
        weight: extractedData.weight,
        bodyFatPercentage: extractedData.bodyFatPercentage,
        muscle: extractedData.muscle,
        protein: extractedData.protein,
        bodyWater: extractedData.bodyWater,
        skeletalMuscle: extractedData.skeletalMuscle,

        // 신체 점수
        bodyScore: extractedData.bodyScore,
        scoreDescription: extractedData.scoreDescription,

        // 비만 판정
        bmi: extractedData.bmi,
        bmiStatus: extractedData.bmiStatus,

        // 체중 조절
        weightControl: extractedData.weightControl !== undefined && extractedData.weightControl !== null
          ? String(extractedData.weightControl)
          : null,

        // 기타 지표
        calorieNeeds: extractedData.dailyCalories ? Math.round(extractedData.dailyCalories) : null,

        // OCR 메타데이터 (Vision 사용 표시)
        ocrConfidence: 100, // Vision은 높은 신뢰도
      },
    });

    console.log('[Vision Upload] 저장 완료, 레코드 ID:', record.id);

    // 5. 성공 응답
    const successResponse: VisionUploadResponse = {
      success: true,
      data: {
        id: record.id,
        extractedData,
      },
    };

    return NextResponse.json(successResponse, { status: 200 });

  } catch (error) {
    console.error('[Vision Upload] 처리 실패:', error);

    const errorResponse: ApiErrorResponse = {
      error: 'Vision 처리 실패',
      errorCode: 'VISION_ERROR',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
