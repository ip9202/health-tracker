import type { Metadata } from 'next'
import './globals.css'
import { QueryClientProvider } from '@/components/providers/query-provider'

export const metadata: Metadata = {
  title: 'Health Tracker',
  description: 'InBody 체성분 데이터 관리 대시보드',
}

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
