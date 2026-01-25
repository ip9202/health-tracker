/**
 * TAG-AI-001: GLM API 클라이언트 구현
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템 *
 * GLM API 연동 및 건강 분석 서비스
 * Vision: 이미지에서 InBody 데이터 추출 기능 포함
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import {
  HealthAnalysisSchema,
  type HealthAnalysis,
  type RiskFactor,
  type Recommendation,
  type Warning,
} from './ai-schemas';
import {
  createGLMMessages,
  extractHistoricalData,
} from './prompts/health-analysis';
import type { InBodyRecord } from '@prisma/client';

// 환경 변수
const GLM_API_BASE_URL = process.env.GLM_API_BASE_URL || 'https://api.z.ai/api/anthropic';
const GLM_API_KEY = process.env.GLM_API_KEY || '';
const GLM_MODEL_VERSION = process.env.GLM_MODEL_VERSION || 'claude-3-5-sonnet-20241022';
const GLM_VISION_MODEL = process.env.GLM_VISION_MODEL || 'claude-3-5-sonnet-20241022'; // Vision 모델
const AI_ANALYSIS_TIMEOUT = parseInt(process.env.AI_ANALYSIS_TIMEOUT || '30000', 10);
const AI_MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES || '3', 10);
const AI_RETRY_DELAY = parseInt(process.env.AI_RETRY_DELAY || '1000', 10);

/**
 * GLM API 클라이언트 초기화
 */
const anthropic = new Anthropic({
  apiKey: GLM_API_KEY,
  baseURL: GLM_API_BASE_URL,
  maxRetries: AI_MAX_RETRIES,
  timeout: AI_ANALYSIS_TIMEOUT,
});

/**
 * AI 분석 에러 타입
 */
export class AIAnalysisError extends Error {
  constructor(
    message: string,
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIAnalysisError';
  }
}

/**
 * AI 응답 파싱 에러
 */
export class AIParseError extends AIAnalysisError {
  constructor(message: string, public rawResponse: string) {
    super(message, 'PARSE_ERROR', false);
    this.name = 'AIParseError';
  }
}

/**
 * 지연 함수 (재시도용)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * JSON 코드 블록에서 JSON 추출
 */
function extractJSON(text: string): string {
  // 코드 블록 추적
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // 코드 블록이 없으면 전체 텍스트에서 JSON 패턴 찾기
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return text;
}

/**
 * GLM API로 건강 분석 요청
 * @param inbodyData - InBody 측정 데이터
 * @param historicalRecords - 과거 InBody 기록 (추이 분석용)
 * @returns AI 분석 결과
 */
export async function analyzeWithAI(
  inbodyData: Partial<InBodyRecord>,
  historicalRecords?: Partial<InBodyRecord>[]
): Promise<HealthAnalysis> {
  // 입력 검증
  if (!inbodyData.weight || !inbodyData.height) {
    throw new AIAnalysisError('필수 데이터가 누락되었습니다 (체중, 키)', 'MISSING_DATA', false);
  }

  // 추이 데이터 추출
  const historicalData = historicalRecords
    ? extractHistoricalData(historicalRecords, 3)
    : undefined;

  // API 메시지 생성
  const messages = createGLMMessages(inbodyData, historicalData);

  let lastError: Error | null = null;

  // 재시도 로직
  for (let attempt = 1; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      console.log(`[AI Service] 분석 시도 ${attempt}/${AI_MAX_RETRIES}`);

      // GLM API 호출
      const response = await anthropic.messages.create({
        model: GLM_MODEL_VERSION,
        max_tokens: 2048,
        messages,
      });

      // 응답에서 텍스트 추출
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new AIParseError('AI 응답이 텍스트가 아닙니다', JSON.stringify(content));
      }

      const rawText = content.text;

      // JSON 추출 및 파싱
      const jsonString = extractJSON(rawText);
      let parsedData: unknown;

      try {
        parsedData = JSON.parse(jsonString);
      } catch (parseError) {
        throw new AIParseError(
          `JSON 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 에러'}`,
          rawText
        );
      }

      // Zod 스키마 검증
      const validationResult = HealthAnalysisSchema.safeParse(parsedData);

      if (!validationResult.success) {
        const errorDetails = validationResult.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');

        throw new AIParseError(
          `스키마 검증 실패: ${errorDetails}`,
          rawText
        );
      }

      console.log('[AI Service] 분석 성공');
      return validationResult.data;

    } catch (error) {
      lastError = error as Error;

      // 재시도 가능한 에러인지 확인
      const isRetryable =
        error instanceof AIAnalysisError && error.retryable;

      // 마지막 시도가 아니고 재시도 가능하면 대기 후 재시도
      if (attempt < AI_MAX_RETRIES && isRetryable) {
        console.log(`[AI Service] 재시도 대기 중... (${AI_RETRY_DELAY}ms)`);
        await delay(AI_RETRY_DELAY);
        continue;
      }

      // AIParseError는 재시드하지 않음 (데이터 형식 문제)
      if (error instanceof AIParseError) {
        throw error;
      }

      // API 에러인 경우 마지막 시도까지 재시도
      if (attempt === AI_MAX_RETRIES) {
        throw new AIAnalysisError(
          `AI 분석 실패 (${AI_MAX_RETRIES}회 시도): ${lastError.message}`,
          'API_ERROR',
          false
        );
      }
    }
  }

  // 모든 재시도 실패
  throw new AIAnalysisError(
    `AI 분석 실패: ${lastError?.message || '알 수 없는 에러'}`,
    'MAX_RETRIES_EXCEEDED',
    false
  );
}

/**
 * 데이터베이스에서 분석 결과 조회
 * @param recordId - InBodyRecord ID
 * @returns 저장된 분석 결과 또는 null
 */
export async function getStoredAnalysis(
  recordId: string
): Promise<HealthAnalysis | null> {
  try {
    const { prisma } = await import('./prisma');

    const analysis = await prisma.healthAnalysis.findUnique({
      where: { inbodyRecordId: recordId },
    });

    if (!analysis) {
      return null;
    }

    // JSON 파싱
    const riskFactors: RiskFactor[] = JSON.parse(analysis.riskFactors);
    const recommendations: Recommendation[] = JSON.parse(analysis.recommendations);
    const warnings: Warning[] = JSON.parse(analysis.warnings);

    return {
      healthStatus: analysis.healthStatus,
      healthScore: analysis.healthScore,
      riskFactors,
      recommendations,
      warnings,
    };
  } catch (error) {
    console.error('[AI Service] 저장된 분석 조회 실패:', error);
    return null;
  }
}

/**
 * 분석 결과를 데이터베이스에 저장
 * @param recordId - InBodyRecord ID
 * @param analysis - AI 분석 결과
 * @param modelVersion - 사용된 AI 모델 버전
 */
export async function saveAnalysis(
  recordId: string,
  analysis: HealthAnalysis,
  modelVersion: string = GLM_MODEL_VERSION
): Promise<void> {
  try {
    const { prisma } = await import('./prisma');

    await prisma.healthAnalysis.upsert({
      where: { inbodyRecordId: recordId },
      create: {
        inbodyRecordId: recordId,
        healthStatus: analysis.healthStatus,
        healthScore: analysis.healthScore,
        riskFactors: JSON.stringify(analysis.riskFactors),
        recommendations: JSON.stringify(analysis.recommendations),
        warnings: JSON.stringify(analysis.warnings),
        modelVersion,
      },
      update: {
        healthStatus: analysis.healthStatus,
        healthScore: analysis.healthScore,
        riskFactors: JSON.stringify(analysis.riskFactors),
        recommendations: JSON.stringify(analysis.recommendations),
        warnings: JSON.stringify(analysis.warnings),
        modelVersion,
      },
    });

    console.log(`[AI Service] 분석 결과 저장 완료: ${recordId}`);
  } catch (error) {
    console.error('[AI Service] 분석 결과 저장 실패:', error);
    throw new AIAnalysisError('분석 결과 저장 실패', 'SAVE_ERROR', false);
  }
}

/**
 * 건강 분석 실행 (캐싱 포함)
 * @param recordId - InBodyRecord ID
 * @param inbodyData - InBody 측정 데이터
 * @param historicalRecords - 과거 기록
 * @param forceRefresh - 캐시 무시하고 재분석
 * @returns AI 분석 결과
 */
export async function analyzeHealthData(
  recordId: string,
  inbodyData: Partial<InBodyRecord>,
  historicalRecords?: Partial<InBodyRecord>[],
  forceRefresh: boolean = false
): Promise<HealthAnalysis> {
  // 캐시된 결과 확인
  if (!forceRefresh) {
    const cached = await getStoredAnalysis(recordId);
    if (cached) {
      console.log('[AI Service] 캐시된 분석 결과 반환');
      return cached;
    }
  }

  // AI 분석 실행
  const analysis = await analyzeWithAI(inbodyData, historicalRecords);

  // 분석 결과 저장
  await saveAnalysis(recordId, analysis);

  return analysis;
}

/**
 * 사용자의 모든 InBody 기록을 기반으로 AI 분석 배치 실행
 * @param userId - 사용자 ID
 * @returns 분석된 레코드 수
 */
export async function batchAnalyzeUserRecords(userId: string): Promise<number> {
  try {
    const { prisma } = await import('./prisma');

    // 분석되지 않은 기록 조회
    const unanalyzedRecords = await prisma.inBodyRecord.findMany({
      where: {
        userId,
        healthAnalysis: null,
      },
      orderBy: {
        measuredAt: 'desc',
      },
      include: {
        user: true,
      },
    });

    // 과거 기록 조회 (추이 분석용)
    const allRecords = await prisma.inBodyRecord.findMany({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
    });

    let analyzedCount = 0;

    for (const record of unanalyzedRecords) {
      try {
        // 해당 레코드 이전의 과거 데이터 필터링
        const historicalData = allRecords.filter(
          (r) => r.measuredAt < record.measuredAt
        );

        await analyzeHealthData(record.id, record, historicalData);
        analyzedCount++;
      } catch (error) {
        console.error(`[AI Service] 레코드 ${record.id} 분석 실패:`, error);
      }
    }

    return analyzedCount;
  } catch (error) {
    console.error('[AI Service] 배치 분석 실패:', error);
    throw new AIAnalysisError('배치 분석 실패', 'BATCH_ERROR', false);
  }
}

/**
 * InBody 이미지 데이터 추출 스키마
 */
export const InBodyExtractionSchema = z.object({
  // 개인정보
  name: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  age: z.number().int().positive().optional(),
  height: z.number().positive().optional(),
  measuredAt: z.string().optional(), // 측정일

  // 체성분 데이터
  weight: z.number().positive().optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  muscle: z.number().positive().optional(),
  protein: z.number().positive().optional(),
  bodyWater: z.number().positive().optional(),
  skeletalMuscle: z.number().positive().optional(),

  // 신체 점수
  bodyScore: z.number().int().min(0).max(100).optional(),
  scoreDescription: z.string().optional(),

  // 비만 판정
  bmi: z.number().positive().optional(),
  bmiStatus: z.string().optional(),

  // 체중 조절
  weightControl: z.string().optional(),

  // 기타 지표
  dailyCalories: z.number().positive().optional(),
});

export type InBodyExtraction = z.infer<typeof InBodyExtractionSchema>;

/**
 * GLM Vision API로 InBody 이미지에서 데이터 추출
 * @param imageBase64 - Base64 인코딩된 이미지 데이터 (data:image/jpeg;base64,... 형식)
 * @returns 추출된 InBody 데이터
 */
export async function extractInBodyFromImage(imageBase64: string): Promise<InBodyExtraction> {
  console.log('[Vision Service] InBody 이미지 추출 시작...');

  try {
    // Vision API 호출
    const response = await anthropic.messages.create({
      model: GLM_VISION_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64.split(',')[1] || imageBase64, // data: 접두사 제거
              },
            },
            {
              type: 'text',
              text: `당신은 InBody 체성분 분석 결과지 전문가입니다. 이 결과지에서 정확한 데이터를 추출해주세요.

## InBody 결과지 구조 안내

### 상단 영역 (기본 정보)
- **이름**: 결과지 상단 좌측 (예: 홍길동, JANG HO JIN)
- **성별**: M/Male → male, F/Female → female
- **나이**: 세로로 표시된 숫자 (예: 29세 → 29)
- **키**: Height 섹션 (예: 174.4 cm → 174.4)
- **측정일**: 결과지 상단 (예: 2024.03.25 → 2024-03-25)

### 중단 영역 (체성분 데이터)
- **체중**: Weight (예: 71.5 kg → 71.5)
- **체지방률**: Body Fat % (예: 16.8% → 16.8)
- **근육량**: 通常 SMM 또는 골격근량 (예: 31.2 kg → 31.2)
  ⚠️ 주의: 근육량은 보통 20-40kg 사이입니다. 3kg 같은 낮은 값은 오류입니다.
- **골격근량**: Skeletal Muscle Mass (예: 31.2 kg → 31.2)
- **단백질**: Protein (예: 8.9 kg → 8.9)
- **체수분**: TBW 또는 Total Body Water (예: 40.5 kg → 40.5)

### 하단 영역 (평가 지표)
- **신체 점수**: Body Score 또는 점수 (예: 72점 → 72)
- **BMI**: BMI 값 (예: 23.5 → 23.5)
- **BMI 상태**: 정상, 과체중, 비만 등
- **체중 조절**: Weight Control (예: +3.5kg, -2.1kg)
- **SMI**: 골격근량 지수 (예: 7.8 → 7.8)
- **일일 칼로리**: Calorie 또는 권장 섭취량 (예: 1850 kcal → 1850)

## JSON 출력 형식

\`\`\`json
{
  "name": "홍길동",
  "gender": "male",
  "age": 29,
  "height": 174.4,
  "measuredAt": "2024-03-25",
  "weight": 71.5,
  "bodyFatPercentage": 16.8,
  "muscle": 31.2,
  "skeletalMuscle": 31.2,
  "protein": 8.9,
  "bodyWater": 40.5,
  "bodyScore": 72,
  "scoreDescription": "양호",
  "bmi": 23.5,
  "bmiStatus": "정상",
  "weightControl": "+3.5kg",
  "dailyCalories": 1850
}
\`\`\`

## ⚠️ 중요 주의사항

1. **단위 제거**: 모든 숫자에서 단위를 제거하고 숫자만 반환
2. **근육량 확인**: 근육값이 10kg 미만이면 재확인 필요 (정상 범위: 20-40kg)
3. **불확실한 값**: 확실하지 않은 필드는 포함하지 마세요
4. **날짜 형식**: YYYY-MM-DD 형식 엄수
5. **빈 값 처리**: null이나 빈 값인 필드는 JSON에서 제외

지금 이 결과지를 분석해서 JSON을 반환해주세요.`,
            },
          ],
        },
      ],
    });

    // 응답 파싱
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new AIParseError('Vision 응답이 텍스트가 아닙니다', JSON.stringify(content));
    }

    const rawText = content.text;
    console.log('[Vision Service] Vision 응답 수신:', rawText.substring(0, 200));

    // JSON 추출
    const jsonString = extractJSON(rawText);

    // JSON 파싱
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      throw new AIParseError(
        `JSON 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 에러'}`,
        rawText
      );
    }

    // Zod 스키마 검증
    const validationResult = InBodyExtractionSchema.safeParse(parsedData);

    if (!validationResult.success) {
      const errorDetails = validationResult.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      console.warn('[Vision Service] 스키마 검증 경고:', errorDetails);
      // 일부 필드만 실패해도 성공으로 처리
    }

    const result = validationResult.success ? validationResult.data : (parsedData as InBodyExtraction);

    console.log('[Vision Service] InBody 데이터 추출 성공:', {
      name: result.name,
      weight: result.weight,
      bodyScore: result.bodyScore,
    });

    return result;

  } catch (error) {
    console.error('[Vision Service] 이미지 추출 실패:', error);

    if (error instanceof AIParseError || error instanceof AIAnalysisError) {
      throw error;
    }

    throw new AIAnalysisError(
      `이미지 추출 실패: ${error instanceof Error ? error.message : '알 수 없는 에러'}`,
      'VISION_EXTRACTION_ERROR',
      false
    );
  }
}

/**
 * OCR + AI 하이브리드 추출
 * 1단계: OCR로 텍스트 추출
 * 2단계: AI가 OCR 결과를 구조화
 * 3단계: 실패 시 Vision API로 fallback
 *
 * @param imageBase64 - Base64 인코딩된 이미지
 * @returns 추출된 InBody 데이터
 */
export async function extractInBodyHybrid(imageBase64: string): Promise<InBodyExtraction> {
  console.log('[Hybrid Service] 하이브리드 추출 시작...');

  try {
    // 1단계: OCR 텍스트 추출 시도
    console.log('[Hybrid Service] 1단계: OCR 텍스트 추출 시도...');

    // client-ocr 함수 import
    const { extractTextFromImageClient } = await import('./client-ocr');

    // Base64 이미지를 File 객체로 변환 (client-ocr가 File을 필요로 함)
    const imageBlob = await fetch(imageBase64).then(res => res.blob());
    const imageFile = new File([imageBlob], 'inbody.jpg', { type: 'image/jpeg' });

    const ocrResult = await extractTextFromImageClient(imageFile, {
      language: 'kor+eng',
      preprocess: true,
      preprocessOptions: {
        grayscale: true,
        contrast: 1.8,
        denoise: true,
        binarize: true,
        binarizeThreshold: 140,
        correctRotation: true,
      },
      returnQualityMetrics: false,
      onProgress: () => {},
    });

    console.log('[Hybrid Service] OCR 추출 완료, 신뢰도:', ocrResult.confidence);

    // OCR 신뢰도가 50% 이상이면 AI 정제 시도
    if (ocrResult.confidence >= 50) {
      console.log('[Hybrid Service] 2단계: AI 정제 (OCR 결과 사용)...');

      const refinedData = await refineOCRResult(ocrResult.text);
      console.log('[Hybrid Service] AI 정제 완료');

      return refinedData;
    } else {
      console.log('[Hybrid Service] OCR 신뢰도 낮음 (', ocrResult.confidence, '%), Vision API로 fallback...');
      return await extractInBodyFromImage(imageBase64);
    }

  } catch (error) {
    console.warn('[Hybrid Service] OCR/AI 정제 실패, Vision API로 fallback:', error);

    // Fallback: Vision API 직접 호출
    console.log('[Hybrid Service] Vision API fallback 실행...');
    return await extractInBodyFromImage(imageBase64);
  }
}

/**
 * OCR 텍스트를 AI로 정제하여 구조화된 데이터로 변환
 * @param ocrText - OCR로 추출한 원시 텍스트
 * @returns 정제된 InBody 데이터
 */
async function refineOCRResult(ocrText: string): Promise<InBodyExtraction> {
  console.log('[Refine Service] OCR 텍스트 정제 시작...');

  const response = await anthropic.messages.create({
    model: GLM_MODEL_VERSION,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `다음은 OCR로 추출한 InBody 결과지 텍스트입니다. 이 텍스트를 분석하여 정확한 InBody 데이터를 추출해주세요.

OCR 텍스트:
"""
${ocrText}
"""

추출해야 할 필드:
- name: 이름
- gender: 성별 (male 또는 female)
- age: 나이
- height: 키 (cm)
- measuredAt: 측정일 (YYYY-MM-DD 형식)
- weight: 체중 (kg)
- bodyFatPercentage: 체지방률 (%)
- muscle: 근육량 (kg)
- protein: 단백질 (kg)
- bodyWater: 체수분 (kg)
- skeletalMuscle: 골격근량 (kg)
- bodyScore: 신체 점수 (0-100)
- scoreDescription: 점수 설명
- bmi: BMI 지수
- bmiStatus: BMI 상태 (저체중, 정상, 과체중, 비만 등)
- weightControl: 체중 조절 권장사항 (문자열 또는 숫자)
- dailyCalories: 일일 권장 칼로리

주의사항:
- OCR 텍스트는 노이즈가 있을 수 있으니 맥락을 고려하여 정확한 값을 추출하세요
- 숫자는 단위 없이 숫자만 반환
- 날짜는 YYYY-MM-DD 형식
- null이나 undefined인 필드는 포함하지 마세요
- JSON 코드 블록(\`\`\`json ... \`\`\`) 형식으로 반환`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new AIParseError('AI 응답이 텍스트가 아닙니다', JSON.stringify(content));
  }

  const rawText = content.text;
  console.log('[Refine Service] AI 응답 수신:', rawText.substring(0, 200));

  // JSON 추출 및 파싱
  const jsonString = extractJSON(rawText);
  let parsedData: unknown;
  try {
    parsedData = JSON.parse(jsonString);
  } catch (parseError) {
    throw new AIParseError(
      `JSON 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 에러'}`,
      rawText
    );
  }

  // Zod 스키마 검증
  const validationResult = InBodyExtractionSchema.safeParse(parsedData);

  if (!validationResult.success) {
    const errorDetails = validationResult.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    console.warn('[Refine Service] 스키마 검증 경고:', errorDetails);
  }

  const result = validationResult.success ? validationResult.data : (parsedData as InBodyExtraction);

  console.log('[Refine Service] 텍스트 정제 완료:', {
    name: result.name,
    weight: result.weight,
    bodyScore: result.bodyScore,
  });

  return result;
}
