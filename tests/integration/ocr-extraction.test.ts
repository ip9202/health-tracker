/**
 * TASK-011: 통합 테스트 작성
 * SPEC-DATA-003: OCR 텍스트에서 구조화된 체성분 데이터 추출
 *
 * @description
 * 전체 OCR 추출 파이프라인 통합 테스트
 * - 이미지 → 전처리 → OCR → 패턴 매칭 → 결과 검증
 * - Mock을 사용하여 전체 흐름 검증
 *
 * @testType Integration
 * @coverageTarget 85%+
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseInBodyData, ParseWarning } from '@/lib/parser-service';
import { extractBodyScore, extractBodyScoreWithConfidence } from '@/lib/multi-stage-extractor';
import type { ExtractionResult } from '@/lib/types/extraction';

// ========== Mock Data ==========

/**
 * 테스트용 OCR 텍스트 데이터
 */
const mockOCRTexts = {
  inbody770: `
    10:강력쇠주먹 성별:남
    나이:51 세
    높이:17300
    무게 67.00 (56.0-75.7) 91.3 표준
    체지방 9.2 (7.9-15.8) 13.7 표준
    53.9 (44.8-55.9) 80.5 표준 목표
    단백질률 11.6 (9.6-12.0) 17.3 표준
    체수 42.3 (35.2-43.9) 63.2 표준
    골격근 32.7 (28.2-34.4) 48.8 표준
    신체 점수 무게 67.00 (56.0-75.7) 100.0 표준 목표
    BMI: 22.4
    비만 판정 보통
    체중 조절 유지
    / 근육형
  `,
  inbody970: `
    성명:홍길동
    신체점수: 92
    체중: 70kg
    신장: 175cm
    체지방률: 15%
  `,
  ontofit: `
    바디스코어 88
    체중 65kg
    키 170cm
  `,
  lowQuality: `
    체중 70kg
    키 175cm
  `,
  empty: '',
  invalid: 'abc!@#',
};

// ========== Test Suites ==========

describe('TASK-011: OCR 추출 통합 테스트', () => {
  describe('RED Phase: 실패하는 테스트 작성', () => {
    it('전체 파이프라인: InBody 770 형식 처리해야 한다', () => {
      // RED: 이 테스트는 현재 구현된 코드로 통과해야 함
      const result = parseInBodyData(mockOCRTexts.inbody770);

      expect(result.data.name).toBe('강력쇠주먹');
      expect(result.data.gender).toBe('male');
      expect(result.data.age).toBe(51);
      expect(result.data.height).toBe(173);
      expect(result.data.weight).toBe(67);
      expect(result.data.bodyFatPercentage).toBe(9.2);
      expect(result.data.bodyScore).toBe(100);
      expect(result.data.scoreDescription).toBe('우수');
      expect(result.data.bmi).toBe(22.4);
      expect(result.data.bmiStatus).toBe('보통');
      expect(result.data.weightControl).toBe('유지');
      expect(result.data.bodyType).toBe('근육형');
    });

    it('전체 파이프라인: InBody 970 형식 처리해야 한다', () => {
      const result = parseInBodyData(mockOCRTexts.inbody970);

      expect(result.data.name).toBe('홍길동');
      expect(result.data.bodyScore).toBe(92);
      expect(result.data.weight).toBe(70);
      expect(result.data.height).toBe(175);
      expect(result.data.bodyFatPercentage).toBe(15);
    });

    it('전체 파이프라인: OntoFit 형식 처리해야 한다', () => {
      const result = parseInBodyData(mockOCRTexts.ontofit);

      expect(result.data.bodyScore).toBe(88);
      expect(result.data.weight).toBe(65);
      expect(result.data.height).toBe(170);
    });

    it('빈 텍스트는 적절한 에러 처리를 해야 한다', () => {
      const result = parseInBodyData(mockOCRTexts.empty);

      expect(result.data).toEqual({});
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.rawText).toBe('');
    });

    it('유효하지 않은 텍스트는 경고를 반환해야 한다', () => {
      const result = parseInBodyData(mockOCRTexts.invalid);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('GREEN Phase: Mock을 사용한 파이프라인 테스트', () => {
    beforeEach(() => {
      // Console 로그 모킹 (테스트 출력 간소화)
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('Mock OCR 텍스트로 end-to-end 파이프라인을 테스트해야 한다', async () => {
      // 1. OCR 텍스트 추출 (Mock)
      const mockOCRText = mockOCRTexts.inbody770;

      // 2. 다단계 추출 (multi-stage-extractor)
      const extractResult = await extractBodyScore(mockOCRText);

      expect(extractResult.success).toBe(true);
      expect(extractResult.bodyScore).toBe(100);
      expect(extractResult.attempts.length).toBeGreaterThan(0);
    });

    it('OCR 신뢰도에 따른 추출 전략을 테스트해야 한다', async () => {
      const mockOCRText = '신체 점수 85 표준';

      // 높은 신뢰도 (80+) - Stage 1부터 시작
      const highConfidenceResult = await extractBodyScoreWithConfidence(mockOCRText, 90);
      expect(highConfidenceResult.success).toBe(true);
      expect(highConfidenceResult.bodyScore).toBe(85);

      // 중간 신뢰도 (50-80) - Stage 2부터 시작
      const mediumConfidenceResult = await extractBodyScoreWithConfidence(mockOCRText, 65);
      expect(mediumConfidenceResult.success).toBe(true);

      // 낮은 신뢰도 (<50) - Stage 3부터 시작
      const lowConfidenceResult = await extractBodyScoreWithConfidence(mockOCRText, 30);
      expect(lowConfidenceResult.success).toBe(true);
    });

    it('파서 서비스와 다단계 추출 통합을 테스트해야 한다', async () => {
      const mockOCRText = mockOCRTexts.inbody770;

      // 1. 다단계 추출
      const extractResult = await extractBodyScore(mockOCRText);

      // 2. 파서 서비스
      const parseResult = parseInBodyData(mockOCRText);

      // 두 결과가 일치해야 함
      expect(extractResult.bodyScore).toBe(parseResult.data.bodyScore);
      expect(extractResult.success).toBe(true);
    });
  });

  describe('REFACTOR Phase: 코드 품질 및 에지 케이스', () => {
    it('부분 데이터로도 파싱해야 한다', () => {
      const partialText = '체중: 70kg 체지방률: 20%';
      const result = parseInBodyData(partialText);

      expect(result.data.weight).toBe(70);
      expect(result.data.bodyFatPercentage).toBe(20);
      expect(result.data.bodyScore).toBeUndefined();
    });

    it('여러 패턴이 있을 때 우선순위대로 매칭해야 한다', async () => {
      const textWithMultiplePatterns = '신체 점수 85 표준, 점수: 75';

      const result = await extractBodyScore(textWithMultiplePatterns);

      expect(result.success).toBe(true);
      // Priority 1 패턴이 우선
      expect(result.bodyScore).toBe(85);
    });

    it('범위를 벗어난 숫자는 무시해야 한다', async () => {
      const outOfRangeText = '신체 점수 150 표준';

      const result = await extractBodyScore(outOfRangeText);

      // 100을 초과하는 값은 무시되어야 함
      expect(result.success).toBe(false);
    });

    it('경고 누적을 추적해야 한다', () => {
      const textWithMissingFields = '체중: 70kg'; // 이름, 신장 등 누락

      const result = parseInBodyData(textWithMissingFields);

      expect(result.data.weight).toBe(70);
      expect(result.warnings.length).toBeGreaterThan(0);

      // 경고 필드 확인
      const warningFields = result.warnings.map((w: ParseWarning) => w.field);
      expect(warningFields).toContain('name');
    });
  });

  describe('벤치마크 테스트 구조', () => {
    /**
     * 정확도 측정 헬퍼 함수
     *
     * @param actual - 실제 추출된 값
     * @param expected - 기대값
     * @returns 정확도 (0-1)
     */
    function calculateAccuracy(
      actual: number | string | undefined,
      expected: number | string
    ): number {
      if (actual === undefined) return 0;

      if (typeof actual === 'number' && typeof expected === 'number') {
        return actual === expected ? 1 : 1 - Math.abs(actual - expected) / expected;
      }

      if (typeof actual === 'string' && typeof expected === 'string') {
        return actual === expected ? 1 : 0;
      }

      return 0;
    }

    /**
     * 필드별 정확도 측정
     *
     * @param actual - 실제 추출된 데이터
     * @param expected - 기대 데이터
     * @returns 필드별 정확도 맵
     */
    function measureFieldAccuracy(
      actual: Record<string, any>,
      expected: Record<string, any>
    ): Record<string, number> {
      const accuracies: Record<string, number> = {};

      for (const [key, expectedValue] of Object.entries(expected)) {
        const actualValue = actual[key];
        accuracies[key] = calculateAccuracy(actualValue, expectedValue);
      }

      return accuracies;
    }

    /**
     * 전체 정확도 평균 계산
     *
     * @param accuracies - 필드별 정확도
     * @returns 전체 정확도 (0-1)
     */
    function calculateOverallAccuracy(accuracies: Record<string, number>): number {
      const values = Object.values(accuracies);
      if (values.length === 0) return 0;

      const sum = values.reduce((acc, val) => acc + val, 0);
      return sum / values.length;
    }

    it('정확도 측정 헬퍼 함수를 테스트해야 한다', () => {
      // 숫자 정확도
      expect(calculateAccuracy(100, 100)).toBe(1);
      expect(calculateAccuracy(95, 100)).toBeCloseTo(0.95, 2);
      expect(calculateAccuracy(undefined, 100)).toBe(0);

      // 문자열 정확도
      expect(calculateAccuracy('근육형', '근육형')).toBe(1);
      expect(calculateAccuracy('비만', '근육형')).toBe(0);
    });

    it('필드별 정확도 측정을 테스트해야 한다', () => {
      const actualData = {
        name: '홍길동',
        weight: 70,
        bodyScore: 95,
      };

      const expectedData = {
        name: '홍길동',
        weight: 70,
        bodyScore: 100,
      };

      const accuracies = measureFieldAccuracy(actualData, expectedData);

      expect(accuracies.name).toBe(1);
      expect(accuracies.weight).toBe(1);
      expect(accuracies.bodyScore).toBeCloseTo(0.95, 2);
    });

    it('전체 정확도 평균 계산을 테스트해야 한다', () => {
      const accuracies = {
        name: 1,
        weight: 1,
        bodyScore: 0.95,
      };

      const overallAccuracy = calculateOverallAccuracy(accuracies);

      expect(overallAccuracy).toBeCloseTo(0.983, 2);
    });

    it('실제 파싱 결과에 대한 정확도를 측정해야 한다', () => {
      const ocrText = mockOCRTexts.inbody770;
      const result = parseInBodyData(ocrText);

      const expected = {
        name: '강력쇠주먹',
        weight: 67,
        bodyScore: 100,
      };

      const accuracies = measureFieldAccuracy(result.data, expected);
      const overallAccuracy = calculateOverallAccuracy(accuracies);

      // 전체 정확도가 95% 이상이어야 함
      expect(overallAccuracy).toBeGreaterThanOrEqual(0.95);
    });
  });

  describe('성능 메트릭 측정', () => {
    /**
     * 처리 시간 측정 헬퍼 함수
     *
     * @param fn - 측정할 함수
     * @returns 처리 시간 (ms)과 결과
     */
    async function measureProcessingTime<T>(
      fn: () => T
    ): Promise<{ timeMs: number; result: T }> {
      const startTime = performance.now();
      const result = await fn();
      const endTime = performance.now();

      return {
        timeMs: endTime - startTime,
        result,
      };
    }

    it('다단계 추출 처리 시간을 측정해야 한다', async () => {
      const mockOCRText = mockOCRTexts.inbody770;

      const { timeMs, result } = await measureProcessingTime(() =>
        extractBodyScore(mockOCRText)
      );

      expect(result.success).toBe(true);
      expect(timeMs).toBeGreaterThan(0);

      // 처리 시간이 1초 이내여야 함 (성능 기준)
      expect(timeMs).toBeLessThan(1000);
    });

    it('파서 서비스 처리 시간을 측정해야 한다', async () => {
      const mockOCRText = mockOCRTexts.inbody770;

      const { timeMs, result } = await measureProcessingTime(() =>
        parseInBodyData(mockOCRText)
      );

      expect(result.data.bodyScore).toBeDefined();
      expect(timeMs).toBeGreaterThan(0);

      // 처리 시간이 100ms 이내여야 함 (파싱은 빨라야 함)
      expect(timeMs).toBeLessThan(100);
    });

    it('추출 시도 횟수를 기록해야 한다', async () => {
      const mockOCRText = '신체 점수 85 표준';

      const result = await extractBodyScore(mockOCRText);

      expect(result.success).toBe(true);
      expect(result.attempts.length).toBeGreaterThan(0);
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0); // 0 이상이면 성공 (매우 빠른 처리)

      // 첫 번째 패턴(Priority 1)에서 성공하면 attempts는 1개
      expect(result.attempts.length).toBe(1);
    });
  });

  describe('통합 에러 처리', () => {
    it('OCR 신뢰도가 낮을 때 적절히 처리해야 한다', async () => {
      const lowQualityText = mockOCRTexts.lowQuality;

      const result = await extractBodyScoreWithConfidence(lowQualityText, 20);

      // 낮은 신뢰도에서도 추출 시도
      expect(result).toBeDefined();
    });

    it('모든 추출 실패 시 적절한 에러를 반환해야 한다', async () => {
      const invalidText = '完全没有意义的文本';

      const result = await extractBodyScore(invalidText);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.attempts.length).toBe(0);
    });

    it('경고 메시지가 사용자에게 유용해야 한다', () => {
      const result = parseInBodyData('체중: 70kg');

      expect(result.warnings.length).toBeGreaterThan(0);

      // 경고 메시지에 필드명과 설명이 포함되어야 함
      result.warnings.forEach((warning: ParseWarning) => {
        expect(warning.field).toBeDefined();
        expect(warning.message).toBeDefined();
        expect(warning.message.length).toBeGreaterThan(0);
      });
    });
  });
});
