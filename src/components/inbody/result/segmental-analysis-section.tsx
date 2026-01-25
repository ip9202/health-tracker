/**
 * 분할 분석 (근육/지방) 섹션
 * Figma 디자인 그대로 구현
 */

'use client'

interface SegmentalAnalysisProps {
  // 추후 분할 분석 데이터 추가 가능
}

export function SegmentalAnalysisSection({}: SegmentalAnalysisProps) {
  return (
    <div className="bg-white border border-[#f3f4f6] border-solid relative rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-full">
      {/* 헤딩 */}
      <div className="absolute border-[#fe9a00] border-l-4 border-solid h-[28px] left-[20px] top-[20px] w-[calc(100%-40px)]">
        <p className="absolute css-ew64yg font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[28px] left-[12px] not-italic text-[#1e2939] text-[18px] top-0 tracking-[-0.4395px]">
          분할 분석 (근육 / 지방)
        </p>
      </div>

      {/* 범례 */}
      <div className="absolute h-[16px] left-[20px] top-[504.5px] w-[200px] flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-[#1e2939] rounded-[16777200px] size-[8px]" />
          <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px]">
            근육량
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#99a1af] rounded-[16777200px] size-[8px]" />
          <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px]">
            체지방량
          </p>
        </div>
      </div>

      {/* 인체 형태 시각화 + 데이터 카드 영역 */}
      <div className="relative h-[520px] w-full flex items-center justify-center">
        {/* 중앙 컨테이너 */}
        <div className="relative h-[384px] w-[192px]">
          {/* 머리 (상단 중앙) */}
          <div className="absolute bg-[#fef3c6] border-4 border-solid border-white left-[64px] rounded-[16777200px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] size-16 top-0" />

          {/* 몸통 (ABS) */}
          <div className="absolute bg-[#fee685] border-4 border-solid border-white content-stretch flex items-center justify-center left-[56px] pl-[4px] pr-[4px] py-[4px] rounded-[32px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] h-[160px] top-[70px] w-[80px]">
            <div className="h-[40px] relative w-full">
              <p className="font-['Inter',sans-serif] font-black leading-[40px] not-italic text-[36px] text-[rgba(151,60,0,0.2)] text-center top-[0.5px] tracking-[0.3691px]">
                ABS
              </p>
            </div>
          </div>

          {/* 트렁크 데이터 카드 (상단 중앙, 파란색 테두리) */}
          <div className="absolute bg-[rgba(255,255,255,0.95)] border border-[#e5e7eb] border-solid content-stretch flex flex-col gap-[4px] h-[93px] items-start left-[-161px] pb-px pt-[7px] px-[7px] rounded-[10px] shadow-[0px_0px_0px_2px_#fef3c6,0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[13px] w-[112px]">
            <div className="border-[#f3f4f6] border-b border-solid content-stretch flex h-[21px] items-center justify-between pb-px pt-0 px-0 relative shrink-0 w-full">
              <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[16px] not-italic text-[#364153] text-[12px]">
                트렁크
              </p>
              <div className="bg-[#dcfce7] h-[12px] relative rounded-[4px] shrink-0 w-[23.57px]">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[12px] left-[4px] not-italic text-[#008236] text-[9px] top-[0.5px] tracking-[0.167px]">
                  표준
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px]">
                  근육
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] left-0 not-italic text-[#1e2939] text-[12px]">
                  25.2kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] left-0 not-italic text-[#99a1af] text-[9px] tracking-[0.167px] w-[40px]">
                (104.3%)
              </p>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px]">
                  지방
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] left-0 not-italic text-[#1e2939] text-[12px]">
                  4.0kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] left-0 not-italic text-[#99a1af] text-[9px] tracking-[0.167px] w-[35px]">
                (94.1%)
              </p>
            </div>
          </div>

          {/* 왼팔 데이터 카드 (왼쪽 상단) */}
          <div className="absolute bg-[rgba(255,255,255,0.95)] border border-[#e5e7eb] border-solid content-stretch flex flex-col gap-[4px] h-[93px] items-start left-[-161px] pb-px pt-[7px] px-[7px] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[13px] w-[112px]">
            <div className="border-[#f3f4f6] border-b border-solid content-stretch flex h-[21px] items-center justify-between pb-px pt-0 px-0 relative shrink-0 w-full">
              <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[16px] not-italic text-[#364153] text-[12px] text-right w-full">
                왼팔
              </p>
              <div className="bg-[#dcfce7] h-[12px] relative rounded-[4px] shrink-0 w-[23.57px]">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[12px] left-[20px] not-italic text-[#008236] text-[9px] text-right top-[0.5px] tracking-[0.167px]">
                  표준
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px] text-right">
                  근육
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#1e2939] text-[12px] text-right">
                  3.2kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] not-italic text-[#99a1af] text-[9px] text-right tracking-[0.167px] w-[39px] ml-auto">
                (107.6%)
              </p>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px] text-right">
                  지방
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#1e2939] text-[12px] text-right">
                  0.3kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] not-italic text-[#99a1af] text-[9px] text-right tracking-[0.167px] w-[36px] ml-auto">
                (48.5%)
              </p>
            </div>
          </div>

          {/* 오른팔 데이터 카드 (오른쪽 상단) */}
          <div className="absolute bg-[rgba(255,255,255,0.95)] border border-[#e5e7eb] border-solid content-stretch flex flex-col gap-[4px] h-[93px] items-start left-[220px] pb-px pt-[7px] px-[7px] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[11px] w-[112px]">
            <div className="border-[#f3f4f6] border-b border-solid content-stretch flex h-[21px] items-center justify-between pb-px pt-0 px-0 relative shrink-0 w-full">
              <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[16px] not-italic text-[#364153] text-[12px]">
                오른팔
              </p>
              <div className="bg-[#dcfce7] h-[12px] relative rounded-[4px] shrink-0 w-[23.57px]">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[12px] left-[4px] not-italic text-[#008236] text-[9px] top-[0.5px] tracking-[0.167px]">
                  표준
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px]">
                  근육
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#1e2939] text-[12px]">
                  3.2kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] not-italic text-[#99a1af] text-[9px] tracking-[0.167px] w-[39px]">
                (107.3%)
              </p>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px]">
                  지방
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#1e2939] text-[12px]">
                  0.3kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] not-italic text-[#99a1af] text-[9px] tracking-[0.167px] w-[34px]">
                (51.6%)
              </p>
            </div>
          </div>

          {/* 왼쪽 다리 데이터 카드 (왼쪽 하단) */}
          <div className="absolute bg-[rgba(255,255,255,0.95)] border border-[#e5e7eb] border-solid content-stretch flex flex-col gap-[4px] h-[93px] items-start left-[-159px] pb-px pt-[7px] px-[7px] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[256px] w-[112px]">
            <div className="border-[#f3f4f6] border-b border-solid content-stretch flex h-[21px] items-center justify-between pb-px pt-0 px-0 relative shrink-0 w-full">
              <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[16px] not-italic text-[#364153] text-[12px] text-right w-full">
                왼쪽 다리
              </p>
              <div className="bg-[#dcfce7] h-[12px] relative rounded-[4px] shrink-0 w-[23.57px]">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[12px] left-[20px] not-italic text-[#008236] text-[9px] text-right top-[0.5px] tracking-[0.167px]">
                  표준
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px] text-right">
                  근육
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#1e2939] text-[12px] text-right">
                  9.5kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] not-italic text-[#99a1af] text-[9px] text-right tracking-[0.167px] w-[39px] ml-auto">
                (112.3%)
              </p>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px] text-right">
                  지방
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#1e2939] text-[12px] text-right">
                  1.6kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] not-italic text-[#99a1af] text-[9px] text-right tracking-[0.167px] w-[36px] ml-auto">
                (93.9%)
              </p>
            </div>
          </div>

          {/* 오른쪽 다리 데이터 카드 (오른쪽 하단) */}
          <div className="absolute bg-[rgba(255,255,255,0.95)] border border-[#e5e7eb] border-solid content-stretch flex flex-col gap-[4px] h-[93px] items-start left-[220px] pb-px pt-[7px] px-[7px] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[253px] w-[112px]">
            <div className="border-[#f3f4f6] border-b border-solid content-stretch flex h-[21px] items-center justify-between pb-px pt-0 px-0 relative shrink-0 w-full">
              <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[16px] not-italic text-[#364153] text-[12px]">
                오른쪽 다리
              </p>
              <div className="bg-[#dcfce7] h-[12px] relative rounded-[4px] shrink-0 w-[23.57px]">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-bold leading-[12px] left-[4px] not-italic text-[#008236] text-[9px] top-[0.5px] tracking-[0.167px]">
                  표준
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px]">
                  근육
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#1e2939] text-[12px]">
                  9.5kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] not-italic text-[#99a1af] text-[9px] tracking-[0.167px] w-[39px]">
                (112.4%)
              </p>
            </div>
            <div className="content-stretch flex flex-col h-[25px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex h-[16px] items-center justify-between relative shrink-0 w-full">
                <p className="font-['Inter','Noto_Sans_KR',sans-serif] font-normal leading-[16px] not-italic text-[#99a1af] text-[12px]">
                  지방
                </p>
                <p className="font-['Inter',sans-serif] font-bold leading-[16px] not-italic text-[#1e2939] text-[12px]">
                  1.5kg
                </p>
              </div>
              <p className="font-['Inter',sans-serif] font-normal leading-[9px] not-italic text-[#99a1af] text-[9px] tracking-[0.167px] w-[36px]">
                (93.6%)
              </p>
            </div>
          </div>

          {/* 상체 팔 부위 시각화 */}
          <div className="absolute h-[144px] left-[-37px] top-[-0.28px] w-[96px] flex items-center justify-center">
            <div className="rotate-[15deg]">
              <div className="bg-[#fef3c6] border-2 border-solid border-white h-[131.921px] rounded-[16777200px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-[64.038px]" />
            </div>
          </div>
          <div className="absolute h-[144px] left-[131px] top-[-16.86px] w-[96px] flex items-center justify-center">
            <div className="rotate-[345deg]">
              <div className="bg-[#fef3c6] border-2 border-solid border-white h-[131.921px] rounded-[16777200px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-[64.038px]" />
            </div>
          </div>

          {/* 하체 다리 부위 시각화 */}
          <div className="absolute h-[166.251px] left-[36.93px] top-[215px] w-[63.784px] flex items-center justify-center">
            <div className="rotate-[5deg]">
              <div className="bg-[#fef3c6] border-2 border-solid border-white h-[162.529px] rounded-[16777200px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-[49.808px]" />
            </div>
          </div>
          <div className="absolute h-[166.251px] left-[91.1px] top-[215px] w-[63.784px] flex items-center justify-center">
            <div className="rotate-[355deg]">
              <div className="bg-[#fef3c6] border-2 border-solid border-white h-[162.529px] rounded-[16777200px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] w-[49.808px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
