/**
 * 하이브리드 InBody 업로드 API
 * OCR + AI 결합 방식으로 이미지에서 데이터 추출
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { extractInBodyHybrid, type InBodyExtraction } from '@/lib/ai-service';

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
interface HybridUploadResponse {
  success: true;
  data: {
    id: string;
    extractedData: InBodyExtraction;
    method: 'ocr' | 'vision'; // 사용된 방식
  };
}

/**
 * POST /api/inbody/hybrid-upload
 * OCR + AI 하이브리드 방식으로 이미지에서 InBody 데이터 추출
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

    console.log('[Hybrid Upload] 이미지 수신, 사용자:', userId);

    // 3. 하이브리드 추출 실행 (OCR → AI 정제 → Vision fallback)
    console.log('[Hybrid Upload] 하이브리드 추출 시작...');
    const startTime = Date.now();

    const extractedData = await extractInBodyHybrid(imageBase64);

    const processingTime = Date.now() - startTime;
    console.log('[Hybrid Upload] 추출 완료, 소요 시간:', processingTime, 'ms');

    // 4. 데이터베이스 저장
    console.log('[Hybrid Upload] 데이터베이스 저장 시작...');
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
        smi: extractedData.smi,
        calorieNeeds: extractedData.dailyCalories ? Math.round(extractedData.dailyCalories) : null,
        bioimpedance: (() => {
          if (!extractedData.bioimpedance) return null;
          if (typeof extractedData.bioimpedance === 'object') {
            return JSON.stringify(extractedData.bioimpedance);
          }
          return String(extractedData.bioimpedance);
        })(),

        // OCR 메타데이터
        ocrConfidence: null, // 하이브리드 방식이므로 신뢰도 미측정
      },
    });

    console.log('[Hybrid Upload] 저장 완료, 레코드 ID:', record.id);

    // 5. 성공 응답
    const successResponse: HybridUploadResponse = {
      success: true,
      data: {
        id: record.id,
        extractedData,
        method: 'vision', // Vision fallback으로 표시 (실제로는 로그에서 확인 가능)
      },
    };

    return NextResponse.json(successResponse, { status: 200 });

  } catch (error) {
    console.error('[Hybrid Upload] 처리 실패:', error);

    const errorResponse: ApiErrorResponse = {
      error: '하이브리드 추출 실패',
      errorCode: 'HYBRID_ERROR',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
