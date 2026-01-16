/**
 * TASK-002: 신체 점수 추출 패턴 라이브러리
 * SPEC-OCR-001: OCR 정확도 향상 (70% → 95%)
 *
 * 16개 패턴을 통한 다양한 InBody 기기 형식 지원
 * @module pattern-library
 */

import type { PatternDefinition } from './types/extraction';
import { validatePatternDefinition } from './types/extraction';

// ========== Constants ==========

/**
 * 2-3자리 점수 패턴 (10-100)
 */
const SCORE_PATTERN = '(\\d{2,3})';

/**
 * 공백 패턴 (0개 이상의 공백)
 */
const OPTIONAL_SPACES = '\\s*';

/**
 * 한글/영문 구분자 패턴
 */
const SEPARATOR = `[:：]?${OPTIONAL_SPACES}`;

// ========== Helper Functions ==========

/**
 * InBody 770 패턴 생성 헬퍼
 */
function createInBody770Pattern(
  id: string,
  name: string,
  regex: RegExp,
  examples: string[],
): PatternDefinition {
  return {
    id,
    name,
    regex,
    priority: 1,
    description: `InBody 770 ${name}`,
    format: 'inbody770',
    examples,
  };
}

/**
 * InBody 970 패턴 생성 헬퍼
 */
function createInBody970Pattern(
  id: string,
  name: string,
  regex: RegExp,
  priority: number,
  examples: string[],
): PatternDefinition {
  return {
    id,
    name,
    regex,
    priority,
    description: `InBody 970 ${name}`,
    format: 'inbody970',
    examples,
  };
}

/**
 * InBody 720 패턴 생성 헬퍼
 */
function createInBody720Pattern(
  id: string,
  name: string,
  regex: RegExp,
  priority: number,
  examples: string[],
): PatternDefinition {
  return {
    id,
    name,
    regex,
    priority,
    description: `InBody 720 ${name}`,
    format: 'inbody720',
    examples,
  };
}

/**
 * OntoFit 패턴 생성 헬퍼
 */
function createOntoFitPattern(
  id: string,
  name: string,
  regex: RegExp,
  priority: number,
  examples: string[],
): PatternDefinition {
  return {
    id,
    name,
    regex,
    priority,
    description: `OntoFit ${name}`,
    format: 'ontofit',
    examples,
  };
}

/**
 * Generic 패턴 생성 헬퍼
 */
function createGenericPattern(
  id: string,
  name: string,
  regex: RegExp,
  priority: number,
  examples: string[],
): PatternDefinition {
  return {
    id,
    name,
    regex,
    priority,
    description: `일반 ${name}`,
    format: 'generic',
    examples,
  };
}

// ========== Pattern Definitions ==========

/**
 * 신체 점수 추출 패턴 라이브러리
 *
 * InBody 770 (3개), InBody 970 (3개), InBody 720 (2개),
 * OntoFit (2개), Generic (6개) = 총 16개 패턴
 */
const BODY_SCORE_PATTERNS: PatternDefinition[] = [
  // ========== InBody 770 패턴 (Priority 1: 고신뢰) ==========
  createInBody770Pattern(
    'inbody770-score-001',
    '표준 형식',
    // "신체 점수"와 "표준" 사이의 모든 텍스트 매칭 (후처리로 숫자 추출)
    /신체\s*점수[^표준]*?표준/,
    ['신체 점수 무게 67.00 (56.0-75.7) 100.0 표준', '신체 점수 85 표준', '신체점수 100.0 표준'],
  ),
  createInBody770Pattern(
    'inbody770-score-002',
    '점수/만점 형식',
    new RegExp(`${SCORE_PATTERN}${OPTIONAL_SPACES}\\/${OPTIONAL_SPACES}100${OPTIONAL_SPACES}점`),
    ['85/100점', '90 / 100 점'],
  ),
  createInBody770Pattern(
    'inbody770-score-003',
    'Body Score 영문',
    /Body\s*Score[^0-9]*(\d{2,3})\s*Standard/i,
    ['Body Score 90 Standard', 'body score 85 standard'],
  ),

  // ========== InBody 970 패턴 (Priority 1-3: 고신뢰) ==========
  createInBody970Pattern(
    'inbody970-score-001',
    '신체점수 형식',
    new RegExp(`신체점수${SEPARATOR}${SCORE_PATTERN}`),
    1,
    ['신체점수: 85', '신체점수：90'],
  ),
  createInBody970Pattern(
    'inbody970-score-002',
    '총점 형식',
    new RegExp(`총점${SEPARATOR}${SCORE_PATTERN}`),
    2,
    ['총점: 95', '총점：100'],
  ),
  createInBody970Pattern(
    'inbody970-score-003',
    '점수 라벨',
    new RegExp(`점수${SEPARATOR}${SCORE_PATTERN}`),
    3,
    ['점수: 88', '점수：92'],
  ),

  // ========== InBody 720 패턴 (Priority 2-3: 중신뢰) ==========
  createInBody720Pattern(
    'inbody720-score-001',
    '신체평가 점수',
    new RegExp(`신체평가${OPTIONAL_SPACES}점수[^0-9]*${SCORE_PATTERN}`),
    2,
    ['신체평가 점수 85', '신체평가  점수  90'],
  ),
  createInBody720Pattern(
    'inbody720-score-002',
    '평가점',
    new RegExp(`평가점${SEPARATOR}${SCORE_PATTERN}`),
    3,
    ['평가점: 87', '평가점：93'],
  ),

  // ========== OntoFit 패턴 (Priority 3-4: 중신뢰) ==========
  createOntoFitPattern(
    'ontofit-score-001',
    '신체 점수',
    new RegExp(`신체${OPTIONAL_SPACES}점수[^0-9]*${SCORE_PATTERN}`),
    3,
    ['신체 점수 82', '신체  점수  88'],
  ),
  createOntoFitPattern(
    'ontofit-score-002',
    '바디스코어',
    new RegExp(`바디${OPTIONAL_SPACES}스코어[^0-9]*${SCORE_PATTERN}`),
    4,
    ['바디스코어 91', '바디  스코어  86'],
  ),

  // ========== Generic 패턴 (Priority 5-10: 저신뢰/폴백) ==========
  createGenericPattern(
    'generic-score-001',
    '점수 형식',
    new RegExp(`점수${SEPARATOR}${SCORE_PATTERN}`),
    5,
    ['점수: 85', '점수：90', '점수 95'],
  ),
  createGenericPattern(
    'generic-score-002',
    'Score 영문',
    /Score\s*[:：]?\s*(\d{2,3})/i,
    6,
    ['Score: 88', 'score：92', 'Score 95'],
  ),
  createGenericPattern(
    'generic-score-003',
    '숫자+점',
    new RegExp(`${SCORE_PATTERN}${OPTIONAL_SPACES}점`),
    7,
    ['85점', '90 점', '95점'],
  ),
  createGenericPattern(
    'generic-score-004',
    '숫자+점수',
    new RegExp(`${SCORE_PATTERN}${OPTIONAL_SPACES}점수`),
    7,
    ['85점수', '90 점수'],
  ),
  createGenericPattern(
    'generic-score-005',
    '2-3자리 숫자 (문맥 기반)',
    /(?:^|\D)(\d{2,3})(?:\D|$)/,
    10,
    ['85', '90', '100'],
  ),
  createGenericPattern(
    'generic-score-006',
    '혼합 형식 (한글/영문)',
    new RegExp(`(?:신체|Body|바디|Score)${OPTIONAL_SPACES}(?:점수|Score|스코어)?[^0-9]*${SCORE_PATTERN}`, 'i'),
    9,
    ['신체 85', 'Body 90', '바디스코어 95', 'Score 88'],
  ),
];

// ========== Public Functions ==========

/**
 * 모든 신체 점수 패턴을 가져옵니다
 *
 * @returns 우선순위별로 정렬된 패턴 배열
 */
export function getBodyScorePatterns(): PatternDefinition[] {
  // 우선순위 오름차순 정렬 (복사본 반환)
  return [...BODY_SCORE_PATTERNS].sort((a, b) => a.priority - b.priority);
}

/**
 * ID로 패턴을 찾습니다
 *
 * @param id - 패턴 ID
 * @returns 패턴 또는 undefined
 */
export function getPatternById(id: string): PatternDefinition | undefined {
  return BODY_SCORE_PATTERNS.find((pattern) => pattern.id === id);
}

/**
 * 특정 형식의 패턴을 가져옵니다
 *
 * @param format - InBody 기기 형식
 * @returns 해당 형식의 패턴 배열
 */
export function getPatternsByFormat(format: string): PatternDefinition[] {
  return BODY_SCORE_PATTERNS.filter((pattern) => pattern.format === format);
}

/**
 * 우선순위 범위内的 패턴을 가져옵니다
 *
 * @param minPriority - 최소 우선순위
 * @param maxPriority - 최대 우선순위
 * @returns 우선순위 범위内的 패턴 배열
 */
export function getPatternsByPriority(
  minPriority: number,
  maxPriority: number,
): PatternDefinition[] {
  return BODY_SCORE_PATTERNS.filter(
    (pattern) => pattern.priority >= minPriority && pattern.priority <= maxPriority,
  );
}

/**
 * 패턴을 검증합니다
 *
 * @param pattern - 검증할 패턴
 * @returns Zod 검증 결과
 */
export function validatePattern(pattern: unknown) {
  return validatePatternDefinition(pattern);
}

/**
 * 패턴의 유효성을 확인합니다 (Type Guard)
 *
 * @param pattern - 확인할 패턴
 * @returns 패턴 유효 여부
 */
export function isValidPattern(pattern: unknown): pattern is PatternDefinition {
  const result = validatePatternDefinition(pattern);
  return result.success;
}
