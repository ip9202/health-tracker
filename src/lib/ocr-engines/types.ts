/**
 * OCR 엔진 추상화 레이어
 *
 * Google Vision API와 Tesseract.js를 위한 공통 인터페이스를 제공합니다.
 */

/**
 * OCR 처리 결과
 */
export interface OCRResult {
  /** 추출된 텍스트 */
  text: string;
  /** 신뢰도 (0-100) */
  confidence: number;
  /** 사용된 엔진 */
  engine: 'google-vision' | 'tesseract';
}

/**
 * OCR 처리 오류 유형
 */
export enum OCRError {
  TIMEOUT = 'OCR_TIMEOUT',
  FAILURE = 'OCR_FAILURE',
  LOW_CONFIDENCE = 'OCR_LOW_CONFIDENCE',
  INVALID_INPUT = 'OCR_INVALID_INPUT',
  NOT_CONFIGURED = 'OCR_NOT_CONFIGURED',
}

/**
 * OCR 엔진 설정
 */
export interface OCREngineOptions {
  /** 타임아웃 (ms) */
  timeout?: number;
  /** 최대 재시도 횟수 */
  maxRetries?: number;
  /** 최소 신뢰도 (0-100) */
  minConfidence?: number;
}

/**
 * OCR 엔진 인터페이스
 *
 * 모든 OCR 엔진 구현체는 이 인터페이스를 따라야 합니다.
 */
export interface OcrEngine {
  /**
   * 이미지에서 텍스트를 추출합니다
   *
   * @param imagePath - 이미지 Data URL 또는 파일 경로
   * @param options - OCR 엔진 설정
   * @returns 추출된 텍스트와 신뢰도
   * @throws {OCRError} OCR 처리 실패 시
   */
  extractText(imagePath: string, options?: OCREngineOptions): Promise<OCRResult>;

  /**
   * 엔진 리소스를 정리합니다
   *
   * Worker 연결을 종료하고 캐시를 정리합니다.
   */
  cleanup(): Promise<void>;

  /**
   * 엔진이 사용 가능한지 확인합니다
   *
   * @returns 엔진 사용 가능 여부
   */
  isAvailable(): boolean | Promise<boolean>;
}

/**
 * OCR 엔진 기본 설정
 */
export const DEFAULT_ENGINE_OPTIONS: Required<OCREngineOptions> = {
  timeout: 30000, // 30초
  maxRetries: 2,
  minConfidence: 30,
};
