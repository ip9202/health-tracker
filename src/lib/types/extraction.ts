/**
 * TASK-006: OCR 추출 타입 정의
 * SPEC-OCR-001: OCR 정확도 향상 (70% → 95%)
 *
 * 신체 점수 추출을 위한 타입 정의 및 Zod 스키마
 *
 * @module extraction
 */

import { z } from 'zod';

// ========== Type Definitions ==========

/**
 * 지원되는 InBody 기기 형식
 */
export const SUPPORTED_FORMATS = ['inbody770', 'inbody970', 'inbody720', 'ontofit', 'generic'] as const;
export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

/**
 * 추출 시도 정보
 *
 * 단일 패턴 매칭 시도에 대한 정보를 저장합니다
 */
export interface ExtractionAttempt {
  patternId: string;
  patternName: string;
  matchedText: string;
  extractedValue: string;
  confidence: number; // 0-100
  timestamp: Date;
}

/**
 * 패턴 정의
 *
 * 신체 점수 추출을 위한 정규 표현식 패턴 정의
 */
export interface PatternDefinition {
  id: string;
  name: string;
  regex: RegExp;
  priority: number; // 1-10 (1이 가장 높은 우선순위)
  description: string;
  format: SupportedFormat;
  examples?: string[];
}

/**
 * 이미지 해상도
 */
export interface ImageResolution {
  width: number;
  height: number;
}

/**
 * 이미지 품질 지표
 *
 * 이미지 전처리 후 품질 평가 지표
 */
export interface ImageQualityMetrics {
  overallScore: number; // 0-100
  brightness: number; // 0-255
  contrast: number; // 0-255
  sharpness: number; // 0-1
  noiseLevel: number; // 0-1
  resolution: ImageResolution;
  fileSize: number; // bytes
  format: string; // 'image/jpeg', 'image/png', etc.
}

/**
 * 추출 결과
 *
 * 신체 점수 추출 결과를 포함합니다
 */
export interface ExtractionResult {
  success: boolean;
  bodyScore?: number;
  attempts: ExtractionAttempt[];
  error?: string;
  processingTimeMs: number;
  timestamp: Date;
}

// ========== Zod Schemas ==========

/**
 * ExtractionAttempt Zod 스키마
 */
const ExtractionAttemptSchema = z.object({
  patternId: z.string().min(1, 'patternId는 비워둘 수 없습니다'),
  patternName: z.string().min(1, 'patternName은 비워둘 수 없습니다'),
  matchedText: z.string().min(1, 'matchedText는 비워둘 수 없습니다'),
  extractedValue: z.string().min(1, 'extractedValue는 비워둘 수 없습니다'),
  confidence: z.number().min(0, 'confidence는 0 이상이어야 합니다').max(100, 'confidence는 100 이하여야 합니다'),
  timestamp: z.date(),
});

/**
 * PatternDefinition Zod 스키마
 */
const PatternDefinitionSchema = z.object({
  id: z.string().min(1, 'id는 비워둘 수 없습니다'),
  name: z.string().min(1, 'name은 비워둘 수 없습니다'),
  regex: z.instanceof(RegExp, 'regex는 RegExp 인스턴스여야 합니다'),
  priority: z.number().int('priority는 정수여야 합니다').min(1, 'priority는 1 이상이어야 합니다').max(10, 'priority는 10 이하여야 합니다'),
  description: z.string().min(1, 'description은 비워둘 수 없습니다'),
  format: z.enum(SUPPORTED_FORMATS, {
    errorMap: () => ({ message: `format은 다음 중 하나여야 합니다: ${SUPPORTED_FORMATS.join(', ')}` }),
  }),
  examples: z.array(z.string()).optional(),
});

/**
 * ImageResolution Zod 스키마
 */
const ImageResolutionSchema: z.ZodType<ImageResolution> = z.object({
  width: z.number().positive('width는 양수여야 합니다'),
  height: z.number().positive('height는 양수여야 합니다'),
});

/**
 * ImageQualityMetrics Zod 스키마
 */
const ImageQualityMetricsSchema = z.object({
  overallScore: z.number().min(0, 'overallScore는 0 이상이어야 합니다').max(100, 'overallScore는 100 이하여야 합니다'),
  brightness: z.number().min(0, 'brightness는 0 이상이어야 합니다').max(255, 'brightness는 255 이하여야 합니다'),
  contrast: z.number().min(0, 'contrast는 0 이상이어야 합니다').max(255, 'contrast는 255 이하여야 합니다'),
  sharpness: z.number().min(0, 'sharpness는 0 이상이어야 합니다').max(1, 'sharpness는 1 이하여야 합니다'),
  noiseLevel: z.number().min(0, 'noiseLevel은 0 이상이어야 합니다').max(1, 'noiseLevel은 1 이하여야 합니다'),
  resolution: ImageResolutionSchema,
  fileSize: z.number().nonnegative('fileSize는 0 이상이어야 합니다'),
  format: z.string().min(1, 'format은 비워둘 수 없습니다'),
});

/**
 * ExtractionResult Zod 스키마
 */
const ExtractionResultSchema = z
  .object({
    success: z.boolean(),
    bodyScore: z.number().int().min(0).max(100).optional(),
    attempts: z.array(ExtractionAttemptSchema),
    error: z.string().optional(),
    processingTimeMs: z.number().nonnegative('processingTimeMs는 0 이상이어야 합니다'),
    timestamp: z.date(),
  })
  .refine((data) => !data.success || data.bodyScore !== undefined, {
    message: 'success가 true인 경우 bodyScore는 필수입니다',
    path: ['bodyScore'],
  })
  .refine((data) => data.success || data.error !== undefined, {
    message: 'success가 false인 경우 error는 필수입니다',
    path: ['error'],
  });

// ========== Type Guards ==========

/**
 * ExtractionAttempt 유효성 검사
 */
export function isValidExtractionAttempt(data: unknown): data is ExtractionAttempt {
  const result = ExtractionAttemptSchema.safeParse(data);
  return result.success;
}

/**
 * PatternDefinition 유효성 검사
 */
export function isValidPatternDefinition(data: unknown): data is PatternDefinition {
  const result = PatternDefinitionSchema.safeParse(data);
  return result.success;
}

/**
 * ImageQualityMetrics 유효성 검사
 */
export function isValidImageQualityMetrics(data: unknown): data is ImageQualityMetrics {
  const result = ImageQualityMetricsSchema.safeParse(data);
  return result.success;
}

/**
 * ExtractionResult 유효성 검사
 */
export function isValidExtractionResult(data: unknown): data is ExtractionResult {
  const result = ExtractionResultSchema.safeParse(data);
  return result.success;
}

// ========== Validation Functions ==========

/**
 * ExtractionAttempt 검증 (상세 결과 반환)
 */
export function validateExtractionAttempt(data: unknown) {
  return ExtractionAttemptSchema.safeParse(data);
}

/**
 * PatternDefinition 검증 (상세 결과 반환)
 */
export function validatePatternDefinition(data: unknown) {
  return PatternDefinitionSchema.safeParse(data);
}

/**
 * ImageQualityMetrics 검증 (상세 결과 반환)
 */
export function validateImageQualityMetrics(data: unknown) {
  return ImageQualityMetricsSchema.safeParse(data);
}

/**
 * ExtractionResult 검증 (상세 결과 반환)
 */
export function validateExtractionResult(data: unknown) {
  return ExtractionResultSchema.safeParse(data);
}

// ========== Type Inference ==========

/**
 * Zod 스키마에서 타입 추출 (내부 사용)
 */
export type ExtractionAttemptFromSchema = z.infer<typeof ExtractionAttemptSchema>;
export type PatternDefinitionFromSchema = z.infer<typeof PatternDefinitionSchema>;
export type ImageQualityMetricsFromSchema = z.infer<typeof ImageQualityMetricsSchema>;
export type ExtractionResultFromSchema = z.infer<typeof ExtractionResultSchema>;
