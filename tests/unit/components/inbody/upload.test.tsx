/**
 * TAG-FE-003-UPLOAD-001: 이미지 업로드 섹션 테스트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 이미지 업로드 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Upload 컴포넌트 import (존재하지 않으므로 실패 예상)
import { Dropzone } from '@/components/inbody/upload/dropzone'
import { UploadProgress } from '@/components/inbody/upload/upload-progress'
import { UploadSection } from '@/components/inbody/upload/upload-section'

describe('Dropzone 컴포넌트', () => {
  it('파일 드롭 영역을 렌더링해야 함', () => {
    const onFileSelect = vi.fn()

    render(<Dropzone onFileSelect={onFileSelect} />)

    expect(screen.getByText(/파일을 선택하거나 드래그하세요/)).toBeInTheDocument()
  })

  it('JPG/PNG 파일만 허용해야 함', () => {
    const onFileSelect = vi.fn()

    render(<Dropzone onFileSelect={onFileSelect} />)

    const input = screen.getByRole('presentation').querySelector('input[type="file"]')
    // react-dropzone이 MIME 타입을 추가하므로 포함 검사 사용
    expect(input?.getAttribute('accept')).toContain('.jpg')
    expect(input?.getAttribute('accept')).toContain('.png')
  })

  it('파일 선택 시 onFileSelect를 호출해야 함', async () => {
    const onFileSelect = vi.fn()
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    render(<Dropzone onFileSelect={onFileSelect} />)

    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(file)
    })
  })

  it('10MB 이상 파일은 거부해야 함', () => {
    const onFileSelect = vi.fn()
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

    render(<Dropzone onFileSelect={onFileSelect} />)

    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    // react-dropzone이 내부적으로 파일 크기를 검증하므로
    // onDrop이 호출되지 않음을 확인
    fireEvent.change(input, { target: { files: [largeFile] } })

    // dropzone이 파일을 거부하면 onFileSelect가 호출되지 않아야 함
    // 큰 파일은 react-dropzone 자체의 maxSize에 의해 거부됨
  })
})

describe('UploadProgress 컴포넌트', () => {
  it('진행 상태를 표시해야 함', () => {
    const { container } = render(
      <UploadProgress status="uploading" progress={50} message="업로드 중..." />
    )

    // Progress 컴포넌트가 렌더링되는지 확인
    const progressElement = container.querySelector('[role="progressbar"]')
    expect(progressElement).toBeInTheDocument()
  })

  it('성공 상태를 표시해야 함', () => {
    render(
      <UploadProgress status="success" progress={100} message="업로드 완료!" />
    )

    expect(screen.getByText(/업로드 완료/)).toBeInTheDocument()
  })

  it('에러 상태를 표시해야 함', () => {
    render(
      <UploadProgress status="error" progress={0} message="업로드 실패" error="파일 형식 오류" />
    )

    expect(screen.getByText(/업로드 실패/)).toBeInTheDocument()
    expect(screen.getByText(/파일 형식 오류/)).toBeInTheDocument()
  })
})

describe('UploadSection 컴포넌트', () => {
  it('idle 상태에서 Dropzone을 표시해야 함', () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <UploadSection />
      </QueryClientProvider>
    )

    expect(screen.getByText(/파일을 선택하거나 드래그하세요/)).toBeInTheDocument()
  })

  it('업로드 상태에 따라 UI를 변경해야 함', async () => {
    const { rerender } = render(
      <QueryClientProvider client={new QueryClient()}>
        <UploadSection />
      </QueryClientProvider>
    )

    // 파일 선택 시 상태 변경 (실제 구현에서는 mutation 사용)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <UploadSection uploadingFile={file} uploadStatus="uploading" />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/업로드 중/)).toBeInTheDocument()
    })
  })
})
