import { NextRequest, NextResponse } from 'next/server'
import { signInSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'

/**
 * POST /api/auth/signin
 * 사용자 로그인 API 엔드포인트
 * TAG-TASK-006: 로그인 API 엔드포인트 구현
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 본문 파싱
    const body = await request.json()

    // 2. 입력값 검증
    const validatedFields = signInSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 입력값입니다.'
        },
        { status: 400 }
      )
    }

    const { email, password } = validatedFields.data

    // 3. 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        },
        { status: 401 }
      )
    }

    // 4. 비밀번호 검증 (비동기)
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        },
        { status: 401 }
      )
    }

    // 5. 성공 응답 (비밀번호 제외)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      },
      { status: 200 }
    )
  } catch (error) {
    // JSON 파싱 오류 처리
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 요청 형식입니다.'
        },
        { status: 400 }
      )
    }

    // 기타 오류 처리
    console.error('Signin error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}
