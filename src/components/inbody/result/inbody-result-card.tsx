/**
 * TAG-FE-001-RESULT-001: InBody 결과 카드 메인 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 결과지 스타일의 메인 카드 컴포넌트
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { InBodyData } from '@/lib/types/inbody'
import { HeaderSection } from './header-section'
import { BodyScoreSection } from './body-score-section'
import { BodyCompositionSection } from './body-composition-section'
import { ObesityAnalysisSection } from './obesity-analysis-section'
import { BodyTypeSection } from './body-type-section'
import { AdditionalInfoSection } from './additional-info-section'

interface InBodyResultCardProps {
  data?: InBodyData | null
  isLoading?: boolean
}

export function InBodyResultCard({ data, isLoading }: InBodyResultCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Body Score Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
          </div>

          {/* Body Composition Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>

          {/* Obesity Analysis Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>

          {/* Body Type Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="w-full bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              InBody 데이터 없음
            </h3>
            <p className="text-sm text-gray-500">
              InBody 결과지를 업로드하여 건강 데이터를 확인하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        {/* 상단: 2컬럼 레이아웃 - 헤더 + 신체 점수 + 체성분 + 비만 판정 + 신체 유형 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 왼쪽 컬럼 */}
          <div className="space-y-6">
            {/* 헤더 섹션 */}
            <HeaderSection
              name={data.name || '미입력'}
              measuredAt={data.measuredAt}
            />

            {/* 신체 점수 섹션 */}
            {data.bodyScore !== undefined && (
              <BodyScoreSection
                bodyScore={data.bodyScore}
                scoreDescription={data.scoreDescription}
              />
            )}

            {/* 체성분 분석 섹션 */}
            <BodyCompositionSection
              weight={data.weight}
              bodyFatPercentage={data.bodyFat}
              muscle={data.muscle}
              skeletalMuscle={data.skeletalMuscle}
              protein={data.protein}
              bodyWater={data.bodyWater}
            />
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="space-y-6">
            {/* 비만 판정 섹션 */}
            {(data.bmi !== undefined || data.bmiStatus) && (
              <ObesityAnalysisSection
                bmi={data.bmi}
                bmiStatus={data.bmiStatus}
              />
            )}

            {/* 신체 유형 섹션 */}
            {(data.bodyType || data.weightChangeRecommendation) && (
              <BodyTypeSection
                bodyType={data.bodyType}
                weightControl={data.weightChangeRecommendation}
              />
            )}

            {/* 추가 정보 섹션 (Figma 디자인) */}
            <AdditionalInfoSection />
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
