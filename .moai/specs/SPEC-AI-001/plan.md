# SPEC-AI-001: 구현 계획 (Implementation Plan)

---

## 1. 개요 (Overview)

본 문서는 AI 기반 건강 분석 및 추천 시스템의 구현 계획을 상세히 기술합니다.

---

## 2. 구현 단계 (Phases)

### Phase 1: 기반 구조 구축 (Primary Goal)

**목표:** AI 통합을 위한 기반 인프라 구축

**작업 항목:**

1. **의존성 설치**
   - `@anthropic-ai/sdk` 최신 버전 설치
   - Zod 스키마 검증 라이브러리 설치 (이미 존재 확인)

2. **데이터베이스 스키마 확장**
   - `HealthAnalysis` Prisma 모델 정의
   - `InBodyRecord`와의 관계 설정 (1:1)
   - 마이그레이션 생성 및 실행

3. **환경 변수 설정**
   - GLM API Base URL 설정
   - API 키 설정 (.env.local)
   - 타임아웃 및 재시도 설정

**산출물:**
- `prisma/schema.prisma` (수정)
- `.env.local` (환경 변수 추가)
- 마이그레이션 파일

**완료 기준:**
- Prisma 마이그레이션 성공
- 환경 변수 설정 완료
- 의존성 설치 완료

---

### Phase 2: AI 서비스 계층 구현 (Primary Goal)

**목표:** GLM API 연동 및 핵심 비즈니스 로직 구현

**작업 항목:**

1. **Zod 스키마 정의**
   - `RiskFactorSchema` 정의
   - `RecommendationSchema` 정의
   - `WarningSchema` 정의
   - `HealthAnalysisSchema` 통합 스키마

2. **AI 서비스 모듈 구현**
   - `src/lib/ai-service.ts` 생성
   - GLM API 클라이언트 초기화
   - 분석 요청 함수 구현
   - 재시도 로직 구현 (3회, 1초 지연)
   - 타임아웃 처리 (30초)

3. **프롬프트 엔지니어링**
   - 시스템 프롬프트 템플릿 작성
   - 사용자 데이터 포맷팅 함수
   - 추이 데이터 포함 로직

4. **캐싱 로직**
   - 기존 분석 결과 확인
   - 재분석 트리거 조건 구현

**산출물:**
- `src/lib/ai-schemas.ts`
- `src/lib/ai-service.ts`
- `src/lib/prompts/health-analysis.ts`

**완료 기준:**
- 단위 테스트 통과
- Zod 검증 정상 작동
- 재시도 로직 검증

---

### Phase 3: API 엔드포인트 구현 (Primary Goal)

**목표:** AI 분석 기능을 위한 RESTful API 구현

**작업 항목:**

1. **POST /api/inbody/confirm**
   - InBody 데이터 저장 로직 수정
   - 백그라운드에서 AI 분석 트리거
   - 비동기 처리 구현

2. **POST /api/health/analyze/[recordId]**
   - 인증 미들웨어 적용
   - 분석 요청 처리
   - 진행 상태 반환

3. **GET /api/health/analysis/[recordId]**
   - 인증 미들웨어 적용
   - 분석 결과 조회
   - 캐싱 로직 적용

4. **에러 핸들링**
   - API 호출 실패 처리
   - 타임아웃 처리
   - 검증 실패 처리

**산출물:**
- `src/app/api/inbody/confirm/route.ts`
- `src/app/api/health/analyze/[recordId]/route.ts`
- `src/app/api/health/analysis/[recordId]/route.ts`

**완료 기준:**
- API 통합 테스트 통과
- 인증 검증 완료
- 에러 핸들링 검증

---

### Phase 4: 프론트엔드 UI 구현 (Secondary Goal)

**목표:** AI 분석 결과 시각화 및 사용자 인터랙션

**작업 항목:**

1. **AI 분석 결과 컴포넌트**
   - 건강 상태 카드 (healthStatus, healthScore)
   - 위험 요소 리스트 (riskFactors)
   - 추천 항목 카드 (recommendations)
   - 주의 사항 알림 (warnings)

2. **대시보드 연동**
   - InBody 상세 페이지에 분석 결과 표시
   - 분석 진행 상태 인디케이터
   - 재분석 버튼

3. **상태 관리**
   - TanStack Query 캐싱 전략
   - 낙관적 업데이트
   - 자동 재검증

**산출물:**
- `src/components/ai/health-analysis-card.tsx`
- `src/components/ai/risk-factor-list.tsx`
- `src/components/ai/recommendation-card.tsx`
- `src/components/ai/warning-alert.tsx`
- `src/app/inbody/[id]/page.tsx` (수정)

**완료 기준:**
- UI 컴포넌트 단위 테스트 통과
- 반응형 디자인 검증
- 사용자 인터랙션 정상 작동

---

### Phase 5: 테스트 및 최적화 (Final Goal)

**목표:** 품질 보증 및 성능 최적화

**작업 항목:**

1. **단위 테스트**
   - AI 서비스 로직 테스트
   - Zod 스키마 검증 테스트
   - API 라우트 테스트

2. **통합 테스트**
   - end-to-end AI 분석 흐름
   - 에러 복구 시나리오
   - 재시도 로직 검증

3. **성능 최적화**
   - API 응답 시간 모니터링
   - 캐싱 전략 튜닝
   - 배치 처리 고려

4. **보안 검토**
   - API 키 노출 점검
   - 인증 우회 검증
   - 개인정보 포함 검증

**산출물:**
- 단위 테스트 파일 (`tests/unit/ai/`)
- 통합 테스트 파일 (`tests/integration/ai/`)
- 성능 보고서

**완료 기준:**
- 테스트 커버리지 85% 이상
- 평균 응답 시간 3초 이내
- 보안 감사 통과

---

## 3. 기술 요구사항 (Technical Requirements)

### 3.1 의존성 추가

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^1.0.0"
  }
}
```

### 3.2 환경 변수

```bash
# .env.local
GLM_API_BASE_URL=https://api.z.ai/api/anthropic
GLM_API_KEY=e052c325add248fdb95ce210a8d6d9e2.cgpUX5tmDTk4eTNE
GLM_MODEL_VERSION=claude-3-5-sonnet-20241022
AI_ANALYSIS_TIMEOUT=30000
AI_MAX_RETRIES=3
AI_RETRY_DELAY=1000
```

### 3.3 Prisma 스키마

```prisma
model HealthAnalysis {
  id                String   @id @default(cuid())
  inbodyRecordId    String   @unique
  inbodyRecord      InBodyRecord @relation(fields: [inbodyRecordId], references: [id], onDelete: Cascade)

  healthStatus      String
  healthScore       Int
  riskFactors       String   // JSON
  recommendations   String   // JSON
  warnings          String   // JSON

  modelVersion      String
  confidence        Float?
  analysisToken     String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([inbodyRecordId])
}

// InBodyRecord에 relation 추가
model InBodyRecord {
  // ... 기존 필드 ...
  healthAnalysis    HealthAnalysis?
}
```

---

## 4. 위험 분석 및 완화 (Risk Analysis)

### 4.1 기술적 위험

| 위험 | 영향 | 확률 | 완화 전략 |
|------|------|------|----------|
| GLM API 장애 | 높음 | 중 | 재시도 로직 + graceful degradation |
| AI 응답 형식 변경 | 중 | 낮 | Zod 검증 + 버전 관리 |
| 타임아웃 발생 | 중 | 중 | 비동기 처리 + 진행 상태 제공 |
| API 키 노출 | 높음 | 낮 | 서버 측 only + .gitignore |

### 4.2 비즈니스 위험

| 위험 | 영향 | 확률 | 완화 전략 |
|------|------|------|----------|
| 과도한 API 비용 | 중 | 중 | 속도 제한 + 캐싱 |
| 의료적 오해 | 높음 | 중 | 명확한 면책 조항 |
| 개인정보 유출 | 높음 | 낮 | 데이터 익명화 + 검증 |

### 4.3 사용자 경험 위험

| 위험 | 영향 | 확률 | 완화 전략 |
|------|------|------|----------|
| 응답 지연 | 중 | 중 | 로딩 인디케이터 + 스트리밍 |
| 추천의 부정확성 | 중 | 중 | 피드백 수집 + 모델 개선 |

---

## 5. 리소스 요구사항 (Resource Requirements)

### 5.1 개발 리소스

- **Backend 개발:** AI 서비스, API 엔드포인트 (약 8-10시간)
- **Frontend 개발:** UI 컴포넌트, 상태 관리 (약 6-8시간)
- **테스트:** 단위 테스트, 통합 테스트 (약 4-6시간)
- **총 예상 시간:** 18-24시간

### 5.2 인프라 리소스

- **데이터베이스:** HealthAnalysis 테이블 추가 (약 1KB/기록)
- **API:** GLM API 호출 (약 500-1000 tokens/분석)
- **비용:** 월 약 $10-30 (사용량 기준)

### 5.3 운영 리소스

- **모니터링:** API 응답 시간, 실패율
- **로그:** AI 분석 결과 추적
- **알림:** API 장애 시 알림

---

## 6. 성공 지표 (Success Metrics)

### 6.1 기술적 지표

- AI 분석 API 성공률: 95% 이상
- 평균 응답 시간: 3초 이내
- 테스트 커버리지: 85% 이상

### 6.2 사용자 경험 지표

- AI 추천 활용률: 60% 이상
- 사용자 만족도: 4.0/5.0 이상
- 재분석 요청률: 20% 미만

### 6.3 비즈니스 지표

- 기능 도입 후 사용자 유지율 개선
- 건강 목표 달성률 향상
- 애플리케이션 사용 빈도 증가

---

## 7. 다음 단계 (Next Steps)

1. **Phase 1 시작:** 의존성 설치 및 스키마 확장
2. **전문가 상담:** AI/ML 전문가와 프롬프트 최적화 검토
3. **위험 완화:** API 키 보안 강화, 면책 조항 추가

---

**문서 버전:** 1.0.0
**최종 업데이트:** 2026-01-15
**승인 상태:** draft
