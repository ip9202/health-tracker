import { describe, it, expect } from 'vitest';
import { validateInBodyData, InBodyDataSchema } from '@/lib/inbody';

describe('InBody Zod Schema', () => {
  describe('유효한 데이터 검증', () => {
    it('모든 필드가 있는 완전한 데이터를 검증해야 한다', () => {
      const validData = {
        // 개인정보
        name: '홍길동',
        gender: 'male' as const,
        age: 30,
        height: 175.5,

        // 체성분 데이터
        weight: 70.5,
        bodyFatPercentage: 18.5,
        muscle: 32.0,
        protein: 12.5,
        bodyWater: 40.5,
        skeletalMuscle: 30.0,

        // 신체 점수
        bodyScore: 80,
        scoreDescription: '좋음',

        // 비만 판정
        bmi: 22.9,
        bmiStatus: '정상',

        // 체중 조절
        weightControl: '유지',

        // 신체 유형
        bodyType: '근육형',

        // 생체 임피던스
        bioimpedance: '50kHz, 250Ω',

        // 기타 지표
        smi: 8.5,
        calorieNeeds: 2200,

        // 부위별 분석
        regionalAnalysis: JSON.stringify({
          leftArm: { fat: 1.2, muscle: 3.5 },
          rightArm: { fat: 1.1, muscle: 3.6 },
          trunk: { fat: 8.5, muscle: 25.0 },
          leftLeg: { fat: 4.5, muscle: 10.5 },
          rightLeg: { fat: 4.3, muscle: 10.8 },
        }),
      };

      const result = validateInBodyData(validData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('일부 필드만 있는 데이터도 검증에 통과해야 한다', () => {
      const partialData = {
        weight: 70.5,
        bodyFatPercentage: 18.5,
      };

      const result = validateInBodyData(partialData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(partialData);
    });

    it('빈 객체도 검증에 통과해야 한다 (모든 필드가 optional)', () => {
      const result = validateInBodyData({});

      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });
  });

  describe('무효한 데이터 검증', () => {
    it('음수 값은 허용하지 않아야 한다', () => {
      const invalidData = {
        weight: -70.5, // 음수
      };

      const result = validateInBodyData(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('체지방율이 100을 초과하면 안 된다', () => {
      const invalidData = {
        bodyFatPercentage: 150, // 100 초과
      };

      const result = validateInBodyData(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('나이가 150을 초과하면 안 된다', () => {
      const invalidData = {
        age: 200, // 150 초과
      };

      const result = validateInBodyData(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('잘못된 gender 값은 거부해야 한다', () => {
      const invalidData = {
        gender: 'invalid', // male, female, other가 아님
      };

      const result = validateInBodyData(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('BMI가 음수면 안 된다', () => {
      const invalidData = {
        bmi: -5,
      };

      const result = validateInBodyData(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('SMI가 음수면 안 된다', () => {
      const invalidData = {
        smi: -1,
      };

      const result = validateInBodyData(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('경계값 테스트', () => {
    it('체지방율 0은 허용해야 한다', () => {
      const boundaryData = {
        bodyFatPercentage: 0,
      };

      const result = validateInBodyData(boundaryData);

      expect(result.success).toBe(true);
    });

    it('체지방율 100은 허용해야 한다', () => {
      const boundaryData = {
        bodyFatPercentage: 100,
      };

      const result = validateInBodyData(boundaryData);

      expect(result.success).toBe(true);
    });

    it('나이 0은 허용해야 한다', () => {
      const boundaryData = {
        age: 0,
      };

      const result = validateInBodyData(boundaryData);

      expect(result.success).toBe(true);
    });

    it('나이 150은 허용해야 한다', () => {
      const boundaryData = {
        age: 150,
      };

      const result = validateInBodyData(boundaryData);

      expect(result.success).toBe(true);
    });

    it('신체 점수 0은 허용해야 한다', () => {
      const boundaryData = {
        bodyScore: 0,
      };

      const result = validateInBodyData(boundaryData);

      expect(result.success).toBe(true);
    });

    it('신체 점수 100은 허용해야 한다', () => {
      const boundaryData = {
        bodyScore: 100,
      };

      const result = validateInBodyData(boundaryData);

      expect(result.success).toBe(true);
    });
  });

  describe('타입 검증', () => {
    it('InBodyDataSchema에서 타입을 추출할 수 있어야 한다', () => {
      // TypeScript 타입 검증 컴파일 타임 체크
      const data: InBodyData = {
        weight: 70.5,
        bodyFatPercentage: 18.5,
      };

      expect(data.weight).toBe(70.5);
      expect(data.bodyFatPercentage).toBe(18.5);
    });
  });
});
