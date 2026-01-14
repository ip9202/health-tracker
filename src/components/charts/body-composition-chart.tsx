/**
 * TAG-FE-004-CHART-002: 체성분 멀티 라인 차트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: 체지방률, 근육량, 골격근량을 시각화하는 멀티 라인 차트
 */

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BodyCompositionDataPoint {
  date: string
  bodyFatPercentage: number
  muscle: number
  skeletalMuscle: number
}

interface BodyCompositionChartProps {
  data: BodyCompositionDataPoint[]
}

export function BodyCompositionChart({ data }: BodyCompositionChartProps) {
  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        <p>데이터가 없습니다</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="bodyFatPercentage"
          name="체지방률 (%)"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="muscle"
          name="근육량 (kg)"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="skeletalMuscle"
          name="골격근 (kg)"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
