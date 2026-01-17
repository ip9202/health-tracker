/**
 * 클라이언트 측 OCR 서비스
 * 브라우저 환경에서 Tesseract.js를 사용하여 텍스트 추출
 * SPEC-DATA-002: 이미지에서 텍스트 추출
 */

import Tesseract, { PSM } from 'tesseract.js';
import { preprocessImage, PreprocessingOptions, calculateImageQuality } from './image-preprocessor';
import type { ImageQualityMetrics as Metrics } from './types/extraction';
import { PsmMode, calculateImageQuality as calculateOcrImageQuality, getRecommendedConfig } from './ocr-config';

/**
 * PsmMode를 Tesseract.js PSM 문자열로 변환
 */
function mapPsmModeToTesseract(psmMode: PsmMode): PSM {
  switch (psmMode) {
    case PsmMode.AUTO:
      return PSM.AUTO;
    case PsmMode.UNIFORM_BLOCK:
      return PSM.SINGLE_BLOCK;
    case PsmMode.SPARSE_TEXT:
      return PSM.SPARSE_TEXT;
    case PsmMode.RAW_LINE:
      return PSM.RAW_LINE;
    default:
      return PSM.AUTO;
  }
}

// 한국어 OCR 최적화 전처리 옵션
const DEFAULT_PREPROCESS_OPTIONS: Required<PreprocessingOptions> = {
  grayscale: true,
  contrast: 1.8, // 대비 강화 (1.2 → 1.8)
  denoise: true,
  binarize: true, // 이진화 활성화
  binarizeThreshold: 140, // 임계값 조정
  correctRotation: true,
};

/**
 * OCR 처리 결과
 */
export interface ClientOCRResult {
  text: string;
  confidence: number;
  qualityMetrics?: {
    before: Metrics;
    after: Metrics;
    improvement: number; // 품질 향상율 (%)
  };
}

/**
 * OCR 진행 상태
 */
export interface OCRProgress {
  status: string;
  progress: number; // 0-1
}

/**
 * OCR 처리 옵션
 */
export interface ClientOCROptions {
  language?: string; // 'kor', 'eng', 'kor+eng'
  preprocess?: boolean; // 전처리 활성화 여부 (기본값: true)
  preprocessOptions?: PreprocessingOptions; // 전처리 옵션
  returnQualityMetrics?: boolean; // 품질 지표 반환 여부
  onProgress?: (progress: OCRProgress) => void;
}

/**
 * 기본 옵션
 */
const DEFAULT_OPTIONS: Required<Pick<ClientOCROptions, 'language' | 'onProgress'>> & {
  preprocess: boolean;
  returnQualityMetrics: boolean;
} = {
  language: 'kor+eng',
  preprocess: true,
  returnQualityMetrics: false,
  onProgress: () => {},
};

/**
 * File을 HTMLCanvasElement로 변환
 *
 * @param file - 이미지 파일
 * @returns Canvas 엘리먼트
 */
async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context를 생성할 수 없습니다'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지 로딩 실패'));
    };

    img.src = url;
  });
}

/**
 * 품질 향상율 계산
 *
 * @param before - 전처리 전 품질 지표
 * @param after - 전처리 후 품질 지표
 * @returns 품질 향상율 (%)
 */
function calculateImprovement(before: Metrics, after: Metrics): number {
  return before.overallScore > 0
    ? ((after.overallScore - before.overallScore) / before.overallScore) * 100
    : 0;
}

/**
 * 이미지 전처리 수행
 *
 * @param canvas - 원본 캔버스
 * @param options - 전처리 옵션
 * @param returnQualityMetrics - 품질 지표 반환 여부
 * @param onProgress - 진행 상태 콜백
 * @returns 전처리된 캔버스와 품질 지표
 */
async function performPreprocessing(
  canvas: HTMLCanvasElement,
  options: PreprocessingOptions | undefined,
  returnQualityMetrics: boolean,
  onProgress: (progress: OCRProgress) => void,
): Promise<{
  processedCanvas: HTMLCanvasElement;
  beforeMetrics?: Metrics;
  afterMetrics: Metrics;
}> {
  // 전처리 전 진행 상태 보고
  onProgress({ status: 'preprocessing', progress: 0 });

  // 전처리 전 품질 측정
  let beforeMetrics: Metrics | undefined;
  if (returnQualityMetrics) {
    beforeMetrics = await calculateImageQuality(canvas);
  }

  // 전처리 실행 (옵션 병합)
  const mergedOptions = {
    ...DEFAULT_PREPROCESS_OPTIONS,
    ...options,
  };

  const result = await preprocessImage(canvas, mergedOptions);

  // 전처리 완료 진행 상태 보고
  onProgress({ status: 'preprocessing', progress: 1 });

  return {
    processedCanvas: result.processedCanvas,
    beforeMetrics,
    afterMetrics: result.metrics,
  };
}

/**
 * 이미지 파일에서 텍스트를 추출합니다 (클라이언트 측)
 *
 * @param file - 이미지 파일
 * @param options - OCR 옵션
 * @returns 추출된 텍스트와 신뢰도
 */
export async function extractTextFromImageClient(
  file: File,
  options: ClientOCROptions = {},
): Promise<ClientOCRResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  console.log('[Client OCR] === OCR 처리 시작 ===');
  console.log('[Client OCR] 파일명:', file.name, '크기:', (file.size / 1024).toFixed(2), 'KB');
  console.log('[Client OCR] 옵션:', {
    language: opts.language,
    preprocess: opts.preprocess,
    preprocessOptions: opts.preprocessOptions,
    returnQualityMetrics: opts.returnQualityMetrics,
  });

  try {
    // 파일을 Canvas로 변환
    const originalCanvas = await fileToCanvas(file);
    console.log('[Client OCR] 원본 이미지 크기:', originalCanvas.width, 'x', originalCanvas.height);

    // 전처리 수행
    let processedCanvas = originalCanvas;
    let beforeMetrics: Metrics | undefined;
    let afterMetrics: Metrics | undefined;

    if (opts.preprocess) {
      console.log('[Client OCR] 전처리 시작...');
      const preprocessResult = await performPreprocessing(
        originalCanvas,
        opts.preprocessOptions,
        opts.returnQualityMetrics,
        opts.onProgress,
      );

      processedCanvas = preprocessResult.processedCanvas;
      beforeMetrics = preprocessResult.beforeMetrics;
      afterMetrics = preprocessResult.afterMetrics;

      console.log('[Client OCR] 전처리 완료');
      if (opts.returnQualityMetrics && beforeMetrics && afterMetrics) {
        console.log('[Client OCR] 품질 비교:', {
          before: beforeMetrics.overallScore.toFixed(1),
          after: afterMetrics.overallScore.toFixed(1),
          improvement: calculateImprovement(beforeMetrics, afterMetrics).toFixed(1) + '%',
        });
      }
    } else {
      console.log('[Client OCR] 전처리 건너뜀 (preprocess=false)');
    }

    // 전처리된 이미지를 Data URL로 변환
    const imageUrl = processedCanvas.toDataURL('image/png');

    // 이미지 품질 기반 PSM 모드 결정
    let psmMode = PsmMode.AUTO; // 기본값
    if (afterMetrics) {
      // ocr-config의 calculateImageQuality 사용하여 품질 분석
      const qualityConfig = calculateOcrImageQuality({
        width: processedCanvas.width,
        height: processedCanvas.height,
        hasNoise: afterMetrics.noiseLevel > 0.15,
        contrast: afterMetrics.contrast > 200 ? 'high' : afterMetrics.contrast > 100 ? 'medium' : 'low',
        brightness: afterMetrics.brightness > 200 ? 'bright' : afterMetrics.brightness < 100 ? 'dark' : 'optimal',
        textDensity: 'uniform', // InBody 결과지는 균일한 레이아웃
      });

      const recommendedConfig = getRecommendedConfig(qualityConfig);
      psmMode = recommendedConfig.psmMode;

      console.log('[Client OCR] 품질 기반 PSM 모드 결정:', {
        qualityScore: qualityConfig.qualityScore,
        recommendedPsm: psmMode,
        confidenceThreshold: recommendedConfig.confidenceThreshold,
      });
    }

    // Tesseract.js worker 생성 및 실행
    console.log('[Client OCR] Worker 생성, PSM 모드:', psmMode);

    // Tesseract.js v7 API: createWorker(lang, oem, options)
    const worker = await Tesseract.createWorker(opts.language, 1, {
      logger: (m: { status: string; progress: number }) => {
        opts.onProgress({
          status: m.status,
          progress: m.progress,
        });
      },
    });

    // PSM 모드 설정 (Tesseract.js 파라미터)
    // PsmMode를 Tesseract.js PSM 문자열로 변환
    const tesseractPsm = mapPsmModeToTesseract(psmMode);
    try {
      await worker.setParameters({
        tessedit_pageseg_mode: tesseractPsm,
      });
      console.log('[Client OCR] PSM 모드 설정 완료:', tesseractPsm);
    } catch (e) {
      console.warn('[Client OCR] PSM 모드 설정 실패, 기본값 사용:', e);
    }

    // OCR 실행
    console.log('[Client OCR] Tesseract OCR 시작...');
    const result = await worker.recognize(imageUrl);

    // worker 종료
    await worker.terminate();

    // 메모리 정리
    URL.revokeObjectURL(imageUrl);

    const text = result.data.text.trim();
    const confidence = result.data.confidence;

    console.log('[Client OCR] OCR 결과:', {
      textLength: text.length,
      confidence: confidence.toFixed(2),
      preview: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
    });
    console.log('[Client OCR] === OCR 처리 완료 ===');

    // 결과 생성
    const baseResult: ClientOCRResult = {
      text,
      confidence,
    };

    // 품질 지표 추가
    if (opts.returnQualityMetrics && opts.preprocess && beforeMetrics && afterMetrics) {
      baseResult.qualityMetrics = {
        before: beforeMetrics,
        after: afterMetrics,
        improvement: calculateImprovement(beforeMetrics, afterMetrics),
      };
    }

    return baseResult;
  } catch (error) {
    console.error('[Client OCR] ❌ 오류 발생:', error);
    throw new Error(
      `OCR 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    );
  }
}

/**
 * OCR 상태 메시지 변환
 */
export function getStatusMessage(status: string): string {
  const statusMessages: Record<string, string> = {
    'preprocessing': '이미지 전처리 중...',
    'loading tesseract core': 'Tesseract 코어 로딩 중...',
    'initializing tesseract': 'Tesseract 초기화 중...',
    'initialized tesseract': 'Tesseract 초기화 완료',
    'loading language traineddata': '언어 데이터 로딩 중...',
    'loading language traineddata (from cache)': '언어 데이터 로딩 중 (캐시)...',
    'initializing api': 'API 초기화 중...',
    'recognizing text': '텍스트 인식 중...',
  };

  return statusMessages[status] || status;
}
