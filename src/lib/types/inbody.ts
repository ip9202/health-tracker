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
  smi?: number
  dailyCalories?: number

  // 메타데이터
  imagePath: string
  ocrConfidence?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 차트 및 리스트 표시용 간소화된 InBody 레코드
 */
export interface InBodyRecord {
  id: string
  measuredAt: Date
  weight?: number
  bodyFat?: number
  muscle?: number
  skeletalMuscle?: number
  bodyScore?: number
  bmi?: number
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
