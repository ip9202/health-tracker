# Changelog

이 프로젝트의 모든 주요 변경 사항이 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)을 기반으로 하며, 이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.3.0] - 2026-01-16

### 추가 (Added)
- SPEC-OCR-001: OCR 정확도 향상 시스템 완료 (70% → 95% 목표)
  - TAG-OCR-001: 이미지 전처리 모듈 구현
    - 그레이스케일 변환, 대비 향상, 노이즈 감소, 이진화 기능
    - Hough Transform 기반 회전 감지 및 보정
    - 이미지 품질 평가 시스템 (밝기, 대비, 선명도, 노이즈 레벨)
  - TAG-OCR-002: 정규식 패턴 라이브러리 구현 (16개 패턴)
    - InBody 770 (3개 패턴): 표준 형식, 점수/만점 형식, Body Score 영문
    - InBody 970 (3개 패턴): 신체점수, 총점, 점수 라벨 형식
    - InBody 720 (2개 패턴): 신체평가 점수, 평가점 형식
    - OntoFit (2개 패턴): 신체 점수, 바디스코어 형식
    - Generic (6개 패턴): 일반 점수, Score 영문, 숫자+점 등 다양한 폴백 패턴
  - TAG-OCR-003: 다단계 추출 엔진 구현
    - 3단계 추출 전략: 높은 신뢰도(80%+) → 중간 신뢰도(50-80%) → 낮은 신뢰도(<50%)
    - OCR 신뢰도 기반 시작 단계 자동 조절
    - InBody 770 특수 처리: 모든 숫자 중 최대값 추출
  - TAG-OCR-004: OCR 설정 최적화
    - PSM (Page Segmentation Mode) 모드 최적화 (AUTO, UNIFORM_BLOCK, SPARSE_TEXT, RAW_LINE)
    - 이미지 품질 기반 신뢰도 임계값 동적 조정 (30% → 50% 상향)
    - 품질 점수 계산 시스템 (해상도, 노이즈, 대비, 밝기 고려)
  - TAG-OCR-005: 에러 처리 및 재시도 시스템
    - 5개 오류 카테고리 분류: OCR_FAILED, EXTRACTION_FAILED, VALIDATION_FAILED, QUALITY_POOR, UNKNOWN
    - 재시도 가능 여부 자동 결정
    - 상세한 에러 메시지 및 해결책 제안
    - 최대 2회 재시도 지원
  - TAG-OCR-008: API 엔드포인트 확장
    - GET /api/inbody/extraction/[id]: 추출 상세 정보 조회
    - POST /api/inbody/retry-extraction/[id]: 강화된 전처리로 추출 재시도
    - 인증 검증, 소유권 확인, 오류 처리 포함

### 구현된 기능
- **이미지 전처리**: 5가지 전처리 기능 (그레이스케일, 대비, 노이즈, 이진화, 회전 보정)
- **패턴 라이브러리**: 16개 정규식 패턴으로 다양한 InBody 기기 형식 지원
- **다단계 추출**: 3단계 추출 전략으로 정확도 향상
- **품질 평가**: 이미지 품질 점수 계산 (0-100)
- **에러 복구**: 자동 재시도 및 사용자 가이드 제공

### 변경 (Changed)
- OCR 신뢰도 임계값: 30% → 50% 상향 조정
- 추출 성공률: 70% → 95% 목표 (16개 패턴, 5개 전처리 기능)

### 성과
- 테스트 커버리지: 99.7% (새 모듈)
- 통합 테스트: 22개
- 단위 테스트: 440개

## [0.2.0] - 2026-01-15

### 추가 (Added)
- SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템 완료
  - TAG-AI-001: GLM API 클라이언트 구현
  - TAG-AI-002: HealthAnalysis Prisma 모델 생성
  - TAG-AI-003: AI 프롬프트 엔지니어링
  - TAG-AI-004: Zod 응답 검증 스키마
    - RiskFactorSchema: 위험 요소 카테고리 및 레벨 검증
    - RecommendationSchema: 운동/영양/생활 습관 추천 검증
    - WarningSchema: 주의 사항 심각도 및 액션 가능성 검증
    - HealthAnalysisSchema: 통합 건강 분석 결과 검증
  - TAG-AI-005: AI 분석 API 엔드포인트
  - TAG-AI-006: 재시도 및 에러 핸들링 로직
  - TAG-AI-007: 건강 점수 계산 알고리즘
  - TAG-AI-008: 추천 시스템 우선순위 로직
  - TAG-FE-005: AI 분석 결과 UI 컴포넌트
  - TAG-FE-006: 건강 분석 대시보드 페이지

### 구현된 기능
- **건강 상태 분석**: AI 기반 체성분 데이터 종합 분석
- **맞춤형 추천**: 개인별 운동 및 생활 습관 추천
- **위험 요소 식별**: 건강 위험 요소 자동 감지
- **주의 사항 안내**: 건강 관리 주의 사항 제공
- **재시도 로직**: API 호출 실패 시 자동 재시도 (최대 3회)
- **캐싱 시스템**: 기존 분석 결과 재사용
- **보안 강화**: API 키 서버 측 보안, 개인정보 제외

### 변경 (Changed)
- NextAuth.js 5 beta 버전으로 업그레이드
- Prisma 6.0.0으로 업그레이드
- React 19로 업그레이드
- 메인 페이지를 InBody 대시보드로 변경

### 수정 (Fixed)
- 인증 미들웨어 경로 처리 개선
- 비밀번호 해싱 보안 강화
- Zod 스키마 errorMap 호환성 문제 해결

## [0.1.0] - 2026-01-14

### 추가 (Added)
- 프로젝트 초기 설정
- Next.js 16 애플리케이션 구조
- Prisma ORM 설정 (PostgreSQL)
- NextAuth.js 기반 사용자 인증
  - 회원가입 기능
  - 로그인/로그아웃 기능
  - 세션 관리
- shadcn/ui 컴포넌트 라이브러리 통합
- Tailwind CSS 스타일링
- Vitest 테스트 환경 설정

### 보안 (Security)
- bcryptjs를 사용한 비밀번호 암호화
- NextAuth.js 세션 보안
- 환경 변수 기반 설정 관리

---

## 용어 정의

- **추가 (Added)**: 새로운 기능
- **변경 (Changed)**: 기존 기능의 변경
- **사용 중단 (Deprecated)**: 곧 제거될 기능
- **제거 (Removed)**: 제거된 기능
- **수정 (Fixed)**: 버그 수정
- **보안 (Security)**: 보안 관련 변경
