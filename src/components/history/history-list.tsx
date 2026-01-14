/**
 * TAG-FE-005-HISTORY-001: 기록 리스트 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 측정 기록 리스트, 로딩, 페이지네이션, 필터링
 */

import React from 'react'
import { HistoryItem } from './history-item'
import { Pagination } from './pagination'
import { HistoryFilters } from './history-filters'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { InBodyRecord } from '@/lib/types/inbody'

interface HistoryListProps {
  records: InBodyRecord[]
  loading?: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onFilterChange?: (filters: { from?: string; to?: string }) => void
}

export function HistoryList({
  records,
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onFilterChange,
}: HistoryListProps) {
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div data-testid="history-skeleton" className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[100px] w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!records || records.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-[300px] items-center justify-center p-6">
          <p className="text-muted-foreground">기록이 없습니다</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {onFilterChange && <HistoryFilters onFilterChange={onFilterChange} />}

      {/* Records List */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {records.map((record) => (
              <HistoryItem key={record.id} record={record} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
