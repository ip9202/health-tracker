/**
 * TAG-FE-001-VIS-003: Trend Sparkline Component
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 지표별 트렌드 스파크라인 (미니 차트) 컴포넌트
 */

'use client'

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
}

/**
 * Get color based on trend type
 */
function getColorScheme(color: 'blue' | 'green' | 'orange') {
  const schemes = {
    blue: {
      primary: '#3B82F6',
      light: '#DBEAFE',
      gradientStart: 'rgba(59, 130, 246, 0.3)',
      gradientEnd: 'rgba(59, 130, 246, 0)',
    },
    green: {
      primary: '#22C55E',
      light: '#DCFCE7',
      gradientStart: 'rgba(34, 197, 94, 0.3)',
      gradientEnd: 'rgba(34, 197, 94, 0)',
    },
    orange: {
      primary: '#F97316',
      light: '#FED7AA',
      gradientStart: 'rgba(249, 115, 22, 0.3)',
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
 * Custom Tooltip for Sparkline
 */
const CustomTooltip = ({ active, payload, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm text-gray-900 font-semibold">
          {payload[0].value.toFixed(1)}
          {unit}
        </p>
      </div>
    )
  }
  return null
}

/**
 * Trend Sparkline Component
 */
export function TrendSparkline({
  title,
  data,
  currentValue,
  previousValue,
  unit = '',
  color = 'blue',
  height = 80,
}: TrendSparklineProps) {
  const colorScheme = getColorScheme(color)
  const trend = calculateTrend(currentValue, previousValue)

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {currentValue.toFixed(1)}
              {unit}
            </span>
            {/* Trend Indicator */}
            {previousValue && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trend.direction === 'up'
                    ? 'bg-red-50 text-red-600'
                    : trend.direction === 'down'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-50 text-gray-600'
                }`}
              >
                {trend.direction === 'up' && '+'}
                {trend.change.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Trend Icon */}
        <div
          className={`p-2 rounded-lg ${
            trend.direction === 'up'
              ? 'bg-red-50'
              : trend.direction === 'down'
                ? 'bg-green-50'
                : 'bg-gray-50'
          }`}
        >
          <svg
            className={`w-4 h-4 ${
              trend.direction === 'up'
                ? 'text-red-500'
                : trend.direction === 'down'
                  ? 'text-green-500'
                  : 'text-gray-400'
            } ${trend.direction !== 'neutral' ? '' : 'rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17l6-6 6 6"
            />
          </svg>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colorScheme.gradientStart}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={colorScheme.gradientEnd}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colorScheme.primary}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
              activeDot={{ r: 4, fill: colorScheme.primary, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Data Points Summary */}
      {data.length > 1 && (
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{data.length}회 측정</span>
          <span>
            최소: {Math.min(...data.map((d) => d.value)).toFixed(1)}
            {unit}
          </span>
          <span>
            최대: {Math.max(...data.map((d) => d.value)).toFixed(1)}
            {unit}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Sparkline Grid Component - Multiple sparklines in a grid
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
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 font-['Inter','Noto_Sans_KR',sans-serif]">
        지표별 추이
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sparklines.map((sparkline) => (
          <TrendSparkline key={sparkline.id} {...sparkline} />
        ))}
      </div>
    </div>
  )
}
