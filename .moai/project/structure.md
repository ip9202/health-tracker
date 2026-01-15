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
│   │   │   │   ├── signin/route.ts
│   │   │   │   ├── signup/route.ts
│   │   │   │   └── signout/route.ts
│   │   │   └── inbody/            # InBody API
│   │   │       ├── upload/route.ts
│   │   │       ├── history/route.ts
│   │   │       └── [id]/route.ts
│   │   ├── auth/                  # 인증 페이지
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── inbody/                # InBody 대시보드
│   │   │   └── page.tsx
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   └── page.tsx               # 홈페이지
│   ├── components/                 # React 컴포넌트
│   │   ├── auth/                  # 인증 컴포넌트
│   │   │   ├── signin-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── inbody/                # InBody 컴포넌트
│   │   │   ├── upload-zone.tsx
│   │   │   ├── ocr-processor.tsx
│   │   │   ├── data-parser.tsx
│   │   │   └── result-view.tsx
│   │   ├── charts/                # 차트 컴포넌트
│   │   │   ├── weight-chart.tsx
│   │   │   ├── bmi-chart.tsx
│   │   │   └── body-fat-chart.tsx
│   │   ├── history/               # 기록 관리 컴포넌트
│   │   │   ├── history-list.tsx
│   │   │   ├── history-item.tsx
│   │   │   └── history-filter.tsx
│   │   ├── providers/             # Context Provider
│   │   │   └── query-provider.tsx
│   │   └── ui/                    # shadcn/ui 컴포넌트
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   ├── lib/                        # 핵심 비즈니스 로직
│   │   ├── api/                   # API 클라이언트
│   │   │   ├── auth.ts
│   │   │   └── inbody.ts
│   │   ├── types/                 # TypeScript 타입
│   │   │   ├── auth.ts
│   │   │   ├── inbody.ts
│   │   │   └── index.ts
│   │   ├── hooks/                 # React Hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-inbody.ts
│   │   │   └── use-ocr.ts
│   │   ├── auth.ts                # NextAuth 설정
│   │   ├── inbody.ts              # InBody Zod 스키마
│   │   ├── ocr-service.ts         # Tesseract.js OCR
│   │   ├── validations.ts         # Zod 검증 스키마
│   │   └── utils.ts               # 유틸리티 함수
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

- `signin/route.ts`: 로그인 처리
- `signup/route.ts`: 회원가입 처리
- `signout/route.ts`: 로그아웃 처리

**InBody API** (`api/inbody/`)

- `upload/route.ts`: 이미지 업로드 및 OCR 처리
- `history/route.ts`: 기록 목록 조회
- `[id]/route.ts`: 특정 기록 조회/수정/삭제

#### 페이지 디렉토리

- `auth/`: 인증 페이지 (로그인, 회원가입)
- `inbody/`: InBody 대시보드 페이지
- `layout.tsx`: 루트 레이아웃 (공통 헤더, 푸터)
- `page.tsx`: 홈페이지

### `src/components/` - React 컴포넌트

재사용 가능한 UI 컴포넌트가 포함됩니다.

#### 컴포넌트 분류

**인증 컴포넌트** (`auth/`)

- `signin-form.tsx`: 로그인 폼
- `signup-form.tsx`: 회원가입 폼

**InBody 컴포넌트** (`inbody/`)

- `upload-zone.tsx`: Drag & Drop 업로드 영역
- `ocr-processor.tsx`: OCR 처리 UI
- `data-parser.tsx`: 데이터 파싱 UI
- `result-view.tsx`: 결과 표시

**차트 컴포넌트** (`charts/`)

- `weight-chart.tsx`: 체중 차트
- `bmi-chart.tsx`: BMI 차트
- `body-fat-chart.tsx`: 체지방율 차트

**기록 관리 컴포넌트** (`history/`)

- `history-list.tsx`: 기록 목록
- `history-item.tsx`: 개별 기록 아이템
- `history-filter.tsx`: 필터 UI

**Provider** (`providers/`)

- `query-provider.tsx`: TanStack Query Provider

**UI 컴포넌트** (`ui/`)

- shadcn/ui 기반 컴포넌트 (Button, Card, Input 등)

### `src/lib/` - 비즈니스 로직

애플리케이션의 핵심 로직이 포함됩니다.

#### 모듈 구조

**API 클라이언트** (`api/`)

- `auth.ts`: 인증 API 클라이언트
- `inbody.ts`: InBody API 클라이언트

**타입 정의** (`types/`)

- `auth.ts`: 인증 관련 타입
- `inbody.ts`: InBody 관련 타입
- `index.ts`: 통합 타입 내보내기

**React Hooks** (`hooks/`)

- `use-auth.ts`: 인증 관련 Hook
- `use-inbody.ts`: InBody 관련 Hook
- `use-ocr.ts`: OCR 관련 Hook

**핵심 로직**

- `auth.ts`: NextAuth 설정 (JWT Strategy)
- `inbody.ts`: InBody Zod 스키마 정의
- `ocr-service.ts`: Tesseract.js OCR 처리
- `validations.ts`: Zod 검증 스키마
- `utils.ts`: 유틸리티 함수

### `prisma/` - 데이터베이스 스키마

Prisma ORM 설정과 데이터베이스 스키마가 포함됩니다.

#### 스키마 정의

- **User**: 사용자 계정
- **Account**: OAuth 계정 연동
- **Session**: 세션 정보
- **VerificationToken**: 이메일 인증 토큰
- **InBodyRecord**: InBody 체성분 기록

### `tests/` - 테스트 파일

Vitest를 사용하는 테스트 코드가 포함됩니다.

#### 테스트 분류

- `unit/`: 단위 테스트 (컴포넌트, 함수)
- `integration/`: 통합 테스트 (API, 데이터베이스)
- `e2e/`: E2E 테스트 (사용자 시나리오)

## 주요 파일 위치 참조

| 파일 | 경로 | 용도 |
|------|------|------|
| 홈페이지 | `src/app/page.tsx` | 랜딩 페이지 |
| 인증 설정 | `src/lib/auth.ts` | NextAuth 설정 |
| 미들웨어 | `src/middleware.ts` | 인증 미들웨어 |
| 루트 레이아웃 | `src/app/layout.tsx` | 공통 레이아웃 |
| InBody 스키마 | `src/lib/inbody.ts` | 데이터 검증 |
| OCR 서비스 | `src/lib/ocr-service.ts` | 이미지 텍스트 추출 |
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
- Server Actions로 대체 가능
- 보안 및 검증 레이어

### 데이터 흐름

```
사용자 → UI 컴포넌트 → API 클라이언트 → API 라우트
                                    ↓
                            비즈니스 로직 (lib/)
                                    ↓
                              Prisma ORM → PostgreSQL
```

---

버전: 1.0.0
최종 업데이트: 2026-01-15
프레임워크: Next.js 16.0.0 App Router
