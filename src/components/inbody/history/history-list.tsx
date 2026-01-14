/**
 * TAG-FE-004-HIST-001: HistoryList 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 측정 기록 리스트 (Figma 디자인 적용)
 */

'use client'

import React from 'react'
import { Eye, Trash2, Calendar } from 'lucide-react'
import { Download } from 'lucide-react'

interface Record {
  id: string
  date: string
  weight: string
  muscleMass: string
  bodyFat: string
  bmi: string
}

const sampleHistory: Record[] = [
  {
    id: '1',
    date: '2024-06-15',
    weight: '69.5 kg',
    muscleMass: '34.2 kg',
    bodyFat: '15.8 %',
    bmi: '22.1',
  },
  {
    id: '2',
    date: '2024-05-10',
    weight: '70 kg',
    muscleMass: '33.8 kg',
    bodyFat: '16.2 %',
    bmi: '22.4',
  },
  {
    id: '3',
    date: '2024-04-12',
    weight: '70.5 kg',
    muscleMass: '33.8 kg',
    bodyFat: '16.8 %',
    bmi: '22.5',
  },
  {
    id: '4',
    date: '2024-03-15',
    weight: '71 kg',
    muscleMass: '33.5 kg',
    bodyFat: '17.2 %',
    bmi: '22.8',
  },
  {
    id: '5',
    date: '2024-02-14',
    weight: '71.8 kg',
    muscleMass: '33.2 kg',
    bodyFat: '18 %',
    bmi: '23',
  },
  {
    id: '6',
    date: '2024-01-10',
    weight: '72.5 kg',
    muscleMass: '33 kg',
    bodyFat: '18.5 %',
    bmi: '23.2',
  },
]

export function HistoryList() {
  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.44px] text-[#101828] font-['Inter',sans-serif]">
            Measurement History
          </h3>
          <p className="text-[16px] font-normal leading-6 tracking-[-0.31px] text-[#717182]">
            Total {sampleHistory.length} records found
          </p>
        </div>

        {/* Download CSV 버튼 */}
        <button className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-lg h-8 px-3 flex items-center justify-center hover:bg-[#f9fafb] transition-colors">
          <span className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
            Download CSV
          </span>
        </button>
      </div>

      {/* 카드 컨텐츠 */}
      <div className="flex flex-col gap-4 flex-1">
        {/* 테이블 */}
        <div className="border border-[#f3f4f6] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* 테이블 헤더 */}
              <thead className="bg-[#f9fafb]">
                <tr className="border-b border-[rgba(0,0,0,0.1)]">
                  <th className="text-left px-2 py-2.5 w-[150px]">
                    <p className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
                      Date
                    </p>
                  </th>
                  <th className="text-left px-2 py-2.5 w-[215px]">
                    <p className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
                      Weight
                    </p>
                  </th>
                  <th className="text-left px-2 py-2.5 w-[339px]">
                    <p className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
                      Muscle Mass
                    </p>
                  </th>
                  <th className="text-left px-2 py-2.5 w-[304px]">
                    <p className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
                      Body Fat %
                    </p>
                  </th>
                  <th className="text-left px-2 py-2.5 w-[150px]">
                    <p className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
                      BMI
                    </p>
                  </th>
                  <th className="text-right px-2 py-2.5">
                    <p className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
                      Actions
                    </p>
                  </th>
                </tr>
              </thead>

              {/* 테이블 바디 */}
              <tbody>
                {sampleHistory.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-[rgba(0,0,0,0.1)] hover:bg-[#f9fafb] transition-colors"
                  >
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-[#0a0a0a]" />
                        <p className="text-[14px] font-medium leading-5 text-[#0a0a0a]">
                          {record.date}
                        </p>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-[14px] font-normal leading-5 text-[#0a0a0a]">
                        {record.weight}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-[14px] font-normal leading-5 text-[#10b981]">
                        {record.muscleMass}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-[14px] font-normal leading-5 text-[#fb2c36]">
                        {record.bodyFat}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-[14px] font-normal leading-5 text-[#0a0a0a]">
                        {record.bmi}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button className="size-8 rounded-lg flex items-center justify-center hover:bg-[#f3f4f6] transition-colors" title="View">
                          <Eye className="size-4 text-[#0a0a0a]" />
                        </button>
                        <button className="size-8 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] transition-colors" title="Delete">
                          <Trash2 className="size-4 text-[#0a0a0a]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Load More 버튼 */}
        <button className="mx-auto px-4 py-2 rounded-lg hover:bg-[#f3f4f6] transition-colors">
          <p className="text-[14px] font-medium leading-5 text-[#6a7282]">
            Load More Records
          </p>
        </button>
      </div>
    </div>
  )
}
