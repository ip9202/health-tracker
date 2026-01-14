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
  deleteInBodyRecord
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
