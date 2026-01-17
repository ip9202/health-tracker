/**
 * TAG-DATA-TASK-004: Tesseract.js OCR 서비스 구현
 * SPEC-DATA-002: 이미지에서 텍스트 추출
 * 환경: Next.js API Routes (Node.js)
 */

import { createWorker } from 'tesseract.js';

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
  maxRetries: 1, // Node.js 환경에서는 재시도 줄임
  minConfidence: 30, // 신뢰도 낮춤 (테스트용)
};

// Worker 캐싱 (재사용을 위해)
let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

/**
 * Worker를 초기화합니다
 */
async function getWorker() {
  if (!worker) {
    worker = await createWorker('kor+eng', 1, {
      logger: () => {}, // 로그 비활성화
    });
  }
  return worker;
}

/**
 * Worker를 종료합니다
 */
export async function cleanupWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

/**
 * 이미지에서 텍스트를 추출합니다 (Node.js 환경용)
 *
 * @param imagePath - 이미지 Data URL 또는 경로
 * @param options - OCR 서비스 설정
 * @returns 추출된 텍스트와 신뢰도
 */
export async function extractTextFromImage(
  imagePath: string,
  options: OCRServiceOptions = {},
): Promise<OCRResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Worker 초기화
    const worker = await getWorker();

    // 타임아웃 Promise 생성
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OCR timeout')), opts.timeout);
    });

    // OCR 처리 (타임아웃과 함께 실행)
    const result = await Promise.race([
      worker.recognize(imagePath),
      timeoutPromise,
    ]);

    const text = result.data.text.trim();
    const confidence = result.data.confidence;

    // 신뢰도 검증
    if (confidence < opts.minConfidence) {
      console.warn(`OCR 신뢰도가 낮습니다: ${confidence.toFixed(2)}% (최소: ${opts.minConfidence}%)`);
    }

    return {
      text,
      confidence,
    };
  } catch (error) {
    throw new Error(`OCR 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
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
