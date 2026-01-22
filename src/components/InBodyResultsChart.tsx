/**
 * InBody 결과 막대그래프 시각화 컴포넌트
 *
 * OCR로 추출된 InBody 체성분 데이터를 막대그래프로 시각화합니다.
 *
 * FEATURES:
 * - 가로 막대그래프 형태의 지표별 시각화
 * - InBody 기준 적정 판별 색상 (낮음: 파란색, 표준: 초록색, 높음: 주황색)
 * - 사용자 값에 표시기
 * - 적정 범위 표시
 * - 반응형 디자인
 */

'use client';

import React from 'react';
import type { InBodyRecord } from '@/lib/types/inbody';
import {
  createChartMetrics,
  formatMetricValue,
  formatRangeText,
  getStatusDescription,
  calculateZoneSegments,
  calculateZonePercentage,
  type ChartMetric,
} from '@/lib/utils/inbody-chart-utils';
import {
  getStatusLabel,
  getStatusBgColorClass,
  getStatusTextColorClass,
} from '@/lib/utils/inbody-standards';

/**
 * InBodyResultsChart 컴포넌트 Props
 */
export interface InBodyResultsChartProps {
  /** InBody 측정 데이터 */
  data: InBodyRecord;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 단일 막대그래프 아이템 컴포넌트 (InBody 770 Muscle-Fat Analysis 스타일)
 */
function MetricBarItem({ metric }: { metric: ChartMetric }) {
  const zonePercentage = calculateZonePercentage(metric);
  const zoneSegments = calculateZoneSegments(metric);
  const statusLabel = getStatusLabel(metric.status);

  // InBody 스타일: 표준 범위 계산을 위한 백분율
  const standardRange = metric.range.high - metric.range.low;
  const rangeStartPercent = ((metric.range.low - (metric.range.low - standardRange * 0.5)) / (standardRange * 2)) * 100;
  const rangeEndPercent = 100 - rangeStartPercent;

  return (
    <div className="mb-6 last:mb-0">
      {/* 지표 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{metric.name}</h3>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBgColorClass(metric.status)} ${getStatusTextColorClass(metric.status)}`}
          >
            {statusLabel}
          </span>
        </div>
        <div className="text-sm font-bold text-gray-900">
          {formatMetricValue(metric)}
        </div>
      </div>

      {/* 막대그래프 컨테이너 (InBody 770 스타일) */}
      <div className="relative px-2">
        {/* 배경 바 (3구간 색상) */}
        <div className="h-6 rounded-sm overflow-hidden relative flex">
          {/* 낮음 구간 (파란색) */}
          <div
            className="h-full bg-blue-400"
            style={{ width: `${zoneSegments[0].endPercent}%` }}
          />
          {/* 표준 구간 (초록색) */}
          <div
            className="h-full bg-green-500"
            style={{
              left: `${zoneSegments[0].endPercent}%`,
              width: `${zoneSegments[1].endPercent - zoneSegments[0].endPercent}%`,
            }}
          />
          {/* 높음 구간 (주황색) */}
          <div
            className="h-full bg-orange-400"
            style={{
              left: `${zoneSegments[1].endPercent}%`,
              width: `${100 - zoneSegments[1].endPercent}%`,
            }}
          />

          {/* 현재 값 막대 (검은색, 불투명) */}
          <div
            className="absolute top-0 bottom-0 bg-gray-800 opacity-70"
            style={{
              left: '0%',
              width: `${Math.max(2, zonePercentage)}%`,
            }}
          />
        </div>

        {/* 구간 라벨 */}
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{metric.range.low}{metric.unit}</span>
          <span className="text-green-600 font-medium">
            {metric.range.low}-{metric.range.high}{metric.unit}
          </span>
          <span>{metric.range.high + (metric.range.high - metric.range.low)}{metric.unit}</span>
        </div>
      </div>

      {/* 상태 설명 */}
      <p className={`mt-2 text-xs ${getStatusTextColorClass(metric.status)}`}>
        {getStatusDescription(metric.status, metric.name)}
      </p>
    </div>
  );
}

/**
 * InBodyResultsChart 메인 컴포넌트
 */
export function InBodyResultsChart({ data, className = '' }: InBodyResultsChartProps) {
  const metrics = createChartMetrics(data);

  if (metrics.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-500">표시할 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">InBody 체성분 분석</h2>
        <p className="text-sm text-gray-600">
          각 지표별 현재 값과 적정 범위를 비교하여 시각화합니다.
        </p>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-gray-700">낮음</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-xs text-gray-700">표준</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-xs text-gray-700">높음</span>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          ※ 색상은 InBody 기준 적정 판별에 따릅니다
        </div>
      </div>

      {/* 막대그래프 목록 */}
      <div className="space-y-2">
        {metrics.map((metric) => (
          <MetricBarItem key={metric.id} metric={metric} />
        ))}
      </div>

      {/* 추가 정보 */}
      {data.measuredAt && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            측정일: {new Date(data.measuredAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * OCR 테스트 페이지용 간소화 버전
 */
export function InBodyResultsChartSimple({ data, className = '' }: InBodyResultsChartProps) {
  const metrics = createChartMetrics(data);

  if (metrics.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <p className="text-center text-gray-500 py-4">표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-lg font-bold text-gray-900 mb-4">InBody 체성분 시각화</h2>

      {/* 간소화된 범례 */}
      <div className="flex items-center gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-gray-600">낮음</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-600">표준</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-gray-600">높음</span>
        </div>
      </div>

      {/* 막대그래프 목록 */}
      <div className="space-y-4">
        {metrics.map((metric) => (
          <MetricBarItem key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}

export default InBodyResultsChart;
