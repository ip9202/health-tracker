# 기술 스택

## MoAI-ADK 프레임워크 개요

MoAI-ADK (Model Orchestrator AI - Application Development Kit)는 Claude Code를 위한 종합적인 개발 키트입니다. AI 기반 개발 워크플로우를 자동화하고 품질을 보장하는 완전한 시스템을 제공합니다.

### 핵심 설계 원칙

1. **품질 우선**: TRUST 5 프레임워크를 통한 자동화된 품질 보장
2. **명세 우선**: EARS 형식의 명확한 요구사항 정의
3. **위임 패턴**: 전문 에이전트에게 작업 위임으로 최적의 결과 보장
4. **토큰 최적화**: 200K 토큰 예산 내에서 최대한의 작업 수행
5. **점진적 공개**: 3단계 지식 전달 구조로 효율적인 학습 지원

## TRUST 5 품질 프레임워크

모든 코드는 5가지 핵심 품질 원칙을 준수해야 합니다.

### Test-first (테스트 우선)

- 최소 85% 테스트 커버리지 유지
- RED-GREEN-REFACTOR 사이클 엄격 준수
- pytest 커버리지 리포트 자동 생성
- 커버리지 미달 시 병합 차단

**이점**: 초기 버그 발견으로 디버깅 시간 60-70% 감소

### Readable (가독성)

- 명확하고 설명적인 네이밍 규칙
- ruff 린터를 통한 코드 스타일 검사
- 일관된 코드 구조와 패턴
- 자기 설명적인 코드 작성

**이점**: 온보딩 시간 40% 감소, 유지보수 속도 향상

### Unified (통일성)

- black 포맷터와 isort를 통한 일관된 스타일
- 통일된 임포트 패턴
- 일관된 에러 처리 방식
- 팀 전체 동일한 코드 스타일

**이점**: 코드 리뷰 시간 30% 감소, 스타일 논쟁 최소화

### Secured (보안)

- OWASP 보안 표준 준수
- expert-security 에이전트를 통한 자동 보안 검토
- 취약점 발견 시 병합 차단
- 보안 검토 필수 통과

**이점**: 일반적인 보안 취약점 95% 이상 예방

### Trackable (추적 가능성)

- 구조화된 커밋 메시지
- Git 커밋 메시지 정규식 검사
- 명확한 변경 이력 관리
- 이슈 추적 및 감사 지원

**이점**: 이슈 조사 시간 50% 감소

## Context7 MCP 통합

Upstash Context7 MCP(Model Context Protocol) 서버를 통해 최신 공식 문서에 실시간으로 접근할 수 있습니다.

### 주요 기능

- **라이브러리 해상도**: 최신 라이브러리 버전 확인
- **문서 조회**: 공식 문서 실시간 검색 및 로딩
- **베스트 프랙티스**: 현재 권장사항 자동 적용
- **버전 호환성**: 의존성 버전 확인

### 지원 라이브러리

- Python: FastAPI, Pydantic, SQLAlchemy, pytest
- JavaScript/TypeScript: React, Next.js, Node.js
- 데이터베이스: PostgreSQL, MongoDB, Redis
- 인프라: Docker, Kubernetes, AWS

## SPEC-First TDD 워크플로우

### 3단계 개발 사이클

#### 1단계: SPEC 명세서 생성 (`/moai:1-plan`)

manager-spec 에이전트가 EARS 형식으로 명세서를 생성합니다.

**EARS 요구사항 유형**

- **Ubiquitous**: 시스템 전체 항상 활성화 요구사항
- **Event-driven**: "X가 발생하면 Y를 수행" 형태
- **State-driven**: "X인 동안 Y를 수행" 형태
- **Unwanted**: "X를 수행하지 말아야 함" 형태
- **Optional**: "가능하다면 X를 수행" 형태

**출력물**: `.moai/specs/SPEC-XXX/spec.md`

**토큰 사용**: 약 30K 토큰

**완료 후**: `/clear` 명령어로 컨텍스트 정리 (45-50K 토큰 절약)

#### 2단계: TDD 구현 (`/moai:2-run`)

manager-tdd 에이전트가 RED-GREEN-REFACTOR 사이클을 실행합니다.

**RED 단계**

- 실패하는 테스트 작성
- 명세서 요구사항을 테스트로 변환
- 모든 엣지 케이스 커버

**GREEN 단계**

- 테스트 통과 최소한의 코드 구현
- 프로덕션 코드 작성
- 모든 테스트 통과 확인

**REFACTOR 단계**

- 코드 품질 개선
- 중복 제거
- 디자인 패턴 적용

**출력물**: 프로덕션 코드 + 테스트 코드 (85%+ 커버리지)

**토큰 사용**: 약 180K 토큰

#### 3단계: 문서 동기화 (`/moai:3-sync`)

manager-docs 에이전트가 자동으로 문서를 생성합니다.

**생성 문서**

- API 문서 (OpenAPI/Swagger)
- 아키텍처 다이어그램 (Mermaid)
- 사용자 가이드
- 개발자 문서

**출력물**: `.moai/docs/` 디렉토리에 저장된 문서

**토큰 사용**: 약 40K 토큰

### 총 토큰 예산

- SPEC: 30K
- TDD: 180K
- 문서: 40K
- **합계: 250K 토큰**

단계별 컨텍스트 정리로 200K 예산 내에서 2-3배 더 큰 프로젝트 수행 가능

## 20개 전문 에이전트 요약

### 매니저 에이전트 (8개)

에이전트명 | 역할 | 핵심 기능
---------|------|----------
manager-spec | 명세서 관리 | EARS 형식 명세서 생성 및 관리
manager-tdd | TDD 실행 | RED-GREEN-REFACTOR 사이클 자동화
manager-docs | 문서 관리 | 자동 문서 생성 및 동기화
manager-quality | 품질 관리 | TRUST 5 품질 게이트 실행
manager-git | Git 관리 | 브랜치 전략 및 커밋 관리
manager-project | 프로젝트 관리 | 프로젝트 구성 및 설정
manager-strategy | 전략 수립 | 시스템 아키텍처 설계
manager-claude-code | Claude 최적화 | Claude Code 설정 최적화

### 전문가 에이전트 (8개)

에이전트명 | 역할 | 핵심 기능
---------|------|----------
expert-backend | 백엔드 개발 | API, 서버, 데이터베이스
expert-frontend | 프론트엔드 개발 | UI, 컴포넌트, 상태 관리
expert-security | 보안 | 보안 검토 및 취약점 분석
expert-devops | 데브옵스 | CI/CD, 인프라, 배포
expert-performance | 성능 최적화 | 성능 분석 및 튜닝
expert-debug | 디버깅 | 문제 진단 및 해결
expert-testing | 테스트 | 테스트 전략 및 구현
expert-refactoring | 리팩토링 | 코드 개선 및 최적화

### 빌더 에이전트 (4개)

에이전트명 | 역할 | 핵심 기능
---------|------|----------
builder-agent | 에이전트 생성 | 새 서브에이전트 정의
builder-command | 명령어 생성 | 새 슬래시 명령어 정의
builder-skill | 스킬 생성 | 새 스킬 정의
builder-plugin | 플러그인 생성 | 새 플러그인 패키징

## 10개 핵심 슬래시 명령어 요약

명령어 | 카테고리 | 용도
-------|----------|------
`/moai:0-project` | 워크플로우 | 프로젝트 구성 초기화 및 관리
`/moai:1-plan` | 워크플로우 | EARS 명세서 생성
`/moai:2-run` | 워크플로우 | TDD 구현 실행
`/moai:3-sync` | 워크플로우 | 문서 동기화
`/moai:alfred` | 유틸리티 | 지능형 작업 라우팅
`/moai:fix` | 유틸리티 | 빠른 수정 및 루프
`/moai:loop` | 유틸리티 | 반복 작업 자동화
`/moai:cancel-loop` | 유틸리티 | 실행 중인 루프 중지
`/moai:9-feedback` | 로컬 | 개선 피드백 제출
`/clear` | 유틸리티 | 컨텍스트 초기화

## 개발 환경 요구사항

### 필수 구성 요소

**Python 3.10+**

- 프레임워크 훅 스크립트 실행
- 스킬 라이브러리 기능
- 데이터 처리 및 유틸리티

**Node.js 20+**

- MCP 서버 실행 (Context7)
- 프론트엔드 개발 (선택 사항)
- npm 패키지 관리

**Git**

- 버전 관리
- 브랜치 전략
- 커밋 메시지 형식화

**Claude Code CLI**

- 에이전트 실행
- 명령어 처리
- 스킬 로딩

### 선택적 구성 요소

**Docker**

- 컨테이너화된 개발 환경
- 일관된 의존성 관리
- 배포 자동화

**데이터베이스**

- PostgreSQL: 관계형 데이터베이스
- MongoDB: NoSQL 데이터베이스
- Redis: 캐싱 및 세션 저장소

**클라우드 플랫폼**

- AWS, GCP, Azure
- Vercel, Netlify (프론트엔드)
- GitHub Actions (CI/CD)

## 토큰 최적화 전략

### 토큰 예산 관리

**200K 토큰 예산 분할**

- SPEC 단계: 30K (요구사항 분석에 최적화)
- TDD 단계: 180K (구현에 최대 할당)
- 문서 단계: 40K (결과 캐싱 활용)

**절약 전략**

1. **단계 분리**: `/clear`로 단계 간 컨텍스트 정리
2. **선택적 로딩**: 필요한 파일만 로드
3. **컨텍스트 최적화**: 20-30K 토큰 목표 유지
4. **모델 선택**: Sonnet (품질) vs Haiku (속도/비용)

### Haiku 모델 활용

Haiku는 Sonnet 대비 70% 저렴하고 60-70% 전체 비용 절감 효과가 있습니다.

**적합한 작업**

- 간단한 코드 생성
- 문서 포맷팅
- 빠른 검색 및 조회

**부적합한 작업**

- 복잡한 아키텍처 설계
- 대규모 리팩토링
- 보안 검토

## 스킬 라이브러리 시스템

### 점진적 공개 구조

모든 스킬은 3단계 구조로 지식을 전달합니다.

**Level 1: Quick Reference (30초)**

- 핵심 원칙과 필수 개념
- 약 1,000 토큰
- 80% 이해를 5% 시간으로 획득

**Level 2: Implementation Guide (5분)**

- 실용 워크플로우와 예제
- 약 3,000 토큰
- 즉시 생산적 작업 가능

**Level 3: Advanced Patterns (10+분)**

- 심화 기술과 최적화
- 약 5,000 토큰
- 마스터 레벨 지식 습득

### 주요 스킬 카테고리

**핵심 프레임워크 (Foundation)**

- moai-foundation-claude: Claude Code 작성 키트
- moai-foundation-core: SPEC 시스템 및 워크플로우
- moai-foundation-philosopher: 전략적 사고

**언어 (Language)**

- moai-lang-python: Python 개발 패턴
- moai-lang-typescript: TypeScript/JavaScript 패턴
- moai-lang-javascript: 순수 JavaScript 패턴

**도메인 (Domain)**

- moai-domain-backend: 백엔드 아키텍처
- moai-domain-frontend: 프론트엔드 개발
- moai-domain-database: 데이터베이스 설계
- moai-domain-uiux: UI/UX 설계

**라이브러리 (Library)**

- moai-library-mermaid: Mermaid 다이어그램
- moai-library-nextra: Nextra 문서 사이트

**워크플로우 (Workflow)**

- moai-workflow-docs: 문서 생성
- moai-workflow-project: 프로젝트 관리
- moai-workflow-jit-docs: 실시간 문서 로딩

## 보안 및 샌드박싱

### OS 수준 보안 격리

**Linux**: bubblewrap(bwrap)를 통한 네임스페이스 기반 격리
**macOS**: Seatbelt(sandbox-exec)를 통한 프로필 기반 제한

### 기본 샌드박스 동작

- 파일 쓰기: 현재 작업 디렉토리로 제한
- 네트워크 접근: 허용된 도메인만 접근 가능
- 시스템 리소스: 수정으로부터 보호

### Auto-Allow 모드

안전한 작업은 자동 승인됩니다.

- 읽기 전용 작업: 허용된 경로에서만 읽기
- 쓰기 작업: 허용된 경로에만 쓰기
- 네트워크: 허용된 도메인만 접근

## 추가 리소스

### 프레임워크 문서

- `.moai/docs/`: 생성된 문서
- `.claude/skills/`: 스킬 라이브러리
- `CLAUDE.md`: Alfred 실행 지시문

### 공식 리소스

- Claude Code: https://code.anthropic.com
- MCP 프로토콜: https://modelcontextprotocol.io
- Context7: https://upstash.com

### 커뮤니티

- GitHub Issues: 버그 보고 및 기능 요청
- Discussions: 커뮤니티 토론

---

버전: 1.0.0
최종 업데이트: 2026-01-14
프레임워크: MoAI-ADK v1.0.0
