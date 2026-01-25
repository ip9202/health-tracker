/**
 * 루트 레이아웃 컴포넌트
 * 애플리케이션의 최상위 레이아웃을 정의하고 QueryClient, Session을 제공
 * SPEC: SPEC-AUTH-001, SPEC-FE-006 (InBody Design System)
 */
import type { Metadata } from 'next'
import { Inter, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { QueryClientProvider } from '@/components/providers/query-provider'
import { SessionProvider } from '@/components/providers/session-provider'

/**
 * InBody Design System 폰트 설정
 * - Inter: 한국어 최적화 폰트 (제목, 본문)
 * - Roboto Mono: 데이터 강조 폰트 (숫자)
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

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
    <html lang="ko" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <QueryClientProvider>
            {children}
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
