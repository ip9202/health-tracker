/**
 * TASK-006: 타입 정의 및 Zod 스키마 테스트
 * SPEC-OCR-001: OCR 정확도 향상 (70% → 95%)
 *
 * TDD RED 단계: 실패하는 테스트 먼저 작성
 */

import { describe, it, expect } from 'vitest';
import {
  ExtractionAttempt,
  PatternDefinition,
  ImageQualityMetrics,
  ExtractionResult,
  validateExtractionAttempt,
  validatePatternDefinition,
  validateImageQualityMetrics,
  validateExtractionResult,
} from '@/lib/types/extraction';

describe('ExtractionAttempt 타입 및 Zod 스키마', () => {
  it('유효한 ExtractionAttempt를 생성하고 검증해야 한다', () => {
    const attempt: ExtractionAttempt = {
      patternId: 'body-score-001',
      patternName: '신체 점수 패턴 1',
      matchedText: '신체 점수 100 표준',
      extractedValue: '100',
      confidence: 95,
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };

    const result = validateExtractionAttempt(attempt);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.patternId).toBe('body-score-001');
      expect(result.data.confidence).toBe(95);
    }
  });

  it('patternId가 누락된 ExtractionAttempt는 검증에 실패해야 한다', () => {
    const invalidAttempt = {
      patternName: '신체 점수 패턴 1',
      matchedText: '신체 점수 100 표준',
      extractedValue: '100',
      confidence: 95,
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };

    const result = validateExtractionAttempt(invalidAttempt);
    expect(result.success).toBe(false);
  });

  it('confidence가 0-100 범위를 벗어나면 검증에 실패해야 한다', () => {
    const invalidAttempt = {
      patternId: 'body-score-001',
      patternName: '신체 점수 패턴 1',
      matchedText: '신체 점수 100 표준',
      extractedValue: '100',
      confidence: 150, // 100 초과
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };

    const result = validateExtractionAttempt(invalidAttempt);
    expect(result.success).toBe(false);
  });

  it('extractedValue가 누락되어도 검증에 실패해야 한다', () => {
    const invalidAttempt = {
      patternId: 'body-score-001',
      patternName: '신체 점수 패턴 1',
      matchedText: '신체 점수 100 표준',
      confidence: 95,
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };

    const result = validateExtractionAttempt(invalidAttempt);
    expect(result.success).toBe(false);
  });
});

describe('PatternDefinition 타입 및 Zod 스키마', () => {
  it('유효한 PatternDefinition을 생성하고 검증해야 한다', () => {
    const pattern: PatternDefinition = {
      id: 'body-score-inbody770',
      name: 'InBody 770 신체 점수 패턴',
      regex: /신체\s*점수[^표준]*?(\d{2,3})\s*표준/,
      priority: 1,
      description: 'InBody 770 기기의 신체 점수 추출',
      format: 'inbody770',
      examples: ['신체 점수 100 표준', '신체 점수 85 표준'],
    };

    const result = validatePatternDefinition(pattern);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('body-score-inbody770');
      expect(result.data.priority).toBe(1);
      expect(result.data.format).toBe('inbody770');
    }
  });

  it('priority가 1-10 범위를 벗어나면 검증에 실패해야 한다', () => {
    const invalidPattern = {
      id: 'body-score-inbody770',
      name: 'InBody 770 신체 점수 패턴',
      regex: /신체\s*점수[^표준]*?(\d{2,3})\s*표준/,
      priority: 15, // 10 초과
      description: 'InBody 770 기기의 신체 점수 추출',
      format: 'inbody770',
    };

    const result = validatePatternDefinition(invalidPattern);
    expect(result.success).toBe(false);
  });

  it('format이 지원되는 형식이 아니면 검증에 실패해야 한다', () => {
    const invalidPattern = {
      id: 'body-score-unknown',
      name: '알 수 없는 형식',
      regex: /some pattern/,
      priority: 1,
      description: '설명',
      format: 'unknown-format', // 지원되지 않는 형식
    };

    const result = validatePatternDefinition(invalidPattern);
    expect(result.success).toBe(false);
  });
});

describe('ImageQualityMetrics 타입 및 Zod 스키마', () => {
  it('유효한 ImageQualityMetrics를 생성하고 검증해야 한다', () => {
    const metrics: ImageQualityMetrics = {
      overallScore: 85,
      brightness: 200,
      contrast: 150,
      sharpness: 0.8,
      noiseLevel: 0.1,
      resolution: { width: 1920, height: 1080 },
      fileSize: 512000,
      format: 'image/jpeg',
    };

    const result = validateImageQualityMetrics(metrics);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overallScore).toBe(85);
      expect(result.data.brightness).toBe(200);
      expect(result.data.sharpness).toBe(0.8);
    }
  });

  it('overallScore가 0-100 범위를 벗어나면 검증에 실패해야 한다', () => {
    const invalidMetrics = {
      brightness: 200,
      contrast: 150,
      sharpness: 0.8,
      noiseLevel: 0.1,
      resolution: { width: 1920, height: 1080 },
      fileSize: 512000,
      format: 'image/jpeg',
      overallScore: 150, // 100 초과
    };

    const result = validateImageQualityMetrics(invalidMetrics);
    expect(result.success).toBe(false);
  });

  it('sharpness가 0-1 범위를 벗어나면 검증에 실패해야 한다', () => {
    const invalidMetrics = {
      overallScore: 85,
      brightness: 200,
      contrast: 150,
      sharpness: 1.5, // 1 초과
      noiseLevel: 0.1,
      resolution: { width: 1920, height: 1080 },
      fileSize: 512000,
      format: 'image/jpeg',
    };

    const result = validateImageQualityMetrics(invalidMetrics);
    expect(result.success).toBe(false);
  });
});

describe('ExtractionResult 타입 및 Zod 스키마', () => {
  it('성공적인 ExtractionResult를 생성하고 검증해야 한다', () => {
    const result: ExtractionResult = {
      success: true,
      bodyScore: 85,
      attempts: [
        {
          patternId: 'body-score-001',
          patternName: '패턴 1',
          matchedText: '신체 점수 85 표준',
          extractedValue: '85',
          confidence: 90,
          timestamp: new Date('2025-01-15T10:00:00Z'),
        },
      ],
      processingTimeMs: 1500,
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };

    const validationResult = validateExtractionResult(result);
    expect(validationResult.success).toBe(true);
    if (validationResult.success) {
      expect(validationResult.data.success).toBe(true);
      expect(validationResult.data.bodyScore).toBe(85);
      expect(validationResult.data.attempts).toHaveLength(1);
    }
  });

  it('실패한 ExtractionResult를 생성하고 검증해야 한다', () => {
    const result: ExtractionResult = {
      success: false,
      error: '신체 점수를 찾을 수 없습니다',
      attempts: [],
      processingTimeMs: 2000,
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };

    const validationResult = validateExtractionResult(result);
    expect(validationResult.success).toBe(true);
    if (validationResult.success) {
      expect(validationResult.data.success).toBe(false);
      expect(validationResult.data.error).toBe('신체 점수를 찾을 수 없습니다');
    }
  });

  it('success가 true인데 bodyScore가 없으면 검증에 실패해야 한다', () => {
    const invalidResult = {
      success: true,
      attempts: [],
      processingTimeMs: 1500,
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };

    const validationResult = validateExtractionResult(invalidResult);
    expect(validationResult.success).toBe(false);
  });

  it('success가 false인데 error가 없으면 검증에 실패해야 한다', () => {
    const invalidResult = {
      success: false,
      attempts: [],
      processingTimeMs: 1500,
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };

    const validationResult = validateExtractionResult(invalidResult);
    expect(validationResult.success).toBe(false);
  });

  it('processingTimeMs가 음수이면 검증에 실패해야 한다', () => {
    const invalidResult = {
      success: false,
      error: '오류',
      attempts: [],
      processingTimeMs: -100, // 음수
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };

    const validationResult = validateExtractionResult(invalidResult);
    expect(validationResult.success).toBe(false);
  });
});
