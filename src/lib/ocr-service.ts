/**
 * OCR 서비스 (Google Vision API + Tesseract.js Fallback)
 */

import { FallbackEngine, createFallbackEngine } from './ocr-engines/fallback-engine';
import type { OCRResult, OCREngineOptions } from './ocr-engines/types';
import { OCRError } from './ocr-engines/types';

export type { OCRResult };
export { OCRError };

export interface OCRServiceOptions extends OCREngineOptions {
  useGoogleVision?: boolean;
  enableFallback?: boolean;
}

const DEFAULT_OPTIONS: Required<OCRServiceOptions> = {
  timeout: 30000,
  maxRetries: 2,
  minConfidence: 30,
  useGoogleVision: true,
  enableFallback: true,
};

let fallbackEngine: FallbackEngine | null = null;

function getFallbackEngine(options?: OCRServiceOptions): FallbackEngine {
  if (!fallbackEngine) {
    fallbackEngine = createFallbackEngine({
      useGoogleVision: options?.useGoogleVision,
      enableFallback: options?.enableFallback,
    });
  }
  return fallbackEngine;
}

export async function cleanupWorker() {
  if (fallbackEngine) {
    await fallbackEngine.cleanup();
    fallbackEngine = null;
  }
}

export async function extractTextFromImage(
  imagePath: string,
  options: OCRServiceOptions = {},
): Promise<OCRResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const engine = getFallbackEngine(opts);
    const result = await engine.extractText(imagePath, opts);

    if (result.confidence < opts.minConfidence) {
      console.warn(`OCR 신뢰도가 낮습니다: ${result.confidence.toFixed(2)}% (최소: ${opts.minConfidence}%)`);
    }

    return result;
  } catch (error) {
    throw new Error(`OCR 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

export function isLowConfidence(confidence: number, threshold: number = 50): boolean {
  return confidence < threshold;
}

export function hasMeaningfulText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  const meaningfulChars = trimmed.replace(/\s+/g, '');
  return meaningfulChars.length > 0;
}

export function getAvailableEngines(): string[] {
  const engine = getFallbackEngine();
  return (engine as any).getAvailableEngines?.() || ['tesseract'];
}
