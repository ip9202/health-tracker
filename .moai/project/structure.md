# 프로젝트 구조

## 디렉토리 트리

```
health/
├── .claude/                        # Claude Code 설정 및 커스터마이징
│   ├── agents/                     # 서브에이전트 정의 (20개)
│   ├── commands/                   # 슬래시 명령어 (10개)
│   ├── hooks/                      # 이벤트 기반 자동화
│   ├── output-styles/              # 출력 스타일 테마
│   └── skills/                     # 모델 호출 기반 스킬 라이브러리
├── .moai/                          # MoAI-ADK 프레임워크 설정
│   ├── config/                     # 설정 파일
│   │   ├── config.yaml            # 메인 설정
│   │   └── sections/              # 모듈화된 설정
│   ├── docs/                       # 생성된 문서
│   ├── logs/                       # 런타임 로그 (30일 보관)
│   ├── memory/                     # 세션 메모리
│   ├── project/                    # 프로젝트 문서
│   │   ├── product.md             # 제품 개요
│   │   ├── structure.md           # 구조 설명 (본 파일)
│   │   └── tech.md                # 기술 스택
│   ├── specs/                      # 명세서 저장소
│   └── temp/                       # 임시 파일 (7일 보관)
├── .mcp.json                       # MCP 서버 설정
├── .gitignore                      # Git 무시 파일
├── CLAUDE.md                       # Claude Code 실행 지시문
├── prisma/                         # Prisma ORM 설정
│   ├── schema.prisma               # 데이터베이스 스키마
│   └── migrations/                 # 마이그레이션 파일
├── public/                         # 정적 파일
│   └── images/                     # 이미지 리소스
├── src/                            # 애플리케이션 소스 코드
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API 라우트
│   │   │   ├── auth/              # 인증 API
│   │   │   │   ├── [...nextauth]/  # NextAuth 핸들러
│   │   │   │   ├── signin/route.ts
│   │   │   │   ├── signup/route.ts
│   │   │   │   └── signout/route.ts
│   │   │   ├── inbody/            # InBody API
│   │   │   │   ├── upload/route.ts
│   │   │   │   ├── history/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── health/            # AI 건강 분석 API (NEW)
│   │   │       ├── analyze/[recordId]/route.ts
│   │   │       └── analysis/[recordId]/route.ts
│   │   ├── auth/                  # 인증 페이지
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── inbody/                # InBody 대시보드
│   │   │   └── page.tsx
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   └── page.tsx               # 홈페이지
│   ├── components/                 # React 컴포넌트
│   │   ├── ai/                    # AI 건강 분석 컴포넌트 (NEW)
│   │   │   ├── health-analysis-result.tsx
│   │   │   ├── health-status-card.tsx
│   │   │   ├── risk-factor-list.tsx
│   │   │   ├── recommendation-card.tsx
│   │   │   └── warning-alert.tsx
│   │   ├── auth/                  # 인증 컴포넌트
│   │   │   ├── signin-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── inbody/                # InBody 컴포넌트
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── inbody-dashboard.tsx
│   │   │   ├── upload/
│   │   │   │   └── upload-section.tsx
│   │   │   ├── result/
│   │   │   │   └── result-view.tsx
│   │   │   ├── charts/
│   │   │   │   ├── score-chart.tsx
│   │   │   │   ├── weight-chart.tsx
│   │   │   │   ├── bmi-chart.tsx
│   │   │   │   └── body-composition-chart.tsx
│   │   │   └── history/
│   │   │       ├── history-list.tsx
│   │   │       ├── history-filters.tsx
│   │   │       ├── history-item.tsx
│   │   │       └── history-pagination.tsx
│   │   ├── providers/             # Context Provider
│   │   │   ├── session-provider.tsx (NEW)
│   │   │   └── query-provider.tsx
│   │   └── ui/                    # shadcn/ui 컴포넌트
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       └── ...
│   ├── lib/                        # 핵심 비즈니스 로직
│   │   ├── api/                   # API 클라이언트
│   │   │   └── inbody-api.ts
│   │   ├── prompts/               # AI 프롬프트 (NEW)
│   │   │   └── health-analysis.ts
│   │   ├── types/                 # TypeScript 타입
│   │   │   ├── inbody.ts
│   │   │   └── index.ts
│   │   ├── auth.ts                # NextAuth 설정
│   │   ├── ai-service.ts          # AI 건강 분석 서비스 (NEW)
│   │   ├── ai-schemas.ts          # AI Zod 스키마 (NEW)
│   │   ├── client-ocr.ts          # 클라이언트 OCR (NEW)
│   │   ├── ocr-service.ts         # Tesseract.js OCR
│   │   ├── parser-service.ts      # OCR 데이터 파싱
│   │   ├── password.ts            # 비밀번호 해싱
│   │   ├── prisma.ts              # Prisma 클라이언트
│   │   ├── validations.ts         # Zod 검증 스키마
│   │   ├── inbody.ts              # InBody 타입 정의
│   │   └── image-validator.ts     # 이미지 검증
│   ├── middleware.ts              # NextAuth 인증 미들웨어
│   └── styles/                    # 스타일시트
│       └── globals.css
├── tests/                          # 테스트 파일 (Vitest)
│   ├── unit/                      # 단위 테스트
│   ├── integration/               # 통합 테스트
│   └── e2e/                       # E2E 테스트
├── next.config.js                 # Next.js 설정
├── tailwind.config.js             # Tailwind CSS 설정
├── tsconfig.json                  # TypeScript 설정
├── vitest.config.ts               # Vitest 설정
├── package.json                   # 프로젝트 의존성
└── README.md                      # 프로젝트 설명
```

## 주요 디렉토리 설명

### `src/app/` - Next.js App Router

페이지 및 API 라우트를 포함하는 Next.js 16 App Router 구조입니다.

#### `api/` - API 라우트

**인증 API** (`api/auth/`)

- `[...nextauth]/route.ts`: NextAuth 핸들러
- `signin/route.ts`: 로그인 처리
- `signup/route.ts`: 회원가입 처리
- `signout/route.ts`: 로그아웃 처리

**InBody API** (`api/inbody/`)

- `upload/route.ts`: 이미지 업로드 및 OCR 처리
- `history/route.ts`: 기록 목록 조회 (페이지네이션)
- `[id]/route.ts`: 특정 기록 삭제

**AI 건강 분석 API** (`api/health/`) (NEW)

- `analyze/[recordId]/route.ts`: AI 분석 요청
- `analysis/[recordId]/route.ts`: AI 분석 결과 조회

#### 페이지 디렉토리

- `auth/`: 인증 페이지 (로그인, 회원가입)
- `inbody/`: InBody 대시보드 페이지
- `layout.tsx`: 루트 레이아웃 (공통 헤더, 푸터)
- `page.tsx`: 홈페이지

### `src/components/` - React 컴포넌트

재사용 가능한 UI 컴포넌트가 포함됩니다.

#### 컴포넌트 분류

**AI 건강 분석 컴포넌트** (`ai/`) (NEW)

- `health-analysis-result.tsx`: AI 분석 결과 컨테이너
- `health-status-card.tsx`: 건강 상태 카드
- `risk-factor-list.tsx`: 위험 요소 목록
- `recommendation-card.tsx`: 추천 사항 카드
- `warning-alert.tsx`: 주의 사항 알림

**인증 컴포넌트** (`auth/`)

- `signin-form.tsx`: 로그인 폼
- `signup-form.tsx`: 회원가입 폼

**InBody 컴포넌트** (`inbody/`)

- `dashboard-layout.tsx`: 대시보드 레이아웃
- `inbody-dashboard.tsx`: 메인 대시보드
- `upload/upload-section.tsx`: 업로드 영역
- `result/result-view.tsx`: 결과 표시

**차트 컴포넌트** (`inbody/charts/`)

- `score-chart.tsx`: 건강 점수 차트
- `weight-chart.tsx`: 체중 차트
- `bmi-chart.tsx`: BMI 차트
- `body-composition-chart.tsx`: 체성분 구성 차트

**기록 관리 컴포넌트** (`inbody/history/`)

- `history-list.tsx`: 기록 목록
- `history-filters.tsx`: 필터 UI
- `history-item.tsx`: 개별 기록 아이템
- `history-pagination.tsx`: 페이지네이션

**Provider** (`providers/`)

- `session-provider.tsx`: NextAuth 세션 Provider (NEW)
- `query-provider.tsx`: TanStack Query Provider

**UI 컴포넌트** (`ui/`)

- shadcn/ui 기반 컴포넌트 (Button, Card, Input, Progress 등)

### `src/lib/` - 비즈니스 로직

애플리케이션의 핵심 로직이 포함됩니다.

#### 모듈 구조

**API 클라이언트** (`api/`)

- `inbody-api.ts`: InBody API 클라이언트

**AI 프롬프트** (`prompts/`) (NEW)

- `health-analysis.ts`: AI 건강 분석 프롬프트

**타입 정의** (`types/`)

- `inbody.ts`: InBody 관련 타입

**핵심 로직**

- `auth.ts`: NextAuth 설정 (JWT Strategy)
- `ai-service.ts`: AI 건강 분석 서비스 (NEW)
- `ai-schemas.ts`: AI 관련 Zod 스키마 (NEW)
- `client-ocr.ts`: 클라이언트 측 OCR 처리 (NEW)
- `ocr-service.ts`: Tesseract.js OCR 처리
- `parser-service.ts`: OCR 데이터 파싱
- `password.ts`: 비밀번호 해싱
- `prisma.ts`: Prisma 클라이언트
- `validations.ts`: Zod 검증 스키마
- `inbody.ts`: InBody 타입 정의
- `image-validator.ts`: 이미지 검증

### `prisma/` - 데이터베이스 스키마

Prisma ORM 설정과 데이터베이스 스키마가 포함됩니다.

#### 스키마 정의

- **User**: 사용자 계정
- **Account**: OAuth 계정 연동
- **Session**: 세션 정보
- **VerificationToken**: 이메일 인증 토큰
- **InBodyRecord**: InBody 체성분 기록
- **HealthAnalysis**: AI 건강 분석 결과 (NEW)

### `tests/` - 테스트 파일

Vitest를 사용하는 테스트 코드가 포함됩니다.

#### 테스트 분류

- `unit/`: 단위 테스트 (컴포넌트, 함수)
- `integration/`: 통합 테스트 (API, 데이터베이스)
- `e2e/`: E2E 테스트 (사용자 시나리오)

## API 라우트 맵

| 경로 | 메서드 | 목적 | 인증 필요 |
|------|--------|------|-----------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 핸들러 | - |
| `/api/auth/signin` | POST | 로그인 | - |
| `/api/auth/signup` | POST | 회원가입 | - |
| `/api/auth/signout` | POST | 로그아웃 | - |
| `/api/inbody/upload` | POST | InBody 업로드 + OCR | Yes |
| `/api/inbody/history` | GET | 기록 목록 (페이지네이션) | Yes |
| `/api/inbody/[id]` | DELETE | 기록 삭제 | Yes |
| `/api/health/analyze/[recordId]` | POST | AI 분석 요청 | Yes |
| `/api/health/analysis/[recordId]` | GET | AI 분석 결과 조회 | Yes |

## 데이터베이스 모델

### User 모델

사용자 인증 정보를 저장합니다.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hashed password
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  inbodyRecords InBodyRecord[]
}
```

### InBodyRecord 모델

InBody 체성분 기록을 저장합니다.

```prisma
model InBodyRecord {
  id                String   @id @default(cuid())
  userId            String
  measuredAt        DateTime

  // 개인정보
  name              String?
  gender            String?
  age               Int?
  height            Float?

  // 체성분 데이터
  weight            Float?
  bodyFatPercentage Float?
  muscle            Float?
  protein           Float?
  bodyWater         Float?
  skeletalMuscle    Float?

  // 신체 점수
  bodyScore         Int?
  scoreDescription  String?

  // 비만 판정
  bmi               Float?
  bmiStatus         String?

  // 체중 조절
  weightControl     String?

  // 신체 유형
  bodyType          String?

  // 생체 임피던스
  bioimpedance      String?

  // 기타 지표
  smi               Float?
  calorieNeeds      Int?

  // 부위별 분석 (JSON)
  regionalAnalysis  String?

  // OCR 메타데이터
  ocrConfidence     Float?
  ocrProcessedAt    DateTime @default(now())

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // AI 분석 1:1 관계
  healthAnalysis    HealthAnalysis?

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, measuredAt])
}
```

### HealthAnalysis 모델 (NEW)

AI 건강 분석 결과를 저장합니다.

```prisma
model HealthAnalysis {
  id                String   @id @default(cuid())
  inbodyRecordId    String   @unique
  inbodyRecord      InBodyRecord @relation(fields: [inbodyRecordId], references: [id], onDelete: Cascade)

  // AI 분석 결과
  healthStatus      String   // 전체 건강 상태
  healthScore       Int      // 건강 점수 (0-100)
  riskFactors       String   // 위험 요소 목록 (JSON)
  recommendations   String   // 추천 사항 (JSON)
  warnings          String   // 주의 사항 (JSON)

  // AI 메타데이터
  modelVersion      String   // AI 모델 버전
  confidence        Float?   // 분석 신뢰도
  analysisToken     String?  // API 토큰

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([inbodyRecordId])
}
```

## 주요 파일 위치 참조

| 파일 | 경로 | 용도 |
|------|------|------|
| 홈페이지 | `src/app/page.tsx` | 랜딩 페이지 |
| 인증 설정 | `src/lib/auth.ts` | NextAuth 설정 |
| 세션 Provider | `src/components/providers/session-provider.tsx` | 세션 컨텍스트 |
| 미들웨어 | `src/middleware.ts` | 인증 미들웨어 |
| 루트 레이아웃 | `src/app/layout.tsx` | 공통 레이아웃 |
| AI 서비스 | `src/lib/ai-service.ts` | AI 건강 분석 |
| AI 스키마 | `src/lib/ai-schemas.ts` | AI 데이터 검증 |
| AI 프롬프트 | `src/lib/prompts/health-analysis.ts` | AI 프롬프트 |
| 클라이언트 OCR | `src/lib/client-ocr.ts` | 브라우저 OCR |
| OCR 서비스 | `src/lib/ocr-service.ts` | 이미지 텍스트 추출 |
| 파서 서비스 | `src/lib/parser-service.ts` | OCR 데이터 파싱 |
| InBody 스키마 | `src/lib/inbody.ts` | 데이터 검증 |
| DB 스키마 | `prisma/schema.prisma` | 데이터베이스 모델 |
| Next.js 설정 | `next.config.js` | 프레임워크 설정 |
| Tailwind 설정 | `tailwind.config.js` | 스타일 설정 |
| TypeScript 설정 | `tsconfig.json` | 타입 설정 |
| Vitest 설정 | `vitest.config.ts` | 테스트 설정 |

## 아키텍처 패턴

### React Server Components + Client Components

- Server Components: SEO, 초기 렌더링, 보안 데이터
- Client Components: 인터랙티브 UI, 상태 관리

### API Routes

- RESTful 엔드포인트
- 인증된 요청 처리
- AI 서비스 통합

### AI 서비스 아키텍처

```
사용자 → InBody 기록 업로드 → OCR 처리 → 데이터 저장
                                              ↓
                                    AI 분석 요청 API
                                              ↓
                                    Claude AI API 호출
                                              ↓
                                    분석 결과 DB 저장
                                              ↓
                                    결과 조회 및 표시
```

### 데이터 흐름

```
사용자 → UI 컴포넌트 → API 클라이언트 → API 라우트
                                    ↓
                            비즈니스 로직 (lib/)
                                    ↓
                        ┌───────────┴───────────┐
                        ↓                       ↓
                    Prisma ORM              Claude AI
                        ↓                       ↓
                   PostgreSQL              분석 결과
                        ↓                       ↓
                        └───────────┬───────────┘
                                    ↓
                            사용자에게 표시
```

---

버전: 1.1.0
최종 업데이트: 2026-01-16
프레임워크: Next.js 16.0.0 App Router
AI 모델: claude-3-5-sonnet-20241022
