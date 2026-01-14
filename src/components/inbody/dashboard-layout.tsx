/**
 * TAG-FE-001-LAYOUT-001: 대시보드 레이아웃 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 대시보드 공통 레이아웃
 */

'use client'

import React from 'react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">InBody 데이터 관리</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
