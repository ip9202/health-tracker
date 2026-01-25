/**
 * 체성분 분석 섹션
 * Figma 디자인 그대로 구현
 * - 테이블 형태 데이터 표시
 * - 수평 막대 그래프
 * - 상태 아이콘 (정상/비정상)
 */

'use client'

interface BodyCompositionSectionProps {
  weight?: number
  bodyFatPercentage?: number
  muscle?: number
  skeletalMuscle?: number
  protein?: number
  bodyWater?: number
}

interface MetricRow {
  label: string
  value: string
  standard: string
  status: 'normal' | 'abnormal'
}

function BodyCompositionTable({ rows }: { rows: MetricRow[] }) {
  return (
    <div className="w-full border border-[#e5e7eb] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-[#e5e7eb]">
            <th className="text-left py-3 px-4 text-[12px] font-semibold text-[#000000] font-['Inter',sans-serif]">
              항목
            </th>
            <th className="text-center py-3 px-4 text-[12px] font-semibold text-[#000000] font-['Inter',sans-serif]">
              수치
            </th>
            <th className="text-center py-3 px-4 text-[12px] font-semibold text-[#000000] font-['Inter',sans-serif]">
              기준치
            </th>
            <th className="text-center py-3 px-4 text-[12px] font-semibold text-[#000000] font-['Inter',sans-serif]">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className={`border-b border-[#e5e7eb] last:border-b-0 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="py-3 px-4">
                <span className="text-[14px] font-medium text-[#000000] font-['Inter','Noto_Sans_KR',sans-serif]">
                  {row.label}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="text-[14px] font-medium text-[#000000] font-['Inter',sans-serif]">
                  {row.value}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="text-[14px] font-medium text-[#666666] font-['Inter',sans-serif]">
                  {row.standard}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`text-[14px] font-semibold ${
                    row.status === 'normal' ? 'text-[#4CAF50]' : 'text-[#F44336]'
                  } font-['Inter','Noto_Sans_KR',sans-serif]`}
                >
                  {row.status === 'normal' ? '정상' : '비정상'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface GraphData {
  label: string
  value: number
  percentage?: number
}

function BodyCompositionGraph({ data }: { data: GraphData[] }) {
  return (
    <div className="mt-6 space-y-3">
      {/* 그래프 헤더 */}
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-semibold text-[#000000] font-['Inter',sans-serif]">
          체성분 비교
        </h4>
      </div>

      {/* 막대 그래프 */}
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="relative">
            {/* 그래프 배경 */}
            <div className="h-6 w-full bg-[#E0E0E0] rounded-full overflow-hidden">
              {/* 데이터 막대 (주황색) */}
              <div
                className="h-6 rounded-full bg-[#FFA500]"
                style={{
                  width: `${item.percentage || 0}%`,
                minWidth: item.percentage ? '2px' : '0px',
                transition: 'width 0.3s ease-out'
                }}
              />
            </div>

            {/* 레이블 (기준치 점선) */}
            {item.percentage !== undefined && (
              <div
                className="h-6 border-t-2 border-dashed border-[#CCCCCC] top-0 absolute left-0 w-full"
                style={{
                  left: `${item.percentage}%`,
                }}
              />
            )}

            {/* 레이블 텍스트 */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-[12px] font-medium text-[#000000] font-['Inter',sans-serif]">
                {item.label}
              </span>
              <span className="text-[12px] font-medium text-[#666666] font-['Inter',sans-serif]">
                {item.value}
                {item.percentage && ` (${item.percentage}%)`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BodyCompositionSection({
  weight,
  bodyFatPercentage,
  muscle,
  skeletalMuscle,
  protein,
  bodyWater,
}: BodyCompositionSectionProps) {
  // 기본값 설정 (데모 데이터)
  const data = {
    weight: weight ?? 62.3,
    bodyFatPercentage: bodyFatPercentage ?? 18.5,
    muscle: muscle ?? 25.2,
    skeletalMuscle: skeletalMuscle ?? 32.9,
    protein: protein ?? 8.9,
    bodyWater: bodyWater ?? 40.5,
  }

  // 기준치 설정 (남성 기준)
  const standards = {
    weight: { min: 50, max: 75, label: '62.3kg' },
    bodyFatPercentage: { min: 10, max: 20, label: '18.5%' },
    muscle: { min: 20, max: 35, label: '25.2kg' },
    skeletalMuscle: { min: 28, max: 35, label: '32.9kg' },
    protein: { min: 6, max: 12, label: '8.9kg' },
    bodyWater: { min: 35, max: 45, label: '40.5kg' },
  }

  // 테이블 데이터 생성
  const getTableRows = (): MetricRow[] => {
    const rows: MetricRow[] = []

    // 체중
    rows.push({
      label: '체중',
      value: `${data.weight.toFixed(2)}kg`,
      standard: standards.weight.label,
      status: data.weight >= standards.weight.min && data.weight <= standards.weight.max ? 'normal' : 'abnormal',
    })

    // 체지방률
    rows.push({
      label: '체지방률',
      value: `${data.bodyFatPercentage.toFixed(2)}%`,
      standard: standards.bodyFatPercentage.label,
      status:
        data.bodyFatPercentage >= standards.bodyFatPercentage.min &&
        data.bodyFatPercentage <= standards.bodyFatPercentage.max
          ? 'normal'
          : 'abnormal',
    })

    // 근육량
    rows.push({
      label: '근육량',
      value: `${data.muscle.toFixed(2)}kg`,
      standard: standards.muscle.label,
      status:
        data.muscle >= standards.muscle.min && data.muscle <= standards.muscle.max ? 'normal' : 'abnormal',
    })

    // 골격근량
    rows.push({
      label: '골격근량',
      value: `${data.skeletalMuscle.toFixed(2)}kg`,
      standard: standards.skeletalMuscle.label,
      status:
        data.skeletalMuscle >= standards.skeletalMuscle.min &&
        data.skeletalMuscle <= standards.skeletalMuscle.max
          ? 'normal'
          : 'abnormal',
    })

    // 단백질
    rows.push({
      label: '단백질',
      value: `${data.protein.toFixed(2)}kg`,
      standard: standards.protein.label,
      status:
        data.protein >= standards.protein.min && data.protein <= standards.protein.max ? 'normal' : 'abnormal',
    })

    // 체수분
    rows.push({
      label: '체수분',
      value: `${data.bodyWater.toFixed(2)}kg`,
      standard: standards.bodyWater.label,
      status:
        data.bodyWater >= standards.bodyWater.min && data.bodyWater <= standards.bodyWater.max ? 'normal' : 'abnormal',
    })

    return rows
  }

  // 그래프 데이터 생성
  const getGraphData = (): GraphData[] => {
    const result: GraphData[] = []

    // 체지방률
    const bodyFatPercentage = (data.bodyFatPercentage || 0) / 100
    result.push({
      label: '체지방률',
      value: data.bodyFatPercentage ?? 0,
      percentage: bodyFatPercentage * 100,
    })

    // 근육량 (임의 기준치 30kg으로 계산)
    const musclePercentage = Math.min((data.muscle || 0) / 30 * 100)
    result.push({
      label: '근육량',
      value: data.muscle ?? 0,
      percentage: musclePercentage,
    })

    return result
  }

  const rows = getTableRows()
  const graphData = getGraphData()

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      {/* 제목 + 설명 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#000000] font-['Inter','Noto_Sans_KR',sans-serif]">
          체성분 분석
        </h3>
        <span className="text-xs text-[#666666] font-['Inter',sans-serif]">
          상세 데이터 및 비교
        </span>
      </div>

      {/* 테이블 */}
      <BodyCompositionTable rows={rows} />

      {/* 그래프 */}
      <BodyCompositionGraph data={graphData} />
    </div>
  )
}
