/**
 * TAG-DATA-TASK-005: OCR 텍스트 파서 서비스 구현
 * SPEC-DATA-003: OCR 텍스트에서 구조화된 체성분 데이터 추출
 */

import { InBodyData, validateInBodyData } from './inbody';

/**
 * 파싱 경고
 */
export interface ParseWarning {
  field: string;
  message: string;
}

/**
 * 파싱 결과
 */
export interface ParseResult {
  data: InBodyData;
  warnings: ParseWarning[];
  rawText: string;
}

/**
 * OCR 텍스트에서 체성분 데이터를 추출합니다
 *
 * @param ocrText - OCR로 추출된 텍스트
 * @returns 파싱된 체성분 데이터와 경고
 */
export function parseInBodyData(ocrText: string): ParseResult {
  const warnings: ParseWarning[] = [];
  const data: Partial<InBodyData> = {};

  // 텍스트 전처리 (불필요한 공백 제거)
  const text = ocrText
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim();

  // 1. 개인정보 추출
  const nameMatch = text.match(/성명\s*[:\s]*([가-힣A-Za-z]+)/);
  if (nameMatch) {
    data.name = nameMatch[1];
  } else {
    warnings.push({ field: 'name', message: '이름을 찾을 수 없습니다' });
  }

  const genderMatch = text.match(/성별\s*[:\s]*([남녀MF])/);
  if (genderMatch) {
    const gender = genderMatch[1];
    if (gender === '남' || gender === 'M') {
      data.gender = 'male';
    } else if (gender === '녀' || gender === 'F') {
      data.gender = 'female';
    }
  }

  const ageMatch = text.match(/나이\s*[:\s]*(\d+)\s*세?/);
  if (ageMatch) {
    data.age = parseInt(ageMatch[1], 10);
  }

  const heightMatch = text.match(/신장\s*[:\s]*(\d+\.?\d*)\s*cm?/);
  if (heightMatch) {
    data.height = parseFloat(heightMatch[1]);
  }

  // 2. 체성분 데이터 추출
  const weightMatch = text.match(/체중\s*[:\s]*(\d+\.?\d*)\s*kg?/);
  if (weightMatch) {
    data.weight = parseFloat(weightMatch[1]);
  } else {
    warnings.push({ field: 'weight', message: '체중을 찾을 수 없습니다' });
  }

  const bodyFatMatch = text.match(/체지방률\s*[:\s]*(\d+\.?\d*)\s*%?/);
  if (bodyFatMatch) {
    data.bodyFatPercentage = parseFloat(bodyFatMatch[1]);
  }

  const muscleMatch = text.match(/근육량\s*[:\s]*(\d+\.?\d*)\s*kg?/);
  if (muscleMatch) {
    data.muscle = parseFloat(muscleMatch[1]);
  }

  const proteinMatch = text.match(/단백질\s*[:\s]*(\d+\.?\d*)\s*kg?/);
  if (proteinMatch) {
    data.protein = parseFloat(proteinMatch[1]);
  }

  const bodyWaterMatch = text.match(/체수분\s*[:\s]*(\d+\.?\d*)\s*kg?/);
  if (bodyWaterMatch) {
    data.bodyWater = parseFloat(bodyWaterMatch[1]);
  }

  const skeletalMuscleMatch = text.match(/골격근량\s*[:\s]*(\d+\.?\d*)\s*kg?/);
  if (skeletalMuscleMatch) {
    data.skeletalMuscle = parseFloat(skeletalMuscleMatch[1]);
  }

  // 3. 신체 점수 추출
  const bodyScoreMatch = text.match(/신체점수\s*[:\s]*(\d+)\s*\/?\s*100/);
  if (bodyScoreMatch) {
    data.bodyScore = parseInt(bodyScoreMatch[1], 10);
  }

  const scoreDescMatch = text.match(/점수설명\s*[:\s]*([가-힣]+)/);
  if (scoreDescMatch) {
    data.scoreDescription = scoreDescMatch[1];
  }

  // 4. 비만 판정 추출
  const bmiMatch = text.match(/BMI\s*[:\s]*(\d+\.?\d*)/);
  if (bmiMatch) {
    data.bmi = parseFloat(bmiMatch[1]);
  }

  const bmiStatusMatch = text.match(/비만판정\s*[:\s]*([가-힣]+)/);
  if (bmiStatusMatch) {
    data.bmiStatus = bmiStatusMatch[1];
  }

  // 5. 체중 조절 추출
  const weightControlMatch = text.match(/체중조절\s*[:\s]*([가-힣]+)(?=\s|$)/);
  if (weightControlMatch) {
    data.weightControl = weightControlMatch[1].trim();
  }

  // 6. 신체 유형 추출
  const bodyTypeMatch = text.match(/신체유형\s*[:\s]*([가-힣]+)/);
  if (bodyTypeMatch) {
    data.bodyType = bodyTypeMatch[1];
  }

  // 7. 생체 임피던스 추출
  const bioimpedanceMatch = text.match(/생체임피던스\s*[:\s]*([^\s]+)/);
  if (bioimpedanceMatch) {
    data.bioimpedance = bioimpedanceMatch[1];
  }

  // 8. 기타 지표 추출
  const smiMatch = text.match(/SMI\s*[:\s]*(\d+\.?\d*)/);
  if (smiMatch) {
    data.smi = parseFloat(smiMatch[1]);
  }

  const calorieMatch = text.match(/칼로리\s*[:\s]*(\d+)\s*kcal?/);
  if (calorieMatch) {
    data.calorieNeeds = parseInt(calorieMatch[1], 10);
  }

  // 9. 부위별 분석 (전체 텍스트 저장)
  const regionalMatch = text.match(/부위별분석\s*[:\s]*(.+)/);
  if (regionalMatch) {
    data.regionalAnalysis = regionalMatch[1];
  }

  // Zod 검증
  const validationResult = validateInBodyData(data);

  return {
    data: validationResult.data || {},
    warnings,
    rawText: text,
  };
}

/**
 * 단위 변환 헬퍼 함수
 */
export function convertUnit(value: number, from: 'kg' | 'g' | 'lb', to: 'kg' | 'g' | 'lb'): number {
  if (from === to) return value;

  const conversions: Record<string, number> = {
    'kg-g': 1000,
    'kg-lb': 2.20462,
    'g-kg': 0.001,
    'g-lb': 0.00220462,
    'lb-kg': 0.453592,
    'lb-g': 453.592,
  };

  const key = `${from}-${to}`;
  const factor = conversions[key];

  if (factor === undefined) {
    throw new Error(`Unsupported conversion: ${from} to ${to}`);
  }

  return value * factor;
}
