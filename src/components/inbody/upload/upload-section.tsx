/**
 * TAG-FE-003-SECT-001: UploadSection 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 이미지 업로드 섹션 (Figma 디자인 적용)
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Upload } from 'lucide-react'
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
      setMessage(data.data ? 'Data extracted successfully.' : 'Upload complete!')
    },
    onError: (err) => {
      setUploadStatus('error')
      setError(err.message || 'Upload failed.')
      setMessage('Upload failed')
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

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

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
  }, [uploadMutation])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'image/jpeg' || droppedFile.type === 'image/png')) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleReset = useCallback(() => {
    setInternalFile(null)
    setUploadStatus('idle')
    setProgress(0)
    setMessage(undefined)
    setError(undefined)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* 카드 헤더 */}
      <div className="flex flex-col gap-[6px]">
        <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.44px] text-[#101828] font-['Inter',sans-serif]">
          Image Upload
        </h3>
        <p className="text-[16px] font-normal leading-6 tracking-[-0.31px] text-[#717182] font-['Inter',sans-serif]">
          Upload your InBody result sheet to extract data.
        </p>
      </div>

      {/* 업로드 영역 */}
      {status === 'idle' && !file && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="bg-[#f9fafb] border-2 border-[#d1d5dc] border-dashed rounded-[14px] h-48 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#155dfc] hover:bg-[#eff6ff] transition-colors"
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/jpeg,image/png'
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement
              if (target.files?.[0]) {
                handleFileSelect(target.files[0])
              }
            }
            input.click()
          }}
        >
          {/* 아이콘 */}
          <div className="bg-[#dbeafe] rounded-full size-12 flex items-center justify-center">
            <Upload className="size-6 text-[#155dfc]" strokeWidth={2} />
          </div>

          {/* 텍스트 */}
          <div className="flex items-center gap-1 h-5">
            <span className="text-[14px] font-medium leading-5 tracking-[-0.15px] text-[#155dfc]">
              Click to upload
            </span>
            <span className="text-[14px] font-medium leading-5 tracking-[-0.15px] text-[#101828]">
              or drag and drop
            </span>
          </div>

          <p className="text-[12px] font-normal leading-4 text-[#6a7282]">
            JPG or PNG (max. 10MB)
          </p>
        </div>
      )}

      {/* 업로드 상태 */}
      {(status === 'uploading' || status === 'processing' || status === 'success' || status === 'error') && (
        <div className="bg-[#f9fafb] border-2 border-[#d1d5dc] rounded-[14px] h-48 flex flex-col items-center justify-center gap-4">
          {status === 'uploading' && (
            <>
              <div className="w-full max-w-[300px]">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#155dfc] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-[14px] font-medium text-[#6a7282]">
                Uploading... {progress}%
              </p>
            </>
          )}

          {status === 'processing' && (
            <>
              <div className="size-8 border-4 border-[#155dfc] border-t-transparent rounded-full animate-spin" />
              <p className="text-[14px] font-medium text-[#6a7282]">
                Processing image...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-[#ecfdf5] rounded-full size-12 flex items-center justify-center">
                <svg className="size-6 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-[#10b981]">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-[#fef2f2] rounded-full size-12 flex items-center justify-center">
                <svg className="size-6 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-[#ef4444]">
                {error || message}
              </p>
            </>
          )}
        </div>
      )}

      {status === 'success' && (
        <button
          onClick={handleReset}
          className="text-sm text-[#155dfc] hover:underline font-medium"
        >
          Upload another file
        </button>
      )}
    </div>
  )
}
