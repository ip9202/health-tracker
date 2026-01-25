/**
 * TAG-FE-001-AWR-001: Change Highlight Component
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 전후 비교 하이라이트 (변화 강조) 컴포넌트
 */

'use client'

import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface MetricChange {
  name: string
  currentValue: number
  previousValue: number
  unit: string
  targetValue?: number
  higherIsBetter?: boolean // true: 증가가 좋음, false: 감소가 좋음
}

export interface ChangeHighlightProps {
  changes: MetricChange[]
  period?: string // e.g., "지난 30일", "지난 3개월"
}

/**
 * Calculate change direction and magnitude
 */
function calculateChange(current: number, previous: number, higherIsBetter = false) {
  const change = current - previous
  const percentChange = (change / previous) * 100

  let status: 'improved' | 'declined' | 'stable'
  let color: string
  let bgColor: string

  if (Math.abs(percentChange) < 1) {
    status = 'stable'
    color = 'text-gray-600'
    bgColor = 'bg-gray-50'
  } else {
    const isPositive = higherIsBetter ? change > 0 : change < 0
    status = isPositive ? 'improved' : 'declined'
    color = isPositive ? 'text-green-600' : 'text-red-600'
    bgColor = isPositive ? 'bg-green-50' : 'bg-red-50'
  }

  return {
    change,
    percentChange,
    status,
    color,
    bgColor,
  }
}

/**
 * Metric Change Card Component
 */
function MetricChangeCard({ metric }: { metric: MetricChange }) {
  const changeData = calculateChange(
    metric.currentValue,
    metric.previousValue,
    metric.higherIsBetter
  )

  const getIcon = () => {
    if (changeData.status === 'stable') return Minus
    if (changeData.status === 'improved') return TrendingUp
    return TrendingDown
  }

  const Icon = getIcon()

  // Target progress calculation
  const targetProgress = metric.targetValue
    ? (metric.currentValue / metric.targetValue) * 100
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">{metric.name}</h4>
        <Badge className={`${changeData.bgColor} ${changeData.color} border-0`}>
          <Icon className="w-3 h-3 mr-1" />
          {changeData.status === 'improved' && '개선'}
          {changeData.status === 'declined' && '악화'}
          {changeData.status === 'stable' && '유지'}
        </Badge>
      </div>

      {/* Values */}
      <div className="flex items-baseline gap-3 mb-3">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            {metric.currentValue.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-400">→</span>
          <span className={`font-semibold ${changeData.color}`}>
            {metric.previousValue.toFixed(1)}
            {metric.unit}
          </span>
        </div>
      </div>

      {/* Change Bar */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${
            changeData.status === 'improved'
              ? 'bg-green-500'
              : changeData.status === 'declined'
                ? 'bg-red-500'
                : 'bg-gray-400'
          }`}
          style={{
            left:
              changeData.change > 0
                ? `${(metric.previousValue / (metric.currentValue + metric.previousValue)) * 100}%`
                : `${(metric.currentValue / (metric.currentValue + metric.previousValue)) * 100}%`,
            width: `${Math.abs(changeData.percentChange) * 2}%`,
            maxWidth: '100%',
          }}
        />
      </div>

      {/* Change Text */}
      <div className="flex items-center justify-between text-xs">
        <span className={changeData.color}>
          {changeData.percentChange > 0 ? '+' : ''}
          {changeData.percentChange.toFixed(1)}% 변화
        </span>

        {/* Target Progress */}
        {targetProgress !== null && (
          <span className="text-gray-500">
            목표: {targetProgress.toFixed(0)}%
          </span>
        )}
      </div>

      {/* Alert for declined metrics */}
      {changeData.status === 'declined' && Math.abs(changeData.percentChange) > 5 && (
        <div className="mt-3 flex items-start gap-2 p-2 bg-red-50 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            {metric.name}이(가) {Math.abs(changeData.percentChange).toFixed(1)}%{' '}
            {changeData.change > 0 ? '증가' : '감소'}했습니다. 관리가 필요합니다.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Change Highlight Component
 */
export function ChangeHighlight({ changes, period = '지난 30일' }: ChangeHighlightProps) {
  // Sort by priority: declined > improved > stable
  const sortedChanges = [...changes].sort((a, b) => {
    const changeA = calculateChange(a.currentValue, a.previousValue, a.higherIsBetter)
    const changeB = calculateChange(b.currentValue, b.previousValue, b.higherIsBetter)

    if (changeA.status === 'declined' && changeB.status !== 'declined') return -1
    if (changeB.status === 'declined' && changeA.status !== 'declined') return 1
    if (changeA.status === 'improved' && changeB.status === 'stable') return -1
    if (changeB.status === 'improved' && changeA.status === 'stable') return 1
    return 0
  })

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-['Inter','Noto_Sans_KR',sans-serif]">
            변화 하이라이트
          </h3>
          <p className="text-sm text-gray-500 mt-1">{period} 동안의 변화</p>
        </div>

        {/* Summary Badge */}
        <Badge
          className={`${
            sortedChanges.some((c) =>
              calculateChange(c.currentValue, c.previousValue, c.higherIsBetter).status ===
                'declined'
            )
              ? 'bg-orange-50 text-orange-700'
              : 'bg-green-50 text-green-700'
          } border-0`}
        >
          {sortedChanges.filter(
            (c) =>
              calculateChange(c.currentValue, c.previousValue, c.higherIsBetter).status ===
              'improved'
          ).length}{' '}
          개선 / {sortedChanges.length}
        </Badge>
      </div>

      {/* Metric Changes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedChanges.map((metric, index) => (
          <MetricChangeCard key={`${metric.name}-${index}`} metric={metric} />
        ))}
      </div>
    </div>
  )
}
