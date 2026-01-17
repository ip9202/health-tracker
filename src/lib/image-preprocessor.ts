/**
 * TASK-001: 이미지 전처리 모듈
 * SPEC-OCR-001: OCR 정확도 향상 (70% → 95%)
 *
 * Canvas API 기반 이미지 전처리
 * 브라우저 환경에서 실행됨
 */

import type { ImageQualityMetrics as Metrics } from './types/extraction';

/**
 * 전처리 옵션
 */
export interface PreprocessingOptions {
  grayscale?: boolean;
  contrast?: number; // 1.0 이상
  denoise?: boolean;
  binarize?: boolean;
  binarizeThreshold?: number; // 0-255
  correctRotation?: boolean;
}

/**
 * 전처리 결과
 */
export interface PreprocessingResult {
  processedCanvas: HTMLCanvasElement;
  metrics: Metrics;
  processingTimeMs: number;
}

/**
 * 기본 전처리 옵션
 */
const DEFAULT_OPTIONS: Required<PreprocessingOptions> = {
  grayscale: true,
  contrast: 1.2,
  denoise: true,
  binarize: false,
  binarizeThreshold: 128,
  correctRotation: true,
};

/**
 * 이미지를 그레이스케일로 변환
 *
 * @param canvas - 입력 캔버스
 * @returns 그레이스케일 캔버스
 */
export async function convertToGrayscale(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context를 가져올 수 없습니다');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 그레이스케일 변환: luminance method
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue; // 투명 픽셀 스킵

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 가중 평균 (인간의 시각 민감도 반영)
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) throw new Error('Output canvas context를 생성할 수 없습니다');

  outputCtx.putImageData(imageData, 0, 0);
  return outputCanvas;
}

/**
 * 이미지 대비 향상
 *
 * @param canvas - 입력 캔버스
 * @param factor - 대비 인자 (1.0 이상)
 * @returns 대비 향상 캔버스
 */
export async function enhanceContrast(
  canvas: HTMLCanvasElement,
  factor: number = 1.2,
): Promise<HTMLCanvasElement> {
  if (factor < 1) {
    throw new Error('대비 인자는 1.0 이상이어야 합니다');
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context를 가져올 수 없습니다');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 대비 향상 알고리즘
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      const value = data[i + j];
      // 128을 중심으로 대비 조정
      const newValue = Math.round(((value - 128) * factor) + 128);
      data[i + j] = Math.max(0, Math.min(255, newValue));
    }
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) throw new Error('Output canvas context를 생성할 수 없습니다');

  outputCtx.putImageData(imageData, 0, 0);
  return outputCanvas;
}

/**
 * 이미지 노이즈 감소 (Median Filter)
 *
 * @param canvas - 입력 캔버스
 * @returns 노이즈 감소 캔버스
 */
export async function reduceNoise(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context를 가져올 수 없습니다');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // 3x3 Median Filter
  const outputData = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const neighbors: number[] = [];

        // 3x3 윈도우에서 이웃 픽셀 수집
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4 + c;
            neighbors.push(data[idx]);
          }
        }

        // 중간값 찾기
        neighbors.sort((a, b) => a - b);
        const median = neighbors[Math.floor(neighbors.length / 2)];

        const idx = (y * width + x) * 4 + c;
        outputData[idx] = median;
      }
    }
  }

  const outputImageData = new ImageData(outputData, width, height);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) throw new Error('Output canvas context를 생성할 수 없습니다');

  outputCtx.putImageData(outputImageData, 0, 0);
  return outputCanvas;
}

/**
 * 이미지 이진화 (Black & White)
 *
 * @param canvas - 입력 캔버스
 * @param threshold - 임계값 (0-255)
 * @returns 이진화 캔버스
 */
export async function binarizeImage(
  canvas: HTMLCanvasElement,
  threshold: number = 128,
): Promise<HTMLCanvasElement> {
  if (threshold < 0 || threshold > 255) {
    throw new Error('임계값은 0-255 사이여야 합니다');
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context를 가져올 수 없습니다');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 이진화
  for (let i = 0; i < data.length; i += 4) {
    // 그레이스케일 값 계산
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);

    // 임계값 적용
    const binary = gray >= threshold ? 255 : 0;

    data[i] = binary;
    data[i + 1] = binary;
    data[i + 2] = binary;
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) throw new Error('Output canvas context를 생성할 수 없습니다');

  outputCtx.putImageData(imageData, 0, 0);
  return outputCanvas;
}

/**
 * 이미지 회전 감지 (Hough Transform 기반)
 *
 * @param canvas - 입력 캔버스
 * @returns 감지된 회전 각도 (도)
 */
export async function detectRotation(canvas: HTMLCanvasElement): Promise<number> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context를 가져올 수 없습니다');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // 엣지 검출 (Sobel 연산자)
  const edges: { x: number; y: number }[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const gray = data[idx];

      // Sobel 엣지 검출
      const gx =
        -data[((y - 1) * width + (x - 1)) * 4] +
        data[((y - 1) * width + (x + 1)) * 4] +
        -2 * data[(y * width + (x - 1)) * 4] +
        2 * data[(y * width + (x + 1)) * 4] +
        -data[((y + 1) * width + (x - 1)) * 4] +
        data[((y + 1) * width + (x + 1)) * 4];

      const gy =
        -data[((y - 1) * width + (x - 1)) * 4] +
        -2 * data[((y - 1) * width + x) * 4] +
        -data[((y - 1) * width + (x + 1)) * 4] +
        data[((y + 1) * width + (x - 1)) * 4] +
        2 * data[((y + 1) * width + x) * 4] +
        data[((y + 1) * width + (x + 1)) * 4];

      const magnitude = Math.sqrt(gx * gx + gy * gy);

      if (magnitude > 50) {
        edges.push({ x, y });
      }
    }
  }

  // Hough Transform으로 회전 각도 추정
  if (edges.length < 10) {
    return 0; // 엣지가 부족하면 회전 없음 가정
  }

  // 각도 히스토그램
  const angleBins = new Array<number>(180).fill(0);

  for (const edge of edges) {
    const angle = Math.atan2(edge.y - height / 2, edge.x - width / 2) * (180 / Math.PI);
    const bin = Math.floor((angle + 90) % 180);
    angleBins[bin]++;
  }

  // 가장 빈번한 각도 찾기
  const maxBin = angleBins.indexOf(Math.max(...angleBins));
  const detectedAngle = maxBin - 90;

  return detectedAngle;
}

/**
 * 이미지 회전 보정
 *
 * @param canvas - 입력 캔버스
 * @param angle - 회전 각도 (도)
 * @returns 회전 보정 캔버스
 */
export async function correctRotation(
  canvas: HTMLCanvasElement,
  angle: number,
): Promise<HTMLCanvasElement> {
  const radians = (angle * Math.PI) / 180;

  // 회전 후 크기 계산
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const newWidth = Math.ceil(canvas.width * cos + canvas.height * sin);
  const newHeight = Math.ceil(canvas.width * sin + canvas.height * cos);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = newWidth;
  outputCanvas.height = newHeight;
  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) throw new Error('Output canvas context를 생성할 수 없습니다');

  // 중심으로 이동 후 회전
  outputCtx.translate(newWidth / 2, newHeight / 2);
  outputCtx.rotate(-radians);
  outputCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  return outputCanvas;
}

/**
 * 이미지 품질 평가
 *
 * @param canvas - 입력 캔버스
 * @returns 품질 지표
 */
export async function calculateImageQuality(canvas: HTMLCanvasElement): Promise<Metrics> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context를 가져올 수 없습니다');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 밝기 계산
  let totalBrightness = 0;
  let minBrightness = 255;
  let maxBrightness = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue;

    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    totalBrightness += gray;
    minBrightness = Math.min(minBrightness, gray);
    maxBrightness = Math.max(maxBrightness, gray);
  }

  const pixelCount = data.length / 4;
  const avgBrightness = totalBrightness / pixelCount;

  // 대비 계산
  const contrast = maxBrightness - minBrightness;

  // 선명도 계산 (Laplacian variance)
  let sharpnessSum = 0;
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const idx = (y * canvas.width + x) * 4;
      const gray = data[idx];

      const neighbors = [
        data[((y - 1) * canvas.width + x) * 4],
        data[((y + 1) * canvas.width + x) * 4],
        data[(y * canvas.width + (x - 1)) * 4],
        data[(y * canvas.width + (x + 1)) * 4],
      ];

      const laplacian = 4 * gray - neighbors.reduce((a, b) => a + b, 0);
      sharpnessSum += laplacian * laplacian;
    }
  }

  const sharpness = Math.min(sharpnessSum / (pixelCount * 10000), 1);

  // 노이즈 레벨 (간단한 추정)
  const noiseLevel = 0.1; // 기본값

  // 전체 품질 점수 계산
  let overallScore = 50; // 기본 점수

  // 밝기 점수 (100-150 사이가 최적)
  const brightnessScore = 100 - Math.abs(avgBrightness - 125) * 2;
  overallScore += brightnessScore * 0.3;

  // 대비 점수
  const contrastScore = Math.min(contrast / 2, 50);
  overallScore += contrastScore * 0.3;

  // 선명도 점수
  const sharpnessScore = sharpness * 50;
  overallScore += sharpnessScore * 0.4;

  overallScore = Math.max(0, Math.min(100, overallScore));

  return {
    overallScore: Math.round(overallScore),
    brightness: Math.round(avgBrightness),
    contrast: Math.round(contrast),
    sharpness,
    noiseLevel,
    resolution: {
      width: canvas.width,
      height: canvas.height,
    },
    fileSize: 0, // File API 필요
    format: 'image/png',
  };
}

/**
 * 전체 전처리 파이프라인
 *
 * @param canvas - 입력 캔버스
 * @param options - 전처리 옵션
 * @returns 전처리 결과
 */
export async function preprocessImage(
  canvas: HTMLCanvasElement,
  options?: PreprocessingOptions,
): Promise<PreprocessingResult> {
  const startTime = Date.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  console.log('[Preprocess] 전처리 시작, 옵션:', opts);

  let processedCanvas = canvas;

  // 1. 그레이스케일
  if (opts.grayscale) {
    console.log('[Preprocess] 1. 그레이스케일 변환...');
    processedCanvas = await convertToGrayscale(processedCanvas);
  }

  // 2. 대비 향상
  if (opts.contrast > 1) {
    console.log('[Preprocess] 2. 대비 향상 (factor:', opts.contrast, ')');
    processedCanvas = await enhanceContrast(processedCanvas, opts.contrast);
  }

  // 3. 노이즈 감소
  if (opts.denoise) {
    console.log('[Preprocess] 3. 노이즈 감소...');
    processedCanvas = await reduceNoise(processedCanvas);
  }

  // 4. 이진화 (선택적)
  if (opts.binarize) {
    console.log('[Preprocess] 4. 이진화 (threshold:', opts.binarizeThreshold, ')');
    processedCanvas = await binarizeImage(processedCanvas, opts.binarizeThreshold);
  }

  // 5. 회전 보정
  if (opts.correctRotation) {
    console.log('[Preprocess] 5. 회전 감지 및 보정...');
    const rotation = await detectRotation(processedCanvas);
    console.log('[Preprocess] 감지된 회전각:', rotation.toFixed(2), '도');
    if (Math.abs(rotation) > 1) {
      processedCanvas = await correctRotation(processedCanvas, rotation);
      console.log('[Preprocess] 회전 보정 완료');
    }
  }

  // 6. 품질 평가
  console.log('[Preprocess] 6. 품질 평가...');
  const metrics = await calculateImageQuality(processedCanvas);
  const processingTimeMs = Date.now() - startTime;

  console.log('[Preprocess] 전처리 완료:', {
    처리시간: processingTimeMs + 'ms',
    품질점수: metrics.overallScore.toFixed(1),
    밝기: metrics.brightness,
    대비: metrics.contrast,
    선명도: metrics.sharpness.toFixed(3),
  });

  return {
    processedCanvas,
    metrics,
    processingTimeMs,
  };
}
