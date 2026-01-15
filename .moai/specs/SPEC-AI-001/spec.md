# SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템

---

## YAML FRONTMATTER

```yaml
---
SPEC_ID: SPEC-AI-001
Title: AI 기반 건강 분석 및 추천 시스템 (AI-Powered Health Analysis & Recommendation System)
Created: 2026-01-15
Status: draft
Priority: High
Assigned: Alfred
Tags: AI, InBody, Health-Analysis, GLM-API, Recommendation
Related: SPEC-DATA-003, SPEC-FE-004
---

## HISTORY

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|----------|--------|
| 1.0.0 | 2026-01-15 | 초안 작성 | Alfred |

---

## 1. 환경 (Environment)

### 1.1 시스템 개요

VIBE Health 애플리케이션은 InBody 체성분 데이터를 기반으로 AI 기반 건강 분석 및 추천 시스템을 구현합니다. GLM API (ChatGPT-compatible)를 활용하여 개인별 맞춤형 건강 분석, 운동 추천, 주의 사항을 제공합니다.

### 1.2 기술 환경

**Backend:**
- Next.js 16 API Routes
- Prisma ORM 6.0.0 (PostgreSQL)
- NextAuth.js 5 (인증)

**Frontend:**
- React 19 Server Components
- TanStack Query 5.90.17 (상태 관리)

**AI Integration:**
- `@anthropic-ai/sdk` (latest) - GLM API 클라이언트
- GLM API Base URL: `https://api.z.ai/api/anthropic`
- Zod 3.25.76 - AI 응답 검증

### 1.3 관련 시스템

- **SPEC-DATA-003**: InBody OCR 데이터 추출 시스템 (분석 데이터 소스)
- **SPEC-FE-004**: InBody 데이터 관리 대시보드 (UI 연동)

---

## 2. 가정 (Assumptions)

### 2.1 기술적 가정

- GLM API는 안정적인 서비스 가용성을 제공합니다
- API 호출은 평균 3초 이내에 응답을 반환합니다
- InBody 데이터는 OCR로 정확하게 추출되었다고 가정합니다

### 2.2 비즈니스 가정

- 사용자는 AI 추천을 의료 전문가의 조언 대신 보조 도구로 활용합니다
- 건강 분석은 일반적인 건강 지침을 제공하며, 개별 의료 상황을 고려하지 않습니다
- AI 분석 결과는 책임 있는 건강 관리 의사결정을 지원하는 참고 자료입니다

### 2.3 데이터 가정

- InBodyRecord는 최소 1개 이상의 기록이 존재합니다
- 사용자는 최소 3개월 이상의 건강 데이터를 보유할 때 유의미한 추천을 받을 수 있습니다

---

## 3. 요구사항 (Requirements)

### 3.1 항시적 요구사항 (Ubiquitous)

**REQ-AI-001:** 시스템은 모든 AI 분석 요청에 대해 사용자 인증을 검증해야 한다.
**REQ-AI-002:** 시스템은 모든 AI API 호출 시간을 기록해야 한다 (성능 모니터링).
**REQ-AI-003:** 시스템은 모든 AI 분석 결과를 데이터베이스에 영구 저장해야 한다.
**REQ-AI-004:** 시스템은 모든 AI 응답에 대해 Zod 스키마 검증을 수행해야 한다.
**REQ-AI-005:** 시스템은 모든 오류 상황에서 사용자 친화적인 메시지를 제공해야 한다.

### 3.2 이벤트 기반 요구사항 (Event-Driven)

**REQ-AI-101:** WHEN 사용자가 InBody 기록 저장을 확정(Confirm)하면, 시스템은 AI 분석을 자동으로 시작해야 한다.
**REQ-AI-102:** WHEN 사용자가 AI 분석 재요청을 요청하면, 시스템은 최신 InBody 데이터로 분석을 다시 수행해야 한다.
**REQ-AI-103:** WHEN AI API 호출이 실패하면, 시스템은 재시도 로직을 3회 실행해야 한다.
**REQ-AI-104:** WHEN AI 분석이 완료되면, 시스템은 분석 결과를 UI에 표시해야 한다.
**REQ-AI-105:** WHEN 사용자가 AI 추천을 클릭하면, 시스템은 상세 운동 가이드를 표시해야 한다.

### 3.3 상태 기반 요구사항 (State-Driven)

**REQ-AI-201:** IF InBody 기록이 3개월 미만이면, 시스템은 "데이터 부족으로 인한 제한된 분석" 메시지를 표시해야 한다.
**REQ-AI-202:** IF 사용자의 BMI가 25 이상이면, 시스템은 체중 감량 추천을 우선적으로 제공해야 한다.
**REQ-AI-203:** IF 사용자의 체지방율이 정상 범위를 벗어나면, 시스템은 유산소 운동 추천을 포함해야 한다.
**REQ-AI-204:** IF AI 분석이 이미 존재하면, 시스템은 저장된 분석을 반환하고 재분석하지 않아야 한다 (캐싱).
**REQ-AI-205:** IF 골격근량이 평균 이하이면, 시스템은 근력 강화 운동을 추천해야 한다.

### 3.4 바람직하지 않은 행위 (Unwanted)

**REQ-AI-301:** 시스템은 AI API 토큰을 클라이언트에 노출해서는 안 된다.
**REQ-AI-302:** 시스템은 미인증 사용자의 AI 분석 요청을 처리해서는 안 된다.
**REQ-AI-303:** 시스템은 AI 추천을 의료 전문가의 진단으로 표시해서는 안 된다.
**REQ-AI-304:** 시스템은 사용자 개인정보(이름, 연락처)를 AI API 요청에 포함해서는 안 된다.
**REQ-AI-305:** 시스템은 검증되지 않은 AI 응답을 데이터베이스에 저장해서는 안 된다.

### 3.5 선택적 요구사항 (Optional)

**REQ-AI-401:** WHERE 가능하면, 시스템은 사용자의 건강 목표 설정을 지원해야 한다.
**REQ-AI-402:** WHERE 가능하면, 시스템은 여러 사용자 간의 건강 데이터 비교(익명화) 기능을 제공해야 한다.
**REQ-AI-403:** WHERE 가능하면, 시스템은 AI 추천 기반 맞춤형 운동 루틴 생성을 제공해야 한다.

---

## 4. 상세 명세 (Specifications)

### 4.1 데이터베이스 스키마 확장

**HealthAnalysis 모델 추가:**

```prisma
model HealthAnalysis {
  id                String   @id @default(cuid())
  inbodyRecordId    String   @unique
  inbodyRecord      InBodyRecord @relation(fields: [inbodyRecordId], references: [id], onDelete: Cascade)

  // AI 분석 결과
  healthStatus      String   // 전체 건강 상태 (ex: "양호", "관리 필요", "개선 필요")
  healthScore       Int      // 건강 점수 (0-100)
  riskFactors       String   // 위험 요소 목록 (JSON)
  recommendations   String   // 운동/생활 습관 추천 (JSON)
  warnings          String   // 주의 사항 (JSON)

  // AI 메타데이터
  modelVersion      String   // 사용된 AI 모델 버전
  confidence        Float?   // 분석 신뢰도
  analysisToken     String?  // AI API 토큰 (추적용)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([inbodyRecordId])
}
```

### 4.2 API 엔드포인트

**POST /api/inbody/confirm**
- 설명: OCR 추출 데이터를 데이터베이스에 저장하고 AI 분석 트리거
- 인증: 필수 (NextAuth session)
- 요청:
  ```typescript
  {
    inbodyData: InBodyRecord // OCR 추출된 데이터
  }
  ```
- 응답:
  ```typescript
  {
    success: true,
    recordId: string,
    analysisPending: true
  }
  ```

**POST /api/health/analyze/[recordId]**
- 설명: 특정 InBody 기록에 대한 AI 분석 요청
- 인증: 필수
- 파라미터: `recordId` - InBodyRecord ID
- 응답:
  ```typescript
  {
    analysisId: string,
    status: "pending" | "completed" | "failed",
    result?: HealthAnalysis
  }
  ```

**GET /api/health/analysis/[recordId]**
- 설명: AI 분석 결과 조회
- 인증: 필수
- 파라미터: `recordId` - InBodyRecord ID
- 응답:
  ```typescript
  {
    healthStatus: string,
    healthScore: number,
    riskFactors: RiskFactor[],
    recommendations: Recommendation[],
    warnings: Warning[]
  }
  ```

### 4.3 AI 프롬프트 설계

**시스템 프롬프트:**

```
당신은 건강 분석 및 운동 추천 전문 AI 어시스턴트입니다.
사용자의 InBody 체성분 데이터를 분석하여 건강 상태를 평가하고,
맞춤형 운동 및 생활 습관 추천을 제공하세요.

분석 결과는 반드시 JSON 형식으로 반환해야 합니다.
의료 전문적인 진단을 내리지 말고, 일반적인 건강 지침으로 제한하세요.
```

**요청 프롬프트 구조:**

```
사용자의 InBody 데이터를 분석해주세요:

- 체중: {weight}kg
- 키: {height}cm
- BMI: {bmi}
- 체지방율: {bodyFatPercentage}%
- 골격근량: {skeletalMuscle}kg
- 기초대사량: {calorieNeeds}kcal

과거 3개월 추이 데이터:
{historicalData}

건강 상태 평가, 위험 요소, 운동 추천, 주의 사항을 포함한 JSON을 반환하세요.
```

### 4.4 AI 응답 스키마 (Zod)

```typescript
import { z } from 'zod';

export const RiskFactorSchema = z.object({
  category: z.enum(['muscle', 'fat', 'metabolism', 'weight']),
  level: z.enum(['low', 'moderate', 'high']),
  description: z.string(),
});

export const RecommendationSchema = z.object({
  type: z.enum(['exercise', 'nutrition', 'lifestyle']),
  title: z.string(),
  description: z.string(),
  priority: z.number().min(1).max(5),
});

export const WarningSchema = z.object({
  severity: z.enum(['info', 'caution', 'warning']),
  message: z.string(),
  actionable: z.boolean(),
});

export const HealthAnalysisSchema = z.object({
  healthStatus: z.string(),
  healthScore: z.number().min(0).max(100),
  riskFactors: z.array(RiskFactorSchema),
  recommendations: z.array(RecommendationSchema),
  warnings: z.array(WarningSchema),
});

export type HealthAnalysis = z.infer<typeof HealthAnalysisSchema>;
```

### 4.5 환경 변수

```bash
# GLM API Configuration
GLM_API_BASE_URL=https://api.z.ai/api/anthropic
GLM_API_KEY=e052c325add248fdb95ce210a8d6d9e2.cgpUX5tmDTk4eTNE
GLM_MODEL_VERSION=claude-3-5-sonnet-20241022

# AI 분석 설정
AI_ANALYSIS_TIMEOUT=30000  # 30초
AI_MAX_RETRIES=3
AI_RETRY_DELAY=1000  # 1초
```

---

## 5. 추적성 (Traceability)

### 5.1 요구사항-설계 매핑

| 요구사항 | 설계 요소 | 구현 파일 |
|----------|----------|----------|
| REQ-AI-001 | NextAuth Middleware | src/middleware.ts |
| REQ-AI-004 | Zod Schema | src/lib/ai-schemas.ts |
| REQ-AI-101 | Auto-trigger | src/app/api/inbody/confirm/route.ts |
| REQ-AI-204 | Caching Logic | src/lib/ai-service.ts |
| REQ-AI-301 | API Key Protection | .env.local |

### 5.2 태그 블록

```
TAG-AI-001: GLM API 클라이언트 구현
TAG-AI-002: HealthAnalysis Prisma 모델 생성
TAG-AI-003: AI 프롬프트 엔지니어링
TAG-AI-004: Zod 응답 검증 스키마
TAG-AI-005: AI 분석 API 엔드포인트
TAG-AI-006: 재시도 및 에러 핸들링 로직
TAG-AI-007: 건강 점수 계산 알고리즘
TAG-AI-008: 추천 시스템 우선순위 로직
TAG-FE-005: AI 분석 결과 UI 컴포넌트
TAG-FE-006: 건강 분석 대시보드 페이지
```

---

## 6. 참조 (References)

- [GLM API Documentation](https://platform.openai.com/docs/api-reference)
- [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk)
- [Zod Validation](https://zod.dev/)
- SPEC-DATA-003: InBody OCR 데이터 추출 시스템
- SPEC-FE-004: InBody 데이터 관리 대시보드

---

**문서 버전:** 1.0.0
**최종 업데이트:** 2026-01-15
**승인 상태:** draft
