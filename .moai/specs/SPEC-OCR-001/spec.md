# SPEC-OCR-001: InBody 신체점수 추출 정확도 개선 시스템

## TAG BLOCK

```
SPEC_ID: SPEC-OCR-001
TITLE: InBody Body Score Extraction Accuracy Improvement System
DOMAIN: OCR
STATUS: planned
PRIORITY: High
ASSIGNED: manager-tdd
CREATED: 2026-01-16
RELATED: SPEC-DATA-003
VERSION: 1.0.0
```

## 환경 (Environment)

### 시스템 환경

- **운영 체제**: macOS / Linux (서버 환경)
- **클라이언트**: 브라우저 환경 (Tesseract.js Web Worker)
- **런타임**: Node.js 22+ (서버), Modern Browser (클라이언트)
- **데이터베이스**: PostgreSQL (Prisma ORM)

### 기술 스택

- **OCR 엔진**: Tesseract.js 7.0.0 (클라이언트 & 서버)
- **이미지 처리**: HTML5 Canvas API (전처리)
- **데이터 검증**: Zod v3.25.76
- **언어**: TypeScript 5.9+

### 의존성

- **필수 의존**: SPEC-DATA-003 (InBody OCR 데이터 추출 시스템)
- **기존 구현**: parser-service.ts, client-ocr.ts, ocr-service.ts
- **데이터베이스**: InBodyRecord.bodyScore 필드

---

## 가정 (Assumptions)

### 기술적 가정

- **이미지 품질**: InBody 결과지 이미지의 해상도가 최소 300 DPI 이상이다
- **레이아웃 일관성**: InBody 결과지의 신체점수 표시 위치가 일관적이다
- **OCR 개선 여지**: 현재 30% 신뢰도 임계값을 높이면 정확도가 개선된다
- **전처리 효과**: 이미지 전처리(대비, 회전, 노이즈 제거)가 OCR 정확도를 향상시킨다
- **다양한 형식**: 다양한 InBody 기기 및 버전의 결과지가 존재한다

### 비즈니스 가정

- **사용자 기대**: 신체점수는 사용자에게 가장 중요한 지표 중 하나이다
- **정확도 중요성**: 신체점수 추출 실패는 사용자 경험에 큰 영향을 미친다
- **비용 효율성**: 클라이언트 측 OCR 개선이 클라우드 OCR 서비스보다 비용 효율적이다

### 검증 방법

- **벤치마크 테스트**: 100개 이상의 실제 InBody 이미지로 추출 정확도 측정
- **A/B 테스트**: 개선 전후 정확도 비교
- **사용자 피드백**: 실제 사용 환경에서 오류 보고 수집

---

## 요구사항 (Requirements)

### 1. Ubiquitous (시스템 전체 항상 활성화)

**REQ-OCR-001**: 시스템은 모든 OCR 처리 결과에 대해 신체점수 추출 성공/실패 여부를 기록해야 한다.

**REQ-OCR-002**: 시스템은 모든 OCR 처리에 대해 처리 전 이미지 품질 점수를 계산해야 한다.

**REQ-OCR-003**: 시스템은 모든 신체점수 추출 시도에 대해 사용된 정규식 패턴 ID를 기록해야 한다.

### 2. Event-Driven (이벤트驱动)

**REQ-OCR-004**: WHEN 사용자가 InBody 이미지를 업로드하면, 시스템은 OCR 처리 전 이미지 전처리를 수행해야 한다.

**REQ-OCR-005**: WHEN OCR 처리가 완료되면, 시스템은 향상된 정규식 패턴으로 신체점수를 추출해야 한다.

**REQ-OCR-006**: WHEN 첫 번째 패턴으로 신체점수 추출에 실패하면, 시스템은 대체 패턴들을 순차적으로 시도해야 한다.

**REQ-OCR-007**: WHEN 모든 패턴이 실패하면, 시스템은 OCR 신뢰도와 이미지 품질을 기반으로 재시도 여부를 결정해야 한다.

**REQ-OCR-008**: WHEN 최종 추출이 실패하면, 시스템은 명확한 에러 메시지와 해결 가이드를 사용자에게 표시해야 한다.

### 3. State-Driven (상태驱动)

**REQ-OCR-009**: IF OCR 신뢰도가 50% 미만이면, 시스템은 이미지 전처리를 강화해야 한다.

**REQ-OCR-010**: IF 이미지 품질 점수가 60점 미만이면, 시스템은 대비 향상 및 노이즈 제거를 수행해야 한다.

**REQ-OCR-011**: IF 이미지 회전이 감지되면, 시스템은 자동 보정을 수행해야 한다.

**REQ-OCR-012**: IF 추출된 신체점수가 0-100 범위를 벗어나면, 시스템은 값을 거부하고 재시도해야 한다.

**REQ-OCR-013**: IF 모든 추출 시도가 실패하면, 시스템은 더미 데이터 대신 사용자에게 수동 입력을 요청해야 한다.

### 4. Unwanted (금지 동작)

**REQ-OCR-014**: 시스템은 신체점수 추출 실패 시 더미 데이터를 자동으로 반환하지 않아야 한다.

**REQ-OCR-015**: 시스템은 낮은 신뢰도(30% 미만)의 OCR 결과를 사용하지 않아야 한다.

**REQ-OCR-016**: 시스템은 3개 미만의 정규식 패턴만으로는 신체점수를 추출하지 않아야 한다.

**REQ-OCR-017**: 시스템은 이미지 전처리 단계를 건너뛰지 않아야 한다.

**REQ-OCR-018**: 시스템은 실패한 패턴을 같은 이미지에 대해 재시도하지 않아야 한다.

### 5. Optional (선택적 기능)

**REQ-OCR-019**: WHERE 가능하면, 시스템은 InBody 기기별 맞춤 패턴을 지원해야 한다.

**REQ-OCR-020**: WHERE 가능하면, 시스템은 OCR 실패 원인 분석 리포트를 제공해야 한다.

**REQ-OCR-021**: WHERE 가능하면, 시스템은 사용자가 패턴을 학습할 수 있는 피드백 시스템을 제공해야 한다.

---

## 명세 (Specifications)

### 기능 명세 1: 이미지 전처리 시스템

**SPEC-OCR-001-01**: 시스템은 OCR 처리 전 다음 전처리 단계를 수행해야 한다:
   - 그레이스케일 변환
   - 대비 향상 (Contrast Enhancement)
   - 노이즈 제거 (Denoising)
   - 이진화 (Binarization)

**SPEC-OCR-001-02**: 시스템은 이미지 회전 감지 및 자동 보정을 지원해야 한다.

**SPEC-OCR-001-03**: 시스템은 이미지 품질 점수를 계산해야 한다 (0-100 점).

**SPEC-OCR-001-04**: 시스템은 전처리 전후 이미지를 비교하여 품질 개선 정도를 측정해야 한다.

### 기능 명세 2: 향상된 정규식 패턴 라이브러리

**SPEC-OCR-002-01**: 시스템은 최소 10개 이상의 신체점수 추출 정규식 패턴을 제공해야 한다.

**SPEC-OCR-002-02**: 시스템은 다양한 InBody 결과지 형식을 지원해야 한다:
   - InBody 770 (기본형)
   - InBody 970 (고급형)
   - InBody 720 (간소형)
   - OntoFit 앱 버전

**SPEC-OCR-002-03**: 각 패턴은 우선순위(Priority), 신뢰도(Confidence), 설명(Description) 메타데이터를 포함해야 한다.

**SPEC-OCR-002-04**: 패턴 라이브러리는 다음 형식을 포함해야 한다:
   - 형식 A: "신체 점수 100 표준"
   - 형식 B: "100/100포인트"
   - 형식 C: "Body Score: 95"
   - 형식 D: "점수: 85점"
   - 형식 E: 신체점수 영역 내 숫자 추출
   - 형식 F: "표준" 앞 숫자 추출
   - 형식 G: 위치 기반 추출 (좌표 매칭)
   - 형식 H: 문맥 기반 추출 (주변 키워드)
   - 형식 I: 다단계 추출 (복합 패턴)
   - 형식 J: OCR 오류 복구 (퍼지 매칭)

### 기능 명세 3: 다단계 추출 전략

**SPEC-OCR-003-01**: 시스템은 추출 시도를 다음 단계로 수행해야 한다:
   1단계: 고신뢰도 패턴 (Priority 1-3)
   2단계: 중신뢰도 패턴 (Priority 4-7)
   3단계: 저신뢰도 패턴 (Priority 8-10)

**SPEC-OCR-003-02**: 시스템은 각 단계에서 성공 시 추가 시도를 중단해야 한다.

**SPEC-OCR-003-03**: 시스템은 각 시도 결과를 로그에 기록해야 한다.

**SPEC-OCR-003-04**: 시스템은 OCR 신뢰도에 따라 시작 단계를 조정해야 한다:
   - 80% 이상: 1단계부터 시작
   - 50-80%: 2단계부터 시작
   - 50% 미만: 3단계부터 시작

### 기능 명세 4: OCR 설정 최적화

**SPEC-OCR-004-01**: 시스템은 Tesseract.js PSM(Page Segmentation Mode)을 최적화해야 한다:
   - PSM 6: 단일 블록 가정
   - PSM 3: 자동 페이지 분할
   - PSM 11: 희소 텍스트

**SPEC-OCR-004-02**: 시스템은 이미지 품질에 따라 적절한 PSM을 선택해야 한다.

**SPEC-OCR-004-03**: 시스템은 OCR 신뢰도 임계값을 30%에서 50%로 상향 조정해야 한다.

**SPEC-OCR-004-04**: 시스템은 OCR 처리 시간을 20초 이내로 완료해야 한다.

### 기능 명세 5: 에러 처리 및 재시도 로직

**SPEC-OCR-005-01**: 시스템은 추출 실패 시 다음 정보를 포함한 에러를 반환해야 한다:
   - 실패 원인 카테고리
   - 시도한 패턴 목록
   - OCR 신뢰도
   - 이미지 품질 점수
   - 권장 해결 방안

**SPEC-OCR-005-02**: 시스템은 재시도 가능한 경우 최대 2회 재시도해야 한다.

**SPEC-OCR-005-03**: 시스템은 재시도 시 전처리 강도를 높여야 한다.

**SPEC-OCR-005-04**: 시스템은 최종 실패 시 사용자에게 수동 입력 또는 이미지 재업로드를 안내해야 한다.

### 기능 명세 6: 검증 및 품질 보증

**SPEC-OCR-006-01**: 시스템은 추출된 신체점수의 유효성을 검증해야 한다:
   - 0-100 범위 검사
   - 정수형 검사
   - 논리적 일관성 검사

**SPEC-OCR-006-02**: 시스템은 추출 결과의 신뢰도 점수를 계산해야 한다:
   - 패턴 우선순위
   - OCR 신뢰도
   - 이미지 품질 점수
   - 추출 방법 (직접/문맥/퍼지)

**SPEC-OCR-006-03**: 시스템은 신뢰도 점수가 70점 미만인 경우 사용자에게 검토를 요청해야 한다.

### 기능 명세 7: API 인터페이스

**SPEC-OCR-007-01**: 시스템은 기존 POST /api/inbody/upload 엔드포인트를 확장해야 한다.

**SPEC-OCR-007-02**: 시스템은 새로운 GET /api/inbody/extraction/[id] 엔드포인트를 제공해야 한다 (추출 세부 정보).

**SPEC-OCR-007-03**: 시스템은 POST /api/inbody/retry-extraction/[id] 엔드포인트를 제공해야 한다 (재시도).

---

## 데이터 모델

### ExtractionAttempt (추출 시도 기록)

```typescript
interface ExtractionAttempt {
  id: string;
  inbodyRecordId: string;
  timestamp: Date;
  patternId: string;
  patternName: string;
  patternPriority: number;
  ocrConfidence: number;
  imageQualityScore: number;
  preprocessingMethod: string;
  success: boolean;
  extractedValue?: number;
  errorMessage?: string;
  executionTimeMs: number;
}
```

### PatternDefinition (정규식 패턴 정의)

```typescript
interface PatternDefinition {
  id: string;
  name: string;
  priority: number; // 1-10, 1이 최우선
  regex: RegExp | RegExp[];
  description: string;
  targetFormats: string[]; // 지원하는 InBody 형식
  confidenceWeight: number; // 신뢰도 가중치
  validationFn?: (value: number) => boolean;
}
```

### ImageQualityMetrics (이미지 품질 지표)

```typescript
interface ImageQualityMetrics {
  overallScore: number; // 0-100
  sharpness: number; // 선명도
  contrast: number; // 대비
  brightness: number; // 밝기
  noiseLevel: number; // 노이즈 수준 (낮을수록 좋음)
  rotationAngle: number; // 회전 각도
  hasGlare: boolean; // 글레어 존재 여부
  recommendedPreprocessing: string[]; // 권장 전처리
}
```

### ExtractionResult (추출 결과)

```typescript
interface ExtractionResult {
  success: boolean;
  bodyScore?: number;
  scoreDescription?: string;
  confidence: number; // 0-100
  attempts: ExtractionAttempt[];
  recommendedAction: 'accept' | 'review' | 'retry' | 'manual';
  errorMessage?: string;
}
```

---

## 추적 가능성 (Traceability)

### 요구사항-명세 매핑

| 요구사항 | 관련 명세 | 테스트 시나리오 |
|---------|----------|---------------|
| REQ-OCR-004 | SPEC-OCR-001-01 | TC-OCR-001: 이미지 전처리 성공 |
| REQ-OCR-005 | SPEC-OCR-002-01, SPEC-OCR-003-01 | TC-OCR-005: 다단계 추출 성공 |
| REQ-OCR-006 | SPEC-OCR-003-02 | TC-OCR-007: 패턴 실패 시 대체 패턴 시도 |
| REQ-OCR-008 | SPEC-OCR-005-01 | TC-OCR-012: 상세한 에러 메시지 반환 |
| REQ-OCR-009 | SPEC-OCR-004-03 | TC-OCR-013: 낮은 신뢰도 시 전처리 강화 |
| REQ-OCR-014 | SPEC-OCR-005-04 | TC-OCR-018: 더미 데이터 대신 수동 입력 요청 |

### 의존성 관계

- **SPEC-DATA-003**: 기본 OCR 데이터 추출 시스템
- **Prisma Schema**: InBodyRecord.bodyScore 필드
- **기존 서비스**: parser-service.ts, client-ocr.ts, ocr-service.ts

---

## 성공 기준 (Success Criteria)

### 기능적 기준

1. **추출 정확도**
   - 신체점수 추출 성공률: 95% 이상
   - 다양한 InBody 형식 지원: 4가지 이상
   - 지원되는 패턴 수: 10개 이상

2. **품질 기준**
   - 테스트 커버리지: 85% 이상
   - OCR 신뢰도 개선: 30% → 50% 임계값 상향
   - 이미지 전처리 적용률: 100%

3. **성능 기준**
   - OCR 처리 시간: 20초 이내
   - 추출 시도 평균 횟수: 2회 이내
   - 이미지 전처리 시간: 2초 이내

### 비기능적 기준

1. **사용자 경험**
   - 명확한 에러 메시지 제공
   - 수동 입력 가이드 제공
   - 진행 상태 실시간 표시

2. **유지보수성**
   - 패턴 라이브러리 확장 용이성
   - 로그 및 모니터링 기능
   - 성능 모니터링 대시보드

---

## 변경 이력 (Change Log)

| 버전 | 날짜 | 변경사항 | 작성자 |
|-----|------|---------|--------|
| 1.0.0 | 2026-01-16 | 초기 SPEC 작성 | Alfred (Claude) |

---

## TAG 추적

### TAG-OCR-001: 이미지 전처리 모듈 구현
- **파일**: src/lib/image-preprocessor.ts
- **설명**: HTML5 Canvas API를 활용한 이미지 전처리 기능

### TAG-OCR-002: 정규식 패턴 라이브러리 구현
- **파일**: src/lib/pattern-library.ts
- **설명**: 10개 이상의 신체점수 추출 패턴 정의

### TAG-OCR-003: 다단계 추출 엔진 구현
- **파일**: src/lib/multi-stage-extractor.ts
- **설명**: 우선순위 기반 추출 시도 로직

### TAG-OCR-004: OCR 설정 최적화
- **파일**: src/lib/ocr-config.ts
- **설명**: PSM 모드 및 신뢰도 임계값 최적화

### TAG-OCR-005: 에러 처리 개선
- **파일**: src/lib/extraction-error-handler.ts
- **설명**: 상세한 에러 메시지 및 재시도 로직

### TAG-OCR-006: parser-service.ts 개선
- **파일**: src/lib/parser-service.ts
- **설명**: 기존 파서에 새로운 추출 로직 통합

### TAG-OCR-007: 클라이언트 OCR 전처리 통합
- **파일**: src/lib/client-ocr.ts
- **설명**: 클라이언트 측 전처리 기능 추가

### TAG-OCR-008: API 엔드포인트 확장
- **파일**: src/app/api/inbody/retry-extraction/[id]/route.ts
- **설명**: 재시도 및 추출 세부 정보 API
