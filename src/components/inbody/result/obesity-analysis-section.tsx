/**
 * TAG-FE-001-RESULT-005: InBody 비만 판정 섹션
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 결과지의 비만 판정 (BMI, 비만 정도)
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Scale } from 'lucide-react'

interface ObesityAnalysisSectionProps {
  bmi?: number
  bmiStatus?: string
}

export function ObesityAnalysisSection({ bmi, bmiStatus }: ObesityAnalysisSectionProps) {
  if (bmi === undefined || bmi === null) return null

  // BMI에 따른 상태 및 색상 결정
  const getBMIStatus = (bmiValue: number) => {
    if (bmiValue < 18.5) {
      return {
        label: '저체중',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: '⚠️',
        description: '체중이 부족할 수 있으니 적절한 영양 섭취가 필요합니다.',
      }
    }
    if (bmiValue < 23) {
      return {
        label: '정상',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: '✓',
        description: '건강한 체중을 유지하고 있습니다.',
      }
    }
    if (bmiValue < 25) {
      return {
        label: '과체중',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: '⚠',
        description: '체중 관리가 권장됩니다.',
      }
    }
    if (bmiValue < 30) {
      return {
        label: '비만',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: '⚠️',
        description: '건강 위해 요인이 있을 수 있어 체중 감량이 권장됩니다.',
      }
    }
    return {
      label: '고도비만',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '⚠️⚠️',
      description: '건강 위해 요인이 높으므로 전문가 상담이 권장됩니다.',
    }
  }

  // bmiStatus가 제공되면 그것을 우선 사용, 아니면 BMI 계산
  const status = bmiStatus
    ? {
        label: bmiStatus,
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: '📊',
        description: `${bmiStatus} 상태입니다.`,
      }
    : getBMIStatus(bmi)

  // BMI 프로그레스 바 계산 (18.5 ~ 35 범위)
  const getBMIProgress = (bmiValue: number) => {
    const min = 18.5
    const max = 35
    const normalized = Math.max(min, Math.min(max, bmiValue))
    return ((normalized - min) / (max - min)) * 100
  }

  return (
    <div className={`rounded-xl p-5 border ${status.border} ${status.bg}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white rounded-lg">
            <Scale className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">비만 판정</h3>
            <p className="text-xs text-gray-500">BMI (체질량지수) 기준</p>
          </div>
        </div>

        <Badge className={`${status.bg} ${status.color} border-0 font-semibold`}>
          {status.icon} {status.label}
        </Badge>
      </div>

      {/* BMI 수치 표시 */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex-shrink-0">
          <div className="text-4xl font-bold text-gray-900">
            {bmi.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 mt-1">kg/m²</div>
        </div>

        {/* BMI 프로그레스 바 */}
        <div className="flex-1">
          <Progress
            value={getBMIProgress(bmi)}
            className="h-2"
            progressBarColor={
              bmi < 18.5
                ? 'bg-blue-600'
                : bmi < 23
                ? 'bg-green-600'
                : bmi < 25
                ? 'bg-yellow-600'
                : bmi < 30
                ? 'bg-orange-600'
                : 'bg-red-600'
            }
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>18.5</span>
            <span>23</span>
            <span>25</span>
            <span>30</span>
            <span>35</span>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="p-3 bg-white rounded-lg">
        <p className="text-sm text-gray-700">{status.description}</p>
      </div>

      {/* BMI 기준 안내 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2 font-medium">BMI 기준 (아시아인)</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="text-center p-2 bg-white rounded">
            <div className="font-medium text-blue-600">저체중</div>
            <div className="text-gray-500">~18.5</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-medium text-green-600">정상</div>
            <div className="text-gray-500">18.5~23</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-medium text-yellow-600">과체중</div>
            <div className="text-gray-500">23~25</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-medium text-orange-600">비만</div>
            <div className="text-gray-500">25~30</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-medium text-red-600">고도비만</div>
            <div className="text-gray-500">30~</div>
          </div>
        </div>
      </div>
    </div>
  )
}
