/**
 * TAG-FE-001-RESULT-003: InBody 신체 점수 섹션
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 결과지의 신체 점수 표시 섹션
 * Figma 스타일 적용: 노란 테마
 */

'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface BodyScoreSectionProps {
  bodyScore: number
  scoreDescription?: string
}

export function BodyScoreSection({
  bodyScore,
  scoreDescription,
}: BodyScoreSectionProps) {
  // 점수에 따른 색상 및 상태 결정
  const getScoreStatus = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', bg: 'bg-green-50', label: '우수' }
    if (score >= 70) return { color: 'text-blue-600', bg: 'bg-blue-50', label: '보통' }
    if (score >= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: '주의' }
    return { color: 'text-red-600', bg: 'bg-red-50', label: '경고' }
  }

  const status = getScoreStatus(bodyScore)

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1e2939] font-['Inter','Noto_Sans_KR',sans-serif]">
          신체 점수
        </h3>
        {scoreDescription && (
          <Badge
            className={`${status.bg} ${status.color} border-0 font-medium`}
          >
            {scoreDescription}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-8">
        {/* 큰 점수 표시 */}
        <div className="flex-shrink-0">
          <div
            className={`text-7xl font-bold leading-none ${
              bodyScore >= 90
                ? 'text-green-600'
                : bodyScore >= 70
                  ? 'text-orange-600'
                  : bodyScore >= 50
                    ? 'text-yellow-600'
                    : 'text-red-600'
            }`}
          >
            {bodyScore}
          </div>
          <div className="text-sm text-gray-600 mt-1 font-['Inter','Noto_Sans_KR',sans-serif]">
            / 100점
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="flex-1 space-y-2">
          <Progress
            value={bodyScore}
            className="h-3"
            progressBarColor={
              bodyScore >= 70
                ? 'bg-orange-500'
                : bodyScore >= 50
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
            }
          />
          <div className="flex justify-between text-xs text-gray-500 font-['Inter','Noto_Sans_KR',sans-serif]">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* 점수 설명 */}
      {scoreDescription && (
        <div className="mt-4 p-4 bg-white/80 backdrop-blur rounded-lg border border-orange-100">
          <p
            className="text-sm text-[#1e2939] font-['Inter','Noto_Sans_KR',sans-serif]"
          >
            신체 점수는{' '}
            <span className="font-semibold text-orange-600">{scoreDescription}</span>
            {' '}
            수준입니다.
            {bodyScore >= 90 && ' 전체 상위 10% 이내의 우수한 신체 컨디션입니다.'}
            {bodyScore >= 70 &&
              bodyScore < 90 &&
              ' 건강한 신체 상태를 유지하고 있습니다.'}
            {bodyScore >= 50 &&
              bodyScore < 70 &&
              ' 개선이 필요한 부분이 있습니다.'}
            {bodyScore < 50 && ' 건강 관리에 더 많은 관심이 필요합니다.'}
          </p>
        </div>
      )}
    </div>
  )
}
