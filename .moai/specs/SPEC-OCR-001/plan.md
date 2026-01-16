# SPEC-OCR-001: 구현 계획

## TAG BLOCK

```
SPEC_ID: SPEC-OCR-001
TITLE: InBody Body Score Extraction Accuracy Improvement System
DOMAIN: OCR
STATUS: planned
PRIORITY: High
ASSIGNED: manager-tdd
VERSION: 1.0.0
```

---

## 1. 마일스톤 (Milestones)

### Milestone 1: 기반 인프라 구축 (최우선)

**목표**: 이미지 전처리 시스템과 패턴 라이브러리 기반 구축

**태스크**:
- 이미지 전처리 모듈 구현 (TAG-OCR-001)
- 정규식 패턴 라이브러리 구현 (TAG-OCR-002)
- 단위 테스트 작성

**완료 기준**:
- [ ] 이미지 전처리 5가지 기능 구현 완료
- [ ] 10개 이상의 정규식 패턴 정의 완료
- [ ] 단위 테스트 통과 (90% 이상 커버리지)

### Milestone 2: 추출 엔진 개발 (차 우선)

**목표**: 다단계 추출 엔진 및 OCR 설정 최적화

**태스크**:
- 다단계 추출 엔진 구현 (TAG-OCR-003)
- OCR 설정 최적화 (TAG-OCR-004)
- 기존 parser-service.ts와 통합 (TAG-OCR-006)

**완료 기준**:
- [ ] 3단계 추출 전략 구현 완료
- [ ] PSM 모드 최적화 완료
- [ ] 기존 파서와 호환성 확인

### Milestone 3: 에러 처리 및 UX 개선 (최종 우선)

**목표**: 에러 처리 개선 및 API 확장

**태스크**:
- 에러 처리 모듈 개선 (TAG-OCR-005)
- 클라이언트 OCR 전처리 통합 (TAG-OCR-007)
- API 엔드포인트 확장 (TAG-OCR-008)
- 통합 테스트

**완료 기준**:
- [ ] 상세한 에러 메시지 구현
- [ ] 재시도 API 구현
- [ ] 통합 테스트 통과

### Milestone 4: 품질 검증 및 최적화 (선택적 우선)

**목표**: 성능 최적화 및 벤치마크 테스트

**태스크**:
- 100개 이상의 실제 이미지로 벤치마크
- 성능 프로파일링 및 병목 지점 최적화
- 사용자 피드백 수집 및 개선

**완료 기준**:
- [ ] 95% 이상 추출 성공률 달성
- [ ] 20초 이내 OCR 처리 시간 확보
- [ ] 사용자 피드백 반영

---

## 2. 기술 접근 방식 (Technical Approach)

### 2.1 이미지 전처리 전략

**HTML5 Canvas API 활용**:

```typescript
interface ImagePreprocessor {
  toGrayscale(imageData: ImageData): ImageData;
  enhanceContrast(imageData: ImageData, factor: number): ImageData;
  denoise(imageData: ImageData, iterations: number): ImageData;
  binarize(imageData: ImageData, threshold: number): ImageData;
  detectRotation(imageData: ImageData): number;
  rotate(imageData: ImageData, angle: number): ImageData;
  calculateQuality(imageData: ImageData): ImageQualityMetrics;
}
```

**전처리 파이프라인**:
1. 그레이스케일 변환 (RGB → Grayscale)
2. 대비 향상 (Histogram Equalization)
3. 노이즈 제거 (Median Filter)
4. 이진화 (Adaptive Threshold)
5. 회전 보정 (Hough Transform)

**이미지 품질 평가 알고리즘**:
- **선명도**: Laplacian Variance
- **대비**: Standard Deviation of Intensity
- **밝기**: Mean Pixel Value
- **노이즈**: Signal-to-Noise Ratio
- **회전**: Hough Line Transform

### 2.2 정규식 패턴 라이브러리

**패턴 구조**:

```typescript
const BODY_SCORE_PATTERNS: PatternDefinition[] = [
  {
    id: 'pattern-001',
    name: 'Standard Score Format',
    priority: 1,
    regex: /신체\s*점수[^0-9]*(\d{2,3})\s*표준/,
    description: '신체 점수 100 표준 형식',
    targetFormats: ['InBody770', 'InBody970'],
    confidenceWeight: 0.95,
  },
  {
    id: 'pattern-002',
    name: 'Point Fraction Format',
    priority: 2,
    regex: /(\d{2,3})\s*\/\s*100\s*포인트/,
    description: '100/100포인트 형식',
    targetFormats: ['InBody720', 'OntoFit'],
    confidenceWeight: 0.90,
  },
  {
    id: 'pattern-003',
    name: 'Body Score Colon Format',
    priority: 3,
    regex: /Body\s*Score\s*[:\s]*(\d{2,3})/,
    description: 'Body Score: 95 형식',
    targetFormats: ['OntoFit'],
    confidenceWeight: 0.85,
  },
  // ... 7개 이상의 추가 패턴
];
```

**지원 형식**:
- InBody 770: 표준 병원용 기기
- InBody 970: 고급 기능 모델
- InBody 720: 간소형 모델
- OntoFit 앱: 모바일 앱 버전

### 2.3 다단계 추출 전략

**추출 파이프라인**:

```typescript
async function extractBodyScore(
  ocrText: string,
  ocrConfidence: number,
  imageQuality: ImageQualityMetrics
): Promise<ExtractionResult> {
  const attempts: ExtractionAttempt[] = [];

  // OCR 신뢰도에 따라 시작 단계 결정
  const startStage = determineStartStage(ocrConfidence);

  // 다단계 추출 시도
  for (const stage of EXTRACTION_STAGES.slice(startStage)) {
    for (const pattern of stage.patterns) {
      const attempt = await tryPattern(pattern, ocrText, ocrConfidence, imageQuality);
      attempts.push(attempt);

      if (attempt.success) {
        return {
          success: true,
          bodyScore: attempt.extractedValue,
          confidence: calculateConfidence(attempt),
          attempts,
          recommendedAction: determineRecommendedAction(attempt),
        };
      }
    }
  }

  // 모든 시도 실패
  return {
    success: false,
    attempts,
    recommendedAction: 'manual',
    errorMessage: generateErrorMessage(attempts),
  };
}
```

**단계 구성**:
- **1단계** (고신뢰도): Priority 1-3 패턴, OCR 신뢰도 80%+
- **2단계** (중신뢰도): Priority 4-7 패턴, OCR 신뢰도 50-80%
- **3단계** (저신뢰도): Priority 8-10 패턴, OCR 신뢰도 <50%

### 2.4 OCR 설정 최적화

**PSM 모드 선택 전략**:

| 이미지 특성 | 권장 PSM | 설명 |
|-----------|---------|------|
| 텍스트 밀집, 구조화됨 | PSM 6 | 단일 텍스트 블록 |
| 여러 텍스트 영역 | PSM 3 | 자동 페이지 분할 |
| 희소 텍스트 | PSM 11 | sparse text |

**신뢰도 임계값 조정**:
- 현재: 30% → 목표: 50%
- 단계적 상향: 30% → 40% → 50%
- 이미지 품질 기반 동적 조정

### 2.5 에러 처리 및 재시도 로직

**에러 분류**:
1. **OCR 실패**: Tesseract.js 처리 오류
2. **추출 실패**: 모든 패턴 매칭 실패
3. **검증 실패**: 추출값이 범위를 벗어남
4. **품질 불량**: 이미지 품질 점수 < 60

**재시도 전략**:

```typescript
async function retryExtraction(
  imageData: ImageData,
  attemptCount: number
): Promise<ExtractionResult> {
  if (attemptCount >= MAX_RETRIES) {
    return manualInputRequired();
  }

  const enhancedImage = applyEnhancedPreprocessing(imageData, attemptCount);
  const result = await extractBodyScore(enhancedImage);

  if (!result.success) {
    return retryExtraction(enhancedImage, attemptCount + 1);
  }

  return result;
}
```

**전처리 강화 단계**:
- 1차 시도: 기본 전처리
- 2차 시도: 대비 강화 (+20%), 노이즈 제거 2회
- 3차 시도: 대비 강화 (+40%), 이진화 임계값 조정

---

## 3. 아키텍처 설계 (Architecture Design)

### 3.1 모듈 구조

```
src/lib/
├── image-preprocessor.ts          # 이미지 전처리 모듈
├── pattern-library.ts              # 정규식 패턴 라이브러리
├── multi-stage-extractor.ts        # 다단계 추출 엔진
├── ocr-config.ts                   # OCR 설정 최적화
├── extraction-error-handler.ts     # 에러 처리 모듈
├── parser-service.ts               # 기존 파서 (수정)
├── client-ocr.ts                   # 클라이언트 OCR (수정)
└── types/
    └── extraction.ts               # 추출 관련 타입 정의
```

### 3.2 데이터 흐름

```
이미지 업로드
    ↓
이미지 전처리 (image-preprocessor.ts)
    ↓
OCR 처리 (client-ocr.ts / ocr-service.ts)
    ↓
다단계 추출 (multi-stage-extractor.ts)
    ↓
패턴 라이브러리 (pattern-library.ts)
    ↓
검증 및 에러 처리 (extraction-error-handler.ts)
    ↓
데이터베이스 저장 (InBodyRecord.bodyScore)
```

### 3.3 컴포넌트 상호작용

```typescript
// 이미지 업로드 핸들러
async function handleImageUpload(file: File): Promise<InBodyData> {
  // 1. 클라이언트 전처리
  const preprocessed = await preprocessImage(file);

  // 2. OCR 처리
  const ocrResult = await extractTextFromImageClient(preprocessed);

  // 3. 다단계 추출
  const extractionResult = await extractBodyScore(
    ocrResult.text,
    ocrResult.confidence,
    preprocessed.quality
  );

  // 4. 에러 처리
  if (!extractionResult.success) {
    throw new ExtractionError(extractionResult.errorMessage, {
      attempts: extractionResult.attempts,
      action: extractionResult.recommendedAction,
    });
  }

  // 5. 기존 파서로 나머지 데이터 추출
  const inBodyData = await parseInBodyData(ocrResult.text);
  inBodyData.bodyScore = extractionResult.bodyScore;
  inBodyData.scoreDescription = extractionResult.scoreDescription;

  return inBodyData;
}
```

---

## 4. 구현 일정 (Implementation Schedule)

### Phase 1: 기반 인프라 (3-4일)

| 작업 | 파일 | 예상 시간 |
|-----|------|----------|
| 이미지 전처리 모듈 구현 | image-preprocessor.ts | 1일 |
| 정규식 패턴 라이브러리 구현 | pattern-library.ts | 1일 |
| 타입 정의 | types/extraction.ts | 0.5일 |
| 단위 테스트 작성 | *.test.ts | 1일 |
| 검증 및 수정 | - | 0.5일 |

### Phase 2: 추출 엔진 (3-4일)

| 작업 | 파일 | 예상 시간 |
|-----|------|----------|
| 다단계 추출 엔진 구현 | multi-stage-extractor.ts | 1.5일 |
| OCR 설정 최적화 | ocr-config.ts | 0.5일 |
| parser-service.ts 통합 | parser-service.ts | 1일 |
| 클라이언트 OCR 통합 | client-ocr.ts | 0.5일 |
| 단위 테스트 작성 | *.test.ts | 0.5일 |
| 검증 및 수정 | - | 0.5일 |

### Phase 3: 에러 처리 (2-3일)

| 작업 | 파일 | 예상 시간 |
|-----|------|----------|
| 에러 처리 모듈 개선 | extraction-error-handler.ts | 1일 |
| 재시도 로직 구현 | multi-stage-extractor.ts | 0.5일 |
| API 엔드포인트 확장 | api/inbody/**/route.ts | 1일 |
| 단위 테스트 작성 | *.test.ts | 0.5일 |
| 검증 및 수정 | - | 0.5일 |

### Phase 4: 통합 및 테스트 (2-3일)

| 작업 | 예상 시간 |
|-----|----------|
| 통합 테스트 | 1일 |
| 벤치마크 테스트 (100개 이미지) | 0.5일 |
| 성능 프로파일링 | 0.5일 |
| 버그 수정 및 개선 | 1일 |

**총 예상 기간**: 10-14일

---

## 5. 기술 제약사항 (Technical Constraints)

### 5.1 필수 제약사항

1. **클라이언트 OCR 유지**: Tesseract.js를 브라우저에서 실행
2. **기존 API 호환성**: POST /api/inbody/upload 엔드포인트 변경 최소화
3. **데이터베이스 스키마 변경 없음**: InBodyRecord 테이블 구조 유지
4. **TypeScript + Zod**: 타입 안전성 유지

### 5.2 성능 제약사항

1. **OCR 처리 시간**: 20초 이내
2. **이미지 전처리 시간**: 2초 이내
3. **메모리 사용량**: 500MB 이내 (클라이언트)
4. **번들 크기 증가**: 200KB 이내

### 5.3 브라우저 호환성

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 5.4 외부 의존성 제약

- 클라우드 OCR 서비스 미사용 (Google Vision API, AWS Textract 등)
- 오픈소스 라이브러리만 사용 (Tesseract.js, Canvas API)

---

## 6. 리스크 관리 (Risk Management)

### 6.1 기술적 리스크

| 리스크 | 확률 | 영향 | 완화 전략 |
|-------|-----|-----|----------|
| OCR 정확도 개선 부족 | 중 | 높 | 다양한 전처리 기법 테스트, 패턴 다각화 |
| 성능 저하 | 중 | 중 | Web Worker 활용, 지연 로딩 |
| 브라우저 호환성 문제 | 낮 | 중 | Polygram 제공, fallback 메커니즘 |
| 패턴 오버피팅 | 중 | 중 | 검증 데이터셋 분리, 정규화 |

### 6.2 일정 리스크

| 리스크 | 확률 | 영향 | 완화 전략 |
|-------|-----|-----|----------|
| 구현 난이도 과소평가 | 중 | 높 | Phase 별 buffer time 확보 |
| 테스트 데이터 부족 | 중 | 중 | 사용자 이미지 수집, synthetic data |
| 통합 문제 발생 | 낮 | 높 | 점진적 통합, 회귀 테스트 |

### 6.3 사용자 경험 리스크

| 리스크 | 확률 | 영향 | 완화 전략 |
|-------|-----|-----|----------|
| 에러 메시지 불명확 | 중 | 중 | 사용자 테스트, 메시지 개선 |
| 수동 입력 요청 증가 | 낮 | 높 | 재시도 메커니즘 최적화 |
| UI 반응성 저하 | 중 | 중 | 진행률 표시, 비동기 처리 |

---

## 7. 테스트 전략 (Testing Strategy)

### 7.1 단위 테스트

**대상**:
- image-preprocessor.ts: 90% 커버리지
- pattern-library.ts: 100% 커버리지
- multi-stage-extractor.ts: 90% 커버리지
- extraction-error-handler.ts: 85% 커버리지

**도구**: Vitest + Testing Library

### 7.2 통합 테스트

**시나리오**:
1. 정상적인 이미지 업로드 및 신체점수 추출
2. 낮은 OCR 신뢰도 이미지 처리
3. 회전된 이미지 보정
4. 다양한 InBody 형식 지원
5. 재시도 로직 검증

### 7.3 벤치마크 테스트

**데이터셋**: 100개 이상의 실제 InBody 이미지
- InBody 770: 40개
- InBody 970: 30개
- InBody 720: 20개
- OntoFit 앱: 10개

**성공 기준**:
- 전체 추출 성공률: 95% 이상
- 각 형식별 성공률: 90% 이상
- 평균 처리 시간: 15초 이내

### 7.4 성능 테스트

**메트릭**:
- OCR 처리 시간
- 전처리 시간
- 메모리 사용량
- CPU 사용량

**도구**: Chrome DevTools, Lighthouse

---

## 8. 모니터링 및 로깅 (Monitoring & Logging)

### 8.1 로그 메트릭

```typescript
interface ExtractionLog {
  timestamp: Date;
  inbodyRecordId: string;
  ocrConfidence: number;
  imageQualityScore: number;
  extractionSuccess: boolean;
  attemptsCount: number;
  usedPatternId: string;
  executionTimeMs: number;
  errorMessage?: string;
}
```

### 8.2 대시보드 지표

- 추출 성공률 (일별/주별)
- 사용된 패턴 분포
- OCR 신뢰도 분포
- 이미지 품질 점수 분포
- 평균 처리 시간
- 에러 유형별 빈도

---

## 9. 롤백 계획 (Rollback Plan)

### 9.1 롤백 트리거

- 추출 성공률 80% 미만
- OCR 처리 시간 30초 초과
- 치명적 버그 발견

### 9.2 롤백 절차

1. 기존 parser-service.ts로 복원
2. 클라이언트 OCR 전처리 비활성화
3. 신뢰도 임계값 30%로 복원
4. 에러 메시지 복원

### 9.3 롤백 후 조치

- 원인 분석
- 수정 계획 수립
- 재배포 일정 확정

---

## 10. 다음 단계 (Next Steps)

1. **Phase 1 시작**: 이미지 전처리 모듈 구현
2. **데이터 수집**: 100개 이상의 테스트 이미지 확보
3. **코드 리뷰**: 기존 parser-service.ts와의 호환성 검토
4. **사용자 테스트 계획**: 베타 테스터 모집

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2026-01-16
**작성자**: Alfred (Claude)
