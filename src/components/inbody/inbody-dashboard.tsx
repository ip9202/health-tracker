/**
 * TAG-FE-001-DASH-001: InBody 대시보드 메인 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 데이터 관리 대시보드 메인 컴포넌트 (Figma 디자인 적용)
 */

'use client'

import React from 'react'
import { UploadSection } from './upload/upload-section'
import { ChartContainer } from './charts/chart-container'
import { HistoryList } from './history/history-list'

export function InBodyDashboard() {
  return (
    <div className="w-full bg-[#f9fafb]">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-0 pt-8 pb-2 px-4">
        <div className="h-9">
          <h1 className="text-[30px] font-bold leading-9 tracking-[-0.35px] text-[#101828] font-['Inter',sans-serif]">
            InBody Dashboard
          </h1>
        </div>
        <div className="h-7">
          <p className="text-[18px] font-normal leading-7 tracking-[-0.44px] text-[#6a7282] font-['Inter',sans-serif]">
            Manage and visualize your body composition data.
          </p>
        </div>
      </div>

      {/* 대시보드 컨텐츠 영역 */}
      <div className="grid gap-0 md:grid-cols-[736px_1fr] auto-rows-max">
        {/* 업로드 섹션 */}
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
          <UploadSection />
        </div>

        {/* 차트 섹션 */}
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-6">
          <ChartContainer />
        </div>

        {/* 기록 관리 섹션 - 전체 너비 */}
        <div className="md:col-span-2 bg-white border border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-6">
          <HistoryList />
        </div>
      </div>
    </div>
  )
}
