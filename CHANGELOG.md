# Changelog

이 프로젝트의 모든 주요 변경 사항이 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)을 기반으로 하며, 이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

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
