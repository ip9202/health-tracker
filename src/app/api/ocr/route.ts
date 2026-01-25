/**
 * OCR API - Google Vision API를 사용한 텍스트 추출
 * Base64 이미지 직접 전송 방식
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/ocr-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 없습니다' },
        { status: 400 }
      );
    }

    // File을 Buffer로 변환 후 Base64 Data URL로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // OCR 처리 (Google Vision API 사용 - Data URL 직접 전송)
    const result = await extractTextFromImage(dataUrl, {
      useGoogleVision: true,
      minConfidence: 30,
      timeout: 30000,
    });

    return NextResponse.json({
      success: true,
      data: {
        text: result.text,
        confidence: result.confidence,
        engine: result.engine,
      },
    });
  } catch (error) {
    console.error('[OCR API] Error:', error);

    const message = error instanceof Error ? error.message : '알 수 없는 오류';

    return NextResponse.json(
      {
        success: false,
        error: message,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
