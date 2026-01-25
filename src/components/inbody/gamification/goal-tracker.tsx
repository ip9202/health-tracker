/**
 * TAG-FE-001-GAM-003: Goal Tracker Component
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 목표 설정 및 추적 UI 컴포넌트
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Target, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

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
 * Calculate goal progress and status
 */
function calculateGoalStatus(goal: Goal) {
  const progress = (goal.currentValue / goal.targetValue) * 100
  const isCompleted = goal.higherIsBetter
    ? goal.currentValue >= goal.targetValue
    : goal.currentValue <= goal.targetValue

  let status: 'completed' | 'on-track' | 'behind' | 'overdue'
  let color: string

  if (isCompleted) {
    status = 'completed'
    color = 'text-green-600'
  } else if (goal.deadline && new Date() > goal.deadline) {
    status = 'overdue'
    color = 'text-red-600'
  } else if (progress >= 50) {
    status = 'on-track'
    color = 'text-blue-600'
  } else {
    status = 'behind'
    color = 'text-yellow-600'
  }

  return { progress, status, color, isCompleted }
}

/**
 * Goal Type Icon
 */
function GoalTypeIcon({ type }: { type: GoalType }) {
  const iconMap: Record<GoalType, React.ReactNode> = {
    weight: <TrendingDown className="w-5 h-5" />,
    muscle: <TrendingUp className="w-5 h-5" />,
    fat: <TrendingDown className="w-5 h-5" />,
    score: <Target className="w-5 h-5" />,
    streak: <Calendar className="w-5 h-5" />,
    custom: <Target className="w-5 h-5" />,
  }

  return iconMap[type]
}

/**
 * Goal Card Component
 */
function GoalCard({ goal }: { goal: Goal }) {
  const statusData = calculateGoalStatus(goal)

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        statusData.isCompleted ? 'border-green-300 bg-green-50/30' : ''
      }`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                statusData.isCompleted
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <GoalTypeIcon type={goal.type} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {goal.name}
              </h4>
              <p className="text-xs text-gray-500">
                {goal.currentValue.toFixed(1)} / {goal.targetValue.toFixed(1)}{' '}
                {goal.unit}
              </p>
            </div>
          </div>

          <Badge
            className={`${
              statusData.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : statusData.status === 'overdue'
                  ? 'bg-red-100 text-red-700'
                  : statusData.status === 'on-track'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
            } border-0`}
          >
            {statusData.progress.toFixed(0)}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500 ${
              statusData.isCompleted
                ? 'bg-green-500'
                : statusData.status === 'overdue'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(statusData.progress, 100)}%` }}
          />
        </div>

        {/* Deadline */}
        {goal.deadline && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>마감일</span>
            <span
              className={
                statusData.status === 'overdue' ? 'text-red-600 font-semibold' : ''
              }
            >
              {new Date(goal.deadline).toLocaleDateString('ko-KR')}
            </span>
          </div>
        )}

        {/* Completed Badge */}
        {statusData.isCompleted && (
          <div className="mt-2 p-2 bg-green-100 rounded-md flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">
              목표 달성!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Add Goal Dialog Content
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

  return (
    <div className="space-y-4">
      {/* Goal Type Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          목표 유형
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 'weight' as GoalType, label: '체중', icon: '⚖️' },
            { type: 'muscle' as GoalType, label: '근육', icon: '💪' },
            { type: 'fat' as GoalType, label: '체지방', icon: '🔥' },
            { type: 'score' as GoalType, label: '점수', icon: '🎯' },
            { type: 'streak' as GoalType, label: '스트릭', icon: '🔥' },
            { type: 'custom' as GoalType, label: '직접', icon: '✏️' },
          ].map((option) => (
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
      <Button onClick={handleSubmit} className="w-full">
        목표 추가
      </Button>
    </div>
  )
}

/**
 * Goal Tracker Component
 */
export function GoalTracker({ goals, onGoalAdd }: GoalTrackerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Calculate overall stats
  const completedGoals = goals.filter((g) => calculateGoalStatus(g).isCompleted)
    .length
  const overallProgress =
    goals.length > 0
      ? goals.reduce((acc, g) => acc + calculateGoalStatus(g).progress, 0) /
        goals.length
      : 0

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-['Inter','Noto_Sans_KR',sans-serif]">
            목표 관리
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {completedGoals} / {goals.length} 목표 달성
          </p>
        </div>

        {/* Add Goal Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              목표 추가
            </Button>
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
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">전체 진행률</span>
            <span className="text-lg font-bold text-blue-600">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">설정된 목표가 없습니다</p>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
            첫 목표 설정하기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
            />
          ))}
        </div>
      )}
    </div>
  )
}
