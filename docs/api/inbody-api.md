# InBody API 가이드

이 가이드는 InBody 데이터 관리 API 클라이언트 사용법을 설명합니다.

## 개요

InBody API 클라이언트는 InBody 체성분 데이터를 관리하기 위한 RESTful API 인터페이스를 제공합니다. 이미지 업로드, 기록 조회, 기록 삭제 등의 기능을 지원합니다.

## API 클라이언트

### 가져오기

```typescript
import {
  uploadInBodyImage,
  fetchInBodyHistory,
  deleteInBodyRecord,
  fetchExtractionDetail,
  retryExtraction
} from '@/lib/api/inbody-api'
```

## 함수 레퍼런스

### uploadInBodyImage

InBody 이미지를 업로드하고 OCR로 데이터를 추출합니다.

#### 시그니처

```typescript
function uploadInBodyImage(file: File): Promise<UploadResponse>
```

#### 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| file | File | 업로드할 이미지 파일 (JPG/PNG, 최대 10MB) |

#### 반환값

```typescript
type UploadResponse = {
  success: boolean
  data?: {
    id: string
    measuredAt: Date
    ocrConfidence: number
    // 기타 추출된 데이터...
  }
  error?: string
}
```

#### 예시

```typescript
// 파일 업로드 핸들러
const handleUpload = async (file: File) => {
  const result = await uploadInBodyImage(file)

  if (result.success) {
    console.log('업로드 성공:', result.data)
    // 성공 처리: UI 업데이트, 메시지 표시 등
  } else {
    console.error('업로드 실패:', result.error)
    // 에러 처리: 사용자에게 메시지 표시
  }
}
```

#### TanStack Query와 함께 사용

```typescript
import { useMutation } from '@tanstack/react-query'

function useUploadInBody() {
  return useMutation({
    mutationFn: uploadInBodyImage,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('이미지가 업로드되었습니다')
        // 기록 목록 갱신
        queryClient.invalidateQueries({ queryKey: ['inbody-history'] })
      }
    },
    onError: (error) => {
      toast.error('업로드에 실패했습니다')
    }
  })
}

// 컴포넌트에서 사용
function UploadButton() {
  const uploadMutation = useUploadInBody()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  return <input type="file" onChange={handleFileChange} />
}
```

---

### fetchInBodyHistory

InBody 측정 기록 목록을 조회합니다.

#### 시그니처

```typescript
function fetchInBodyHistory(options?: {
  page?: number
  pageSize?: number
  from?: Date
  to?: Date
}): Promise<HistoryResponse>
```

#### 파라미터

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| page | number | 아니오 | 1 | 조회할 페이지 번호 |
| pageSize | number | 아니오 | 20 | 페이지당 레코드 수 |
| from | Date | 아니오 | - | 시작 날짜 필터 |
| to | Date | 아니오 | - | 종료 날짜 필터 |

#### 반환값

```typescript
type HistoryResponse = {
  records: InBodyRecord[]
  total: number
  page: number
  pageSize: number
}
```

#### 예시

```typescript
// 기본 조회 (첫 페이지, 20개 레코드)
const history = await fetchInBodyHistory()

// 페이지네이션
const page2 = await fetchInBodyHistory({ page: 2, pageSize: 10 })

// 날짜 범위 필터링
const filtered = await fetchInBodyHistory({
  from: new Date('2025-01-01'),
  to: new Date('2025-03-31')
})

// 복합 옵션
const result = await fetchInBodyHistory({
  page: 1,
  pageSize: 10,
  from: new Date('2025-01-01'),
  to: new Date('2025-12-31')
})
```

#### TanStack Query와 함께 사용

```typescript
import { useQuery } from '@tanstack/react-query'

function useInBodyHistory(options?: {
  page?: number
  pageSize?: number
  from?: Date
  to?: Date
}) {
  return useQuery({
    queryKey: ['inbody-history', options],
    queryFn: () => fetchInBodyHistory(options),
    staleTime: 1000 * 60 * 5, // 5분
  })
}

// 컴포넌트에서 사용
function HistoryList({ page }: { page: number }) {
  const { data, isLoading, error } = useInBodyHistory({ page, pageSize: 10 })

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러 발생</div>

  return (
    <ul>
      {data?.records.map(record => (
        <li key={record.id}>{record.measuredAt}</li>
      ))}
    </ul>
  )
}
```

---

### deleteInBodyRecord

특정 InBody 측정 기록을 삭제합니다.

#### 시그니처

```typescript
function deleteInBodyRecord(id: string): Promise<{ success: boolean }>
```

#### 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| id | string | 삭제할 기록의 ID |

#### 반환값

```typescript
type DeleteResponse = {
  success: boolean
}
```

#### 예시

```typescript
const handleDelete = async (recordId: string) => {
  const result = await deleteInBodyRecord(recordId)

  if (result.success) {
    console.log('삭제 성공')
    // 목록 갱신
  } else {
    console.error('삭제 실패')
  }
}
```

#### TanStack Query와 함께 사용

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useDeleteInBody() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInBodyRecord,
    onSuccess: () => {
      toast.success('기록이 삭제되었습니다')
      // 기록 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['inbody-history'] })
    },
    onError: () => {
      toast.error('삭제에 실패했습니다')
    }
  })
}

// 컴포넌트에서 사용
function DeleteButton({ recordId }: { recordId: string }) {
  const deleteMutation = useDeleteInBody()

  const handleClick = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(recordId)
    }
  }

  return <button onClick={handleClick}>삭제</button>
}
```

## 통합 예시

### InBody 대시보드 컴포넌트

```typescript
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadInBodyImage, fetchInBodyHistory, deleteInBodyRecord } from '@/lib/api/inbody-api'

export function InBodyDashboard() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  // 기록 조회
  const { data: history, isLoading } = useQuery({
    queryKey: ['inbody-history', { page }],
    queryFn: () => fetchInBodyHistory({ page, pageSize: 10 }),
  })

  // 이미지 업로드
  const uploadMutation = useMutation({
    mutationFn: uploadInBodyImage,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['inbody-history'] })
      }
    },
  })

  // 기록 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteInBodyRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbody-history'] })
    },
  })

  const handleFileUpload = (file: File) => {
    uploadMutation.mutate(file)
  }

  const handleDelete = (id: string) => {
    if (confirm('삭제하시겠습니까?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div>로딩 중...</div>

  return (
    <div>
      {/* 업로드 영역 */}
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        disabled={uploadMutation.isPending}
      />

      {/* 기록 목록 */}
      <ul>
        {history?.records.map((record) => (
          <li key={record.id}>
            {record.measuredAt.toLocaleDateString()}
            <button onClick={() => handleDelete(record.id)}>삭제</button>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
        이전
      </button>
      <span>페이지 {page}</span>
      <button onClick={() => setPage((p) => p + 1)} disabled={!history?.records.length}>
        다음
      </button>
    </div>
  )
}
```

## 에러 처리

### API 에러 처리

모든 API 함수는 에러를 발생시킬 수 있습니다. 적절한 에러 처리를 구현해야 합니다.

```typescript
try {
  const result = await uploadInBodyImage(file)
  if (!result.success) {
    // 비즈니스 로직 에러
    throw new Error(result.error)
  }
} catch (error) {
  // 네트워크 에러 또는 기타 에러
  console.error('업로드 실패:', error)
  // 사용자에게 에러 메시지 표시
}
```

### TanStack Query 에러 처리

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['inbody-history'],
  queryFn: fetchInBodyHistory,
  retry: 3, // 실패 시 3번 재시도
  onError: (error) => {
    console.error('기록 조회 실패:', error)
    toast.error('기록을 불러오지 못했습니다')
  }
})

if (error) {
  return <div>에러: {error.message}</div>
}
```

## 타입 정의

API 함수에서 사용하는 타입들은 `src/lib/types/inbody.ts`에 정의되어 있습니다.

```typescript
// src/lib/types/inbody.ts
export interface InBodyData {
  id: string
  userId: string
  measuredAt: Date
  imagePath: string
  weight?: number
  bodyFatPercentage?: number
  skeletalMuscle?: number
  bodyScore?: number
  bmi?: number
  // ... 기타 필드
}

export interface InBodyRecord {
  id: string
  measuredAt: Date
  weight?: number
  bodyFat?: number
  // ... 요약 필드
}

export interface UploadResponse {
  success: boolean
  data?: InBodyData
  error?: string
}

export interface HistoryResponse {
  records: InBodyRecord[]
  total: number
  page: number
  pageSize: number
}

export interface DateRangeFilter {
  from?: Date
  to?: Date
}
```

## 모범 사례

### 1. 캐싱 활용

TanStack Query의 캐싱 기능을 활용하여 불필요한 API 호출을 줄이세요.

```typescript
const { data } = useQuery({
  queryKey: ['inbody-history'],
  queryFn: fetchInBodyHistory,
  staleTime: 1000 * 60 * 5, // 5분간 데이터 신선하게 유지
  gcTime: 1000 * 60 * 10,   // 10분후 캐시 삭제
})
```

### 2. 낙관적 업데이트

삭제 작업 등에서 낙관적 업데이트를 사용하여 사용자 경험을 개선하세요.

```typescript
const deleteMutation = useMutation({
  mutationFn: deleteInBodyRecord,
  onMutate: async (id) => {
    // 진행 중인 쿼리 취소
    await queryClient.cancelQueries({ queryKey: ['inbody-history'] })

    // 이전 데이터 스냅샷
    const previousData = queryClient.getQueryData(['inbody-history'])

    // 낙관적 업데이트
    queryClient.setQueryData(['inbody-history'], (old: any) => ({
      ...old,
      records: old.records.filter((r: any) => r.id !== id)
    }))

    return { previousData }
  },
  onError: (err, variables, context) => {
    // 에러 시 롤백
    queryClient.setQueryData(['inbody-history'], context?.previousData)
  },
})
```

### 3. 요청 중복 방지

같은 요청이 중복으로 실행되지 않도록 하세요.

```typescript
const { data } = useQuery({
  queryKey: ['inbody-history', { page }],
  queryFn: () => fetchInBodyHistory({ page }),
  refetchOnWindowFocus: false, // 창 포커스 시 재요청 방지
})
```

### 4. 로딩 상태 관리

업로드 등 장기 실행 작업의 진행 상태를 사용자에게 표시하세요.

```typescript
const uploadMutation = useMutation({
  mutationFn: uploadInBodyImage,
  onMutate: () => {
    toast.loading('업로드 중...', { id: 'upload' })
  },
  onSuccess: () => {
    toast.success('업로드 완료', { id: 'upload' })
  },
  onError: () => {
    toast.error('업로드 실패', { id: 'upload' })
  },
})
```

## 관련 문서

- [TanStack Query 문서](https://tanstack.com/query/latest)
- [SPEC-FE-004: InBody 데이터 관리 대시보드](../../.moai/specs/SPEC-FE-004/spec.md)
- [SPEC-FE-004 인수 기준](../../.moai/specs/SPEC-FE-004/acceptance.md)

---

## OCR 추출 API (SPEC-OCR-001)

### fetchExtractionDetail

InBody 레코드의 OCR 추출 상세 정보를 조회합니다.

#### 시그니처

```typescript
function fetchExtractionDetail(id: string): Promise<ExtractionDetailResponse>
```

#### 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| id | string | InBody 레코드 ID |

#### 반환값

```typescript
type ExtractionDetailResponse = {
  success: boolean
  data?: {
    id: string
    extractionResult: {
      attempts: Array<{
        patternId: string
        patternName: string
        matchedText: string
        extractedValue: string
        confidence: number
        timestamp: Date
      }>
      confidence: number
      processingTimeMs: number
      timestamp: string
    }
  }
  error?: string
}
```

#### 예시

```typescript
// 추출 상세 조회
const detail = await fetchExtractionDetail('record-id')

if (detail.success) {
  console.log('추출 신뢰도:', detail.data.extractionResult.confidence)
  console.log('시도한 패턴 수:', detail.data.extractionResult.attempts.length)

  // 각 시도 결과 확인
  detail.data.extractionResult.attempts.forEach(attempt => {
    console.log(`패턴: ${attempt.patternName}, 신뢰도: ${attempt.confidence}%`)
  })
}
```

#### TanStack Query와 함께 사용

```typescript
import { useQuery } from '@tanstack/react-query'

function useExtractionDetail(recordId: string) {
  return useQuery({
    queryKey: ['inbody-extraction', recordId],
    queryFn: () => fetchExtractionDetail(recordId),
    enabled: !!recordId, // recordId가 있을 때만 조회
  })
}

// 컴포넌트에서 사용
function ExtractionDetail({ recordId }: { recordId: string }) {
  const { data, isLoading, error } = useExtractionDetail(recordId)

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러 발생</div>
  if (!data?.success) return <div>조회 실패</div>

  const { extractionResult } = data.data

  return (
    <div>
      <h3>추출 상세 정보</h3>
      <p>신뢰도: {extractionResult.confidence}%</p>
      <p>처리 시간: {extractionResult.processingTimeMs}ms</p>

      <h4>시도한 패턴</h4>
      <ul>
        {extractionResult.attempts.map((attempt, idx) => (
          <li key={idx}>
            {attempt.patternName} - 신뢰도: {attempt.confidence}%
            <br />
            <small>매칭 텍스트: {attempt.matchedText}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### retryExtraction

강화된 전처리를 사용하여 OCR 추출을 재시도합니다.

#### 시그니처

```typescript
function retryExtraction(
  id: string,
  options?: {
    retryCount?: number
  }
): Promise<RetryExtractionResponse>
```

#### 파라미터

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| id | string | 예 | - | InBody 레코드 ID |
| retryCount | number | 아니오 | 0 | 현재 재시도 횟수 |

#### 반환값

```typescript
type RetryExtractionResponse = {
  success: boolean
  data?: {
    id: string
    extractionResult: {
      attempts: Array<{
        patternId: string
        patternName: string
        matchedText: string
        extractedValue: string
        confidence: number
        timestamp: Date
      }>
      confidence: number
      processingTimeMs: number
      timestamp: string
    }
    retryCount: number
    enhancedLevel: number // 1-3, 강화된 전처리 레벨
  }
  error?: string
}
```

#### 예시

```typescript
// 첫 번째 재시도 (레벨 1)
const firstRetry = await retryExtraction('record-id', { retryCount: 0 })

if (firstRetry.success) {
  console.log('재시도 성공, 강화 레벨:', firstRetry.data.enhancedLevel)
  console.log('개선된 신뢰도:', firstRetry.data.extractionResult.confidence)
}

// 두 번째 재시도 (레벨 2)
if (!firstRetry.success) {
  const secondRetry = await retryExtraction('record-id', { retryCount: 1 })
  // ...
}
```

#### TanStack Query와 함께 사용

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useRetryExtraction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, retryCount }: { id: string; retryCount: number }) =>
      retryExtraction(id, { retryCount }),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success(`추출 재시도 성공 (레벨 ${data.data.enhancedLevel})`)
        // 추출 상세 정보 갱신
        queryClient.invalidateQueries({
          queryKey: ['inbody-extraction', variables.id]
        })
        // 기록 목록 갱신
        queryClient.invalidateQueries({
          queryKey: ['inbody-history']
        })
      } else {
        toast.error(`재시도 실패: ${data.error}`)
      }
    },
    onError: (error) => {
      toast.error('재시도 중 오류 발생')
    }
  })
}

// 컴포넌트에서 사용
function RetryButton({ recordId, currentRetryCount }: {
  recordId: string
  currentRetryCount: number
}) {
  const retryMutation = useRetryExtraction()

  const handleRetry = () => {
    if (currentRetryCount >= 3) {
      toast.error('최대 재시도 횟수를 초과했습니다')
      return
    }

    retryMutation.mutate({
      id: recordId,
      retryCount: currentRetryCount
    })
  }

  return (
    <button
      onClick={handleRetry}
      disabled={retryMutation.isPending || currentRetryCount >= 3}
    >
      {retryMutation.isPending
        ? '재시도 중...'
        : `재시도 (${currentRetryCount}/3)`
      }
    </button>
  )
}
```

#### 재시도 로직

시스템은 최대 3회까지 재시도를 지원합니다. 각 재시도마다 전처리 강도가 높아집니다:

- **레벨 1** (첫 번째 재시도): 기본 전처리 + 대비 강화
- **레벨 2** (두 번째 재시도): 레벨 1 + 노이즈 제거 강화
- **레벨 3** (세 번째 재시도): 레벨 2 + 이진화 적용

```typescript
// 재시도 로직 예시
async function handleExtractionFailure(recordId: string) {
  let retryCount = 0
  const maxRetries = 3

  while (retryCount < maxRetries) {
    const result = await retryExtraction(recordId, { retryCount })

    if (result.success) {
      console.log('재시도 성공!')
      return result.data
    }

    retryCount++
  }

  console.error('최대 재시도 횟수 초과')
  // 사용자에게 수동 입력 요청
}
```

## 오류 처리

### OCR 추출 오류

OCR 추출 실패 시 상세한 오류 정보를 제공합니다.

```typescript
type ExtractionError = {
  category: 'OCR_FAILED' | 'EXTRACTION_FAILED' | 'VALIDATION_FAILED' | 'QUALITY_POOR' | 'UNKNOWN'
  message: string
  attempts: Array<{
    patternId: string
    patternName: string
    confidence: number
  }>
  confidence?: number
  qualityScore?: number
  canRetry: boolean
  suggestedSolution?: string
}
```

### 오류 카테고리별 대응

| 카테고리 | 설명 | 재시도 가능 | 해결 방법 |
|---------|------|-----------|-----------|
| OCR_FAILED | OCR 처리 자체 실패 | 예 | 이미지를 다시 촬영해주세요 |
| EXTRACTION_FAILED | 패턴 매칭 실패 | 예 | 이미지 품질을 확인하고 다시 시도해주세요 |
| VALIDATION_FAILED | 데이터 검증 실패 | 아니오 | 수동으로 입력해주세요 |
| QUALITY_POOR | 낮은 신뢰도 | 예 | 더 밝은 조명에서 다시 촬영해주세요 |
| UNKNOWN | 알 수 없는 오류 | 아니오 | 고객 지원에 문의해주세요 |

### 오류 처리 예시

```typescript
const result = await fetchExtractionDetail(recordId)

if (!result.success) {
  // 오류 카테고리에 따른 대응
  switch (result.errorCategory) {
    case 'OCR_FAILED':
    case 'EXTRACTION_FAILED':
    case 'QUALITY_POOR':
      // 재시도 버튼 표시
      showRetryButton()
      break
    case 'VALIDATION_FAILED':
      // 수동 입력 폼 표시
      showManualInputForm()
      break
    default:
      // 일반 오류 메시지
      showErrorMessage(result.error)
  }

  // 제안된 해결책 표시
  if (result.suggestedSolution) {
    showSolution(result.suggestedSolution)
  }
}
```

---

## OCR 추출 시스템 개요

### 정확도 향상 (70% → 95%)

SPEC-OCR-001을 통해 다음과 같은 개선이 이루어졌습니다:

1. **이미지 전처리**: 5가지 전처리 기능 (그레이스케일, 대비, 노이즈, 이진화, 회전 보정)
2. **패턴 라이브러리**: 16개 정규식 패턴으로 다양한 InBody 기기 형식 지원
3. **다단계 추출**: 3단계 추출 전략으로 정확도 향상
4. **품질 평가**: 이미지 품질 점수 계산 (0-100)
5. **에러 복구**: 자동 재시도 및 사용자 가이드 제공

### 지원하는 InBody 형식

- **InBody 770** (3개 패턴): 표준 형식, 점수/만점 형식, Body Score 영문
- **InBody 970** (3개 패턴): 신체점수, 총점, 점수 라벨 형식
- **InBody 720** (2개 패턴): 신체평가 점수, 평가점 형식
- **OntoFit** (2개 패턴): 신체 점수, 바디스코어 형식
- **Generic** (6개 패턴): 일반 점수, Score 영문, 숫자+점 등 다양한 폴백 패턴

### 관련 SPEC

- [SPEC-OCR-001: InBody 신체점수 추출 정확도 개선 시스템](../../.moai/specs/SPEC-OCR-001/spec.md)
