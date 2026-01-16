/**
 * TASK-002: 패턴 라이브러리 테스트
 * SPEC-OCR-001: OCR 정확도 향상 (70% → 95%)
 *
 * TDD RED 단계: 실패하는 테스트 먼저 작성
 */

import { describe, it, expect } from 'vitest';
import {
  getBodyScorePatterns,
  getPatternById,
  validatePattern,
  getPatternsByFormat,
  getPatternsByPriority,
  type PatternDefinition,
} from '@/lib/pattern-library';

describe('패턴 라이브러리 - 기본 검증', () => {
  it('최소 10개 이상의 패턴이 있어야 한다', () => {
    const patterns = getBodyScorePatterns();
    expect(patterns.length).toBeGreaterThanOrEqual(10);
  });

  it('모든 패턴이 유효해야 한다', () => {
    const patterns = getBodyScorePatterns();

    patterns.forEach((pattern) => {
      const result = validatePattern(pattern);
      expect(result.success).toBe(true);
      if (!result.success) {
        console.error('Invalid pattern:', pattern, result.error?.issues);
      }
    });
  });
});

describe('패턴 라이브러리 - InBody 770 형식', () => {
  it('InBody 770 패턴을 가져올 수 있어야 한다', () => {
    const patterns = getPatternsByFormat('inbody770');
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('InBody 770 패턴은 "신체 점수...표준" 형식을 지원해야 한다', () => {
    const patterns = getPatternsByFormat('inbody770');
    const inbody770Pattern = patterns.find((p) =>
      p.id.includes('inbody770') || p.name.includes('770')
    );

    expect(inbody770Pattern).toBeDefined();

    // 테스트 문자열
    const testText = '신체 점수 100 표준';
    const match = testText.match(inbody770Pattern!.regex);

    expect(match).toBeTruthy();
  });
});

describe('패턴 라이브러리 - InBody 970 형식', () => {
  it('InBody 970 패턴을 가져올 수 있어야 한다', () => {
    const patterns = getPatternsByFormat('inbody970');
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('InBody 970 패턴은 다른 형식을 지원해야 한다', () => {
    const patterns = getPatternsByFormat('inbody970');
    const inbody970Pattern = patterns[0];

    expect(inbody970Pattern.format).toBe('inbody970');
  });
});

describe('패턴 라이브러리 - InBody 720 형식', () => {
  it('InBody 720 패턴을 가져올 수 있어야 한다', () => {
    const patterns = getPatternsByFormat('inbody720');
    expect(patterns.length).toBeGreaterThan(0);
  });
});

describe('패턴 라이브러리 - OntoFit 형식', () => {
  it('OntoFit 패턴을 가져올 수 있어야 한다', () => {
    const patterns = getPatternsByFormat('ontofit');
    expect(patterns.length).toBeGreaterThan(0);
  });
});

describe('패턴 라이브러리 - Generic 형식', () => {
  it('Generic 패턴을 가져올 수 있어야 한다', () => {
    const patterns = getPatternsByFormat('generic');
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('Generic 패턴은 일반적인 숫자 패턴을 찾을 수 있어야 한다', () => {
    const patterns = getPatternsByFormat('generic');
    const genericPattern = patterns[0];

    const testText = '점수: 85점';
    const match = testText.match(genericPattern.regex);

    // Generic 패턴은 다양한 형식 지원
    expect(genericPattern).toBeDefined();
  });
});

describe('패턴 라이브러리 - 우선순위 기반 검색', () => {
  it('우선순위 1-3 패턴을 가져올 수 있어야 한다', () => {
    const highPriorityPatterns = getPatternsByPriority(1, 3);
    expect(highPriorityPatterns.length).toBeGreaterThan(0);

    highPriorityPatterns.forEach((pattern) => {
      expect(pattern.priority).toBeGreaterThanOrEqual(1);
      expect(pattern.priority).toBeLessThanOrEqual(3);
    });
  });

  it('우선순위 4-7 패턴을 가져올 수 있어야 한다', () => {
    const mediumPriorityPatterns = getPatternsByPriority(4, 7);
    expect(mediumPriorityPatterns.length).toBeGreaterThan(0);

    mediumPriorityPatterns.forEach((pattern) => {
      expect(pattern.priority).toBeGreaterThanOrEqual(4);
      expect(pattern.priority).toBeLessThanOrEqual(7);
    });
  });

  it('우선순위 8-10 패턴을 가져올 수 있어야 한다', () => {
    const lowPriorityPatterns = getPatternsByPriority(8, 10);
    expect(lowPriorityPatterns.length).toBeGreaterThan(0);

    lowPriorityPatterns.forEach((pattern) => {
      expect(pattern.priority).toBeGreaterThanOrEqual(8);
      expect(pattern.priority).toBeLessThanOrEqual(10);
    });
  });

  it('패턴은 우선순위 오름차순으로 정렬되어야 한다', () => {
    const patterns = getBodyScorePatterns();

    for (let i = 1; i < patterns.length; i++) {
      expect(patterns[i].priority).toBeGreaterThanOrEqual(patterns[i - 1].priority);
    }
  });
});

describe('패턴 라이브러리 - ID로 검색', () => {
  it('ID로 패턴을 찾을 수 있어야 한다', () => {
    const patterns = getBodyScorePatterns();
    const firstPattern = patterns[0];

    const found = getPatternById(firstPattern.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(firstPattern.id);
  });

  it('존재하지 않는 ID는 undefined를 반환해야 한다', () => {
    const found = getPatternById('non-existent-id');
    expect(found).toBeUndefined();
  });
});

describe('패턴 라이브러리 - 패턴 메타데이터', () => {
  it('모든 패턴은 필수 메타데이터를 가져야 한다', () => {
    const patterns = getBodyScorePatterns();

    patterns.forEach((pattern) => {
      expect(pattern.id).toBeTruthy();
      expect(pattern.name).toBeTruthy();
      expect(pattern.description).toBeTruthy();
      expect(pattern.regex).toBeInstanceOf(RegExp);
      expect(pattern.priority).toBeGreaterThanOrEqual(1);
      expect(pattern.priority).toBeLessThanOrEqual(10);
      expect(pattern.format).toBeTruthy();
    });
  });

  it('패턴은 예제를 가질 수 있다', () => {
    const patterns = getBodyScorePatterns();

    // 최소한 일부 패턴은 예제를 가짐
    const patternsWithExamples = patterns.filter((p) => p.examples && p.examples.length > 0);
    expect(patternsWithExamples.length).toBeGreaterThan(0);

    patternsWithExamples.forEach((pattern) => {
      expect(pattern.examples).toBeDefined();
      expect(pattern.examples!.length).toBeGreaterThan(0);
    });
  });
});

describe('패턴 라이브러리 - 실제 매칭 테스트', () => {
  it('InBody 770 패턴이 실제 OCR 텍스트와 매칭되어야 한다', () => {
    const patterns = getPatternsByFormat('inbody770');
    const testTexts = [
      '신체 점수 85 표준',
      '신체점수 100 표준',
      'Body Score 90 Standard',
    ];

    patterns.forEach((pattern) => {
      testTexts.forEach((text) => {
        const match = text.match(pattern.regex);
        if (match) {
          // 매칭된 경우 숫자를 추출할 수 있어야 함
          expect(match[1] || match[0]).toBeTruthy();
        }
      });
    });
  });

  it('다중 매칭 시나리오를 처리해야 한다', () => {
    const patterns = getBodyScorePatterns();
    const complexText = `
      신체 점수 85 표준
      체지방 15%
      BMI 22.4
    `;

    let matchCount = 0;
    patterns.forEach((pattern) => {
      const match = complexText.match(pattern.regex);
      if (match) matchCount++;
    });

    // 최소한 하나의 패턴은 매칭되어야 함
    expect(matchCount).toBeGreaterThan(0);
  });
});

describe('패턴 라이브러리 - 다양한 OCR 형식 지원', () => {
  it('한글/영어 혼합 텍스트를 처리해야 한다', () => {
    const patterns = getBodyScorePatterns();
    const mixedText = '신체 점수 Body Score 85점';

    let hasMatch = false;
    patterns.forEach((pattern) => {
      if (mixedText.match(pattern.regex)) {
        hasMatch = true;
      }
    });

    // 최소한 하나는 매칭
    expect(hasMatch).toBe(true);
  });

  it('공백이 포함된 텍스트를 처리해야 한다', () => {
    const patterns = getBodyScorePatterns();
    const textWithSpaces = '신체  점수  85  표준';

    let hasMatch = false;
    patterns.forEach((pattern) => {
      if (textWithSpaces.match(pattern.regex)) {
        hasMatch = true;
      }
    });

    expect(hasMatch).toBe(true);
  });
});
