/**
 * 추가 정보 섹션
 * Figma 디자인 그대로 구현
 * - 측정 조건 (시간, 장비, 측정자)
 * - 주요 지표 요약 (체중, BMI, 체지방률 카드)
 * - 안내 문구
 */

'use client'

interface AdditionalInfoSectionProps {
  // 추후 실제 데이터 사용 예정
  measuredAt?: Date
  measurementTime?: string
  device?: string
  measurer?: string
}

export function AdditionalInfoSection({
  measuredAt,
  measurementTime = '10:30',
  device = 'InBody 770',
  measurer = '김민준',
}: AdditionalInfoSectionProps) {
  // 날짜 포맷팅 (예: "2024년 01월 15일 화요일 10:30")
  const formatFullDate = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const dayOfWeek = days[d.getDay()]

    return `${year}년 ${month}월 ${day}일 ${dayOfWeek}`
  }

  // 데모 데이터
  const demoWeight = 62.3
  const demoBMI = 22.5
  const demoBodyFatPercentage = 18.5

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      {/* 제목 */}
      <div className="mb-4">
        <h3 className="text-[16px] font-bold text-[#000000] font-['Inter','Noto_Sans_KR',sans-serif]">
          추가 정보
        </h3>
      </div>

      {/* 2단 구조 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 왼쪽: 측정 조건 */}
        <div className="space-y-3">
          <div className="border border-[#e5e7eb] rounded-lg p-4 bg-gray-50">
            <h4 className="text-[14px] font-semibold text-[#000000] font-['Inter','Noto_Sans_KR',sans-serif] mb-3">
              측정 조건
            </h4>
            <div className="space-y-2 text-[14px] text-[#666666] font-['Inter',sans-serif]">
              <div className="flex justify-between">
                <span>측정 시간:</span>
                <span className="font-medium text-[#000000]">{measurementTime}</span>
              </div>
              <div className="flex justify-between">
                <span>측정 장비:</span>
                <span className="font-medium text-[#000000]">{device}</span>
              </div>
              <div className="flex justify-between">
                <span>측정자:</span>
                <span className="font-medium text-[#000000]">{measurer}</span>
              </div>
              <div className="flex justify-between">
                <span>측정일:</span>
                {measuredAt && (
                  <span className="font-medium text-[#000000]">
                    {formatFullDate(measuredAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 주요 지표 요약 */}
        <div className="space-y-3">
          <div>
            <h4 className="text-[14px] font-semibold text-[#000000] font-['Inter','Noto_Sans_KR',sans-serif] mb-3">
              주요 지표 요약
            </h4>

            {/* 지표 카드들 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 체중 카드 (주황색 배경) */}
              <div className="bg-[#FFA500] rounded-lg p-3 border border-[#e5e7eb]">
                <div className="text-xs text-[#FFFFFF] font-['Inter',sans-serif] font-medium mb-1">
                  체중
                </div>
                <div className="text-[24px] font-bold text-[#FFFFFF] font-['Inter',sans-serif]">
                  {demoWeight}
                  <span className="text-sm font-normal text-[#FFFBEB]">kg</span>
                </div>
              </div>

              {/* BMI 카드 */}
              <div className="bg-[#4CAF50] rounded-lg p-3 border border-[#e5e7eb]">
                <div className="text-xs text-[#FFFFFF] font-['Inter',sans-serif] font-medium mb-1">
                  BMI
                </div>
                <div className="text-[24px] font-bold text-[#FFFFFF] font-['Inter',sans-serif]">
                  {demoBMI}
                </div>
              </div>

              {/* 체지방률 카드 */}
              <div className="bg-[#F44336] rounded-lg p-3 border border-[#e5e7eb]">
                <div className="text-xs text-[#FFFFFF] font-['Inter',sans-serif] font-medium mb-1">
                  체지방률
                </div>
                <div className="text-[24px] font-bold text-[#FFFFFF] font-['Inter',sans-serif]">
                  {demoBodyFatPercentage}
                  <span className="text-sm font-normal text-[#FFFBEB]">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 안내 문구 */}
      <div className="mt-6 pt-4 border-t border-[#e5e7eb]">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-[#FFA500] flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v4m0 0h-8m4 8v4M3 21v4m0 0h-4m0 0h-4m0 0h4"
            />
          </svg>
          <p className="text-[13px] text-[#666666] font-['Inter','Noto Sans KR',sans-serif] leading-snug">
            측정 결과는 참고용으로, 전문가와 상담 후 활용하세요.
          </p>
        </div>
      </div>
    </div>
  )
}
