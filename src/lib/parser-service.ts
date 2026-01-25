/**
 * TAG-DATA-TASK-007: Parser Service Integration
 * SPEC-DATA-003: OCR 텍스트에서 구조화된 체성분 데이터 추출
 *
 * 새로운 16개 패턴 기반 추출 모듈 통합
 */

import { InBodyData, validateInBodyData } from './inbody';

/**
 * 점수 범위 상수
 */
const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  AVERAGE: 70,
  CAUTION: 50,
} as const;

/**
 * 점수 설명 상수
 */
const SCORE_DESCRIPTIONS = {
  EXCELLENT: '우수',
  AVERAGE: '보통',
  CAUTION: '주의',
  WARNING: '경고',
} as const;

/**
 * 파싱 경고
 */
export interface ParseWarning {
  field: string;
  message: string;
}

/**
 * 점수에 따른 설명을 계산합니다
 *
 * @param score - 신체 점수 (0-100)
 * @returns 점수 설명
 */
function getScoreDescription(score: number): string {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    return SCORE_DESCRIPTIONS.EXCELLENT;
  } else if (score >= SCORE_THRESHOLDS.AVERAGE) {
    return SCORE_DESCRIPTIONS.AVERAGE;
  } else if (score >= SCORE_THRESHOLDS.CAUTION) {
    return SCORE_DESCRIPTIONS.CAUTION;
  } else {
    return SCORE_DESCRIPTIONS.WARNING;
  }
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

  // 텍스트 부족 시 더미 데이터 반환 제거 - 적절한 에러 처리
  // 최소 길이를 5로 줄임 (신체 점수 패턴 "점수: 75" 등을 지원하기 위해)
  if (!text || text.length < 5) {
    warnings.push({ field: 'all', message: 'OCR 텍스트가 부족합니다. 데이터를 추출할 수 없습니다.' });

    return {
      data: {},
      warnings,
      rawText: text,
    };
  }

  // OCR 결과 콘솔 로그 (디버깅용)
  console.log('[Parser] OCR 텍스트 길이:', text.length);
  console.log('[Parser] 전체 OCR 텍스트:', text);

  // ========== 1. 개인정보 추출 ==========
  // 이름: "ID:강력쇠주먹", "10:강력쇠주먹" 형식 처리
  const nameMatch = text.match(/ID:\s*([가-힣]+)\s+성별/);
  if (nameMatch) {
    data.name = nameMatch[1];
  } else {
    const altNameMatch1 = text.match(/(\d+):\s*([가-힣A-Za-z]+)\s+성별/);
    if (altNameMatch1) {
      data.name = altNameMatch1[2];
    } else {
      const altNameMatch2 = text.match(/성명\s*[:\s]*([가-힣A-Za-z]+)/);
      if (altNameMatch2) {
        data.name = altNameMatch2[1];
      } else {
        warnings.push({ field: 'name', message: '이름을 찾을 수 없습니다' });
      }
    }
  }

  // 성별: "성별:남성"
  const genderMatch = text.match(/성별\s*[:\s]*([남녀MF]|남성|여성|여자)/);
  if (genderMatch) {
    const gender = genderMatch[1];
    if (gender === '남' || gender === 'M' || gender === '남성') {
      data.gender = 'male';
    } else if (gender === '녀' || gender === 'F' || gender === '여성' || gender === '여자') {
      data.gender = 'female';
    }
  } else {
    warnings.push({ field: 'gender', message: '성별을 찾을 수 없습니다' });
  }

  // 나이: "나이:51"
  const ageMatch = text.match(/나이\s*[:\s]*(\d+)\s*세?/);
  if (ageMatch) {
    data.age = parseInt(ageMatch[1], 10);
  }

  // 측정일: "2024.03.25", "2024-03-25", "2024년 3월 25일" 형식 추출
  // Priority 1: "YYYY.MM.DD" 또는 "YYYY-MM-DD" 형식
  const measuredAtMatch = text.match(/(\d{4})[.\-年](\d{1,2})[.\-月](\d{1,2})[日]?/);
  if (measuredAtMatch) {
    const year = parseInt(measuredAtMatch[1], 10);
    const month = parseInt(measuredAtMatch[2], 10);
    const day = parseInt(measuredAtMatch[3], 10);
    // 유효한 날짜인지 확인
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      data.measuredAt = new Date(year, month - 1, day);
    }
  }

  // 신장: "높이:17300" (mm → cm 변환)
  const heightMatch = text.match(/(?:신장|높이|키)\s*[:\s]*(\d+\.?\d*)\s*(?:cm|m)?/);
  if (heightMatch) {
    let heightValue = parseFloat(heightMatch[1]);
    // 17300 같은 값은 mm로 보정 (17300mm = 173cm)
    if (heightValue > 1000) {
      heightValue = heightValue / 100;
    }
    data.height = heightValue;
  } else {
    warnings.push({ field: 'height', message: '신장을 찾을 수 없습니다' });
  }

  // ========== 2. 체성분 데이터 추출 ==========
  // 체중: "무게 67.00"
  const weightMatch = text.match(/(?:체중|무게|Weight)\s*(?::\s*)?(\d+\.?\d*)\s*(?:kg|Kg)?/);
  if (weightMatch) {
    data.weight = parseFloat(weightMatch[1]);
  } else {
    warnings.push({ field: 'weight', message: '체중을 찾을 수 없습니다' });
  }

  // 체지방량: "체지방량(kg) 8.8" 또는 "체지방량 8.8kg"
  const bodyFatMassMatch = text.match(/체지방량[^0-9]*?(\d+\.?\d*)\s*(?:kg|\(?\s*kg)?/);
  if (bodyFatMassMatch) {
    data.bodyFat = parseFloat(bodyFatMassMatch[1]);
  }

  // 체지방 및 체지방률: "체지방률 8.8 13.2" 형식에서 첫 번째는 체지방량(kg), 두 번째는 체지방률(%)
  // Priority 1: "체지방률" 뒤에 두 개의 숫자가 있는 형식 (체지방량, 체지방률)
  const bodyFatDualMatch = text.match(/체지방률\s+(\d+\.?\d+)\s+(\d+\.?\d+)/);
  if (bodyFatDualMatch) {
    data.bodyFat = parseFloat(bodyFatDualMatch[1]);      // 첫 번째: 체지방량 (kg)
    data.bodyFatPercentage = parseFloat(bodyFatDualMatch[2]); // 두 번째: 체지방률 (%)
  } else {
    // Priority 2: 기존 체지방량 패턴 (단독)
    const bodyFatMassMatch = text.match(/체지방량[^0-9]*?(\d+\.?\d*)\s*(?:kg|\(?\s*kg)?/);
    if (bodyFatMassMatch) {
      data.bodyFat = parseFloat(bodyFatMassMatch[1]);
    }

    // Priority 3: 간단한 체지방률 패턴
    const simpleBfpMatch = text.match(/체지방률\s*[:\s]*(\d+\.?\d*)\s*%/);
    if (simpleBfpMatch) {
      data.bodyFatPercentage = parseFloat(simpleBfpMatch[1]);
    }
  }

  // 신체 점수: "81 100포인트" 형식에서 100포인트/100점 기준 앞의 숫자 추출
  // Priority 1: "100포인트" 바로 앞의 숫자 (실제 신체점수)
  let bodyScoreValue: number | undefined;

  // "100포인트" 또는 "100점" 바로 앞에 있는 숫자 추출
  const point100Match = text.match(/(\d{1,2}\.?\d*)\s+(?:100\s*포인트|100\s*점|100점)/);
  if (point100Match) {
    const score = parseFloat(point100Match[1]);
    // 100 이하의 값만 신체점수로 사용 (100 자체는 제외)
    if (score < 100) {
      bodyScoreValue = score;
    }
  }

  // Priority 2: "N/100" 또는 "N / 100" 형식
  if (!bodyScoreValue) {
    const slash100Match = text.match(/(\d{1,3})\s*\/\s*100/);
    if (slash100Match) {
      const score = parseInt(slash100Match[1], 10);
      if (score >= 0 && score < 100) {
        bodyScoreValue = score;
      }
    }
  }

  // Priority 1: InBody 970 신체점수 형식 (콜론/공백 유연 처리)
  if (!bodyScoreValue) {
    const p2Match = text.match(/신체점수\s*[:：]?\s*(\d{2,3})/);
    if (p2Match) {
      bodyScoreValue = parseInt(p2Match[1], 10);
    }
  }

  // Priority 1: InBody 970 총점 형식
  if (!bodyScoreValue) {
    const p3Match = text.match(/총점\s*[:：]?\s*(\d{2,3})/);
    if (p3Match) {
      bodyScoreValue = parseInt(p3Match[1], 10);
    }
  }

  // Priority 1: Body Score 영문
  if (!bodyScoreValue) {
    const p4Match = text.match(/Body\s*Score[^0-9]*(\d{2,3})\s*Standard/i);
    if (p4Match) {
      bodyScoreValue = parseInt(p4Match[1], 10);
    }
  }

  // Priority 2: InBody 720 신체평가 점수
  if (!bodyScoreValue) {
    const p5Match = text.match(/신체평가\s+점수\s*(\d{2,3})/);
    if (p5Match) {
      bodyScoreValue = parseInt(p5Match[1], 10);
    }
  }

  // Priority 2: /100점 형식 (점/점수 있음)
  if (!bodyScoreValue) {
    const p6Match = text.match(/(\d{2,3})\s*\/\s*100\s*점/);
    if (p6Match) {
      bodyScoreValue = parseInt(p6Match[1], 10);
    }
  }

  // Priority 2: /100 형식 (점/점수 없음) - "81/100" 직접 지원
  if (!bodyScoreValue) {
    const p6bMatch = text.match(/(\d{1,3})\s*\/\s*100\b/);
    if (p6bMatch) {
      const score = parseInt(p6bMatch[1], 10);
      if (score >= 0 && score <= 100) {
        bodyScoreValue = score;
      }
    }
  }

  // Priority 3: OntoFit 신체 점수
  if (!bodyScoreValue) {
    const p7Match = text.match(/신체\s+점수\s*(\d{2,3})/);
    if (p7Match) {
      bodyScoreValue = parseInt(p7Match[1], 10);
    }
  }

  // Priority 3: OntoFit 바디스코어
  if (!bodyScoreValue) {
    const p8Match = text.match(/바디스코어\s*(\d{2,3})/);
    if (p8Match) {
      bodyScoreValue = parseInt(p8Match[1], 10);
    }
  }

  // Priority 4: 평가점
  if (!bodyScoreValue) {
    const p9Match = text.match(/평가점\s*[:：]?\s*(\d{2,3})/);
    if (p9Match) {
      bodyScoreValue = parseInt(p9Match[1], 10);
    }
  }

  // Priority 5: Generic 점수 형식
  if (!bodyScoreValue) {
    const p10Match = text.match(/점수\s*[:：]?\s*(\d{2,3})/);
    if (p10Match) {
      bodyScoreValue = parseInt(p10Match[1], 10);
    }
  }

  // Priority 6: Score 영문
  if (!bodyScoreValue) {
    const p11Match = text.match(/Score\s*[:：]?\s*(\d{2,3})/i);
    if (p11Match) {
      bodyScoreValue = parseInt(p11Match[1], 10);
    }
  }

  // Priority 7: 숫자+점
  if (!bodyScoreValue) {
    const p12Match = text.match(/(\d{2,3})\s*점/);
    if (p12Match) {
      bodyScoreValue = parseInt(p12Match[1], 10);
    }
  }

  // Priority 7: 숫자+점수
  if (!bodyScoreValue) {
    const p13Match = text.match(/(\d{2,3})\s*점수/);
    if (p13Match) {
      bodyScoreValue = parseInt(p13Match[1], 10);
    }
  }

  // Priority 9: 혼합 형식
  if (!bodyScoreValue) {
    const p14Match = text.match(/(?:신체|Body|바디|Score)\s*(?:점수|Score|스코어)?\s*(\d{2,3})/i);
    if (p14Match) {
      bodyScoreValue = parseInt(p14Match[1], 10);
    }
  }

  // Priority 10: 2-3자리 숫자 (문맥 기반) - 명확한 점수 표시가 없는 경우만
  if (!bodyScoreValue) {
    // 체중, 키, BMI 등 다른 지표의 숫자를 피하기 위해 더 엄격한 패턴 사용
    const p15Match = text.match(/(?:점|score|평가|\b점수|\bscore)[^\d]*(\d{2,3})/i);
    if (p15Match) {
      const num = parseInt(p15Match[1], 10);
      // 10-100 사이의 값만 사용
      if (num >= 10 && num <= 100) {
        bodyScoreValue = num;
      }
    }
  }

  // 기존 3개 패턴 유지 (하위 호환성 및 폴백)
  // 패턴 1: "신체 점수"와 "표준" 사이에서 숫자 찾기
  if (!bodyScoreValue) {
    const scoreSectionMatch = text.match(/신체\s*점수[^표준]*?표준/);
    if (scoreSectionMatch) {
      const scoreText = scoreSectionMatch[0];
      // 이 섹션에서 모든 숫자를 찾고, 가장 큰 값(또는 100에 가까운 값)을 신체 점수로 사용
      const allNumbers = scoreText.match(/(\d+\.?\d*)/g);
      if (allNumbers) {
        // 숫자들 중 0-100 사이의 값들만 필터링
        const validScores = allNumbers
          .map(n => parseFloat(n))
          .filter(n => n >= 0 && n <= 100);

        if (validScores.length > 0) {
          // 가장 큰 값(신체 점수는 보통 100점 만점)
          bodyScoreValue = Math.max(...validScores);
        }
      }
    }
  }

  // 패턴 2: "100.0 표준" 형식 직접 찾기
  if (!bodyScoreValue) {
    const directScoreMatch = text.match(/(\d{2,3}\.?\d*)\s*표준/);
    if (directScoreMatch) {
      const score = parseFloat(directScoreMatch[1]);
      if (score <= 100) {
        bodyScoreValue = score;
      }
    }
  }

  // 패턴 3: "81/100포인트" 형식에서 분자 숫자 찾기 (우선순위 높임)
  if (!bodyScoreValue) {
    const pointScoreMatch = text.match(/(\d+)\s*\/\s*100\s*포인트/);
    if (pointScoreMatch) {
      bodyScoreValue = parseInt(pointScoreMatch[1], 10);
    }
  }

  // 패턴 3-2: "81/100" 형식 (포인트 없음)
  if (!bodyScoreValue) {
    const simpleScoreMatch = text.match(/(\d+)\s*\/\s*100\s*(?:점|점수)?/);
    if (simpleScoreMatch) {
      bodyScoreValue = parseInt(simpleScoreMatch[1], 10);
    }
  }

  // 추출된 점수가 있으면 데이터에 할당
  if (bodyScoreValue !== undefined) {
    data.bodyScore = Math.round(bodyScoreValue);
    data.scoreDescription = getScoreDescription(data.bodyScore);
  } else {
    // 모든 패턴이 실패한 경우
    warnings.push({ field: 'bodyScore', message: '신체 점수를 찾을 수 없습니다' });
  }

  // 근육량: "근육량: 32.0kg" 또는 "53.9 (44.8-55.9) 80.5 표준"
  const muscleMatch = text.match(/(?:근육량|muscle)\s*[:\s]*(\d+\.?\d*)/i);
  if (!muscleMatch) {
    // 복잡한 형식도 시도
    const complexMuscleMatch = text.match(/\s(\d+\.?\d*)\s*\(\d+\.?\d*-\d+\.?\d*\)\s*\d+\.?\d*\s*표준\s*목표/);
    if (complexMuscleMatch) {
      data.muscle = parseFloat(complexMuscleMatch[1]);
    }
  } else {
    data.muscle = parseFloat(muscleMatch[1]);
  }

  // 단백질: "단백질: 12.5kg" 또는 "단백질률 11.6 (9.6-12.0) 17.3 표준"
  const proteinMatch = text.match(/단백질(?:률)?\s*[:\s]*(\d+\.?\d*)/);
  if (proteinMatch) {
    data.protein = parseFloat(proteinMatch[1]);
  }

  // 체수분: "체수분: 40.5kg" 또는 "체수 42.3 (35.2-43.9) 63.2 표준"
  const bodyWaterMatch = text.match(/체수분?\s*[:\s]*(\d+\.?\d*)/);
  if (bodyWaterMatch) {
    data.bodyWater = parseFloat(bodyWaterMatch[1]);
  }

  // 골격근량: "골격근량: 30.0kg" 또는 "골격근 32.7 (28.2-34.4) 48.8 표준"
  const skeletalMuscleMatch = text.match(/골격근량?\s*[:\s]*(\d+\.?\d*)/);
  if (skeletalMuscleMatch) {
    data.skeletalMuscle = parseFloat(skeletalMuscleMatch[1]);
  }

  // ========== 3. 비만 판정 추출 ==========
  // BMI: "BMI: 23.5", "bmi = 22.3", "체질량지수(BMI) % 22.3"
  // 간단한 형식 먼저 시도 (= 지원)
  const bmiMatch = text.match(/(?:체질량지수|BMI|bmi)\s*(?:\([^)]*\)\s*%?\s*[=:]?\s*)?(\d+\.?\d*)/i);
  if (bmiMatch) {
    data.bmi = parseFloat(bmiMatch[1]);
  } else {
    // 대안: % 뒤에 오는 숫자를 BMI로 추출
    const percentBmiMatch = text.match(/%\s*(\d{2}\.?\d*)/);
    if (percentBmiMatch && parseFloat(percentBmiMatch[1]) < 50) {
      data.bmi = parseFloat(percentBmiMatch[1]);
    } else {
      warnings.push({ field: 'bmi', message: 'BMI를 찾을 수 없습니다' });
    }
  }
  if (bmiMatch) {
    data.bmi = parseFloat(bmiMatch[1]);
  } else {
    // 복잡한 형식: "%" 뒤에 나오는 숫자를 BMI로 추출 (BMI는 보통 15-40 사이)
    const complexBmiMatch = text.match(/%\s+(\d{2}\.?\d*)\s*(?:골격근|곡격근)/);
    if (complexBmiMatch) {
      data.bmi = parseFloat(complexBmiMatch[1]);
    } else {
      // 추가 패턴: "=0[:BMI22.4]" 또는 유사한 형식
      const bmiPatternMatch = text.match(/(?:BMI|bmi)[:\s]*(\d{2}\.?\d*)/);
      if (bmiPatternMatch) {
        data.bmi = parseFloat(bmiPatternMatch[1]);
      } else {
        warnings.push({ field: 'bmi', message: 'BMI를 찾을 수 없습니다' });
      }
    }
  }

  // 비만 판정: BMI 값으로 계산 (대한비만학회 기준)
  if (data.bmi !== undefined) {
    // 저체중: < 18.5, 정상: 18.5-22.9, 과체중: 23-24.9, 비만: >= 25
    if (data.bmi < 18.5) {
      data.bmiStatus = '저체중';
    } else if (data.bmi < 23) {
      data.bmiStatus = '정상';
    } else if (data.bmi < 25) {
      data.bmiStatus = '과체중';
    } else {
      data.bmiStatus = '비만';
    }
  } else {
    warnings.push({ field: 'bmiStatus', message: 'BMI가 없어 비만 판정을 할 수 없습니다' });
  }

  // ========== 4. 체중 조절 추출 ==========
  // 체중 조절: "체중조절: 유지" 또는 "체중 조절 +0.7kg" 또는 "체중 조절 유지"
  // 숫자 형식 (콜론 유무 모두 지원)
  let weightControlMatch = text.match(/체중\s*조절\s*:?\s*([+\-]?\d+\.?\d*)\s*kg?/);
  if (weightControlMatch) {
    data.weightControl = weightControlMatch[1];
  } else {
    // 문자열 형식 (유지/증감/감소) (콜론 유무 모두 지원)
    const textMatch = text.match(/체중\s*조절\s*:?\s*(유지|증감|감소)/);
    if (textMatch) {
      data.weightControl = textMatch[1];
    }
  }

  // ========== 5. 신체 유형 추출 ==========
  // 신체 유형: 사용자의 실제 데이터에 기반한 판단
  // InBody 결과지에서 신체 유형은 BMI와 체지방률 조합으로 결정됨

  // 먼저 추출된 데이터로 기본 판단
  let determinedBodyType: string | undefined;

  if (data.weight && data.bodyFatPercentage && data.muscle && data.height) {
    const bmi = data.weight / ((data.height / 100) ** 2);
    const bodyFatPercent = data.bodyFatPercentage;
    const muscleMass = data.muscle;

    // InBody 신체 유형 분류 기준 (일반적인 기준)
    if (bodyFatPercent < 10 && muscleMass > 50) {
      determinedBodyType = '운동선수형'; // 체지방 매우 낮음, 근육량 높음
    } else if (bodyFatPercent < 15 && muscleMass > 45) {
      determinedBodyType = '근육형'; // 체지방 낮음, 근육량 높음
    } else if (bodyFatPercent < 12 && muscleMass < 45) {
      determinedBodyType = '마른근육형'; // 체지방 낮음, 근육량 보통
    } else if (bmi < 18.5) {
      determinedBodyType = '영양부족'; // 저체중
    } else if (bodyFatPercent < 20 && bmi < 23) {
      determinedBodyType = '표준'; // 정상
    } else if (bodyFatPercent < 25 && bmi >= 23 && bmi < 25) {
      determinedBodyType = '과체중'; // 과체중
    } else if (bodyFatPercent >= 25 || bmi >= 25) {
      determinedBodyType = '비만'; // 비만
    } else {
      determinedBodyType = '날씬형'; // 기본값
    }
  }

  // OCR 텍스트에서 신체 유형 관련 키워드 추출 (검증용)
  // "신체유형: 근육형" 또는 "/" 뒤에 나오는 신체 유형이 사용자의 실제 유형임
  const bodyTypeFromColon = text.match(/신체유형\s*[:\s]*(근육형|마른근육형|날씬형|표준|비만|운동선수형|경도비만)/);
  if (bodyTypeFromColon) {
    data.bodyType = bodyTypeFromColon[1];
  } else {
    const bodyTypeFromSlash = text.match(/\/\s*(근육형|마른근육형|날씬형|표준|비만|운동선수형|경도비만)/);
    if (bodyTypeFromSlash) {
      data.bodyType = bodyTypeFromSlash[1];
    } else if (determinedBodyType) {
      // 계산된 유형 사용
      data.bodyType = determinedBodyType;
    } else {
      // 기본값: OCR 텍스트에서 찾기
      const fallbackBodyTypeMatch = text.match(/(?:근육형|마른근육형|날씬형|표준|비만|운동선수형|경도비만)/);
      if (fallbackBodyTypeMatch) {
        data.bodyType = fallbackBodyTypeMatch[0];
      }
    }
  }

  // ========== 6. 기타 지표 추출 ==========
  // 칼로리/기초대사량: "기초 대사율 1618kcal"
  const calorieMatch = text.match(/(?:기초\s*대사율|칼로리|대사량)\s*[:\s]*(\d+)\s*kcal?/);
  if (calorieMatch) {
    data.calorieNeeds = parseInt(calorieMatch[1], 10);
  }

  // 신체 연령: "신체 연령 48" (향후 확장용)
  // const bodyAgeMatch = text.match(/신체\s*연령\s*[:\s]*(\d+)/);
  // 참고용으로 저장하거나 별도 필드로 추가 가능

  // 파싱 결과 로그 (디버깅용)
  console.log('[Parser] 추출된 데이터:', {
    name: data.name,
    gender: data.gender,
    age: data.age,
    height: data.height,
    weight: data.weight,
    bodyFat: data.bodyFat,
    bodyFatPercentage: data.bodyFatPercentage,
    muscle: data.muscle,
    protein: data.protein,
    bodyWater: data.bodyWater,
    skeletalMuscle: data.skeletalMuscle,
    bodyScore: data.bodyScore,
    scoreDescription: data.scoreDescription,
    bmi: data.bmi,
    bmiStatus: data.bmiStatus,
    weightControl: data.weightControl,
    bodyType: data.bodyType,
    calorieNeeds: data.calorieNeeds,
  });
  console.log('[Parser] 경고:', warnings);

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
