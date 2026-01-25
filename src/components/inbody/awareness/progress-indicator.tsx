/**
 * TAG-FE-001-AWR-002: Progress Indicator Component
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 목표 대비 진행률 인디케이터 컴포넌트
 */

'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target, Award, TrendingUp } from 'lucide-react'

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
 * Calculate progress percentage and status
 */
function calculateProgress(current: number, target: number) {
  const progress = (current / target) * 100

  let status: 'ahead' | 'on-track' | 'behind' | 'completed'
  let color: string
  let bgColor: string

  if (progress >= 100) {
    status = 'completed'
    color = 'text-green-600'
    bgColor = 'bg-green-50'
  } else if (progress >= 80) {
    status = 'ahead'
    color = 'text-blue-600'
    bgColor = 'bg-blue-50'
  } else if (progress >= 50) {
    status = 'on-track'
    color = 'text-yellow-600'
    bgColor = 'bg-yellow-50'
  } else {
    status = 'behind'
    color = 'text-orange-600'
    bgColor = 'bg-orange-50'
  }

  return { progress, status, color, bgColor }
}

/**
 * Individual Goal Progress Card
 */
function GoalProgressCard({ goal }: { goal: GoalProgress }) {
  const progressData = calculateProgress(goal.currentValue, goal.targetValue)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {goal.icon || <Target className="w-5 h-5 text-gray-400" />}
          <div>
            <h4 className="text-sm font-semibold text-gray-700">{goal.name}</h4>
            <p className="text-xs text-gray-500">
              {goal.currentValue.toFixed(1)} / {goal.targetValue.toFixed(1)} {goal.unit}
            </p>
          </div>
        </div>

        <Badge className={`${progressData.bgColor} ${progressData.color} border-0`}>
          {progressData.status === 'completed' && <Award className="w-3 h-3 mr-1" />}
          {progressData.status === 'ahead' && <TrendingUp className="w-3 h-3 mr-1" />}
          {progressData.progress.toFixed(0)}%
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress
          value={Math.min(progressData.progress, 100)}
          className="h-2"
          progressBarColor={
            progressData.status === 'completed'
              ? 'bg-green-500'
              : progressData.status === 'ahead'
                ? 'bg-blue-500'
                : progressData.status === 'on-track'
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
          }
        />

        {/* Remaining */}
        {progressData.progress < 100 && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              남은: {(goal.targetValue - goal.currentValue).toFixed(1)} {goal.unit}
            </span>
            {goal.deadline && (
              <span>
                {Math.ceil(
                  (goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )}
                일 남음
              </span>
            )}
          </div>
        )}
      </div>

      {/* Achievement Celebration */}
      {progressData.status === 'completed' && (
        <div className="mt-3 p-2 bg-green-50 rounded-md flex items-center gap-2">
          <Award className="w-4 h-4 text-green-500" />
          <span className="text-xs font-semibold text-green-700">목표 달성!</span>
        </div>
      )}
    </div>
  )
}

/**
 * Progress Indicator Component
 */
export function ProgressIndicator({
  goals,
  showOverallProgress = true,
}: ProgressIndicatorProps) {
  // Calculate overall progress
  const overallProgress = goals.reduce((acc, goal) => {
    return acc + (goal.currentValue / goal.targetValue) * 100
  }, 0) / goals.length

  const completedCount = goals.filter(
    (g) => g.currentValue >= g.targetValue
  ).length

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-['Inter','Noto_Sans_KR',sans-serif]">
            목표 진행률
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {completedCount} / {goals.length} 목표 달성
          </p>
        </div>

        {/* Overall Progress Badge */}
        {showOverallProgress && (
          <Badge
            className={
              overallProgress >= 80
                ? 'bg-blue-50 text-blue-700'
                : overallProgress >= 50
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-orange-50 text-orange-700'
            }
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
            <span className="text-lg font-bold text-gray-900">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={overallProgress}
            className="h-3"
            progressBarColor={
              overallProgress >= 80
                ? 'bg-blue-500'
                : overallProgress >= 50
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
            }
          />
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
