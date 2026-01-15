/**
 * TAG-AI-004: Zod 응답 검증 스키마
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템
 * 
 * AI 응답 데이터를 검증하기 위한 Zod 스키마 정의
 */

import { z } from 'zod';

/**
 * 위험 요소 스키마
 * 사용자의 건강 위험 요소를 분류하고 심각도를 나타냄
 */
export const RiskFactorSchema = z.object({
  category: z.enum(['muscle', 'fat', 'metabolism', 'weight'], {
    errorMap: () => ({ message: '유효하지 않은 위험 요소 카테고리입니다' }),
  }),
  level: z.enum(['low', 'moderate', 'high'], {
    errorMap: () => ({ message: '유효하지 않은 위험도 레벨입니다' }),
  }),
  description: z.string().min(1, { message: '위험 요소 설명은 필수입니다' }),
});

/**
 * 추천 항목 스키마
 * 운동, 영양, 생활 습관 개선을 위한 추천 사항
 */
export const RecommendationSchema = z.object({
  type: z.enum(['exercise', 'nutrition', 'lifestyle'], {
    errorMap: () => ({ message: '유효하지 않은 추천 타입입니다' }),
  }),
  title: z.string().min(1, { message: '추천 제목은 필수입니다' }),
  description: z.string().min(1, { message: '추천 설명은 필수입니다' }),
  priority: z.number().int().min(1).max(5, {
    errorMap: () => ({ message: '우선순위는 1-5 사이의 정수여야 합니다' }),
  }),
});

/**
 * 주의 사항 스키마
 * 사용자가 알아야 할 건강 관련 주의 사항
 */
export const WarningSchema = z.object({
  severity: z.enum(['info', 'caution', 'warning'], {
    errorMap: () => ({ message: '유효하지 않은 심각도 레벨입니다' }),
  }),
  message: z.string().min(1, { message: '주의 사항 메시지는 필수입니다' }),
  actionable: z.boolean({
    errorMap: () => ({ message: 'actionable은 불리언 값이어야 합니다' }),
  }),
});

/**
 * 건강 분석 결과 스키마
 * AI가 생성한 종합 건강 분석 결과
 */
export const HealthAnalysisSchema = z.object({
  healthStatus: z.string().min(1, { message: '건강 상태는 필수입니다' }),
  healthScore: z.number().int().min(0).max(100, {
    errorMap: () => ({ message: '건강 점수는 0-100 사이의 정수여야 합니다' }),
  }),
  riskFactors: z.array(RiskFactorSchema).default([]),
  recommendations: z.array(RecommendationSchema).default([]),
  warnings: z.array(WarningSchema).default([]),
});

/**
 * 타입 추출
 */
export type RiskFactor = z.infer<typeof RiskFactorSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type Warning = z.infer<typeof WarningSchema>;
export type HealthAnalysis = z.infer<typeof HealthAnalysisSchema>;
