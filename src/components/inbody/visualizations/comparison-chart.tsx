/**
 * TAG-FE-011-VIS-005: Comparison Analysis Chart Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody Before/After 비교 분석 시각화 - 막대 그래프 기반 구현
 *
 * Design System (SPEC-FE-006):
 * - Positive Change (개선): Success Green (#22C55E)
 * - Negative Change (악화): Warning Orange (#F97316)
 * - Neutral Change (유지): Primary Blue (#0066CC)
 */

'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { Badge } from '@/components/ui/badge'

export interface ComparisonMetric {
  name: string // 지표 이름 (예: "체중", "체지방률")
  beforeValue: number // 이전 값
  afterValue: number // 현재 값
  unit: string // 단위
  isLowerBetter?: boolean // 낮을수록 좋은지 여부 (체중, 체지방률 등)
}

export interface ComparisonChartProps {
  data: ComparisonMetric[]
  title?: string
  showChart?: boolean
}

/**
 * 변화율 계산 및 상태 판정
 */
function calculateChange(before: number, after: number, isLowerBetter?: boolean) {
  const change = after - before
  const percentChange = before !== 0 ? (change / before) * 100 : 0

  // 상태 판정
  let status: 'positive' | 'negative' | 'neutral'
  if (isLowerBetter) {
    // 낮을수록 좋은 지표 (체중, 체지방률 등)
    if (change < -0.5) status = 'positive'
    else if (change > 0.5) status = 'negative'
    else status = 'neutral'
  } else {
    // 높을수록 좋은 지표 (근육량 등)
    if (change > 0.5) status = 'positive'
    else if (change < -0.5) status = 'negative'
    else status = 'neutral'
  }

  return {
    change,
    percentChange,
    status,
  }
}

/**
 * 상태별 색상 반환 (InBody Design System)
 */
function getStatusColor(status: 'positive' | 'negative' | 'neutral') {
  switch (status) {
    case 'positive':
      return '#22C55E' // InBody Green
    case 'negative':
      return '#F97316' // InBody Orange
    case 'neutral':
      return '#0066CC' // InBody Blue
  }
}

/**
 * Custom Tooltip for Comparison Chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

/**
 * Comparison Metric Card Component
 */
function ComparisonMetricCard({
  metric,
}: {
  metric: ComparisonMetric
}) {
  const { change, percentChange, status } = calculateChange(
    metric.beforeValue,
    metric.afterValue,
    metric.isLowerBetter
  )
  const statusColor = getStatusColor(status)

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          {metric.name}
        </h4>
        <div className="flex items-baseline gap-3">
          <div>
            <span className="text-xs text-gray-500">이전</span>
            <span className="ml-1 text-sm font-mono text-gray-700">
              {metric.beforeValue.toFixed(1)}{metric.unit}
            </span>
          </div>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          <div>
            <span className="text-xs text-gray-500">현재</span>
            <span className="ml-1 text-sm font-bold font-mono text-gray-900">
              {metric.afterValue.toFixed(1)}{metric.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Change Indicator */}
      <div
        className="px-3 py-1.5 rounded-md text-center min-w-[80px]"
        style={{ backgroundColor: statusColor + '15' }}
      >
        <div className="text-lg font-bold font-mono" style={{ color: statusColor }}>
          {change > 0 ? '+' : ''}
          {change.toFixed(1)}
          {metric.unit}
        </div>
        <div className="text-xs text-gray-500">
          ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
        </div>
      </div>
    </div>
  )
}

/**
 * Comparison Analysis Chart Component (SPEC-FE-006 Implementation)
 */
export function ComparisonChart({
  data,
  title = '전후 비교 분석',
  showChart = true,
}: ComparisonChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    return data.map((metric) => {
      const { status } = calculateChange(
        metric.beforeValue,
        metric.afterValue,
        metric.isLowerBetter
      )

      return {
        name: metric.name,
        이전: metric.beforeValue,
        현재: metric.afterValue,
        status,
      }
    })
  }, [data])

  // Calculate overall summary
  const summary = useMemo(() => {
    const positiveCount = data.filter((m) => {
      const { status } = calculateChange(
        m.beforeValue,
        m.afterValue,
        m.isLowerBetter
      )
      return status === 'positive'
    }).length

    const negativeCount = data.filter((m) => {
      const { status } = calculateChange(
        m.beforeValue,
        m.afterValue,
        m.isLowerBetter
      )
      return status === 'negative'
    }).length

    return {
      positiveCount,
      negativeCount,
      neutralCount: data.length - positiveCount - negativeCount,
    }
  }, [data])

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            이전 측정과 현재 측정을 비교합니다
          </p>
        </div>

        {/* Summary Badge */}
        <div className="flex gap-2">
          {summary.positiveCount > 0 && (
            <Badge className="bg-green-50 text-green-700 border-green-200">
              ✓ {summary.positiveCount}개 개선
            </Badge>
          )}
          {summary.negativeCount > 0 && (
            <Badge className="bg-orange-50 text-orange-700 border-orange-200">
              ⚠ {summary.negativeCount}개 악화
            </Badge>
          )}
        </div>
      </div>

      {/* Chart Section */}
      {showChart && (
        <div className="mb-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                iconType="circle"
              />
              <Bar
                dataKey="이전"
                fill="#9CA3AF"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="현재"
                fill="#0066CC"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Metric Cards */}
      <div className="space-y-3">
        {data.map((metric, index) => (
          <ComparisonMetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">변화 안내</p>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
            <span className="text-gray-600">개선</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#0066CC]" />
            <span className="text-gray-600">유지</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#F97316]" />
            <span className="text-gray-600">악화</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Quick Comparison Card Component (Minimal Version)
 */
export interface QuickComparisonProps {
  title: string
  beforeValue: number
  afterValue: number
  unit: string
  isLowerBetter?: boolean
}

export function QuickComparison({
  title,
  beforeValue,
  afterValue,
  unit,
  isLowerBetter = false,
}: QuickComparisonProps) {
  const { change, percentChange, status } = calculateChange(
    beforeValue,
    afterValue,
    isLowerBetter
  )
  const statusColor = getStatusColor(status)

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold font-mono text-gray-900">
              {afterValue.toFixed(1)}
              {unit}
            </span>
            <span className="text-xs text-gray-500">
              (이전: {beforeValue.toFixed(1)})
            </span>
          </div>
        </div>

        {/* Change Badge */}
        <div
          className="px-3 py-1.5 rounded-md text-center"
          style={{ backgroundColor: statusColor + '15' }}
        >
          <div className="text-sm font-bold font-mono" style={{ color: statusColor }}>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">{percentChange.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  )
}
