/**
 * TAG-FE-001-VIS-002: ECW/TBW Ratio Visualization Component
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 세포내외수 비율 시각화 (ECW/TBW Ratio)
 *
 * ECW (Extracellular Water): 세포외액
 * TBW (Total Body Water): 전체 체수분
 * ECW/TBW Ratio: 세포부종 및 수분 균형 지표
 * 정상 범위: 0.36 - 0.39 (약 0.380 ~ 0.390)
 */

'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

export interface ECWTBWRatioProps {
  ecw: number // kg - Extracellular Water
  tbw: number // kg - Total Body Water
}

/**
 * Calculate ECW/TBW ratio status
 */
function calculateECWRatioStatus(ecw: number, tbw: number) {
  const ratio = ecw / tbw

  // InBody standard ranges
  if (ratio >= 0.380 && ratio <= 0.390) {
    return {
      status: 'normal',
      label: '표준',
      color: '#22C55E',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle2,
      description: '세포내외 수분 균형이 정상입니다.',
    }
  } else if (ratio >= 0.370 && ratio < 0.380) {
    return {
      status: 'slightly-low',
      label: '약간 낮음',
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Info,
      description: '세포외액이 약간 낮습니다. 수분 섭취를 확인하세요.',
    }
  } else if (ratio > 0.390 && ratio <= 0.400) {
    return {
      status: 'slightly-high',
      label: '약간 높음',
      color: '#F97316',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: AlertTriangle,
      description: '세포외액이 약간 높습니다. 부종 가능성을 확인하세요.',
    }
  } else {
    return {
      status: 'abnormal',
      label: '비정상',
      color: '#EF4444',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      description: '세포내외 수분 불균형이 있습니다. 의료진과 상담하세요.',
    }
  }
}

/**
 * ECW/TBW Ratio Visualization Component
 */
export function ECWTBWRatio({ ecw, tbw }: ECWTBWRatioProps) {
  const ratioData = calculateECWRatioStatus(ecw, tbw)
  const ratio = ecw / tbw
  const IconComponent = ratioData.icon

  return (
    <div className={`w-full bg-white border ${ratioData.borderColor} rounded-xl p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-['Inter','Noto_Sans_KR',sans-serif]">
            세포내외수 분석
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            ECW/TBW 비율: {ratio.toFixed(3)} (정상: 0.380 - 0.390)
          </p>
        </div>
        <div
          className={`${ratioData.bgColor} px-3 py-1 rounded-full flex items-center gap-2`}
        >
          <IconComponent className="w-4 h-4" style={{ color: ratioData.color }} />
          <span className="text-sm font-semibold" style={{ color: ratioData.color }}>
            {ratioData.label}
          </span>
        </div>
      </div>

      {/* Water Distribution Visualization */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* ECW Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">세포외액 (ECW)</span>
            <span className="text-lg font-bold text-gray-900">{ecw.toFixed(1)} kg</span>
          </div>
          <div className="w-full h-6 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full flex items-center justify-end pr-2 transition-all duration-500"
              style={{
                width: `${(ecw / tbw) * 100}%`,
                backgroundColor: '#3B82F6',
              }}
            >
              <span className="text-xs font-semibold text-white">
                {((ecw / tbw) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500">세포 외부의 체액 (혈장, 조직액 등)</p>
        </div>

        {/* ICW Bar (TBW - ECW) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">세포내액 (ICW)</span>
            <span className="text-lg font-bold text-gray-900">
              {(tbw - ecw).toFixed(1)} kg
            </span>
          </div>
          <div className="w-full h-6 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full flex items-center justify-end pr-2 transition-all duration-500"
              style={{
                width: `${((tbw - ecw) / tbw) * 100}%`,
                backgroundColor: '#22C55E',
              }}
            >
              <span className="text-xs font-semibold text-white">
                {(((tbw - ecw) / tbw) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500">세포 내부의 체액</p>
        </div>
      </div>

      {/* Ratio Scale Visualization */}
      <div className={`${ratioData.bgColor} rounded-lg p-4 mb-6`}>
        <p className="text-xs text-gray-500 mb-2">ECW/TBW 비율 척도</p>
        <div className="relative h-8 bg-white rounded-lg overflow-hidden">
          {/* Scale markers */}
          <div className="absolute inset-0 flex">
            {/* Low zone (< 0.370) */}
            <div className="w-[30%] bg-blue-200" />
            {/* Normal zone (0.370 - 0.400) */}
            <div className="w-[40%] bg-green-400" />
            {/* High zone (> 0.400) */}
            <div className="w-[30%] bg-red-200" />
          </div>

          {/* Current ratio indicator */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-gray-900 transition-all duration-500"
            style={{
              left: `${((ratio - 0.340) / (0.420 - 0.340)) * 100}%`,
            }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45" />
          </div>

          {/* Scale labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-1">
            <span className="text-[10px] text-gray-600">0.34</span>
            <span className="text-[10px] text-gray-600 font-semibold">
              0.38
            </span>
            <span className="text-[10px] text-gray-600 font-semibold">
              0.39
            </span>
            <span className="text-[10px] text-gray-600">0.42</span>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={`${ratioData.bgColor} ${ratioData.borderColor} border`}>
        <IconComponent className={`w-4 h-4`} style={{ color: ratioData.color }} />
        <AlertDescription className={`text-sm ${ratioData.color}`}>
          <strong>{ratioData.label}:</strong> {ratioData.description}
        </AlertDescription>
      </Alert>
    </div>
  )
}
