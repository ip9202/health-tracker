# Changelog

이 프로젝트의 모든 주요 변경 사항이 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)을 기반으로 하며, 이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### 추가 (Added)
- SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템 (진행 중)
  - Zod 응답 검증 스키마 구현 (TAG-AI-004)
  - RiskFactorSchema: 위험 요소 카테고리 및 레벨 검증
  - RecommendationSchema: 운동/영양/생활 습관 추천 검증
  - WarningSchema: 주의 사항 심각도 및 액션 가능성 검증
  - HealthAnalysisSchema: 통합 건강 분석 결과 검증
- SPEC-FE-004: InBody 데이터 관리 대시보드 기능
  - 드래그 앤 드롭 이미지 업로드 UI
  - 파일 형식 검증 (JPG/PNG)
  - 파일 크기 제한 (10MB)
  - 업로드 진행률 표시 컴포넌트
  - InBody API 클라이언트 (업로드, 조회, 삭제)
  - TypeScript 타입 정의 및 Zod 스키마 검증
  - 반응형 대시보드 레이아웃

### 변경 (Changed)
- NextAuth.js 5 beta 버전으로 업그레이드
- Prisma 6.0.0으로 업그레이드
- React 19로 업그레이드

### 수정 (Fixed)
- 인증 미들웨어 경로 처리 개선
- 비밀번호 해싱 보안 강화

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
