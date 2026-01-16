/**
 * TAG-DATA-TASK-004-TEST: OCR 설정 최적화 테스트
 * SPEC-DATA-002: 이미지에서 텍스트 추출
 * DESCRIPTION: OCR 설정 최적화를 위한 TDD 테스트
 */

import { describe, it, expect } from 'vitest'
import {
  OcrConfig,
  ImageQualityConfig,
  PsmMode,
  OemMode,
  createDefaultConfig,
  calculateImageQuality,
  getRecommendedConfig,
  adjustThresholdBasedOnQuality,
  validateConfig,
  PRESET_CONFIGS,
} from '@/lib/ocr-config'

describe('OcrConfig', () => {
  describe('타입 정의', () => {
    it('OcrConfig 인터페이스가 올바른 구조를 가져야 한다', () => {
      const config: OcrConfig = {
        psmMode: 3,
        confidenceThreshold: 50,
        oemMode: 1,
        language: 'kor+eng',
      }

      expect(config.psmMode).toBe(3)
      expect(config.confidenceThreshold).toBe(50)
      expect(config.oemMode).toBe(1)
      expect(config.language).toBe('kor+eng')
    })

    it('ImageQualityConfig 인터페이스가 올바른 구조를 가져야 한다', () => {
      const quality: ImageQualityConfig = {
        qualityScore: 85,
        recommendedPsm: 3,
        recommendedThreshold: 50,
      }

      expect(quality.qualityScore).toBe(85)
      expect(quality.recommendedPsm).toBe(3)
      expect(quality.recommendedThreshold).toBe(50)
    })
  })

  describe('PRESET_CONFIGS', () => {
    it('프리셋 설정이 정의되어 있어야 한다', () => {
      expect(PRESET_CONFIGS).toBeDefined()
      expect(PRESET_CONFIGS.high).toBeDefined()
      expect(PRESET_CONFIGS.medium).toBeDefined()
      expect(PRESET_CONFIGS.low).toBeDefined()
    })

    it('고품질 프리셋이 높은 신뢰도 임계값을 가져야 한다', () => {
      expect(PRESET_CONFIGS.high.confidenceThreshold).toBeGreaterThanOrEqual(60)
    })

    it('저품질 프리셋이 낮은 신뢰도 임계값을 가져야 한다', () => {
      expect(PRESET_CONFIGS.low.confidenceThreshold).toBeLessThanOrEqual(40)
    })
  })

  describe('createDefaultConfig', () => {
    it('기본 OCR 설정을 생성해야 한다', () => {
      const config = createDefaultConfig()

      expect(config).toBeDefined()
      expect(config.psmMode).toBe(PsmMode.AUTO)
      expect(config.confidenceThreshold).toBe(50) // 30% → 50%
      expect(config.oemMode).toBe(OemMode.LSTM_ONLY)
      expect(config.language).toBe('kor+eng')
    })

    it('사용자 정의 설정으로 오버라이드할 수 있어야 한다', () => {
      const config = createDefaultConfig({
        confidenceThreshold: 60,
        psmMode: PsmMode.SPARSE_TEXT,
      })

      expect(config.confidenceThreshold).toBe(60)
      expect(config.psmMode).toBe(PsmMode.SPARSE_TEXT)
      expect(config.oemMode).toBe(OemMode.LSTM_ONLY) // 기본값 유지
    })
  })

  describe('calculateImageQuality', () => {
    it('높은 품질 점수를 반환해야 한다 (명확한 이미지)', () => {
      const quality = calculateImageQuality({
        width: 1920,
        height: 1080,
        hasNoise: false,
        contrast: 'high',
        brightness: 'optimal',
      })

      expect(quality.qualityScore).toBeGreaterThan(70)
      expect(quality.recommendedPsm).toBeDefined()
      expect(quality.recommendedThreshold).toBeGreaterThanOrEqual(50)
    })

    it('낮은 품질 점수를 반환해야 한다 (노이즈 많은 이미지)', () => {
      const quality = calculateImageQuality({
        width: 640,
        height: 480,
        hasNoise: true,
        contrast: 'low',
        brightness: 'dark',
      })

      expect(quality.qualityScore).toBeLessThan(50)
      expect(quality.recommendedPsm).toBeDefined()
      expect(quality.recommendedThreshold).toBeLessThan(50)
    })

    it('중간 품질 점수를 반환해야 한다 (보통 이미지)', () => {
      const quality = calculateImageQuality({
        width: 1280,
        height: 720,
        hasNoise: false,
        contrast: 'medium',
        brightness: 'optimal',
      })

      expect(quality.qualityScore).toBeGreaterThanOrEqual(50)
      expect(quality.qualityScore).toBeLessThanOrEqual(70)
    })

    it('희소 텍스트 이미지에서 PSM 11을 추천해야 한다', () => {
      const quality = calculateImageQuality({
        width: 1920,
        height: 1080,
        hasNoise: false,
        contrast: 'high',
        brightness: 'optimal',
        textDensity: 'sparse',
      })

      expect(quality.recommendedPsm).toBe(PsmMode.SPARSE_TEXT)
    })

    it('단일 블록 텍스트에서 PSM 6을 추천해야 한다', () => {
      const quality = calculateImageQuality({
        width: 1920,
        height: 1080,
        hasNoise: false,
        contrast: 'high',
        brightness: 'optimal',
        textDensity: 'uniform',
      })

      expect(quality.recommendedPsm).toBe(PsmMode.UNIFORM_BLOCK)
    })
  })

  describe('getRecommendedConfig', () => {
    it('높은 품질 이미지에 적합한 설정을 반환해야 한다', () => {
      const quality: ImageQualityConfig = {
        qualityScore: 85,
        recommendedPsm: PsmMode.AUTO,
        recommendedThreshold: 60,
      }

      const config = getRecommendedConfig(quality)

      expect(config.psmMode).toBe(quality.recommendedPsm)
      expect(config.confidenceThreshold).toBe(quality.recommendedThreshold)
    })

    it('낮은 품질 이미지에 적합한 설정을 반환해야 한다', () => {
      const quality: ImageQualityConfig = {
        qualityScore: 35,
        recommendedPsm: PsmMode.SPARSE_TEXT,
        recommendedThreshold: 35,
      }

      const config = getRecommendedConfig(quality)

      expect(config.psmMode).toBe(quality.recommendedPsm)
      expect(config.confidenceThreshold).toBe(quality.recommendedThreshold)
    })

    it('사용자 정의 설정으로 병합할 수 있어야 한다', () => {
      const quality: ImageQualityConfig = {
        qualityScore: 75,
        recommendedPsm: PsmMode.AUTO,
        recommendedThreshold: 55,
      }

      const config = getRecommendedConfig(quality, {
        language: 'eng',
      })

      expect(config.psmMode).toBe(quality.recommendedPsm)
      expect(config.language).toBe('eng')
    })
  })

  describe('adjustThresholdBasedOnQuality', () => {
    it('높은 품질에서 임계값을 상향 조정해야 한다', () => {
      const baseThreshold = 50
      const adjusted = adjustThresholdBasedOnQuality(baseThreshold, 85)

      expect(adjusted).toBeGreaterThan(baseThreshold)
      expect(adjusted).toBeLessThanOrEqual(100)
    })

    it('낮은 품질에서 임계값을 하향 조정해야 한다', () => {
      const baseThreshold = 50
      const adjusted = adjustThresholdBasedOnQuality(baseThreshold, 35)

      expect(adjusted).toBeLessThan(baseThreshold)
      expect(adjusted).toBeGreaterThanOrEqual(20)
    })

    it('중간 품질에서 임계값을 유지해야 한다', () => {
      const baseThreshold = 50
      const adjusted = adjustThresholdBasedOnQuality(baseThreshold, 60)

      // 중간 품질(60)에서는 기본값에 가까운 조정이 되어야 함
      expect(adjusted).toBeGreaterThan(baseThreshold - 10)
      expect(adjusted).toBeLessThan(baseThreshold + 10)
    })

    it('임계값이 0-100 범위를 벗어나지 않아야 한다', () => {
      const baseThreshold = 50

      // 극단적으로 높은 품질
      const highAdjusted = adjustThresholdBasedOnQuality(baseThreshold, 100)
      expect(highAdjusted).toBeLessThanOrEqual(100)

      // 극단적으로 낮은 품질
      const lowAdjusted = adjustThresholdBasedOnQuality(baseThreshold, 0)
      expect(lowAdjusted).toBeGreaterThanOrEqual(20)
    })

    it('품질 점수에 따른 선형 조정을 수행해야 한다', () => {
      const baseThreshold = 50

      // 품질 50%: ±0%
      const mid = adjustThresholdBasedOnQuality(baseThreshold, 50)
      expect(mid).toBe(50)

      // 품질 100%: +30%
      const high = adjustThresholdBasedOnQuality(baseThreshold, 100)
      expect(high).toBe(80)

      // 품질 0%: -15%
      const low = adjustThresholdBasedOnQuality(baseThreshold, 0)
      expect(low).toBe(35)
    })
  })

  describe('validateConfig', () => {
    it('유효한 설정을 통과시켜야 한다', () => {
      const config: OcrConfig = {
        psmMode: 3,
        confidenceThreshold: 50,
        oemMode: 1,
        language: 'kor+eng',
      }

      const result = validateConfig(config)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('유효하지 않은 PSM 모드를 거부해야 한다', () => {
      const config: OcrConfig = {
        psmMode: 999, // 유효하지 않음
        confidenceThreshold: 50,
        oemMode: 1,
        language: 'kor+eng',
      }

      const result = validateConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid PSM mode: 999')
    })

    it('유효하지 않은 신뢰도 임계값을 거부해야 한다', () => {
      const config: OcrConfig = {
        psmMode: 3,
        confidenceThreshold: 150, // 유효하지 않음
        oemMode: 1,
        language: 'kor+eng',
      }

      const result = validateConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('confidence'))).toBe(true)
    })

    it('유효하지 않은 OEM 모드를 거부해야 한다', () => {
      const config: OcrConfig = {
        psmMode: 3,
        confidenceThreshold: 50,
        oemMode: 5, // 유효하지 않음
        language: 'kor+eng',
      }

      const result = validateConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid OEM mode: 5')
    })

    it('빈 언어 코드를 거부해야 한다', () => {
      const config: OcrConfig = {
        psmMode: 3,
        confidenceThreshold: 50,
        oemMode: 1,
        language: '',
      }

      const result = validateConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('language'))).toBe(true)
    })

    it('여러 오류를 모두 보고해야 한다', () => {
      const config: OcrConfig = {
        psmMode: 999,
        confidenceThreshold: 150,
        oemMode: 5,
        language: '',
      }

      const result = validateConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('PSM Mode 상수', () => {
    it('PsmMode enum이 올바른 값을 가져야 한다', () => {
      expect(PsmMode.AUTO).toBe(3)
      expect(PsmMode.UNIFORM_BLOCK).toBe(6)
      expect(PsmMode.SPARSE_TEXT).toBe(11)
      expect(PsmMode.RAW_LINE).toBe(13)
    })
  })

  describe('OEM Mode 상수', () => {
    it('OemMode enum이 올바른 값을 가져야 한다', () => {
      expect(OemMode.LSTM_ONLY).toBe(1)
      expect(OemMode.LEGACY).toBe(0)
      expect(OemMode.DEFAULT).toBe(3)
    })
  })
})
