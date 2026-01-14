import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💚</span>
            <h1 className="text-xl font-bold">Health Tracker</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>회원가입</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            건강 데이터를 한 곳에서
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            InBody 체성분 데이터를 쉽게 관리하고 시각화하세요
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/inbody">
              <Button size="lg" className="text-lg">
                대시보드 시작하기
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="text-lg">
                회원가입
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📸</span>
                이미지 업로드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                InBody 결과지 이미지를 쉽게 업로드하세요.
                드래그 앤 드롭으로 간편하게 이미지를 전송할 수 있습니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                데이터 시각화
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                체중, 체지방율, BMI, 신체 점수를 아름다운 차트로
                한눈에 확인하세요. 시간에 따른 변화 추이를 쉽게 파악할 수 있습니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                기록 관리
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                모든 측정 기록을 한 곳에서 관리하세요.
                날짜별로 필터링하고, 페이지네이션으로 편하게 탐색할 수 있습니다.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2 font-semibold">기술 스택</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span>Next.js 16</span>
            <span>•</span>
            <span>React 19</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>TanStack Query</span>
            <span>•</span>
            <span>Recharts</span>
            <span>•</span>
            <span>shadcn/ui</span>
            <span>•</span>
            <span>Prisma</span>
            <span>•</span>
            <span>Supabase</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; 2026 Health Tracker. All rights reserved.</p>
      </footer>
    </div>
  )
}
