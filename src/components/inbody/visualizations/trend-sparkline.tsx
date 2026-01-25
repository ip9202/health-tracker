/**
 * TAG-FE-011-VIS-003: Trend Sparkline Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 지표별 트렌드 스파크라인 - 미니멀 디자인 및 InBody 색상 시스템 적용
 *
 * Design System (SPEC-FE-006):
 * - Primary Blue (#0066CC): 일반 트렌드
 * - Success Green (#22C55E): 긍정적 변화
 * - Warning Orange (#F97316): 부정적 변화
 * - Minimal design: 최소화된 애니메이션, 깔끔한 레이아웃
 */

'use client'

import 'react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'

export interface TrendDataPoint {
  date: string
  value: number
}

export interface TrendSparklineProps {
  title: string
  data: TrendDataPoint[]
  currentValue: number
  previousValue?: number
  unit?: string
  color?: 'blue' | 'green' | 'orange'
  height?: number
  showAxis?: boolean
}

/**
 * Get InBody color scheme (SPEC-FE-006)
 */
function getInBodyColorScheme(color: 'blue' | 'green' | 'orange') {
  const schemes = {
    blue: {
      primary: '#0066CC', // InBody Blue
      light: '#DBEAFE',
      gradientStart: 'rgba(0, 102, 204, 0.2)',
      gradientEnd: 'rgba(0, 102, 204, 0)',
    },
    green: {
      primary: '#22C55E', // InBody Green
      light: '#DCFCE7',
      gradientStart: 'rgba(34, 197, 94, 0.2)',
      gradientEnd: 'rgba(34, 197, 94, 0)',
    },
    orange: {
      primary: '#F97316', // InBody Orange
      light: '#FED7AA',
      gradientStart: 'rgba(249, 115, 22, 0.2)',
      gradientEnd: 'rgba(249, 115, 22, 0)',
    },
  }
  return schemes[color]
}

/**
 * Calculate trend direction and percentage change
 */
function calculateTrend(current: number, previous?: number) {
  if (!previous) return { direction: 'neutral' as const, change: 0 }

  const change = ((current - previous) / previous) * 100
  if (change > 0.5) return { direction: 'up' as const, change }
  if (change < -0.5) return { direction: 'down' as const, change }
  return { direction: 'neutral' as const, change }
}

/**
 * Get trend color based on metric type (context-aware)
 */
function getTrendColor(
  direction: 'up' | 'down' | 'neutral',
  metricColor: 'blue' | 'green' | 'orange'
) {
  // InBody 규칙: 체중/체지방 감소는 긍정적, 근육량 증가는 긍정적
  const isWeightMetric = metricColor === 'orange' // 체중/체지방

  if (direction === 'up') {
    return isWeightMetric ? '#F97316' : '#22C55E' // 체중 증가=부정, 근육 증가=긍정
  }
  if (direction === 'down') {
    return isWeightMetric ? '#22C55E' : '#F97316' // 체중 감소=긍정, 근육 감소=부정
  }
  return '#6B7280' // 중립
}

/**
 * Custom Tooltip for Sparkline (Minimal Design)
 */
const CustomTooltip = ({ active, payload, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-2 py-1.5 rounded-md shadow-sm border border-gray-200">
        <p className="text-sm font-semibold font-mono text-gray-900">
          {payload[0].value.toFixed(1)}
          {unit}
        </p>
      </div>
    )
  }
  return null
}

/**
 * Gradient Definition Component
 */
const ChartGradient = ({
  color,
  id,
}: {
  color: string
  id: string
}) => (
  <defs>
    <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={0.2} />
      <stop offset="95%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  </defs>
)

/**
 * Trend Sparkline Component (SPEC-FE-006 Redesign)
 */
export function TrendSparkline({
  title,
  data,
  currentValue,
  previousValue,
  unit = '',
  color = 'blue',
  height = 100,
  showAxis = false,
}: TrendSparklineProps) {
  const colorScheme = getInBodyColorScheme(color)
  const trend = calculateTrend(currentValue, previousValue)
  const trendColor = getTrendColor(trend.direction, color)

  // Calculate min/max for YAxis domain with padding
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.1

  // Create gradient ID
  const gradientId = `${color}-${title.replace(/\s/g, '')}`

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">{title}</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gray-900">
              {currentValue.toFixed(1)}
              {unit}
            </span>
            {/* Trend Indicator */}
            {previousValue && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: trendColor + '20',
                  color: trendColor,
                }}
              >
                {trend.direction === 'up' && '+'}
                {trend.change.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Trend Icon (Minimal) */}
        {previousValue && (
          <div
            className="p-1.5 rounded-md"
            style={{ backgroundColor: trendColor + '15' }}
          >
            <svg
              className={`w-4 h-4`}
              style={{ color: trendColor }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {trend.direction === 'up' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              )}
              {trend.direction === 'down' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              )}
              {trend.direction === 'neutral' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14"
                />
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Sparkline Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: showAxis ? -20 : 5, bottom: 5 }}
          >
            <ChartGradient color={colorScheme.primary} id={gradientId} />
            {showAxis && (
              <>
                <XAxis
                  dataKey="date"
                  hide
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  hide
                  domain={[minValue - padding, maxValue + padding]}
                  axisLine={false}
                  tickLine={false}
                />
              </>
            )}
            <Tooltip
              content={<CustomTooltip unit={unit} />}
              animationDuration={200}
            />
            {/* Average Reference Line */}
            <ReferenceLine
              y={values.reduce((a, b) => a + b, 0) / values.length}
              stroke="#E5E7EB"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colorScheme.primary}
              strokeWidth={2}
              fill={`url(#gradient-${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: colorScheme.primary,
                strokeWidth: 0,
              }}
              animationBegin={0}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Points Summary (Minimal) */}
      {data.length > 1 && (
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{data.length}회 측정</span>
          <span className="font-mono">
            최소: {Math.min(...values).toFixed(1)}
            {unit}
          </span>
          <span className="font-mono">
            최대: {Math.max(...values).toFixed(1)}
            {unit}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Sparkline Grid Component - Multiple sparklines in a grid (InBody Style)
 */
export interface SparklineGridProps {
  sparklines: Array<{
    id: string
    title: string
    data: TrendDataPoint[]
    currentValue: number
    previousValue?: number
    unit?: string
    color?: 'blue' | 'green' | 'orange'
  }>
}

export function SparklineGrid({ sparklines }: SparklineGridProps) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">지표별 추이</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sparklines.map((sparkline) => (
          <TrendSparkline key={sparkline.id} {...sparkline} />
        ))}
      </div>
    </div>
  )
}
