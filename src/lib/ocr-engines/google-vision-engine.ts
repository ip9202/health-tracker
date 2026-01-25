/**
 * Google Cloud Vision API OCR 엔진
 * 환경 변수 무시하고 항상 파일에서 직접 자격 증명 로드
 */

import vision from '@google-cloud/vision';
import { OcrEngine, OCRResult, OCRError, OCREngineOptions, DEFAULT_ENGINE_OPTIONS } from './types';
import * as fs from 'fs';
import * as path from 'path';

// vision 패키지 타입 정의
type ImageAnnotatorClient = any;

let visionClient: ImageAnnotatorClient | null = null;

// 강제로 자격 증명 파일에서 로드 (환경 변수 무시)
function loadCredentialsDirectly(): any {
  const credentialsPath = path.resolve(process.cwd(), 'google-credentials.json');
  
  console.log('[GoogleVisionEngine] Forcing credentials load from:', credentialsPath);
  
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`자격 증명 파일을 찾을 수 없습니다: ${credentialsPath}`);
  }
  
  const credentialsJson = fs.readFileSync(credentialsPath, 'utf-8');
  const credentials = JSON.parse(credentialsJson);
  
  console.log('[GoogleVisionEngine] Loaded project:', credentials.project_id);
  
  return credentials;
}

function getVisionClient(): any {
  if (visionClient) {
    return visionClient;
  }

  try {
    // 항상 파일에서 직접 로드 (환경 변수 무시)
    const credentials = loadCredentialsDirectly();
    
    // 명시적으로 자격 증명 전달
    visionClient = new (vision as any).ImageAnnotatorClient({
      credentials: credentials,
      projectId: credentials.project_id
    });

    return visionClient;
  } catch (error) {
    throw new Error(`Google Vision API 클라이언트 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// Data URL에서 base64 이미지 데이터 추출
function extractBase64FromDataUrl(dataUrl: string): string {
  const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('유효하지 않은 Data URL 형식');
  }
  return matches[2];
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
        const base64Data = extractBase64FromDataUrl(imagePath);
        imageSource = { image: { content: base64Data } };
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

      if (message.includes('Credentials') || message.includes('authentication') || message.includes('PERMISSION_DENIED') || message.includes('billing')) {
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
      const credentialsPath = path.resolve(process.cwd(), 'google-credentials.json');
      return fs.existsSync(credentialsPath);
    } catch {
      return false;
    }
  }
}

export function createGoogleVisionEngine(): GoogleVisionEngine {
  return new GoogleVisionEngine();
}
