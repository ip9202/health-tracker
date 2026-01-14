/**
 * TAG-DATA-TASK-004: Tesseract.js OCR 서비스 구현
 * SPEC-DATA-002: 이미지에서 텍스트 추출
 */

import Tesseract from 'tesseract.js';

/**
 * OCR 처리 결과
 */
export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * OCR 처리 오류
 */
export enum OCRError {
  TIMEOUT = 'OCR_TIMEOUT',
  FAILURE = 'OCR_FAILURE',
  LOW_CONFIDENCE = 'OCR_LOW_CONFIDENCE',
}

/**
 * OCR 서비스 설정
 */
interface OCRServiceOptions {
  timeout?: number; // 타임아웃 (ms)
  maxRetries?: number; // 최대 재시도 횟수
  minConfidence?: number; // 최소 신뢰도 (0-100)
}

const DEFAULT_OPTIONS: Required<OCRServiceOptions> = {
  timeout: 30000, // 30초
  maxRetries: 3,
  minConfidence: 50,
};

/**
 * Tesseract.js OCR 서비스
 * SPEC-DATA-002: 이미지에서 텍스트 추출
 */

/**
 * 이미지에서 텍스트를 추출합니다
 *
 * @param imagePath - 이미지 파일 경로 또는 Buffer
 * @param options - OCR 서비스 설정
 * @returns 추출된 텍스트와 신뢰도
 */
export async function extractTextFromImage(
  imagePath: string,
  options: OCRServiceOptions = {},
): Promise<OCRResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let lastError: Error | null = null;

  // 재시도 로직
  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      // 타임아웃 Promise 생성
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('OCR timeout')), opts.timeout);
      });

      // OCR 처리
      const result = await Promise.race([
        Tesseract.recognize(imagePath, 'kor+eng', {
          logger: (m: { status: string; progress: number }) => {
            // 진행 상황 로그 (선택사항)
            if (m.status === 'recognizing text') {
              // console.log(`OCR 진행률: ${Math.round(m.progress * 100)}%`);
            }
          },
        }),
        timeoutPromise,
      ]);

      const text = result.data.text.trim();
      const confidence = result.data.confidence;

      // 신뢰도 검증
      if (confidence < opts.minConfidence) {
        throw new Error(
          `OCR 신뢰도가 낮습니다: ${confidence.toFixed(2)}% (최소: ${opts.minConfidence}%)`,
        );
      }

      return {
        text,
        confidence,
      };
    } catch (error) {
      lastError = error as Error;

      // 마지막 시도가 아니면 재시도
      if (attempt < opts.maxRetries) {
        // 지수 백오프 (2초, 4초, 8초...)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // 모든 재시도 실패
  throw new Error(`OCR 처리 실패: ${lastError?.message || '알 수 없는 오류'}`);
}

/**
 * OCR 신뢰도가 낮은지 확인합니다
 */
export function isLowConfidence(confidence: number, threshold: number = 50): boolean {
  return confidence < threshold;
}

/**
 * OCR 결과에서 유의미한 텍스트가 있는지 확인합니다
 */
export function hasMeaningfulText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;

  // 공백/개행만 있는지 확인
  const meaningfulChars = trimmed.replace(/\s+/g, '');
  return meaningfulChars.length > 0;
}
