/**
 * TAG-FE-001-GAM-001: Streak Counter Component
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 연속 측정 스트릭 카운터 (게이미피케이션) 컴포넌트
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Flame, Calendar, Trophy } from 'lucide-react'

export interface StreakData {
  currentStreak: number // Current consecutive days
  longestStreak: number // Longest streak record
  totalMeasurements: number // Total measurements all time
  lastMeasurementDate?: Date
  weeklyGoal?: number // Target measurements per week
  weeklyCount?: number // Current week measurements
}

export interface StreakCounterProps {
  streak: StreakData
}

/**
 * Calculate streak level and rewards
 */
function calculateStreakLevel(streak: number) {
  if (streak >= 30) {
    return {
      level: 'Legendary',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      emoji: '🏆',
      description: '전설级的 꾸준함!',
    }
  } else if (streak >= 14) {
    return {
      level: 'Epic',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      emoji: '💎',
      description: '정말 인상적입니다!',
    }
  } else if (streak >= 7) {
    return {
      level: 'Rare',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      emoji: '🔥',
      description: '일주일 내내 꾸준히!',
    }
  } else if (streak >= 3) {
    return {
      level: 'Common',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      emoji: '⭐',
      description: '좋은 시작!',
    }
  } else {
    return {
      level: 'Novice',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      emoji: '🌱',
      description: '시작이 반!',
    }
  }
}

/**
 * Streak Counter Component
 */
export function StreakCounter({ streak }: StreakCounterProps) {
  const streakLevel = calculateStreakLevel(streak.currentStreak)

  // Calculate weekly progress
  const weeklyProgress = streak.weeklyGoal
    ? ((streak.weeklyCount || 0) / streak.weeklyGoal) * 100
    : null

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-['Inter','Noto_Sans_KR',sans-serif]">
            측정 스트릭
          </h3>
          <p className="text-sm text-gray-500 mt-1">꾸준한 측정이 건강을 만듭니다</p>
        </div>

        {/* Streak Level Badge */}
        <Badge className={`${streakLevel.bgColor} ${streakLevel.color} border-0 px-3 py-1`}>
          <span className="mr-1">{streakLevel.emoji}</span>
          {streakLevel.level}
        </Badge>
      </div>

      {/* Main Streak Display */}
      <div className="flex items-center gap-6 mb-6">
        {/* Current Streak */}
        <div className="flex-1 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 text-center">
          <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-5xl font-bold text-gray-900 mb-1">
            {streak.currentStreak}
          </div>
          <div className="text-sm text-gray-600">일 연속</div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {/* Longest Streak */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-gray-900">
              {streak.longestStreak}
            </div>
            <div className="text-xs text-gray-500">최대 스트릭</div>
          </div>

          {/* Total Measurements */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-gray-900">
              {streak.totalMeasurements}
            </div>
            <div className="text-xs text-gray-500">총 측정</div>
          </div>
        </div>
      </div>

      {/* Streak Level Description */}
      <div className={`${streakLevel.bgColor} rounded-lg p-4 mb-6`}>
        <p className={`text-sm font-medium ${streakLevel.color}`}>
          {streakLevel.description}
        </p>
      </div>

      {/* Weekly Goal Progress */}
      {weeklyProgress !== null && streak.weeklyCount !== undefined && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              이번 주 목표 ({streak.weeklyCount} / {streak.weeklyGoal})
            </span>
            <span className="text-sm font-bold text-blue-600">
              {weeklyProgress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
            />
          </div>
          {weeklyProgress >= 100 && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              🎉 이번 주 목표 달성!
            </p>
          )}
        </div>
      )}

      {/* Motivational Message */}
      {streak.currentStreak === 0 && (
        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-700">
            <span className="font-semibold">시작이 반!</span> 오늘 측정으로 스트릭을
            시작해보세요.
          </p>
        </div>
      )}

      {streak.currentStreak === 1 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <span className="font-semibold">좋은 시작!</span> 내일도 측정하여 2일
            스트릭을 달성해보세요.
          </p>
        </div>
      )}

      {streak.currentStreak > 1 && streak.currentStreak < 7 && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            <span className="font-semibold">{streak.currentStreak}일 연속!</span>{' '}
            일주일 스트릭까지 {7 - streak.currentStreak}일 남았습니다.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Mini Streak Display (for dashboard cards)
 */
export interface MiniStreakProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

export function MiniStreak({ streak, size = 'md' }: MiniStreakProps) {
  const sizeClasses = {
    sm: { flame: 'w-4 h-4', text: 'text-lg', label: 'text-xs' },
    md: { flame: 'w-5 h-5', text: 'text-2xl', label: 'text-sm' },
    lg: { flame: 'w-6 h-6', text: 'text-3xl', label: 'text-base' },
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex items-center gap-2">
      <Flame className={`${classes.flame} text-orange-500`} />
      <span className={`font-bold text-gray-900 ${classes.text}`}>{streak}</span>
      <span className={`text-gray-500 ${classes.label}`}>일</span>
    </div>
  )
}
