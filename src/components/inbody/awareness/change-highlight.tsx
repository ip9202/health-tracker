/**
 * TAG-FE-012-AWR-001: Change Highlight Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 전후 비교 하이라이트 - InBody 색상 시스템 적용
 *
 * Design System (SPEC-FE-006):
 * - Positive (개선): Success Green (#22C55E)
 * - Negative (악화): Warning Orange (#F97316)
 * - Neutral (유지): Primary Blue (#0066CC)
 */

'use client'

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
 * 변화 계산 및 상태 판정 (InBody Design System)
 */
function calculateChange(current: number, previous: number, higherIsBetter = false) {
  const change = current - previous
  const percentChange = previous !== 0 ? (change / previous) * 100 : 0

  let status: 'improved' | 'declined' | 'stable'
  let color: string
  let bgColor: string

  // InBody 규칙: 1% 미만 변화는 유지로 간주
  if (Math.abs(percentChange) < 1) {
    status = 'stable'
    color = '#0066CC' // InBody Blue
    bgColor = 'bg-blue-50'
  } else {
    // 컨텍스트 인지 판정 (지표별 좋은 방향 고려)
    const isPositive = higherIsBetter ? change > 0 : change < 0
    status = isPositive ? 'improved' : 'declined'
    color = isPositive ? '#22C55E' : '#F97316' // Green : Orange
    bgColor = isPositive ? 'bg-green-50' : 'bg-orange-50'
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
 * Metric Change Card Component (InBody Style)
 */
function MetricChangeCard({ metric }: { metric: MetricChange }) {
  const changeData = calculateChange(
    metric.currentValue,
    metric.previousValue,
    metric.higherIsBetter
  )

  // 목표 진행률 계산
  const targetProgress = metric.targetValue
    ? (metric.currentValue / metric.targetValue) * 100
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">{metric.name}</h4>
        <Badge
          className={`${changeData.bgColor} border-0 px-2.5 py-1`}
          style={{ color: changeData.color }}
        >
          {changeData.status === 'improved' && '개선'}
          {changeData.status === 'declined' && '악화'}
          {changeData.status === 'stable' && '유지'}
        </Badge>
      </div>

      {/* Values */}
      <div className="flex items-baseline gap-3 mb-3">
        <div>
          <span className="text-2xl font-bold font-mono text-gray-900">
            {metric.currentValue.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
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
          <span className="text-sm font-mono text-gray-600">
            {metric.previousValue.toFixed(1)}
            {metric.unit}
          </span>
        </div>
      </div>

      {/* Change Indicator Bar */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="absolute top-0 bottom-0 rounded-full transition-all duration-500"
          style={{
            backgroundColor: changeData.color,
            left: '0',
            width: `${Math.min(Math.abs(changeData.percentChange) * 3, 100)}%`,
          }}
        />
      </div>

      {/* Change Text */}
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: changeData.color }}>
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
        <div
          className="mt-3 p-2.5 rounded-md border-l-4"
          style={{ backgroundColor: changeData.bgColor, borderLeftColor: changeData.color }}
        >
          <p className="text-xs" style={{ color: changeData.color }}>
            <span className="font-semibold">⚠️ 관리 필요:</span>{' '}
            {metric.name}이(가) {Math.abs(changeData.percentChange).toFixed(1)}%{' '}
            {changeData.change > 0 ? '증가' : '감소'}했습니다.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Change Highlight Component (SPEC-FE-006 Redesign)
 */
export function ChangeHighlight({
  changes,
  period = '지난 30일',
}: ChangeHighlightProps) {
  // 중요도 정렬: 악화 > 개선 > 유지
  const sortedChanges = [...changes].sort((a, b) => {
    const changeA = calculateChange(a.currentValue, a.previousValue, a.higherIsBetter)
    const changeB = calculateChange(b.currentValue, b.previousValue, b.higherIsBetter)

    if (changeA.status === 'declined' && changeB.status !== 'declined') return -1
    if (changeB.status === 'declined' && changeA.status !== 'declined') return 1
    if (changeA.status === 'improved' && changeB.status === 'stable') return -1
    if (changeB.status === 'improved' && changeA.status === 'stable') return 1
    return 0
  })

  const improvedCount = sortedChanges.filter(
    (c) => calculateChange(c.currentValue, c.previousValue, c.higherIsBetter).status === 'improved'
  ).length
  const declinedCount = sortedChanges.filter(
    (c) => calculateChange(c.currentValue, c.previousValue, c.higherIsBetter).status === 'declined'
  ).length

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">변화 하이라이트</h3>
          <p className="text-sm text-gray-500 mt-0.5">{period} 동안의 변화</p>
        </div>

        {/* Summary Badge */}
        <div className="flex gap-2">
          {improvedCount > 0 && (
            <Badge className="bg-green-50 text-green-700 border-green-200 border-0">
              ✓ {improvedCount}개 개선
            </Badge>
          )}
          {declinedCount > 0 && (
            <Badge className="bg-orange-50 text-orange-700 border-orange-200 border-0">
              ⚠ {declinedCount}개 악화
            </Badge>
          )}
        </div>
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
