/**
 * TASK-008: Client OCR 전처리 통합 테스트
 * SPEC-DATA-002: 이미지에서 텍스트 추출
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractTextFromImageClient,
  getStatusMessage,
  ClientOCRResult,
  ClientOCROptions,
  OCRProgress,
} from '@/lib/client-ocr';
import { preprocessImage, PreprocessingOptions, calculateImageQuality } from '@/lib/image-preprocessor';
import type { ImageQualityMetrics } from '@/lib/types/extraction';

// Tesseract.js 모킹 - vitest.setup.ts에서 정의된 mock 사용
vi.mock('tesseract.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('tesseract.js')>();
  return {
    ...actual,
  };
});

import Tesseract from 'tesseract.js';

// Image Preprocessor 모킹
vi.mock('@/lib/image-preprocessor', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/image-preprocessor')>();
  return {
    ...actual,
    preprocessImage: vi.fn(),
    calculateImageQuality: vi.fn(),
  };
});

describe('Client OCR 전처리 통합 (TASK-008)', () => {
  let mockFile: File;
  let mockCanvas: HTMLCanvasElement;
  let mockWorker: any;
  let mockBeforeMetrics: ImageQualityMetrics;
  let mockAfterMetrics: ImageQualityMetrics;

  beforeEach(() => {
    // 모킹 환경 설정
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    const ctx = mockCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = 'black';
      ctx.font = '24px Arial';
      ctx.fillText('Test Text', 100, 100);
    }

    // Mock File
    mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Mock Tesseract Worker
    mockWorker = {
      recognize: vi.fn().mockResolvedValue({
        data: {
          text: 'Extracted Text',
          confidence: 95,
        },
      }),
      terminate: vi.fn().mockResolvedValue(undefined),
    };

    (Tesseract.createWorker as any).mockResolvedValue(mockWorker);

    // Mock 품질 지표
    mockBeforeMetrics = {
      overallScore: 70,
      brightness: 100,
      contrast: 150,
      sharpness: 0.6,
      noiseLevel: 0.2,
      resolution: { width: 800, height: 600 },
      fileSize: 50000,
      format: 'image/jpeg',
    };

    mockAfterMetrics = {
      overallScore: 92,
      brightness: 128,
      contrast: 220,
      sharpness: 0.85,
      noiseLevel: 0.05,
      resolution: { width: 800, height: 600 },
      fileSize: 50000,
      format: 'image/jpeg',
    };

    // preprocessImage 모킹
    (preprocessImage as any).mockResolvedValue({
      processedCanvas: mockCanvas,
      metrics: mockAfterMetrics,
      processingTimeMs: 150,
    });

    // calculateImageQuality 모킹
    (calculateImageQuality as any).mockResolvedValue(mockBeforeMetrics);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('전처리 기능 통합', () => {
    it('전처리 활성화 시 preprocessImage가 호출되어야 함', async () => {
      // Arrange
      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: true,
      };

      // Act
      const result = await extractTextFromImageClient(mockFile, options);

      // Assert
      expect(preprocessImage).toHaveBeenCalled();
      expect(result.text).toBe('Extracted Text');
      expect(result.confidence).toBe(95);
    });

    it('전처리 비활성화 시 preprocessImage가 호출되지 않아야 함', async () => {
      // Arrange
      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: false,
      };

      // Act
      const result = await extractTextFromImageClient(mockFile, options);

      // Assert
      expect(preprocessImage).not.toHaveBeenCalled();
      expect(result.text).toBe('Extracted Text');
    });

    it('기본 동작은 전처리를 활성화해야 함', async () => {
      // Act (옵션 없이 호출)
      const result = await extractTextFromImageClient(mockFile);

      // Assert
      expect(preprocessImage).toHaveBeenCalled();
      expect(result.text).toBe('Extracted Text');
    });
  });

  describe('전처리 옵션 전달', () => {
    it('전처리 옵션이 preprocessImage에 전달되어야 함', async () => {
      // Arrange
      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: true,
        preprocessOptions: {
          grayscale: true,
          contrast: 1.5,
          denoise: true,
          binarize: false,
        },
      };

      // Act
      await extractTextFromImageClient(mockFile, options);

      // Assert
      expect(preprocessImage).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          grayscale: true,
          contrast: 1.5,
          denoise: true,
          binarize: false,
        })
      );
    });

    it('일부 전처리 옵션만 제공 시 나머지는 기본값 사용', async () => {
      // Arrange
      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: true,
        preprocessOptions: {
          grayscale: false,
        },
      };

      // Act
      await extractTextFromImageClient(mockFile, options);

      // Assert
      expect(preprocessImage).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          grayscale: false,
          contrast: expect.any(Number),
          denoise: expect.any(Boolean),
        })
      );
    });
  });

  describe('품질 비교 (전후)', () => {
    it('전처리 전후 품질 지표를 반환해야 함', async () => {
      // Arrange
      (preprocessImage as any).mockResolvedValueOnce({
        processedCanvas: mockCanvas,
        metrics: {
          overallScore: 92,
          brightness: 128,
          contrast: 220,
          sharpness: 0.85,
          noiseLevel: 0.05,
          resolution: { width: 800, height: 600 },
          fileSize: 50000,
          format: 'image/jpeg',
        },
        processingTimeMs: 150,
      });

      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: true,
        returnQualityMetrics: true,
      };

      // Act
      const result = await extractTextFromImageClient(mockFile, options);

      // Assert
      expect(result.qualityMetrics).toBeDefined();
      expect(result.qualityMetrics!.before).toBeDefined();
      expect(result.qualityMetrics!.after).toBeDefined();
      expect(result.qualityMetrics!.after.overallScore).toBeGreaterThan(
        result.qualityMetrics!.before.overallScore
      );
    });

    it('품질 향상율을 계산해야 함', async () => {
      // Arrange
      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: true,
        returnQualityMetrics: true,
      };

      // Act
      const result = await extractTextFromImageClient(mockFile, options);

      // Assert
      expect(result.qualityMetrics).toBeDefined();
      expect(result.qualityMetrics!.improvement).toBeDefined();
      expect(result.qualityMetrics!.improvement).toBeGreaterThan(0);
    });
  });

  describe('진행 상태 콜백', () => {
    it('전처리 단계가 진행 상태 콜백에 포함되어야 함', async () => {
      // Arrange
      const progressStages: string[] = [];
      const onProgress = vi.fn((progress: OCRProgress) => {
        progressStages.push(progress.status);
      });

      vi.spyOn({ preprocessImage }, 'preprocessImage').mockResolvedValue({
        processedCanvas: mockCanvas,
        metrics: {
          overallScore: 85,
          brightness: 120,
          contrast: 200,
          sharpness: 0.7,
          noiseLevel: 0.1,
          resolution: { width: 800, height: 600 },
          fileSize: 50000,
          format: 'image/jpeg',
        },
        processingTimeMs: 100,
      });

      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: true,
        onProgress,
      };

      // Act
      await extractTextFromImageClient(mockFile, options);

      // Assert
      expect(onProgress).toHaveBeenCalled();
      expect(progressStages).toContain('preprocessing');
    });

    it('진행 상태 콜백이 전처리 완료를 보고해야 함', async () => {
      // Arrange
      const progressUpdates: OCRProgress[] = [];
      const onProgress = vi.fn((progress: OCRProgress) => {
        progressUpdates.push(progress);
      });

      vi.spyOn({ preprocessImage }, 'preprocessImage').mockResolvedValue({
        processedCanvas: mockCanvas,
        metrics: {
          overallScore: 85,
          brightness: 120,
          contrast: 200,
          sharpness: 0.7,
          noiseLevel: 0.1,
          resolution: { width: 800, height: 600 },
          fileSize: 50000,
          format: 'image/jpeg',
        },
        processingTimeMs: 100,
      });

      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: true,
        onProgress,
      };

      // Act
      await extractTextFromImageClient(mockFile, options);

      // Assert
      const preprocessingUpdates = progressUpdates.filter(
        (p) => p.status === 'preprocessing'
      );
      expect(preprocessingUpdates.length).toBeGreaterThan(0);

      // 전처리 완료 시 진행률 1.0
      const completedUpdate = preprocessingUpdates.find((p) => p.progress === 1);
      expect(completedUpdate).toBeDefined();
    });
  });

  describe('API 호환성', () => {
    it('기존 옵션 없는 호출이 작동해야 함', async () => {
      // Arrange & Act
      const result = await extractTextFromImageClient(mockFile);

      // Assert
      expect(result.text).toBe('Extracted Text');
      expect(result.confidence).toBe(95);
    });

    it('기존 language 옵션이 작동해야 함', async () => {
      // Arrange
      const options: ClientOCROptions = {
        language: 'kor+eng',
      };

      // Act
      const result = await extractTextFromImageClient(mockFile, options);

      // Assert
      expect(Tesseract.createWorker).toHaveBeenCalledWith('kor+eng', 1, expect.any(Object));
      expect(result.text).toBe('Extracted Text');
    });

    it('기존 onProgress 옵션이 작동해야 함', async () => {
      // Arrange
      const onProgress = vi.fn();
      const options: ClientOCROptions = {
        language: 'eng',
        onProgress,
      };

      // Act
      await extractTextFromImageClient(mockFile, options);

      // Assert
      expect(onProgress).toHaveBeenCalled();
    });

    it('반환 타입이 ClientOCRResult와 호환되어야 함', async () => {
      // Arrange & Act
      const result = await extractTextFromImageClient(mockFile);

      // Assert
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('confidence');
      expect(typeof result.text).toBe('string');
      expect(typeof result.confidence).toBe('number');
    });
  });

  describe('에러 처리', () => {
    it('전처리 실패 시 적절한 에러를 반환해야 함', async () => {
      // Arrange
      (preprocessImage as any).mockRejectedValue(new Error('전처리 실패'));

      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: true,
      };

      // Act & Assert
      await expect(extractTextFromImageClient(mockFile, options)).rejects.toThrow('OCR 처리 실패');
    });

    it('전처리 비활성화 시 OCR 에러가 그대로 전파되어야 함', async () => {
      // Arrange
      mockWorker.recognize.mockRejectedValueOnce(new Error('OCR 실패'));
      const options: ClientOCROptions = {
        language: 'eng',
        preprocess: false,
      };

      // Act & Assert
      await expect(extractTextFromImageClient(mockFile, options)).rejects.toThrow('OCR 처리 실패');
    });
  });

  describe('getStatusMessage', () => {
    it('전처리 상태 메시지를 반환해야 함', () => {
      // Act
      const message = getStatusMessage('preprocessing');

      // Assert
      expect(message).toBe('이미지 전처리 중...');
    });

    it('알 수 없는 상태는 그대로 반환해야 함', () => {
      // Act
      const message = getStatusMessage('unknown status');

      // Assert
      expect(message).toBe('unknown status');
    });
  });
});
