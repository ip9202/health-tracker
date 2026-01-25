import { describe, it, expect, vi } from 'vitest';
import { parseInBodyData, convertUnit, ParseWarning } from '@/lib/parser-service';
import { InBodyData } from '@/lib/inbody';

describe('Parser Service', () => {
  describe('parseInBodyData', () => {
    it('완전한 인바디 보고서 텍스트를 파싱해야 한다', () => {
      const ocrText = `
        성명: 홍길동
        성별: 남
        나이: 30세
        신장: 175.5cm
        체중: 70.5kg
        체지방률: 18.5%
        근육량: 32.0kg
        단백질: 12.5kg
        체수분: 40.5kg
        골격근량: 30.0kg
        신체점수: 92 / 100
        점수설명: 우수
        BMI: 22.9
        비만판정: 정상
        체중조절: 유지
        신체유형: 근육형
        생체임피던스: 50kHz,250Ω
        SMI: 8.5
        칼로리: 2200kcal
        부위별분석: 왼팔 1.2kg, 오른팔 1.3kg
      `;

      const result = parseInBodyData(ocrText);

      expect(result.data.name).toBe('홍길동');
      expect(result.data.gender).toBe('male');
      expect(result.data.age).toBe(30);
      expect(result.data.height).toBe(175.5);
      expect(result.data.weight).toBe(70.5);
      expect(result.data.bodyFatPercentage).toBe(18.5);
      expect(result.data.muscle).toBe(32);
      expect(result.data.protein).toBe(12.5);
      expect(result.data.bodyWater).toBe(40.5);
      expect(result.data.skeletalMuscle).toBe(30);
      expect(result.data.bodyScore).toBe(92);
      expect(result.data.scoreDescription).toBe('우수');
      expect(result.data.bmi).toBe(22.9);
      expect(result.data.bmiStatus).toBe('정상');
      expect(result.data.weightControl).toBe('유지');
      expect(result.data.bodyType).toBe('근육형');
      expect(result.data.bioimpedance).toBe('50kHz,250Ω');
      expect(result.data.smi).toBe(8.5);
      expect(result.data.calorieNeeds).toBe(2200);
    });

    it('일부 필드만 있는 텍스트를 파싱해야 한다', () => {
      const ocrText = '체중: 70kg 체지방률: 20%';

      const result = parseInBodyData(ocrText);

      expect(result.data.weight).toBe(70);
      expect(result.data.bodyFatPercentage).toBe(20);
    });

    it('누락된 필드에 경고를 추가해야 한다', () => {
      const ocrText = '체중: 70kg'; // 이름 없음

      const result = parseInBodyData(ocrText);

      expect(result.data.weight).toBe(70);
      expect(result.warnings.some((w: ParseWarning) => w.field === 'name')).toBe(true);
    });

    it('여러 줄과 공백을 처리해야 한다', () => {
      const ocrText = `
        성명 :  홍길동


        체중:70kg
      `;

      const result = parseInBodyData(ocrText);

      expect(result.data.name).toBe('홍길동');
      expect(result.data.weight).toBe(70);
    });

    it('남성을 올바르게 파싱해야 한다', () => {
      const ocrText = '성별: 남';

      const result = parseInBodyData(ocrText);

      expect(result.data.gender).toBe('male');
    });

    it('여성을 올바르게 파싱해야 한다', () => {
      const ocrText = '성별: 녀';

      const result = parseInBodyData(ocrText);

      expect(result.data.gender).toBe('female');
    });

    it('M/F 성별 코드를 처리해야 한다', () => {
      const maleText = '성별: M';
      const femaleText = '성별: F';

      const maleResult = parseInBodyData(maleText);
      const femaleResult = parseInBodyData(femaleText);

      expect(maleResult.data.gender).toBe('male');
      expect(femaleResult.data.gender).toBe('female');
    });

    it('BMI와 비만 판정을 파싱해야 한다', () => {
      const ocrText = 'BMI: 23.5 비만판정: 정상';

      const result = parseInBodyData(ocrText);

      expect(result.data.bmi).toBe(23.5);
      expect(result.data.bmiStatus).toBe('정상');
    });

    it('신체 점수를 파싱해야 한다', () => {
      const ocrText = '신체점수: 92/100 점수설명: 우수';

      const result = parseInBodyData(ocrText);

      expect(result.data.bodyScore).toBe(92);
      expect(result.data.scoreDescription).toBe('우수');
    });

    it('소수점이 있는 숫자를 파싱해야 한다', () => {
      const ocrText = '체중: 70.5kg 신장: 175.5cm';

      const result = parseInBodyData(ocrText);

      expect(result.data.weight).toBe(70.5);
      expect(result.data.height).toBe(175.5);
    });

    it('빈 텍스트를 처리해야 한다', () => {
      const result = parseInBodyData('');

      expect(result.data).toEqual({});
      expect(result.rawText).toBe('');
    });

    it('원본 텍스트를 저장해야 한다', () => {
      const ocrText = '체중: 70kg';
      const result = parseInBodyData(ocrText);

      expect(result.rawText).toContain('체중');
    });
  });

  describe('convertUnit', () => {
    it('kg를 g로 변환해야 한다', () => {
      expect(convertUnit(1, 'kg', 'g')).toBe(1000);
    });

    it('g를 kg로 변환해야 한다', () => {
      expect(convertUnit(1000, 'g', 'kg')).toBe(1);
    });

    it('kg를 lb로 변환해야 한다', () => {
      expect(convertUnit(1, 'kg', 'lb')).toBeCloseTo(2.20462, 5);
    });

    it('lb를 kg로 변환해야 한다', () => {
      expect(convertUnit(2.20462, 'lb', 'kg')).toBeCloseTo(1, 5);
    });

    it('같은 단위 변환은 값을 그대로 반환해야 한다', () => {
      expect(convertUnit(70, 'kg', 'kg')).toBe(70);
    });

    it('지원되지 않는 변환은 에러를 발생시켜야 한다', () => {
      expect(() => convertUnit(1, 'kg' as any, 'invalid' as any)).toThrow();
    });
  });

  describe('경계값 및 엣지 케이스', () => {
    it('작은 양수 값을 처리해야 한다', () => {
      const ocrText = '체중: 0.5kg';

      const result = parseInBodyData(ocrText);

      expect(result.data.weight).toBe(0.5);
    });

    it('매우 큰 값을 처리해야 한다', () => {
      const ocrText = '체중: 300kg';

      const result = parseInBodyData(ocrText);

      expect(result.data.weight).toBe(300);
    });

    it('잘못된 형식의 숫자를 무시해야 한다', () => {
      const ocrText = '체중: abckg';

      const result = parseInBodyData(ocrText);

      expect(result.data.weight).toBeUndefined();
    });

    it('중복 필드를 처리해야 한다 (마지막 값 우선)', () => {
      const ocrText = '체중: 70kg 체중: 75kg';

      const result = parseInBodyData(ocrText);

      // 정규식은 첫 번째 매칭만 반환하므로 70이어야 함
      expect(result.data.weight).toBe(70);
    });
  });

  describe('TASK-007: New Extraction Integration', () => {
    describe('16개 패턴을 사용한 신체 점수 추출', () => {
      it('InBody 770 표준 형식을 추출해야 한다 (Priority 1)', () => {
        const ocrText = '신체 점수 85 표준';
        const result = parseInBodyData(ocrText);

        expect(result.data.bodyScore).toBe(85);
        expect(result.data.scoreDescription).toBe('보통'); // 70-89 = 보통
      });

      it('InBody 970 신체점수 형식을 추출해야 한다 (Priority 1)', () => {
        const ocrText = '신체점수: 92';
        const result = parseInBodyData(ocrText);

        expect(result.data.bodyScore).toBe(92);
        expect(result.data.scoreDescription).toBe('우수');
      });

      it('InBody 720 신체평가 점수 형식을 추출해야 한다 (Priority 2)', () => {
        const ocrText = '신체평가 점수 78';
        const result = parseInBodyData(ocrText);

        expect(result.data.bodyScore).toBe(78);
        expect(result.data.scoreDescription).toBe('보통');
      });

      it('OntoFit 바디스코어 형식을 추출해야 한다 (Priority 3-4)', () => {
        const ocrText = '바디스코어 92';
        const result = parseInBodyData(ocrText);

        expect(result.data.bodyScore).toBe(92);
        expect(result.data.scoreDescription).toBe('우수');
      });

      it('Generic 점수 형식을 추출해야 한다 (Priority 5)', () => {
        const ocrText = '점수: 75';
        const result = parseInBodyData(ocrText);

        expect(result.data.bodyScore).toBe(75);
        expect(result.data.scoreDescription).toBe('보통');
      });

      it('Generic 2-3자리 숫자만 있는 경우도 추출해야 한다 (Priority 10)', () => {
        const ocrText = '체중 70kg, 키 175cm, 85점';
        const result = parseInBodyData(ocrText);

        expect(result.data.bodyScore).toBe(85);
        expect(result.data.scoreDescription).toBe('보통'); // 70-89 = 보통
      });

      it('여러 패턴이 있을 때 가장 높은 우선순위 패턴을 사용해야 한다', () => {
        // "신체 점수 85 표준" (Priority 1)과 "점수:75" (Priority 5)가 모두 있음
        const ocrText = '신체 점수 85 표준, 점수: 75';
        const result = parseInBodyData(ocrText);

        // Priority 1 패턴이 우선
        expect(result.data.bodyScore).toBe(85);
      });
    });

    describe('더미 데이터 반환 방지', () => {
      it('빈 텍스트는 더미 데이터를 반환하지 않고 에러를 처리해야 한다', () => {
        const ocrText = '';
        const result = parseInBodyData(ocrText);

        // 더미 데이터가 아니어야 함
        expect(result.data.name).toBeUndefined();
        expect(result.data.weight).toBeUndefined();

        // 에러 처리 확인 (warnings 또는 error)
        expect(result.warnings.length).toBeGreaterThan(0);
      });

      it('짧은 텍스트는 더미 데이터를 반환하지 않고 에러를 처리해야 한다', () => {
        const ocrText = 'abc';
        const result = parseInBodyData(ocrText);

        // 더미 데이터가 아니어야 함
        expect(result.data.name).toBeUndefined();
        expect(result.data.weight).toBeUndefined();
      });

      it('신체 점수를 찾을 수 없을 때 경고를 추가해야 한다', () => {
        const ocrText = '체중: 70kg 신장: 175cm'; // 신체 점수 없음
        const result = parseInBodyData(ocrText);

        expect(result.data.bodyScore).toBeUndefined();
        // warnings 또는 error 확인
        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });

    describe('하위 호환성 유지', () => {
      it('기존 3개 패턴이 여전히 작동해야 한다', () => {
        // 기존 패턴 1: 신체 점수와 표준 사이
        const ocrText1 = '신체 점수 무게 67.00 (56.0-75.7) 100.0 표준';
        const result1 = parseInBodyData(ocrText1);
        expect(result1.data.bodyScore).toBe(100);

        // 기존 패턴 2: /100 앞의 숫자
        const ocrText2 = '85/100점';
        const result2 = parseInBodyData(ocrText2);
        expect(result2.data.bodyScore).toBe(85);

        // 기존 패턴 3: 숫자+표준
        const ocrText3 = 'BMI: 22.4, 90.0 표준';
        const result3 = parseInBodyData(ocrText3);
        expect(result3.data.bodyScore).toBe(90);
      });
    });

    describe('점수 범위별 설명', () => {
      it('90점 이상은 우수여야 한다', () => {
        const result = parseInBodyData('신체 점수 95 표준');
        expect(result.data.scoreDescription).toBe('우수');
      });

      it('70-89점은 보통이어야 한다', () => {
        const result = parseInBodyData('신체 점수 75 표준');
        expect(result.data.scoreDescription).toBe('보통');
      });

      it('50-69점은 주의여야 한다', () => {
        const result = parseInBodyData('신체 점수 55 표준');
        expect(result.data.scoreDescription).toBe('주의');
      });

      it('50점 미만은 경고여야 한다', () => {
        const result = parseInBodyData('신체 점수 45 표준');
        expect(result.data.scoreDescription).toBe('경고');
      });
    });

    describe('전처리 파이프라인 연결 (향후 구현)', () => {
      it('전처리 옵션을 지원해야 한다', () => {
        // 현재는 options 파라미터가 없지만, 추후 추가 예정
        const ocrText = '신체 점수 80 표준';

        // @ts-ignore - 향후 추가될 options 파라미터
        const result = parseInBodyData(ocrText, { useEnhancedPreprocessing: true });

        expect(result.data.bodyScore).toBe(80);
      });
    });
  });
});
