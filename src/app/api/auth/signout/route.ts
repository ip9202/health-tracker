import { NextResponse } from 'next/server'

/**
 * POST /api/auth/signout
 * 로그아웃 API 엔드포인트
 * TAG-TASK-007: 로그아웃 API 엔드포인트 구현
 */
export async function POST() {
  // 로그아웃 성공 응답
  // 실제 세션 무효화는 클라이언트에서 NextAuth signOut 함수 호출로 처리
  return NextResponse.json(
    {
      success: true,
      message: '성공적으로 로그아웃되었습니다.'
    },
    { status: 200 }
  )
}
