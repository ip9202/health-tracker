/**
 * TAG-AI-003: AI 프롬프트 엔지니어링
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템
 *
 * GLM API를 위한 건강 분석 프롬프트 생성 및 데이터 포맷팅
 */

import type { InBodyRecord } from '@prisma/client';

/**
 * InBody 데이터를 AI 프롬프트용으로 포맷팅
 * @param inbodyData - InBody 측정 데이터
 * @param historicalData - 과거 3개월 추이 데이터 (선택사항)
 * @returns 포맷팅된 문자열
 */
export function formatInBodyData(
  inbodyData: Partial<InBodyRecord>,
  historicalData?: Array<{ weight?: number; bodyFatPercentage?: number; date: string }>
): string {
  const lines: string[] = [];

  // 기본 체성분 데이터
  lines.push('## InBody 체성분 데이터');

  if (inbodyData.weight !== null && inbodyData.weight !== undefined) {
    lines.push(`- 체중: ${inbodyData.weight}kg`);
  }

  if (inbodyData.height !== null && inbodyData.height !== undefined) {
    lines.push(`- 키: ${inbodyData.height}cm`);
  }

  if (inbodyData.bmi !== null && inbodyData.bmi !== undefined) {
    lines.push(`- BMI: ${inbodyData.bmi.toFixed(1)}`);
  }

  if (inbodyData.bodyFatPercentage !== null && inbodyData.bodyFatPercentage !== undefined) {
    lines.push(`- 체지방율: ${inbodyData.bodyFatPercentage}%`);
  }

  if (inbodyData.skeletalMuscle !== null && inbodyData.skeletalMuscle !== undefined) {
    lines.push(`- 골격근량: ${inbodyData.skeletalMuscle}kg`);
  }

  if (inbodyData.calorieNeeds !== null && inbodyData.calorieNeeds !== undefined) {
    lines.push(`- 기초대사량: ${inbodyData.calorieNeeds}kcal`);
  }

  // 신체 유형 및 점수
  if (inbodyData.bodyType) {
    lines.push(`- 신체 유형: ${inbodyData.bodyType}`);
  }

  if (inbodyData.bodyScore !== null && inbodyData.bodyScore !== undefined) {
    lines.push(`- 신체 점수: ${inbodyData.bodyScore}`);
    if (inbodyData.scoreDescription) {
      lines.push(`  (${inbodyData.scoreDescription})`);
    }
  }

  // BMI 상태
  if (inbodyData.bmiStatus) {
    lines.push(`- BMI 판정: ${inbodyData.bmiStatus}`);
  }

  // 추이 데이터
  if (historicalData && historicalData.length > 0) {
    lines.push('');
    lines.push('## 과거 3개월 추이 데이터');
    historicalData.forEach((data, index) => {
      const dateLabel = `${index + 1}회차 (${data.date})`;
      const values: string[] = [];

      if (data.weight !== undefined) values.push(`체중 ${data.weight.toFixed(1)}kg`);
      if (data.bodyFatPercentage !== undefined) values.push(`체지방율 ${data.bodyFatPercentage.toFixed(1)}%`);

      if (values.length > 0) {
        lines.push(`- ${dateLabel}: ${values.join(', ')}`);
      }
    });
  }

  return lines.join('\n');
}

/**
 * 시스템 프롬프트
 * AI 어시스턴트의 역할과 행동 지침 정의
 */
const SYSTEM_PROMPT = `당신은 건강 분석 및 운동 추천 전문 AI 어시스턴트입니다.

사용자의 InBody 체성분 데이터를 분석하여 건강 상태를 평가하고, 맞춤형 운동 및 생활 습관 추천을 제공하세요.

## 중요 지침

1. **의료 진단 금지**: 의료 전문가의 진단을 대체하지 마세요. 일반적인 건강 지침만 제공하세요.
2. **개인정보 보호**: 사용자의 개인정보(이름, 연락처 등)는 분석에 포함하지 마세요.
3. **과학적 근거**: 일반적으로 인정된 건강 지침을 기반으로 추천하세요.
4. **한국어 응답**: 모든 분석 결과는 한국어로 제공하세요.
5. **JSON 형식**: 분석 결과는 반드시 지정된 JSON 형식으로 반환하세요.

## 분석 항목

- **건강 상태 (healthStatus)**: 전체적인 건강 상태를 한 줄로 요약 (예: "양호", "관리 필요", "개선 필요")
- **건강 점수 (healthScore)**: 0-100 사이의 점수로 평가
- **위험 요소 (riskFactors)**: 현재 건강 위험 요소 식별 (근육, 체지방, 대사, 체중)
- **추천 사항 (recommendations)**: 운동, 영양, 생활 습관 개선을 위한 구체적 추천
- **주의 사항 (warnings)**: 사용자가 알아야 할 건강 관련 주의 사항`;

/**
 * 건강 분석 프롬프트 생성
 * @param inbodyData - InBody 측정 데이터
 * @param historicalData - 과거 추이 데이터 (선택사항)
 * @returns GLM API 요청용 전체 프롬프트
 */
export function generateHealthAnalysisPrompt(
  inbodyData: Partial<InBodyRecord>,
  historicalData?: Array<{ weight?: number; bodyFatPercentage?: number; date: string }>
): string {
  const formattedData = formatInBodyData(inbodyData, historicalData);

  return `${SYSTEM_PROMPT}

---

${formattedData}

---

## 분석 요청

위 InBody 데이터를 분석하여 다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "healthStatus": "건강 상태 한 줄 요약",
  "healthScore": 0-100 사이의 정수,
  "riskFactors": [
    {
      "category": "muscle|fat|metabolism|weight",
      "level": "low|moderate|high",
      "description": "위험 요소에 대한 설명"
    }
  ],
  "recommendations": [
    {
      "type": "exercise|nutrition|lifestyle",
      "title": "추천 제목",
      "description": "구체적인 추천 내용",
      "priority": 1-5 (5가 가장 중요)
    }
  ],
  "warnings": [
    {
      "severity": "info|caution|warning",
      "message": "주의 사항 메시지",
      "actionable": true|false
    }
  ]
}
\`\`\`

## 분석 가이드라인

1. **건강 점수 산정**:
   - 90-100: 매우 양호
   - 70-89: 양호
   - 50-69: 관리 필요
   - 30-49: 개선 필요
   - 0-29: 전문가 상담 권장

2. **위험 요소 분류**:
   - muscle: 골격근량 부족, 근력 저하
   - fat: 체지방율 과다, 비만
   - metabolism: 기초대사량 저하, 대사 기능 저하
   - weight: 비정상 체중 (저체중 또는 과체중)

3. **추천 우선순위**:
   - 5: 즉시 시행 필요 (건강 위험 요소가 높은 경우)
   - 4-3: 중기 목표 (1-3개월 내)
   - 2-1: 장기 목표 (3개월 이후 또는 선택 사항)

4. **주의 사항 심각도**:
   - warning: 건강에 즉각적인 주의 필요
   - caution: 모니터링 필요
   - info: 일반적인 정보`;
}

/**
 * GLM API 메시지 형식으로 변환
 * @param inbodyData - InBody 측정 데이터
 * @param historicalData - 과거 추이 데이터
 * @returns GLM API messages 배열
 */
export function createGLMMessages(
  inbodyData: Partial<InBodyRecord>,
  historicalData?: Array<{ weight?: number; bodyFatPercentage?: number; date: string }>
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const prompt = generateHealthAnalysisPrompt(inbodyData, historicalData);

  return [
    {
      role: 'user',
      content: prompt,
    },
  ];
}

/**
 * 과거 3개월 추이 데이터 추출
 * @param records - InBody 기록 배열 (최신순)
 * @param months - 추적 기간 (기본값: 3개월)
 * @returns 추이 데이터
 */
export function extractHistoricalData(
  records: Partial<InBodyRecord>[],
  months: number = 3
): Array<{ weight?: number; bodyFatPercentage?: number; date: string }> {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  return records
    .filter((record) => record.measuredAt && new Date(record.measuredAt) >= cutoffDate)
    .slice(0, 10) // 최대 10개 기록
    .map((record) => ({
      weight: record.weight ?? undefined,
      bodyFatPercentage: record.bodyFatPercentage ?? undefined,
      date: record.measuredAt ? new Date(record.measuredAt).toISOString().split('T')[0] : '',
    }))
    .filter((data) => data.weight !== undefined || data.bodyFatPercentage !== undefined);
}
