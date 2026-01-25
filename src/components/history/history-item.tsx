/**
 * TAG-FE-005-HISTORY-002: 기록 아이템 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: 단일 InBody 측정 기록 카드
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { InBodyRecord } from '@/lib/types/inbody'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface HistoryItemProps {
  record: InBodyRecord
}

export function HistoryItem({ record }: HistoryItemProps) {
  return (
    <Card data-testid="history-item">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {format(new Date(record.measuredAt), 'yyyy년 MM월 dd일', { locale: ko })}
        </CardTitle>
        <Badge variant="secondary">{record.bodyScore || 'N/A'}점</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">체중: </span>
            <span className="font-medium">{record.weight || '-'} kg</span>
          </div>
          <div>
            <span className="text-muted-foreground">체지방률: </span>
            <span className="font-medium">{record.bodyFatPercentage || '-'} %</span>
          </div>
          <div>
            <span className="text-muted-foreground">근육량: </span>
            <span className="font-medium">{record.muscle || '-'} kg</span>
          </div>
          <div>
            <span className="text-muted-foreground">BMI: </span>
            <span className="font-medium">{record.bmi || '-'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
