/**
 * TAG-FE-001-TYPE-001: InBody 데이터 관리 타입 정의
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 데이터 관리 대시보드를 위한 TypeScript 타입 정의
 */

/**
 * InBody 측정 데이터의 전체 구조
 * API 응답과 데이터베이스 레코드에서 사용되는 완전한 타입
 */
export interface InBodyData {
  id: string
  userId: string
  measuredAt: Date

  // 개인정보
  name?: string
  gender?: string
  age?: number
  height?: number // cm

  // 체성분 데이터
  weight?: number // kg
  bodyFat?: number // %
  muscle?: number // kg
  protein?: number // kg
  bodyWater?: number // kg
  skeletalMuscle?: number // kg

  // 신체 점수
  bodyScore?: number
  scoreDescription?: string

  // 비만 판정
  bmi?: number
  bmiStatus?: string

  // 체중 조절
  weightChangeRecommendation?: string

  // 신체 유형
  bodyType?: string

  // 기타 지표
  dailyCalories?: number

  // 메타데이터
  imagePath: string
  ocrConfidence?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 차트 및 리스트 표시용 간소화된 InBody 레코드
 * InBodyData와 타입 일관성을 맞추되, 하위 호환성 유지 (TAG-TYPE-001)
 */
export interface InBodyRecord {
  id: string
  userId: string
  measuredAt: Date

  // 개인정보
  name?: string
  gender?: string
  age?: number
  height?: number // cm

  // 체성분 데이터
  weight?: number // kg
  bodyFat?: number // % (체지방률, InBodyData와 동일)
  bodyFatPercentage?: number // % (체지방률, 하위 호환성용 별칭)
  muscle?: number // kg
  protein?: number // kg
  bodyWater?: number // kg
  skeletalMuscle?: number // kg

  // 신체 점수
  bodyScore?: number
  scoreDescription?: string

  // 비만 판정
  bmi?: number
  bmiStatus?: string

  // 체중 조절
  weightControl?: string // 하위 호환성용
  weightChangeRecommendation?: string // InBodyData와 필드명 통일

  // 신체 유형
  bodyType?: string

  // 기타 지표
  dailyCalories?: number // InBodyData와 필드명 통일
  calorieNeeds?: number // 하위 호환성용

  // OCR 메타데이터
  ocrConfidence?: number

  // 메타데이터
  createdAt: Date
  updatedAt: Date
}

/**
 * 이미지 업로드 API 응답 타입
 */
export interface UploadResponse {
  success: boolean
  data?: {
    id: string
    measuredAt: Date
    ocrConfidence?: number
  }
  error?: string
}

/**
 * 기록 조회 API 응답 타입
 */
export interface HistoryResponse {
  records: InBodyRecord[]
  total: number
  page: number
  pageSize: number
}

/**
 * 이미지 업로드 상태
 */
export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

/**
 * 업로드 진행 상태
 */
export interface UploadProgress {
  status: UploadStatus
  progress: number // 0-100
  message?: string
  error?: string
}

/**
 * 날짜 범위 필터
 */
export interface DateRangeFilter {
  from?: Date
  to?: Date
}

/**
 * 차트 데이터 포인트
 */
export interface ChartDataPoint {
  date: string
  value: number
}

/**
 * 복합 차트 데이터 포인트
 */
export interface MultiLineChartDataPoint {
  date: string
  [key: string]: string | number
}

/**
 * TASK-009: 추출 상세 정보 응답 타입
 * GET /api/inbody/extraction/[id] API 응답
 */
export interface ExtractionDetailResponse {
  success: boolean
  data: {
    id: string
    extractionResult: {
      attempts: Array<{
        patternId: string
        patternName: string
        matchedText: string
        extractedValue: string
        confidence: number
        timestamp: string
      }>
      confidence: number
      processingTimeMs: number
      timestamp: string
    }
  }
}

/**
 * TASK-009: 재시도 추출 응답 타입
 * POST /api/inbody/retry-extraction/[id] API 응답
 */
export interface RetryExtractionResponse {
  success: boolean
  data?: {
    id: string
    extractionResult: {
      attempts: Array<{
        patternId: string
        patternName: string
        matchedText: string
        extractedValue: string
        confidence: number
        timestamp: string
      }>
      confidence: number
      processingTimeMs: number
      timestamp: string
    }
    retryCount: number
    enhancedLevel: number
  }
  error?: string
  errorCode?: string
}
