/**
 * TAG-FE-004-CHART-005: 차트 컨테이너 (탭, 로딩, 빈 상태)
 * SPEC: SPEC-FE-004
 * DESCRIPTION: 차트 탭 전환, 로딩 상태, 빈 상태를 관리하는 컨테이너
 */

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartContainerProps {
  children: React.ReactNode
  loading?: boolean
  hasData?: boolean
}

export function ChartContainer({ children, loading = false, hasData = true }: ChartContainerProps) {
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>체성분 분석</CardTitle>
          <CardDescription>시간에 따른 체성분 변화 추이</CardDescription>
        </CardHeader>
        <CardContent>
          <div data-testid="chart-skeleton" className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>체성분 분석</CardTitle>
          <CardDescription>시간에 따른 체성분 변화 추이</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>표시할 데이터가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>체성분 분석</CardTitle>
        <CardDescription>시간에 따른 체성분 변화 추이</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weight" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weight">체중</TabsTrigger>
            <TabsTrigger value="composition">체성분</TabsTrigger>
            <TabsTrigger value="score">점수</TabsTrigger>
            <TabsTrigger value="bmi">BMI</TabsTrigger>
          </TabsList>
          <TabsContent value="weight" className="mt-6">
            {children}
          </TabsContent>
          <TabsContent value="composition" className="mt-6">
            {children}
          </TabsContent>
          <TabsContent value="score" className="mt-6">
            {children}
          </TabsContent>
          <TabsContent value="bmi" className="mt-6">
            {children}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
