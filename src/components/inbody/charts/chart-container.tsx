'use client'

/**
 * TAG-FE-002-CHRT-001: ChartContainer 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 데이터 차트 컨테이너 (실제 API 데이터 연동)
 */

import { useEffect, useState } from 'react'
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
import { fetchInBodyTrend } from '@/lib/api/inbody-api'

interface TrendDataPoint {
  date: string
  weight?: number | null
  skeletalMuscle?: number | null
  bodyFatPercentage?: number | null
}

export function ChartContainer() {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'6months' | '1year' | 'all'>('6months')

  useEffect(() => {
    const loadTrendData = async () => {
      try {
        setIsLoading(true)
        
        const now = new Date()
        let from: Date | undefined

        if (period === '6months') {
          from = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        } else if (period === '1year') {
          from = new Date(now.getFullYear() - 1, now.getMonth(), 1)
        }

        const response = await fetchInBodyTrend({
          from,
          metrics: ['weight', 'skeletalMuscle', 'bodyFatPercentage'],
        })

        if (response.success) {
          const transformedData = response.data.trend.map(item => ({
            date: formatMonth(item.date),
            weight: item.weight ?? undefined,
            muscleMass: item.skeletalMuscle ?? undefined,
            bodyFat: item.bodyFatPercentage ?? undefined,
          }))
          setTrendData(transformedData)
        }
      } catch (error) {
        console.error('Failed to load trend data:', error)
        setTrendData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTrendData()
  }, [period])

  const formatMonth = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { month: 'short' })
  }

  const latestData = trendData.length > 0 ? trendData[trendData.length - 1] : null

  return (
    <div className='flex flex-col gap-6 flex-1 min-h-0'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h3 className='text-[18px] font-semibold leading-7 tracking-[-0.44px] text-[#101828]'>
            Body Composition Trend
          </h3>
          <p className='text-[14px] font-normal leading-5 tracking-[-0.15px] text-[#6a7282]'>
            {isLoading ? 'Loading...' : `${trendData.length} records`}
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className='bg-[#f3f3f5] border-0 rounded-lg h-9 px-3 flex items-center justify-between gap-2 hover:bg-[#e5e5e7] transition-colors cursor-pointer'
        >
          <option value='6months'>6 Months</option>
          <option value='1year'>1 Year</option>
          <option value='all'>All Time</option>
        </select>
      </div>

      <div className='flex flex-col gap-6 flex-1'>
        <div className='grid grid-cols-3 gap-4 h-[68px]'>
          <div className='bg-[#eff6ff] rounded-[10px] px-3 pt-3 flex flex-col gap-0'>
            <p className='text-[12px] font-medium leading-4 text-[#155dfc]'>Weight</p>
            <div className='flex items-baseline gap-1'>
              <p className='text-[20px] font-bold leading-7 tracking-[-0.45px] text-[#1447e6]'>
                {latestData?.weight ? latestData.weight.toFixed(1) : '--'}
              </p>
              <p className='text-[14px] font-normal leading-5 text-[#1447e6]'>kg</p>
            </div>
          </div>

          <div className='bg-[#ecfdf5] rounded-[10px] px-3 pt-3 flex flex-col gap-0'>
            <p className='text-[12px] font-medium leading-4 text-[#10b981]'>Muscle Mass</p>
            <div className='flex items-baseline gap-1'>
              <p className='text-[20px] font-bold leading-7 tracking-[-0.45px] text-[#007a55]'>
                {latestData?.skeletalMuscle ? latestData.skeletalMuscle.toFixed(1) : '--'}
              </p>
              <p className='text-[14px] font-normal leading-5 text-[#007a55]'>kg</p>
            </div>
          </div>

          <div className='bg-[#fef2f2] rounded-[10px] px-3 pt-3 flex flex-col gap-0'>
            <p className='text-[12px] font-medium leading-4 text-[#dc2626]'>Body Fat %</p>
            <div className='flex items-baseline gap-1'>
              <p className='text-[20px] font-bold leading-7 tracking-[-0.45px] text-[#b91c1c]'>
                {latestData?.bodyFatPercentage ? latestData.bodyFatPercentage.toFixed(1) : '--'}
              </p>
              <p className='text-[14px] font-normal leading-5 text-[#b91c1c]'>%</p>
            </div>
          </div>
        </div>

        <div className='h-[250px]'>
          {isLoading ? (
            <div className='h-full flex items-center justify-center text-[#6a7282]'>
              Loading chart data...
            </div>
          ) : trendData.length === 0 ? (
            <div className='h-full flex items-center justify-center text-[#6a7282]'>
              No data available. Upload an InBody result to see trends.
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' vertical={false} />
                <XAxis
                  dataKey='date'
                  className='text-[12px]'
                  stroke='#9ca3af'
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  className='text-[12px]'
                  stroke='#9ca3af'
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
                  formatter={(value: unknown, name: unknown): [string, string] => {
                    const v = typeof value === 'number' ? value.toFixed(1) : '--'
                    if (name === 'Weight (kg)') return [v, 'Weight']
                    if (name === 'Muscle (kg)') return [v, 'Muscle']
                    if (name === 'Body Fat (%)') return [v, 'Body Fat %']
                    return [v, String(name ?? '')]
                  }}
                />
                <Legend
                  verticalAlign='top'
                  align='center'
                  height={24}
                  iconType='circle'
                  wrapperStyle={{
                    paddingTop: '0',
                    paddingBottom: '8px',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='weight'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  name='Weight (kg)'
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
                <Line
                  type='monotone'
                  dataKey='muscleMass'
                  stroke='#10b981'
                  strokeWidth={2}
                  name='Muscle (kg)'
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
                <Line
                  type='monotone'
                  dataKey='bodyFat'
                  stroke='#ef4444'
                  strokeWidth={2}
                  name='Body Fat (%)'
                  dot={{ r: 4, fill: '#ef4444' }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
