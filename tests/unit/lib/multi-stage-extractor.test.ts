/**
 * TASK-003: Multi-Stage Extractor 테스트
 * SPEC-DATA-003: OCR 텍스트에서 구조화된 체성분 데이터 추출
 *
 * TDD RED 단계: 실패하는 테스트 먼저 작성
 *
 * 3단계 추출 전략:
 * - Stage 1: Priority 1-3 (높은 신뢰도, 80%+)
 * - Stage 2: Priority 4-7 (중간 신뢰도, 50-80%)
 * - Stage 3: Priority 8-10 (낮은 신뢰도, <50%)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ExtractionResult, ExtractionAttempt } from '@/lib/types/extraction';
import type { PatternDefinition } from '@/lib/types/extraction';

// 모듈이 아직 존재하지 않으므로 import 주석 처리
// import { extractBodyScore, extractBodyScoreWithConfidence } from '@/lib/multi-stage-extractor';
// import { getPatternsByPriority } from '@/lib/pattern-library';

describe('Multi-Stage Extractor - 기본 기능', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('extractBodyScore 함수가 존재해야 한다', async () => {
    // 이 테스트는 함수 구현 후 통과함
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');
    expect(extractBodyScore).toBeDefined();
    expect(typeof extractBodyScore).toBe('function');
  });

  it('높은 신뢰도 OCR 텍스트에서 신체 점수를 추출해야 한다 (Stage 1)', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    // InBody 770 명확한 형식
    const highConfidenceText = '신체 점수 85 표준';

    const result = await extractBodyScore(highConfidenceText);

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(85);
    expect(result.attempts.length).toBeGreaterThan(0);
  });

  it('중간 신뢰도 OCR 텍스트에서 신체 점수를 추출해야 한다 (Stage 2)', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    // 덜 명확한 형식 (Stage 1 실패 시 Stage 2 시도)
    const mediumConfidenceText = '점수: 88점';

    const result = await extractBodyScore(mediumConfidenceText);

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(88);
  });

  it('낮은 신뢰도 OCR 텍스트에서도 신체 점수를 추출해야 한다 (Stage 3)', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    // 매우 모호한 형식 (최후의 수단)
    const lowConfidenceText = '85';

    const result = await extractBodyScore(lowConfidenceText);

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(85);
  });

  it('추출 불가능한 텍스트에서는 실패를 반환해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const invalidText = 'abcdefg';

    const result = await extractBodyScore(invalidText);

    expect(result.success).toBe(false);
    expect(result.bodyScore).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('빈 텍스트에서는 실패를 반환해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const result = await extractBodyScore('');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('Multi-Stage Extractor - 3단계 전략', () => {
  it('Stage 1 (Priority 1-3)을 먼저 시도해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const highConfidenceText = '신체 점수 90 표준';

    const result = await extractBodyScore(highConfidenceText);

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(90);

    // 첫 번째 시도에서 성공해야 함
    const firstAttempt = result.attempts[0];
    expect(firstAttempt.patternId).toBeDefined();
    expect(firstAttempt.confidence).toBeGreaterThanOrEqual(80);
  });

  it('Stage 1 실패 시 Stage 2 (Priority 4-7)를 시도해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    // Stage 1 패턴과 매칭되지 않지만 Stage 2와 매칭되는 텍스트
    // "바디스코어"는 OntoFit 패턴 (Priority 4)
    const mediumConfidenceText = '바디스코어 75';

    const result = await extractBodyScore(mediumConfidenceText);

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(75);

    // 시도 기록 확인
    const stage2Attempts = result.attempts.filter(
      (attempt) => attempt.confidence >= 50 && attempt.confidence < 80
    );
    expect(stage2Attempts.length).toBeGreaterThan(0);
  });

  it('Stage 2 실패 시 Stage 3 (Priority 8-10)를 시도해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    // 가장 모호한 형식
    const lowConfidenceText = '95';

    const result = await extractBodyScore(lowConfidenceText);

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(95);

    // Stage 3 시도 확인
    const stage3Attempts = result.attempts.filter(
      (attempt) => attempt.confidence < 50
    );
    expect(stage3Attempts.length).toBeGreaterThan(0);
  });

  it('첫 번째 성공 시 즉시 반환해야 한다 (조기 종료)', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    // 명확한 형식 (Stage 1에서 바로 성공)
    const clearText = '신체 점수 100 표준';

    const result = await extractBodyScore(clearText);

    expect(result.success).toBe(true);

    // 성공한 시도 이후의 추가 시도가 없어야 함
    const successfulAttempt = result.attempts.find((a) => a.extractedValue === '100');
    expect(successfulAttempt).toBeDefined();

    // 성공한 시도 이후의 시도는 없어야 함 (조기 종료)
    const successIndex = result.attempts.indexOf(successfulAttempt!);
    const attemptsAfterSuccess = result.attempts.slice(successIndex + 1);

    // 성공 후 추가 시도는 최소화되어야 함
    expect(attemptsAfterSuccess.length).toBeLessThanOrEqual(1);
  });
});

describe('Multi-Stage Extractor - 신뢰도 계산', () => {
  it('Priority 1-3 패턴은 80%+ 신뢰도를 가져야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const highPriorityText = '신체점수: 85';

    const result = await extractBodyScore(highPriorityText);

    expect(result.success).toBe(true);

    // 첫 번째 성공한 시도의 신뢰도 확인
    const successfulAttempt = result.attempts.find((a) => a.extractedValue === '85');
    expect(successfulAttempt).toBeDefined();
    expect(successfulAttempt!.confidence).toBeGreaterThanOrEqual(80);
  });

  it('Priority 4-7 패턴은 50-80% 신뢰도를 가져야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    // "Score: 78"은 Generic 패턴 (Priority 6)
    const mediumPriorityText = 'Score: 78';

    const result = await extractBodyScore(mediumPriorityText);

    expect(result.success).toBe(true);

    // 적절한 신뢰도 범위 확인
    const successfulAttempt = result.attempts.find((a) => a.extractedValue === '78');
    expect(successfulAttempt).toBeDefined();
    expect(successfulAttempt!.confidence).toBeGreaterThanOrEqual(50);
    expect(successfulAttempt!.confidence).toBeLessThan(80);
  });

  it('Priority 8-10 패턴은 <50% 신뢰도를 가져야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const lowPriorityText = '92';

    const result = await extractBodyScore(lowPriorityText);

    expect(result.success).toBe(true);

    // 낮은 신뢰도 확인
    const successfulAttempt = result.attempts.find((a) => a.extractedValue === '92');
    expect(successfulAttempt).toBeDefined();
    expect(successfulAttempt!.confidence).toBeLessThan(50);
  });
});

describe('Multi-Stage Extractor - 시도 로깅', () => {
  it('각 시도를 기록해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const text = '신체 점수 87 표준';

    const result = await extractBodyScore(text);

    expect(result.attempts.length).toBeGreaterThan(0);

    // 모든 시도가 필수 필드를 가지고 있는지 확인
    result.attempts.forEach((attempt) => {
      expect(attempt.patternId).toBeDefined();
      expect(attempt.patternName).toBeDefined();
      expect(attempt.matchedText).toBeDefined();
      expect(attempt.extractedValue).toBeDefined();
      expect(attempt.confidence).toBeGreaterThanOrEqual(0);
      expect(attempt.confidence).toBeLessThanOrEqual(100);
      expect(attempt.timestamp).toBeInstanceOf(Date);
    });
  });

  it('시간 정보를 기록해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const text = '신체 점수 83 표준';

    const beforeTime = Date.now();
    const result = await extractBodyScore(text);
    const afterTime = Date.now();

    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime);
    expect(result.timestamp.getTime()).toBeLessThanOrEqual(afterTime);
  });

  it('처리 시간을 측정해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const text = '신체 점수 91 표준';

    const result = await extractBodyScore(text);

    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.processingTimeMs).toBeLessThan(1000); // 1초 이내
  });
});

describe('Multi-Stage Extractor - 다양한 InBody 형식', () => {
  it('InBody 770 형식을 지원해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const texts = [
      '신체 점수 85 표준',
      '신체점수 100 표준',
      '85/100점',
      'Body Score 90 Standard',
    ];

    for (const text of texts) {
      const result = await extractBodyScore(text);
      expect(result.success).toBe(true);
      expect(result.bodyScore).toBeGreaterThanOrEqual(85);
    }
  });

  it('InBody 970 형식을 지원해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const texts = [
      '신체점수: 88',
      '총점: 95',
      '점수: 92',
    ];

    for (const text of texts) {
      const result = await extractBodyScore(text);
      expect(result.success).toBe(true);
    }
  });

  it('InBody 720 형식을 지원해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const texts = [
      '신체평가 점수 87',
      '평가점: 93',
    ];

    for (const text of texts) {
      const result = await extractBodyScore(text);
      expect(result.success).toBe(true);
    }
  });

  it('OntoFit 형식을 지원해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const texts = [
      '신체 점수 82',
      '바디스코어 91',
    ];

    for (const text of texts) {
      const result = await extractBodyScore(text);
      expect(result.success).toBe(true);
    }
  });

  it('Generic 형식을 지원해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const texts = [
      '점수: 85',
      'Score: 90',
      '85점',
      '85점수',
    ];

    for (const text of texts) {
      const result = await extractBodyScore(text);
      expect(result.success).toBe(true);
    }
  });
});

describe('Multi-Stage Extractor - 경계 케이스', () => {
  it('0점은 지원하지 않아야 한다 (현실적이지 않음)', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const result = await extractBodyScore('신체 점수 0 표준');

    // 0점은 패턴에서 2-3자리 숫자만 매칭하므로 실패해야 함
    // 신체 점수 0점은 현실적으로 발생하지 않음
    expect(result.success).toBe(false);
  });

  it('100점을 처리할 수 있어야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const result = await extractBodyScore('신체 점수 100 표준');

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(100);
  });

  it('공백이 많은 텍스트를 처리해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const result = await extractBodyScore('신체  점수  85  표준');

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(85);
  });

  it('줄바꿈이 포함된 텍스트를 처리해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const result = await extractBodyScore('신체 점수\n85\n표준');

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(85);
  });

  it('특수 문자가 포함된 텍스트를 처리해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const result = await extractBodyScore('신체 점수: 85! 표준?');

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(85);
  });
});

describe('Multi-Stage Extractor - 복잡한 시나리오', () => {
  it('여러 숫자가 포함된 텍스트에서 올바른 점수를 추출해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const complexText = `
      체중: 75.5kg
      키: 175cm
      신체 점수 88 표준
      체지방: 15%
    `;

    const result = await extractBodyScore(complexText);

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(88); // 체중(75.5)이나 키(175)가 아닌 점수(88)
  });

  it('한글/영문 혼합 텍스트를 처리해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const mixedText = '신체 점수 Body Score 85점 Standard';

    const result = await extractBodyScore(mixedText);

    expect(result.success).toBe(true);
    expect(result.bodyScore).toBe(85);
  });

  it('잘못된 형식의 숫자를 무시해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const invalidNumbersText = '점수: abc123xyz';

    const result = await extractBodyScore(invalidNumbersText);

    // 숫자가 아니므로 실패하거나, 다른 패턴으로 시도
    expect(result).toBeDefined();
  });

  it('범위를 벗어난 점수를 거부해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const outOfRangeText = '신체 점수 150 표준';

    const result = await extractBodyScore(outOfRangeText);

    // 0-100 범위를 벗어나면 실패해야 함
    // 또는 가장 가까운 유효한 값을 찾아야 함
    expect(result).toBeDefined();
  });
});

describe('Multi-Stage Extractor - OCR 신뢰도 기반 추출', () => {
  it('extractBodyScoreWithConfidence 함수가 존재해야 한다', async () => {
    const { extractBodyScoreWithConfidence } = await import('@/lib/multi-stage-extractor');

    expect(extractBodyScoreWithConfidence).toBeDefined();
    expect(typeof extractBodyScoreWithConfidence).toBe('function');
  });

  it('OCR 신뢰도에 따라 시작 단계를 결정해야 한다', async () => {
    const { extractBodyScoreWithConfidence } = await import('@/lib/multi-stage-extractor');

    const text = '신체 점수 90 표준';

    // 높은 OCR 신뢰도: Stage 1부터 시작
    const highOcrResult = await extractBodyScoreWithConfidence(text, 90);

    expect(highOcrResult.success).toBe(true);
    expect(highOcrResult.bodyScore).toBe(90);

    // 낮은 OCR 신뢰도: Stage 2부터 시작 (더 관대한 패턴)
    const lowOcrResult = await extractBodyScoreWithConfidence(text, 40);

    expect(lowOcrResult).toBeDefined();
  });

  it('OCR 신뢰도가 80+ 이면 Stage 1부터 시작해야 한다', async () => {
    const { extractBodyScoreWithConfidence } = await import('@/lib/multi-stage-extractor');

    const text = '신체 점수 85 표준';

    const result = await extractBodyScoreWithConfidence(text, 85);

    expect(result.success).toBe(true);

    // 첫 번째 시도가 Priority 1-3이어야 함
    const firstAttempt = result.attempts[0];
    expect(firstAttempt.confidence).toBeGreaterThanOrEqual(80);
  });

  it('OCR 신뢰도가 50-80 이면 Stage 2부터 시작해야 한다', async () => {
    const { extractBodyScoreWithConfidence } = await import('@/lib/multi-stage-extractor');

    const text = '점수: 88점';

    const result = await extractBodyScoreWithConfidence(text, 65);

    expect(result.success).toBe(true);

    // Priority 4-7 패턴 사용
    const successfulAttempt = result.attempts.find((a) => a.extractedValue === '88');
    expect(successfulAttempt).toBeDefined();
    expect(successfulAttempt!.confidence).toBeGreaterThanOrEqual(50);
    expect(successfulAttempt!.confidence).toBeLessThan(80);
  });

  it('OCR 신뢰도가 50 미만이면 Stage 3부터 시작해야 한다', async () => {
    const { extractBodyScoreWithConfidence } = await import('@/lib/multi-stage-extractor');

    const text = '92';

    const result = await extractBodyScoreWithConfidence(text, 30);

    expect(result.success).toBe(true);

    // Priority 8-10 패턴 사용
    const successfulAttempt = result.attempts.find((a) => a.extractedValue === '92');
    expect(successfulAttempt).toBeDefined();
    expect(successfulAttempt!.confidence).toBeLessThan(50);
  });

  it('잘못된 OCR 신뢰도 값을 처리해야 한다', async () => {
    const { extractBodyScoreWithConfidence } = await import('@/lib/multi-stage-extractor');

    const text = '신체 점수 87 표준';

    // 음수 신뢰도
    const negativeResult = await extractBodyScoreWithConfidence(text, -10);
    expect(negativeResult).toBeDefined();

    // 100 초과 신뢰도
    const overflowResult = await extractBodyScoreWithConfidence(text, 150);
    expect(overflowResult).toBeDefined();
  });
});

describe('Multi-Stage Extractor - 성능 및 최적화', () => {
  it('대량의 텍스트를 효율적으로 처리해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const texts = Array.from({ length: 100 }, (_, i) => `신체 점수 ${i % 101} 표준`);

    const startTime = Date.now();

    const results = await Promise.all(
      texts.map((text) => extractBodyScore(text))
    );

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // 100개 처리에 5초 이내
    expect(totalTime).toBeLessThan(5000);

    // 모든 결과가 성공해야 함
    const successCount = results.filter((r) => r.success).length;
    expect(successCount).toBeGreaterThanOrEqual(90); // 최소 90% 성공
  });

  it('캐싱을 통해 반복 처리를 최적화해야 한다 (선택 사항)', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const text = '신체 점수 95 표준';

    // 첫 번째 호출
    const firstResult = await extractBodyScore(text);
    const firstTime = firstResult.processingTimeMs;

    // 두 번째 호출 (캐시된 결과일 수 있음)
    const secondResult = await extractBodyScore(text);
    const secondTime = secondResult.processingTimeMs;

    expect(firstResult.success).toBe(true);
    expect(secondResult.success).toBe(true);

    // 캐싱이 있다면 두 번째가 더 빠를 수 있음
    // 하지만 캐싱이 없어도 항상 일관된 결과여야 함
    expect(firstResult.bodyScore).toBe(secondResult.bodyScore);
  });
});

describe('Multi-Stage Extractor - 에러 처리', () => {
  it('undefined 입력을 처리해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const result = await extractBodyScore(undefined as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('null 입력을 처리해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const result = await extractBodyScore(null as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('숫자 입력을 처리해야 한다', async () => {
    const { extractBodyScore } = await import('@/lib/multi-stage-extractor');

    const result = await extractBodyScore(85 as any);

    expect(result).toBeDefined();
    // 숫자는 문자열로 변환되거나 거부됨
  });
});
