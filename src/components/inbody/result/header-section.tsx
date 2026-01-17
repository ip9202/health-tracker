/**
 * InBody 결과지 헤더 섹션
 * Figma 디자인 그대로 구현
 * - InBody 로고 + 제목
 * - 날짜, 사용자 정보
 * - 주황색 출력 버튼
 */

'use client'

interface HeaderSectionProps {
  name?: string
  measuredAt?: Date
}

export function HeaderSection({ name = '미입력', measuredAt }: HeaderSectionProps) {
  // 날짜 포맷팅 (예: "2024. 01. 15")
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}. ${month}. ${day}.`
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
      {/* 왼쪽: 로고, 제목, 날짜, 사용자 */}
      <div className="flex items-center gap-3">
        {/* 로고 + 제목 */}
        <div className="flex items-center gap-2">
          {/* InBody 로고 (주황색 아이콘) */}
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 간단한 InBody 스타일 로고 */}
            <circle cx="12" cy="12" r="10" fill="#FFA500" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="white"
            >
              InB
            </text>
          </svg>

          <h2 className="text-[20px] font-bold leading-none text-gray-900 font-['Noto Sans KR',sans-serif]">
            측정 결과 보고서
          </h2>
        </div>

        {/* 날짜 + 사용자 정보 */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-['Inter',sans-serif]">
            {measuredAt ? formatDate(measuredAt) : '2024. 01. 15'}
          </span>
          <span className="text-gray-400">|</span>
          <span className="font-['Inter',sans-serif]">{name}</span>
        </div>
      </div>

      {/* 오른쪽: 출력 버튼 (주황색) */}
      <button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white text-[14px] font-medium px-4 py-2 rounded-lg font-['Inter',sans-serif] transition-colors">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17l7 7M7 7l-7 7"
            />
          </svg>
          <span>출력</span>
        </div>
      </button>
    </div>
  )
}
