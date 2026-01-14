# SPEC-DATA-003: 인수 기준 (Acceptance Criteria)

## TAG BLOCK

```
SPEC_ID: SPEC-DATA-003
TITLE: InBody Image OCR Data Extraction System
PHASE: Testing
STATUS: Ready for Validation
ASSIGNED: manager-tdd
VERSION: 1.0.0
```

---

## 정의 (Definition)

### Definition of Done (완료 정의)

기능이 완료(Completed)로 간주되기 위한 필수 조건:

1. 모든 필수 기능이 구현되었다
2. 단위 테스트 커버리지가 85% 이상이다
3. 통합 테스트가 모두 통과한다
4. 코드 리뷰가 완료되었다
5. 보안 검토를 통과했다
6. 문서가 작성되었다
7. 프로덕션 환경에 배포되었다

### Definition of Ready (준비 정의)

기능이 개발(Development) 단계로 들어가기 위한 필수 조건:

1. SPEC 문서가 작성되었다
2. 데이터베이스 스키마가 정의되었다
3. API 엔드포인트가 설계되었다
4. 의존성이 해결되었다
5. 전문가 협의가 완료되었다

---

## 테스트 시나리오 (Test Scenarios)

### Given-When-Then 형식

#### TC-DATA-001: 이미지 업로드 성공

**Given**: 사용자가 로그인되어 있고
**And**: 인바디 체성분 보고서 이미지 파일(JPG, 5MB)을 가지고 있을 때

**When**: 사용자가 이미지를 업로드하면

**Then**: 시스템은 이미지를 성공적으로 저장하고
**And**: OCR 처리를 시작하고
**And**: 처리 상태를 반환해야 한다

**예상 결과**:
- HTTP Status: 202 Accepted
- 응답 본문: `{ "message": "OCR processing started", "recordId": "cuid..." }`

---

#### TC-DATA-002: 지원되지 않는 파일 형식

**Given**: 사용자가 로그인되어 있고
**And**: 지원되지 않는 파일 형식(BMP)을 가지고 있을 때

**When**: 사용자가 파일을 업로드하면

**Then**: 시스템은 요청을 거부하고
**And**: 지원되는 형식 목록을 표시해야 한다

**예상 결과**:
- HTTP Status: 400 Bad Request
- 응답 본문: `{ "error": "Unsupported file format", "supportedFormats": ["jpg", "png", "pdf"] }`

---

#### TC-DATA-003: 파일 크기 초과

**Given**: 사용자가 로그인되어 있고
**And**: 11MB 크기의 이미지 파일을 가지고 있을 때

**When**: 사용자가 파일을 업로드하면

**Then**: 시스템은 요청을 거부하고
**And**: 최대 파일 크기를 알려줘야 한다

**예상 결과**:
- HTTP Status: 413 Payload Too Large
- 응답 본문: `{ "error": "File size exceeds limit", "maxSize": "10MB" }`

---

#### TC-DATA-004: 인증되지 않은 사용자

**Given**: 사용자가 로그인되어 있지 않을 때

**When**: 사용자가 이미지를 업로드하려고 하면

**Then**: 시스템은 요청을 거부하고
**And**: 로그인 페이지로 리다이렉트해야 한다

**예상 결과**:
- HTTP Status: 401 Unauthorized
- 응답 본문: `{ "error": "Authentication required" }`

---

#### TC-DATA-005: OCR 텍스트 추출 성공

**Given**: 시스템이 업로드된 이미지로 OCR 처리를 완료했고
**And**: OCR이 성공적으로 텍스트를 추출했을 때

**When**: 추출된 텍스트를 파싱하면

**Then**: 시스템은 9가지 주요 데이터 필드를 추출하고
**And**: 데이터베이스에 저장해야 한다

**예상 결과**:
- 데이터베이스에 InBodyRecord 레코드 생성
- 9개 필드 모두 값이 존재
- OCR 신뢰도 점수가 0.7 이상

---

#### TC-DATA-006: OCR 정확도 부족

**Given**: 시스템이 이미지로 OCR 처리를 수행했고
**And**: OCR 신뢰도 점수가 0.5 미만일 때

**When**: 데이터를 저장하려고 하면

**Then**: 시스템은 사용자에게 경고를 표시하고
**And**: 수동으로 데이터 수정을 요청해야 한다

**예상 결과**:
- HTTP Status: 200 OK (하지만 경고 플래그)
- 응답 본문: `{ "warning": "Low confidence", "confidence": 0.45, "requiresManualReview": true }`

---

#### TC-DATA-007: 데이터 파싱 실패

**Given**: 시스템이 OCR 텍스트를 추출했고
**And**: 텍스트에서 예상된 패턴을 찾지 못했을 때

**When**: 데이터를 파싱하면

**Then**: 시스템은 에러를 반환하고
**And**: 원본 OCR 텍스트를 사용자에게 표시해야 한다

**예상 결과**:
- HTTP Status: 422 Unprocessable Entity
- 응답 본문: `{ "error": "Failed to parse data", "rawText": "..." }`

---

#### TC-DATA-008: 중복 업로드 방지

**Given**: 사용자가 같은 날짜의 체성분 데이터를 이미 저장했고
**And**: 동일한 측정일시의 이미지를 다시 업로드할 때

**When**: 이미지를 업로드하면

**Then**: 시스템은 중복 경고를 표시하고
**And**: 기존 레코드를 업데이트할지 묻는다

**예상 결과**:
- HTTP Status: 409 Conflict
- 응답 본문: `{ "error": "Duplicate record", "existingRecordId": "cuid..." }`

---

#### TC-DATA-009: 데이터베이스 저장 성공

**Given**: 시스템이 데이터를 파싱했고
**And**: 모든 필수 필드가 검증을 통과했을 때

**When**: 데이터를 저장하면

**Then**: 시스템은 PostgreSQL에 레코드를 생성하고
**And**: 고유 ID를 반환해야 한다

**예상 결과**:
- Prisma 생성 쿼리 성공
- InBodyRecord 테이블에 새 레존
- 반환된 ID가 유효한 CUID 형식

---

#### TC-DATA-010: 측정 기록 조회

**Given**: 사용자가 5건의 체성분 측정 기록을 가지고 있을 때

**When**: 사용자가 기록 조회 페이지를 접속하면

**Then**: 시스템은 최신순으로 5건의 기록을 표시해야 한다

**예상 결과**:
- HTTP Status: 200 OK
- 응답 본문: 최신순 정렬된 5개 레존 배열
- 각 레존에 id, measuredAt, weight, bodyFat 포함

---

#### TC-DATA-011: 단일 레코드 조회

**Given**: 사용자가 체성분 레코드 ID를 가지고 있을 때

**When**: 사용자가 해당 ID의 상세 정보를 요청하면

**Then**: 시스템은 전체 데이터 필드를 반환해야 한다

**예상 결과**:
- HTTP Status: 200 OK
- 응답 본문: 9개 데이터 필드 모두 포함
- 원본 이미지 경로 포함

---

#### TC-DATA-012: 다른 사용자 데이터 접근 거부

**Given**: 사용자 A가 로그인되어 있고
**And**: 사용자 B의 레코드 ID를 알고 있을 때

**When**: 사용자 A가 사용자 B의 레코드를 조회하려고 하면

**Then**: 시스템은 접근을 거부해야 한다

**예상 결과**:
- HTTP Status: 403 Forbidden
- 응답 본문: `{ "error": "Access denied" }`

---

#### TC-DATA-013: 레코드 삭제

**Given**: 사용자가 체성분 레코드를 가지고 있을 때

**When**: 사용자가 해당 레코드를 삭제 요청하면

**Then**: 시스템은 레코드를 삭제하고
**And**: 연관된 이미지 파일도 삭제해야 한다

**예상 결과**:
- HTTP Status: 204 No Content
- 데이터베이스에서 레코드 삭제됨
- 파일 시스템에서 이미지 삭제됨

---

#### TC-DATA-014: OCR 처리 시간 초과

**Given**: 시스템이 OCR 처리를 시작했고
**And**: 30초가 경과했으나 처리가 완료되지 않았을 때

**When**: 타임아웃이 발생하면

**Then**: 시스템은 처리를 중단하고
**And**: 사용자에게 timeout 에러를 표시해야 한다

**예상 결과**:
- HTTP Status: 504 Gateway Timeout
- 응답 본문: `{ "error": "OCR processing timeout", "retry": true }`

---

#### TC-DATA-015: 대용량 파일 처리

**Given**: 사용자가 9.5MB 크기의 고해상도 이미지를 업로드할 때

**When**: 이미지 처리가 완료되면

**Then**: 시스템은 정상적으로 OCR 처리를 완료하고
**And**: 60초 이내에 데이터를 반환해야 한다

**예상 결과**:
- 처리 시간: 60초 이내
- OCR 성공률: 80% 이상
- HTTP Status: 200 OK

---

## 품질 게이트 (Quality Gates)

### TRUST 5 프레임워크 기준

#### Test-first (테스트 우선)

- [ ] 단위 테스트 커버리지 85% 이상
- [ ] 모든 API 엔드포인트에 대한 통합 테스트
- [ ] OCR 서비스에 대한 Mock 테스트
- [ ] 파싱 로직에 대한 파라미터화 테스트

**검증 방법**:
```bash
npm run test:coverage
```

**합격 기준**: Coverage 85% 이상

---

#### Readable (가독성)

- [ ] 명확한 함수/변수 네이밍
- [ ] 복잡도(Complexity) 10 미만
- [ ] ESLint 경고 0개
- [ ] TypeScript strict mode 준수

**검증 방법**:
```bash
npm run lint
npm run type-check
```

**합격 기준**: Zero warnings, Zero errors

---

#### Unified (통일성)

- [ ] Prettier 포맷팅 적용
- [ ] 일관된 임포트 순서
- [ ] 일관된 에러 처리 패턴
- [ ] 일관된 API 응답 형식

**검증 방법**:
```bash
npm run format:check
```

**합격 기준**: Zero formatting issues

---

#### Secured (보안)

- [ ] OWASP Top 10 취약점 없음
- [ ] 파일 업로드 취약점 없음
- [ ] 사용자별 데이터 격리
- [ ] 민감 정보 로깅 없음
- [ ] SQL Injection 방지

**검증 방법**:
```bash
npm run audit
npm run security-scan
```

**합격 기준**:
- Zero high/critical vulnerabilities
- Zero security warnings

---

#### Trackable (추적 가능성)

- [ ] 구조화된 커밋 메시지
- [ ] 각 기능에 대한 이슈/SPEC 참조
- [ ] 명확한 변경 로그
- [ ] 에러 로그에 스택 트레이스 포함

**검증 방법**:
```bash
git log --oneline -10
```

**합격 기준**:
- 모든 커밋이 규칙 준수
- 커밋 메시지에 SPEC-ID 포함

---

## 성능 기준 (Performance Criteria)

### 응답 시간 (Response Time)

| 엔드포인트 | P50 (중앙값) | P95 (95퍼센타일) | P99 (99퍼센타일) |
|----------|-------------|-----------------|-----------------|
| POST /upload | 40s | 55s | 60s |
| GET /history | 100ms | 200ms | 500ms |
| GET /[id] | 50ms | 100ms | 200ms |
| DELETE /[id] | 100ms | 300ms | 500ms |

### 처리량 (Throughput)

- 이미지 업로드: 최소 10 req/min
- 조회 요청: 최소 100 req/min

### 리소스 사용 (Resource Usage)

- 메모리: 최대 500MB/요청
- 디스크: 최대 50MB/임시 파일
- CPU: 최대 80% (단일 코어)

---

## 보안 기준 (Security Criteria)

### 인증 및 권한 (Authentication & Authorization)

- [ ] 모든 API 엔드포인트에 인증 필요
- [ ] 사용자별 데이터 접근 제어
- [ ] 세션 만료 처리
- [ ] CSRF 보호

### 파일 처리 (File Handling)

- [ ] 파일 형식 검증 (Magic bytes)
- [ ] 파일 크기 제한
- [ ] 악성 파일 스캔
- [ ] 파일명 샌디타이징

### 데이터 보호 (Data Protection)

- [ ] 암호화된 저장 (At rest)
- [ ] HTTPS 전송 (In transit)
- [ ] 민감 정보 로깅 제외
- [ ] 개인정보 삭제 지원

---

## 사용자 경험 기준 (UX Criteria)

### 업로드 경험

- [ ] 드래그 앤 드롭 지원
- [ ] 파일 미리보기 제공
- [ ] 진행 상태 실시간 표시
- [ ] 에러 메시지 명확하고 조작 가능

### 데이터 확인

- [ ] 추출된 데이터 즉시 표시
- [ ] 수정 UI 직관적
- [ ] 저장 전 검증
- [ ] 되돌리기 기능

### 모바일 지원

- [ ] 반응형 디자인
- [ ] 터치 인터페이스 최적화
- [ ] 모바일에서 카메라 촬영 지원

---

## 호환성 기준 (Compatibility Criteria)

### 브라우저 지원

- [ ] Chrome 120+
- [ ] Safari 17+
- [ ] Firefox 120+
- [ ] Edge 120+

### 이미지 형식

- [ ] JPEG (`.jpg`, `.jpeg`)
- [ ] PNG (`.png`)
- [ ] HEIC (선택사항, iOS)

### 해상도

- [ ] 최소: 300 DPI
- [ ] 권장: 600 DPI
- [ ] 최대: 1200 DPI

---

## 인수 테스트 절차 (Acceptance Test Procedure)

### 1단계: 환경 설정

1. PostgreSQL 데이터베이스 시작
2. Prisma 마이그레이션 실행
3. Tesseract.js 설치 및 언어 팩 다운로드
4. 테스트 서버 시작

### 2단계: 기능 테스트

1. **Given-When-Then 시나리오 실행**
   - 15개 테스트 케이스 순차 실행
   - 각 테스트 결과 기록
   - 실패 시 재현 및 버그 보고

2. **데이터 검증**
   - 데이터베이스 레존 확인
   - OCR 정확도 측정
   - 필드 completeness 검사

### 3단계: 품질 게이트 통과

1. **TRUST 5 검증**
   - 테스트 커버리지 확인
   - 린터/포매터 실행
   - 보안 스캔 수행
   - 코드 리뷰 완료

2. **성능 테스트**
   - 부하 테스트 실행
   - 응답 시간 측정
   - 메모리 사용량 모니터링

### 4단계: 사용자 인수 테스트 (UAT)

1. **테스트 사용자 선정**
   - 5명의 실제 사용자
   - 다양한 인바디 보고서 형식

2. **테스트 시나리오**
   - 이미지 업로드
   - 데이터 확인 및 수정
   - 기록 조회

3. **피드백 수집**
   - 사용자 만족도 조사
   - 버그 리포트
   - 개선사항 제안

### 5단계: 인수 결정

- [ ] 모든 필수 기능 구현 완료
- [ ] 모든 테스트 케이스 통과
- [ ] 품질 게이트 통과
- [ ] 성능 기준 충족
- [ ] 보안 기준 충족
- [ ] UAT 통과

---

## 롤백 기준 (Rollback Criteria)

다음 경우 이전 버전으로 롤백:

1. Critical 버그 발견 (데이터 손실, 보안 취약점)
2. 성능 저하 (50% 이상 응답 시간 증가)
3. OCR 정확도 70% 미만
4. 사용자 불만족도 30% 이상

---

**작성자**: Alfred (Claude)
**검토자**: Pending (QA Team)
**승인자**: Pending (Product Owner)
**버전**: 1.0.0
**마지막 업데이트**: 2026-01-14
