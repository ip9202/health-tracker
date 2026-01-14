/**
 * TAG-FE-001-PAGE-001: InBody 대시보드 페이지
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 데이터 관리 대시보드 메인 페이지
 */

import { DashboardLayout } from '@/components/inbody/dashboard-layout'
import { InBodyDashboard } from '@/components/inbody/inbody-dashboard'

export default function InBodyPage() {
  return (
    <DashboardLayout>
      <InBodyDashboard />
    </DashboardLayout>
  )
}
