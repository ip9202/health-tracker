/**
 * TAG-FE-001-LAYOUT-001: 대시보드 레이아웃 컴포넌트
 * SPEC: SPEC-FE-004, SPEC-AUTH-001
 * DESCRIPTION: InBody 대시보드 공통 레이아웃 (Figma 디자인 적용 + 인증 UI)
 */

'use client'

import React from 'react'
import { Heart, Bell, LogOut, LogIn } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const handleSignIn = () => {
    window.location.href = '/auth/signin'
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

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

          {/* 사용자 메뉴 - 인증 상태에 따라 다르게 표시 */}
          <div className="flex items-center gap-3">
            {/* 로딩 중이 아닐 때만 UI 표시 */}
            {status !== 'loading' && (
              <>
                {session?.user ? (
                  // 로그인된 상태
                  <>
                    {/* 알림 버튼 */}
                    <button className="size-9 rounded-lg flex items-center justify-center hover:bg-[#f3f4f6] transition-colors">
                      <Bell className="size-4 text-[#0a0a0a]" />
                    </button>

                    {/* 사용자 아바타 또는 이름 */}
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-[#155dfc] flex items-center justify-center">
                        <span className="text-[14px] font-medium leading-5 text-white">
                          {session.user.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      {session.user.name && (
                        <span className="hidden sm:block text-[14px] font-medium leading-5 text-[#101828]">
                          {session.user.name}
                        </span>
                      )}
                    </div>

                    {/* 로그아웃 버튼 */}
                    <button
                      onClick={handleSignOut}
                      className="size-9 rounded-lg flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                      title="로그아웃"
                    >
                      <LogOut className="size-4 text-[#0a0a0a]" />
                    </button>
                  </>
                ) : (
                  // 로그인되지 않은 상태 - 로그인 아이콘 버튼
                  <button
                    onClick={handleSignIn}
                    className="size-9 rounded-lg flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                    title="로그인"
                  >
                    <LogIn className="size-4 text-[#0a0a0a]" />
                  </button>
                )}
              </>
            )}
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
