/**
 * InBody 차트 데이터 생성 유틸리티
 *
 * InBody 측정 데이터를 시각화를 위한 차트 데이터로 변환합니다.
 */

import type { InBodyRecord } from '@/lib/types/inbody';
import {
  getRangeStatus,
  getSkeletalMuscleStatus,
  getBodyFatMassStatus,
  getBodyFatPercentageStatus,
  getBMIStatus,
  getWeightRange,
  getStatusColor,
  getStatusLabel,
  type RangeStatus,
} from './inbody-standards';

/**
 * 차트 표시용 지표 타입
 */
export interface ChartMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: RangeStatus;
  color: string;
  range: {
    low: number;
    high: number;
    current: number;
  };
}

/**
 * InBody 데이터를 차트 지표 배열로 변환
 *
 * @param data - InBody 측정 데이터
 * @returns 차트 표시용 지표 배열
 */
export function createChartMetrics(data: InBodyRecord): ChartMetric[] {
  const metrics: ChartMetric[] = [];

  // 1. 체중 (weight)
  if (data.weight !== undefined && data.height) {
    const weightRange = getWeightRange(data.height);
    const weightStatus = getRangeStatus(data.weight, weightRange);
    metrics.push({
      id: 'weight',
      name: '체중',
      value: data.weight,
      unit: 'kg',
      status: weightStatus,
      color: getStatusColor(weightStatus),
      range: {
        low: weightRange.low,
        high: weightRange.high,
        current: data.weight,
      },
    });
  }

  // 2. 골격근량 (skeletal muscle)
  if (data.skeletalMuscle !== undefined && data.weight) {
    const muscleStatus = getSkeletalMuscleStatus(data.skeletalMuscle, data.weight);
    // 골격근량은 체중 대비 비율로 계산하므로, 표시를 위해 절대값 범위를 설정
    const expectedLow = data.weight * 0.38;
    const expectedHigh = data.weight * 0.45;
    metrics.push({
      id: 'skeletalMuscle',
      name: '골격근량',
      value: data.skeletalMuscle,
      unit: 'kg',
      status: muscleStatus,
      color: getStatusColor(muscleStatus),
      range: {
        low: expectedLow,
        high: expectedHigh,
        current: data.skeletalMuscle,
      },
    });
  }

  // 3. 체지방량 (body fat mass in kg)
  if (data.bodyFat !== undefined && data.weight) {
    const gender = (data.gender === 'male' || data.gender === 'female') ? data.gender : 'male';
    const bodyFatMassStatus = getBodyFatMassStatus(data.bodyFat, data.weight, gender);
    // 체지방량은 체중 대비 비율로 계산하므로, 표시를 위해 절대값 범위를 설정
    const expectedLow = data.weight * (gender === 'male' ? 0.10 : 0.18);
    const expectedHigh = data.weight * (gender === 'male' ? 0.20 : 0.28);
    metrics.push({
      id: 'bodyFat',
      name: '체지방량',
      value: data.bodyFat,
      unit: 'kg',
      status: bodyFatMassStatus,
      color: getStatusColor(bodyFatMassStatus),
      range: {
        low: expectedLow,
        high: expectedHigh,
        current: data.bodyFat,
      },
    });
  }

  // 3. 체지방률 (body fat percentage)
  if (data.bodyFatPercentage !== undefined) {
    // 성별이 없으면 남성 기준으로 판별
    const gender = (data.gender === 'male' || data.gender === 'female') ? data.gender : 'male';
    const bodyFatStatus = getBodyFatPercentageStatus(data.bodyFatPercentage, gender);
    const range = gender === 'male'
      ? { low: 10, high: 20 }
      : { low: 18, high: 28 };
    metrics.push({
      id: 'bodyFatPercentage',
      name: '체지방률',
      value: data.bodyFatPercentage,
      unit: '%',
      status: bodyFatStatus,
      color: getStatusColor(bodyFatStatus),
      range: {
        low: range.low,
        high: range.high,
        current: data.bodyFatPercentage,
      },
    });
  }

  // 4. BMI (체질량지수)
  if (data.bmi !== undefined) {
    const bmiStatus = getBMIStatus(data.bmi);
    metrics.push({
      id: 'bmi',
      name: '체질량지수 (BMI)',
      value: data.bmi,
      unit: '',
      status: bmiStatus,
      color: getStatusColor(bmiStatus),
      range: {
        low: 18.5,
        high: 22.9,
        current: data.bmi,
      },
    });
  }

  return metrics;
}

/**
 * 지표별 백분위 계산 (그래프 길이 계산용)
 *
 * @param value - 현재 값
 * @param range - 표준 범위
 * @returns 백분위 (0-100)
 */
export function calculatePercentage(value: number, range: { low: number; high: number }): number {
  const spread = range.high - range.low;

  if (value <= range.low) {
    // 낮음 영역: 0-40%
    return Math.max(0, (value / range.low) * 40);
  } else if (value >= range.high) {
    // 높음 영역: 60-100%
    return Math.min(100, 60 + ((value - range.high) / spread) * 40);
  } else {
    // 표준 영역: 40-60%
    return 40 + ((value - range.low) / spread) * 20;
  }
}

/**
 * 차트 지표 데이터 포맷팅
 *
 * @param metric - 차트 지표
 * @returns 포맷팅된 문자열
 */
export function formatMetricValue(metric: ChartMetric): string {
  return `${metric.value.toFixed(2)}${metric.unit}`;
}

/**
 * 범위 설명 텍스트 생성
 *
 * @param range - 표준 범위
 * @param unit - 단위
 * @returns 범위 설명 텍스트
 */
export function formatRangeText(range: { low: number; high: number }, unit: string): string {
  return `${range.low.toFixed(2)}${unit} - ${range.high.toFixed(2)}${unit}`;
}

/**
 * 상태별 상세 설명 생성
 *
 * @param status - 범위 상태
 * @param metricName - 지표 이름
 * @returns 상태 설명 텍스트
 */
export function getStatusDescription(status: RangeStatus, metricName: string): string {
  const label = getStatusLabel(status);

  switch (status) {
    case 'low':
      return `${metricName}이 표준보다 ${label}습니다. 영양 섭취와 운동을 통해 개선이 필요할 수 있습니다.`;
    case 'normal':
      return `${metricName}이 ${label} 범위입니다. 현재 상태를 유지하세요.`;
    case 'high':
      return `${metricName}이 ${label}습니다. 관리가 필요할 수 있습니다.`;
  }
}

/**
 * 구간 색상 계산을 위한 데이터 타입
 */
export interface ZoneSegment {
  startPercent: number;
  endPercent: number;
  status: RangeStatus;
  color: string;
}

/**
 * 막대그래프 구간 색상 계산
 *
 * @param metric - 차트 지표
 * @returns 구간별 색상 데이터
 */
export function calculateZoneSegments(metric: ChartMetric): ZoneSegment[] {
  const { range } = metric;

  // 전체 표시 범위 계산 (최소값 ~ 최대값)
  // low와 high 사이를 중심으로 여유를 두어 전체 범위 설정
  const midPoint = (range.low + range.high) / 2;
  const spread = range.high - range.low;

  // 전체 범위: low보다 약간 낮은 값부터 high보다 약간 높은 값까지
  const minDisplay = Math.max(0, range.low - spread * 0.5);
  const maxDisplay = range.high + spread * 0.5;
  const totalRange = maxDisplay - minDisplay;

  // 각 구간의 퍼센트 계산
  const lowEndPercent = ((range.low - minDisplay) / totalRange) * 100;
  const highStartPercent = ((range.high - minDisplay) / totalRange) * 100;

  return [
    {
      startPercent: 0,
      endPercent: lowEndPercent,
      status: 'low',
      color: '#3B82F6', // blue-500
    },
    {
      startPercent: lowEndPercent,
      endPercent: highStartPercent,
      status: 'normal',
      color: '#22C55E', // green-500
    },
    {
      startPercent: highStartPercent,
      endPercent: 100,
      status: 'high',
      color: '#F97316', // orange-500
    },
  ];
}

/**
 * 현재 값의 퍼센트 위치 계산 (구간 기반)
 *
 * @param metric - 차트 지표
 * @returns 퍼센트 위치 (0-100)
 */
export function calculateZonePercentage(metric: ChartMetric): number {
  const { range, value } = metric;

  // 전체 표시 범위 계산
  const midPoint = (range.low + range.high) / 2;
  const spread = range.high - range.low;
  const minDisplay = Math.max(0, range.low - spread * 0.5);
  const maxDisplay = range.high + spread * 0.5;
  const totalRange = maxDisplay - minDisplay;

  // 현재 값의 퍼센트 계산
  const percent = ((value - minDisplay) / totalRange) * 100;

  // 0-100 범위로 제한
  return Math.max(0, Math.min(100, percent));
}
