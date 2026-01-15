/**
 * 회원가입 페이지 컴포넌트
 * 신규 사용자 회원가입을 위한 페이지
 */
import Link from 'next/link'
import SignUpForm from '@/components/auth/signup-form'

/**
 * 회원가입 페이지 컴포넌트
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">💚</span>
            <h1 className="text-2xl font-bold">Health Tracker</h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">회원가입</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            건강 데이터 관리를 시작하세요
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
          <SignUpForm />
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          가입하시면{' '}
          <Link href="/terms" className="underline hover:text-gray-900 dark:hover:text-gray-300">
            이용약관
          </Link>
          {' '}및{' '}
          <Link href="/privacy" className="underline hover:text-gray-900 dark:hover:text-gray-300">
            개인정보처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}
