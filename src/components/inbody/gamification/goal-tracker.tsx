/**
 * TAG-FE-013-GAM-003: Goal Tracker Component
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: InBody 목표 설정 및 추적 UI - InBody 색상 시스템 적용
 *
 * Design System (SPEC-FE-006):
 * - Completed (100%+): Green (#22C55E)
 * - On-Track (50-99%): Blue (#0066CC)
 * - Behind (< 50%): Orange (#F97316)
 * - Overdue: Red (#EF4444)
 */

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export type GoalType = 'weight' | 'muscle' | 'fat' | 'score' | 'streak' | 'custom'

export interface Goal {
  id: string
  type: GoalType
  name: string
  currentValue: number
  targetValue: number
  unit: string
  deadline?: Date
  higherIsBetter?: boolean
  createdAt: Date
}

export interface GoalTrackerProps {
  goals: Goal[]
  onGoalAdd?: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
}

/**
 * 목표 상태 계산 (InBody Design System)
 */
function calculateGoalStatus(goal: Goal) {
  const progress = (goal.currentValue / goal.targetValue) * 100
  const isCompleted = goal.higherIsBetter
    ? goal.currentValue >= goal.targetValue
    : goal.currentValue <= goal.targetValue

  let status: 'completed' | 'on-track' | 'behind' | 'overdue'
  let color: string
  let bgColor: string

  if (isCompleted) {
    status = 'completed'
    color = '#22C55E' // InBody Green
    bgColor = 'bg-green-50'
  } else if (goal.deadline && new Date() > goal.deadline) {
    status = 'overdue'
    color = '#EF4444' // Red
    bgColor = 'bg-red-50'
  } else if (progress >= 50) {
    status = 'on-track'
    color = '#0066CC' // InBody Blue
    bgColor = 'bg-blue-50'
  } else {
    status = 'behind'
    color = '#F97316' // InBody Orange
    bgColor = 'bg-orange-50'
  }

  return { progress, status, color, bgColor, isCompleted }
}

/**
 * Goal Type Icon and Label
 */
function getGoalTypeInfo(type: GoalType) {
  const info = {
    weight: { icon: '⚖️', label: '체중', color: '#0066CC' },
    muscle: { icon: '💪', label: '근육', color: '#22C55E' },
    fat: { icon: '🔥', label: '체지방', color: '#F97316' },
    score: { icon: '🎯', label: '점수', color: '#F59E0B' },
    streak: { icon: '🔥', label: '스트릭', color: '#EF4444' },
    custom: { icon: '✏️', label: '직접', color: '#9333EA' },
  }
  return info[type]
}

/**
 * Goal Card Component (InBody Style)
 */
function GoalCard({ goal }: { goal: Goal }) {
  const statusData = calculateGoalStatus(goal)
  const typeInfo = getGoalTypeInfo(goal.type)

  return (
    <div
      className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow ${
        statusData.isCompleted ? 'border-green-300' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: statusData.bgColor }}
          >
            {typeInfo.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{goal.name}</h4>
            <p className="text-xs text-gray-500">
              {goal.currentValue.toFixed(1)} / {goal.targetValue.toFixed(1)} {goal.unit}
            </p>
          </div>
        </div>

        <Badge
          className="border-0 px-2.5 py-1"
          style={{
            backgroundColor: statusData.bgColor,
            color: statusData.color,
          }}
        >
          {statusData.progress.toFixed(0)}%
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500"
          style={{
            backgroundColor: statusData.color,
            width: `${Math.min(statusData.progress, 100)}%`,
          }}
        />
      </div>

      {/* Deadline */}
      {goal.deadline && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>마감일</span>
          <span
            className={statusData.status === 'overdue' ? 'text-red-600 font-semibold' : ''}
          >
            {new Date(goal.deadline).toLocaleDateString('ko-KR')}
          </span>
        </div>
      )}

      {/* Completed Badge */}
      {statusData.isCompleted && (
        <div
          className="mt-2 p-2.5 rounded-md border-l-4 flex items-center gap-2"
          style={{ backgroundColor: statusData.bgColor, borderLeftColor: statusData.color }}
        >
          <span className="text-lg">🎉</span>
          <span className="text-xs font-semibold" style={{ color: statusData.color }}>
            목표 달성!
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Add Goal Dialog Content (InBody Style)
 */
function AddGoalDialogContent({
  onAdd,
  onClose,
}: {
  onAdd: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [type, setType] = useState<GoalType>('weight')
  const [name, setName] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('kg')

  const handleSubmit = () => {
    if (!name || !targetValue) return

    onAdd({
      type,
      name,
      currentValue: 0,
      targetValue: parseFloat(targetValue),
      unit,
      higherIsBetter: type === 'muscle' || type === 'score' || type === 'streak',
    })
    onClose()
  }

  const goalTypes: Array<{ type: GoalType; label: string; icon: string }> = [
    { type: 'weight', label: '체중', icon: '⚖️' },
    { type: 'muscle', label: '근육', icon: '💪' },
    { type: 'fat', label: '체지방', icon: '🔥' },
    { type: 'score', label: '점수', icon: '🎯' },
    { type: 'streak', label: '스트릭', icon: '🔥' },
    { type: 'custom', label: '직접', icon: '✏️' },
  ]

  return (
    <div className="space-y-4">
      {/* Goal Type Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          목표 유형
        </label>
        <div className="grid grid-cols-3 gap-2">
          {goalTypes.map((option) => (
            <button
              key={option.type}
              onClick={() => setType(option.type)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                type === option.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-xs font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Name */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          목표 이름
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 목표 체중 달성"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Target Value */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          목표 값
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="70"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="kg">kg</option>
            <option value="%">%</option>
            <option value="회">회</option>
            <option value="점">점</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        목표 추가
      </button>
    </div>
  )
}

/**
 * Goal Tracker Component (SPEC-FE-006 Redesign)
 */
export function GoalTracker({ goals, onGoalAdd }: GoalTrackerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // 전체 통계 계산
  const completedGoals = goals.filter((g) => calculateGoalStatus(g).isCompleted).length
  const overallProgress =
    goals.length > 0
      ? goals.reduce((acc, g) => acc + calculateGoalStatus(g).progress, 0) / goals.length
      : 0

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">목표 관리</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {completedGoals} / {goals.length} 목표 달성
          </p>
        </div>

        {/* Add Goal Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              목표 추가
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 목표 추가</DialogTitle>
              <DialogDescription>
                건강 목표를 설정하고 추적하세요
              </DialogDescription>
            </DialogHeader>
            <AddGoalDialogContent
              onAdd={(goal) => {
                onGoalAdd?.(goal)
                setIsAddDialogOpen(false)
              }}
              onClose={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Progress */}
      {goals.length > 0 && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#DBEAFE' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">전체 진행률</span>
            <span className="text-lg font-bold font-mono" style={{ color: '#0066CC' }}>
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: '#0066CC',
                width: `${overallProgress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-500 mb-4">설정된 목표가 없습니다</p>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            첫 목표 설정하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
