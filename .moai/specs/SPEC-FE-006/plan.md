# SPEC-FE-006: 구현 계획

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-FE-006 |
| **제목** | InBody UI/UX 전면 리디자인 구현 계획 |
| **버전** | 1.0.0 |
| **생성일** | 2026-01-25 |
| **도메인** | Frontend (UI/UX) |

## 개요

이 문서는 InBody 대시보드의 전면 리디자인을 위한 구현 전략을 정의합니다. InBody 공식 보고서의 전문적인 의료 미학을 반영하여 기존 디자인을 완전히 교체하는 새로운 디자인 시스템을 구축합니다.

## 추적성 태그

- **TAG-FE-010**: 디자인 시스템 구축
- **TAG-FE-011**: 시각화 컴포넌트 재설계
- **TAG-FE-012**: 각성 요소 컴포넌트 재설계
- **TAG-FE-013**: 게이미피케이션 컴포넌트 재설계
- **TAG-FE-014**: 대시보드 레이아웃 재설계

## 구현 마일스톤

### 1단계: 디자인 시스템 구축 (TAG-FE-010)

**목표**: InBody 공식 스타일을 반영한 새로운 디자인 시스템 구축

**우선순위**: 최고 (High)

**작업 항목**:

1. **색상 시스템 정의**
   - InBody 공식 색상 팔레트 조사 및 정의
   - Tailwind CSS 테마 설정 업데이트
   - 색상 변수 (CSS Variables) 설정

2. **타이포그래피 시스템**
   - 폰트 선택 (Pretendard, Inter, Roboto Mono)
   - 폰트 크기, 라인 높이, 자간 정의
   - Tailwind Typography 플러그인 설정

3. **간격 및 레이아웃 시스템**
   - 8px 기반 그리드 시스템 정의
   - 컨테이너, 간격, 패딩 규칙 설정
   - 반응형 브레이크포인트 정의

4. **컴포넌트 기본 스타일**
   - shadcn/ui 컴포넌트 커스터마이징
   - 버튼, 카드, 입력 필드 등 기본 컴포넌트 재설계
   - 둥근 모서리, 그림자, 테두리 규칙 정의

**기술 세부사항**:

```typescript
// tailwind.config.ts 업데이트 예시
module.exports = {
  theme: {
    extend: {
      colors: {
        inbody: {
          blue: '#0066CC',
          green: '#22C55E',
          orange: '#F97316',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
      },
    },
  },
}
```

**완료 기준**:

- [x] Tailwind config 업데이트 완료
- [ ] 색상 변수 CSS 파일 생성
- [ ] 폰트 로딩 설정
- [ ] 기본 컴포넌트 스타일 프리뷰

---

### 2단계: 시각화 컴포넌트 재설계 (TAG-FE-011)

**목표**: InBody 스타일의 데이터 시각화 컴포넌트 구현

**우선순위**: 높음 (High)

**작업 항목**:

1. **바디 타입 쉐이프 (BodyTypeShape)**
   - C/I/D 타입 SVG 실루엣 생성
   - 색상으로 타입 구분 (Blue/Green/Orange)
   - 호버 시 상세 정보 표시
   - 반응형 크기 조정

2. **ECW/TBW 비율 차트 (ECWTBWRatio)**
   - 원형 게이지 차트 구현
   - 정상 범위 하이라이트 (0.38-0.39)
   - 색상 그라데이션 적용
   - Recharts CustomChart 활용

3. **트렌드 스파크라인 (TrendSparkline)**
   - 미니멀한 라인 차트
   - 최근 7-30일 데이터 표시
   - 양/음 변화 색상 구분
   - 애니메이션 효과 최소화

4. **부위별 근육 분석 (SegmentalAnalysis)**
   - 인체 다이어그램 SVG
   - 부위별 색상 매핑
   - 호버 시 툴팁 표시
   - Recharts 또는 D3.js 활용

5. **비교 분석 차트 (ComparisonChart)**
   - Before/After 막대 그래프
   - 변화율 퍼센트 계산
   - 방사형 차트 옵션
   - 애니메이션 효과 추가

**Stitch MCP 활용**:

1. InBody 공식 보고서 이미지 수집
2. Stitch MCP로 이미지 분석
3. React 컴포넌트 코드 생성
4. 생성된 코드를 프로젝트에 통합

**완료 기준**:

- [ ] 모든 시각화 컴포넌트 구현 완료
- [ ] Recharts와의 통합 확인
- [ ] 반응형 동작 검증
- [ ] TypeScript 타입 안전성 확인
- [ ] 단위 테스트 작성

---

### 3단계: 각성 요소 컴포넌트 재설계 (TAG-FE-012)

**목표**: 사용자 인식을 높이는 UI 요소 재설계

**우선순위**: 높음 (High)

**작업 항목**:

1. **변화 하이라이트 (ChangeHighlight)**
   - 전후 데이터 비교 UI
   - 양/음 변화 색상 및 아이콘
   - 퍼센트 변화 계산 및 표시
   - emoji 또는 Lucide 아이콘 활용

2. **진행률 표시기 (ProgressIndicator)**
   - 선형 진행 바 구현
   - 원형 진행률 옵션
   - 퍼센트 및 남은 일수 표시
   - 색상으로 진행 상태 구분

3. **요약 통계 카드 (SummaryStats)**
   - 주요 지표 카드 디자인
   - 뱃지 형태의 상태 표시
   - 트렌드 아이콘 (상승/하락/유지)
   - 의료 보고서 스타일 레이아웃

**완료 기준**:

- [ ] 모든 각성 컴포넌트 구현 완료
- [ ] shadcn/ui Card 컴포넌트 기반 구현
- [ ] 상태 관리 로직 구현
- [ ] TypeScript 타입 정의
- [ ] 단위 테스트 작성

---

### 4단계: 게이미피케이션 컴포넌트 재설계 (TAG-FE-013)

**목표**: 지속적인 동기 부여를 위한 게이미피케이션 요소 구현

**우선순위**: 중간 (Medium)

**작업 항목**:

1. **스트릭 카운터 (StreakCounter)**
   - 연속 측정 일수 표시
   - 불꽃 또는 메달 아이콘
   - 최고 기록과 현재 기록 비교
   - 도전 과제 표시

2. **업적 배지 (AchievementBadges)**
   - 마일스톤 배지 시스템
   - 배지 디자인 (InBody 스타일)
   - 배지 컬렉션 표시
   - 업적 달성 애니메이션

3. **목표 추적기 (GoalTracker)**
   - 목표 설정 UI
   - 목표 달성률 차트
   - 남은 기간 표시
   - 동기 부여 메시지

**완료 기준**:

- [ ] 모든 게이미피케이션 컴포넌트 구현 완료
- [ ] 상태 관리 (TanStack Query 또는 Zustand)
- [ ] 애니메이션 효과 추가
- [ ] 반응형 디자인 확인
- [ ] 단위 테스트 작성

---

### 5단계: 대시보드 레이아웃 재설계 (TAG-FE-014)

**목표**: 새로운 컴포넌트로 통합 대시보드 구축

**우선순위**: 최고 (High)

**작업 항목**:

1. **메인 대시보드 구조**
   - 헤더: 사용자 정보, 날짜 선택, 설정
   - 요약 섹션: 핵심 지표 카드
   - 시각화 섹션: 바디 타입, ECW/TBW 차트
   - 상세 섹션: 부위별 분석, 비교 차트
   - 게이미피케이션 섹션: 스트릭, 배지, 목표

2. **반응형 레이아웃**
   - 데스크탑: 3-4열 그리드 (CSS Grid)
   - 태블릿: 2열 그리드
   - 모바일: 단열 스택

3. **네비게이션**
   - 상단 고정 헤더
   - 측면 사이드바 (데스크탑)
   - 하단 탭 바 (모바일)
   - 브레드크럼

4. **페이지 전환 및 상태 관리**
   - TanStack Query로 데이터 fetching
   - URL 파라미터로 필터링
   - 로딩 및 에러 상태 처리

**완료 기준**:

- [ ] 대시보드 메인 페이지 구현 완료
- [ ] 모든 섹션 통합 확인
- [ ] 반응형 동작 검증
- [ ] 성능 최적화 (Lazy Loading, Code Splitting)
- [ ] 통합 테스트 작성

---

## 기술 접근 방식

### Stitch MCP 활용 프로세스

1. **이미지 수집**: InBody 공식 보고서 샘플 이미지 수집
2. **이미지 분석**: Stitch MCP로 이미지를 분석하여 컴포넌트 구조 파악
3. **코드 생성**: React 19 + Tailwind CSS 기반 컴포넌트 코드 생성
4. **통합 및 커스터마이징**: 생성된 코드를 프로젝트에 통합하고 타입 안전성 추가

```typescript
// Stitch MCP 활용 예시 (의사 코드)
const inBodyReportImage = "./inbody-sample-report.jpg";
const generatedComponent = await stitch.analyzeAndGenerate(inBodyReportImage, {
  framework: "react",
  version: "19",
  styling: "tailwindcss",
  typeSafety: "typescript",
});
```

### React 19 Server Components 활용

- 데이터 fetching은 서버 컴포넌트에서 수행
- 클라이언트 컴포넌트는 인터랙션에만 사용
- 스트리밍 SSR로 초기 로딩 속도 개선

```typescript
// app/inbody/page.tsx (Server Component)
export default async function InBodyDashboardPage() {
  const inBodyData = await fetchInBodyData();
  return <InBodyDashboard initialData={inBodyData} />;
}
```

### Recharts 커스터마이징

```typescript
// InBody 스타일 차트 예시
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const InBodyTrendChart = ({ data }: { data: TrendData[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <Line
        type="monotone"
        dataKey="weight"
        stroke="#0066CC"
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
);
```

### TanStack Query로 상태 관리

```typescript
// hooks/useInBodyData.ts
import { useQuery } from '@tanstack/react-query';

export function useInBodyData(userId: string) {
  return useQuery({
    queryKey: ['inbody', userId],
    queryFn: () => fetchInBodyData(userId),
    staleTime: 5 * 60 * 1000, // 5분
  });
}
```

## 위험 요소 및 완화 계획

### 위험 1: Stitch MCP 출력물의 품질 불확실성

**영향**: 중간 (Medium)
**확률**: 높음 (High)
**완화 계획**:
- Stitch 출력물을 참고용으로만 사용
- 수동으로 코드 리뷰 및 리팩토링
- 타입 안전성 검증 강화

### 위험 2: Recharts 커스터마이징 복잡도

**영향**: 중간 (Medium)
**확률**: 중간 (Medium)
**완화 계획**:
- Recharts CustomChart 가이드 참조
- 간단한 차트부터 시작하여 점진적 복잡화
- 필요시 D3.js로 대체 고려

### 위험 3: 반응형 디자인 일관성

**영향**: 낮음 (Low)
**확률**: 낮음 (Low)
**완화 계획**:
- Tailwind CSS 반응형 클래스 체계적 사용
- 모바일 퍼스트 디자인 접근
- 다양한 디바이스에서 테스트

### 위험 4: 성능 저하

**영향**: 중간 (Medium)
**확률**: 낮음 (Low)
**완화 계획**:
- 코드 분할 (Code Splitting)
- Lazy Loading
- 이미지 최적화
- Lighthouse 성능 점수 모니터링

## 테스트 전략

### 단위 테스트 (Vitest)

- 각 컴포넌트의 렌더링 테스트
- 상태 관리 로직 테스트
- 유틸리티 함수 테스트

### 통합 테스트 (Testing Library)

- 컴포넌트 간 상호작용 테스트
- 사용자 시나리오 테스트
- 접근성 테스트

### 시각적 회귀 테스트

- 스크린샷 비교 (Playwright)
- InBody 디자인 가이드라인 준수 확인

### 성능 테스트

- Lighthouse CI
- Core Web Vitals 모니터링
- 번들 크기 추적

## 성공 지표

### 정량적 지표

- Lighthouse Performance 점수: > 90
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3.5s
- TypeScript 커버리지: 100%
- 테스트 커버리지: > 80%

### 정성적 지표

- InBody 공식 스타일과의 시각적 일관성
- 사용자 경험 개선 (사용자 테스트)
- 접근성 준수 (WCAG 2.1 AA)
- 코드 유지보수성

## 변경 이력

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|---------|--------|
| 1.0.0 | 2026-01-25 | 초기 문서 작성 | Alfred |
