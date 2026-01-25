/**
 * TAG-FE-001-AWR-003: Summary Statistics Card Component
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 주간/월간 요약 통계 카드 컴포넌트
 */

'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  Award,
  Target,
} from 'lucide-react'

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
 * Calculate trend and color
 */
function calculateTrend(current: number, previous?: number) {
  if (!previous) return { trend: 'neutral' as const, change: 0 }

  const change = ((current - previous) / previous) * 100

  if (Math.abs(change) < 1) return { trend: 'neutral' as const, change }
  return { trend: change > 0 ? 'up' : 'down', change }
}

/**
 * Stat Item Component
 */
function StatItem({
  label,
  value,
  icon: Icon,
  higherIsBetter = false,
  showTrend = true,
}: {
  label: string
  value: StatValue
  icon: React.ElementType
  higherIsBetter?: boolean
  showTrend?: boolean
}) {
  const trend = calculateTrend(value.current, value.previous)

  const getTrendIcon = () => {
    if (trend.trend === 'neutral') return Minus
    if (trend.trend === 'up') return TrendingUp
    return TrendingDown
  }

  const TrendIcon = getTrendIcon()

  const getTrendColor = () => {
    if (trend.trend === 'neutral') return 'text-gray-500'
    if (higherIsBetter) {
      return trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
    } else {
      return trend.trend === 'down' ? 'text-green-600' : 'text-red-600'
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{label}</span>
        </div>

        {showTrend && value.previous && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-xs font-medium">
              {trend.change > 0 ? '+' : ''}
              {trend.change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {value.current.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">{value.unit || ''}</span>
      </div>

      {value.previous && (
        <div className="text-xs text-gray-400 mt-1">
          전: {value.previous.toFixed(1)}
          {value.unit}
        </div>
      )}
    </div>
  )
}

/**
 * Summary Stats Card Component
 */
export function SummaryStatsCard({ stats }: SummaryStatsCardProps) {
  return (
    <Card className="w-full bg-white border border-gray-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-['Inter','Noto_Sans_KR',sans-serif]">
              {stats.periodLabel || (stats.period === 'week' ? '주간' : '월간')} 요약
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {stats.measurements}회 측정 데이터
            </p>
          </div>

          <Badge
            className={`${
              stats.period === 'week'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-purple-50 text-purple-700'
            } border-0`}
          >
            <Calendar className="w-3 h-3 mr-1" />
            {stats.period === 'week' ? '최근 7일' : '최근 30일'}
          </Badge>
        </div>

        {/* Highlights */}
        {stats.highlights && (stats.highlights.best || stats.highlights.worst) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Best Improvement */}
            {stats.highlights.best && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">
                    최고 개선
                  </span>
                </div>
                <p className="text-sm font-semibold text-green-900">
                  {stats.highlights.best}
                </p>
              </div>
            )}

            {/* Needs Attention */}
            {stats.highlights.worst && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700">
                    관심 필요
                  </span>
                </div>
                <p className="text-sm font-semibold text-orange-900">
                  {stats.highlights.worst}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Weight */}
          {stats.stats.weight && (
            <StatItem
              label="체중"
              value={stats.stats.weight}
              icon={Activity}
              higherIsBetter={false}
            />
          )}

          {/* Muscle */}
          {stats.stats.muscle && (
            <StatItem
              label="골격근량"
              value={stats.stats.muscle}
              icon={Activity}
              higherIsBetter={true}
            />
          )}

          {/* Body Fat */}
          {stats.stats.bodyFat && (
            <StatItem
              label="체지방량"
              value={stats.stats.bodyFat}
              icon={Activity}
              higherIsBetter={false}
            />
          )}

          {/* Body Fat Percentage */}
          {stats.stats.bodyFatPercentage && (
            <StatItem
              label="체지방률"
              value={stats.stats.bodyFatPercentage}
              icon={Activity}
              higherIsBetter={false}
            />
          )}

          {/* Body Score */}
          {stats.stats.bodyScore && (
            <StatItem
              label="신체 점수"
              value={stats.stats.bodyScore}
              icon={Award}
              higherIsBetter={true}
              showTrend={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
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

  const currentFatPct = avg(
    periodRecords.map((r) => r.bodyFatPercentage || 0).filter(Boolean)
  )
  const previousFatPct = avg(
    beforeRecords.map((r) => r.bodyFatPercentage || 0).filter(Boolean)
  )

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
