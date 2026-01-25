/**
 * TAG-FE-001-VIS-001: InBody Body Type Shape (C/I/D) Visualization
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 신체 균형 지표 시각화 - C/I/D 타입 쉐이프
 *
 * InBody Body Type Analysis:
 * - C-type (Balanced): 근육과 지방의 균형이 잘 맞음
 * - I-type (Muscular): 근육량이 많고 지방이 적음
 * - D-type (Obese): 지방이 많고 근육이 부족
 */

'use client'

import { Badge } from '@/components/ui/badge'

export interface BodyTypeShapeProps {
  muscleMass: number // kg
  bodyFat: number // kg
  height?: number // cm (optional, for standard comparison)
}

/**
 * Calculate body type category based on muscle and fat mass
 */
function calculateBodyType(muscleMass: number, bodyFat: number, height?: number) {
  // Simple ratio-based classification (ratio calculated but not exposed)
  muscleMass / (bodyFat + 0.01) // Avoid division by zero

  // Standard reference values (can be refined with height-based standards)
  const standardMuscle = height ? (height - 100) * 0.45 : 30 // kg
  const standardFat = height ? (height - 100) * 0.15 : 12 // kg

  const musclePercent = (muscleMass / standardMuscle) * 100
  const fatPercent = (bodyFat / standardFat) * 100

  if (musclePercent >= 100 && fatPercent <= 100) {
    return { type: 'I', label: '근육형', color: '#22C55E', bgColor: 'bg-green-50' }
  } else if (musclePercent >= 90 && fatPercent <= 110) {
    return { type: 'C', label: '균형형', color: '#3B82F6', bgColor: 'bg-blue-50' }
  } else {
    return { type: 'D', label: '비만형', color: '#F97316', bgColor: 'bg-orange-50' }
  }
}

/**
 * Body Type Shape Visualization Component
 */
export function BodyTypeShape({ muscleMass, bodyFat, height }: BodyTypeShapeProps) {
  const bodyType = calculateBodyType(muscleMass, bodyFat, height)

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-['Inter','Noto_Sans_KR',sans-serif]">
            신체 균형 분석
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            근육량과 체지방량의 균형을 시각화합니다
          </p>
        </div>
        <Badge className={`${bodyType.bgColor} border-0`} style={{ color: bodyType.color }}>
          {bodyType.label}
        </Badge>
      </div>

      {/* Shape Visualization */}
      <div className="flex items-center justify-center gap-8 mb-6">
        {/* Human Body Shape */}
        <div className="relative w-48 h-64 flex items-center justify-center">
          {/* Head */}
          <div className="absolute top-0 w-12 h-12 rounded-full bg-gray-200" />

          {/* Body - Shape varies by type */}
          <div
            className="absolute top-14 w-24 rounded transition-all duration-500"
            style={{
              height: bodyType.type === 'I' ? '100px' : bodyType.type === 'C' ? '80px' : '110px',
              backgroundColor: bodyType.color,
              opacity: 0.3,
            }}
          />

          {/* Arms */}
          <div className="absolute top-16 left-4 w-3 h-20 rounded-full bg-gray-300 transform -rotate-12" />
          <div className="absolute top-16 right-4 w-3 h-20 rounded-full bg-gray-300 transform rotate-12" />

          {/* Legs */}
          <div className="absolute top-28 left-8 w-4 h-28 rounded-full bg-gray-300" />
          <div className="absolute top-28 right-8 w-4 h-28 rounded-full bg-gray-300" />

          {/* Type Label on body */}
          <div className="absolute top-20 text-4xl font-bold" style={{ color: bodyType.color }}>
            {bodyType.type}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          {/* Muscle Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">근육량</span>
              <span className="font-semibold text-gray-900">{muscleMass.toFixed(1)} kg</span>
            </div>
            <div className="w-48 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (muscleMass / 40) * 100)}%`,
                  backgroundColor: '#22C55E',
                }}
              />
            </div>
          </div>

          {/* Fat Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">체지방량</span>
              <span className="font-semibold text-gray-900">{bodyFat.toFixed(1)} kg</span>
            </div>
            <div className="w-48 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (bodyFat / 30) * 100)}%`,
                  backgroundColor: '#F97316',
                }}
              />
            </div>
          </div>

          {/* Ratio */}
          <div className="pt-2 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              근육/지방 비율:{' '}
              <span className="font-semibold text-gray-900">
                {(muscleMass / (bodyFat + 0.01)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Type Description */}
      <div className={`${bodyType.bgColor} rounded-lg p-4`}>
        <p className="text-sm text-gray-700">
          {bodyType.type === 'I' &&
            '근육량이 많고 체지방이 적은 건강한 체형입니다. 현재 상태를 유지하며 근력 운동을 병행하세요.'}
          {bodyType.type === 'C' &&
            '근육과 지방의 균형이 잘 맞은 표준 체형입니다. 건강한 라이프스타일을 유지하세요.'}
          {bodyType.type === 'D' &&
            '체지방이 많고 근육량이 부족한 체형입니다. 유산소 운동과 근력 운동을 병행하세요.'}
        </p>
      </div>
    </div>
  )
}
