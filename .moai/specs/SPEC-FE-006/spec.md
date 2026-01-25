# SPEC-FE-006: InBody UI/UX 전면 리디자인

## 메타데이터

| 항목 | 값 |
|------|-----|
| **ID** | SPEC-FE-006 |
| **제목** | InBody UI/UX 전면 리디자인 (Complete Redesign) |
| **상태** | completed |
| **생성일** | 2026-01-25 |
| **완료일** | 2026-01-25 |
| **버전** | 1.1.0 |
| **도메인** | Frontend (UI/UX) |
| **우선순위** | High |
| **복잡도** | High - 전체 대시보드 재설계 |
| **라이프사이클** | spec-first |

## 개요

### 프로젝트 배경

VIBE Health 애플리케이션의 InBody 대시보드 UI/UX를 완전히 재디자인합니다. 기존 디자인은 버리고 InBody 공식 보고서의 전문적인 의료 미학과 일치하는 혁신적인 새로운 디자인 시스템을 도입합니다.

### 리디자인 범위

- **전면 재디자인(Complete Redesign)**: 색상, 레이아웃, 폰트, 컴포넌트 모두 변경
- **기존 요소 보존 안함**: 현재 디자인을 완전히 폐기하고 새로운 디자인으로 교체
- **InBody 공식 스타일**: 의료급 전문성과 깔끔한 미학 적용

### 핵심 요구사항

사용자가 명시한 요구사항:

1. "페이지 UI/UX를 완전히 새롭게 변경할거야" - 전면 UI/UX 재설계
2. "색상, 디자인 모두 변경할꺼야" - 모든 시각적 요소 변경
3. "획기적으로 인바디에 맞는 스타일로" - InBody 브랜드에 맞는 혁신적 스타일
4. "stitch 를 이용해서 변경" - Stitch MCP 활용
5. "지금 디자인은 완전히 버리고 새롭게 디자인해줘" - 기존 디자인 완전 폐기

### 선택한 리디자인 범위

**전면 리디자인(Complete Redesign)**:
- 대시보드 전체 UI/UX 재설계
- 새로운 InBody 스타일: 색상, 레이아웃, 폰트, 컴포넌트 모두 변경
- 기존 디자인 요소 보존 안함

## 환경

### 기술 스택

- **프레임워크**: Next.js 16.0.0 (App Router)
- **UI 라이브러리**: React 19.0.0
- **기반 컴포넌트**: shadcn/ui
- **데이터 시각화**: Recharts 3.6.0
- **스타일링**: Tailwind CSS 3.4.19
- **타입스크립트**: TypeScript 5.9.0
- **UI 생성**: Stitch MCP

### 대상 컴포넌트

```
src/components/inbody/
├── visualizations/      # 시각화 컴포넌트 (완전 재설계)
│   ├── body-type-shape.tsx
│   ├── ecw-tbw-ratio.tsx
│   ├── trend-sparkline.tsx
│   └── enhanced-dashboard.tsx
├── awareness/           # 인식 컴포넌트 (완전 재설계)
│   ├── change-highlight.tsx
│   ├── progress-indicator.tsx
│   └── summary-stats.tsx
├── gamification/        # 게이미피케이션 (완전 재설계)
│   ├── streak-counter.tsx
│   ├── achievement-badges.tsx
│   └── goal-tracker.tsx
├── result/              # 결과 컴포넌트 (완전 재설계)
│   ├── inbody-result-card.tsx
│   ├── body-score-section.tsx
│   ├── body-composition-section.tsx
│   ├── obesity-analysis-section.tsx
│   └── segmental-analysis-section.tsx
└── inbody-dashboard.tsx # 메인 대시보드 (완전 재설계)
```

## 가정

### 데이터 가정

- 기존 InBody 데이터 구조는 유지됨 (Prisma 스키마 변경 없음)
- AI 분석 결과 API는 그대로 사용 가능
- OCR 추출 시스템은 변경 없음

### 사용자 가정

- 사용자는 데스크탑 및 모바일 환경 모두에서 액세스
- 사용자는 의료 전문가가 아닌 일반 사용자
- 한국어 사용자를 주요 타겟으로 함

### 기술 가정

- Stitch MCP가 React 컴포넌트 생성을 지원함
- shadcn/ui 컴포넌트가 완전히 커스터마이징 가능함
- Recharts가 InBody 스타일 차트를 지원함

## 요구사항 (EARS 형식)

### Ubiquitous (상시 요구사항)

**REQ-FE-006-001**: 시스템은 InBody 공식 색상 시스템(Blue/Green/Orange)을 사용하여 일관된 브랜드 아이덴티티를 유지해야 한다.

**REQ-FE-006-002**: 모든 UI 컴포넌트는 의료급 전문성을 반영한 깔끔하고 최소화된 디자인을 가져야 한다.

**REQ-FE-006-003**: 모든 컴포넌트는 React 19 Server Components와 호환되어야 한다.

**REQ-FE-006-004**: 모든 컴포넌트는 TypeScript 엄격 모드로 타입 안전성을 보장해야 한다.

**REQ-FE-006-005**: 시스템은 반응형 디자인을 통해 모바일과 데스크탑 환경 모두에서 최적의 사용자 경험을 제공해야 한다.

### Event-driven (이벤트 기반 요구사항)

**REQ-FE-006-010**: WHEN 사용자가 InBody 대시보드에 접속하면, 시스템은 새로운 InBody 스타일의 전문적인 레이아웃을 표시해야 한다.

**REQ-FE-006-011**: WHEN 사용자가 체성분 결과를 조회하면, 시스템은 InBody 공식 보고서 스타일의 바디 타입 시각화(C/I/D)를 제공해야 한다.

**REQ-FE-006-012**: WHEN 사용자가 ECW/TBW 비율을 확인하면, 시스템은 의료급 차트로 세포외액/체내수분 비율을 시각화해야 한다.

**REQ-FE-006-013**: WHEN 사용자가 건강 데이터 추이를 확인하면, 시스템은 InBody 스타일의 스파크라인 차트를 표시해야 한다.

**REQ-FE-006-014**: WHEN 사용자가 부위별 근육 분석을 조회하면, 시스템은 인체 다이어그램 기반의 시각화를 제공해야 한다.

**REQ-FE-006-015**: WHEN 사용자가 현재 데이터와 과거 데이터를 비교하면, 시스템은 전후 비교를 명확하게 하이라이트해야 한다.

**REQ-FE-006-016**: WHEN 사용자가 목표를 설정하면, 시스템은 InBody 스타일의 진행률 표시기를 제공해야 한다.

**REQ-FE-006-017**: WHEN 사용자가 요약 통계를 확인하면, 시스템은 전문적인 의료 보고서 스타일의 카드를 표시해야 한다.

**REQ-FE-006-018**: WHEN 사용자가 연속 측정 달성 기록을 확인하면, 시스템은 InBody 스타일의 스트릭 카운터를 표시해야 한다.

**REQ-FE-006-019**: WHEN 사용자가 업적을 달성하면, 시스템은 InBody 브랜드에 맞는 배지를 수여해야 한다.

### State-driven (상태 기반 요구사항)

**REQ-FE-006-020**: WHILE 사용자가 대시보드를 탐색하는 동안, 시스템은 일관된 InBody 디자인 언어를 유지해야 한다.

**REQ-FE-006-021**: WHILE 사용자가 데이터를 로딩하는 동안, 시스템은 InBody 스타일의 로딩 인디케이터를 표시해야 한다.

**REQ-FE-006-022**: WHILE 사용자가 모바일 환경에서 접속하는 동안, 시스템은 모바일 최적화 레이아웃을 제공해야 한다.

### Unwanted (금지 요구사항)

**REQ-FE-006-030**: 시스템은 기존 디자인 요소를 보존해서는 안 된다.

**REQ-FE-006-031**: 시스템은 InBody 브랜드 가이드라인을 위반하는 색상이나 스타일을 사용해서는 안 된다.

**REQ-FE-006-032**: 컴포넌트는 타입 안전성을 compromise하는 방식으로 구현되어서는 안 된다.

**REQ-FE-006-033**: UI는 의료급 전문성을 저해하는 과도한 장식이나 애니메이션을 포함해서는 안 된다.

### Optional (선택 요구사항)

**REQ-FE-006-040**: 시스템은 다크 모드를 지원할 수 있다.

**REQ-FE-006-041**: 시스템은 다국어 지원(영어, 일본어 등)을 제공할 수 있다.

**REQ-FE-006-042**: 시스템은 인쇄용 PDF 내보내기 기능을 제공할 수 있다.

## 상세 요구사항

### 1. 디자인 시스템

**NFR-DS-001**: InBody 공식 색상 팔레트 적용
- Primary Blue: `#0066CC` (InBody 브랜드 컬러)
- Success Green: `#22C55E` (정상 범위)
- Warning Orange: `#F97316` (주의 필요)
- Background: `#FFFFFF` (의료용 흰색 바탕)
- Text: `#1F2937` (읽기 용이한 다크 그레이)

**NFR-DS-002**: 타이포그래피
- 제목: `Pretendard` 또는 `Inter` (한국어 최적화)
- 본문: `Pretendard` 14-16px
- 숫자: `Roboto Mono` (데이터 강조)
- 라인 높이: 1.5-1.8 (가독성)

**NFR-DS-003**: 간격과 레이아웃
- 8px 기반 그리드 시스템
- 카드 간격: 16-24px
- 섹션 간격: 32-48px
- 컨테이너 최대 너비: 1200px

**NFR-DS-004**: 컴포넌트 스타일
- 둥근 모서리: 4-8px (최소화)
- 그림자: 미세한 그림자만 사용
- 테두리: 1px solid `#E5E7EB`
- 호버 효과: 미세한 배경색 변화

### 2. 핵심 시각화 컴포넌트

**FR-VIZ-001**: 바디 타입 쉐이프 (Body Type Shape)
- C-Type (Curling): 골격근량 부족 시각화
- I-Type (Ideal): 이상적인 균형 시각화
- D-Type (Dual): 근육/지방 불균형 시각화
- SVG 기반 인체 실루엣
- 색상으로 타입 구분 (Blue/Green/Orange)

**FR-VIZ-002**: ECW/TBW 비율 차트
- 원형 차트 또는 게이지 차트
- 정상 범위: 0.38-0.39
- 색상으로 상태 구분
- 퍼센트 값 명시

**FR-VIZ-003**: 트렌드 스파크라인
- 체중, BMI, 체지방률 추이
- 최근 7-30일 데이터
- 미니멀한 라인 차트
- 양/음 변화 색상 구분

**FR-VIZ-004**: 부위별 근육 분석
- 인체 다이어그램
- 부위별 근육량 색상 매핑
- 호버 시 상세 정보 표시

**FR-VIZ-005**: 비교 분석 차트
- Before/After 비교
- 막대 그래프 또는 방사형 차트
- 변화율 퍼센트 표시

### 3. 각성 요소 컴포넌트

**FR-AWR-001**: 변화 하이라이트
- 전후 데이터 비교
- 양/음 변화 색상 및 아이콘
- 퍼센트 변화 명시
- emoji 또는 아이콘으로 감정 표현

**FR-AWR-002**: 진행률 표시기
- 목표 대비 진행률
- 선형 진행 바 또는 원형 진행률
- 퍼센트 및 남은 일수 표시
- 색상으로 진행 상태 구분

**FR-AWR-003**: 요약 통계 카드
- 주요 지표 카드 (체중, BMI, 체지방륨 등)
- 뱃지 형태의 상태 표시 (정상/주의/위험)
- 트렌드 아이콘 (상승/하락/유지)
- 전문적인 의료 보고서 스타일

### 4. 게이미피케이션 컴포넌트

**FR-GAM-001**: 스트릭 카운터
- 연속 측정 일수
- 불꽃 아이콘 또는 메달
- 최고 기록과 현재 기록 비교
- 도전 과제 표시

**FR-GAM-002**: 업적 배지
- 마일스톤 달성 시 배지 부여
- 첫 측정, 7일 연속, 30일 달성 등
- InBody 브랜드에 맞는 배지 디자인
- 배지 컬렉션 표시

**FR-GAM-003**: 목표 추적기
- 목표 설정 및 진행 현황
- 목표 달성률 차트
- 남은 기간 표시
- 동기 부여 메시지

### 5. 대시보드 레이아웃

**FR-LAY-001**: 메인 대시보드 구성
- 헤더: 사용자 정보, 날짜 선택, 설정
- 요약 섹션: 핵심 지표 카드
- 시각화 섹션: 바디 타입, ECW/TBW 차트
- 상세 섹션: 부위별 분석, 비교 차트
- 게이미피케이션 섹션: 스트릭, 배지, 목표

**FR-LAY-002**: 반응형 레이아웃
- 데스크탑: 3-4열 그리드
- 태블릿: 2열 그리드
- 모바일: 단열 스택

**FR-LAY-003**: 네비게이션
- 상단 고정 헤더
- 측면 사이드바 (데스크탑)
- 하단 탭 바 (모바일)
- 브레드크럼

## 기술 세부사항

### UI 생성: Stitch MCP

**TR-STITCH-001**: Stitch MCP를 활용한 컴포넌트 생성
- 이미지 기반 컴포넌트 생성
- InBody 보고서 샘플 이미지를 참조
- React 19 + Tailwind CSS 출력

**TR-STITCH-002**: Stitch 활용 프로세스
1. InBody 공식 보고서 이미지 수집
2. Stitch MCP로 이미지 분석 및 컴포넌트 생성
3. 생성된 컴포넌트를 프로젝트에 통합
4. 타입 안전성 검증 및 커스터마이징

### 의존성

```json
{
  "react": "^19.0.0",
  "next": "^16.0.0",
  "@types/react": "^19.0.0",
  "@types/node": "^22.0.0",
  "recharts": "^3.6.0",
  "tailwindcss": "^3.4.19",
  "typescript": "^5.9.0"
}
```

### 타입 안전성

모든 컴포넌트는 TypeScript 엄격 모드로 개발:
- Props 인터페이스 정의
- 이벤트 핸들러 타입 명시
- Zod 스키마로 런타임 검증

### 접근성

- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환
- 충분한 색상 대비

## 품질 기준

### 성능

- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3.5s

### 사용자 경험

- 일관된 디자인 언어
- 명확한 시각적 계층
- 직관적인 네비게이션
- 빠른 로딩 속도

### 코드 품질

- TypeScript 커버리지: 100%
- ESLint 경고: 0
- 테스트 커버리지: > 80%

## 추적성

### 태그

- **TAG-FE-010**: 디자인 시스템 구축
- **TAG-FE-011**: 시각화 컴포넌트 재설계
- **TAG-FE-012**: 각성 요소 컴포넌트 재설계
- **TAG-FE-013**: 게이미피케이션 컴포넌트 재설계
- **TAG-FE-014**: 대시보드 레이아웃 재설계

### 관련 SPEC

- **SPEC-FE-005**: InBody UI/UX 디자인 개선 (기존 완료 작업)
- **SPEC-OCR-001**: InBody OCR 데이터 추출
- **SPEC-AI-001**: AI 건강 분석 시스템

### 관련 문서

- `src/components/inbody/` : 대상 컴포넌트 디렉토리
- `tailwind.config.ts` : 디자인 시스템 설정
- `.moai/project/tech.md` : 기술 스택 정의

## 변경 이력

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|---------|--------|
| 1.1.0 | 2026-01-25 | 전면 리디자인 구현 완료 | Alfred |
| 1.0.0 | 2026-01-25 | 초기 문서 작성 | Alfred |

## 구현된 컴포넌트 목록

### 시각화 컴포넌트 (TAG-FE-011)
1. **body-type-shape.tsx** - 바디 타입 쉐이프 (C/I/D 타입 시각화)
2. **ecw-tbw-ratio.tsx** - ECW/TBW 비율 차트
3. **trend-sparkline.tsx** - 트렌드 스파크라인
4. **enhanced-dashboard.tsx** - 향상된 대시보드
5. **segmental-analysis.tsx** - 부위별 근육 분석
6. **comparison-chart.tsx** - 비교 분석 차트

### 각성 요소 컴포넌트 (TAG-FE-012)
7. **change-highlight.tsx** - 변화 하이라이트
8. **progress-indicator.tsx** - 진행률 표시기
9. **summary-stats.tsx** - 요약 통계 카드

### 게이미피케이션 컴포넌트 (TAG-FE-013)
10. **streak-counter.tsx** - 스트릭 카운터
11. **achievement-badges.tsx** - 업적 배지
12. **goal-tracker.tsx** - 목표 추적기

### 결과 컴포넌트
13. **inbody-result-card.tsx** - InBody 결과 카드
14. **body-score-section.tsx** - 신체 점수 섹션
15. **body-composition-section.tsx** - 체성분 섹션
16. **obesity-analysis-section.tsx** - 비만 분석 섹션
17. **segmental-analysis-section.tsx** - 부위별 분석 섹션

### 메인 컴포넌트 (TAG-FE-014)
18. **inbody-dashboard.tsx** - 메인 대시보드 (전면 리디자인 완료)

### 기록 컴포넌트
19. **history-list.tsx** - 기록 목록

## 구현된 디자인 시스템

### 색상 시스템 (NFR-DS-001)
- Primary Blue: `#0066CC` (InBody 브랜드 컬러) ✓
- Success Green: `#22C55E` (정상 범위) ✓
- Warning Orange: `#F97316` (주의 필요) ✓
- Background: `#FFFFFF` (의료용 흰색 바탕) ✓
- Text: `#1F2937` (읽기 용이한 다크 그레이) ✓

### 타이포그래피 (NFR-DS-002)
- 제목: `Pretendard` 또는 `Inter` (한국어 최적화) ✓
- 본문: `Pretendard` 14-16px ✓
- 숫자: `Roboto Mono` (데이터 강조) ✓
- 라인 높이: 1.5-1.8 (가독성) ✓

### 간격과 레이아웃 (NFR-DS-003)
- 8px 기반 그리드 시스템 ✓
- 카드 간격: 16-24px ✓
- 섹션 간격: 32-48px ✓
- 컨테이너 최대 너비: 1200px ✓

### 컴포넌트 스타일 (NFR-DS-004)
- 둥근 모서리: 4-8px (최소화) ✓
- 그림자: 미세한 그림자만 사용 ✓
- 테두리: 1px solid `#E5E7EB` ✓
- 호버 효과: 미세한 배경색 변화 ✓
