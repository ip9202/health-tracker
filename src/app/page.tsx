/**
 * TAG-FE-001-PAGE-001: 메인 페이지 (InBody 대시보드)
 * SPEC: SPEC-FE-006 (Complete Redesign)
 * DESCRIPTION: 메인 페이지를 InBody 데이터 관리 대시보드로 설정
 */

import { DashboardLayout } from '@/components/inbody/dashboard-layout'
import { InBodyDashboard } from '@/components/inbody/inbody-dashboard'

export default function HomePage() {
  return (
    <DashboardLayout>
      <InBodyDashboard />
    </DashboardLayout>
  )
}
