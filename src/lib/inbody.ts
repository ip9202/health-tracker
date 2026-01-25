/**
 * TAG-DATA-TASK-002: Zod 스키마 정의 및 데이터 검증 구현
 * SPEC-DATA-003-02: 데이터 파싱 및 검증
 */
import { z } from 'zod';

/**
 * 인바디 체성분 데이터 Zod 스키마
 * SPEC-DATA-003: 9개 핵심 데이터 필드 검증
 */

// 개인정보 스키마
const PersonalInfoSchema = z.object({
  name: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().int().min(0).max(150).optional(),
  height: z.number().positive().optional(), // cm
});

// 체성분 데이터 스키마
const BodyCompositionSchema = z.object({
  weight: z.number().positive().optional(), // kg
  bodyFat: z.number().nonnegative().optional(), // 체지방량 (kg)
  bodyFatPercentage: z.number().min(0).max(100).optional(), // %
  muscle: z.number().nonnegative().optional(), // kg
  protein: z.number().nonnegative().optional(), // kg
  bodyWater: z.number().nonnegative().optional(), // kg
  skeletalMuscle: z.number().nonnegative().optional(), // kg
});

// 신체 점수 스키마
const BodyScoreSchema = z.object({
  bodyScore: z.number().int().min(0).max(100).optional(),
  scoreDescription: z.string().optional(),
});

// 비만 판정 스키마
const ObesityAssessmentSchema = z.object({
  bmi: z.number().nonnegative().optional(),
  bmiStatus: z.string().optional(),
});

// 체중 조절 스키마
const WeightControlSchema = z.object({
  weightControl: z.string().optional(),
});

// 신체 유형 스키마
const BodyTypeSchema = z.object({
  bodyType: z.string().optional(),
});

// 기타 지표 스키마
const OtherMetricsSchema = z.object({
  calorieNeeds: z.number().int().positive().optional(), // kcal/day
});

// 전체 인바디 데이터 스키마
export const InBodyDataSchema = z.object({
  // 개인정보
  ...PersonalInfoSchema.shape,

  // 체성분 데이터
  ...BodyCompositionSchema.shape,

  // 신체 점수
  ...BodyScoreSchema.shape,

  // 비만 판정
  ...ObesityAssessmentSchema.shape,

  // 체중 조절
  ...WeightControlSchema.shape,

  // 신체 유형
  ...BodyTypeSchema.shape,

  // 기타 지표
  ...OtherMetricsSchema.shape,
});

// 타입 추출
export type InBodyData = z.infer<typeof InBodyDataSchema>;

/**
 * 인바디 데이터 검증 함수
 */
export function validateInBodyData(data: unknown): {
  success: boolean;
  data?: InBodyData;
  errors?: z.ZodError;
} {
  const result = InBodyDataSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error,
  };
}
