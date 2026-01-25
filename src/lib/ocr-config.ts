/**
 * TAG-DATA-TASK-004: OCR 설정 최적화 구현
 * SPEC-DATA-002: 이미지에서 텍스트 추출
 * DESCRIPTION: 이미지 품질 기반 OCR 설정 최적화
 */

/**
 * PSM (Page Segmentation Mode) 모드 상수
 */
export enum PsmMode {
  /** 자동 페이지 분할, OSD 없음 (기본값) */
  AUTO = 3,
  /** 단일 균일 블록으로 가정 */
  UNIFORM_BLOCK = 6,
  /** 희소 텍스트 (가능한 많은 텍스트 찾기) */
  SPARSE_TEXT = 11,
  /** 원시 라인 (이미지를 단일 텍스트 라인으로 처리) */
  RAW_LINE = 13,
}

/**
 * OEM (OCR Engine Mode) 모드 상수
 */
export enum OemMode {
  /** 레거시 엔진만 */
  LEGACY = 0,
  /** LSTM 엔진만 */
  LSTM_ONLY = 1,
  /** 기본값 */
  DEFAULT = 3,
}

/**
 * OCR 설정 인터페이스
 */
export interface OcrConfig {
  /** 페이지 분할 모드 */
  psmMode: number
  /** 신뢰도 임계값 (0-100) */
  confidenceThreshold: number
  /** OCR 엔진 모드 */
  oemMode: number
  /** 언어 코드 */
  language: string
}

/**
 * 이미지 품질 설정 인터페이스
 */
export interface ImageQualityConfig {
  /** 품질 점수 (0-100) */
  qualityScore: number
  /** 추천 PSM 모드 */
  recommendedPsm: number
  /** 추천 신뢰도 임계값 */
  recommendedThreshold: number
}

/**
 * 이미지 분석을 위한 매개변수 인터페이스
 */
export interface ImageAnalysisParams {
  width: number
  height: number
  hasNoise?: boolean
  contrast?: 'low' | 'medium' | 'high'
  brightness?: 'dark' | 'optimal' | 'bright'
  textDensity?: 'uniform' | 'sparse' | 'dense'
}

/**
 * 설정 유효성 검사 결과 인터페이스
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 해상도 임계값 상수 (픽셀)
 */
const RESOLUTION_THRESHOLDS = {
  FULL_HD: 1920 * 1080, // 2,073,600
  HD: 1280 * 720, // 921,600
  SD: 640 * 480, // 307,200
} as const

/**
 * 품질 점수 보정 상수
 */
const QUALITY_SCORES = {
  BASE: 40, // 기본 점수
  MAX: 100, // 최대 점수
  MIN: 0, // 최소 점수
}

/**
 * 해상도별 점수 보정
 */
const RESOLUTION_BONUSES = {
  FULL_HD: 25, // Full HD 해상도 보너스
  HD: 10, // HD 해상도 보너스
  SD: 5, // SD 해상도 보너스
} as const

/**
 * 노이즈 감점
 */
const NOISE_PENALTY = -20

/**
 * 대비 점수 보정
 */
const CONTRAST_SCORES = {
  HIGH: 15,
  MEDIUM: 5,
  LOW: -10,
} as const

/**
 * 밝기 점수 보정
 */
const BRIGHTNESS_SCORES = {
  OPTIMAL: 10,
  SUBOPTIMAL: -5, // dark 또는 bright
} as const

/**
 * 신뢰도 임계값 범위
 */
const THRESHOLD_RANGE = {
  MIN: 35,
  MAX: 100,
} as const

/**
 * 품질 기반 임계값 조정 계수
 */
const THRESHOLD_ADJUSTMENT_COEFFICIENT = 0.6

/**
 * 중간 품질 기준점
 */
const MID_QUALITY_BASE = 50

/**
 * 사전 정의된 설정 프리셋
 */
export const PRESET_CONFIGS: Record<'high' | 'medium' | 'low', OcrConfig> = {
  high: {
    psmMode: PsmMode.AUTO,
    confidenceThreshold: 60,
    oemMode: OemMode.LSTM_ONLY,
    language: 'kor+eng',
  },
  medium: {
    psmMode: PsmMode.AUTO,
    confidenceThreshold: 50,
    oemMode: OemMode.LSTM_ONLY,
    language: 'kor+eng',
  },
  low: {
    psmMode: PsmMode.SPARSE_TEXT,
    confidenceThreshold: 35,
    oemMode: OemMode.LSTM_ONLY,
    language: 'kor+eng',
  },
}

/**
 * 유효한 PSM 모드 집합
 */
const VALID_PSM_MODES = new Set([PsmMode.AUTO, PsmMode.UNIFORM_BLOCK, PsmMode.SPARSE_TEXT, PsmMode.RAW_LINE])

/**
 * 유효한 OEM 모드 집합
 */
const VALID_OEM_MODES = new Set([OemMode.LEGACY, OemMode.LSTM_ONLY, OemMode.DEFAULT])

/**
 * 기본 OCR 설정을 생성합니다
 *
 * @param overrides - 오버라이드할 설정
 * @returns 기본 OCR 설정
 */
export function createDefaultConfig(overrides: Partial<OcrConfig> = {}): OcrConfig {
  return {
    psmMode: PsmMode.AUTO,
    confidenceThreshold: 50, // 30% → 50% 상향 조정
    oemMode: OemMode.LSTM_ONLY,
    language: 'kor+eng',
    ...overrides,
  }
}

/**
 * 이미지 품질을 분석하고 평가합니다
 *
 * @param params - 이미지 분석 매개변수
 * @returns 이미지 품질 설정
 */
export function calculateImageQuality(params: ImageAnalysisParams): ImageQualityConfig {
  let qualityScore = QUALITY_SCORES.BASE

  // 해상도 점수 계산
  const resolution = params.width * params.height
  if (resolution >= RESOLUTION_THRESHOLDS.FULL_HD) {
    qualityScore += RESOLUTION_BONUSES.FULL_HD
  } else if (resolution >= RESOLUTION_THRESHOLDS.HD) {
    qualityScore += RESOLUTION_BONUSES.HD
  } else if (resolution >= RESOLUTION_THRESHOLDS.SD) {
    qualityScore += RESOLUTION_BONUSES.SD
  }

  // 노이즈 감점
  if (params.hasNoise) {
    qualityScore += NOISE_PENALTY
  }

  // 대비 점수
  if (params.contrast === 'high') {
    qualityScore += CONTRAST_SCORES.HIGH
  } else if (params.contrast === 'medium') {
    qualityScore += CONTRAST_SCORES.MEDIUM
  } else if (params.contrast === 'low') {
    qualityScore += CONTRAST_SCORES.LOW
  }

  // 밝기 점수
  if (params.brightness === 'optimal') {
    qualityScore += BRIGHTNESS_SCORES.OPTIMAL
  } else if (params.brightness === 'dark' || params.brightness === 'bright') {
    qualityScore += BRIGHTNESS_SCORES.SUBOPTIMAL
  }

  // 품질 점수 제한
  qualityScore = Math.max(QUALITY_SCORES.MIN, Math.min(QUALITY_SCORES.MAX, qualityScore))

  // PSM 모드 결정
  let recommendedPsm = PsmMode.AUTO
  if (params.textDensity === 'sparse') {
    recommendedPsm = PsmMode.SPARSE_TEXT
  } else if (params.textDensity === 'uniform') {
    recommendedPsm = PsmMode.UNIFORM_BLOCK
  }

  // 신뢰도 임계값 계산
  const recommendedThreshold = calculateThresholdFromScore(qualityScore)

  return {
    qualityScore,
    recommendedPsm,
    recommendedThreshold,
  }
}

/**
 * 품질 점수로부터 신뢰도 임계값을 계산합니다
 *
 * @param qualityScore - 품질 점수 (0-100)
 * @returns 신뢰도 임계값
 */
function calculateThresholdFromScore(qualityScore: number): number {
  // 품질 0%: 35%
  // 품질 50%: 50%
  // 품질 100%: 70%
  return Math.round(35 + (qualityScore / 100) * 35)
}

/**
 * 이미지 품질에 기반한 추천 OCR 설정을 반환합니다
 *
 * @param quality - 이미지 품질 설정
 * @param overrides - 추가 오버라이드 설정
 * @returns 추천 OCR 설정
 */
export function getRecommendedConfig(quality: ImageQualityConfig, overrides: Partial<OcrConfig> = {}): OcrConfig {
  return {
    psmMode: quality.recommendedPsm,
    confidenceThreshold: quality.recommendedThreshold,
    oemMode: OemMode.LSTM_ONLY,
    language: 'kor+eng',
    ...overrides,
  }
}

/**
 * 이미지 품질에 따라 신뢰도 임계값을 동적으로 조정합니다
 *
 * @param baseThreshold - 기본 신뢰도 임계값
 * @param qualityScore - 품질 점수 (0-100)
 * @returns 조정된 신뢰도 임계값
 */
export function adjustThresholdBasedOnQuality(baseThreshold: number, qualityScore: number): number {
  // 품질 50%: ±0%
  // 품질 100%: +30%
  // 품질 0%: -15%
  const adjustment = (qualityScore - MID_QUALITY_BASE) * THRESHOLD_ADJUSTMENT_COEFFICIENT
  const adjusted = baseThreshold + adjustment

  // 범위 제한
  return Math.max(THRESHOLD_RANGE.MIN, Math.min(THRESHOLD_RANGE.MAX, Math.round(adjusted)))
}

/**
 * OCR 설정의 유효성을 검사합니다
 *
 * @param config - 검사할 OCR 설정
 * @returns 유효성 검사 결과
 */
export function validateConfig(config: OcrConfig): ValidationResult {
  const errors: string[] = []

  // PSM 모드 검사
  if (!VALID_PSM_MODES.has(config.psmMode)) {
    errors.push(`Invalid PSM mode: ${config.psmMode}`)
  }

  // 신뢰도 임계값 검사
  if (config.confidenceThreshold < 0 || config.confidenceThreshold > 100) {
    errors.push(`confidence threshold must be between 0 and 100, got: ${config.confidenceThreshold}`)
  }

  // OEM 모드 검사
  if (!VALID_OEM_MODES.has(config.oemMode)) {
    errors.push(`Invalid OEM mode: ${config.oemMode}`)
  }

  // 언어 코드 검사
  if (!config.language || config.language.trim().length === 0) {
    errors.push('language code must not be empty')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
