/**
 * TAG-FE-003-PROG-001: UploadProgress 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 이미지 업로드 진행 상태 표시
 */

'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Alert } from '@/components/ui/alert'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import type { UploadStatus } from '@/lib/types/inbody'

interface UploadProgressProps {
  status: UploadStatus
  progress: number
  message?: string
  error?: string
}

export function UploadProgress({ status, progress, message, error }: UploadProgressProps) {
  return (
    <div className="space-y-4">
      {/* 진행 상태 표시 */}
      {status === 'uploading' || status === 'processing' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {status === 'uploading' ? '업로드 중...' : 'OCR 처리 중...'}
            </span>
            <span className="text-foreground font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ) : null}

      {/* 메시지 표시 */}
      {message && status === 'success' && (
        <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <div className="text-sm text-green-800 dark:text-green-200">
            {message}
          </div>
        </Alert>
      )}

      {error && status === 'error' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <div className="space-y-1">
            <div className="text-sm font-medium">{message || '업로드 실패'}</div>
            <div className="text-xs">{error}</div>
          </div>
        </Alert>
      )}

      {/* 로딩 스피너 */}
      {status === 'uploading' || status === 'processing' ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : null}
    </div>
  )
}
