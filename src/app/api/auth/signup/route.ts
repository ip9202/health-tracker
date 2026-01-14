import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { signUpSchema } from '@/lib/validations'
import { hashPassword } from '@/lib/password'

/**
 * Prisma Client 싱글톤 인스턴스
 */
const getPrismaClient = () => {
  return new PrismaClient()
}

/**
 * POST /api/auth/signup
 * 회원가입 API 엔드포인트
 * TAG-TASK-004: 회원가입 API 엔드포인트 구현
 */
export async function POST(request: NextRequest) {
  const prisma = getPrismaClient()

  try {
    // 요청 바디 파싱
    const body = await request.json()

    // Zod 스키마로 유효성 검증
    const validationResult = signUpSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '입력 데이터가 유효하지 않습니다',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validationResult.data

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: '이미 존재하는 이메일입니다'
        },
        { status: 409 }
      )
    }

    // 비밀번호 해싱 (비동기)
    const hashedPassword = await hashPassword(password)

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다',
        user: newUser
      },
      { status: 201 }
    )
  } catch (error) {
    // JSON 파싱 오류 처리
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 요청 형식입니다'
        },
        { status: 400 }
      )
    }

    // 기타 오류 처리
    console.error('Signup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다'
      },
      { status: 500 }
    )
  }
}

