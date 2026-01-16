/**
 * TASK-001: 이미지 전처리 모듈 테스트
 * SPEC-OCR-001: OCR 정확도 향상 (70% → 95%)
 *
 * TDD RED 단계: 실패하는 테스트 먼저 작성
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  convertToGrayscale,
  enhanceContrast,
  reduceNoise,
  binarizeImage,
  detectRotation,
  correctRotation,
  calculateImageQuality,
  preprocessImage,
  type PreprocessingOptions,
  type ImageQualityMetrics,
} from '@/lib/image-preprocessor';

describe('이미지 전처리 - Grayscale 변환', () => {
  it('이미지를 grayscale로 변환해야 한다', async () => {
    // 테스트용 캔버스 생성
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // 빨간색 사각형 그리기
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(0, 0, 100, 100);

    const grayscaleCanvas = await convertToGrayscale(canvas);
    const grayscaleCtx = grayscaleCanvas.getContext('2d')!;
    const imageData = grayscaleCtx.getImageData(0, 0, 1, 1);

    // Grayscale 확인: R = G = B
    expect(imageData.data[0]).toBe(imageData.data[1]);
    expect(imageData.data[1]).toBe(imageData.data[2]);
  });

  it('투명 픽셀은 처리하지 않아야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d')!;

    // 투명 픽셀
    ctx.fillStyle = 'rgba(255, 0, 0, 0)';
    ctx.fillRect(0, 0, 10, 10);

    const grayscaleCanvas = await convertToGrayscale(canvas);
    const grayscaleCtx = grayscaleCanvas.getContext('2d')!;
    const imageData = grayscaleCtx.getImageData(0, 0, 1, 1);

    // 알파 값이 0이어야 함
    expect(imageData.data[3]).toBe(0);
  });
});

describe('이미지 전처리 - 대비 향상', () => {
  it('이미지의 대비를 향상시켜야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // 낮은 대비 이미지
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, 100, 100);

    const enhancedCanvas = await enhanceContrast(canvas, 1.5);
    expect(enhancedCanvas).toBeDefined();
    expect(enhancedCanvas.width).toBe(100);
    expect(enhancedCanvas.height).toBe(100);
  });

  it('대비 인자가 1 미만이면 에러를 발생시켜야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    await expect(enhanceContrast(canvas, 0.5)).rejects.toThrow();
  });
});

describe('이미지 전처리 - 노이즈 감소', () => {
  it('이미지의 노이즈를 감소시켜야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, 100, 100);

    const denoisedCanvas = await reduceNoise(canvas);
    expect(denoisedCanvas).toBeDefined();
    expect(denoisedCanvas.width).toBe(100);
    expect(denoisedCanvas.height).toBe(100);
  });
});

describe('이미지 전처리 - 이진화', () => {
  it('이미지를 이진화(흑백)해야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // 회색 톤
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, 100, 100);

    const binaryCanvas = await binarizeImage(canvas, 128);
    const binaryCtx = binaryCanvas.getContext('2d')!;
    const imageData = binaryCtx.getImageData(50, 50, 1, 1);

    // 픽셀은 순 흑색 또는 순 백색이어야 함
    const isBlack = imageData.data[0] === 0;
    const isWhite = imageData.data[0] === 255;
    expect(isBlack || isWhite).toBe(true);
  });

  it('임계값이 0-255 범위를 벗어나면 에러를 발생시켜야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    await expect(binarizeImage(canvas, 300)).rejects.toThrow();
  });
});

describe('이미지 전처리 - 회전 감지 및 보정', () => {
  it('텍스트 라인을 기반으로 회전을 감지해야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // 수평선 그리기 (회전 없음)
    ctx.fillStyle = 'black';
    ctx.fillRect(20, 50, 160, 2);

    const rotation = await detectRotation(canvas);
    expect(rotation).toBeCloseTo(0, 1); // 0도 근처
  });

  it('회전을 보정해야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 100, 100);

    const correctedCanvas = await correctRotation(canvas, 5); // 5도 회전 보정
    expect(correctedCanvas).toBeDefined();
  });
});

describe('이미지 품질 평가', () => {
  it('이미지 품질 점수를 계산해야 한다 (0-100)', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    // 고품질 이미지
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.fillText('Test', 50, 50);

    const metrics = await calculateImageQuality(canvas);

    expect(metrics.overallScore).toBeGreaterThanOrEqual(0);
    expect(metrics.overallScore).toBeLessThanOrEqual(100);
    expect(metrics.brightness).toBeGreaterThanOrEqual(0);
    expect(metrics.brightness).toBeLessThanOrEqual(255);
    expect(metrics.sharpness).toBeGreaterThanOrEqual(0);
    expect(metrics.sharpness).toBeLessThanOrEqual(1);
  });

  it('어두운 이미지는 낮은 품질 점수를 받아야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // 매우 어두운 이미지
    ctx.fillStyle = 'rgb(10, 10, 10)';
    ctx.fillRect(0, 0, 100, 100);

    const metrics = await calculateImageQuality(canvas);

    // 어두운 이미지는 낮은 점수
    expect(metrics.overallScore).toBeLessThan(60);
  });

  it('밝은 이미지는 낮은 품질 점수를 받아야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // 매우 밝은 이미지
    ctx.fillStyle = 'rgb(245, 245, 245)';
    ctx.fillRect(0, 0, 100, 100);

    const metrics = await calculateImageQuality(canvas);

    // 밝은 이미지는 낮은 점수
    expect(metrics.overallScore).toBeLessThan(60);
  });
});

describe('전체 전처리 파이프라인', () => {
  it('모든 전처리 단계를 순서대로 실행해야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    // 테스트 이미지
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.fillStyle = 'black';
    ctx.font = '32px Arial';
    ctx.fillText('InBody Test 123', 100, 100);

    const options: PreprocessingOptions = {
      grayscale: true,
      contrast: 1.2,
      denoise: true,
      binarize: false,
      correctRotation: true,
    };

    const startTime = Date.now();
    const result = await preprocessImage(canvas, options);
    const processingTime = Date.now() - startTime;

    expect(result.processedCanvas).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.metrics.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.processingTimeMs).toBeLessThan(2000); // 2초 이내
    expect(processingTime).toBeLessThan(2000); // 2초 이내
  });

  it('옵션이 없으면 기본 전처리를 실행해야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, 100, 100);

    const result = await preprocessImage(canvas);

    expect(result.processedCanvas).toBeDefined();
    expect(result.metrics).toBeDefined();
  });

  it('모든 전처리가 비활성화되면 원본을 반환해야 한다', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, 100, 100);

    const options: PreprocessingOptions = {
      grayscale: false,
      contrast: 1,
      denoise: false,
      binarize: false,
      correctRotation: false,
    };

    const result = await preprocessImage(canvas, options);

    expect(result.processedCanvas).toBeDefined();
  });
});
