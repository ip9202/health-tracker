/**
 * TAG-FE-001-DASH-002: Enhanced InBody Dashboard with New Visualizations
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 대시보드 개선 - InBody 스타일 시각화 및 각성 요소 추가
 */

'use client'

import { useEffect, useState } from 'react'
import { UploadSection } from '../upload/upload-section'
import { ChartContainer } from '../charts/chart-container'
import { HistoryList } from '../history/history-list'
import { InBodyResultCard } from '../result/inbody-result-card'

// New visualization components
import { BodyTypeShape, ECWTBWRatio, SparklineGrid } from './index'
import { SummaryStatsCard } from '../awareness/index'
import { StreakCounter, AchievementBadges, GoalTracker, generateDefaultAchievements } from '../gamification/index'

import { fetchInBodyHistory } from '@/lib/api/inbody-api'
import type { InBodyData, InBodyRecord } from '@/lib/types/inbody'

export function EnhancedInBodyDashboard() {
  const [latestData, setLatestData] = useState<InBodyData | null>(null)
  const [history, setHistory] = useState<InBodyRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Reload data function
  const reloadLatestData = async () => {
    try {
      setIsLoading(true)

      const response = await fetchInBodyHistory({ page: 1, pageSize: 10 })

      if (response.records.length > 0) {
        const record = response.records[0]
        setLatestData(record as unknown as InBodyData)
        setHistory(response.records)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('401')) {
        console.log('인증되지 않은 사용자 - InBody 기록을 표시하지 않음')
        setLatestData(null)
      } else {
        console.error('Failed to load latest InBody data:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    reloadLatestData()
  }, [])

  // Calculate streak and gamification data
  const calculateStreakData = () => {
    if (history.length === 0) return null

    // Sort by date descending
    const sorted = [...history].sort(
      (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
    )

    // Calculate consecutive days
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sorted.length; i++) {
      const measurementDate = new Date(sorted[i].measuredAt)
      measurementDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor(
        (today.getTime() - measurementDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === i) {
        streak++
      } else {
        break
      }
    }

    return {
      currentStreak: streak,
      longestStreak: Math.max(streak, 30), // Placeholder
      totalMeasurements: history.length,
      lastMeasurementDate: new Date(sorted[0]?.measuredAt || Date.now()),
      weeklyGoal: 3,
      weeklyCount: sorted.filter(
        (r) =>
          new Date(r.measuredAt) >=
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
    }
  }

  const streakData = calculateStreakData()

  // Prepare sparkline data
  const prepareSparklineData = () => {
    if (history.length < 2) return []

    const sorted = [...history].sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    )

    return [
      {
        id: 'weight',
        title: '체중',
        data: sorted
          .filter((r) => r.weight !== undefined)
          .map((r) => ({
            date: new Date(r.measuredAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            value: r.weight!,
          })),
        currentValue: sorted[sorted.length - 1]?.weight || 0,
        previousValue: sorted[sorted.length - 2]?.weight || 0,
        unit: 'kg',
        color: 'blue' as const,
      },
      {
        id: 'muscle',
        title: '골격근량',
        data: sorted
          .filter((r) => r.skeletalMuscle !== undefined)
          .map((r) => ({
            date: new Date(r.measuredAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            value: r.skeletalMuscle!,
          })),
        currentValue: sorted[sorted.length - 1]?.skeletalMuscle || 0,
        previousValue: sorted[sorted.length - 2]?.skeletalMuscle || 0,
        unit: 'kg',
        color: 'green' as const,
      },
      {
        id: 'bodyFat',
        title: '체지방률',
        data: sorted
          .filter((r) => r.bodyFatPercentage !== undefined)
          .map((r) => ({
            date: new Date(r.measuredAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            value: r.bodyFatPercentage!,
          })),
        currentValue: sorted[sorted.length - 1]?.bodyFatPercentage || 0,
        previousValue: sorted[sorted.length - 2]?.bodyFatPercentage || 0,
        unit: '%',
        color: 'orange' as const,
      },
    ]
  }

  return (
    <div className="w-full bg-[#f9fafb]">
      {/* Page Header */}
      <div className="flex flex-col gap-0 pt-8 pb-2 px-4">
        <div className="h-9">
          <h1 className="text-[30px] font-bold leading-9 tracking-[-0.35px] text-[#101828] font-['Inter',sans-serif]">
            InBody Dashboard
          </h1>
        </div>
        <div className="h-7">
          <p className="text-[18px] font-normal leading-7 tracking-[-0.44px] text-[#6a7282] font-['Inter',sans-serif]">
            Manage and visualize your body composition data.
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex flex-col gap-4 px-4">
        {/* Upload Section */}
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
          <UploadSection onUploadSuccess={reloadLatestData} />
        </div>

        {/* Summary Stats Card - NEW */}
        {history.length >= 2 && (
          <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
            <SummaryStatsCard
              stats={{
                period: 'week',
                measurements: history.filter(
                  (r) =>
                    new Date(r.measuredAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length,
                stats: {
                  weight: {
                    current: history[0]?.weight || 0,
                    previous: history[1]?.weight || 0,
                    unit: 'kg',
                  },
                  muscle: {
                    current: history[0]?.skeletalMuscle || 0,
                    previous: history[1]?.skeletalMuscle || 0,
                    unit: 'kg',
                  },
                  bodyFatPercentage: {
                    current: history[0]?.bodyFatPercentage || 0,
                    previous: history[1]?.bodyFatPercentage || 0,
                    unit: '%',
                  },
                  bodyScore: {
                    current: history[0]?.bodyScore || 0,
                    previous: history[1]?.bodyScore || 0,
                    unit: '점',
                  },
                },
              }}
            />
          </div>
        )}

        {/* Gamification Row - NEW */}
        {streakData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Streak Counter */}
            <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
              <StreakCounter streak={streakData} />
            </div>

            {/* Achievement Badges */}
            <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
              <AchievementBadges achievements={generateDefaultAchievements()} maxDisplay={4} />
            </div>
          </div>
        )}

        {/* InBody Result Card */}
        <InBodyResultCard data={latestData} isLoading={isLoading} />

        {/* New Visualizations Row - NEW */}
        {latestData && history.length >= 2 && (
          <>
            {/* Trend Sparklines */}
            {prepareSparklineData().length > 0 && (
              <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
                <SparklineGrid sparklines={prepareSparklineData()} />
              </div>
            )}

            {/* Body Type Shape & ECW/TBW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestData.skeletalMuscle && latestData.bodyFat && (
                <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
                  <BodyTypeShape
                    muscleMass={latestData.skeletalMuscle}
                    bodyFat={latestData.bodyFat}
                    height={latestData.height}
                  />
                </div>
              )}

              {latestData.bodyWater && latestData.weight && (
                <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
                  <ECWTBWRatio
                    ecw={latestData.bodyWater * 0.38} // Approximate ECW as 38% of TBW
                    tbw={latestData.bodyWater}
                  />
                </div>
              )}
            </div>

            {/* Goal Tracker */}
            <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
              <GoalTracker
                goals={
                  latestData.weight
                    ? [
                        {
                          id: 'weight-goal',
                          type: 'weight',
                          name: '목표 체중',
                          currentValue: latestData.weight,
                          targetValue: 70,
                          unit: 'kg',
                          higherIsBetter: false,
                          createdAt: new Date(),
                        },
                      ]
                    : []
                }
              />
            </div>
          </>
        )}

        {/* Chart Section */}
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-6">
          <ChartContainer />
        </div>

        {/* History List Section */}
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-6">
          <HistoryList />
        </div>
      </div>
    </div>
  )
}
