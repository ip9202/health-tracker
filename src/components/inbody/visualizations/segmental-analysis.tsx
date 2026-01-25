/**
 * TAG-FE-011-VIS-004: Segmental Muscle Analysis Visualization Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 부위별 근육 분석 시각화 - 인체 다이어그램 기반 구현
 *
 * Design System (SPEC-FE-006):
 * - Normal (기준 충족): Success Green (#22C55E)
 * - Low (근육 부족): Primary Blue (#0066CC)
 * - Very Low (심각 부족): Warning Orange (#F97316)
 */

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

export interface SegmentalData {
  // 5개 부위 근육량 (kg)
  leftArm: number
  rightArm: number
  trunk: number
  leftLeg: number
  rightLeg: number
}

export interface SegmentalAnalysisProps {
  data: SegmentalData
  // 기준 값 (optional, 기본값 사용 가능)
  standards?: Partial<SegmentalData>
}

/**
 * 부위별 근육량 상태 계산 (InBody 기준)
 */
function calculateSegmentStatus(value: number, standard?: number) {
  const std = standard || 5 // 기본값 5kg

  if (value >= std * 0.95) {
    return {
      status: 'normal' as const,
      label: '양호',
      color: '#22C55E', // InBody Green
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      opacity: 0.2,
    }
  }

  if (value >= std * 0.8) {
    return {
      status: 'low' as const,
      label: '부족',
      color: '#0066CC', // InBody Blue
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      opacity: 0.15,
    }
  }

  return {
    status: 'very-low' as const,
    label: '심각',
    color: '#F97316', // InBody Orange
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    opacity: 0.1,
  }
}

/**
 * SVG Human Body Diagram Component with Segments
 */
function BodyDiagram({
  data,
  onSegmentHover,
}: {
  data: SegmentalData
  onSegmentHover?: (segment: keyof SegmentalData | null) => void
}) {
  const [hoveredSegment, setHoveredSegment] = useState<keyof SegmentalData | null>(null)

  const handleHover = (segment: keyof SegmentalData | null) => {
    setHoveredSegment(segment)
    onSegmentHover?.(segment)
  }

  const segments = [
    { key: 'leftArm' as const, value: data.leftArm },
    { key: 'rightArm' as const, value: data.rightArm },
    { key: 'trunk' as const, value: data.trunk },
    { key: 'leftLeg' as const, value: data.leftLeg },
    { key: 'rightLeg' as const, value: data.rightLeg },
  ]

  return (
    <svg
      width="280"
      height="400"
      viewBox="0 0 280 400"
      className="mx-auto"
    >
      {/* Head */}
      <circle
        cx="140"
        cy="35"
        r="25"
        fill="#E5E7EB"
        stroke="#D1D5DB"
        strokeWidth="2"
      />

      {/* Neck */}
      <rect
        x="130"
        y="60"
        width="20"
        height="20"
        fill="#E5E7EB"
        stroke="#D1D5DB"
        strokeWidth="2"
      />

      {/* Trunk (Body) */}
      <rect
        x="90"
        y="80"
        width="100"
        height="110"
        rx="8"
        fill={calculateSegmentStatus(data.trunk).color}
        opacity={hoveredSegment === 'trunk' ? 0.5 : 0.2}
        stroke={hoveredSegment === 'trunk' ? calculateSegmentStatus(data.trunk).color : '#D1D5DB'}
        strokeWidth={hoveredSegment === 'trunk' ? 3 : 2}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => handleHover('trunk')}
        onMouseLeave={() => handleHover(null)}
      />

      {/* Left Arm */}
      <rect
        x="60"
        y="85"
        width="25"
        height="85"
        rx="6"
        fill={calculateSegmentStatus(data.leftArm).color}
        opacity={hoveredSegment === 'leftArm' ? 0.5 : 0.2}
        stroke={hoveredSegment === 'leftArm' ? calculateSegmentStatus(data.leftArm).color : '#D1D5DB'}
        strokeWidth={hoveredSegment === 'leftArm' ? 3 : 2}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => handleHover('leftArm')}
        onMouseLeave={() => handleHover(null)}
      />

      {/* Right Arm */}
      <rect
        x="195"
        y="85"
        width="25"
        height="85"
        rx="6"
        fill={calculateSegmentStatus(data.rightArm).color}
        opacity={hoveredSegment === 'rightArm' ? 0.5 : 0.2}
        stroke={hoveredSegment === 'rightArm' ? calculateSegmentStatus(data.rightArm).color : '#D1D5DB'}
        strokeWidth={hoveredSegment === 'rightArm' ? 3 : 2}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => handleHover('rightArm')}
        onMouseLeave={() => handleHover(null)}
      />

      {/* Left Leg */}
      <rect
        x="95"
        y="190"
        width="38"
        height="120"
        rx="6"
        fill={calculateSegmentStatus(data.leftLeg).color}
        opacity={hoveredSegment === 'leftLeg' ? 0.5 : 0.2}
        stroke={hoveredSegment === 'leftLeg' ? calculateSegmentStatus(data.leftLeg).color : '#D1D5DB'}
        strokeWidth={hoveredSegment === 'leftLeg' ? 3 : 2}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => handleHover('leftLeg')}
        onMouseLeave={() => handleHover(null)}
      />

      {/* Right Leg */}
      <rect
        x="147"
        y="190"
        width="38"
        height="120"
        rx="6"
        fill={calculateSegmentStatus(data.rightLeg).color}
        opacity={hoveredSegment === 'rightLeg' ? 0.5 : 0.2}
        stroke={hoveredSegment === 'rightLeg' ? calculateSegmentStatus(data.rightLeg).color : '#D1D5DB'}
        strokeWidth={hoveredSegment === 'rightLeg' ? 3 : 2}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => handleHover('rightLeg')}
        onMouseLeave={() => handleHover(null)}
      />

      {/* Segment Labels */}
      <text x="145" y="140" textAnchor="middle" className="text-xs font-semibold fill-gray-600">
        몸통
      </text>
      <text x="72" y="130" textAnchor="middle" className="text-xs font-semibold fill-gray-600">
        좌팔
      </text>
      <text x="207" y="130" textAnchor="middle" className="text-xs font-semibold fill-gray-600">
        우팔
      </text>
      <text x="114" y="255" textAnchor="middle" className="text-xs font-semibold fill-gray-600">
        좌다리
      </text>
      <text x="166" y="255" textAnchor="middle" className="text-xs font-semibold fill-gray-600">
        우다리
      </text>
    </svg>
  )
}

/**
 * Segment Legend Item Component
 */
function SegmentLegendItem({
  label,
  value,
  status,
  unit = 'kg',
}: {
  label: string
  value: number
  status: ReturnType<typeof calculateSegmentStatus>
  unit?: string
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border-2 ${status.borderColor} ${status.bgColor} transition-all`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: status.color }}
        />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold font-mono" style={{ color: status.color }}>
          {value.toFixed(1)} {unit}
        </div>
        <div className="text-xs text-gray-500">{status.label}</div>
      </div>
    </div>
  )
}

/**
 * Segmental Analysis Component (SPEC-FE-006 Implementation)
 */
export function SegmentalAnalysis({ data, standards }: SegmentalAnalysisProps) {
  const [hoveredSegment, setHoveredSegment] = useState<keyof SegmentalData | null>(null)

  const segmentLabels: Record<keyof SegmentalData, string> = {
    leftArm: '왼팔',
    rightArm: '오른팔',
    trunk: '몸통',
    leftLeg: '왼다리',
    rightLeg: '오른다리',
  }

  const totalMuscle = Object.values(data).reduce((a, b) => a + b, 0)

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">부위별 근육 분석</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            총 근육량: {totalMuscle.toFixed(1)} kg
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-8 mb-6">
        {/* Body Diagram */}
        <div className="flex flex-col items-center">
          <BodyDiagram
            data={data}
            onSegmentHover={setHoveredSegment}
          />
          <p className="text-xs text-gray-500 mt-2">
            부위에 마우스를 올려 상세 정보를 확인하세요
          </p>
        </div>

        {/* Segment Legend */}
        <div className="space-y-2">
          {(Object.keys(data) as Array<keyof SegmentalData>).map((key) => {
            const status = calculateSegmentStatus(data[key], standards?.[key])
            return (
              <SegmentLegendItem
                key={key}
                label={segmentLabels[key]}
                value={data[key]}
                status={status}
                unit="kg"
              />
            )
          })}
        </div>
      </div>

      {/* Hovered Segment Detail */}
      {hoveredSegment && (
        <div className={`${calculateSegmentStatus(data[hoveredSegment]).bgColor} rounded-lg p-4 border-l-4 mb-4`} style={{ borderLeftColor: calculateSegmentStatus(data[hoveredSegment]).color }}>
          <h4 className="text-sm font-bold text-gray-900 mb-1">
            {segmentLabels[hoveredSegment]} 상세
          </h4>
          <p className="text-sm text-gray-700">
            현재 근육량: <span className="font-mono font-bold">{data[hoveredSegment].toFixed(1)} kg</span>
            {calculateSegmentStatus(data[hoveredSegment]).status === 'very-low' && (
              <span className="ml-2">⚠️ 심각한 근육 부족입니다. 근력 운동을 권장합니다.</span>
            )}
            {calculateSegmentStatus(data[hoveredSegment]).status === 'low' && (
              <span className="ml-2">📉 근육량이 부족합니다. 집중 운동을 권장합니다.</span>
            )}
            {calculateSegmentStatus(data[hoveredSegment]).status === 'normal' && (
              <span className="ml-2">✅ 근육량이 양호합니다. 현재 상태를 유지하세요.</span>
            )}
          </p>
        </div>
      )}

      {/* Status Guide */}
      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">상태 안내</p>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
            <span className="text-gray-600">양호: 기준 95% 이상</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#0066CC]" />
            <span className="text-gray-600">부족: 기준 80-95%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#F97316]" />
            <span className="text-gray-600">심각: 기준 80% 미만</span>
          </div>
        </div>
      </div>
    </div>
  )
}
