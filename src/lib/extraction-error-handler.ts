/**
 * TASK-005: Error Handler Module Improvement
 * SPEC-OCR-001: OCR 정확도 향상 (70% → 95%)
 *
 * 오류 처리 및 복구 시스템 구현
 *
 * @module extraction-error-handler
 */

import type { ExtractionAttempt } from './types/extraction';

// ========== Type Definitions ==========

/**
 * 오류 카테고리 Enum
 *
 * OCR 추출 과정에서 발생할 수 있는 오류 유형을 정의합니다.
 *
 * @enum {string}
 *
 * @property {string} OCR_FAILED - OCR 처리 자체가 실패한 경우 (텍스트 추출 불가)
 * @property {string} EXTRACTION_FAILED - 패턴 매칭 실패 (텍스트는 있지만 신체 점수를 찾을 수 없음)
 * @property {string} VALIDATION_FAILED - 데이터 검증 실패 (추출된 값이 범위를 벗어남 등)
 * @property {string} QUALITY_POOR - 낮은 신뢰도/품질 (50% 미만 신뢰도)
 * @property {string} UNKNOWN - 분류할 수 없는 오류
 *
 * @example
 * ```typescript
 * const error = createExtractionError(ErrorCategory.OCR_FAILED, '이미지 처리 실패', {});
 * ```
 */
export enum ErrorCategory {
  OCR_FAILED = 'OCR_FAILED',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  QUALITY_POOR = 'QUALITY_POOR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 추출 오류 정보 인터페이스
 *
 * OCR 추출 실패 시 상세 정보를 포함하는 오류 객체입니다.
 *
 * @interface ExtractionError
 *
 * @property {ErrorCategory} category - 오류 카테고리 (OCR_FAILED, EXTRACTION_FAILED 등)
 * @property {string} message - 오류 메시지 (사용자에게 표시되는 상세 설명)
 * @property {ExtractionAttempt[]} attempts - 시도한 패턴 매칭 기록
 * @property {number} [confidence] - 추출 신뢰도 (0-100, 선택적)
 * @property {number} [qualityScore] - 이미지 품질 점수 (0-100, 선택적)
 * @property {string} [extractedValue] - 추출된 값 (검증 실패 시 등, 선택적)
 * @property {string} [suggestedSolution] - 제안된 해결책 (자동 생성)
 * @property {boolean} canRetry - 재시도 가능 여부 (카테고리에 따라 자동 결정)
 *
 * @example
 * ```typescript
 * const error: ExtractionError = {
 *   category: ErrorCategory.EXTRACTION_FAILED,
 *   message: '신체 점수 패턴을 찾을 수 없음',
 *   attempts: [...],
 *   confidence: 0,
 *   canRetry: true,
 *   suggestedSolution: '이미지의 품질을 확인하고 다시 시도해주세요.'
 * };
 * ```
 */
export interface ExtractionError {
  category: ErrorCategory;
  message: string;
  attempts: ExtractionAttempt[];
  confidence?: number;
  qualityScore?: number;
  extractedValue?: string;
  suggestedSolution?: string;
  canRetry: boolean;
}

/**
 * 재시도 설정 인터페이스
 *
 * 오류 발생 시 재시도 동작을 제어합니다.
 *
 * @interface RetryConfig
 *
 * @property {number} maxRetries - 최대 재시도 횟수 (기본값: 2)
 * @property {boolean} enhancePreprocessingOnRetry - 재시도 시 강화된 전처리 사용 여부
 *
 * @example
 * ```typescript
 * const config: RetryConfig = {
 *   maxRetries: 3,
 *   enhancePreprocessingOnRetry: true
 * };
 * ```
 */
export interface RetryConfig {
  maxRetries: number;
  enhancePreprocessingOnRetry: boolean;
}

/**
 * 오류 복구 결과 인터페이스
 *
 * 오류 복구 시도 결과를 포함합니다.
 *
 * @interface ErrorRecoveryResult
 *
 * @property {boolean} success - 복구 성공 여부
 * @property {any} [data] - 복구된 데이터 (성공 시)
 * @property {boolean} requiresManualInput - 수동 입력 필요 여부
 * @property {Object} attempt - 복구 시도 정보
 * @property {Date} attempt.timestamp - 시도 타임스탬프
 * @property {number} attempt.retryCount - 재시도 횟수
 * @property {boolean} attempt.enhanced - 강화된 전처리 사용 여부
 * @property {string} [error] - 오류 메시지 (실패 시)
 */
export interface ErrorRecoveryResult {
  success: boolean;
  data?: any;
  requiresManualInput: boolean;
  attempt: {
    timestamp: Date;
    retryCount: number;
    enhanced: boolean;
  };
  error?: string;
}

/**
 * 추출 컨텍스트 인터페이스
 *
 * 오류 복구 시 필요한 컨텍스트 정보를 포함합니다.
 *
 * @interface ExtractionContext
 *
 * @property {Uint8Array} [originalImage] - 원본 이미지 데이터
 * @property {number} retryCount - 현재 재시도 횟수
 * @property {boolean} [enhancedPreprocessing] - 강화된 전처리 사용 여부
 * @property {number} [ocrConfidence] - OCR 신뢰도 (0-100)
 * @property {any} [qualityMetrics] - 이미지 품질 지표
 */
export interface ExtractionContext {
  originalImage?: Uint8Array;
  retryCount: number;
  enhancedPreprocessing?: boolean;
  ocrConfidence?: number;
  qualityMetrics?: any;
}

/**
 * 오류 분류 컨텍스트 인터페이스
 *
 * 오류를 카테고리로 분류하기 위한 컨텍스트 정보입니다.
 *
 * @interface ErrorClassificationContext
 *
 * @property {boolean} [hasOcrText] - OCR 텍스트 추출 성공 여부
 * @property {number} [patternsAttempted] - 시도한 패턴 수
 * @property {boolean} [extracted] - 값 추출 성공 여부
 * @property {boolean} [valid] - 검증 통과 여부
 * @property {number} [confidence] - 추출 신뢰도
 */
interface ErrorClassificationContext {
  hasOcrText?: boolean;
  patternsAttempted?: number;
  extracted?: boolean;
  valid?: boolean;
  confidence?: number;
}

// ========== Constants ==========

/**
 * 기본 재시도 설정 상수
 *
 * 오류 발생 시 사용되는 기본 재시도 설정입니다.
 *
 * @constant {RetryConfig}
 *
 * @property {number} maxRetries - 최대 2회 재시도
 * @property {boolean} enhancePreprocessingOnRetry - 재시도 시 강화된 전처리 자동 사용
 *
 * @example
 * ```typescript
 * shouldRetry(error, retryCount, DEFAULT_RETRY_CONFIG);
 * ```
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  enhancePreprocessingOnRetry: true,
};

// ========== Error Categorization ==========

/**
 * 오류 카테고리 분류 함수
 *
 * 발생한 오류를 컨텍스트 정보를 바탕으로 적절한 카테고리로 분류합니다.
 *
 * @function categorizeError
 *
 * @param {unknown} error - 분류할 오류 객체 (Error 인스턴스 또는 문자열)
 * @param {ErrorClassificationContext} context - 오류 분류를 위한 컨텍스트 정보
 * @param {boolean} [context.hasOcrText] - OCR 텍스트 추출 성공 여부
 * @param {number} [context.patternsAttempted] - 시도한 패턴 수
 * @param {boolean} [context.extracted] - 값 추출 성공 여부
 * @param {boolean} [context.valid] - 검증 통과 여부
 * @param {number} [context.confidence] - 추출 신뢰도
 *
 * @returns {ErrorCategory} 분류된 오류 카테고리
 *
 * @example
 * ```typescript
 * const error = new Error('OCR processing failed');
 * const category = categorizeError(error, { hasOcrText: false });
 * // Returns: ErrorCategory.OCR_FAILED
 *
 * const category2 = categorizeError(error, { hasOcrText: true, patternsAttempted: 5 });
 * // Returns: ErrorCategory.EXTRACTION_FAILED
 * ```
 */
export function categorizeError(
  error: unknown,
  context: ErrorClassificationContext
): ErrorCategory {
  if (!error) {
    return ErrorCategory.UNKNOWN;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // OCR 실패: OCR 텍스트가 없는 경우
  if (context.hasOcrText === false) {
    return ErrorCategory.OCR_FAILED;
  }

  // 검증 실패: 추출은 성공했지만 검증 실패
  if (context.extracted && context.valid === false) {
    return ErrorCategory.VALIDATION_FAILED;
  }

  // 품질 저하: 신뢰도가 낮은 경우
  if (context.confidence !== undefined && context.confidence < 50) {
    return ErrorCategory.QUALITY_POOR;
  }

  // 추출 실패: OCR 텍스트는 있지만 패턴 매칭 실패
  if (context.hasOcrText === true && context.patternsAttempted && context.patternsAttempted > 0) {
    return ErrorCategory.EXTRACTION_FAILED;
  }

  // 에러 메시지 기반 분류
  if (errorMessage.includes('OCR') || errorMessage.includes('Tesseract')) {
    return ErrorCategory.OCR_FAILED;
  }

  if (errorMessage.includes('validation') || errorMessage.includes('범위')) {
    return ErrorCategory.VALIDATION_FAILED;
  }

  if (errorMessage.includes('confidence') || errorMessage.includes('신뢰도')) {
    return ErrorCategory.QUALITY_POOR;
  }

  if (errorMessage.includes('pattern') || errorMessage.includes('추출') || errorMessage.includes('매칭')) {
    return ErrorCategory.EXTRACTION_FAILED;
  }

  return ErrorCategory.UNKNOWN;
}

// ========== Error Creation ==========

/**
 * 추출 오류 생성 함수
 *
 * 주어진 카테고리와 메시지로 추출 오류 객체를 생성합니다.
 * 재시도 가능성과 해결책은 카테고리에 따라 자동으로 결정됩니다.
 *
 * @function createExtractionError
 *
 * @param {ErrorCategory} category - 오류 카테고리
 * @param {string} message - 오류 메시지
 * @param {Object} [options={}] - 추가 옵션
 * @param {ExtractionAttempt[]} [options.attempts=[]] - 시도한 패턴 매칭 기록
 * @param {number} [options.confidence] - 추출 신뢰도 (0-100)
 * @param {number} [options.qualityScore] - 이미지 품질 점수 (0-100)
 * @param {string} [options.extractedValue] - 추출된 값 (검증 실패 시 등)
 *
 * @returns {ExtractionError} 생성된 추출 오류 객체
 *
 * @example
 * ```typescript
 * const error = createExtractionError(
 *   ErrorCategory.EXTRACTION_FAILED,
 *   '신체 점수 패턴을 찾을 수 없음',
 *   {
 *     attempts: [attempt1, attempt2],
 *     confidence: 0
 *   }
 * );
 * console.log(error.canRetry); // true
 * console.log(error.suggestedSolution); // 자동 생성된 해결책
 * ```
 */
export function createExtractionError(
  category: ErrorCategory,
  message: string,
  options: {
    attempts?: ExtractionAttempt[];
    confidence?: number;
    qualityScore?: number;
    extractedValue?: string;
  } = {}
): ExtractionError {
  const { attempts = [], confidence, qualityScore, extractedValue } = options;

  // 카테고리에 따른 재시도 가능성 결정
  const canRetry = determineRetryability(category);

  // 자동 해결책 제안
  const suggestedSolution = suggestSolution(category);

  return {
    category,
    message,
    attempts,
    confidence,
    qualityScore,
    extractedValue,
    suggestedSolution,
    canRetry,
  };
}

/**
 * 카테고리에 따른 재시도 가능성 결정
 */
function determineRetryability(category: ErrorCategory): boolean {
  switch (category) {
    case ErrorCategory.OCR_FAILED:
    case ErrorCategory.EXTRACTION_FAILED:
    case ErrorCategory.QUALITY_POOR:
      return true;
    case ErrorCategory.VALIDATION_FAILED:
    case ErrorCategory.UNKNOWN:
      return false;
  }
}

// ========== Retry Logic ==========

/**
 * 재시도 가능 여부 확인 함수
 *
 * 주어진 오류와 재시도 횟수를 바탕으로 재시도 가능 여부를 판단합니다.
 *
 * @function shouldRetry
 *
 * @param {ExtractionError} error - 추출 오류 객체
 * @param {number} currentRetryCount - 현재 재시도 횟수
 * @param {RetryConfig} [config=DEFAULT_RETRY_CONFIG] - 재시도 설정 (선택적)
 *
 * @returns {boolean} 재시도 가능 여부
 *
 * @example
 * ```typescript
 * const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
 * console.log(shouldRetry(error, 0)); // true
 * console.log(shouldRetry(error, 2)); // false (최대 횟수 도달)
 *
 * const validationError = createExtractionError(ErrorCategory.VALIDATION_FAILED, '검증 실패', {});
 * console.log(shouldRetry(validationError, 0)); // false (재시도 불가능한 카테고리)
 * ```
 */
export function shouldRetry(
  error: ExtractionError,
  currentRetryCount: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): boolean {
  // 재시도 불가능한 카테고리
  if (!error.canRetry) {
    return false;
  }

  // 최대 재시도 횟수 초과
  if (currentRetryCount >= config.maxRetries) {
    return false;
  }

  // 음수 재시도 횟수는 유효하지 않음
  if (currentRetryCount < 0) {
    return false;
  }

  return true;
}

// ========== Error Recovery ==========

/**
 * 오류 복구 시도 함수
 *
 * 발생한 오류를 복구하기 위해 재시도 또는 강화된 전처리를 시도합니다.
 * 최대 재시도 횟수를 초과하거나 복구 불가능한 오류인 경우 수동 입력을 요청합니다.
 *
 * @function attemptRecovery
 *
 * @param {ExtractionError} error - 추출 오류 객체
 * @param {ExtractionContext} context - 추출 컨텍스트
 * @param {Uint8Array} [context.originalImage] - 원본 이미지 데이터
 * @param {number} context.retryCount - 현재 재시도 횟수
 * @param {boolean} [context.enhancedPreprocessing] - 강화된 전처리 사용 여부
 * @param {number} [context.ocrConfidence] - OCR 신뢰도
 * @param {any} [context.qualityMetrics] - 이미지 품질 지표
 *
 * @returns {Promise<ErrorRecoveryResult>} 복구 시도 결과
 *
 * @example
 * ```typescript
 * const error = createExtractionError(ErrorCategory.OCR_FAILED, 'OCR 실패', {});
 * const context = { retryCount: 0, enhancedPreprocessing: true };
 * const result = await attemptRecovery(error, context);
 *
 * if (result.requiresManualInput) {
 *   // 사용자에게 수동 입력 요청
 * } else if (result.success) {
 *   // 복구 성공, result.data 사용
 * }
 * ```
 */
export async function attemptRecovery(
  error: ExtractionError,
  context: ExtractionContext
): Promise<ErrorRecoveryResult> {
  const { retryCount, enhancedPreprocessing = false } = context;

  const result: ErrorRecoveryResult = {
    success: false,
    requiresManualInput: false,
    attempt: {
      timestamp: new Date(),
      retryCount,
      enhanced: enhancedPreprocessing,
    },
  };

  // 재시도 가능 여부 확인
  if (!error.canRetry) {
    result.requiresManualInput = true;
    result.error = '복구 불가능한 오류: ' + error.message;
    return result;
  }

  // 최대 재시도 횟수 초과
  if (retryCount > DEFAULT_RETRY_CONFIG.maxRetries) {
    result.requiresManualInput = true;
    result.error = '최대 재시도 횟수 초과: 수동 입력이 필요합니다';
    return result;
  }

  // 카테고리별 복구 시도
  switch (error.category) {
    case ErrorCategory.OCR_FAILED:
      return await recoverFromOcrFailure(error, context);
    case ErrorCategory.EXTRACTION_FAILED:
      return await recoverFromExtractionFailure(error, context);
    case ErrorCategory.QUALITY_POOR:
      return await recoverFromPoorQuality(error, context);
    default:
      result.requiresManualInput = true;
      result.error = '지원되지 않는 복구: ' + error.message;
      return result;
  }
}

/**
 * OCR 실패 복구
 */
async function recoverFromOcrFailure(
  error: ExtractionError,
  context: ExtractionContext
): Promise<ErrorRecoveryResult> {
  // 실제 복구 로직은 향후 구현
  // 현재는 강화된 전처리만 사용
  const { enhancedPreprocessing = false } = context;

  return {
    success: false,
    requiresManualInput: false,
    attempt: {
      timestamp: new Date(),
      retryCount: context.retryCount,
      enhanced: enhancedPreprocessing,
    },
  };
}

/**
 * 추출 실패 복구
 */
async function recoverFromExtractionFailure(
  error: ExtractionError,
  context: ExtractionContext
): Promise<ErrorRecoveryResult> {
  const { enhancedPreprocessing = false } = context;

  return {
    success: false,
    requiresManualInput: false,
    attempt: {
      timestamp: new Date(),
      retryCount: context.retryCount,
      enhanced: enhancedPreprocessing,
    },
  };
}

/**
 * 품질 저하 복구
 */
async function recoverFromPoorQuality(
  error: ExtractionError,
  context: ExtractionContext
): Promise<ErrorRecoveryResult> {
  const { enhancedPreprocessing = false } = context;

  return {
    success: false,
    requiresManualInput: false,
    attempt: {
      timestamp: new Date(),
      retryCount: context.retryCount,
      enhanced: enhancedPreprocessing,
    },
  };
}

// ========== Error Message Formatting ==========

/**
 * 오류 메시지 포맷팅 함수
 *
 * 추출 오류 객체를 사용자에게 표시하기 좋은 형식의 메시지로 변환합니다.
 * 카테고리별 메시지, 원인, 시도 횟수, 신뢰도, 품질 점수, 해결책을 포함합니다.
 *
 * @function formatErrorMessage
 *
 * @param {ExtractionError} error - 추출 오류 객체
 *
 * @returns {string} 포맷된 오류 메시지 (개행으로 구분된 다중 라인)
 *
 * @example
 * ```typescript
 * const error = createExtractionError(
 *   ErrorCategory.EXTRACTION_FAILED,
 *   '신체 점수 패턴을 찾을 수 없음',
 *   {
 *     attempts: [attempt1, attempt2],
 *     confidence: 45
 *   }
 * );
 *
 * const message = formatErrorMessage(error);
 * // 출력:
 * // "신체 점수 추출에 실패했습니다.
 * // 원인: 신체 점수 패턴을 찾을 수 없음
 * // 2개의 패턴을 시도했습니다.
 * // 신뢰도: 45%
 * // 해결 방법: 이미지의 품질을 확인하고 다시 시도해주세요."
 * ```
 */
export function formatErrorMessage(error: ExtractionError): string {
  const parts: string[] = [];

  // 카테고리별 메시지
  switch (error.category) {
    case ErrorCategory.OCR_FAILED:
      parts.push('OCR 처리 중 오류가 발생했습니다.');
      break;
    case ErrorCategory.EXTRACTION_FAILED:
      parts.push('신체 점수 추출에 실패했습니다.');
      break;
    case ErrorCategory.VALIDATION_FAILED:
      parts.push('추출된 데이터 검증에 실패했습니다.');
      break;
    case ErrorCategory.QUALITY_POOR:
      parts.push('추출 결과의 신뢰도가 낮습니다.');
      break;
    default:
      parts.push('알 수 없는 오류가 발생했습니다.');
  }

  // 원본 메시지 추가
  parts.push(`원인: ${error.message}`);

  // 시도한 패턴 수
  if (error.attempts.length > 0) {
    parts.push(`${error.attempts.length}개의 패턴을 시도했습니다.`);
  }

  // 신뢰도
  if (error.confidence !== undefined) {
    parts.push(`신뢰도: ${error.confidence}%`);
  }

  // 품질 점수
  if (error.qualityScore !== undefined) {
    parts.push(`품질 점수: ${error.qualityScore}/100`);
  }

  // 제안된 해결책
  if (error.suggestedSolution) {
    parts.push(`해결 방법: ${error.suggestedSolution}`);
  }

  return parts.join('\n');
}

// ========== Solution Suggestions ==========

/**
 * 해결책 제안 함수
 *
 * 오류 카테고리에 따라 사용자에게 제안할 해결책을 반환합니다.
 * 각 카테고리별로 적절한 대응 방안을 제공합니다.
 *
 * @function suggestSolution
 *
 * @param {ErrorCategory} category - 오류 카테고리
 *
 * @returns {string} 제안된 해결책
 *
 * @example
 * ```typescript
 * console.log(suggestSolution(ErrorCategory.OCR_FAILED));
 * // "이미지를 다시 촬영해주세요. 밝은 조명에서 기기가 정확히 보이도록 찍어주세요."
 *
 * console.log(suggestSolution(ErrorCategory.VALIDATION_FAILED));
 * // "추출된 데이터가 올바른 형식이 아닙니다. 수동으로 입력해주세요."
 *
 * console.log(suggestSolution(ErrorCategory.QUALITY_POOR));
 * // "이미지 품질이 낮습니다. 더 밝은 조명에서 다시 촬영해주세요."
 * ```
 */
export function suggestSolution(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.OCR_FAILED:
      return '이미지를 다시 촬영해주세요. 밝은 조명에서 기기가 정확히 보이도록 찍어주세요.';
    case ErrorCategory.EXTRACTION_FAILED:
      return '이미지의 품질을 확인하고 다시 시도해주세요. 텍스트가 선명하게 보이는지 확인해주세요.';
    case ErrorCategory.VALIDATION_FAILED:
      return '추출된 데이터가 올바른 형식이 아닙니다. 수동으로 입력해주세요.';
    case ErrorCategory.QUALITY_POOR:
      return '이미지 품질이 낮습니다. 더 밝은 조명에서 다시 촬영해주세요.';
    case ErrorCategory.UNKNOWN:
      return '문제가 지속되면 고객 지원에 문의해주세요.';
  }
}
