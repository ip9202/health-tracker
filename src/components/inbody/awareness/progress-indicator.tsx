/**
 * TAG-FE-012-AWR-002: Progress Indicator Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 목표 대비 진행률 인디케이터 - InBody 색상 시스템 적용
 *
 * Design System (SPEC-FE-006):
 * - Completed (100%+): Success Green (#22C55E)
 * - On Track (80-99%): Primary Blue (#0066CC)
 * - Behind (50-79%): Warning Orange (#F97316)
 * - At Risk (< 50%): Red (#EF4444)
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'

export interface GoalProgress {
  id: string
  name: string
  currentValue: number
  targetValue: number
  unit: string
  deadline?: Date
  icon?: React.ReactNode
}

export interface ProgressIndicatorProps {
  goals: GoalProgress[]
  showOverallProgress?: boolean
}

/**
 * 진행률 계산 및 상태 판정 (InBody Design System)
 */
function calculateProgress(current: number, target: number) {
  const progress = Math.min((current / target) * 100, 150) // 최대 150%

  let status: 'completed' | 'ahead' | 'on-track' | 'behind'
  let color: string
  let bgColor: string

  if (progress >= 100) {
    status = 'completed'
    color = '#22C55E' // InBody Green
    bgColor = 'bg-green-50'
  } else if (progress >= 80) {
    status = 'ahead'
    color = '#0066CC' // InBody Blue
    bgColor = 'bg-blue-50'
  } else if (progress >= 50) {
    status = 'on-track'
    color = '#F97316' // InBody Orange
    bgColor = 'bg-orange-50'
  } else {
    status = 'behind'
    color = '#EF4444' // Red
    bgColor = 'bg-red-50'
  }

  return { progress, status, color, bgColor }
}

/**
 * 개별 목표 진행률 카드 (InBody Style)
 */
function GoalProgressCard({ goal }: { goal: GoalProgress }) {
  const progressData = calculateProgress(goal.currentValue, goal.targetValue)

  // 남은 기간 계산
  const daysRemaining = goal.deadline
    ? Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {goal.icon || (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-gray-700">{goal.name}</h4>
            <p className="text-xs text-gray-500">
              {goal.currentValue.toFixed(1)} / {goal.targetValue.toFixed(1)} {goal.unit}
            </p>
          </div>
        </div>

        <Badge
          className={`${progressData.bgColor} border-0 px-2.5 py-1`}
          style={{ color: progressData.color }}
        >
          {progressData.progress.toFixed(0)}%
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 rounded-full transition-all duration-500"
            style={{
              backgroundColor: progressData.color,
              width: `${Math.min(progressData.progress, 100)}%`,
            }}
          />
        </div>

        {/* Remaining Info */}
        {progressData.progress < 100 && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              남은: {(goal.targetValue - goal.currentValue).toFixed(1)} {goal.unit}
            </span>
            {daysRemaining !== null && (
              <span>{daysRemaining > 0 ? `${daysRemaining}일 남음` : '기간 경과'}</span>
            )}
          </div>
        )}
      </div>

      {/* Achievement Celebration */}
      {progressData.status === 'completed' && (
        <div
          className="mt-3 p-2.5 rounded-md border-l-4"
          style={{ backgroundColor: progressData.bgColor, borderLeftColor: progressData.color }}
        >
          <p className="text-xs font-semibold" style={{ color: progressData.color }}>
            🎉 목표 달성! 축하합니다!
          </p>
        </div>
      )}

      {/* At Risk Warning */}
      {progressData.status === 'behind' && (
        <div
          className="mt-3 p-2.5 rounded-md border-l-4"
          style={{ backgroundColor: progressData.bgColor, borderLeftColor: progressData.color }}
        >
          <p className="text-xs font-semibold" style={{ color: progressData.color }}>
            ⚠️ 목표 달성을 위한 노력이 필요합니다.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Progress Indicator Component (SPEC-FE-006 Redesign)
 */
export function ProgressIndicator({
  goals,
  showOverallProgress = true,
}: ProgressIndicatorProps) {
  // 전체 진행률 계산
  const overallProgress = goals.length > 0
    ? goals.reduce((acc, goal) => acc + Math.min(goal.currentValue / goal.targetValue, 1.5), 0) /
      goals.length *
      100
    : 0

  const completedCount = goals.filter((g) => g.currentValue >= g.targetValue).length

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">목표 진행률</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {completedCount} / {goals.length} 목표 달성
          </p>
        </div>

        {/* Overall Progress Badge */}
        {showOverallProgress && (
          <Badge
            className="border-0 px-3 py-1.5"
            style={{
              backgroundColor:
                overallProgress >= 80
                  ? '#DCFCE7'
                  : overallProgress >= 50
                    ? '#DBEAFE'
                    : '#FED7AA',
              color:
                overallProgress >= 80
                  ? '#22C55E'
                  : overallProgress >= 50
                    ? '#0066CC'
                    : '#F97316',
            }}
          >
            전체 {overallProgress.toFixed(0)}%
          </Badge>
        )}
      </div>

      {/* Overall Progress Bar */}
      {showOverallProgress && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">전체 진행률</span>
            <span className="text-lg font-bold font-mono text-gray-900">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 rounded-full transition-all duration-500"
              style={{
                backgroundColor:
                  overallProgress >= 80
                    ? '#22C55E'
                    : overallProgress >= 50
                      ? '#0066CC'
                      : '#F97316',
                width: `${Math.min(overallProgress, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <GoalProgressCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  )
}
