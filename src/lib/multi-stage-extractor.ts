/**
 * TASK-003: Multi-Stage Extractor 구현
 * SPEC-DATA-003: OCR 텍스트에서 구조화된 체성분 데이터 추출
 *
 * @description
 * OCR 신뢰도 수준에 따라 3단계 추출 전략을 사용하여 신체 점수를 추출합니다.
 *
 * 3단계 추출 전략:
 * - Stage 1: Priority 1-3 (높은 신뢰도, 80%+) - InBody 770/970 핵심 패턴
 * - Stage 2: Priority 4-7 (중간 신뢰도, 50-80%) - InBody 720/OntoFit 패턴
 * - Stage 3: Priority 8-10 (낮은 신뢰도, <50%) - Generic 폴백 패턴
 *
 * @module multi-stage-extractor
 * @author TDD Implementation
 * @version 1.0.0
 * @since 2026-01-16
 */

import type { ExtractionResult, ExtractionAttempt } from './types/extraction';
import { getPatternsByPriority } from './pattern-library';

// ========== Type Definitions ==========

/**
 * 다중 단계 추출 설정
 *
 * @property {number} highConfidenceThreshold - 높은 신뢰도 임계값 (기본값: 80)
 * @property {number} mediumConfidenceThreshold - 중간 신뢰도 임계값 (기본값: 50)
 * @property {number} lowConfidenceThreshold - 낮은 신뢰도 임계값 (기본값: 0)
 */
interface MultiStageConfig {
  highConfidenceThreshold: number;
  mediumConfidenceThreshold: number;
  lowConfidenceThreshold: number;
}

/**
 * 추출 단계 정의
 *
 * @property {number} minPriority - 최소 우선순위
 * @property {number} maxPriority - 최대 우선순위
 * @property {number} baseConfidence - 기본 신뢰도 (0-100)
 */
interface ExtractionStage {
  minPriority: number;
  maxPriority: number;
  baseConfidence: number;
}

// ========== Constants ==========

/**
 * 기본 설정
 *
 * 신뢰도 임계값 정의
 */
const DEFAULT_CONFIG: MultiStageConfig = {
  highConfidenceThreshold: 80,
  mediumConfidenceThreshold: 50,
  lowConfidenceThreshold: 0,
} as const;

/**
 * 추출 단계 정의
 *
 * 3단계 추출 전략: 높은 신뢰도 → 중간 신뢰도 → 낮은 신뢰도
 */
const EXTRACTION_STAGES: ExtractionStage[] = [
  {
    minPriority: 1,
    maxPriority: 3,
    baseConfidence: 85, // Stage 1: 80-100%
  },
  {
    minPriority: 4,
    maxPriority: 7,
    baseConfidence: 65, // Stage 2: 50-79%
  },
  {
    minPriority: 8,
    maxPriority: 10,
    baseConfidence: 40, // Stage 3: 10-49%
  },
] as const;

/**
 * 유효한 신체 점수 범위
 */
const VALID_SCORE_RANGE = {
  min: 0,
  max: 100,
} as const;

// ========== Helper Functions ==========

/**
 * 우선순위를 신뢰도로 변환
 *
 * @param {number} priority - 패턴 우선순위 (1-10, 1이 가장 높음)
 * @returns {number} 신뢰도 (0-100)
 *
 * @example
 * priorityToConfidence(1) // 100
 * priorityToConfidence(3) // 85
 * priorityToConfidence(5) // 70
 * priorityToConfidence(10) // 10
 */
function priorityToConfidence(priority: number): number {
  if (priority >= 1 && priority <= 3) {
    // Stage 1: 100-85% (Priority 1=100, 2=95, 3=85)
    return 100 - (priority - 1) * 5;
  } else if (priority >= 4 && priority <= 7) {
    // Stage 2: 75-60% (Priority 4=75, 5=70, 6=65, 7=60)
    return 75 - (priority - 4) * 5;
  } else {
    // Stage 3: 45-10% (Priority 8=45, 9=30, 10=10)
    return 45 - (priority - 8) * 15;
  }
}

/**
 * 추출 시도 정보 생성
 *
 * @param {any} pattern - 사용된 패턴
 * @param {string} text - 원본 텍스트
 * @param {string} matchedText - 매칭된 텍스트
 * @param {string} extractedValue - 추출된 값
 * @returns {ExtractionAttempt} 추출 시도 정보
 */
function createExtractionAttempt(
  pattern: any,
  text: string,
  matchedText: string,
  extractedValue: string
): ExtractionAttempt {
  return {
    patternId: pattern.id,
    patternName: pattern.name,
    matchedText,
    extractedValue,
    confidence: priorityToConfidence(pattern.priority),
    timestamp: new Date(),
  };
}

/**
 * 텍스트에서 숫자를 추출하고 유효성 검사
 *
 * @param {RegExpMatchArray | null} match - 정규식 매치 결과
 * @returns {number | null} 유효한 숫자 또는 null
 *
 * @description
 * - 첫 번째 캡처 그룹에서 숫자 추출
 * - 0-100 범위 확인
 * - NaN 검증
 */
function extractValidNumber(match: RegExpMatchArray | null): number | null {
  if (!match) {
    return null;
  }

  // 첫 번째 캡처 그룹에서 숫자 추출, 없으면 전체 매치 사용
  const numStr = match[1] || match[0];
  const num = parseInt(numStr, 10);

  // NaN 검증
  if (isNaN(num)) {
    return null;
  }

  // 0-100 범위 확인
  if (num < VALID_SCORE_RANGE.min || num > VALID_SCORE_RANGE.max) {
    return null;
  }

  return num;
}

/**
 * 입력 텍스트 유효성 검사
 *
 * @param {unknown} text - 검증할 텍스트
 * @returns {boolean} 유효 여부
 */
function isValidInputText(text: unknown): text is string {
  return (
    typeof text === 'string' &&
    text.trim().length > 0
  );
}

/**
 * 실패 결과 생성
 *
 * @param {string} error - 에러 메시지
 * @param {number} processingTimeMs - 처리 시간 (ms)
 * @param {ExtractionAttempt[]} attempts - 추출 시도 목록
 * @returns {ExtractionResult} 실패 결과
 */
function createFailureResult(
  error: string,
  processingTimeMs: number,
  attempts: ExtractionAttempt[] = []
): ExtractionResult {
  return {
    success: false,
    attempts,
    error,
    processingTimeMs,
    timestamp: new Date(),
  };
}

/**
 * 성공 결과 생성
 *
 * @param {number} bodyScore - 추출된 신체 점수
 * @param {ExtractionAttempt[]} attempts - 추출 시도 목록
 * @param {number} processingTimeMs - 처리 시간 (ms)
 * @returns {ExtractionResult} 성공 결과
 */
function createSuccessResult(
  bodyScore: number,
  attempts: ExtractionAttempt[],
  processingTimeMs: number
): ExtractionResult {
  return {
    success: true,
    bodyScore,
    attempts,
    processingTimeMs,
    timestamp: new Date(),
  };
}

// ========== Main Extraction Functions ==========

/**
 * OCR 텍스트에서 신체 점수를 추출 (3단계 전략)
 *
 * @param {string | undefined | null} ocrText - OCR로 추출된 텍스트
 * @param {MultiStageConfig} config - 추출 설정 (선택 사항)
 * @returns {Promise<ExtractionResult>} 추출 결과
 *
 * @example
 * // 높은 신뢰도 텍스트
 * const result1 = await extractBodyScore('신체 점수 85 표준');
 * // { success: true, bodyScore: 85, ... }
 *
 * @example
 * // 중간 신뢰도 텍스트
 * const result2 = await extractBodyScore('점수: 75점');
 * // { success: true, bodyScore: 75, ... }
 *
 * @example
 * // 실패 케이스
 * const result3 = await extractBodyScore('');
 * // { success: false, error: 'OCR 텍스트가 비어있거나 유효하지 않습니다', ... }
 */
export async function extractBodyScore(
  ocrText: string | undefined | null,
  _config: MultiStageConfig = DEFAULT_CONFIG
): Promise<ExtractionResult> {
  const startTime = Date.now();
  const attempts: ExtractionAttempt[] = [];

  // 입력 검증
  if (!isValidInputText(ocrText)) {
    return createFailureResult(
      'OCR 텍스트가 비어있거나 유효하지 않습니다',
      Date.now() - startTime,
      attempts
    );
  }

  const text = ocrText.trim();

  // 3단계 추출 전략 실행
  for (const stage of EXTRACTION_STAGES) {
    // 해당 단계의 패턴 가져오기
    const patterns = getPatternsByPriority(stage.minPriority, stage.maxPriority);

    // 각 패턴 시도
    for (const pattern of patterns) {
      const match = text.match(pattern.regex);

      if (match) {
        let bodyScore: number | null = null;

        // InBody 770 형식 특수 처리: 섹션의 모든 숫자 중 가장 큰 값 사용
        if (pattern.id.startsWith('inbody770-score-001')) {
          const scoreText = match[0];
          const allNumbers = scoreText.match(/(\d+\.?\d*)/g);
          if (allNumbers) {
            const validScores = allNumbers
              .map(n => parseFloat(n))
              .filter(n => n >= 0 && n <= 100);
            if (validScores.length > 0) {
              bodyScore = Math.round(Math.max(...validScores));
            }
          }
        } else {
          // 일반적인 경우: 캡처 그룹 사용
          bodyScore = extractValidNumber(match);
        }

        if (bodyScore !== null) {
          // 성공한 시도 기록
          attempts.push(
            createExtractionAttempt(
              pattern,
              text,
              match[0],
              bodyScore.toString()
            )
          );

          // 첫 번째 성공 시 즉시 반환 (조기 종료)
          return createSuccessResult(
            bodyScore,
            attempts,
            Date.now() - startTime
          );
        }
      }
    }
  }

  // 모든 단계 실패
  return createFailureResult(
    '신체 점수를 추출할 수 없습니다',
    Date.now() - startTime,
    attempts
  );
}

/**
 * OCR 신뢰도에 따라 신체 점수를 추출
 *
 * @param {string | undefined | null} ocrText - OCR로 추출된 텍스트
 * @param {number} ocrConfidence - OCR 신뢰도 (0-100)
 * @param {MultiStageConfig} config - 추출 설정 (선택 사항)
 * @returns {Promise<ExtractionResult>} 추출 결과
 *
 * @description
 * OCR 신뢰도에 따라 시작 단계를 결정하여 불필요한 패턴 매칭을 최소화합니다.
 *
 * - OCR 신뢰도 80+ : Stage 1부터 시작 (정밀 추출)
 * - OCR 신뢰도 50-80 : Stage 2부터 시작 (균형 추출)
 * - OCR 신뢰도 <50 : Stage 3부터 시작 (관대 추출)
 *
 * @example
 * // 높은 OCR 신뢰도
 * const result1 = await extractBodyScoreWithConfidence('신체 점수 90 표준', 90);
 * // Stage 1부터 시작
 *
 * @example
 * // 낮은 OCR 신뢰도
 * const result2 = await extractBodyScoreWithConfidence('92', 30);
 * // Stage 3부터 시작
 */
export async function extractBodyScoreWithConfidence(
  ocrText: string | undefined | null,
  ocrConfidence: number,
  config: MultiStageConfig = DEFAULT_CONFIG
): Promise<ExtractionResult> {
  const startTime = Date.now();
  const attempts: ExtractionAttempt[] = [];

  // 입력 검증
  if (!isValidInputText(ocrText)) {
    return createFailureResult(
      'OCR 텍스트가 비어있거나 유효하지 않습니다',
      Date.now() - startTime,
      attempts
    );
  }

  // OCR 신뢰도 정규화 (0-100 범위로 제한)
  const normalizedConfidence = Math.max(0, Math.min(100, ocrConfidence));
  const text = ocrText.trim();

  // OCR 신뢰도에 따라 시작 단계 결정
  let startStageIndex = 0;

  if (normalizedConfidence >= config.highConfidenceThreshold) {
    // 높은 신뢰도: Stage 1부터 시작 (정밀 추출)
    startStageIndex = 0;
  } else if (normalizedConfidence >= config.mediumConfidenceThreshold) {
    // 중간 신뢰도: Stage 2부터 시작 (균형 추출)
    startStageIndex = 1;
  } else {
    // 낮은 신뢰도: Stage 3부터 시작 (관대 추출)
    startStageIndex = 2;
  }

  // 결정된 단계부터 추출 시작
  for (let i = startStageIndex; i < EXTRACTION_STAGES.length; i++) {
    const stage = EXTRACTION_STAGES[i];
    const patterns = getPatternsByPriority(stage.minPriority, stage.maxPriority);

    for (const pattern of patterns) {
      const match = text.match(pattern.regex);

      if (match) {
        const bodyScore = extractValidNumber(match);

        if (bodyScore !== null) {
          attempts.push(
            createExtractionAttempt(
              pattern,
              text,
              match[0],
              bodyScore.toString()
            )
          );

          return createSuccessResult(
            bodyScore,
            attempts,
            Date.now() - startTime
          );
        }
      }
    }
  }

  // 모든 단계 실패
  return createFailureResult(
    '신체 점수를 추출할 수 없습니다',
    Date.now() - startTime,
    attempts
  );
}

// ========== Exported Utility Functions ==========

/**
 * 기본 설정을 가져옵니다 (내부 사용)
 *
 * @returns {MultiStageConfig} 기본 설정의 복사본
 */
export function getDefaultConfig(): MultiStageConfig {
  return { ...DEFAULT_CONFIG };
}

/**
 * 모든 추출 단계를 가져옵니다 (내부 사용)
 *
 * @returns {ExtractionStage[]} 추출 단계 배열의 복사본
 */
export function getExtractionStages(): ExtractionStage[] {
  return [...EXTRACTION_STAGES];
}

/**
 * 우선순위를 신뢰도로 변환합니다 (테스트용)
 *
 * @param {number} priority - 패턴 우선순위 (1-10)
 * @returns {number} 신뢰도 (0-100)
 */
export function _priorityToConfidence(priority: number): number {
  return priorityToConfidence(priority);
}
