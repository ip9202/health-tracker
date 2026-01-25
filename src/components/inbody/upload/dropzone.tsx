/**
 * TAG-FE-003-DROP-001: Dropzone 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 이미지 업로드를 위한 드래그 앤 드롭 영역
 */

'use client'

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = ['.jpg', '.jpeg', '.png']

interface DropzoneProps {
  onFileSelect: (file: File) => void
}

export function Dropzone({ onFileSelect }: DropzoneProps) {
  const [error, setError] = React.useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], _rejectedFiles: any[]) => {
      setError(null)

      // 파일 크기 검증
      const oversizedFile = acceptedFiles.find((file) => file.size > MAX_FILE_SIZE)
      if (oversizedFile) {
        setError('파일 크기는 10MB 이하여야 합니다.')
        return
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ACCEPTED_FILE_TYPES,
      'image/png': ['.png'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-sm text-foreground">파일을 놓아주세요...</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            파일을 선택하거나 드래그하세요
            <br />
            <span className="text-xs">(JPG, PNG, 최대 10MB)</span>
          </p>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
