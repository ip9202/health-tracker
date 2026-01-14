import { z } from 'zod'

/**
 * Zod 스키마 유효성 검증
 * TAG-TASK-003: Zod 스키마 유효성 검증 구현
 */

/**
 * 회원가입 입력 타입
 */
export type SignUpInput = z.infer<typeof signUpSchema>

/**
 * 로그인 입력 타입
 */
export type SignInInput = z.infer<typeof signInSchema>

/**
 * 비밀번호 복잡성 검증:
* - 최소 8자
 * - 최소 1개 대문자
 * - 최소 1개 소문자
 * - 최소 1개 숫자
 * - 최소 1개 특수문자
 */
const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/[A-Z]/, '비밀번호는 최소 1개 대문자를 포함해야 합니다')
  .regex(/[a-z]/, '비밀번호는 최소 1개 소문자를 포함해야 합니다')
  .regex(/[0-9]/, '비밀번호는 최소 1개 숫자를 포함해야 합니다')
  .regex(/[^A-Za-z0-9]/, '비밀번호는 최소 1개 특수문자를 포함해야 합니다')

/**
 * 이메일 형식 검증 (앞뒤 공백 자동 제거)
 */
const emailSchema = z.string().trim().email('유효한 이메일 주소를 입력해주세요')

/**
 * 회원가입 스키마
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().optional()
})

/**
 * 로그인 스키마
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요')
})
