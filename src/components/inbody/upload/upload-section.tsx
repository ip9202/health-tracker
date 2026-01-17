/**
 * TAG-FE-003-SECT-001: UploadSection 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 이미지 업로드 섹션 (클라이언트 OCR 방식)
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Upload } from 'lucide-react'
import type { UploadStatus } from '@/lib/types/inbody'
import { extractTextFromImageClient, type ClientOCRResult } from '@/lib/client-ocr'

interface UploadSectionProps {
  uploadingFile?: File
  uploadStatus?: UploadStatus
  onUploadSuccess?: () => void // 업로드 성공 시 호출될 콜백
}

export function UploadSection({ uploadingFile: externalFile, uploadStatus: externalStatus, onUploadSuccess }: UploadSectionProps = {}) {
  const [internalFile, setInternalFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [ocrStatus, setOcrStatus] = useState<string>('')
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  const file = externalFile || internalFile
  const status = externalStatus || uploadStatus

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setInternalFile(selectedFile)
    setUploadStatus('uploading')
    setProgress(0)
    setOcrStatus('OCR 준비 중...')
    setMessage(undefined)
    setError(undefined)

    try {
      console.log('[OCR Upload] 이미지 OCR 시작:', selectedFile.name)
      setProgress(10)
      setOcrStatus('이미지 전처리 중...')

      // 클라이언트 OCR 실행
      const ocrResult: ClientOCRResult = await extractTextFromImageClient(selectedFile, {
        language: 'kor+eng',
        preprocess: false, // 전처리 끔 (텍스트 손상 방지)
        onProgress: (progress) => {
          const progressPercent = Math.round(progress.progress * 100)
          setProgress(10 + progressPercent * 0.7) // 10-80%
          setOcrStatus(`OCR 진행 중... ${progressPercent}%`)
        },
      })

      console.log('[OCR Upload] OCR 완료, 신뢰도:', ocrResult.confidence)
      setProgress(85)
      setOcrStatus('데이터 추출 중...')

      // OCR 텍스트를 서버로 전송
      const response = await fetch('/api/inbody/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrText: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '데이터 추출 실패')
      }

      const data = await response.json()

      // 성공
      setProgress(100)
      setUploadStatus('success')
      setMessage(`OCR 완료! (신뢰도: ${ocrResult.confidence.toFixed(1)}%) 데이터가 저장되었습니다.`)
      console.log('[OCR Upload] 성공:', data)

      // 대시보드 데이터 갱신 콜백 호출
      if (onUploadSuccess) {
        onUploadSuccess()
      }

    } catch (err) {
      console.error('[OCR Upload] 실패:', err)
      setUploadStatus('error')
      setError(err instanceof Error ? err.message : 'OCR 처리 실패')
    }
  }, [])

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
          Upload your InBody result sheet for AI analysis.
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
                {ocrStatus || `처리 중... ${progress}%`}
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
