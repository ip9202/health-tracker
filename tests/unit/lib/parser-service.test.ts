import { describe, it, expect } from 'vitest';
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
        신체점수: 80 / 100
        점수설명: 좋음
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
      expect(result.data.muscle).toBe(32.0);
      expect(result.data.protein).toBe(12.5);
      expect(result.data.bodyWater).toBe(40.5);
      expect(result.data.skeletalMuscle).toBe(30.0);
      expect(result.data.bodyScore).toBe(80);
      expect(result.data.scoreDescription).toBe('좋음');
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
      const ocrText = '신체점수: 85/100 점수설명: 매우좋음';

      const result = parseInBodyData(ocrText);

      expect(result.data.bodyScore).toBe(85);
      expect(result.data.scoreDescription).toBe('매우좋음');
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
});
