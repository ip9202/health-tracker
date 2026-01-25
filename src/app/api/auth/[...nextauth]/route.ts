/**
 * NextAuth.js API 핸들러
 * SPEC: SPEC-AUTH-001
 * DESCRIPTION: NextAuth.js의 모든 API 요청을 처리하는 라우트 핸들러
 */

import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
