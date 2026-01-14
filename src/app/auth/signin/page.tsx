import Link from 'next/link'
import SignInForm from '@/components/auth/signin-form'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">💚</span>
            <h1 className="text-2xl font-bold">Health Tracker</h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">로그인</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            건강 데이터 관리에 오신 것을 환영합니다
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
          <SignInForm />
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
