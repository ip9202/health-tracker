/**
 * TAG-FE-003-SECT-001: UploadSection 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 이미지 업로드 섹션 (상태 머신 포함)
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Dropzone } from './dropzone'
import { UploadProgress } from './upload-progress'
import { useInBodyUpload } from '@/lib/hooks/use-inbody'
import type { UploadStatus } from '@/lib/types/inbody'

interface UploadSectionProps {
  uploadingFile?: File
  uploadStatus?: UploadStatus
}

export function UploadSection({ uploadingFile: externalFile, uploadStatus: externalStatus }: UploadSectionProps = {}) {
  const [internalFile, setInternalFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  const uploadMutation = useInBodyUpload({
    onSuccess: (data) => {
      setUploadStatus('success')
      setProgress(100)
      setMessage(data.data ? '데이터가 성공적으로 추출되었습니다.' : '업로드 완료!')
    },
    onError: (err) => {
      setUploadStatus('error')
      setError(err.message || '업로드 중 오류가 발생했습니다.')
      setMessage('업로드 실패')
    },
  })

  const file = externalFile || internalFile
  const status = externalStatus || uploadStatus

  const handleFileSelect = useCallback((selectedFile: File) => {
    setInternalFile(selectedFile)
    setUploadStatus('uploading')
    setProgress(0)
    setMessage(undefined)
    setError(undefined)

    // 업로드 진행 상태 시뮬레이션
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // 실제 업로드
    uploadMutation.mutate(selectedFile, {
      onSuccess: () => {
        clearInterval(progressInterval)
        setProgress(100)
        setUploadStatus('processing')
        setTimeout(() => {
          setUploadStatus('success')
        }, 1000)
      },
      onError: () => {
        clearInterval(progressInterval)
        setUploadStatus('error')
      },
    })
  }, [])

  const handleReset = useCallback(() => {
    setInternalFile(null)
    setUploadStatus('idle')
    setProgress(0)
    setMessage(undefined)
    setError(undefined)
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">이미지 업로드</h3>
        <p className="text-sm text-muted-foreground mb-4">
          InBody 측정 결과 이미지를 업로드하여 데이터를 자동으로 추출합니다.
        </p>
      </div>

      {status === 'idle' && !file && (
        <Dropzone onFileSelect={handleFileSelect} />
      )}

      {(status === 'uploading' || status === 'processing' || status === 'success' || status === 'error') && (
        <UploadProgress
          status={status}
          progress={progress}
          message={message}
          error={error}
        />
      )}

      {status === 'success' && (
        <button
          onClick={handleReset}
          className="text-sm text-primary hover:underline"
        >
          다른 파일 업로드
        </button>
      )}
    </div>
  )
}
