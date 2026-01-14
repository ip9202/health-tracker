/**
 * TAG-FE-004-CHART-003: 신체 점수 바 차트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: 시간에 따른 신체 점수를 시각화하는 바 차트
 */

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ScoreDataPoint {
  date: string
  score: number
}

interface ScoreChartProps {
  data: ScoreDataPoint[]
}

export function ScoreChart({ data }: ScoreChartProps) {
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
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: '신체 점수', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="score" name="신체 점수" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
