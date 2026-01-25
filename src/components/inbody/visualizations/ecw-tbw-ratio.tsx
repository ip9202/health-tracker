/**
 * TAG-FE-011-VIS-002: ECW/TBW Ratio Visualization Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 세포내외수 비율 시각화 - 원형 게이지 차트 기반 재설계
 *
 * ECW (Extracellular Water): 세포외액
 * TBW (Total Body Water): 전체 체수분
 * ECW/TBW Ratio: 세포부종 및 수분 균형 지표
 * 정상 범위: 0.380 - 0.390
 *
 * Design System (SPEC-FE-006):
 * - Normal (0.380-0.390): Success Green (#22C55E)
 * - Low (< 0.380): Primary Blue (#0066CC)
 * - High (> 0.390): Warning Orange (#F97316)
 */

'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export interface ECWTBWRatioProps {
  ecw: number // kg - Extracellular Water
  tbw: number // kg - Total Body Water
}

/**
 * Calculate ECW/TBW ratio status (Revised for SPEC-FE-006)
 */
function calculateECWRatioStatus(ecw: number, tbw: number) {
  const ratio = ecw / tbw

  // InBody standard ranges (SPEC-FE-006)
  if (ratio >= 0.380 && ratio <= 0.390) {
    return {
      status: 'normal' as const,
      label: '정상 범위',
      shortLabel: '정상',
      color: '#22C55E', // InBody Green
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: '세포내외 수분 균형이 정상 범위 내입니다.',
      icon: '✓',
    }
  }

  if (ratio < 0.380) {
    return {
      status: 'low' as const,
      label: '낮음',
      shortLabel: '낮음',
      color: '#0066CC', // InBody Blue
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: '세포외액이 정상보다 낮습니다. 수분 섭취를 권장합니다.',
      icon: '↓',
    }
  }

  // ratio > 0.390
  return {
    status: 'high' as const,
  label: '높음',
  shortLabel: '높음',
  color: '#F97316', // InBody Orange
  bgColor: 'bg-orange-50',
  borderColor: 'border-orange-200',
  description: '세포외액이 정상보다 높습니다. 부종 가능성을 확인하세요.',
  icon: '↑',
}
}

/**
 * Custom Tooltip for Gauge Chart
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">
          {payload[0].value.toFixed(3)}
        </p>
      </div>
    )
  }
  return null
}

/**
 * Gauge Chart Component
 */
function GaugeChart({
  value,
  min = 0.340,
  max = 0.440,
  normalMin = 0.380,
  normalMax = 0.390,
  color,
}: {
  value: number
  min?: number
  max?: number
  normalMin: number
  normalMax: number
  color: string
}) {
  const range = max - min
  const normalizedValue = Math.max(min, Math.min(max, value))
  const percentage = ((normalizedValue - min) / range) * 100

  // Gauge chart data (background arc + value arc)
  const data = [
    { name: 'Background', value: 100 },
    { name: 'Value', value: percentage },
  ]

  return (
    <div className="relative w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {/* Background Arc */}
            <Cell fill="#E5E7EB" />
            {/* Value Arc */}
            <Cell fill={color} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Value Display in Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <span className="text-3xl font-bold font-mono" style={{ color }}>
          {value.toFixed(3)}
        </span>
        <span className="text-xs text-gray-500 mt-1">ECW/TBW</span>
      </div>
    </div>
  )
}

/**
 * Normal Range Indicator Component
 */
function NormalRangeIndicator({
  value,
  normalMin,
  normalMax,
  min,
  max,
}: {
  value: number
  normalMin: number
  normalMax: number
  min: number
  max: number
}) {
  const range = max - min
  const normalStartPercent = ((normalMin - min) / range) * 100
  const normalEndPercent = ((normalMax - min) / range) * 100
  const valuePercent = ((value - min) / range) * 100

  return (
    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
      {/* Normal Range Zone */}
      <div
        className="absolute h-full bg-green-400"
        style={{
          left: `${normalStartPercent}%`,
          width: `${normalEndPercent - normalStartPercent}%`,
        }}
      />

      {/* Value Indicator */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gray-900 transition-all duration-500"
        style={{ left: `${valuePercent}%` }}
      >
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </div>

      {/* Scale Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 pb-0.5 -mt-1">
        <span className="text-[9px] text-gray-500">{min.toFixed(2)}</span>
        <span className="text-[9px] text-gray-600 font-semibold">
          {normalMin.toFixed(2)}
        </span>
        <span className="text-[9px] text-gray-600 font-semibold">
          {normalMax.toFixed(2)}
        </span>
        <span className="text-[9px] text-gray-500">{max.toFixed(2)}</span>
      </div>
    </div>
  )
}

/**
 * Water Distribution Bar Component (InBody Style)
 */
function WaterBar({
  label,
  value,
  total,
  color,
  unit = 'kg',
}: {
  label: string
  value: number
  total: number
  color: string
  unit?: string
}) {
  const percentage = ((value / total) * 100).toFixed(1)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold font-mono" style={{ color }}>
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">{unit}</span>
        </div>
      </div>
      <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full flex items-center justify-end pr-2 transition-all duration-500"
          style={{
            width: `${(value / total) * 100}%`,
            backgroundColor: color,
          }}
        >
          <span className="text-xs font-bold text-white">{percentage}%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * ECW/TBW Ratio Visualization Component (SPEC-FE-006 Redesign)
 */
export function ECWTBWRatio({ ecw, tbw }: ECWTBWRatioProps) {
  const ratioData = calculateECWRatioStatus(ecw, tbw)
  const ratio = ecw / tbw
  const icw = tbw - ecw // Intracellular Water

  return (
    <div className={`w-full bg-white border ${ratioData.borderColor} rounded-lg p-6 shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">세포내외수 분석</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            ECW/TBW 비율: {ratio.toFixed(3)} (정상: 0.380 - 0.390)
          </p>
        </div>
        <div
          className={`${ratioData.bgColor} px-3 py-1.5 rounded-full flex items-center gap-2 border ${ratioData.borderColor}`}
        >
          <span className="text-lg font-bold" style={{ color: ratioData.color }}>
            {ratioData.icon}
          </span>
          <span className="text-sm font-semibold" style={{ color: ratioData.color }}>
            {ratioData.shortLabel}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-8 mb-6">
        {/* Gauge Chart */}
        <div className="flex flex-col items-center">
          <GaugeChart
            value={ratio}
            min={0.340}
            max={0.440}
            normalMin={0.380}
            normalMax={0.390}
            color={ratioData.color}
          />
        </div>

        {/* Water Distribution */}
        <div className="space-y-4">
          <WaterBar
            label="세포외액 (ECW)"
            value={ecw}
            total={tbw}
            color="#0066CC"
            unit="kg"
          />
          <WaterBar
            label="세포내액 (ICW)"
            value={icw}
            total={tbw}
            color="#22C55E"
            unit="kg"
          />
        </div>
      </div>

      {/* Normal Range Scale */}
      <div className={`${ratioData.bgColor} rounded-lg p-4 mb-6`}>
        <p className="text-xs text-gray-600 mb-2">ECW/TBW 비율 척도</p>
        <NormalRangeIndicator
          value={ratio}
          normalMin={0.380}
          normalMax={0.390}
          min={0.340}
          max={0.440}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>정상 미만</span>
          <span className="font-semibold text-green-600">정상 범위</span>
          <span>정상 초과</span>
        </div>
      </div>

      {/* Status Description (InBody Style) */}
      <div
        className={`${ratioData.bgColor} rounded-md p-4 border-l-4`}
        style={{ borderLeftColor: ratioData.color }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white border-2"
            style={{ borderColor: ratioData.color }}
          >
            <span className="text-sm font-bold" style={{ color: ratioData.color }}>
              {ratioData.icon}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900 mb-1">
              {ratioData.label}
            </h4>
            <p className="text-sm text-gray-700">{ratioData.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
