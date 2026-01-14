/**
 * TAG-FE-001-LAYOUT-001: 대시보드 레이아웃 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 대시보드 공통 레이아웃 (Figma 디자인 적용)
 */

'use client'

import React from 'react'
import { Heart, Bell, User } from 'lucide-react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-[rgba(255,255,255,0.8)] backdrop-blur-sm border-b border-[#e5e7eb] h-16">
        <div className="flex items-center justify-between h-full px-4 max-w-full">
          {/* 브랜드 로고 */}
          <div className="flex items-center gap-2 h-8">
            <div className="bg-[#155dfc] rounded-[10px] size-8 flex items-center justify-center">
              <Heart className="size-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-[18px] font-bold leading-7 tracking-[-0.89px] text-[#101828] font-['Inter',sans-serif]">
              Health Tracker
            </h1>
          </div>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-[14px] font-medium leading-5 text-[#101828] hover:text-[#155dfc] transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-[14px] font-medium leading-5 text-[#6a7282] hover:text-[#155dfc] transition-colors">
              Reports
            </a>
            <a href="#" className="text-[14px] font-medium leading-5 text-[#6a7282] hover:text-[#155dfc] transition-colors">
              Community
            </a>
            <a href="#" className="text-[14px] font-medium leading-5 text-[#6a7282] hover:text-[#155dfc] transition-colors">
              Settings
            </a>
          </nav>

          {/* 사용자 메뉴 */}
          <div className="flex items-center gap-3">
            {/* 알림 버튼 */}
            <button className="size-9 rounded-lg flex items-center justify-center hover:bg-[#f3f4f6] transition-colors">
              <Bell className="size-4 text-[#0a0a0a]" />
            </button>

            {/* 사용자 아바타 */}
            <div className="size-8 rounded-full bg-[#ececf0] flex items-center justify-center">
              <span className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
                U
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
