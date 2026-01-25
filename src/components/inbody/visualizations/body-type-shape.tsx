/**
 * TAG-FE-011-VIS-001: InBody Body Type Shape (C/I/D) Visualization
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 신체 균형 지표 시각화 - SVG 인체 실루엣 기반 전면 재설계
 *
 * InBody Body Type Analysis (Redefined for SPEC-FE-006):
 * - C-Type (Curling): 골격근량 부족 - 인체 실루엣이 얇음
 * - I-Type (Ideal): 이상적인 균형 - 균형잡힌 실루엣
 * - D-Type (Dual): 근육/지방 불균형 - 실루엣이 넓음
 *
 * Design System:
 * - Primary Blue (#0066CC): C-Type
 * - Success Green (#22C55E): I-Type
 * - Warning Orange (#F97316): D-Type
 */

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

export interface BodyTypeShapeProps {
  muscleMass: number // kg
  bodyFat: number // kg
  height?: number // cm (optional, for standard comparison)
}

/**
 * InBody Body Type Classification (Revised for SPEC-FE-006)
 */
function calculateBodyType(muscleMass: number, bodyFat: number, height?: number) {
  // Standard reference values
  const standardMuscle = height ? (height - 100) * 0.45 : 30 // kg
  const standardFat = height ? (height - 100) * 0.15 : 12 // kg

  const musclePercent = (muscleMass / standardMuscle) * 100
  const fatPercent = (bodyFat / standardFat) * 100

  // C-Type: 골격근량 부족 (Underdeveloped muscles)
  if (musclePercent < 90) {
    return {
      type: 'C' as const,
      label: 'C-Type',
      subtitle: '골격근량 부족',
      color: '#0066CC', // InBody Blue
      bgColor: 'bg-blue-50',
      description: '근육량이 기준 미달입니다. 근력 운동을 권장합니다.',
      silhouetteWidth: 0.7, // 얇은 실루엣
    }
  }

  // I-Type: 이상적인 균형 (Ideal balance)
  if (musclePercent >= 90 && fatPercent <= 110) {
    return {
      type: 'I' as const,
      label: 'I-Type',
      subtitle: '이상적인 균형',
      color: '#22C55E', // InBody Green
      bgColor: 'bg-green-50',
      description: '근육과 지방의 균형이 이상적입니다. 현재 상태를 유지하세요.',
      silhouetteWidth: 1.0, // 균형잡힌 실루엣
    }
  }

  // D-Type: 근육/지방 불균형 (Muscle/fat imbalance)
  return {
    type: 'D' as const,
    label: 'D-Type',
    subtitle: '근육/지방 불균형',
    color: '#F97316', // InBody Orange
    bgColor: 'bg-orange-50',
    description: '근육량 대비 지방이 많습니다. 유산소와 근력 운동을 병행하세요.',
    silhouetteWidth: 1.3, // 넓은 실루엣
  }
}

/**
 * SVG Human Body Silhouette Component
 */
function HumanBodySilhouette({
  bodyType,
  color,
  width = 200,
  height = 300,
}: {
  bodyType: 'C' | 'I' | 'D'
  color: string
  width?: number
  height?: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Silhouette width based on body type
  const bodyWidth = bodyType === 'C' ? 50 : bodyType === 'I' ? 70 : 90

  return (
    <div
      className="relative cursor-pointer transition-transform duration-300"
      style={{ width, height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="drop-shadow-lg"
      >
        {/* Head */}
        <circle
          cx={width / 2}
          cy={30}
          r={20}
          fill={color}
          opacity={isHovered ? 0.4 : 0.2}
          className="transition-opacity duration-300"
        />

        {/* Neck */}
        <rect
          x={width / 2 - 8}
          y={50}
          width={16}
          height={15}
          fill={color}
          opacity={isHovered ? 0.4 : 0.2}
          className="transition-opacity duration-300"
        />

        {/* Torso */}
        <rect
          x={width / 2 - bodyWidth / 2}
          y={65}
          width={bodyWidth}
          height={90}
          rx={8}
          fill={color}
          opacity={isHovered ? 0.4 : 0.2}
          className="transition-opacity duration-300"
        />

        {/* Left Arm */}
        <rect
          x={width / 2 - bodyWidth / 2 - 12}
          y={65}
          width={12}
          height={70}
          rx={6}
          fill={color}
          opacity={isHovered ? 0.3 : 0.15}
          className="transition-opacity duration-300"
        />

        {/* Right Arm */}
        <rect
          x={width / 2 + bodyWidth / 2}
          y={65}
          width={12}
          height={70}
          rx={6}
          fill={color}
          opacity={isHovered ? 0.3 : 0.15}
          className="transition-opacity duration-300"
        />

        {/* Left Leg */}
        <rect
          x={width / 2 - bodyWidth / 2 + 5}
          y={155}
          width={bodyWidth / 2 - 5}
          height={100}
          rx={6}
          fill={color}
          opacity={isHovered ? 0.35 : 0.18}
          className="transition-opacity duration-300"
        />

        {/* Right Leg */}
        <rect
          x={width / 2 + 5}
          y={155}
          width={bodyWidth / 2 - 5}
          height={100}
          rx={6}
          fill={color}
          opacity={isHovered ? 0.35 : 0.18}
          className="transition-opacity duration-300"
        />

        {/* Body Type Label */}
        <text
          x={width / 2}
          y={130}
          textAnchor="middle"
          className="text-5xl font-bold"
          style={{
            fill: color,
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.3s',
          }}
        >
          {bodyType}
        </text>
      </svg>

      {/* Hover Tooltip */}
      {isHovered && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap">
          <p className="text-sm font-semibold" style={{ color }}>
            {bodyType}-Type
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Progress Bar Component (InBody Style)
 */
function ProgressBar({
  label,
  value,
  max,
  unit,
  color,
}: {
  label: string
  value: number
  max: number
  unit: string
  color: string
}) {
  const percentage = Math.min(100, (value / max) * 100)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-lg font-bold font-mono" style={{ color }}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

/**
 * Body Type Shape Visualization Component (SPEC-FE-006 Redesign)
 */
export function BodyTypeShape({ muscleMass, bodyFat, height }: BodyTypeShapeProps) {
  const bodyType = calculateBodyType(muscleMass, bodyFat, height)

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">신체 균형 분석</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            근육량과 체지방량의 균형을 분석합니다
          </p>
        </div>
        <Badge
          className={`${bodyType.bgColor} border-0 px-3 py-1`}
          style={{ color: bodyType.color }}
        >
          {bodyType.label}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
        {/* Human Body Silhouette */}
        <HumanBodySilhouette
          bodyType={bodyType.type}
          color={bodyType.color}
          width={200}
          height={300}
        />

        {/* Legend & Metrics */}
        <div className="flex-1 space-y-6 w-full max-w-xs">
          {/* Muscle Bar */}
          <ProgressBar
            label="골격근량"
            value={muscleMass}
            max={50}
            unit="kg"
            color="#22C55E"
          />

          {/* Body Fat Bar */}
          <ProgressBar
            label="체지방량"
            value={bodyFat}
            max={40}
            unit="kg"
            color="#F97316"
          />

          {/* Ratio */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">근육/지방 비율</span>
              <span className="text-xl font-bold font-mono text-gray-900">
                {(muscleMass / (bodyFat + 0.01)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Type Description (InBody Style) */}
      <div
        className={`${bodyType.bgColor} rounded-md p-4 border-l-4`}
        style={{ borderLeftColor: bodyType.color }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white">
            <span className="text-lg font-bold" style={{ color: bodyType.color }}>
              {bodyType.type}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900 mb-1">
              {bodyType.subtitle}
            </h4>
            <p className="text-sm text-gray-700">{bodyType.description}</p>
          </div>
        </div>
      </div>

      {/* Type Reference Guide */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">체형 유형 안내</p>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#0066CC]" />
            <span className="text-gray-600">C-Type: 근육 부족</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
            <span className="text-gray-600">I-Type: 이상 균형</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#F97316]" />
            <span className="text-gray-600">D-Type: 불균형</span>
          </div>
        </div>
      </div>
    </div>
  )
}
