/**
 * TAG-FE-004-CHART-001: 체중 추이 라인 차트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: 시간에 따른 체중 변화를 시각화하는 라인 차트
 */

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ChartDataPoint } from '@/lib/types/inbody'

interface WeightChartProps {
  data: ChartDataPoint[]
}

export function WeightChart({ data }: WeightChartProps) {
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
        <YAxis label={{ value: '체중 (kg)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          name="체중 (kg)"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
