/**
 * TASK-005: Error Handler Module Improvement 테스트
 * SPEC-OCR-001: OCR 정확도 향상 (70% → 95%)
 *
 * TDD RED 단계: 실패하는 테스트 먼저 작성
 *
 * Error Handler는 다음을 제공해야 합니다:
 * - Error categorization (OCR_FAILED, EXTRACTION_FAILED, VALIDATION_FAILED, QUALITY_POOR, UNKNOWN)
 * - Detailed error messages (failure cause, attempted patterns, confidence, quality score, solution guide)
 * - Retry logic (max 2 retries, enhanced preprocessing)
 * - NO dummy data on failure
 * - Request manual input on complete failure
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  ExtractionError,
  ErrorCategory,
  RetryConfig,
  ErrorRecoveryResult,
  ExtractionContext,
} from '@/lib/extraction-error-handler';

// 모듈이 아직 존재하지 않으므로 import 주석 처리
// import {
//   categorizeError,
//   createExtractionError,
//   shouldRetry,
//   attemptRecovery,
//   formatErrorMessage,
//   suggestSolution,
//   DEFAULT_RETRY_CONFIG
// } from '@/lib/extraction-error-handler';

describe('Error Handler Module - Error Categorization', () => {
  it('categorizeError 함수가 존재해야 한다', async () => {
    const { categorizeError } = await import('@/lib/extraction-error-handler');
    expect(categorizeError).toBeDefined();
    expect(typeof categorizeError).toBe('function');
  });

  it('OCR 실패를 OCR_FAILED로 분류해야 한다', async () => {
    const { categorizeError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = new Error('OCR processing failed');
    const category = categorizeError(error, { hasOcrText: false });

    expect(category).toBe(ErrorCategory.OCR_FAILED);
  });

  it('추출 실패를 EXTRACTION_FAILED로 분류해야 한다', async () => {
    const { categorizeError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = new Error('No patterns matched');
    const category = categorizeError(error, { hasOcrText: true, patternsAttempted: 5 });

    expect(category).toBe(ErrorCategory.EXTRACTION_FAILED);
  });

  it('검증 실패를 VALIDATION_FAILED로 분류해야 한다', async () => {
    const { categorizeError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = new Error('Validation failed: score out of range');
    const category = categorizeError(error, { hasOcrText: true, extracted: true, valid: false });

    expect(category).toBe(ErrorCategory.VALIDATION_FAILED);
  });

  it('품질 저하를 QUALITY_POOR로 분류해야 한다', async () => {
    const { categorizeError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = new Error('Low confidence extraction');
    const category = categorizeError(error, { hasOcrText: true, confidence: 30 });

    expect(category).toBe(ErrorCategory.QUALITY_POOR);
  });

  it('알 수 없는 오류를 UNKNOWN으로 분류해야 한다', async () => {
    const { categorizeError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = new Error('Unknown error occurred');
    const category = categorizeError(error, {});

    expect(category).toBe(ErrorCategory.UNKNOWN);
  });

  it('ErrorCategory enum이 모든 카테고리를 포함해야 한다', async () => {
    const { ErrorCategory } = await import('@/lib/extraction-error-handler');

    expect(ErrorCategory.OCR_FAILED).toBe('OCR_FAILED');
    expect(ErrorCategory.EXTRACTION_FAILED).toBe('EXTRACTION_FAILED');
    expect(ErrorCategory.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
    expect(ErrorCategory.QUALITY_POOR).toBe('QUALITY_POOR');
    expect(ErrorCategory.UNKNOWN).toBe('UNKNOWN');
  });
});

describe('Error Handler Module - Extraction Error Creation', () => {
  it('createExtractionError 함수가 존재해야 한다', async () => {
    const { createExtractionError } = await import('@/lib/extraction-error-handler');
    expect(createExtractionError).toBeDefined();
    expect(typeof createExtractionError).toBe('function');
  });

  it('OCR_FAILED 오류를 생성해야 한다', async () => {
    const { createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.OCR_FAILED,
      'OCR 처리 실패',
      {
        attempts: [],
        confidence: 0,
      }
    );

    expect(error.category).toBe(ErrorCategory.OCR_FAILED);
    expect(error.message).toBe('OCR 처리 실패');
    expect(error.canRetry).toBe(true);
  });

  it('EXTRACTION_FAILED 오류를 생성해야 한다', async () => {
    const { createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.EXTRACTION_FAILED,
      '패턴 매칭 실패',
      {
        attempts: [
          {
            patternId: 'body-score-001',
            patternName: '신체 점수 패턴',
            matchedText: '',
            extractedValue: '',
            confidence: 0,
            timestamp: new Date(),
          },
        ],
      }
    );

    expect(error.category).toBe(ErrorCategory.EXTRACTION_FAILED);
    expect(error.attempts).toHaveLength(1);
    expect(error.canRetry).toBe(true);
  });

  it('VALIDATION_FAILED 오류를 생성해야 한다', async () => {
    const { createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.VALIDATION_FAILED,
      '점수 범위 초과',
      {
        attempts: [],
        confidence: 95,
        extractedValue: '150',
      }
    );

    expect(error.category).toBe(ErrorCategory.VALIDATION_FAILED);
    expect(error.confidence).toBe(95);
    expect(error.canRetry).toBe(false); // 검증 실패는 재시도 불가
  });

  it('QUALITY_POOR 오류를 생성해야 한다', async () => {
    const { createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.QUALITY_POOR,
      '낮은 신뢰도',
      {
        attempts: [],
        confidence: 35,
        qualityScore: 40,
      }
    );

    expect(error.category).toBe(ErrorCategory.QUALITY_POOR);
    expect(error.confidence).toBe(35);
    expect(error.qualityScore).toBe(40);
    expect(error.canRetry).toBe(true);
  });

  it('오류에 제안 해결책을 포함해야 한다', async () => {
    const { createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.OCR_FAILED,
      '이미지가 너무 어두움',
      {
        attempts: [],
      }
    );

    expect(error.suggestedSolution).toBeDefined();
    expect(typeof error.suggestedSolution).toBe('string');
    expect(error.suggestedSolution.length).toBeGreaterThan(0);
  });
});

describe('Error Handler Module - Retry Logic', () => {
  it('shouldRetry 함수가 존재해야 한다', async () => {
    const { shouldRetry } = await import('@/lib/extraction-error-handler');
    expect(shouldRetry).toBeDefined();
    expect(typeof shouldRetry).toBe('function');
  });

  it('OCR_FAILED 오류는 재시도 가능해야 한다', async () => {
    const { shouldRetry, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
    const result = shouldRetry(error, 0);

    expect(result).toBe(true);
  });

  it('EXTRACTION_FAILED 오류는 재시도 가능해야 한다', async () => {
    const { shouldRetry, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.EXTRACTION_FAILED, '추출 실패', {});
    const result = shouldRetry(error, 0);

    expect(result).toBe(true);
  });

  it('VALIDATION_FAILED 오류는 재시도 불가능해야 한다', async () => {
    const { shouldRetry, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.VALIDATION_FAILED, '검증 실패', {});
    const result = shouldRetry(error, 0);

    expect(result).toBe(false);
  });

  it('최대 재시도 횟수를 초과하면 재시도하지 않아야 한다', async () => {
    const { shouldRetry, createExtractionError, ErrorCategory, DEFAULT_RETRY_CONFIG } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
    const result = shouldRetry(error, DEFAULT_RETRY_CONFIG.maxRetries);

    expect(result).toBe(false);
  });

  it('재시도 횟수가 0이어야 시작 시도로 간주해야 한다', async () => {
    const { shouldRetry, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
    const result = shouldRetry(error, 0);

    expect(result).toBe(true);
  });

  it('DEFAULT_RETRY_CONFIG가 올바른 기본값을 가져야 한다', async () => {
    const { DEFAULT_RETRY_CONFIG } = await import('@/lib/extraction-error-handler');

    expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(2);
    expect(DEFAULT_RETRY_CONFIG.enhancePreprocessingOnRetry).toBe(true);
  });
});

describe('Error Handler Module - Error Recovery', () => {
  it('attemptRecovery 함수가 존재해야 한다', async () => {
    const { attemptRecovery } = await import('@/lib/extraction-error-handler');
    expect(attemptRecovery).toBeDefined();
    expect(typeof attemptRecovery).toBe('function');
  });

  it('OCR_FAILED 오류를 복구할 수 있어야 한다', async () => {
    const { attemptRecovery, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
    const context = {
      originalImage: new Uint8Array([1, 2, 3]),
      retryCount: 0,
    };

    const result = await attemptRecovery(error, context);

    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
  });

  it('재시도 시 강화된 전처리를 사용해야 한다', async () => {
    const { attemptRecovery, createExtractionError, ErrorCategory, DEFAULT_RETRY_CONFIG } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
    const context = {
      originalImage: new Uint8Array([1, 2, 3]),
      retryCount: 1,
      enhancedPreprocessing: DEFAULT_RETRY_CONFIG.enhancePreprocessingOnRetry,
    };

    const result = await attemptRecovery(error, context);

    expect(result).toBeDefined();
    // 강화된 전처리가 사용되었는지 확인 (구현에 따라 다름)
  });

  it('복구 불가능한 오류는 실패를 반환해야 한다', async () => {
    const { attemptRecovery, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.VALIDATION_FAILED, '검증 실패', {});
    const context = {
      retryCount: 0,
    };

    const result = await attemptRecovery(error, context);

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
  });

  it('최대 재시도 횟수 초과 시 수동 입력을 요청해야 한다', async () => {
    const { attemptRecovery, createExtractionError, ErrorCategory, DEFAULT_RETRY_CONFIG } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.EXTRACTION_FAILED, '추출 실패', {});
    const context = {
      retryCount: DEFAULT_RETRY_CONFIG.maxRetries + 1,
    };

    const result = await attemptRecovery(error, context);

    expect(result).toBeDefined();
    expect(result.requiresManualInput).toBe(true);
  });

  it('복구 결과에 시도 정보를 포함해야 한다', async () => {
    const { attemptRecovery, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
    const context = {
      retryCount: 0,
    };

    const result = await attemptRecovery(error, context);

    expect(result.attempt).toBeDefined();
    expect(result.attempt.timestamp).toBeInstanceOf(Date);
  });
});

describe('Error Handler Module - Error Message Formatting', () => {
  it('formatErrorMessage 함수가 존재해야 한다', async () => {
    const { formatErrorMessage } = await import('@/lib/extraction-error-handler');
    expect(formatErrorMessage).toBeDefined();
    expect(typeof formatErrorMessage).toBe('function');
  });

  it('사용자 친화적인 오류 메시지를 생성해야 한다', async () => {
    const { formatErrorMessage, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.OCR_FAILED,
      'OCR 처리 실패',
      { attempts: [] }
    );

    const message = formatErrorMessage(error);

    expect(message).toBeDefined();
    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(0);
  });

  it('오류 메시지에 실패 원인을 포함해야 한다', async () => {
    const { formatErrorMessage, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.EXTRACTION_FAILED,
      '신체 점수 패턴을 찾을 수 없음',
      { attempts: [] }
    );

    const message = formatErrorMessage(error);

    expect(message).toContain('신체 점수');
  });

  it('오류 메시지에 시도한 패턴 수를 포함해야 한다', async () => {
    const { formatErrorMessage, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.EXTRACTION_FAILED,
      '패턴 매칭 실패',
      {
        attempts: [
          {
            patternId: 'p1',
            patternName: 'Pattern 1',
            matchedText: '',
            extractedValue: '',
            confidence: 0,
            timestamp: new Date(),
          },
          {
            patternId: 'p2',
            patternName: 'Pattern 2',
            matchedText: '',
            extractedValue: '',
            confidence: 0,
            timestamp: new Date(),
          },
        ],
      }
    );

    const message = formatErrorMessage(error);

    expect(message).toContain('2');
  });

  it('오류 메시지에 신뢰도를 포함해야 한다', async () => {
    const { formatErrorMessage, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.QUALITY_POOR,
      '낮은 신뢰도',
      { attempts: [], confidence: 45 }
    );

    const message = formatErrorMessage(error);

    expect(message).toContain('45');
  });

  it('오류 메시지에 품질 점수를 포함해야 한다', async () => {
    const { formatErrorMessage, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.QUALITY_POOR,
      '품질 저하',
      { attempts: [], qualityScore: 50 }
    );

    const message = formatErrorMessage(error);

    expect(message).toContain('50');
  });
});

describe('Error Handler Module - Solution Suggestions', () => {
  it('suggestSolution 함수가 존재해야 한다', async () => {
    const { suggestSolution } = await import('@/lib/extraction-error-handler');
    expect(suggestSolution).toBeDefined();
    expect(typeof suggestSolution).toBe('function');
  });

  it('OCR_FAILED에 대한 해결책을 제안해야 한다', async () => {
    const { suggestSolution, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const solution = suggestSolution(ErrorCategory.OCR_FAILED);

    expect(solution).toBeDefined();
    expect(typeof solution).toBe('string');
    expect(solution.length).toBeGreaterThan(0);
  });

  it('EXTRACTION_FAILED에 대한 해결책을 제안해야 한다', async () => {
    const { suggestSolution, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const solution = suggestSolution(ErrorCategory.EXTRACTION_FAILED);

    expect(solution).toBeDefined();
    expect(typeof solution).toBe('string');
  });

  it('VALIDATION_FAILED에 대한 해결책을 제안해야 한다', async () => {
    const { suggestSolution, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const solution = suggestSolution(ErrorCategory.VALIDATION_FAILED);

    expect(solution).toBeDefined();
    expect(typeof solution).toBe('string');
  });

  it('QUALITY_POOR에 대한 해결책을 제안해야 한다', async () => {
    const { suggestSolution, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const solution = suggestSolution(ErrorCategory.QUALITY_POOR);

    expect(solution).toBeDefined();
    expect(typeof solution).toBe('string');
  });

  it('UNKNOWN에 대한 일반 해결책을 제안해야 한다', async () => {
    const { suggestSolution, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const solution = suggestSolution(ErrorCategory.UNKNOWN);

    expect(solution).toBeDefined();
    expect(typeof solution).toBe('string');
  });
});

describe('Error Handler Module - No Dummy Data', () => {
  it('완전 실패 시 더미 데이터를 반환하지 않아야 한다', async () => {
    const { attemptRecovery, createExtractionError, ErrorCategory, DEFAULT_RETRY_CONFIG } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.EXTRACTION_FAILED, '추출 실패', {});
    const context = {
      retryCount: DEFAULT_RETRY_CONFIG.maxRetries + 1,
    };

    const result = await attemptRecovery(error, context);

    // 더미 데이터가 없어야 함
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it('수동 입력 요청 시 더미 데이터를 포함하지 않아야 한다', async () => {
    const { formatErrorMessage, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.EXTRACTION_FAILED,
      '완전 실패',
      { attempts: [] }
    );

    const message = formatErrorMessage(error);

    // 더미 데이터 관련 메시지가 없어야 함
    expect(message).not.toContain('더미');
    expect(message).not.toContain('dummy');
  });
});

describe('Error Handler Module - Edge Cases', () => {
  it('undefined 오류를 처리해야 한다', async () => {
    const { categorizeError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const category = categorizeError(undefined as any, {});

    expect(category).toBe(ErrorCategory.UNKNOWN);
  });

  it('null 오류를 처리해야 한다', async () => {
    const { categorizeError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const category = categorizeError(null as any, {});

    expect(category).toBe(ErrorCategory.UNKNOWN);
  });

  it('빈 컨텍스트로 오류를 분류해야 한다', async () => {
    const { categorizeError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = new Error('Some error');
    const category = categorizeError(error, {});

    expect(category).toBeDefined();
    expect(Object.values(ErrorCategory)).toContain(category);
  });

  it('0번 재시도는 유효한 시도로 간주해야 한다', async () => {
    const { shouldRetry, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
    const result = shouldRetry(error, 0);

    expect(result).toBe(true);
  });

  it('음수 재시도 횟수를 처리해야 한다', async () => {
    const { shouldRetry, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
    const result = shouldRetry(error, -1);

    expect(result).toBe(false); // 음수는 유효하지 않음
  });

  it('매우 큰 재시도 횟수를 처리해야 한다', async () => {
    const { shouldRetry, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
    const result = shouldRetry(error, 9999);

    expect(result).toBe(false); // 최대 횟수 초과
  });
});

describe('Error Handler Module - Type Safety', () => {
  it('ExtractionError 타입을 준수해야 한다', async () => {
    const { createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(
      ErrorCategory.OCR_FAILED,
      '테스트',
      {}
    );

    // 모든 필수 필드 존재 확인
    expect(error.category).toBeDefined();
    expect(error.message).toBeDefined();
    expect(error.attempts).toBeDefined();
    expect(Array.isArray(error.attempts)).toBe(true);
    expect(error.canRetry).toBeDefined();
    expect(typeof error.canRetry).toBe('boolean');
  });

  it('ErrorRecoveryResult 타입을 준수해야 한다', async () => {
    const { attemptRecovery, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, '테스트', {});
    const context = { retryCount: 0 };

    const result = await attemptRecovery(error, context);

    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  });

  it('ExtractionContext 타입을 준수해야 한다', async () => {
    const { attemptRecovery, createExtractionError, ErrorCategory } = await import('@/lib/extraction-error-handler');

    const error = createExtractionError(ErrorCategory.OCR_FAILED, '테스트', {});
    const context: any = {
      originalImage: new Uint8Array([1, 2, 3]),
      retryCount: 0,
      enhancedPreprocessing: true,
      ocrConfidence: 75,
      qualityMetrics: {
        overallScore: 80,
        brightness: 200,
        contrast: 150,
        sharpness: 0.7,
        noiseLevel: 0.2,
        resolution: { width: 1920, height: 1080 },
        fileSize: 500000,
        format: 'image/jpeg',
      },
    };

    const result = await attemptRecovery(error, context);

    expect(result).toBeDefined();
  });
});
