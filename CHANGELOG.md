# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### InBody UI/UX 디자인 개선 (2026-01-25)

**시각화 컴포넌트** (`src/components/inbody/visualizations/`)
- `body-type-shape.tsx` - 바디 타입 쉐이프 (C/I/D) 시각화
- `ecw-tbw-ratio.tsx` - ECW/TBW 비율 시각화
- `trend-sparkline.tsx` - 트렌드 스파크라인
- `enhanced-dashboard.tsx` - 향상된 대시보드

**각성 요소 (Awareness) 컴포넌트** (`src/components/inbody/awareness/`)
- `change-highlight.tsx` - 전후 비교 하이라이트
- `progress-indicator.tsx` - 목표 대비 진행률
- `summary-stats.tsx` - 요약 통계 카드

**게이미피케이션 컴포넌트** (`src/components/inbody/gamification/`)
- `streak-counter.tsx` - 연속 측정 스트릭 카운터
- `achievement-badges.tsx` - 마일스톤 업적 배지
- `goal-tracker.tsx` - 목표 설정 및 추적 UI

**기술 세부사항**
- InBody 공식 색상 시스템 유지 (Blue/Green/Orange)
- React 19 기반 최신 UI 패턴 적용
- shadcn/ui 컴포넌트와 통합
- TypeScript 타입 안전성 보장
- Recharts 라이브러리를 활용한 데이터 시각화

## [0.1.0] - 2026-01-14

### Added
- 프로젝트 초기 설정
- InBody 이미지 업로드 기능
- OCR 데이터 추출 기능
- AI 건강 분석 기능
- 사용자 인증 시스템
