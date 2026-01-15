# 기술 스택

## 개요

VIBE Health는 Next.js 16 App Router와 React 19를 기반으로 하는 풀스택 웹 애플리케이션입니다. TypeScript를 사용하여 타입 안전성을 보장하고, Prisma ORM으로 데이터베이스를 관리합니다.

## 핵심 기술 스택

### 프론트엔드

#### Next.js 16.0.0 (App Router)

**선택 사유**

- App Router로 최신 React Server Components 지원
- 파일 시스템 기반 라우팅으로 직관적인 구조
- API Routes로 통합된 백엔드 개발
- 강력한 SEO 및 성능 최적화
- Vercel과의 완벽한 통합

**주요 기능**

- React Server Components (RSC)
- Streaming SSR
- Parallel Routes
- Route Groups
- Middleware

#### React 19.0.0

**선택 사유**

- 최신 React 기능 활용
- Server Components 완벽 지원
- 향상된 성능 및 개발자 경험
- Concurrent Features

#### TanStack Query (React Query) 5.90.17

**선택 사유**

- 강력한 서버 상태 관리
- 자동 캐싱 및 재검증
- optimistic updates 지원
- 무한 스크롤, 페이지네이션 지원

**주요 기능**

- useQuery: 데이터 조회
- useMutation: 데이터 수정
- QueryClient: 캐시 관리
- DevTools: 디버깅 도구

#### Recharts 3.6.0

**선택 사유**

- React 친화적 차트 라이브러리
- 선언적 컴포넌트 기반
- 반응형 디자인 지원
- 커스터마이징 용이

**지원 차트**

- Line Chart: 체중, BMI 추이
- Bar Chart: 기간별 비교
- Area Chart: 체지방율 변화
- Pie Chart: 체성분 구성

#### react-dropzone 14.3.8

**선택 사유**

- Drag & Drop 파일 업로드
- 파일 크기/형식 검증
- 진행률 표시 지원
- 접근성 고려

#### react-hook-form 7.71.1

**선택 사유**

- 성능 최적화된 폼 관리
- 최소 리렌더링
- Zod와의 통합
- 사용하기 쉬운 API

#### shadcn/ui

**선택 사유**

- 접근성 고려된 컴포넌트
- 완전한 커스터마이징 가능
- Radix UI 기반
- Tailwind CSS 통합

**제공 컴포넌트**

- Button, Input, Card
- Dialog, Dropdown
- Form, Label
- Table, Pagination

### 백엔드

#### Next.js API Routes

**선택 사유**

- 프론트엔드와 통합된 API 개발
- Edge Runtime 지원
- 미들웨어 보안
- Server Actions로 대체 가능

#### Prisma ORM 6.0.0

**선택 사유**

- 타입 안전한 데이터베이스 액세스
- 마이그레이션 자동 생성
- 직관적인 Schema 정의
- 다양한 데이터베이스 지원

**주요 기능**

- Prisma Client: 타입 안전 쿼리 빌더
- Prisma Migrate: 스키마 마이그레이션
- Prisma Studio: 데이터베이스 GUI

#### PostgreSQL

**선택 사유**

- 강력한 관계형 데이터베이스
- ACID 트랜잭션 지원
- JSON 데이터 타입 지원
- 확장성 및 안정성

#### NextAuth.js 5 (beta.25)

**선택 사유**

- Next.js 전용 인증 솔루션
- JWT Strategy 지원
- Prisma Adapter 통합
- 보안 처리 자동화

**주요 기능**

- Credentials Provider (이메일/비밀번호)
- JWT 세션 관리
- 보안 라우트 보호
- CSRF 보호

#### Tesseract.js 7.0.0

**선택 사유**

- 클라이언트 측 OCR 처리
- 서버 의존성 제거
- InBody 결과지 텍스트 추출
- 브라우저에서 직접 실행

**주요 기능**

- 한국어/영어 언어 지원
- 이미지 전처리
- 진행률 이벤트
- Worker 기반 비동기 처리

### 데이터 검증

#### Zod 3.25.76

**선택 사유**

- TypeScript 친화적 스키마 정의
- 런타임 타입 검증
- API 요청/응답 검증
- 에러 메시지 자동 생성

**주요 사용처**

- InBody 데이터 스키마
- 회원가입 입력 검증
- API 파라미터 검증
- 폼 데이터 검증

### 보안

#### bcryptjs 2.4.3

**선택 사유**

- 안전한 비밀번호 해싱
- salt rounds 조절 가능
- 타이밍 어택 방지

**설정**

- salt rounds: 10
- 평문 비밀번호 미저장

### 테스트

#### Vitest 2.1.0

**선택 사유**

- Vite 기반 빠른 테스트
- Jest 호환 API
- TypeScript 기본 지원
- Watch 모드

#### @testing-library/react 16.0.0

**선택 사유**

- React 컴포넌트 테스트
- 사용자 중심 테스트
- 접근성 테스트 지원

#### happy-dom 15.0.0

**선택 사유**

- 가벼운 DOM 구현
- JSDOM 대안
- 빠른 테스트 실행

### 스타일링

#### Tailwind CSS

**선택 사유**

- 유틸리티 퍼스트 CSS
- 반응형 디자인 쉬움
- 다크 모드 지원
- 커스텀 테마

**주요 기능**

- JIT 컴파일러
- 다크 모드 전략
- 커스텀 색상 팔레트
- 반응형 유틸리티

## 개발 환경 요구사항

### 필수 구성 요소

#### Node.js 20+

- Next.js 16 최신 기능 지원
- ES Modules 지원
- Stable N-API

#### npm 10+ 또는 pnpm 8+

- 패키지 관리
- 의존성 설치
- 스크립트 실행

#### PostgreSQL 14+

- 데이터베이스 서버
- 로컬 개발용 Docker 추천

### 선택적 구성 요소

#### Docker

- PostgreSQL 컨테이이너 실행
- 일관된 개발 환경
- 배포 시 컨테이너화

#### Git

- 버전 관리
- 협업 및 배포

### 개발 도구

#### TypeScript 5.9.0

- 정적 타입 검사
- IDE 자동완성
- 리팩토링 지원

#### ESLint + Prettier

- 코드 스타일 통일
- 자동 포맷팅
- 린팅 규칙

#### VS Code 추천 확장

- Prisma
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer

## 배포 환경

### 추천 플랫폼

#### Vercel (프론트엔드)

- Next.js 개발사 플랫폼
- Zero-config 배포
- 자동 HTTPS
- Edge Network 지원

#### Railway / Supabase (PostgreSQL)

- 관리형 PostgreSQL
- 자동 백업
- 확장성

### 환경 변수

```bash
# 데이터베이스
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# OAuth (선택)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 성능 최적화 전략

### 프론트엔드

- React Server Components로 JS 번들 감소
- Image 최적화 (next/image)
- 동적 import로 코드 분할
- TanStack Query 캐싱

### 백엔드

- Prisma 쿼리 최적화
- API 캐싱 전략
- 데이터베이스 인덱싱
- Connection pooling

### 빌드

- Turbopack (선택)
- 정적 생성 (ISR)
- Edge Runtime 활용

## 보안 고려사항

### 인증

- JWT 세션 (30일 유크)
- bcryptjs 비밀번호 해싱
- CSRF 보호
- 세션 쿠키 (httpOnly, secure)

### 데이터 검증

- Zod 스키마 검증
- Magic bytes 파일 검증
- 이미지 크기 제한 (10MB)
- SQL Injection 방지 (Prisma)

### 환경 변수

- .env.local 무시 (.gitignore)
- 비밀 정보 서버 측만 노출
- API 키 보호

## 버전 호환성

### 의존성 버전

```json
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "@prisma/client": "^6.0.0",
  "next-auth": "^5.0.0-beta.25",
  "@tanstack/react-query": "^5.90.17",
  "zod": "^3.25.76",
  "tesseract.js": "^7.0.0"
}
```

### Node.js 호환성

- 최소: Node.js 20.0.0
- 권장: Node.js 20.x LTS

---

버전: 1.0.0
최종 업데이트: 2026-01-15
프레임워크: Next.js 16.0.0 + React 19.0.0
