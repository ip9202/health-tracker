import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { signInSchema } from './validations'
import type { User } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // 1. 입력값 검증
          const validatedFields = signInSchema.safeParse(credentials)

          if (!validatedFields.success) {
            return null
          }

          const { email, password } = validatedFields.data

          // 2. 사용자 조회
          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) {
            return null
          }

          // 3. 비밀번호 검증
          const isPasswordValid = verifyPassword(password, user.password)

          if (!isPasswordValid) {
            return null
          }

          // 4. 성공: 사용자 객체 반환 (비밀번호 제외)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 초기 로그인 시 user 객체가 존재
      if (user) {
        token.id = user.id
        token.email = user.email
      }

      return token
    },
    async session({ session, token }) {
      // 세션에 사용자 정보 추가
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }

      return session
    },
  },
})
