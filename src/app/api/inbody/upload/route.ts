/**
 * TAG-DATA-TASK-006: POST /api/inbody/upload 엔드포인트 구현
 * SPEC-DATA-005-01: 이미지 업로드 및 OCR 처리 파이프라인
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateImageFile, ImageValidationError } from '@/lib/image-validator';
import { extractTextFromImage } from '@/lib/ocr-service';
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

    // 1. FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다', errorCode: 'NO_FILE' },
        { status: 400 },
      );
    }

    // 2. 이미지 검증
    const validationResult = await validateImageFile(file);

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: validationResult.errorDetails,
          errorCode: validationResult.error,
        },
        { status: 400 },
      );
    }

    // 3. 파일 저장 (TODO: 실제 파일 시스템 또는 S3에 저장)
    // 현재는 메모리에서 처리

    // 4. OCR 처리
    let ocrResult;
    try {
      // 파일을 ArrayBuffer로 변환하여 Blob URL 생성
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const mimeType = file.type;
      const dataUrl = `data:${mimeType};base64,${base64}`;

      ocrResult = await extractTextFromImage(dataUrl);
    } catch (ocrError) {
      return NextResponse.json(
        {
          error: 'OCR 처리 실패',
          errorCode: 'OCR_FAILURE',
          details: ocrError instanceof Error ? ocrError.message : '알 수 없는 오류',
        },
        { status: 500 },
      );
    }

    // 5. 텍스트 파싱
    const parseResult = parseInBodyData(ocrResult.text);

    // 6. 데이터베이스 저장
    try {
      const inbodyRecord = await prisma.inBodyRecord.create({
        data: {
          userId,
          measuredAt: new Date(),
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
          // 생체 임피던스
          bioimpedance: parseResult.data.bioimpedance,
          // 기타 지표
          smi: parseResult.data.smi,
          calorieNeeds: parseResult.data.calorieNeeds,
          // 부위별 분석
          regionalAnalysis: parseResult.data.regionalAnalysis,
          // OCR 메타데이터
          ocrConfidence: ocrResult.confidence,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            id: inbodyRecord.id,
            measuredAt: inbodyRecord.measuredAt,
            extractedData: parseResult.data,
            ocrConfidence: ocrResult.confidence,
            warnings: parseResult.warnings,
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
