/**
 * TAG-FE-001-RESULT-006: InBody 신체 유형 평가 섹션
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 결과지의 신체 유형 평가 (근육형, 비만형 등)
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Activity, Target, TrendingUp } from 'lucide-react'

interface BodyTypeSectionProps {
  bodyType?: string
  weightControl?: string
}

export function BodyTypeSection({ bodyType, weightControl }: BodyTypeSectionProps) {
  if (!bodyType && !weightControl) return null

  // 신체 유형에 따른 정보 결정
  const getBodyTypeInfo = (type?: string) => {
    if (!type) return null

    const typeMap: Record<
      string,
      {
        label: string
        icon: string
        color: string
        bg: string
        description: string
        recommendation: string
      }
    > = {
      근육형: {
        label: '근육형',
        icon: '💪',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        description: '근육량이 많고 체지방이 적은 건강한 체형입니다.',
        recommendation: '현재 상태를 유지하면서 근력 운동을 병행하세요.',
      },
      '마른근육형': {
        label: '마른 근육형',
        icon: '🏃',
        color: 'text-green-600',
        bg: 'bg-green-50',
        description: '근육량이 적지만 체지방도 적은 체형입니다.',
        recommendation: '근력 운동과 적절한 영양 섭취로 근육량을 늘리세요.',
      },
      표준: {
        label: '표준',
        icon: '😊',
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        description: '평균적인 체형입니다.',
        recommendation: '건강한 라이프스타일을 유지하세요.',
      },
      순근육형: {
        label: '순근육형',
        icon: '🏋️',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        description: '체지방이 매우 적고 근육량이 많은 체형입니다.',
        recommendation: '선수급 체형입니다. 현재 상태를 유지하세요.',
      },
      비만: {
        label: '비만형',
        icon: '⚠️',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        description: '체지방이 많은 체형입니다.',
        recommendation: '유산소 운동과 식단 관리로 체중 감량이 필요합니다.',
      },
      마름: {
        label: '마른형',
        icon: '🍃',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        description: '근육량과 체지방이 모두 적은 체형입니다.',
        recommendation: '근력 운동과 충분한 영양 섭취가 필요합니다.',
      },
    }

    return typeMap[type] || {
      label: type,
      icon: '📊',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      description: `${type} 체형입니다.`,
      recommendation: '건강한 라이프스타일을 유지하세요.',
    }
  }

  const bodyTypeInfo = getBodyTypeInfo(bodyType)

  // 체중 조절 정보 파싱
  const parseWeightControl = (control?: string) => {
    if (!control) return null

    const match = control.match(/([+-])(\d+\.?\d*)/)
    if (!match) return null

    const [, sign, value] = match
    const numValue = parseFloat(value)

    return {
      target: numValue * (sign === '+' ? 1 : -1),
      sign,
      value: numValue,
      isGain: sign === '+',
    }
  }

  const weightInfo = parseWeightControl(weightControl)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">신체 유형 평가</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 신체 유형 카드 */}
        {bodyTypeInfo && (
          <div className={`rounded-lg p-4 border ${bodyTypeInfo.bg} border-gray-200`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{bodyTypeInfo.icon}</div>
                <div>
                  <div className={`font-bold ${bodyTypeInfo.color}`}>
                    {bodyTypeInfo.label}
                  </div>
                  <div className="text-xs text-gray-500">신체 유형</div>
                </div>
              </div>

              <Badge
                className={`${bodyTypeInfo.bg} ${bodyTypeInfo.color} border-0`}
              >
                분석 완료
              </Badge>
            </div>

            <p className="text-sm text-gray-700 mb-2">{bodyTypeInfo.description}</p>

            <div className="flex items-start gap-2 p-2 bg-white rounded">
              <Activity className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600">{bodyTypeInfo.recommendation}</p>
            </div>
          </div>
        )}

        {/* 체중 조절 가이드 카드 */}
        {weightInfo && (
          <div className="rounded-lg p-4 border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">체중 조절</div>
                  <div className="text-xs text-gray-500">목표 체중 변화</div>
                </div>
              </div>

              <Badge className="bg-green-100 text-green-700 border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
                {weightInfo.isGain ? '증량' : '감량'}
              </Badge>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span
                className={`text-3xl font-bold ${
                  weightInfo.isGain ? 'text-blue-600' : 'text-orange-600'
                }`}
              >
                {weightInfo.sign}{weightInfo.value.toFixed(1)}
              </span>
              <span className="text-sm text-gray-600">kg</span>
            </div>

            <div className="p-3 bg-white rounded">
              <p className="text-xs text-gray-700">
                {weightInfo.isGain
                  ? '근육량 증가를 위한 적절한 영양 섭취와 근력 운동이 권장됩니다.'
                  : '체지방 감량을 위한 유산소 운동과 식단 관리가 권장됩니다.'}
              </p>
            </div>

            {/* 체중 조절 프로그레스 표시 */}
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>현재</span>
                <span>목표</span>
              </div>
              <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    weightInfo.isGain ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                  style={{ width: '40%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
