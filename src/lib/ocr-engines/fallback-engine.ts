/**
 * Fallback OCR 엔진
 *
 * Google Vision API를 우선 시도하고, 실패 시 Tesseract.js로 폴백합니다.
 * 최대 2번의 재시도를 수행합니다.
 */

import { OcrEngine, OCRResult, OCREngineOptions, DEFAULT_ENGINE_OPTIONS } from './types';
import { GoogleVisionEngine, createGoogleVisionEngine } from './google-vision-engine';
import { TesseractEngine, createTesseractEngine } from './tesseract-engine';

/**
 * Fallback 엔진 설정
 */
export interface FallbackEngineOptions extends OCREngineOptions {
  /** Google Vision API 사용 여부 (기본값: true) */
  useGoogleVision?: boolean;
  /** 폴백 사용 여부 (기본값: true) */
  enableFallback?: boolean;
}

/**
 * Fallback OCR 엔진 구현
 *
 * Google Vision API를 우선 사용하고, 실패 시 Tesseract.js로 폴백합니다.
 */
export class FallbackEngine implements OcrEngine {
  private googleVision: GoogleVisionEngine | null = null;
  private tesseract: TesseractEngine;

  constructor(private options: FallbackEngineOptions = {}) {
    this.tesseract = createTesseractEngine();

    // Google Vision API 사용 가능한 경우 초기화
    if (options.useGoogleVision !== false) {
      const gvEngine = createGoogleVisionEngine();
      if (gvEngine.isAvailable()) {
        this.googleVision = gvEngine;
      }
    }
  }

  /**
   * 이미지에서 텍스트를 추출합니다 (Google Vision API 우선, 실패 시 Tesseract 폴백)
   *
   * @param imagePath - 이미지 Data URL 또는 경로
   * @param options - OCR 엔진 설정
   * @returns 추출된 텍스트와 신뢰도
   */
  async extractText(imagePath: string, options: OCREngineOptions = {}): Promise<OCRResult> {
    const opts = { ...DEFAULT_ENGINE_OPTIONS, ...options };
    const maxRetries = opts.maxRetries;

    // Google Vision API 사용 가능한 경우
    if (this.googleVision && this.options.useGoogleVision !== false) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[FallbackEngine] Google Vision API 시도 ${attempt + 1}/${maxRetries + 1}`);
          const result = await this.googleVision.extractText(imagePath, opts);
          console.log(`[FallbackEngine] Google Vision API 성공 (신뢰도: ${result.confidence.toFixed(2)}%)`);
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : '알 수 없는 오류';
          console.warn(`[FallbackEngine] Google Vision API 실패 (시도 ${attempt + 1}): ${message}`);

          // 마지막 시도인 경우 폴백
          if (attempt === maxRetries) {
            if (this.options.enableFallback !== false) {
              console.log('[FallbackEngine] Tesseract.js로 폴백');
              break;
            } else {
              throw error;
            }
          }
        }
      }
    }

    // Tesseract.js 폴백
    if (this.options.enableFallback !== false) {
      console.log('[FallbackEngine] Tesseract.js 사용');
      const result = await this.tesseract.extractText(imagePath, opts);
      console.log(`[FallbackEngine] Tesseract.js 성공 (신뢰도: ${result.confidence.toFixed(2)}%)`);
      return result;
    }

    throw new Error('OCR 처리 실패: Google Vision API와 Tesseract.js 모두 사용 불가');
  }

  /**
   * 모든 엔진 리소스를 정리합니다
   */
  async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];

    if (this.googleVision) {
      cleanupPromises.push(this.googleVision.cleanup());
    }

    cleanupPromises.push(this.tesseract.cleanup());

    await Promise.all(cleanupPromises);
  }

  /**
   * 엔진이 사용 가능한지 확인합니다
   */
  isAvailable(): boolean {
    // Google Vision API 또는 Tesseract.js 중 하나라도 사용 가능하면 true
    return (this.googleVision?.isAvailable() ?? false) || this.tesseract.isAvailable();
  }

  /**
   * 사용 가능한 엔진 목록을 반환합니다
   */
  getAvailableEngines(): string[] {
    const engines: string[] = [];

    if (this.googleVision?.isAvailable()) {
      engines.push('google-vision');
    }

    if (this.tesseract.isAvailable()) {
      engines.push('tesseract');
    }

    return engines;
  }
}

/**
 * Fallback 엔진 싱글톤 인스턴스를 생성합니다
 */
export function createFallbackEngine(options?: FallbackEngineOptions): FallbackEngine {
  return new FallbackEngine(options);
}
