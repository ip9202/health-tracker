import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * 비밀번호를 해싱합니다.
 * @param password - 평문 비밀번호
 * @returns 해싱된 비밀번호
 * @throws Error - 비밀번호가 null 또는 undefined인 경우
 */
export function hashPassword(password: string): string {
  if (password === null || password === undefined) {
    throw new Error('Password is required')
  }

  return bcrypt.hashSync(password, SALT_ROUNDS)
}

/**
 * 비밀번호를 검증합니다.
 * @param password - 평문 비밀번호
 * @param hashedPassword - 해싱된 비밀번호
 * @returns 비밀번호가 일치하면 true, 아니면 false
 * @throws Error - 비밀번호 또는 해싱된 비밀번호가 null 또는 undefined인 경우
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  if (password === null || password === undefined) {
    throw new Error('Password is required')
  }

  if (hashedPassword === null || hashedPassword === undefined) {
    throw new Error('Hashed password is required')
  }

  return bcrypt.compareSync(password, hashedPassword)
}
