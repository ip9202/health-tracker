/**
 * Google Cloud Vision API OCR 엔진
 */

import vision from '@google-cloud/vision';
import { OcrEngine, OCRResult, OCRError, OCREngineOptions, DEFAULT_ENGINE_OPTIONS } from './types';

// vision 패키지 타입 정의
type ImageAnnotatorClient = any;

let visionClient: ImageAnnotatorClient | null = null;

function parseCredentials(base64Credentials: string): any {
  try {
    const jsonCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    return JSON.parse(jsonCredentials);
  } catch (error) {
    throw new Error(`Google Cloud Credentials 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

function getVisionClient(): any {
  if (visionClient) {
    return visionClient;
  }

  const base64Credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    if (base64Credentials) {
      const credentials = parseCredentials(base64Credentials);
      visionClient = new (vision as any).ImageAnnotatorClient({ credentials });
    } else if (credentialsPath) {
      visionClient = new (vision as any).ImageAnnotatorClient();
    } else {
      visionClient = new (vision as any).ImageAnnotatorClient();
    }

    return visionClient;
  } catch (error) {
    throw new Error(`Google Vision API 클라이언트 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('유효하지 않은 Data URL 형식');
  }

  return Buffer.from(matches[2], 'base64');
}

export class GoogleVisionEngine implements OcrEngine {
  private client: any;

  constructor() {
    this.client = getVisionClient();
  }

  async extractText(imagePath: string, options: OCREngineOptions = {}): Promise<OCRResult> {
    const opts = { ...DEFAULT_ENGINE_OPTIONS, ...options };

    try {
      let imageSource: any;

      if (imagePath.startsWith('data:')) {
        const buffer = dataUrlToBuffer(imagePath);
        imageSource = { content: buffer.toString('base64') };
      } else {
        imageSource = { source: { filename: imagePath } };
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Google Vision API timeout')), opts.timeout);
      });

      const [result] = await Promise.race([
        this.client.documentTextDetection(imageSource),
        timeoutPromise,
      ]);

      if (!result || !result.fullTextAnnotation) {
        throw new Error('Google Vision API에서 텍스트를 찾을 수 없음');
      }

      const fullTextAnnotation = result.fullTextAnnotation;
      const text = fullTextAnnotation.text || '';

      if (!text.trim()) {
        throw new Error('추출된 텍스트가 없음');
      }

      const confidence = fullTextAnnotation.pages?.[0]?.confidence ?? 95;
      const confidencePercent = confidence * 100;

      if (confidencePercent < opts.minConfidence) {
        console.warn(`Google Vision API 신뢰도가 낮습니다: ${confidencePercent.toFixed(2)}% (최소: ${opts.minConfidence}%)`);
      }

      return {
        text: text.trim(),
        confidence: confidencePercent,
        engine: 'google-vision',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';

      if (message.includes('timeout')) {
        throw new Error(`${OCRError.TIMEOUT}: Google Vision API 타임아웃 (${opts.timeout}ms)`);
      }

      if (message.includes('Credentials') || message.includes('authentication')) {
        throw new Error(`${OCRError.NOT_CONFIGURED}: Google Cloud 인증 실패 - ${message}`);
      }

      throw new Error(`${OCRError.FAILURE}: Google Vision API 처리 실패 - ${message}`);
    }
  }

  async cleanup(): Promise<void> {
    visionClient = null;
  }

  isAvailable(): boolean {
    try {
      const hasCredentials = process.env.GOOGLE_CLOUD_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS;
      return hasCredentials !== undefined;
    } catch {
      return false;
    }
  }
}

export function createGoogleVisionEngine(): GoogleVisionEngine {
  return new GoogleVisionEngine();
}
