/**
 * TAG-FE-002-CHRT-001: ChartContainer 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 데이터 차트 컨테이너 (Figma 디자인 적용)
 */

'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// 샘플 데이터
const sampleData = [
  { date: 'Jan', weight: 72.5, muscleMass: 33.0, bodyFat: 18.5 },
  { date: 'Feb', weight: 71.8, muscleMass: 33.2, bodyFat: 17.8 },
  { date: 'Mar', weight: 71.2, muscleMass: 33.5, bodyFat: 17.2 },
  { date: 'Apr', weight: 70.5, muscleMass: 33.8, bodyFat: 16.8 },
  { date: 'May', weight: 70.0, muscleMass: 34.0, bodyFat: 16.2 },
  { date: 'Jun', weight: 69.5, muscleMass: 34.2, bodyFat: 15.8 },
]

export function ChartContainer() {
  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.44px] text-[#101828] font-['Inter',sans-serif]">
            Body Composition Trend
          </h3>
          <p className="text-[14px] font-normal leading-5 tracking-[-0.15px] text-[#6a7282]">
            Recent 6 months changes
          </p>
        </div>

        {/* 기간 선택 버튼 */}
        <button className="bg-[#f3f3f5] border-0 rounded-lg h-9 px-3 flex items-center justify-between gap-2 hover:bg-[#e5e5e7] transition-colors">
          <span className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
            6 Months
          </span>
          <ChevronDown className="size-4 text-[#0a0a0a]" />
        </button>
      </div>

      {/* 카드 컨텐츠 */}
      <div className="flex flex-col gap-6 flex-1">
        {/* 요약 카드 3개 */}
        <div className="grid grid-cols-3 gap-4 h-[68px]">
          {/* 체중 */}
          <div className="bg-[#eff6ff] rounded-[10px] px-3 pt-3 flex flex-col gap-0">
            <p className="text-[12px] font-medium leading-4 text-[#155dfc]">
              Weight
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-[20px] font-bold leading-7 tracking-[-0.45px] text-[#1447e6]">
                69.5
              </p>
              <p className="text-[14px] font-normal leading-5 text-[#1447e6]">
                kg
              </p>
            </div>
          </div>

          {/* 근육량 */}
          <div className="bg-[#ecfdf5] rounded-[10px] px-3 pt-3 flex flex-col gap-0">
            <p className="text-[12px] font-medium leading-4 text-[#10b981]">
              Muscle Mass
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-[20px] font-bold leading-7 tracking-[-0.45px] text-[#007a55]">
                34.2
              </p>
              <p className="text-[14px] font-normal leading-5 text-[#007a55]">
                kg
              </p>
            </div>
          </div>

          {/* 체지방률 */}
          <div className="bg-[#fef2f2] rounded-[10px] px-3 pt-3 flex flex-col gap-0">
            <p className="text-[12px] font-medium leading-4 text-[#dc2626]">
              Body Fat %
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-[20px] font-bold leading-7 tracking-[-0.45px] text-[#b91c1c]">
                15.8
              </p>
              <p className="text-[14px] font-normal leading-5 text-[#b91c1c]">
                %
              </p>
            </div>
          </div>
        </div>

        {/* 라인 차트 */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                className="text-[12px]"
                stroke="#9ca3af"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-[12px]"
                stroke="#9ca3af"
                axisLine={false}
                tickLine={false}
                domain={[0, 80]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{
                  color: '#101828',
                  fontSize: '14px',
                }}
              />
              <Legend
                verticalAlign="top"
                align="center"
                height={24}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '0',
                  paddingBottom: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Weight (kg)"
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="muscleMass"
                stroke="#10b981"
                strokeWidth={2}
                name="Muscle (kg)"
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="bodyFat"
                stroke="#ef4444"
                strokeWidth={2}
                name="Body Fat (%)"
                dot={{ r: 4, fill: '#ef4444' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
