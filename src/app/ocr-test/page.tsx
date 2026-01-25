'use client';

import { useState } from 'react';
import { extractTextFromImageClient, getStatusMessage } from '@/lib/client-ocr';
import { parseInBodyData, type ParseResult } from '@/lib/parser-service';
import { InBodyResultsChartSimple } from '@/components/InBodyResultsChart';
import type { InBodyRecord } from '@/lib/types/inbody';

interface DataTable {
  category: string;
  rows: Array<{ key: string; value: string | number | undefined }>;
}

interface PatternMatch {
  field: string;
  userInput: string;
  matchedText: string;
  pattern: string;
  confidence: number;
}

type OCREngine = 'client-tesseract' | 'server-google-vision';

export default function OCRTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ status: '', progress: 0 });
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [ocrResult, setOcrResult] = useState<{
    text: string;
    confidence: number;
    engine: string;
  } | null>(null);
  const [error, setError] = useState<string>('');

  // OCR 엔진 선택
  const [ocrEngine, setOcrEngine] = useState<OCREngine>('server-google-vision');

  // 파서 개선 관련 상태
  const [showParserImprove, setShowParserImprove] = useState(false);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [patternMatches, setPatternMatches] = useState<PatternMatch[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setParseResult(null);
      setOcrResult(null);
      setShowParserImprove(false);
      setUserInputs({});
      setPatternMatches([]);

      // 이미지 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const formatDataTables = (parseResult: ParseResult): DataTable[] => {
    const { data, warnings } = parseResult;
    const tables: DataTable[] = [];

    // 1. 개인정보
    const personalInfo: DataTable['rows'] = [];
    if (data.name) personalInfo.push({ key: '이름', value: data.name });
    if (data.gender) personalInfo.push({ key: '성별', value: data.gender === 'male' ? '남성' : '여성' });
    if (data.age) personalInfo.push({ key: '나이', value: `${data.age}세` });
    if (data.height) personalInfo.push({ key: '신장', value: `${data.height}cm` });
    if (personalInfo.length > 0) {
      tables.push({ category: '개인정보', rows: personalInfo });
    }

    // 2. 체성분 데이터
    const bodyComposition: DataTable['rows'] = [];
    if (data.weight) bodyComposition.push({ key: '체중', value: `${data.weight}kg` });
    if (data.bodyFat) bodyComposition.push({ key: '체지방량', value: `${data.bodyFat}kg` });
    if (data.bodyFatPercentage) bodyComposition.push({ key: '체지방률', value: `${data.bodyFatPercentage}%` });
    if (data.muscle) bodyComposition.push({ key: '근육량', value: `${data.muscle}kg` });
    if (data.skeletalMuscle) bodyComposition.push({ key: '골격근량', value: `${data.skeletalMuscle}kg` });
    if (data.protein) bodyComposition.push({ key: '단백질', value: `${data.protein}kg` });
    if (data.bodyWater) bodyComposition.push({ key: '체수분', value: `${data.bodyWater}kg` });
    if (bodyComposition.length > 0) {
      tables.push({ category: '체성분 데이터', rows: bodyComposition });
    }

    // 3. 신체 점수
    const bodyScore: DataTable['rows'] = [];
    if (data.bodyScore) bodyScore.push({ key: '신체 점수', value: `${data.bodyScore}점` });
    if (data.scoreDescription) bodyScore.push({ key: '점수 설명', value: data.scoreDescription });
    if (bodyScore.length > 0) {
      tables.push({ category: '신체 점수', rows: bodyScore });
    }

    // 4. 비만 판정
    const obesity: DataTable['rows'] = [];
    if (data.bmi) obesity.push({ key: 'BMI', value: data.bmi.toFixed(1) });
    if (data.bmiStatus) obesity.push({ key: '비만 판정', value: data.bmiStatus });
    if (data.weightControl) obesity.push({ key: '체중 조절', value: data.weightControl });
    if (obesity.length > 0) {
      tables.push({ category: '비만 판정', rows: obesity });
    }

    // 5. 신체 유형
    const bodyType: DataTable['rows'] = [];
    if (data.bodyType) bodyType.push({ key: '신체 유형', value: data.bodyType });
    if (bodyType.length > 0) {
      tables.push({ category: '신체 유형', rows: bodyType });
    }

    // 6. 기타 지표
    const otherMetrics: DataTable['rows'] = [];
    if (data.calorieNeeds) otherMetrics.push({ key: '기초대사량', value: `${data.calorieNeeds}kcal` });
    if (otherMetrics.length > 0) {
      tables.push({ category: '기타 지표', rows: otherMetrics });
    }

    // 7. 경고 (있는 경우)
    if (warnings.length > 0) {
      const warningRows: DataTable['rows'] = warnings.map(w => ({
        key: w.field,
        value: w.message
      }));
      tables.push({ category: '추출 경고', rows: warningRows });
    }

    return tables;
  };

  // 서버 측 OCR API 호출 (Google Vision API)
  const callServerOCR = async (file: File): Promise<{ text: string; confidence: number; engine: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
      throw new Error(errorData.error || 'OCR API 호출 실패');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'OCR 처리 실패');
    }

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      engine: result.data.engine,
    };
  };

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setProgress({ status: '처리 시작', progress: 0 });

    try {
      let result: { text: string; confidence: number; engine: string };

      if (ocrEngine === 'client-tesseract') {
        // 클라이언트 측 Tesseract.js OCR
        setProgress({ status: 'Tesseract.js 초기화 중...', progress: 0.1 });
        const tesseractResult = await extractTextFromImageClient(file, {
          language: 'kor+eng',
          preprocess: true,
          returnQualityMetrics: true,
          onProgress: (p) => {
            setProgress({ status: getStatusMessage(p.status), progress: p.progress });
          },
        });
        result = {
          text: tesseractResult.text,
          confidence: tesseractResult.confidence,
          engine: 'tesseract.js',
        };
      } else {
        // 서버 측 Google Vision API OCR
        setProgress({ status: 'Google Vision API 호출 중...', progress: 0.5 });
        result = await callServerOCR(file);
        setProgress({ status: '완료', progress: 1 });
      }

      setOcrResult(result);

      // InBody 데이터 파싱
      const parsed = parseInBodyData(result.text);
      setParseResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR 처리 실패');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 입력에서 패턴 찾기
  const findPatternFromInput = (field: string, userInput: string, _ocrText: string): PatternMatch | null => {
    if (!ocrResult) return null;

    const text = ocrResult.text;
    const input = userInput.trim();

    // 1. 정확한 일치 찾기
    const exactMatch = text.indexOf(input);
    if (exactMatch !== -1) {
      const start = Math.max(0, exactMatch - 50);
      const end = Math.min(text.length, exactMatch + input.length + 50);
      const matchedText = text.substring(start, end);

      let pattern = '';
      const numberPattern = /(\d+\.?\d*)/.exec(input);
      if (numberPattern) {
        const beforeText = text.substring(Math.max(0, exactMatch - 20), exactMatch);
        if (beforeText.trim()) {
          const keyword = beforeText.trim().split(/\s+/).pop() || '';
          pattern = `${keyword}\\s*[:：]?\\s*${numberPattern[1]}`;
        } else {
          pattern = numberPattern[1];
        }
      }

      return { field, userInput: input, matchedText, pattern, confidence: 100 };
    }

    // 2. 유사 일치 찾기 (숫자만)
    const numberMatch = /(\d+\.?\d*)/.exec(input);
    if (numberMatch) {
      const number = numberMatch[1];
      const regex = new RegExp(number.replace(/\./g, '\\.?'), 'g');
      const matches = text.match(regex);

      if (matches && matches.length > 0) {
        for (const match of matches) {
          const matchIndex = text.indexOf(match);
          const start = Math.max(0, matchIndex - 30);
          const end = Math.min(text.length, matchIndex + match.length + 30);
          const matchedText = text.substring(start, end);
          const beforeText = text.substring(Math.max(0, matchIndex - 30), matchIndex);
          const keywordMatch = beforeText.match(/([가-힣A-Za-z]+)\s*[:：]?\s*$/);

          if (keywordMatch) {
            return { field, userInput: input, matchedText, pattern: `${keywordMatch[1]}\\s*[:：]?\\s*${number}`, confidence: 85 };
          }
        }

        const matchIndex = text.indexOf(matches[0]);
        const start = Math.max(0, matchIndex - 30);
        const end = Math.min(text.length, matchIndex + matches[0].length + 30);
        const matchedText = text.substring(start, end);
        return { field, userInput: input, matchedText, pattern: number, confidence: 60 };
      }
    }

    return null;
  };

  // 패턴 찾기 실행
  const handleFindPatterns = () => {
    if (!ocrResult || !parseResult) return;

    const matches: PatternMatch[] = [];
    const warnings = parseResult.warnings;

    for (const warning of warnings) {
      const userInput = userInputs[warning.field];
      if (userInput) {
        const match = findPatternFromInput(warning.field, userInput, ocrResult.text);
        if (match) {
          matches.push(match);
        }
      }
    }

    setPatternMatches(matches);
  };

  // 모든 필드 입력 상태 변경
  const handleInputChange = (field: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [field]: value }));
  };

  // 파싱된 데이터를 테이블 형식으로 변환
  const dataTables = parseResult ? formatDataTables(parseResult) : [];
  const hasWarnings = parseResult && parseResult.warnings.length > 0;

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
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">InBody OCR 파서 고도화</h1>
        <p className="text-gray-600 mb-8">이미지를 업로드하고 OCR 엔진을 선택하여 데이터를 추출합니다</p>

        {/* 파일 업로드 영역 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">1. 이미지 업로드 & OCR 엔진 선택</h2>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">OCR 엔진 선택</h3>
            <div className="flex gap-4">
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

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          {preview && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">미리보기:</h3>
              <img src={preview} alt="Preview" className="max-w-md rounded border border-gray-200" />
            </div>
          )}
        </div>

        {/* 처리 버튼 */}
        {file && !parseResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <button
              onClick={handleProcess}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : ocrEngine === 'server-google-vision' ? 'Google Vision API로 추출 시작' : 'Tesseract.js로 추출 시작'}
            </button>

            {loading && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">{progress.status}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">에러</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* OCR 결과 요약 */}
        {ocrResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">2. OCR 결과 요약</h2>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">엔진:</span>
                <span className={`ml-2 font-medium ${ocrEngine === 'server-google-vision' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {ocrEngine === 'server-google-vision' ? 'Google Vision API' : 'Tesseract.js'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">신뢰도:</span>
                <span className={`ml-2 font-bold ${ocrResult.confidence >= 70 ? 'text-green-600' : ocrResult.confidence >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {ocrResult.confidence.toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">추출 텍스트 길이:</span>
                <span className="ml-2 font-medium text-gray-900">{ocrResult.text.length}자</span>
              </div>
            </div>

            {hasWarnings && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 font-semibold">{parseResult.warnings.length}개의 데이터를 찾을 수 없습니다</p>
                    <p className="text-yellow-700 text-sm mt-1">파서 개선 모드에서 패턴을 학습하세요</p>
                  </div>
                  <button
                    onClick={() => setShowParserImprove(!showParserImprove)}
                    className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700"
                  >
                    {showParserImprove ? '닫기' : '파서 개선'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 파서 개선 UI */}
        {showParserImprove && hasWarnings && ocrResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">3. 파서 개선 - 패턴 학습</h2>

            {/* 사용 가이드 */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">사용 방법</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>아래 OCR 텍스트에서 찾고 싶은 값의 <strong>정확한 텍스트</strong>를 확인하세요</li>
                <li>찾을 수 없는 항목에 실제 OCR 텍스트에 있는 값을 입력하세요</li>
                <li><strong>[패턴 찾기]</strong>를 누르면 자동으로 패턴을 추론합니다</li>
                <li>발견된 패턴을 확인하고 파서 코드를 적용하세요</li>
              </ol>
            </div>

            {/* OCR 텍스트 미리보기 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">OCR 텍스트 (입력 참고용)</h3>
              <div className="relative">
                <pre className="bg-gray-50 p-3 rounded text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto border max-h-40">
                  {ocrResult.text}
                </pre>
                <div className="absolute top-2 right-2 text-xs text-gray-500">
                  {ocrResult.text.length}자
                </div>
              </div>
            </div>

            {/* 입력 필드들 */}
            <div className="space-y-4">
              {parseResult.warnings.map((warning) => (
                <div key={warning.field} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-800">
                        {warning.field}
                      </label>
                      <p className="text-xs text-gray-500">{warning.message}</p>
                    </div>
                    {userInputs[warning.field] && (() => {
                      const preview = findPatternFromInput(warning.field, userInputs[warning.field], ocrResult.text);
                      return preview ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          ✓ 매칭 가능
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          입력중...
                        </span>
                      );
                    })()}
                  </div>
                  <input
                    type="text"
                    placeholder="OCR 텍스트에 있는 실제 값 입력 (예: 67.5, 체중 67.5kg)"
                    value={userInputs[warning.field] || ''}
                    onChange={(e) => handleInputChange(warning.field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {userInputs[warning.field] && (() => {
                    const preview = findPatternFromInput(warning.field, userInputs[warning.field], ocrResult.text);
                    return preview && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                        <div className="text-green-800 font-medium">미리보기:</div>
                        <div className="text-green-700 mt-1">
                          <div>매칭: <span className="font-mono bg-white px-1 rounded">{preview.matchedText.substring(0, 80)}...</span></div>
                          <div>패턴: <span className="font-mono text-blue-600 bg-white px-1 rounded">{preview.pattern}</span></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleFindPatterns}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                패턴 찾기 (전체 실행)
              </button>
              <button
                onClick={() => {
                  setUserInputs({});
                  setPatternMatches([]);
                }}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
              >
                초기화
              </button>
            </div>

            {/* 패턴 매칭 결과 */}
            {patternMatches.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">발견된 패턴</h3>
                <div className="space-y-4">
                  {patternMatches.map((match, idx) => (
                    <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-800">{match.field}</span>
                        <span className="text-sm text-green-600">신뢰도: {match.confidence}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">입력값:</span>
                          <span className="ml-2 font-mono bg-white px-2 py-1 rounded">{match.userInput}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">추론 패턴:</span>
                          <span className="ml-2 font-mono bg-white px-2 py-1 rounded text-blue-600">{match.pattern}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-600 text-sm">매칭된 텍스트:</span>
                        <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto border">{match.matchedText}</pre>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 코드 제안 */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">추가할 파서 코드</h4>
                  <pre className="text-xs bg-white p-3 rounded overflow-x-auto border">
{`// ${patternMatches[0]?.field || 'field'} 추출 패턴
const ${patternMatches[0]?.field || 'field'}Match = text.match(/${patternMatches[0]?.pattern || 'pattern'}/);
if (${patternMatches[0]?.field || 'field'}Match) {
  data.${patternMatches[0]?.field || 'field'} = /* 타입 변환 필요 */;
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 파싱된 InBody 데이터 테이블 */}
        {dataTables.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">4. 추출된 InBody 데이터</h2>

            {dataTables.map((table, tableIdx) => (
              <div key={tableIdx} className="mb-8 last:mb-0">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className={`w-2 h-6 rounded ${table.category === '추출 경고' ? 'bg-yellow-500' : 'bg-blue-600'}`}></span>
                  {table.category}
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full">
                    <tbody>
                      {table.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b last:border-b-0 w-1/3">
                            {row.key}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 border-b last:border-b-0">
                            {row.value ?? '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* InBody 체성분 시각화 차트 */}
        {inBodyRecord && (
          <div className="mb-6">
            <InBodyResultsChartSimple data={inBodyRecord} />
          </div>
        )}

        {/* 원본 텍스트 */}
        {ocrResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">5. 원본 OCR 텍스트</h2>
            <pre className="bg-gray-50 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto border border-gray-200">
              {ocrResult.text}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
