# Health Tracker

건강 데이터 관리를 위한 Next.js 기반 웹 애플리케이션

## 프로젝트 개요

Health Tracker는 사용자의 건강 데이터를 효율적으로 관리하기 위한 통합 플랫폼입니다. InBody 체성분 데이터를 업로드하고, 시각화하며, 기록을 관리할 수 있는 기능을 제공합니다.

## 주요 기능

### InBody 대시보드
- **이미지 업로드**: 드래그 앤 드롭으로 InBody 이미지를 쉽게 업로드
- **OCR 데이터 추출**: 업로드된 이미지에서 체성분 데이터 자동 추출
  - **신체점수 추출 정확도**: 95% 목표 (16개 패턴, 5개 전처리 기능)
  - **다양한 InBody 기기 지원**: InBody 770/970/720, OntoFit
  - **다단계 추출 전략**: 높은 신뢰도 → 중간 신뢰도 → 낮은 신뢰도
  - **에러 복구 시스템**: 자동 재시도 및 사용자 가이드
- **데이터 시각화**: 체중, 체지방율, 골격근량 등을 차트로 확인
  - 바디 타입 쉐이프 (C/I/D) 시각화
  - ECW/TBW 비율 시각화
  - 트렌드 스파크라인
  - 향상된 대시보드
- **각성 요소 (Awareness)**: 사용자가 자신의 건강 변화를 인식할 수 있는 기능
  - 전후 비교 하이라이트
  - 목표 대비 진행률 표시
  - 요약 통계 카드
- **게이미피케이션**: 건강 관리를 지속할 수 있는 동기 부여 기능
  - 연속 측정 스트릭 카운터
  - 마일스톤 업적 배지
  - 목표 설정 및 추적
- **기록 관리**: 과거 측정 기록 조회 및 관리 (예정)

**구현된 UI/UX 컴포넌트 (2026-01-25):**
- TAG-FE-007: 시각화 컴포넌트 모듈 (visualizations/)
- TAG-FE-008: 각성 요소 컴포넌트 (awareness/)
- TAG-FE-009: 게이미피케이션 컴포넌트 (gamification/)
- InBody 공식 색상 시스템 적용 (Blue/Green/Orange)
- React 19 + shadcn/ui 기반 최신 UI 패턴
- Recharts를 활용한 데이터 시각화

**구현된 OCR 추출 기능:**
- TAG-OCR-001: 이미지 전처리 모듈 (그레이스케일, 대비, 노이즈, 이진화, 회전 보정)
- TAG-OCR-002: 정규식 패턴 라이브러리 (16개 패턴)
- TAG-OCR-003: 다단계 추출 엔진
- TAG-OCR-004: OCR 설정 최적화
- TAG-OCR-005: 에러 처리 및 재시도 시스템
- TAG-OCR-008: API 엔드포인트 확장

### AI 건강 분석
- **건강 상태 분석**: AI 기반 체성분 데이터 종합 분석
- **맞춤형 추천**: 개인별 운동 및 생활 습관 추천
- **위험 요소 식별**: 건강 위험 요소 자동 감지
- **주의 사항 안내**: 건강 관리 주의 사항 제공

**구현된 기능:**
- TAG-AI-001: GLM API 클라이언트 구현
- TAG-AI-002: HealthAnalysis Prisma 모델 생성
- TAG-AI-003: AI 프롬프트 엔지니어링
- TAG-AI-004: Zod 응답 검증 스키마 (위험 요소, 추천, 주의사항)
- TAG-AI-005: AI 분석 API 엔드포인트
- TAG-AI-006: 재시도 및 에러 핸들링 로직
- TAG-AI-007: 건강 점수 계산 알고리즘
- TAG-AI-008: 추천 시스템 우선순위 로직
- TAG-FE-005: AI 분석 결과 UI 컴포넌트
- TAG-FE-006: 건강 분석 대시보드 페이지

### 사용자 인증
- 회원가입 및 로그인
- 세션 기반 인증
- 비밀번호 보안 (bcrypt 암호화)

## 기술 스택

### 프론트엔드
- **Next.js 16**: React 19 기반 서버 사이드 렌더링
- **React 19**: 최신 UI 컴포넌트
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **shadcn/ui**: 재사용 가능한 UI 컴포넌트

### 데이터 관리
- **TanStack Query (React Query)**: 서버 상태 관리
- **Zod**: 데이터 검증 스키마
- **Recharts**: 데이터 시각화 (바디 타입, 비율, 트렌드 차트)

### 파일 업로드
- **React Dropzone**: 드래그 앤 드롭 파일 업로드
- **Sharp**: 이미지 처리

### 백엔드
- **Next.js API Routes**: RESTful API
- **Prisma**: 데이터베이스 ORM
- **PostgreSQL**: 데이터베이스

### AI 통합
- **GLM API**: AI 기반 건강 분석 (ChatGPT-compatible)
- **Zod**: AI 응답 데이터 검증
- **@anthropic-ai/sdk**: AI API 클라이언트

### 인증
- **NextAuth.js 5**: 인증 솔루션
- **bcryptjs**: 비밀번호 해싱

### 테스트
- **Vitest**: 단위 테스트 프레임워크
- **Testing Library**: React 컴포넌트 테스트
- **Happy DOM**: 가상 DOM 환경

## 시작하기

### 사전 요구사항

- Node.js 22.0.0 이상
- PostgreSQL 데이터베이스
- npm 또는 yarn 패키지 매니저

### 설치

1. 저장소 클론:
```bash
git clone <repository-url>
cd health
```

2. 의존성 설치:
```bash
npm install
```

3. 환경 변수 설정:
```bash
cp .env.example .env
```

`.env` 파일에 다음 변수들을 설정하세요:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/health_tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. 데이터베이스 설정:
```bash
npm run db:push
```

5. 개발 서버 시작:
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
health/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 라우트
│   │   ├── (auth)/         # 인증 관련 페이지
│   │   └── dashboard/      # 대시보드 페이지
│   ├── components/         # React 컴포넌트
│   │   ├── auth/           # 인증 컴포넌트
│   │   ├── inbody/         # InBody 컴포넌트
│   │   │   ├── visualizations/  # 시각화 컴포넌트 (바디 타입, 비율, 트렌드)
│   │   │   ├── awareness/       # 각성 요소 컴포넌트 (변화 하이라이트, 진행률)
│   │   │   ├── gamification/    # 게이미피케이션 컴포넌트 (스트릭, 업적, 목표)
│   │   │   ├── upload/          # 이미지 업로드 컴포넌트
│   │   │   ├── result/          # 결과 표시 컴포넌트
│   │   │   └── charts/          # 차트 컴포넌트
│   │   ├── ai/             # AI 분석 컴포넌트
│   │   └── ui/             # shadcn/ui 컴포넌트
│   ├── lib/                # 유틸리티 라이브러리
│   │   ├── api/            # API 클라이언트
│   │   ├── ai/             # AI 서비스 모듈
│   │   ├── types/          # TypeScript 타입
│   │   ├── ai-schemas.ts   # AI 응답 검증 스키마
│   │   └── validations.ts  # Zod 스키마
│   └── middleware.ts       # NextAuth 미들웨어
├── prisma/
│   ├── schema.prisma       # Prisma 스키마
│   └── seed.ts             # 시드 데이터
├── tests/
│   ├── unit/               # 단위 테스트
│   └── integration/        # 통합 테스트
├── docs/
│   ├── api/                # API 문서
│   │   └── inbody-api.md   # InBody API 가이드
│   └── developers/         # 개발자 가이드
│       └── ocr-extraction-guide.md  # OCR 추출 시스템 가이드
└── .moai/
    ├── specs/              # SPEC 문서
    │   ├── SPEC-AI-001/    # AI 건강 분석 시스템
    │   ├── SPEC-AUTH-001/  # 사용자 인증 시스템
    │   ├── SPEC-DATA-003/  # InBody OCR 데이터 추출
    │   ├── SPEC-FE-004/    # InBody 대시보드
    │   └── SPEC-OCR-001/   # OCR 정확도 향상 시스템
    └── config/             # MoAI-ADK 설정
```

## API 통합

### InBody API

InBody 기능을 사용하기 위한 API 클라이언트가 제공됩니다:

```typescript
import { uploadInBodyImage, fetchInBodyHistory, deleteInBodyRecord } from '@/lib/api/inbody-api'

// 이미지 업로드
const result = await uploadInBodyImage(file)

// 기록 조회
const history = await fetchInBodyHistory({ page: 1, pageSize: 10 })

// 기록 삭제
await deleteInBodyRecord(recordId)
```

상세한 API 사용법은 [docs/api/inbody-api.md](docs/api/inbody-api.md)를 참조하세요.

**OCR 추출 API:**
- `fetchExtractionDetail`: 추출 상세 정보 조회
- `retryExtraction`: 강화된 전처리로 추출 재시도

상세한 OCR 추출 시스템 사용법은 [docs/developers/ocr-extraction-guide.md](docs/developers/ocr-extraction-guide.md)를 참조하세요.

### AI 건강 분석 API

AI 기반 건강 분석 기능이 구현되었습니다:

```typescript
// AI 분석 요청
import { analyzeHealthData, getHealthAnalysis } from '@/lib/api/health-analysis'

// 건강 데이터 분석
const analysis = await analyzeHealthData(inbodyRecordId)

// 분석 결과 조회
const result = await getHealthAnalysis(recordId)
```

**분석 결과 포함:**
- `healthStatus`: 전체 건강 상태 (양호, 관리 필요, 개선 필요)
- `healthScore`: 건강 점수 (0-100)
- `riskFactors`: 위험 요소 목록 (근육, 체지방, 대사, 체중)
- `recommendations`: 운동/영양/생활 습관 추천
- `warnings`: 주의 사항 (정보, 주의, 경고)

## 개발

### 사용 가능한 스크립트

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
npm run lint         # ESLint 실행
npm run test         # 테스트 실행
npm run test:coverage # 테스트 커버리지 확인
npm run test:ui      # 테스트 UI 실행
npm run db:push      # 데이터베이스 스키마 푸시
npm run db:migrate   # 데이터베이스 마이그레이션
npm run db:studio    # Prisma Studio 실행
npm run db:seed      # 시드 데이터 생성
```

### 코드 스타일

- ESLint: 코드 린팅 및 포맷팅
- TypeScript: 엄격한 타입 검증
- Zod: 런타임 데이터 검증

## 테스트

```bash
# 전체 테스트 실행
npm test

# 커버리지 확인
npm run test:coverage

# 특정 파일 테스트
npm test -- inbody.test.ts

# 감시 모드
npm test -- --watch
```

## 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

## 라이선스

MIT License

## 기여

기여를 환영합니다! Pull Request를 제출해 주세요.

## 문의

질문이나 제안이 있으시면 Issue를 생성해 주세요.
