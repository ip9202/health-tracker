/**
 * TAG-FE-003-SECT-001: UploadSection 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 이미지 업로드 섹션 (Google Vision API / Tesseract.js 선택 가능)
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Upload } from 'lucide-react'
import type { UploadStatus } from '@/lib/types/inbody'
import { extractTextFromImageClient, type ClientOCRResult, getStatusMessage } from '@/lib/client-ocr'
import { parseInBodyData, type ParseResult } from '@/lib/parser-service'
import type { InBodyRecord } from '@/lib/types/inbody'
import { InBodyResultsChartSimple } from '@/components/InBodyResultsChart'

type OCREngine = 'client-tesseract' | 'server-google-vision'

interface UploadSectionProps {
  uploadingFile?: File
  uploadStatus?: UploadStatus
  onUploadSuccess?: () => void // 업로드 성공 시 호출될 콜백
  onParseResult?: (result: ParseResult & { ocrEngine: string; ocrConfidence: number }) => void // 파싱 결과 콜백
}

export function UploadSection({ uploadingFile: externalFile, uploadStatus: externalStatus, onUploadSuccess, onParseResult }: UploadSectionProps = {}) {
  const [internalFile, setInternalFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [ocrStatus, setOcrStatus] = useState<string>('')
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  // OCR 엔진 선택
  const [ocrEngine, setOcrEngine] = useState<OCREngine>('server-google-vision')

  // 파싱 결과 상태
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [ocrResult, setOcrResult] = useState<{ text: string; confidence: number; engine: string } | null>(null)

  const file = externalFile || internalFile
  const status = externalStatus || uploadStatus

  // 서버 측 OCR API 호출 (Google Vision API)
  const callServerOCR = async (file: File): Promise<{ text: string; confidence: number; engine: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }))
      throw new Error(errorData.error || 'OCR API 호출 실패')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'OCR 처리 실패')
    }

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      engine: result.data.engine,
    }
  }

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setInternalFile(selectedFile)
    setUploadStatus('uploading')
    setProgress(0)
    setOcrStatus('OCR 준비 중...')
    setMessage(undefined)
    setError(undefined)
    setParseResult(null)
    setOcrResult(null)

    try {
      console.log('[OCR Upload] 이미지 OCR 시작:', selectedFile.name, '엔진:', ocrEngine)
      let result: { text: string; confidence: number; engine: string }

      if (ocrEngine === 'client-tesseract') {
        // 클라이언트 측 Tesseract.js OCR
        setProgress(10)
        setOcrStatus('Tesseract.js 초기화 중...')

        const tesseractResult: ClientOCRResult = await extractTextFromImageClient(selectedFile, {
          language: 'kor+eng',
          preprocess: false,
          onProgress: (p) => {
            const progressPercent = Math.round(p.progress * 100)
            setProgress(10 + progressPercent * 0.7)
            setOcrStatus(getStatusMessage(p.status))
          },
        })

        result = {
          text: tesseractResult.text,
          confidence: tesseractResult.confidence,
          engine: 'tesseract.js',
        }
      } else {
        // 서버 측 Google Vision API OCR
        setProgress(10)
        setOcrStatus('Google Vision API 호출 중...')
        result = await callServerOCR(selectedFile)
        setProgress(80)
      }

      console.log('[OCR Upload] OCR 완료, 신뢰도:', result.confidence)
      setOcrResult(result)
      setProgress(85)
      setOcrStatus('데이터 파싱 중...')

      // InBody 데이터 파싱
      const parsed = parseInBodyData(result.text)
      setParseResult(parsed)

      // 파싱 결과를 부모 컴포넌트로 전달
      if (onParseResult) {
        onParseResult({ ...parsed, ocrEngine: result.engine, ocrConfidence: result.confidence })
      }

      // OCR 텍스트를 서버로 전송하여 저장
      const response = await fetch('/api/inbody/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrText: result.text,
          ocrConfidence: result.confidence,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '데이터 저장 실패')
      }

      const data = await response.json()

      // 성공
      setProgress(100)
      setUploadStatus('success')
      setMessage(`OCR 완료! (${ocrEngine === 'server-google-vision' ? 'Google Vision API' : 'Tesseract.js'}, 신뢰도: ${result.confidence.toFixed(2)}%)`)
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
  }, [ocrEngine, onUploadSuccess, onParseResult])

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

  // 데이터 테이블 포맷 함수
  const formatDataTables = (): Array<{ category: string; rows: Array<{ key: string; value: string | number | undefined }> }> => {
    if (!parseResult) return []

    const { data, warnings } = parseResult
    const tables: Array<{ category: string; rows: Array<{ key: string; value: string | number | undefined }> }> = []

    // 1. 개인정보
    const personalInfo: Array<{ key: string; value: string | number | undefined }> = []
    if (data.name) personalInfo.push({ key: '이름', value: data.name })
    if (data.gender) personalInfo.push({ key: '성별', value: data.gender === 'male' ? '남성' : '여성' })
    if (data.age) personalInfo.push({ key: '나이', value: `${data.age}세` })
    if (data.height) personalInfo.push({ key: '신장', value: `${data.height}cm` })
    if (personalInfo.length > 0) {
      tables.push({ category: '개인정보', rows: personalInfo })
    }

    // 2. 체성분 데이터
    const bodyComposition: Array<{ key: string; value: string | number | undefined }> = []
    if (data.weight) bodyComposition.push({ key: '체중', value: `${data.weight}kg` })
    if (data.bodyFat) bodyComposition.push({ key: '체지방량', value: `${data.bodyFat}kg` })
    if (data.bodyFatPercentage) bodyComposition.push({ key: '체지방률', value: `${data.bodyFatPercentage}%` })
    if (data.muscle) bodyComposition.push({ key: '근육량', value: `${data.muscle}kg` })
    if (data.skeletalMuscle) bodyComposition.push({ key: '골격근량', value: `${data.skeletalMuscle}kg` })
    if (data.protein) bodyComposition.push({ key: '단백질', value: `${data.protein}kg` })
    if (data.bodyWater) bodyComposition.push({ key: '체수분', value: `${data.bodyWater}kg` })
    if (bodyComposition.length > 0) {
      tables.push({ category: '체성분 데이터', rows: bodyComposition })
    }

    // 3. 신체 점수
    const bodyScore: Array<{ key: string; value: string | number | undefined }> = []
    if (data.bodyScore) bodyScore.push({ key: '신체 점수', value: `${data.bodyScore}점` })
    if (data.scoreDescription) bodyScore.push({ key: '점수 설명', value: data.scoreDescription })
    if (bodyScore.length > 0) {
      tables.push({ category: '신체 점수', rows: bodyScore })
    }

    // 4. 비만 판정
    const obesity: Array<{ key: string; value: string | number | undefined }> = []
    if (data.bmi) obesity.push({ key: 'BMI', value: data.bmi.toFixed(2) })
    if (data.bmiStatus) obesity.push({ key: '비만 판정', value: data.bmiStatus })
    if (data.weightControl) obesity.push({ key: '체중 조절', value: data.weightControl })
    if (obesity.length > 0) {
      tables.push({ category: '비만 판정', rows: obesity })
    }

    // 5. 경고 (있는 경우)
    if (warnings.length > 0) {
      const warningRows: Array<{ key: string; value: string | number | undefined }> = warnings.map(w => ({
        key: w.field,
        value: w.message
      }))
      tables.push({ category: '추출 경고', rows: warningRows })
    }

    return tables
  }

  const dataTables = formatDataTables()

  // ParseResult를 InBodyRecord로 변환 (차트용)
  const inBodyRecord: InBodyRecord | null = parseResult ? {
    id: 'temp',
    userId: 'temp',
    measuredAt: new Date(),
    name: parseResult.data.name,
    gender: parseResult.data.gender,
    age: parseResult.data.age,
    height: parseResult.data.height,
    weight: parseResult.data.weight,
    bodyFat: parseResult.data.bodyFat,
    bodyFatPercentage: parseResult.data.bodyFatPercentage,
    muscle: parseResult.data.muscle,
    skeletalMuscle: parseResult.data.skeletalMuscle,
    protein: parseResult.data.protein,
    bodyWater: parseResult.data.bodyWater,
    bodyScore: parseResult.data.bodyScore,
    scoreDescription: parseResult.data.scoreDescription,
    bmi: parseResult.data.bmi,
    bmiStatus: parseResult.data.bmiStatus,
    weightControl: parseResult.data.weightControl,
    bodyType: parseResult.data.bodyType,
    calorieNeeds: parseResult.data.calorieNeeds,
    ocrConfidence: ocrResult?.confidence,
    createdAt: new Date(),
    updatedAt: new Date(),
  } : null

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

      {/* OCR 엔진 선택 */}
      {status === 'idle' && !file && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-[14px]">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm">OCR 엔진 선택</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ocrEngine"
                value="server-google-vision"
                checked={ocrEngine === 'server-google-vision'}
                onChange={() => setOcrEngine('server-google-vision')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                <span className="font-semibold text-green-700">Google Vision API</span> (서버) - 높은 정확도 ⭐⭐⭐
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ocrEngine"
                value="client-tesseract"
                checked={ocrEngine === 'client-tesseract'}
                onChange={() => setOcrEngine('client-tesseract')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                <span className="font-semibold text-yellow-700">Tesseract.js</span> (클라이언트) - 빠른 처리 ⚡
              </span>
            </label>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            💡 Google Vision API를 권장합니다. InBody 결과지 텍스트 추출 정확도가 훨씬 높습니다.
          </p>
        </div>
      )}

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

      {/* 추출된 데이터 테이블 */}
      {dataTables.length > 0 && status === 'success' && (
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-4">
          <h4 className="text-base font-semibold text-[#101828] mb-3">추출된 InBody 데이터</h4>

          {dataTables.map((table, tableIdx) => (
            <div key={tableIdx} className="mb-4 last:mb-0">
              <h5 className="text-sm font-medium text-[#101828] mb-2 flex items-center gap-2">
                <span className={`w-1 h-4 rounded ${table.category === '추출 경고' ? 'bg-yellow-500' : 'bg-blue-600'}`}></span>
                {table.category}
              </h5>
              <div className="overflow-x-auto border border-[#e5e7eb] rounded-lg">
                <table className="min-w-full">
                  <tbody>
                    {table.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-xs font-medium text-[#101828] border-b last:border-b-0 w-1/3">
                          {row.key}
                        </td>
                        <td className="px-3 py-2 text-xs text-[#6a7282] border-b last:border-b-0">
                          {row.value ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* OCR 결과 요약 */}
          {ocrResult && (
            <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
              <div className="flex flex-wrap gap-4 text-xs">
                <div>
                  <span className="text-[#6a7282]">엔진:</span>
                  <span className={`ml-1 font-medium ${ocrEngine === 'server-google-vision' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {ocrEngine === 'server-google-vision' ? 'Google Vision API' : 'Tesseract.js'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6a7282]">신뢰도:</span>
                  <span className={`ml-1 font-bold ${ocrResult.confidence >= 70 ? 'text-green-600' : ocrResult.confidence >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {ocrResult.confidence.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* InBody 시각화 차트 */}
      {inBodyRecord && status === 'success' && (
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-4">
          <InBodyResultsChartSimple data={inBodyRecord} />
        </div>
      )}
    </div>
  )
}
