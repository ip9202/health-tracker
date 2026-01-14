# Health Tracker

건강 데이터 관리를 위한 Next.js 기반 웹 애플리케이션

## 프로젝트 개요

Health Tracker는 사용자의 건강 데이터를 효율적으로 관리하기 위한 통합 플랫폼입니다. InBody 체성분 데이터를 업로드하고, 시각화하며, 기록을 관리할 수 있는 기능을 제공합니다.

## 주요 기능

### InBody 대시보드
- **이미지 업로드**: 드래그 앤 드롭으로 InBody 이미지를 쉽게 업로드
- **OCR 데이터 추출**: 업로드된 이미지에서 체성분 데이터 자동 추출
- **데이터 시각화**: 체중, 체지방율, 골격근량 등을 차트로 확인 (예정)
- **기록 관리**: 과거 측정 기록 조회 및 관리 (예정)

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
- **Recharts**: 데이터 시각화 (예정)

### 파일 업로드
- **React Dropzone**: 드래그 앤 드롭 파일 업로드
- **Sharp**: 이미지 처리

### 백엔드
- **Next.js API Routes**: RESTful API
- **Prisma**: 데이터베이스 ORM
- **PostgreSQL**: 데이터베이스

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
│   │   └── ui/             # shadcn/ui 컴포넌트
│   ├── lib/                # 유틸리티 라이브러리
│   │   ├── api/            # API 클라이언트
│   │   ├── types/          # TypeScript 타입
│   │   └── validations.ts  # Zod 스키마
│   └── middleware.ts       # NextAuth 미들웨어
├── prisma/
│   ├── schema.prisma       # Prisma 스키마
│   └── seed.ts             # 시드 데이터
├── tests/
│   ├── unit/               # 단위 테스트
│   └── integration/        # 통합 테스트
└── .moai/
    ├── specs/              # SPEC 문서
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
