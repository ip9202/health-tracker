/**
 * InBody 표준 범위 및 상태 판별 유틸리티
 *
 * InBody 기기의 적정 판별 기준을 정의하고,
 * 개별 지표별 상태(낮음/표준/높음)를 판별합니다.
 */

/**
 * 범위 상태 타입
 */
export type RangeStatus = 'low' | 'normal' | 'high';

/**
 * 지표별 표준 범위
 */
export interface StandardRange {
  low: number;
  high: number;
}

/**
 * 성별에 따른 체지방률 기준 (%)
 */
export const BODY_FAT_PERCENTAGE_RANGES = {
  male: { low: 10, high: 20 } as StandardRange,    // 남성: 10-20% 표준
  female: { low: 18, high: 28 } as StandardRange,  // 여성: 18-28% 표준
};

/**
 * BMI 기준 (성별 무관)
 */
export const BMI_RANGE = { low: 18.5, high: 22.9 } as StandardRange;

/**
 * 골격근량 기준 (체중 대비 %)
 * 실제 골격근량 = 체중 * 비율
 */
export const SKELETAL_MUSCLE_RATIO = {
  low: 0.38,   // 38% 미만: 낮음
  high: 0.45,  // 45% 이상: 높음
};

/**
 * 체중 기준 (키에 따른 표준 체중)
 * 표준 체중 = (키 - 100) * 0.9
 * 허용 범위: ±10%
 */
export function getWeightRange(height: number): StandardRange {
  const standardWeight = (height - 100) * 0.9;
  return {
    low: standardWeight * 0.9,
    high: standardWeight * 1.1,
  };
}

/**
 * 범위 상태 판별
 *
 * @param value - 측정값
 * @param range - 표준 범위
 * @returns 'low' | 'normal' | 'high'
 */
export function getRangeStatus(value: number, range: StandardRange): RangeStatus {
  if (value < range.low) return 'low';
  if (value > range.high) return 'high';
  return 'normal';
}

/**
 * 골격근량 상태 판별 (체중 대비 비율)
 *
 * @param skeletalMuscle - 골격근량 (kg)
 * @param weight - 체중 (kg)
 * @returns 'low' | 'normal' | 'high'
 */
export function getSkeletalMuscleStatus(skeletalMuscle: number, weight: number): RangeStatus {
  const ratio = skeletalMuscle / weight;
  if (ratio < SKELETAL_MUSCLE_RATIO.low) return 'low';
  if (ratio >= SKELETAL_MUSCLE_RATIO.high) return 'high';
  return 'normal';
}

/**
 * 체지방률 상태 판별
 *
 * @param bodyFatPercentage - 체지방률 (%)
 * @param gender - 성별 ('male' | 'female')
 * @returns 'low' | 'normal' | 'high'
 */
export function getBodyFatPercentageStatus(
  bodyFatPercentage: number,
  gender: 'male' | 'female'
): RangeStatus {
  const range = BODY_FAT_PERCENTAGE_RANGES[gender];
  return getRangeStatus(bodyFatPercentage, range);
}

/**
 * 체지방량 상태 판별 (체중 대비 비율)
 *
 * @param bodyFat - 체지방량 (kg)
 * @param weight - 체중 (kg)
 * @param gender - 성별 ('male' | 'female')
 * @returns 'low' | 'normal' | 'high'
 */
export function getBodyFatMassStatus(
  bodyFat: number,
  weight: number,
  gender: 'male' | 'female'
): RangeStatus {
  const ratio = bodyFat / weight;
  // 남성: 10-20%, 여성: 18-28%
  if (gender === 'male') {
    if (ratio < 0.10) return 'low';
    if (ratio > 0.20) return 'high';
    return 'normal';
  } else {
    if (ratio < 0.18) return 'low';
    if (ratio > 0.28) return 'high';
    return 'normal';
  }
}

/**
 * BMI 상태 판별
 *
 * @param bmi - BMI 지수
 * @returns 'low' | 'normal' | 'high'
 */
export function getBMIStatus(bmi: number): RangeStatus {
  if (bmi < BMI_RANGE.low) return 'low';
  if (bmi > BMI_RANGE.high) return 'high';
  return 'normal';
}

/**
 * 상태별 색상 반환
 *
 * InBody 기본 적정 판별 색상:
 * - 낮음 (하위 25%): 파란색
 * - 표준 (중간 50%): 초록색
 * - 높음 (상위 25%): 주황색
 *
 * @param status - 범위 상태
 * @returns CSS 색상 코드
 */
export function getStatusColor(status: RangeStatus): string {
  switch (status) {
    case 'low':
      return '#3B82F6'; // blue-500: 파란색
    case 'normal':
      return '#22C55E'; // green-500: 초록색
    case 'high':
      return '#F97316'; // orange-500: 주황색
  }
}

/**
 * 상태별 테마 색상 클래스 (Tailwind CSS)
 *
 * @param status - 범위 상태
 * @returns Tailwind CSS 클래스 문자열
 */
export function getStatusColorClass(status: RangeStatus): string {
  switch (status) {
    case 'low':
      return 'bg-blue-500';
    case 'normal':
      return 'bg-green-500';
    case 'high':
      return 'bg-orange-500';
  }
}

/**
 * 상태별 배경 색상 클래스 (연한 버전)
 *
 * @param status - 범위 상태
 * @returns Tailwind CSS 배경 클래스 문자열
 */
export function getStatusBgColorClass(status: RangeStatus): string {
  switch (status) {
    case 'low':
      return 'bg-blue-50';
    case 'normal':
      return 'bg-green-50';
    case 'high':
      return 'bg-orange-50';
  }
}

/**
 * 상태별 텍스트 색상 클래스
 *
 * @param status - 범위 상태
 * @returns Tailwind CSS 텍스트 클래스 문자열
 */
export function getStatusTextColorClass(status: RangeStatus): string {
  switch (status) {
    case 'low':
      return 'text-blue-700';
    case 'normal':
      return 'text-green-700';
    case 'high':
      return 'text-orange-700';
  }
}

/**
 * 상태 한국어 라벨
 *
 * @param status - 범위 상태
 * @returns 한국어 라벨
 */
export function getStatusLabel(status: RangeStatus): string {
  switch (status) {
    case 'low':
      return '낮음';
    case 'normal':
      return '표준';
    case 'high':
      return '높음';
  }
}
