/**
 * TAG-FE-013-GAM-002: Achievement Badges Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 마일스톤 업적 배지 - InBody 색상 시스템 적용
 *
 * Design System (SPEC-FE-006):
 * - 스페셜(특수): Purple (#9333EA)
 * - 점수: Yellow (#F59E0B)
 * - 근육: Green (#22C55E)
 * - 체지방: Orange (#F97316)
 * - 체중: Blue (#0066CC)
 * - 스트릭: Red/Orange (#EF4444)
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'

export interface Achievement {
  id: string
  name: string
  description: string
  icon?: string
  unlocked: boolean
  unlockedAt?: Date
  progress?: number // 0-100
  category: 'streak' | 'weight' | 'muscle' | 'fat' | 'score' | 'special'
}

export interface AchievementBadgesProps {
  achievements: Achievement[]
  maxDisplay?: number
}

/**
 * 카테고리별 색상 시스템 (InBody Design System)
 */
function getCategoryColors(category: Achievement['category']) {
  const colors = {
    streak: { bg: '#FED7AA', border: '#F97316', iconBg: '#FFEDD5', text: '#9A3412' },
    weight: { bg: '#DBEAFE', border: '#0066CC', iconBg: '#EFF6FF', text: '#1E40AF' },
    muscle: { bg: '#DCFCE7', border: '#22C55E', iconBg: '#F0FDF4', text: '#166534' },
    fat: { bg: '#FEE2E2', border: '#EF4444', iconBg: '#FEF2F2', text: '#991B1B' },
    score: { bg: '#FEF3C7', border: '#F59E0B', iconBg: '#FFFBEB', text: '#92400E' },
    special: { bg: '#F3E8FF', border: '#9333EA', iconBg: '#FAF5FF', text: '#6B21A8' },
  }
  return colors[category]
}

/**
 * Achievement Icon Component
 */
function AchievementIcon({ achievement }: { achievement: Achievement }) {
  const colors = getCategoryColors(achievement.category)

  if (achievement.unlocked) {
    return (
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.iconBg }}
      >
        <span className="text-2xl">{achievement.icon || '🏆'}</span>
      </div>
    )
  }

  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100"
    >
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    </div>
  )
}

/**
 * Achievement Badge Card (InBody Style)
 */
function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const colors = getCategoryColors(achievement.category)

  return (
    <div
      className={`relative rounded-lg p-4 border-2 transition-all ${
        achievement.unlocked
          ? `shadow-sm hover:shadow-md`
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
      style={{
        backgroundColor: achievement.unlocked ? colors.bg : undefined,
        borderColor: achievement.unlocked ? colors.border : undefined,
      }}
    >
      {/* Lock overlay for locked achievements */}
      {!achievement.unlocked && (
        <div className="absolute inset-0 bg-gray-50/90 rounded-lg flex items-center justify-center z-10">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-2 right-2">
        <Badge
          className="border-0 text-xs capitalize"
          style={{
            backgroundColor: colors.iconBg,
            color: colors.text,
          }}
        >
          {achievement.category}
        </Badge>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <AchievementIcon achievement={achievement} />
      </div>

      {/* Content */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-gray-900 mb-1">{achievement.name}</h4>
        <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>

        {/* Progress Bar for in-progress achievements */}
        {achievement.progress !== undefined && !achievement.unlocked && (
          <div className="mt-2">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  backgroundColor: colors.border,
                  width: `${achievement.progress}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{achievement.progress.toFixed(0)}%</p>
          </div>
        )}

        {/* Unlocked Date */}
        {achievement.unlocked && achievement.unlockedAt && (
          <p className="text-xs text-gray-500 mt-2">
            {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Achievement Badges Component (SPEC-FE-006 Redesign)
 */
export function AchievementBadges({
  achievements,
  maxDisplay = 8,
}: AchievementBadgesProps) {
  // Separate unlocked and locked achievements
  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)
  const displayAchievements = [
    ...unlocked.sort((a, b) => (a.unlockedAt?.getTime() || 0) - (b.unlockedAt?.getTime() || 0)),
    ...locked,
  ].slice(0, maxDisplay)

  const totalUnlocked = unlocked.length
  const completionRate = (totalUnlocked / achievements.length) * 100

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">업적 배지</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalUnlocked} / {achievements.length} 개 달성
          </p>
        </div>

        {/* Completion Rate Badge */}
        <Badge
          className="border-0 px-3 py-1.5"
          style={{
            backgroundColor:
              completionRate >= 75
                ? '#DCFCE7'
                : completionRate >= 50
                  ? '#DBEAFE'
                  : '#F3F4F6',
            color:
              completionRate >= 75
                ? '#166534'
                : completionRate >= 50
                  ? '#1E40AF'
                  : '#374151',
          }}
        >
          {completionRate.toFixed(0)}% 완료
        </Badge>
      </div>

      {/* Completion Progress */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F3E8FF' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">전체 완료율</span>
          <span className="text-lg font-bold font-mono" style={{ color: '#9333EA' }}>
            {completionRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundColor: '#9333EA',
              width: `${completionRate}%`,
            }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayAchievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {/* Show More Indicator */}
      {achievements.length > maxDisplay && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            외 {achievements.length - maxDisplay}개의 업적이 더 있습니다
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Generate default achievements for InBody tracking
 */
export function generateDefaultAchievements(): Achievement[] {
  return [
    {
      id: 'first-measurement',
      name: '첫 측정',
      description: 'InBody 측정을 시작하세요',
      category: 'special',
      unlocked: false,
      icon: '🎉',
    },
    {
      id: 'streak-7',
      name: '일주일 꾸준히',
      description: '7일 연속 측정',
      category: 'streak',
      unlocked: false,
      progress: 0,
      icon: '🔥',
    },
    {
      id: 'streak-30',
      name: '한달 꾸준히',
      description: '30일 연속 측정',
      category: 'streak',
      unlocked: false,
      progress: 0,
      icon: '💎',
    },
    {
      id: 'weight-goal',
      name: '목표 체중 달성',
      description: '목표 체중에 도달',
      category: 'weight',
      unlocked: false,
      progress: 0,
      icon: '⚖️',
    },
    {
      id: 'muscle-gain',
      name: '근육 증가',
      description: '근육량 2kg 증가',
      category: 'muscle',
      unlocked: false,
      progress: 0,
      icon: '💪',
    },
    {
      id: 'fat-loss',
      name: '체지방 감소',
      description: '체지방률 5% 감소',
      category: 'fat',
      unlocked: false,
      progress: 0,
      icon: '🔥',
    },
    {
      id: 'score-80',
      name: '신체 점수 80점',
      description: '신체 점수 80점 달성',
      category: 'score',
      unlocked: false,
      progress: 0,
      icon: '🎯',
    },
    {
      id: 'score-90',
      name: '신체 점수 90점',
      description: '신체 점수 90점 달성',
      category: 'score',
      unlocked: false,
      progress: 0,
      icon: '🏆',
    },
  ]
}
