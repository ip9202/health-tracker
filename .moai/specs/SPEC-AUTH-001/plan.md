# SPEC-AUTH-001: 구현 계획

## TAG BLOCK

```
TAG: SPEC-AUTH-001
생성일: 2025-01-14
상태: Planned
우선순위: High
담당자: TBD
```

## 마일스톤 (우선순위 기반)

### Primary Goal (1순위)

**기본 인증 플로우 구현**
- 데이터베이스 스키마 설정
- NextAuth.js 5.x 기본 설정
- 회원가입 기능 구현
- 로그인 기능 구현
- 로그아웃 기능 구현

### Secondary Goal (2순위)

**UI/UX 개선**
- shadcn/ui 컴포넌트로 폼 디자인
- 실시간 유효성 검사
- 에러 메시지 표시 개선
- 로딩 상태 표시

### Optional Goal (선택 사항)

**고급 기능**
- 이메일 인증 구현
- 비밀번호 재설정 기능
- 소셜 로그인 통합 (Google, GitHub)
- 다중 인증 (MFA)

## 기술 접근 방식

### 1. 데이터베이스 설정

**단계:**
1. Prisma 설치 및 초기화
2. PostgreSQL 연결 설정
3. User, Account, Session 모델 정의
4. 마이그레이션 실행

**파일 구조:**
```
prisma/
├── schema.prisma       # 데이터베이스 스키마 정의
└── migrations/         # 마이그레이션 히스토리
```

**설정 예시:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/health_tracker"
```

### 2. NextAuth.js 5.x 설정

**단계:**
1. NextAuth.js 5.x (beta) 설치
2. auth.ts 라이브러리 생성
3. CredentialsProvider 구성
4. 세션 전략 설정 (JWT)
5. API 라우트 구성

**파일 구조:**
```
src/
├── lib/
│   └── auth.ts         # NextAuth 설정
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts  # NextAuth API 핸들러
```

**설정 예시:**
```typescript
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        // 사용자 인증 로직
      }
    })
  ],
  session: {
    strategy: "jwt"
  }
})
```

### 3. 회원가입 API 구현

**단계:**
1. Zod 스키마 정의
2. API 라우트 생성
3. 비밀번호 해싱
4. 사용자 생성
5. 에러 처리

**파일 구조:**
```
src/
├── app/
│   └── api/
│       └── auth/
│           └── register/
│               └── route.ts  # 회원가입 API
```

**Zod 스키마:**
```typescript
import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("유효한 이메일 형식이 아닙니다"),
  password: z.string()
    .min(8, "비밀번호는 8자 이상이어야 합니다")
    .regex(/[0-9]/, "비밀번호에는 최소 1개의 숫자가 포함되어야 합니다")
    .regex(/[^a-zA-Z0-9]/, "비밀번호에는 최소 1개의 특수문자가 포함되어야 합니다"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"]
})
```

### 4. UI 컴포넌트 구현

**단계:**
1. shadcn/ui Form 컴포넌트 설치
2. 회원가입 폼 컴포넌트 구현
3. 로그인 폼 컴포넌트 구현
4. 폼 유효성 검사 연동

**파일 구조:**
```
src/
├── components/
│   └── auth/
│       ├── RegisterForm.tsx    # 회원가입 폼
│       └── LoginForm.tsx        # 로그인 폼
├── app/
    ├── register/
    │   └── page.tsx             # 회원가입 페이지
    └── login/
        └── page.tsx             # 로그인 페이지
```

**UI 구성 요소:**
- shadcn/ui Form 컴포넌트
- react-hook-form
- zod react-hook-form adapter
- 실시간 유효성 검사
- 에러 메시지 표시

### 5. 보안 구현

**비밀번호 해싱:**
```typescript
import bcrypt from "bcrypt"

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}
```

**CSRF 보호:**
- NextAuth.js 내장 CSRF 토큰 사용
- 모든 폼 제출에 토큰 포함

**세션 보안:**
- HTTP-only 쿠키
- Secure 플래그
- SameSite 설정

## 아키텍처 설계 방향

### 레이어 구조

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (React Components, Next.js Pages)   │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│          API Layer                  │
│     (NextAuth, API Routes)          │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Business Logic Layer        │
│     (Auth Service, User Service)    │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Data Access Layer           │
│          (Prisma ORM)               │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│          Database Layer             │
│         (PostgreSQL)                │
└─────────────────────────────────────┘
```

### 의존성 방향

- UI → API → Service → Repository → Database
- 역방향 의존성 없음
- 계층 간 명확한 경계

## 위험 요소 및 대응 계획

### 기술적 위험

**위험 1: NextAuth.js 5.x beta 안정성**
- **확률**: 중간
- **영향**: 높음
- **대응**: 안정적인 v4로 다운그레이드 준비, 베타 테스트 철저

**위험 2: PostgreSQL 연결 문제**
- **확률**: 낮음
- **영향**: 높음
- **대응**: 연결 풀 설정, 재시도 로직 구현

**위험 3: 비밀번호 해싱 성능**
- **확률**: 낮음
- **영향**: 중간
- **대응**: 비동기 처리, 성능 테스트

### 개발 위험

**위험 4: shadcn/ui 컴포넌트 호환성**
- **확률**: 낮음
- **영향**: 중간
- **대응**: 커스텀 컴포넌트 대체 준비

**위험 5: 타입 안전성**
- **확률**: 중간
- **영향**: 중간
- **대응**: TypeScript 엄격 모드, Zod 스키마 사용

## 구현 순서

### Phase 1: 기반 구축 (1단계)

1. 프로젝트 구조 설정
2. Prisma 설치 및 설정
3. PostgreSQL 스키마 정의
4. 마이그레이션 실행

**완료 조건:**
- Prisma Client 생성 가능
- 데이터베이스 테이블 생성 완료

### Phase 2: 인증 서비스 구현 (2단계)

1. NextAuth.js 5.x 설치
2. auth.ts 라이브러리 구현
3. CredentialsProvider 설정
4. 세션 관리 구현

**완료 조건:**
- NextAuth API 핸들러 정상 동작
- 세션 생성/종료 가능

### Phase 3: 회원가입 기능 (3단계)

1. Zod 스키마 정의
2. 회원가입 API 구현
3. 비밀번호 해싱 구현
4. 사용자 생성 로직

**완료 조건:**
- 유효한 데이터로 회원가입 가능
- 중복 이메일 체크 동작

### Phase 4: 로그인 기능 (4단계)

1. 로그인 API 구현
2. 사용자 인증 로직
3. 세션 생성
4. 에러 처리

**완료 조건:**
- 올바른 자격증명으로 로그인 가능
- 잘못된 자격증명 처리

### Phase 5: UI 구현 (5단계)

1. shadcn/ui Form 컴포넌트 설치
2. 회원가입 폼 구현
3. 로그인 폼 구현
4. 유효성 검사 연동

**완료 조건:**
- 사용자가 UI로 회원가입 가능
- 사용자가 UI로 로그인 가능

### Phase 6: 보안 강화 (6단계)

1. CSRF 보호 확인
2. 세션 보안 설정
3. 입력 검증 강화
4. 보안 테스트

**완료 조건:**
- OWASP 기본 보안 기준 충족
- 취약점 점검 통과

## 품질 기준

### TRUST 5 준수

**Test-first:**
- 테스트 커버리지 85% 이상
- 단위 테스트: 모든 service 함수
- 통합 테스트: API 라우트
- E2E 테스트: 주요 사용자 플로우

**Readable:**
- 명확한 함수/변수 네이밍
- 주요 로직에 주석
- 일관된 코드 스타일

**Unified:**
- ESLint/Prettier 설정
- 일관된 임포트 순서
- 통일된 에러 처리

**Secured:**
- OWASP Top 10 방어
- 비밀번호 평문 저장 금지
- SQL Injection 방지

**Trackable:**
- 구조화된 커밋 메시지
- 명확한 변경 이력

## 라이브러리 버전 권장사항

### 핵심 라이브러리

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "typescript": "^5.9.0",
    "next-auth": "^5.0.0-beta.25",
    "@auth/prisma-adapter": "^2.7.4",
    "@prisma/client": "^6.0.0",
    "bcrypt": "^5.1.1",
    "zod": "^3.23.8",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "@types/bcrypt": "^5.0.2"
  }
}
```

**참고:** 정확한 버전 확인은 `/moai:2-run` 단계에서 수행

---

**버전**: 1.0.0
**최종 업데이트**: 2025-01-14
**다음 단계**: `/moai:2-run SPEC-AUTH-001`
