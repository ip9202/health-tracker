/**
 * 루트 레이아웃 컴포넌트
 * 애플리케이션의 최상위 레이아웃을 정의하고 QueryClient를 제공
 */
import type { Metadata } from 'next'
import './globals.css'
import { QueryClientProvider } from '@/components/providers/query-provider'

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata = {
  title: 'Health Tracker',
  description: 'InBody 체성분 데이터 관리 대시보드',
}

/**
 * 루트 레이아웃 컴포넌트
 * @param children - 자식 컴포넌트
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <QueryClientProvider>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  )
}
