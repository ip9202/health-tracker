# 프로젝트 구조

## 디렉토리 트리

```
health/
├── .claude/                    # Claude Code 설정 및 커스터마이징
│   ├── agents/                 # 서브에이전트 정의
│   │   └── moai/              # MoAI 전용 에이전트 (20개)
│   │       ├── manager-*.md   # 매니저 에이전트 (8개)
│   │       ├── expert-*.md    # 전문가 에이전트 (8개)
│   │       └── builder-*.md   # 빌더 에이전트 (4개)
│   ├── commands/               # 슬래시 명령어 정의
│   │   └── moai/              # MoAI 전용 명령어 (10개)
│   │       ├── 0-project.md   # 프로젝트 구성 관리
│   │       ├── 1-plan.md      # 명세서 생성
│   │       ├── 2-run.md       # TDD 구현
│   │       ├── 3-sync.md      # 문서 동기화
│   │       ├── 9-feedback.md  # 피드백 수집
│   │       ├── alfred.md      # 지능형 라우팅
│   │       ├── fix.md         # 빠른 수정
│   │       ├── loop.md        # 반복 작업 자동화
│   │       └── cancel-loop.md # 루프 중지
│   ├── hooks/                  # 이벤트 기반 자동화 스크립트
│   │   └── moai/              # MoAI 전용 훅
│   │       ├── lib/           # 공유 라이브러리
│   │       ├── session_start__show_project_info.py
│   │       ├── session_end__auto_cleanup.py
│   │       ├── pre_tool__security_guard.py
│   │       ├── post_tool__linter.py
│   │       └── post_tool__code_formatter.py
│   ├── output-styles/          # 출력 스타일 테마
│   │   └── moai/
│   │       ├── r2d2.md        # R2-D2 스타일
│   │       └── yoda.md        # Yoda 스타일
│   └── skills/                 # 모델 호출 기반 확장 기능
│       └── moai-*/            # MoAI 전용 스킬 라이브러리
│           ├── moai-foundation-*/   # 핵심 프레임워크 스킬
│           ├── moai-lang-*/         # 언어별 스킬
│           ├── moai-domain-*/       # 도메인별 스킬
│           ├── moai-library-*/      # 라이브러리 스킬
│           ├── moai-workflow-*/     # 워크플로우 스킬
│           └── moai-*/              # 기타 유틸리티 스킬
├── .moai/                      # MoAI-ADK 프레임워크 설정
│   ├── config/                 # 설정 파일
│   │   ├── config.yaml        # 메인 설정 파일
│   │   └── sections/          # 모듈화된 설정 섹션
│   │       ├── user.yaml      # 사용자 설정
│   │       ├── language.yaml  # 언어 설정
│   │       ├── project.yaml   # 프로젝트 메타데이터
│   │       ├── git-strategy.yaml # Git 워크플로우
│   │       ├── quality.yaml   # 품질 설정 (TRUST 5)
│   │       └── system.yaml    # 시스템 설정
│   ├── project/                # 프로젝트 문서
│   │   ├── product.md         # 제품 개요
│   │   ├── structure.md       # 구조 설명 (본 파일)
│   │   └── tech.md            # 기술 스택
│   ├── docs/                   # 생성된 문서 저장소
│   ├── logs/                   # 런타임 로그 (30일 보관)
│   ├── temp/                   # 임시 파일 (7일 보관)
│   ├── cache/                  # 캐시 파일 (30일 보관)
│   └── specs/                  # 명세서 저장소
│       └── SPEC-XXX/          # 개별 명세서
│           └── spec.md        # EARS 형식 명세서
├── .mcp.json                   # MCP 서버 설정
├── .gitignore                  # Git 무시 파일
├── CLAUDE.md                   # Claude Code 실행 지시문
└── src/                        # 애플리케이션 소스 코드 (추가 예정)
```

## 주요 디렉토리 설명

### `.claude/` - Claude Code 설정

Claude Code의 동작을 제어하는 모든 커스터마이징 파일이 포함됩니다.

#### `agents/` - 서브에이전트 정의

20개의 전문화된 에이전트가 정의된 마크다운 파일들입니다. 각 에이전트는 YAML 프론트매터와 시스템 프롬프트로 구성됩니다.

**매니저 에이전트 (8개)**

- `manager-spec`: EARS 명세서 생성
- `manager-tdd`: TDD 사이클 실행
- `manager-docs`: 문서 생성 및 동기화
- `manager-quality`: 품질 검증 및 TRUST 5 적용
- `manager-git`: Git 워크플로우 관리
- `manager-project`: 프로젝트 구성 관리
- `manager-strategy`: 시스템 설계 및 아키텍처
- `manager-claude-code`: Claude Code 최적화

**전문가 에이전트 (8개)**

- `expert-backend`: 백엔드 API 개발
- `expert-frontend`: 프론트엔드 UI 개발
- `expert-security`: 보안 검토 및 구현
- `expert-devops`: 인프라 및 배포
- `expert-performance`: 성능 최적화
- `expert-debug`: 디버깅 및 문제 해결
- `expert-testing`: 테스트 전략 및 구현
- `expert-refactoring`: 리팩토링 및 코드 개선

**빌더 에이전트 (4개)**

- `builder-agent`: 새 에이전트 생성
- `builder-command`: 새 명령어 생성
- `builder-skill`: 새 스킬 생성
- `builder-plugin`: 새 플러그인 생성

#### `commands/` - 슬래시 명령어

사용자가 `/`로 시작하는 명령어를 입력할 때 실행되는 스크립트들입니다.

**핵심 명령어**

- `0-project`: 프로젝트 구성 초기화 및 관리
- `1-plan`: 명세서 생성 (EARS 형식)
- `2-run`: TDD 구현 실행
- `3-sync`: 문서 동기화
- `9-feedback`: 개선 피드백 제출

**유틸리티 명령어**

- `alfred`: 지능형 작업 라우팅
- `fix`: 빠른 수정 및 루프
- `loop`: 반복 작업 자동화
- `cancel-loop`: 실행 중인 루프 중지

#### `hooks/` - 이벤트 기반 자동화

특정 이벤트가 발생할 때 자동으로 실행되는 Python 스크립트들입니다.

**세션 훅**

- `session_start__show_project_info.py`: 세션 시작 시 프로젝트 정보 표시
- `session_end__auto_cleanup.py`: 세션 종료 시 자동 정리

**툴 훅**

- `pre_tool__security_guard.py`: 보안 검사 사전 실행
- `post_tool__linter.py`: 린터 사후 실행
- `post_tool__code_formatter.py`: 코드 포맷터 사후 실행
- `post_tool__ast_grep_scan.py`: AST 그랩 스캔 사후 실행

**루프 컨트롤 훅**

- `stop__loop_controller.py`: 루프 제어 로직

#### `skills/` - 모델 호출 기반 확장

Claude 모델이 상황에 따라 동적으로 로드하는 지식 베이스입니다.

**핵심 스킬**

- `moai-foundation-claude`: Claude Code 작성 키트
- `moai-foundation-core`: SPEC 시스템 및 핵심 워크플로우
- `moai-foundation-philosopher`: 전략적 사고 프레임워크

**도메인 스킬**

- `moai-domain-backend`: 백엔드 개발 패턴
- `moai-domain-frontend`: 프론트엔드 개발 패턴
- `moai-domain-database`: 데이터베이스 설계 및 최적화
- `moai-domain-uiux`: UI/UX 설계 및 접근성

**라이브러리 스킬**

- `moai-library-mermaid`: Mermaid 다이어그램 생성
- `moai-library-nextra`: Nextra 문서 사이트 구축

**워크플로우 스킬**

- `moai-workflow-docs`: 문서 생성 워크플로우
- `moai-workflow-project`: 프로젝트 관리
- `moai-workflow-jit-docs`: 실시간 문서 로딩

### `.moai/` - 프레임워크 설정

MoAI-ADK 프레임워크의 핵심 설정과 생성된 아티팩트가 저장됩니다.

#### `config/` - 설정 관리

모듈화된 YAML 설정 파일들로 관리됩니다.

**핵심 설정 파일**

- `config.yaml`: 메인 설정 파일 (모든 섹션 참조)
- `sections/user.yaml`: 사용자 이름 및 개인 설정
- `sections/language.yaml`: 언어 설정 (대화, 코드, 문서)
- `sections/project.yaml`: 프로젝트 메타데이터
- `sections/git-strategy.yaml`: Git 워크플로우 설정
- `sections/quality.yaml`: TRUST 5 품질 설정
- `sections/system.yaml`: 시스템 버전 및 업데이트

#### `project/` - 프로젝트 문서

프로젝트 관련 문서가 저장됩니다.

- `product.md`: 제품 개요 및 기능 설명
- `structure.md`: 프로젝트 구조 설명 (본 파일)
- `tech.md`: 기술 스택 및 프레임워크 상세

#### `specs/` - 명세서 저장소

EARS 형식으로 작성된 기능 명세서들이 저장됩니다.

```
specs/
├── SPEC-001/
│   └── spec.md
├── SPEC-002/
│   └── spec.md
└── ...
```

#### 문서 관리 시스템

프레임워크는 런타임 데이터와 문서를 명확히 분리합니다.

- `docs/`: 생성된 문서 (영구 보관)
- `logs/`: 런타임 로그 (30일 자동 삭제)
- `temp/`: 임시 파일 (7일 자동 삭제)
- `cache/`: 캐시 파일 (30일 자동 삭제)

### `.mcp.json` - MCP 서버 설정

Model Context Protocol 서버들의 연결 설정을 포함합니다.

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  },
  "staggeredStartup": {
    "enabled": true,
    "delayMs": 500,
    "connectionTimeout": 15000
  }
}
```

현재 Context7 MCP 서버가 구성되어 있어 최신 공식 문서를 실시간으로 조회할 수 있습니다.

### `CLAUDE.md` - 실행 지시문

Alfred(오케스트레이터)의 동작을 제어하는 핵심 지시문입니다.

- Alfred의 3단계 실행 모델 정의
- 에이전트 위임 패턴 명시
- 20개 에이전트 호출 가이드
- 언어 응답 규칙
- 토큰 관리 전략
- 보안 샌드박싱 가이드

### `src/` - 애플리케이션 소스 코드

실제 애플리케이션 코드가 추가될 디렉토리입니다. 현재는 비어 있습니다.

**예상 구조** (프로젝트 타입에 따라 달라집니다)

```
src/
├── backend/              # 백엔드 코드
│   ├── api/             # API 엔드포인트
│   ├── models/          # 데이터 모델
│   ├── services/        # 비즈니스 로직
│   └── tests/           # 테스트 코드
├── frontend/            # 프론트엔드 코드
│   ├── components/      # UI 컴포넌트
│   ├── pages/           # 페이지
│   └── styles/          # 스타일시트
└── shared/              # 공유 코드
    ├── types/           # 타입 정의
    └── utils/           # 유틸리티 함수
```

## 주요 파일 위치 참조

| 파일 | 경로 | 용도 |
|------|------|------|
| 메인 설정 | `.moai/config/config.yaml` | 프레임워크 전체 설정 |
| 사용자 설정 | `.moai/config/sections/user.yaml` | 사용자 이름 및 개인 설정 |
| 언어 설정 | `.moai/config/sections/language.yaml` | 대화 및 코드 언어 |
| 품질 설정 | `.moai/config/sections/quality.yaml` | TRUST 5 품질 기준 |
| 실행 지시문 | `CLAUDE.md` | Alfred 오케스트레이션 규칙 |
| MCP 설정 | `.mcp.json` | Context7 서버 연결 |
| 프로젝트 문서 | `.moai/project/` | 제품, 구조, 기술 문서 |

---

버전: 1.0.0
최종 업데이트: 2026-01-14
프레임워크: MoAI-ADK v1.0.0
