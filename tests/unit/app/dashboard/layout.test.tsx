/**
 * TAG-FE-001-LAYOUT-001: 대시보드 레이아웃 구조 테스트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 대시보드 페이지 레이아웃 검증
 */

import { describe, it, expect } from 'vitest'
import React from 'react'

// 파일 존재 여부를 검증하기 위한 import
// 파일이 없으면 테스트 실행 전에 import 에러 발생
import InBodyPage from '@/app/inbody/page'
import { DashboardLayout } from '@/components/inbody/dashboard-layout'
import { InBodyDashboard } from '@/components/inbody/inbody-dashboard'

describe('대시보드 레이아웃 구조', () => {
  it('대시보드 페이지 파일이 존재해야 함', () => {
    expect(InBodyPage).toBeDefined()
  })

  it('대시보드 레이아웃 컴포넌트를 가져올 수 있어야 함', () => {
    expect(DashboardLayout).toBeDefined()
    expect(typeof DashboardLayout).toBe('function')
  })

  it('대시보드 메인 컴포넌트를 가져올 수 있어야 함', () => {
    expect(InBodyDashboard).toBeDefined()
    expect(typeof InBodyDashboard).toBe('function')
  })
})
