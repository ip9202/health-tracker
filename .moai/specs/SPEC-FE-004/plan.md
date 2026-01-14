---
spec_id: SPEC-FE-004
title: InBody 데이터 관리 대시보드 구현 계획
domain: frontend
status: pending
version: 1.0.0
created_at: 2026-01-14
updated_at: 2026-01-14
---

# SPEC-FE-004: 구현 계획

## 1. 아키텍처 개요

### 1.1 컴포넌트 구조

```
src/app/
  dashboard/
    page.tsx                    # 메인 대시보드 페이지
    layout.tsx                  # 대시보드 레이아웃

src/components/
  inbody/
    upload-section.tsx          # 이미지 업로드 섹션
    dropzone.tsx                # 드래그 앤 드롭 영역
    upload-progress.tsx         # 업로드 진행률 표시

  charts/
    weight-chart.tsx            # 체중 변화 차트
    body-composition-chart.tsx  # 체성분 변화 차트
    score-chart.tsx             # 신체 점수 차트
    chart-container.tsx         # 차트 컨테이너 (탭/필터)

  history/
    history-list.tsx            # 기록 리스트 컴포넌트
    history-item.tsx            # 단일 기록 아이템
    history-filters.tsx         # 필터 컴포넌트
    pagination.tsx              # 페이지네이션

  detail/
    record-detail-modal.tsx     # 상세 보기 모달
    data-grid.tsx               # 데이터 그리드 표시

src/lib/
  api/
    inbody.ts                   # InBody API 클라이언트
  hooks/
    use-inbody-upload.ts        # 업로드 훅
    use-inbody-history.ts       # 기록 조회 훅
    use-inbody-mutation.ts      # 삭제 등 뮤테이션 훅
  queries/
    inbody-queries.ts           # TanStack Query 정의
```

### 1.2 라우팅 구조

- `/dashboard` - 메인 대시보드
- `/dashboard/upload` - 업로드 전용 페이지 (선택사항)

---

## 2. 구현 단계

### 단계 1: 기본 설정 (TASK-FE-001)

**작업 항목:**
1. 필수 의존성 설치
2. shadcn/ui 컴포넌트 설정
3. 기본 레이아웃 구조 생성

**상세 작업:**
```bash
# 의존성 설치
npm install recharts react-dropzone @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add button card progress tabs dialog
npx shadcn@latest add select date-picker calendar badge
npx shadcn@latest add skeleton alert tooltip
```

**산출물:**
- `src/app/dashboard/page.tsx` - 빈 대시보드 페이지
- `src/app/dashboard/layout.tsx` - 레이아웃 구조
- `src/components/inbody/` - 디렉토리 구조

---

### 단계 2: API 클라이언트 구현 (TASK-FE-002)

**작업 항목:**
1. TanStack Query 프로바이더 설정
2. API 클라이언트 함수 구현
3. 커스텀 훅 구현

**상세 작업:**

**파일: `src/lib/api/inbody.ts`**
```typescript
import { InBodyData } from '@/lib/inbody';

export interface UploadResponse {
  success: boolean;
  data: {
    extractedData: InBodyData;
    ocrConfidence: number;
    recordId: string;
  };
  error?: string;
}

export interface HistoryResponse {
  success: boolean;
  data: {
    records: InBodyRecord[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export async function uploadInBodyImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/inbody/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}

export async function fetchInBodyHistory(params: {
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<HistoryResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.startDate) searchParams.set('startDate', params.startDate.toISOString());
  if (params.endDate) searchParams.set('endDate', params.endDate.toISOString());

  const response = await fetch(`/api/inbody/history?${searchParams}`);

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json();
}

export async function deleteInBodyRecord(id: string): Promise<void> {
  const response = await fetch(`/api/inbody/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete record');
  }
}
```

**파일: `src/lib/queries/inbody-queries.ts`**
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadInBodyImage, fetchInBodyHistory, deleteInBodyRecord } from '@/lib/api/inbody';
import { InBodyData } from '@/lib/inbody';

export function useInBodyHistory(params: {
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery({
    queryKey: ['inbody', 'history', params],
    queryFn: () => fetchInBodyHistory(params),
  });
}

export function useInBodyUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadInBodyImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbody', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['inbody', 'charts'] });
    },
  });
}

export function useDeleteInBody() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInBodyRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbody', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['inbody', 'charts'] });
    },
  });
}
```

**산출물:**
- `src/lib/api/inbody.ts`
- `src/lib/queries/inbody-queries.ts`
- TanStack Query 프로바이더 설정

---

### 단계 3: 업로드 섹션 구현 (TASK-FE-003)

**작업 항목:**
1. 드래그 앤 드롭 영역 구현
2. 파일 검증 로직
3. 업로드 진행률 표시
4. OCR 처리 상태 표시

**상세 작업:**

**파일: `src/components/inbody/dropzone.tsx`**
```typescript
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFileSelect, disabled }: DropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
          : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      {isDragActive ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          이미지를 여기에 놓아주세요...
        </p>
      ) : (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            JPG 또는 PNG 이미지를 드래그하거나 클릭하여 선택
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            최대 파일 크기: 10MB
          </p>
        </div>
      )}
    </div>
  );
}
```

**파일: `src/components/inbody/upload-section.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { Dropzone } from './dropzone';
import { UploadProgress } from './upload-progress';
import { useInBodyUpload } from '@/lib/queries/inbody-queries';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UploadSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const uploadMutation = useInBodyUpload();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadProgress(0);
    setOcrStatus('idle');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setOcrStatus('processing');

    try {
      await uploadMutation.mutateAsync(selectedFile);
      setOcrStatus('success');
      setUploadProgress(100);
    } catch (error) {
      setOcrStatus('error');
      console.error('Upload failed:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>이미지 업로드</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dropzone
          onFileSelect={handleFileSelect}
          disabled={ocrStatus === 'processing'}
        />

        {selectedFile && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              선택된 파일: {selectedFile.name}
            </p>
            <Button
              onClick={handleUpload}
              disabled={ocrStatus === 'processing'}
              className="w-full"
            >
              {ocrStatus === 'processing' ? '처리 중...' : '업로드'}
            </Button>
          </div>
        )}

        {ocrStatus === 'processing' && (
          <UploadProgress progress={uploadProgress} status="OCR 처리 중..." />
        )}

        {ocrStatus === 'success' && uploadMutation.data && (
          <Alert variant="default">
            <AlertDescription>
              업로드 성공! 체중: {uploadMutation.data.data.extractedData.weight}kg
            </AlertDescription>
          </Alert>
        )}

        {ocrStatus === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              업로드 실패. 다시 시도해주세요.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

**산출물:**
- `src/components/inbody/dropzone.tsx`
- `src/components/inbody/upload-section.tsx`
- `src/components/inbody/upload-progress.tsx`

---

### 단계 4: 차트 구현 (TASK-FE-004)

**작업 항목:**
1. 체중 변화 차트
2. 체성분 변화 차트
3. 신체 점수 차트
4. 차트 컨테이너 (탭, 필터)

**상세 작업:**

**파일: `src/components/charts/weight-chart.tsx`**
```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightChartProps {
  data: Array<{
    date: string;
    weight: number;
  }>;
}

export function WeightChart({ data }: WeightChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: '체중 (kg)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**파일: `src/components/charts/body-composition-chart.tsx`**
```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BodyCompositionChartProps {
  data: Array<{
    date: string;
    bodyFatPercentage?: number;
    muscle?: number;
    skeletalMuscle?: number;
  }>;
}

export function BodyCompositionChart({ data }: BodyCompositionChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: '값', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="bodyFatPercentage" name="체지방율 (%)" stroke="#ef4444" strokeWidth={2} />
        <Line type="monotone" dataKey="muscle" name="근육량 (kg)" stroke="#22c55e" strokeWidth={2} />
        <Line type="monotone" dataKey="skeletalMuscle" name="골격근량 (kg)" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**파일: `src/components/charts/chart-container.tsx`**
```typescript
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeightChart } from './weight-chart';
import { BodyCompositionChart } from './body-composition-chart';
import { ScoreChart } from './score-chart';
import { useInBodyHistory } from '@/lib/queries/inbody-queries';

export function ChartContainer() {
  const { data, isLoading, error } = useInBodyHistory({ pageSize: 100 });

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center">로딩 중...</div>;
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center text-red-500">에러 발생</div>;
  }

  const records = data?.data.records || [];

  return (
    <Tabs defaultValue="weight" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="weight">체중</TabsTrigger>
        <TabsTrigger value="composition">체성분</TabsTrigger>
        <TabsTrigger value="score">신체 점수</TabsTrigger>
        <TabsTrigger value="bmi">BMI</TabsTrigger>
      </TabsList>

      <TabsContent value="weight">
        <WeightChart data={records} />
      </TabsContent>

      <TabsContent value="composition">
        <BodyCompositionChart data={records} />
      </TabsContent>

      <TabsContent value="score">
        <ScoreChart data={records} />
      </TabsContent>

      <TabsContent value="bmi">
        {/* BMI 차트 구현 */}
      </TabsContent>
    </Tabs>
  );
}
```

**산출물:**
- `src/components/charts/weight-chart.tsx`
- `src/components/charts/body-composition-chart.tsx`
- `src/components/charts/score-chart.tsx`
- `src/components/charts/chart-container.tsx`

---

### 단계 5: 기록 리스트 구현 (TASK-FE-005)

**작업 항목:**
1. 기록 리스트 컴포넌트
2. 페이지네이션
3. 필터링
4. 상세 보기 모달

**상세 작업:**

**파일: `src/components/history/history-list.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useInBodyHistory } from '@/lib/queries/inbody-queries';
import { HistoryItem } from './history-item';
import { Pagination } from './pagination';
import { HistoryFilters } from './history-filters';

export function HistoryList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const { data, isLoading, error } = useInBodyHistory({
    page,
    pageSize: 10,
    ...filters,
  });

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>에러 발생</div>;
  }

  const records = data?.data.records || [];
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-4">
      <HistoryFilters filters={filters} onChange={setFilters} />

      {records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          아직 측정 기록이 없습니다.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {records.map((record) => (
              <HistoryItem key={record.id} record={record} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
```

**산출물:**
- `src/components/history/history-list.tsx`
- `src/components/history/history-item.tsx`
- `src/components/history/pagination.tsx`
- `src/components/history/history-filters.tsx`

---

## 3. 테스트 전략

### 3.1 단위 테스트
- 컴포넌트 렌더링 테스트
- 훅 동작 테스트
- 유틸리티 함수 테스트

### 3.2 통합 테스트
- API 연동 테스트
- 사용자 시나리오 테스트

### 3.3 E2E 테스트
- Playwright를 사용한 전체 플로우 테스트

---

## 4. 배포 계획

### 4.1 환경 변수
```env
NEXT_PUBLIC_API_URL=/api
```

### 4.2 빌드 설정
- 이미지 최적화
- 코드 분할
- 트리 쉐이킹

---

## 5. 롤백 계획

이전 버전으로 복귀하기 위한 절차:
1. Git revert를 사용하여 커밋 되돌리기
2. 데이터베이스 마이그레이션 롤백 (필요 시)
3. CDN 캐시 무효화
