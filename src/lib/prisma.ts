import { PrismaClient } from '@prisma/client'

/**
 * Prisma 클라이언트 싱글톤 인스턴스
 * 개발 환경에서 핫 리로딩 시 여러 인스턴스 생성을 방지하기 위해 전역 변수에 캐싱
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma 클라이언트 인스턴스
 * 전역 범위에서 재사용 가능한 싱글톤 인스턴스를 반환
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

/**
 * 개발 환경에서 전역 변수에 Prisma 인스턴스를 캐싱
 * 핫 리로딩 시 데이터베이스 연결이 중복되는 것을 방지
 */
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
