/**
 * TAG-FE-001-GAM-002: Achievement Badges Component
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 마일스톤 업적 배지 (게이미피케이션) 컴포넌트
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Lock, Trophy, Star, Medal, Award, Crown, Sparkles } from 'lucide-react'

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
 * Achievement icon component
 */
function AchievementIcon({ achievement }: { achievement: Achievement }) {
  const iconMap: Record<string, React.ReactNode> = {
    trophy: <Trophy className="w-6 h-6" />,
    star: <Star className="w-6 h-6" />,
    medal: <Medal className="w-6 h-6" />,
    award: <Award className="w-6 h-6" />,
    crown: <Crown className="w-6 h-6" />,
    sparkles: <Sparkles className="w-6 h-6" />,
  }

  if (achievement.unlocked) {
    return (
      <div className="text-4xl mb-2">
        {achievement.icon || iconMap.trophy}
      </div>
    )
  }

  return <Lock className="w-6 h-6 text-gray-400 mb-2" />
}

/**
 * Achievement Badge Card
 */
function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const categoryColors: Record<
    string,
    { bg: string; border: string; iconBg: string }
  > = {
    streak: { bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-100' },
    weight: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
    },
    muscle: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
    },
    fat: { bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100' },
    score: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
    },
    special: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
    },
  }

  const colors = categoryColors[achievement.category] || categoryColors.special

  return (
    <div
      className={`relative rounded-xl p-4 border-2 transition-all ${
        achievement.unlocked
          ? `${colors.bg} ${colors.border} shadow-sm hover:shadow-md`
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      {/* Lock overlay for locked achievements */}
      {!achievement.unlocked && (
        <div className="absolute inset-0 bg-gray-50/80 rounded-xl flex items-center justify-center z-10">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-2 right-2">
        <Badge
          className={`${colors.iconBg} border-0 text-xs capitalize`}
        >
          {achievement.category}
        </Badge>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            achievement.unlocked ? colors.iconBg : 'bg-gray-200'
          }`}
        >
          <AchievementIcon achievement={achievement} />
        </div>
      </div>

      {/* Content */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          {achievement.name}
        </h4>
        <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>

        {/* Progress Bar for in-progress achievements */}
        {achievement.progress !== undefined && !achievement.unlocked && (
          <div className="mt-2">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {achievement.progress.toFixed(0)}%
            </p>
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
 * Achievement Badges Component
 */
export function AchievementBadges({
  achievements,
  maxDisplay = 8,
}: AchievementBadgesProps) {
  // Separate unlocked and locked achievements
  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)
  const displayAchievements = [
    ...unlocked.sort(
      (a, b) =>
        (a.unlockedAt?.getTime() || 0) - (b.unlockedAt?.getTime() || 0)
    ),
    ...locked,
  ].slice(0, maxDisplay)

  const totalUnlocked = unlocked.length
  const completionRate = (totalUnlocked / achievements.length) * 100

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-['Inter','Noto_Sans_KR',sans-serif]">
            업적 배지
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {totalUnlocked} / {achievements.length} 개 달성
          </p>
        </div>

        {/* Completion Rate Badge */}
        <Badge
          className={`${
            completionRate >= 75
              ? 'bg-purple-50 text-purple-700'
              : completionRate >= 50
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-50 text-gray-700'
          } border-0`}
        >
          {completionRate.toFixed(0)}% 완료
        </Badge>
      </div>

      {/* Completion Progress */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">전체 완료율</span>
          <span className="text-lg font-bold text-purple-600">
            {completionRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
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
    },
    {
      id: 'streak-7',
      name: '일주일 꾸준히',
      description: '7일 연속 측정',
      category: 'streak',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'streak-30',
      name: '한달 꾸준히',
      description: '30일 연속 측정',
      category: 'streak',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'weight-goal',
      name: '목표 체중 달성',
      description: '목표 체중에 도달',
      category: 'weight',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'muscle-gain',
      name: '근육 증가',
      description: '근육량 2kg 증가',
      category: 'muscle',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'fat-loss',
      name: '체지방 감소',
      description: '체지방률 5% 감소',
      category: 'fat',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'score-80',
      name: '신체 점수 80점',
      description: '신체 점수 80점 달성',
      category: 'score',
      unlocked: false,
      progress: 0,
    },
    {
      id: 'score-90',
      name: '신체 점수 90점',
      description: '신체 점수 90점 달성',
      category: 'score',
      unlocked: false,
      progress: 0,
    },
  ]
}
