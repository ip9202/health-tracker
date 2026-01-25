# 기술 스택

## 개요

VIBE Health는 Next.js 16 App Router와 React 19를 기반으로 하는 풀스택 웹 애플리케이션입니다. TypeScript를 사용하여 타입 안전성을 보장하고, Prisma ORM으로 데이터베이스를 관리합니다. AI 기반 건강 분석을 위해 Anthropic Claude SDK를 통합했습니다.

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
- Pie Chart: 건강 점수, 체성분 구성
- Radar Chart: 다중 지표 비교

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

- Button, Input, Card, Progress
- Dialog, Dropdown, Select
- Form, Label, Tabs
- Table, Pagination, Tooltip

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

### AI/ML (NEW)

#### Anthropic Claude SDK 0.71.2

**선택 사유**

- 고성능 AI 모델 (claude-3-5-sonnet)
- 건강 데이터 분석에 최적화
- GLM API와 완벽 호환
- 구조화된 출력 지원
- 이미지 분석 능력 (Vision API)

**주요 기능**

- 건강 상태 평가 (0-100점)
- 위험 요소 자동 식별
- 맞춤형 추천 생성
- 주의 사항 알림
- InBody 이미지 직접 분석

**모델 설정**

```typescript
model: claude-3-5-sonnet-20241022
maxTokens: 4096
temperature: 0.7
timeout: 30000ms
maxRetries: 3
```

#### GLM API 통합

**선택 사유**

- Claude API와 호환되는 국내 AI 서비스
- 낮은 지연 시간
- 비용 효율적
- 한국어 처리 최적화

**설정**

```typescript
baseURL: https://api.z.ai/api/anthropic
apiKey: process.env.GLM_API_KEY
modelVersion: claude-3-5-sonnet-20241022
```

#### Zod 스키마 (AI)

**선택 사유**

- AI 응답 구조화
- 런타임 타입 검증
- 명확한 에러 메시지
- TypeScript와 완벽 통합

### 인증

#### NextAuth.js 5.0.0-beta.25

**선택 사유**

- Next.js 전용 인증 솔루션
- JWT Strategy 지원
- Prisma Adapter 통합
- 보안 처리 자동화

**주요 기능**

- Credentials Provider (이메일/비밀번호)
- JWT 세션 관리 (30일 유효)
- 보안 라우트 보호
- CSRF 보호
- 세션 Provider

**구성**

```typescript
// JWT Strategy
strategy: "jwt"
maxAge: 30 * 24 * 60 * 60 // 30일

// Credentials Provider
credentials: {
  email: { label: "Email", type: "email" },
  password: { label: "Password", type: "password" }
}

// Session Callback
callbacks: {
  session({ token, user }) { return { ...session, user } }
}
```

### OCR

#### Tesseract.js 7.0.0

**선택 사유**

- 클라이언트 측 OCR 처리
- 서버 의존성 제거
- InBody 결과지 텍스트 추출
- 브라우저에서 직접 실행

**주요 기능**

- 한국어/영어 언어 지원
- 이미지 전처리 (5가지 함수)
- 진행률 이벤트
- Worker 기반 비동기 처리

#### 멀티 스테이지 추출 시스템 (NEW)

**선택 사유**

- 신체 점수 추출 정확도 95% 달성
- 3단계 추출 전략 (높음/중간/낮음 신뢰도)
- 16개 정규식 패턴 라이브러리
- 다양한 InBody 기기 지원 (770/970, 720, OntoFit)

**추출 단계**

- Stage 1 (높은 신뢰도 80%+): InBody 770/970 핵심 패턴
- Stage 2 (중간 신뢰도 50-80%): InBody 720/OntoFit 패턴
- Stage 3 (낮은 신뢰도 <50%): Generic 폴백 패턴

**전처리 함수**

- 그레이스케일 변환
- 대비 향상
- 노이즈 제거
- 바이너리화
- 회전 보정

#### 오류 처리 및 재시도 시스템 (NEW)

**선택 사유**

- 자동 오류 복구
- 카테고리별 오류 분류 (OCR 실패, 추출 실패, 검증 실패, 품질 저하)
- 지능형 재시도 전략
- 사용자 친화적 에러 메시지

**오류 카테고리**

- OCR_FAILED: OCR 처리 실패
- EXTRACTION_FAILED: 패턴 매칭 실패
- VALIDATION_FAILED: 데이터 검증 실패
- QUALITY_POOR: 낮은 신뢰도/품질
- UNKNOWN: 분류 불가능한 오류

#### Vision API 통합 (NEW)

**선택 사유**

- 이미지에서 직접 체성분 데이터 추출
- OCR 실패 시 자동 폴백
- 높은 추출 정확도
- AI 기반 이해 능력

**하이브리드 방식**

- OCR 추출 → AI 정제 → Vision 폴백
- 최상의 결과 제공
- 강건한 오류 처리

### 데이터 검증

#### Zod 3.25.76

**선택 사유**

- TypeScript 친화적 스키마 정의
- 런타임 타입 검증
- API 요청/응답 검증
- 에러 메시지 자동 생성

**주요 사용처**

- InBody 데이터 스키마
- AI 분석 결과 스키마 (NEW)
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

```typescript
saltRounds: 10
// 평문 비밀번호 미저장
```

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

#### Tailwind CSS 3.4.19

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

#### Node.js 22+

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

- PostgreSQL 컨테이너 실행
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

#### ESLint 9.0.0

- 코드 스타일 통일
- 자동 포맷팅
- 린팅 규칙

#### VS Code 추천 확장

- Prisma
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Vitest

## 환경 변수

```bash
# 데이터베이스
DATABASE_URL="postgresql://user:password@host:port/database"

# AI 서비스 (NEW)
GLM_API_BASE_URL="https://api.z.ai/api/anthropic"
GLM_API_KEY="your_api_key_here"
GLM_MODEL_VERSION="claude-3-5-sonnet-20241022"
AI_ANALYSIS_TIMEOUT="30000"
AI_MAX_RETRIES="3"
AI_RETRY_DELAY="1000"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key_here"

# OAuth (선택)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## AI 서비스 아키텍처 (NEW)

### 서비스 구조

```
src/lib/ai-service.ts
├── analyzeHealthData()      # 건강 데이터 분석
├── analyzeWithAI()          # Claude API 호출 (NEW)
├── extractInBodyFromImage() # Vision API 이미지 분석 (NEW)
├── generateRecommendations() # 추천사항 생성
├── identifyRiskFactors()    # 위험 요소 식별
└── calculateHealthScore()   # 건강 점수 계산
```

### 프롬프트 시스템

```
src/lib/prompts/health-analysis.ts
├── createGLMMessages()      # GLM API 메시지 생성 (NEW)
├── formatInBodyData()       # InBody 데이터 포맷팅 (NEW)
├── buildHealthAnalysisPrompt() # 분석 프롬프트
├── buildRecommendationPrompt() # 추천 프롬프트
└── buildWarningPrompt()        # 주의사항 프롬프트
```

### 스키마 검증

```
src/lib/ai-schemas.ts
├── HealthAnalysisSchema      # 분석 결과 스키마
├── RiskFactorSchema          # 위험 요소 스키마
├── RecommendationSchema      # 추천사항 스키마
└── WarningSchema             # 주의사항 스키마
```

### OCR 추출 시스템 (NEW)

```
src/lib/multi-stage-extractor.ts
├── extractBodyScore()           # 3단계 추출 메인 함수
├── extractBodyScoreWithConfidence() # 신뢰도 기반 추출
└── priorityToConfidence()       # 우선순위 변환

src/lib/extraction-error-handler.ts
├── categorizeError()            # 오류 카테고리 분류
├── createExtractionError()      # 오류 객체 생성
├── shouldRetry()                # 재시도 가능 여부
├── attemptRecovery()            # 오류 복구 시도
└── formatErrorMessage()         # 에러 메시지 포맷팅
```

### API 통합

```
Anthropic Claude API / GLM API
├── Model: claude-3-5-sonnet-20241022
├── Base URL: https://api.z.ai/api/anthropic (GLM)
├── Max Tokens: 4096
├── Temperature: 0.7
├── Timeout: 30초
└── Retries: 3회
```

## 성능 최적화 전략

### 프론트엔드

- React Server Components로 JS 번들 감소
- Image 최적화 (next/image, sharp)
- 동적 import로 코드 분할
- TanStack Query 캐싱
- OCR Worker 기반 비동기 처리

### 백엔드

- Prisma 쿼리 최적화
- API 캐싱 전략
- 데이터베이스 인덱싱
- Connection pooling
- AI 요청 배치 처리

### AI 서비스

- 요청 타임아웃 (30초)
- 자동 재시도 (최대 3회)
- 결과 캐싱 (DB 저장)
- 스트리밍 응답 고려

### 빌드

- Turbopack (선택)
- 정적 생성 (ISR)
- Edge Runtime 활용

## 보안 고려사항

### 인증

- JWT 세션 (30일 유효)
- bcryptjs 비밀번호 해싱 (salt rounds: 10)
- CSRF 보호
- 세션 쿠키 (httpOnly, secure, sameSite)
- 인증 미들웨어

### 데이터 검증

- Zod 스키마 검증
- Magic bytes 파일 검증
- 이미지 크기 제한 (10MB)
- SQL Injection 방지 (Prisma)
- XSS 방지 (React 기본 보호)

### AI 서비스 보안

- API 키 환경 변수 관리
- 요청 타임아웃 설정
- 비용 제한 (maxTokens, retries)
- 민감 정보 로깅 제외

### 환경 변수

- .env.local 무시 (.gitignore)
- 비밀 정보 서버 측만 노출
- API 키 보호
- .env.example 제공

## 버전 호환성

### 의존성 버전

```json
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "@prisma/client": "^6.0.0",
  "next-auth": "^5.0.0-beta.25",
  "@anthropic-ai/sdk": "^0.71.2",
  "@tanstack/react-query": "^5.90.17",
  "zod": "^3.25.76",
  "tesseract.js": "^7.0.0"
}
```

### Node.js 호환성

- 최소: Node.js 22.0.0
- 권장: Node.js 22.x LTS

### 주요 라이브러리 호환성

| 라이브러리 | 버전 | 호환성 |
|-----------|------|--------|
| Next.js | 16.0.0 | React 19+ |
| React | 19.0.0 | Next.js 16+ |
| Prisma | 6.0.0 | Node.js 22+ |
| NextAuth | 5.0.0-beta.25 | Next.js 16+ |
| Claude SDK | 0.71.2 | Node.js 18+ |

---

버전: 1.2.0
최종 업데이트: 2026-01-17
프레임워크: Next.js 16.0.0 + React 19.0.0
AI 모델: claude-3-5-sonnet-20241022
OCR 정확도: 95% (멀티 스테이지 추출)
