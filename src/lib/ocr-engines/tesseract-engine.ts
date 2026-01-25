/**
 * Tesseract.js OCR 엔진
 *
 * 클라이언트 사이드와 서버 사이드에서 모두 작동하는 OCR 엔진입니다.
 * 한국어와 영어 텍스트를 지원하며, 로컬에서 작동하여 API 비용이 발생하지 않습니다.
 */

import { createWorker } from 'tesseract.js';
import { OcrEngine, OCRResult, OCRError, OCREngineOptions, DEFAULT_ENGINE_OPTIONS } from './types';

/**
 * Tesseract Worker 캐싱 (재사용을 위해)
 */
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
 * Tesseract.js OCR 엔진 구현
 */
export class TesseractEngine implements OcrEngine {
  private initializing: Promise<void> | null = null;

  constructor() {
    // 비동기 초기화
    this.initializing = this.initialize();
  }

  /**
   * Worker를 초기화합니다
   */
  private async initialize(): Promise<void> {
    try {
      await getWorker();
    } catch (error) {
      throw new Error(`Tesseract 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 이미지에서 텍스트를 추출합니다
   *
   * @param imagePath - 이미지 Data URL 또는 경로
   * @param options - OCR 엔진 설정
   * @returns 추출된 텍스트와 신뢰도
   */
  async extractText(imagePath: string, options: OCREngineOptions = {}): Promise<OCRResult> {
    const opts = { ...DEFAULT_ENGINE_OPTIONS, ...options };

    // 초기화 대기
    if (this.initializing) {
      await this.initializing;
      this.initializing = null;
    }

    try {
      // Worker 초기화
      const currentWorker = await getWorker();

      // 타임아웃 Promise 생성
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Tesseract timeout')), opts.timeout);
      });

      // OCR 처리 (타임아웃과 함께 실행)
      const result = await Promise.race([
        currentWorker.recognize(imagePath),
        timeoutPromise,
      ]) as { data: { text: string; confidence: number } };

      const text = result.data.text.trim();
      const confidence = result.data.confidence;

      // 텍스트가 없는 경우
      if (!text) {
        throw new Error('추출된 텍스트가 없음');
      }

      // 신뢰도 검증
      if (confidence < opts.minConfidence) {
        console.warn(`Tesseract 신뢰도가 낮습니다: ${confidence.toFixed(2)}% (최소: ${opts.minConfidence}%)`);
      }

      return {
        text,
        confidence,
        engine: 'tesseract',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';

      if (message.includes('timeout')) {
        throw new Error(`${OCRError.TIMEOUT}: Tesseract 타임아웃 (${opts.timeout}ms)`);
      }

      throw new Error(`${OCRError.FAILURE}: Tesseract 처리 실패 - ${message}`);
    }
  }

  /**
   * Worker를 종료합니다
   */
  async cleanup(): Promise<void> {
    if (worker) {
      await worker.terminate();
      worker = null;
    }
  }

  /**
   * 엔진이 사용 가능한지 확인합니다
   */
  isAvailable(): boolean {
    // Tesseract.js는 항상 사용 가능 (환경 변수 불필요)
    return true;
  }
}

/**
 * Tesseract 엔진 싱글톤 인스턴스를 생성합니다
 */
export function createTesseractEngine(): TesseractEngine {
  return new TesseractEngine();
}
