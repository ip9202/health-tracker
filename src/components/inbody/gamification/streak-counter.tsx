/**
 * TAG-FE-013-GAM-001: Streak Counter Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 연속 측정 스트릭 카운터 - InBody 색상 시스템 적용
 *
 * Design System (SPEC-FE-006):
 * - Novice (0-2 days): Gray (#9CA3AF)
 * - Common (3-6 days): Blue (#0066CC)
 * - Rare (7-13 days): Green (#22C55E)
 * - Epic (14-29 days): Orange (#F97316)
 * - Legendary (30+ days): Purple (#9333EA)
 */

'use client'

import { Badge } from '@/components/ui/badge'

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
 * 스트릭 레벨 계산 (InBody Design System)
 */
function calculateStreakLevel(streak: number) {
  if (streak >= 30) {
    return {
      level: 'Legendary',
      color: '#9333EA', // Purple
      bgColor: 'bg-purple-50',
      emoji: '🏆',
      description: '전설적인 꾸준함! 30일 이상 연속',
    }
  }
  if (streak >= 14) {
    return {
      level: 'Epic',
      color: '#F97316', // InBody Orange
      bgColor: 'bg-orange-50',
      emoji: '💎',
      description: '정말 인상적입니다! 2주 이상 연속',
    }
  }
  if (streak >= 7) {
    return {
      level: 'Rare',
      color: '#22C55E', // InBody Green
      bgColor: 'bg-green-50',
      emoji: '🔥',
      description: '일주일 내내 꾸준히!',
    }
  }
  if (streak >= 3) {
    return {
      level: 'Common',
      color: '#0066CC', // InBody Blue
      bgColor: 'bg-blue-50',
      emoji: '⭐',
      description: '좋은 시작! 3일 이상 연속',
    }
  }
  return {
    level: 'Novice',
    color: '#9CA3AF', // Gray
    bgColor: 'bg-gray-50',
    emoji: '🌱',
    description: '시작이 반! 첫 2일',
  }
}

/**
 * Streak Counter Component (SPEC-FE-006 Redesign)
 */
export function StreakCounter({ streak }: StreakCounterProps) {
  const streakLevel = calculateStreakLevel(streak.currentStreak)

  // 주간 진행률 계산
  const weeklyProgress = streak.weeklyGoal
    ? ((streak.weeklyCount || 0) / streak.weeklyGoal) * 100
    : null

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">측정 스트릭</h3>
          <p className="text-sm text-gray-500 mt-0.5">꾸준한 측정이 건강을 만듭니다</p>
        </div>

        {/* Streak Level Badge */}
        <Badge
          className={`${streakLevel.bgColor} border-0 px-3 py-1.5`}
          style={{ color: streakLevel.color }}
        >
          <span className="mr-1">{streakLevel.emoji}</span>
          {streakLevel.level}
        </Badge>
      </div>

      {/* Main Streak Display */}
      <div className="flex items-center gap-6 mb-6">
        {/* Current Streak */}
        <div className="flex-1 rounded-lg p-6 text-center" style={{ backgroundColor: streakLevel.bgColor }}>
          <div className="text-4xl mb-2">{streakLevel.emoji}</div>
          <div className="text-5xl font-bold font-mono text-gray-900 mb-1">
            {streak.currentStreak}
          </div>
          <div className="text-sm text-gray-600">일 연속</div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {/* Longest Streak */}
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xl font-bold font-mono text-gray-900">
              {streak.longestStreak}
            </div>
            <div className="text-xs text-gray-500">최대 스트릭</div>
          </div>

          {/* Total Measurements */}
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xl font-bold font-mono text-gray-900">
              {streak.totalMeasurements}
            </div>
            <div className="text-xs text-gray-500">총 측정</div>
          </div>
        </div>
      </div>

      {/* Streak Level Description */}
      <div
        className="rounded-md p-4 mb-6 border-l-4"
        style={{ backgroundColor: streakLevel.bgColor, borderLeftColor: streakLevel.color }}
      >
        <p className="text-sm font-medium" style={{ color: streakLevel.color }}>
          {streakLevel.description}
        </p>
      </div>

      {/* Weekly Goal Progress */}
      {weeklyProgress !== null && streak.weeklyCount !== undefined && (
        <div className="bg-blue-50 rounded-md p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              이번 주 목표 ({streak.weeklyCount} / {streak.weeklyGoal})
            </span>
            <span className="text-sm font-bold font-mono" style={{ color: '#0066CC' }}>
              {weeklyProgress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: '#0066CC',
                width: `${Math.min(weeklyProgress, 100)}%`,
              }}
            />
          </div>
          {weeklyProgress >= 100 && (
            <p className="text-xs font-semibold mt-2" style={{ color: '#22C55E' }}>
              🎉 이번 주 목표 달성!
            </p>
          )}
        </div>
      )}

      {/* Motivational Message */}
      {streak.currentStreak === 0 && (
        <div
          className="mt-4 p-4 rounded-md border-l-4"
          style={{ backgroundColor: '#FED7AA', borderLeftColor: '#F97316' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#F97316' }}>
            시작이 반! 오늘 측정으로 스트릭을 시작해보세요.
          </p>
        </div>
      )}

      {streak.currentStreak === 1 && (
        <div
          className="mt-4 p-4 rounded-md border-l-4"
          style={{ backgroundColor: '#DBEAFE', borderLeftColor: '#0066CC' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#0066CC' }}>
            좋은 시작! 내일도 측정하여 2일 스트릭을 달성해보세요.
          </p>
        </div>
      )}

      {streak.currentStreak > 1 && streak.currentStreak < 7 && (
        <div
          className="mt-4 p-4 rounded-md border-l-4"
          style={{ backgroundColor: '#DCFCE7', borderLeftColor: '#22C55E' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#22C55E' }}>
            {streak.currentStreak}일 연속! 일주일 스트릭까지 {7 - streak.currentStreak}일
            남았습니다.
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
    sm: { emoji: 'text-lg', text: 'text-lg', label: 'text-xs' },
    md: { emoji: 'text-2xl', text: 'text-2xl', label: 'text-sm' },
    lg: { emoji: 'text-3xl', text: 'text-3xl', label: 'text-base' },
  }

  const classes = sizeClasses[size]
  const streakLevel = calculateStreakLevel(streak)

  return (
    <div className="flex items-center gap-2">
      <span className={classes.emoji}>{streakLevel.emoji}</span>
      <span className={`font-bold font-mono text-gray-900 ${classes.text}`}>
        {streak}
      </span>
      <span className={`text-gray-500 ${classes.label}`}>일</span>
    </div>
  )
}
