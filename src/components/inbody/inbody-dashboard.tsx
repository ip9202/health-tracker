/**
 * TAG-FE-001-DASH-001: InBody 대시보드 메인 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 데이터 관리 대시보드 메인 컴포넌트
 */

'use client'

import React from 'react'

export function InBodyDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">InBody 대시보드</h2>
        <p className="text-muted-foreground">
          체성분 데이터를 관리하고 시각화합니다.
        </p>
      </div>

      {/* 대시보드 컨텐츠 영역 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 업로드 섹션 */}
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">이미지 업로드</h3>
          <p className="text-sm text-muted-foreground">
            InBody 이미지를 업로드하여 데이터를 자동으로 추출합니다.
          </p>
        </div>

        {/* 차트 섹션 */}
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">데이터 시각화</h3>
          <p className="text-sm text-muted-foreground">
            체성분 데이터의 변화 추이를 차트로 확인합니다.
          </p>
        </div>

        {/* 기록 관리 섹션 */}
        <div className="rounded-lg border p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">측정 기록</h3>
          <p className="text-sm text-muted-foreground">
            과거 측정 기록을 조회하고 관리합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
