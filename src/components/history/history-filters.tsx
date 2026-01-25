/**
 * TAG-FE-005-HISTORY-004: 기록 필터 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: 날짜 범위 필터링
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

interface HistoryFiltersProps {
  onFilterChange: (filters: { from?: string; to?: string }) => void
}

export function HistoryFilters({ onFilterChange }: HistoryFiltersProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)

  const handleApplyFilters = () => {
    onFilterChange({
      from: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
      to: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
    })
  }

  return (
    <div data-testid="history-filters" className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, 'yyyy-MM-dd') : '시작일'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={setFromDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground">~</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, 'yyyy-MM-dd') : '종료일'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={setToDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleApplyFilters} variant="default">
          필터 적용
        </Button>
      </div>
    </div>
  )
}
