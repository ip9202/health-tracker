/**
 * TAG-FE-014-DASH-001: InBody Dashboard Main Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 데이터 관리 대시보드 메인 컴포넌트 - 전면 리디자인
 *
 * Design System (SPEC-FE-006):
 * - InBody 공식 색상 시스템 적용
 * - 의료급 전문성 레이아웃
 * - 반응형 디자인 (데스크탑/태블릿/모바일)
 */

'use client'

import { useState, useEffect } from 'react'
import { UploadSection } from './upload/upload-section'
import { HistoryList } from './history/history-list'
import { fetchInBodyHistory } from '@/lib/api/inbody-api'
import type { InBodyData } from '@/lib/types/inbody'

// 새로 설계된 컴포넌트들
import { BodyTypeShape } from './visualizations/body-type-shape'
import { ECWTBWRatio } from './visualizations/ecw-tbw-ratio'
import { TrendSparkline } from './visualizations/trend-sparkline'
import { ChangeHighlight } from './awareness/change-highlight'
import { ProgressIndicator } from './awareness/progress-indicator'
import { SummaryStatsCard } from './awareness/summary-stats'
import { StreakCounter } from './gamification/streak-counter'
import { AchievementBadges, generateDefaultAchievements } from './gamification/achievement-badges'
import { GoalTracker } from './gamification/goal-tracker'

export function InBodyDashboard() {
  const [latestData, setLatestData] = useState<InBodyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 데이터 리로드 함수
  const reloadLatestData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchInBodyHistory({ page: 1, pageSize: 1 })

      if (response?.records && Array.isArray(response.records) && response.records.length > 0) {
        const record = response.records[0]
        setLatestData(record as unknown as InBodyData)
      } else {
        setLatestData(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('401')) {
        console.log('인증되지 않은 사용자')
        setLatestData(null)
      } else {
        console.error('Failed to load latest InBody data:', err)
        setError('데이터를 불러오는데 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    reloadLatestData()
  }, [])

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Page Header - InBody Style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                InBody 건강 대시보드
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                체성분 데이터를 분석하고 건강 목표를 추적하세요
              </p>
            </div>
            <div
              className="hidden md:block px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#E0F2FE' }}
            >
              <p className="text-sm font-semibold" style={{ color: '#0066CC' }}>
                💡 전문적인 건강 관리를 시작하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* 1. Upload Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <UploadSection onUploadSuccess={reloadLatestData} />
          </div>

          {/* 2. Summary Stats & Key Metrics Row */}
          {latestData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Body Type Analysis - Left */}
              <div>
                <BodyTypeShape
                  muscleMass={latestData.skeletalMuscle || 0}
                  bodyFat={latestData.bodyFat || 0}
                  height={latestData.height || 170}
                />
              </div>

              {/* ECW/TBW Analysis - Center */}
              <div>
                <ECWTBWRatio
                  ecw={latestData.bodyWater ? latestData.bodyWater * 0.38 : (latestData.skeletalMuscle || 30) * 0.38}
                  tbw={latestData.bodyWater || (latestData.skeletalMuscle || 30) * 2}
                />
              </div>

              {/* Summary Stats - Right */}
              <div>
                <SummaryStatsCard
                  stats={{
                    period: 'month',
                    measurements: 4,
                    stats: {
                      weight: {
                        current: latestData.weight || 70,
                        previous: 72,
                        unit: 'kg',
                      },
                      muscle: {
                        current: latestData.skeletalMuscle || 30,
                        previous: 28,
                        unit: 'kg',
                      },
                      bodyFatPercentage: {
                        current: latestData.bodyFat || 20,
                        previous: 22,
                        unit: '%',
                      },
                    },
                    highlights: {
                      best: '체지방률 2% 감소',
                      worst: '근육량 1kg 부족',
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* 3. Trend Sparklines */}
          {latestData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TrendSparkline
                title="체중 추이"
                data={[
                  { date: '1월', value: 72 },
                  { date: '2월', value: 71 },
                  { date: '3월', value: 70.5 },
                  { date: '4월', value: 70 },
                ]}
                currentValue={latestData.weight || 70}
                previousValue={72}
                unit="kg"
                color="orange"
              />
              <TrendSparkline
                title="골격근육 추이"
                data={[
                  { date: '1월', value: 28 },
                  { date: '2월', value: 29 },
                  { date: '3월', value: 29.5 },
                  { date: '4월', value: 30 },
                ]}
                currentValue={latestData.skeletalMuscle || 30}
                previousValue={28}
                unit="kg"
                color="green"
              />
              <TrendSparkline
                title="체지방률 추이"
                data={[
                  { date: '1월', value: 22 },
                  { date: '2월', value: 21.5 },
                  { date: '3월', value: 21 },
                  { date: '4월', value: 20 },
                ]}
                currentValue={latestData.bodyFat || 20}
                previousValue={22}
                unit="%"
                color="orange"
              />
            </div>
          )}

          {/* 4. Change Highlight & Progress Row */}
          {latestData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Highlight */}
              <ChangeHighlight
                changes={[
                  {
                    name: '체중',
                    currentValue: 70,
                    previousValue: 72,
                    unit: 'kg',
                    higherIsBetter: false,
                  },
                  {
                    name: '골격근육',
                    currentValue: 30,
                    previousValue: 28,
                    unit: 'kg',
                    higherIsBetter: true,
                  },
                  {
                    name: '체지방률',
                    currentValue: 20,
                    previousValue: 22,
                    unit: '%',
                    higherIsBetter: false,
                  },
                ]}
                period="지난 30일"
              />

              {/* Progress Indicator */}
              <ProgressIndicator
                goals={[
                  {
                    id: 'weight-goal',
                    name: '목표 체중 달성',
                    currentValue: 70,
                    targetValue: 65,
                    unit: 'kg',
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },
                  {
                    id: 'muscle-goal',
                    name: '근육량 증가',
                    currentValue: 30,
                    targetValue: 35,
                    unit: 'kg',
                    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                  },
                ]}
              />
            </div>
          )}

          {/* 5. Gamification Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Streak Counter */}
            <StreakCounter
              streak={{
                currentStreak: 7,
                longestStreak: 14,
                totalMeasurements: 45,
                weeklyGoal: 3,
                weeklyCount: 2,
              }}
            />

            {/* Achievement Badges */}
            <AchievementBadges
              achievements={generateDefaultAchievements().map((a) => ({
                ...a,
                unlocked: a.id === 'first',
              }))}
              maxDisplay={6}
            />

            {/* Goal Tracker */}
            <GoalTracker
              goals={[
                {
                  id: 'goal-1',
                  type: 'weight',
                  name: '목표 체중 65kg',
                  currentValue: 70,
                  targetValue: 65,
                  unit: 'kg',
                  higherIsBetter: false,
                  createdAt: new Date(),
                },
                {
                  id: 'goal-2',
                  type: 'muscle',
                  name: '근육량 35kg',
                  currentValue: 30,
                  targetValue: 35,
                  unit: 'kg',
                  higherIsBetter: true,
                  createdAt: new Date(),
                },
              ]}
            />
          </div>

          {/* 6. History Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <HistoryList />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
