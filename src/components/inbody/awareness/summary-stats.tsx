/**
 * TAG-FE-012-AWR-003: Summary Statistics Card Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 주간/월간 요약 통계 카드 - 의료 보고서 스타일 적용
 *
 * Design System (SPEC-FE-006):
 * - Medical report style: 깔끔하고 전문적인 레이아웃
 * - Color coding: InBody 색상 시스템 적용
 * - Typography: 숫자는 Roboto Mono, 제목은 Pretendard
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'

export interface StatValue {
  current: number
  previous?: number
  unit?: string
}

export interface SummaryStats {
  period: 'week' | 'month' | 'custom'
  periodLabel?: string
  measurements: number
  stats: {
    weight?: StatValue
    muscle?: StatValue
    bodyFat?: StatValue
    bodyFatPercentage?: StatValue
    bodyScore?: StatValue
  }
  highlights?: {
    best?: string // Best improved metric name
    worst?: string // Most declined metric name
  }
}

export interface SummaryStatsCardProps {
  stats: SummaryStats
}

/**
 * 트렌드 계산 및 색상 판정 (InBody Design System)
 */
function calculateTrend(current: number, previous?: number, higherIsBetter = false) {
  if (!previous) return { trend: 'neutral' as const, change: 0, color: '#0066CC' }

  const change = ((current - previous) / previous) * 100

  if (Math.abs(change) < 1) {
    return { trend: 'neutral' as const, change, color: '#0066CC' } // InBody Blue
  }

  const isPositive = higherIsBetter ? change > 0 : change < 0
  return {
    trend: isPositive ? ('up' as const) : ('down' as const),
    change,
    color: isPositive ? '#22C55E' : '#F97316', // Green : Orange
  }
}

/**
 * Stat Item Component (Medical Report Style)
 */
function StatItem({
  label,
  value,
  higherIsBetter = false,
  showTrend = true,
}: {
  label: string
  value: StatValue
  higherIsBetter?: boolean
  showTrend?: boolean
}) {
  const trend = calculateTrend(value.current, value.previous, higherIsBetter)

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>

        {showTrend && value.previous && (
          <div className="flex items-center gap-1">
            {/* Trend Icon */}
            <svg
              className={`w-3 h-3 ${Math.abs(trend.change) < 1 ? '' : ''}`}
              fill="none"
              stroke={trend.color}
              viewBox="0 0 24 24"
            >
              {trend.trend === 'up' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              )}
              {trend.trend === 'down' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              )}
              {trend.trend === 'neutral' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14"
                />
              )}
            </svg>
            <span className="text-xs font-semibold" style={{ color: trend.color }}>
              {trend.change > 0 ? '+' : ''}
              {trend.change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-gray-900">
          {value.current.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">{value.unit || ''}</span>
      </div>

      {value.previous && (
        <div className="text-xs text-gray-400 mt-1">
          이전: {value.previous.toFixed(1)}
          {value.unit}
        </div>
      )}
    </div>
  )
}

/**
 * Summary Stats Card Component (SPEC-FE-006 Redesign)
 */
export function SummaryStatsCard({ stats }: SummaryStatsCardProps) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {stats.periodLabel || (stats.period === 'week' ? '주간' : '월간')} 요약
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{stats.measurements}회 측정 데이터</p>
        </div>

        <Badge
          className="border-0 px-3 py-1.5"
          style={{
            backgroundColor: stats.period === 'week' ? '#DBEAFE' : '#E9D5FF',
            color: stats.period === 'week' ? '#0066CC' : '#9333EA',
          }}
        >
          {stats.period === 'week' ? '최근 7일' : '최근 30일'}
        </Badge>
      </div>

      {/* Highlights */}
      {stats.highlights && (stats.highlights.best || stats.highlights.worst) && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Best Improvement */}
          {stats.highlights.best && (
            <div
              className="rounded-lg p-4 border-l-4"
              style={{ backgroundColor: '#DCFCE7', borderLeftColor: '#22C55E' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏆</span>
                <span className="text-xs font-medium" style={{ color: '#22C55E' }}>
                  최고 개선
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{stats.highlights.best}</p>
            </div>
          )}

          {/* Needs Attention */}
          {stats.highlights.worst && (
            <div
              className="rounded-lg p-4 border-l-4"
              style={{ backgroundColor: '#FED7AA', borderLeftColor: '#F97316' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <span className="text-xs font-medium" style={{ color: '#F97316' }}>
                  관심 필요
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{stats.highlights.worst}</p>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Weight */}
        {stats.stats.weight && (
          <StatItem label="체중" value={stats.stats.weight} higherIsBetter={false} />
        )}

        {/* Muscle */}
        {stats.stats.muscle && (
          <StatItem label="골격근량" value={stats.stats.muscle} higherIsBetter={true} />
        )}

        {/* Body Fat */}
        {stats.stats.bodyFat && (
          <StatItem label="체지방량" value={stats.stats.bodyFat} higherIsBetter={false} />
        )}

        {/* Body Fat Percentage */}
        {stats.stats.bodyFatPercentage && (
          <StatItem
            label="체지방률"
            value={stats.stats.bodyFatPercentage}
            higherIsBetter={false}
          />
        )}

        {/* Body Score */}
        {stats.stats.bodyScore && (
          <StatItem label="신체 점수" value={stats.stats.bodyScore} higherIsBetter={true} showTrend={false} />
        )}
      </div>
    </div>
  )
}

/**
 * Generate default summary stats from records
 */
export function generateSummaryStats(
  records: Array<{
    weight?: number
    muscle?: number
    bodyFat?: number
    bodyFatPercentage?: number
    bodyScore?: number
    measuredAt: Date
  }>,
  period: 'week' | 'month' = 'week'
): SummaryStats {
  const now = new Date()
  const daysAgo = period === 'week' ? 7 : 30
  const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

  const periodRecords = records.filter((r) => r.measuredAt >= cutoffDate)
  const beforeRecords = records.filter((r) => r.measuredAt < cutoffDate)

  // Calculate averages
  const avg = (values: number[]) =>
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

  const currentWeight = avg(periodRecords.map((r) => r.weight || 0).filter(Boolean))
  const previousWeight = avg(beforeRecords.map((r) => r.weight || 0).filter(Boolean))

  const currentMuscle = avg(periodRecords.map((r) => r.muscle || 0).filter(Boolean))
  const previousMuscle = avg(beforeRecords.map((r) => r.muscle || 0).filter(Boolean))

  const currentFat = avg(periodRecords.map((r) => r.bodyFat || 0).filter(Boolean))
  const previousFat = avg(beforeRecords.map((r) => r.bodyFat || 0).filter(Boolean))

  const currentFatPct = avg(periodRecords.map((r) => r.bodyFatPercentage || 0).filter(Boolean))
  const previousFatPct = avg(beforeRecords.map((r) => r.bodyFatPercentage || 0).filter(Boolean))

  const currentScore = avg(periodRecords.map((r) => r.bodyScore || 0).filter(Boolean))
  const previousScore = avg(beforeRecords.map((r) => r.bodyScore || 0).filter(Boolean))

  return {
    period,
    measurements: periodRecords.length,
    stats: {
      weight: { current: currentWeight, previous: previousWeight, unit: 'kg' },
      muscle: { current: currentMuscle, previous: previousMuscle, unit: 'kg' },
      bodyFat: { current: currentFat, previous: previousFat, unit: 'kg' },
      bodyFatPercentage: { current: currentFatPct, previous: previousFatPct, unit: '%' },
      bodyScore: { current: currentScore, previous: previousScore, unit: '점' },
    },
  }
}
