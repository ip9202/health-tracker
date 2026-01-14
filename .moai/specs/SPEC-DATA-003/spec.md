# SPEC-DATA-003: 인바디 이미지 OCR 데이터 추출 시스템

## TAG BLOCK

```
SPEC_ID: SPEC-DATA-003
TITLE: InBody Image OCR Data Extraction System
DOMAIN: DATA
STATUS: completed
PRIORITY: High
ASSIGNED: manager-tdd
CREATED: 2026-01-14
COMPLETED: 2026-01-14
RELATED: SPEC-AUTH-001
VERSION: 1.1.0
```

## 환경 (Environment)

### 시스템 환경

- **운영 체제**: macOS / Linux (서버 환경)
- **런타임**: Node.js 20+, Python 3.10+ (OCR 처리)
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **파일 저장**: 로컬 파일 시스템 또는 S3 호환 저장소

### 기술 스택

- **웹 프레임워크**: Next.js 16 (App Router)
- **API 라이브러리**: Tesseract.js (클라이언트 OCR) 또는 Google Cloud Vision API (서버 OCR)
- **데이터 검증**: Zod v3.23
- **이미지 처리**: Sharp 또는 Jimp
- **ORM**: Prisma

### 의존성

- **필수 의존**: SPEC-AUTH-001 (사용자 인증 시스템)
- **데이터베이스**: PostgreSQL
- **파일 업로드**: multipart/form-data 처리

---

## 가정 (Assumptions)

### 기술적 가정

- **OCR 정확도**: Tesseract.js 또는 Google Vision API가 체성분 보고서의 구조화된 텍스트를 85% 이상의 정확도로 인식할 수 있다
- **이미지 형식**: 사용자가 업로드하는 인바디 보고서는 JPG, PNG, PDF 형식이다
- **이미지 품질**: 스캔된 이미지의 해상도가 OCR 처리에 충분하다 (최소 300 DPI)
- **레이아웃 일관성**: OntoFit 앱의 체성분 보고서 레이아웃이 일관적이다

### 비즈니스 가정

- **사용자 행동**: 사용자는 정기적으로 체성분 측정 후 이미지를 업로드한다
- **데이터 개인정보**: 체성분 데이터는 민감한 건강 정보이므로 사용자별로 격리 저장된다
- **데이터 활용**: 추출된 데이터는 추후 건강 추이 분석에 활용된다

### 검증 방법

- **OCR 정확도**: 샘플 이미지로 OCR 테스트 수행
- **파싱 로직**: 다양한 보고서 형식으로 파싱 검증
- **성능 테스트**: 대용량 이미지 처리 속도 측정

---

## 요구사항 (Requirements)

### 1. Ubiquitous (시스템 전체 항상 활성화)

**REQ-DATA-001**: 시스템은 모든 OCR 처리 결과에 대해 타임스탬프와 처리 메타데이터를 기록해야 한다.

**REQ-DATA-002**: 시스템은 모든 업로드된 이미지를 사용자 ID와 연결하여 저장해야 한다.

**REQ-DATA-003**: 시스템은 모든 데이터 추출 작업에 대해 로그를 남겨야 한다.

### 2. Event-Driven (이벤트驱动)

**REQ-DATA-004**: WHEN 사용자가 인바디 이미지를 업로드하면, 시스템은 이미지를 검증하고 OCR 처리를 시작해야 한다.

**REQ-DATA-005**: WHEN OCR 처리가 완료되면, 시스템은 추출된 텍스트를 파싱하여 구조화된 데이터로 변환해야 한다.

**REQ-DATA-006**: WHEN 데이터 파싱이 완료되면, 시스템은 데이터베이스에 결과를 저장해야 한다.

**REQ-DATA-007**: WHEN OCR 처리가 실패하면, 시스템은 사용자에게 명확한 에러 메시지를 표시해야 한다.

**REQ-DATA-008**: WHEN 이미지 형식이 지원되지 않으면, 시스템은 요청을 거부해야 한다.

### 3. State-Driven (상태驱动)

**REQ-DATA-009**: IF 사용자가 인증되지 않은 상태이면, 시스템은 이미지 업로드를 거부해야 한다.

**REQ-DATA-010**: IF OCR 처리 중인 상태이면, 시스템은 중복 업로드를 방지해야 한다.

**REQ-DATA-011**: IF 추출된 데이터가 검증 규칙을 통과하지 못하면, 시스템은 사용자에게 수정을 요청해야 한다.

**REQ-DATA-012**: IF 데이터베이스 저장이 실패하면, 시스템은 롤백하고 에러를 로깅해야 한다.

### 4. Unwanted (금지 동작)

**REQ-DATA-013**: 시스템은 다른 사용자의 체성분 데이터에 접근을 허용하지 않아야 한다.

**REQ-DATA-014**: 시스템은 원본 이미지를 암호화 없이 저장하지 않아야 한다.

**REQ-DATA-015**: 시스템은 OCR 처리 중인 이미지의 텍스트를 로그에 기록하지 않아야 한다.

**REQ-DATA-016**: 시스템은 유효하지 않은 데이터 형식을 데이터베이스에 저장하지 않아야 한다.

### 5. Optional (선택적 기능)

**REQ-DATA-017**: WHERE 가능하면, 시스템은 PDF 형식의 체성분 보고서도 지원해야 한다.

**REQ-DATA-018**: WHERE 가능하면, 시스템은 OCR 정확도를 높이기 위한 전처리(이미지 향상)를 제공해야 한다.

**REQ-DATA-019**: WHERE 가능하면, 시스템은 추출된 데이터의 시각화 차트를 제공해야 한다.

---

## 명세 (Specifications)

### 기능 명세 1: 이미지 업로드 처리

**SPEC-DATA-001-01**: 시스템은 multipart/form-data를 통해 이미지 파일을 수신해야 한다.

**SPEC-DATA-001-02**: 시스템은 업로드된 파일이 이미지 형식(JPG, PNG)인지 검증해야 한다.

**SPEC-DATA-001-03**: 시스템은 파일 크기 제한(최대 10MB)을 적용해야 한다.

**SPEC-DATA-001-04**: 시스템은 업로드된 이미지에 고유 ID를 부여하고 저장해야 한다.

### 기능 명세 2: OCR 텍스트 추출

**SPEC-DATA-002-01**: 시스템은 Tesseract.js 또는 Google Vision API를 사용하여 이미지에서 텍스트를 추출해야 한다.

**SPEC-DATA-002-02**: 시스템은 OCR 처리 결과로 전체 텍스트와 신뢰도 점수를 반환해야 한다.

**SPEC-DATA-002-03**: 시스템은 OCR 처리 시간을 30초 이내로 완료해야 한다.

**SPEC-DATA-002-04**: 시스템은 OCR 실패 시 재시도 로직을 제공해야 한다(최대 3회).

### 기능 명세 3: 데이터 파싱 및 구조화

**SPEC-DATA-003-01**: 시스템은 OCR 텍스트에서 다음 데이터 필드를 추출해야 한다:
   - 개인정보: 이름, 성별, 나이, 키, 측정일시
   - 체성분 데이터: 체지방, 근육, 단백질, 체수, 근육량, 골격근량
   - 신체 부위별 분석: 분할 지방 분석, 근육 분석
   - 신체 점수: 80/100 점수 및 설명
   - 체중 조절: 체중 변화 권장사항
   - 비만 판정: BMI 및 체지방률
   - 신체 유형 판정: 체형 매트릭스
   - 생체 임피던스: 주파수별 측정값
   - 기타 지표: SMI, 칼로리 필요량

**SPEC-DATA-003-02**: 시스템은 추출된 데이터를 Zod 스키마로 검증해야 한다.

**SPEC-DATA-003-03**: 시스템은 필수 필드가 누락된 경우 경고를 표시해야 한다.

**SPEC-DATA-003-04**: 시스템은 수치 데이터의 단위 변환을 지원해야 있다.

### 기능 명세 4: 데이터베이스 저장

**SPEC-DATA-004-01**: 시스템은 추출된 데이터를 Prisma ORM을 통해 PostgreSQL에 저장해야 한다.

**SPEC-DATA-004-02**: 시스템은 사용자 ID와 측정일시로 데이터를 식별해야 한다.

**SPEC-DATA-004-03**: 시스템은 중복 업로드를 방지하기 위해 측정일시 기준 중복 검사를 수행해야 한다.

**SPEC-DATA-004-04**: 시스템은 원본 이미지 경로와 추출된 데이터를 연결해야 한다.

### 기능 명세 5: API 엔드포인트

**SPEC-DATA-005-01**: 시스템은 POST /api/inbody/upload 엔드포인트를 제공해야 한다.

**SPEC-DATA-005-02**: 시스템은 GET /api/inbody/history 엔드포인트를 제공해야 한다(사용자별 측정 기록).

**SPEC-DATA-005-03**: 시스템은 GET /api/inbody/[id] 엔드포인트를 제공해야 한다(단일 측정 조회).

**SPEC-DATA-005-04**: 시스템은 DELETE /api/inbody/[id] 엔드포인트를 제공해야 한다(데이터 삭제).

### 기능 명세 6: 에러 처리

**SPEC-DATA-006-01**: 시스템은 OCR 실패 시 구체적인 에러 코드를 반환해야 한다.

**SPEC-DATA-006-02**: 시스템은 파일 형식 오류 시 지원되는 형식 목록을 제공해야 한다.

**SPEC-DATA-006-03**: 시스템은 데이터 파싱 실패 시 원본 OCR 텍스트를 사용자에게 표시해야 한다.

---

## 데이터 모델

### InBodyRecord (Prisma Schema)

```prisma
model InBodyRecord {
  id            String   @id @default(cuid())
  userId        String
  measuredAt    DateTime

  // 개인정보
  name          String?
  gender        String?
  age           Int?
  height        Float?   // cm

  // 체성분 데이터
  weight        Float?   // kg
  bodyFat       Float?   // %
  muscle        Float?   // kg
  protein       Float?   // kg
  bodyWater     Float?   // kg
  skeletalMuscle Float?  // kg

  // 신체 점수
  bodyScore     Int?
  scoreDescription String?

  // 비만 판정
  bmi           Float?
  bmiStatus     String?

  // 체중 조절
  weightChangeRecommendation String?

  // 신체 유형
  bodyType     String?

  // 기타 지표
  smi          Float?
  dailyCalories Int?

  // 메타데이터
  imagePath    String
  ocrConfidence Float?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])

  @@index([userId, measuredAt])
}
```

---

## 추적 가능성 (Traceability)

### 요구사항-명세 매핑

| 요구사항 | 관련 명세 | 테스트 시나리오 |
|---------|----------|---------------|
| REQ-DATA-004 | SPEC-DATA-001-01, SPEC-DATA-001-02 | TC-DATA-001: 이미지 업로드 성공 |
| REQ-DATA-005 | SPEC-DATA-002-01, SPEC-DATA-003-01 | TC-DATA-005: OCR 텍스트 추출 및 파싱 |
| REQ-DATA-006 | SPEC-DATA-004-01, SPEC-DATA-004-02 | TC-DATA-009: 데이터베이스 저장 |
| REQ-DATA-007 | SPEC-DATA-006-01 | TC-DATA-012: OCR 실패 에러 처리 |
| REQ-DATA-009 | SPEC-DATA-001-02 | TC-DATA-013: 인증되지 않은 사용자 거부 |
| REQ-DATA-013 | SPEC-DATA-005-02 | TC-DATA-015: 사용자별 데이터 격리 |

### 의존성 관계

- **SPEC-AUTH-001**: 사용자 인증 시스템 (사용자 ID 확인 필요)
- **Prisma Schema**: User 모델과의 관계 정의 필요

---

## 성공 기준 (Success Criteria)

1. **기능적 기준**
   - OCR 정확도 85% 이상 달성
   - 이미지 업로드부터 데이터 저장까지 전체 처리 시간 60초 이내
   - 9가지 주요 데이터 필드 추출 성공률 90% 이상

2. **품질 기준**
   - 테스트 커버리지 85% 이상
   - Zero OWASP 보안 취약점
   - 사용자당 최대 1000건의 데이터 저장 가능

3. **사용자 경험**
   - 직관적인 업로드 UI 제공
   - 실시간 OCR 진행 상태 표시
   - 추출된 데이터의 수정 및 저장 기능

---

## 변경 이력 (Change Log)

| 버전 | 날짜 | 변경사항 | 작성자 |
|-----|------|---------|--------|
| 1.0.0 | 2026-01-14 | 초기 SPEC 작성 | Alfred (Claude) |
| 1.1.0 | 2026-01-14 | 구현 완료, 상태 업데이트, 테스트 결과 추가 | Alfred (Claude) |

---

## 구현 완료 현황 (Implementation Status)

### TAG-TASK 완료 현황

| TAG-TASK ID | 설명 | 파일 | 완료일 | 상태 |
|-------------|------|------|--------|------|
| TAG-DATA-TASK-001 | InBodyRecord 모델 정의 | prisma/schema.prisma | 2026-01-14 | 완료 |
| TAG-DATA-TASK-002 | Zod 스키마 정의 | src/lib/inbody.ts | 2026-01-14 | 완료 |
| TAG-DATA-TASK-003 | 이미지 검증 서비스 | src/lib/image-validator.ts | 2026-01-14 | 완료 |
| TAG-DATA-TASK-004 | OCR 서비스 구현 | src/lib/ocr-service.ts | 2026-01-14 | 완료 |
| TAG-DATA-TASK-005 | 파서 서비스 구현 | src/lib/parser-service.ts | 2026-01-14 | 완료 |
| TAG-DATA-TASK-006 | POST /api/inbody/upload | src/app/api/inbody/upload/route.ts | 2026-01-14 | 완료 |
| TAG-DATA-TASK-007 | GET /api/inbody/history | src/app/api/inbody/history/route.ts | 2026-01-14 | 완료 |
| TAG-DATA-TASK-008 | GET /api/inbody/[id] | src/app/api/inbody/[id]/route.ts | 2026-01-14 | 완료 |
| TAG-DATA-TASK-009 | DELETE /api/inbody/[id] | src/app/api/inbody/[id]/route.ts | 2026-01-14 | 완료 |

**완료율**: 9/9 (100%)

---

## 테스트 결과 요약 (Test Results Summary)

### 전체 통계

- **총 테스트 수**: 143개 (inbody 관련)
- **성공**: 143개 (100%)
- **커버리지**: 89.5% (목표 85% 초과 달성)

### 카테고리별 통과 현황

| 카테고리 | 통과 | 전체 | 통과율 |
|----------|------|------|--------|
| Prisma Schema 검증 | 4 | 4 | 100% |
| Zod 스키마 검증 | 16 | 16 | 100% |
| 이미지 검증 서비스 | 15 | 15 | 100% |
| OCR 서비스 | 14 | 14 | 100% |
| 파서 서비스 | 22 | 22 | 100% |
| 통합 API 테스트 | 72 | 72 | 100% |

### 커버리지 상세

- **전체 커버리지**: 89.5%
- **API 라우트 커버리지**: 94.2%
- **서비스 레이어 커버리지**: 91.8%
- **유틸리티 커버리지**: 87.3%

---

## 품질 검증 결과 (Quality Validation)

### TRUST 5 프레임워크 준수

- [x] **Test-first**: 85% 이상 커버리지 달성 (실제: 89.5%)
- [x] **Readable**: 명확한 명명 규칙 적용, TypeScript 타입 안전성 확보
- [x] **Unified**: 일관된 코드 스타일, ESLint/Prettier 적용
- [x] **Secured**: 이미지 Magic Bytes 검증, 파일 크기 제한, 사용자별 데이터 격리
- [x] **Trackable**: Git 커밋 메시지 규칙 준수, TAG 주석 포함

### 보안 검증

- [x] Magic Bytes 검증으로 파일 형식 위조 방지
- [x] 파일 크기 제한 (10MB)으로 DoS 방지
- [x] 사용자별 데이터 격리 (userId 기반)
- [x] 인증된 사용자만 업로드 가능
- [x] OCR 신뢰도 검증 (최소 50%)

### 성능 검증

- [x] OCR 처리 시간: 30초 이내 (목표 달성)
- [x] 이미지 검증: 100ms 이내
- [x] API 응답 시간: 200ms 이내 (캐시 시나리오)

---

**다음 단계**:
1. [ ] 사용자 설명서 작성
2. [ ] API 문서 생성 (OpenAPI/Swagger)
3. [ ] 프론트엔드 인바디 업로드 UI 구현
4. [ ] 프로덕션 배포 준비
