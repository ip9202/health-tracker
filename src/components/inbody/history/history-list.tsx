'use client'

/**
 * TAG-FE-004-HIST-001: HistoryList 컴포넌트
 * SPEC: SPEC-FE-004
 * DESCRIPTION: InBody 측정 기록 리스트 (실제 API 데이터 연동)
 */

import { useEffect, useState } from 'react'
import { Eye, Trash2, Calendar } from 'lucide-react'
import { fetchInBodyHistory, deleteInBodyRecord } from '@/lib/api/inbody-api'

interface HistoryRecord {
  id: string
  measuredAt: Date
  weight?: number | null
  muscle?: number | null
  skeletalMuscle?: number | null
  bodyFatPercentage?: number | null
  bmi?: number | null
}

export function HistoryList() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true)
        const response = await fetchInBodyHistory({ page, pageSize })
        setRecords(response.records as unknown as HistoryRecord[])
        setTotal(response.total)
      } catch (error) {
        console.error('Failed to load history:', error)
        setRecords([])
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [page])

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 기록을 삭제하시겠습니까?')) return

    try {
      await deleteInBodyRecord(id)
      const response = await fetchInBodyHistory({ page, pageSize })
      setRecords(response.records as unknown as HistoryRecord[])
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to delete record:', error)
      alert('기록 삭제에 실패했습니다.')
    }
  }

  const formatDate = (date: Date): string => {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const hasMoreRecords = page * pageSize < total

  const downloadCSV = () => {
    if (records.length === 0) return
    const headers = ['Date', 'Weight (kg)', 'Muscle Mass (kg)', 'Body Fat (%)', 'BMI']
    const rows = records.map(r => [
      formatDate(r.measuredAt),
      r.weight?.toFixed(1) ?? '--',
      (r.skeletalMuscle ?? r.muscle)?.toFixed(1) ?? '--',
      r.bodyFatPercentage?.toFixed(1) ?? '--',
      r.bmi?.toFixed(1) ?? '--',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inbody-history.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='flex flex-col gap-6 flex-1 min-h-0'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.44px] text-[#101828] font-['Inter',sans-serif]">
            Measurement History
          </h3>
          <p className='text-[16px] font-normal leading-6 tracking-[-0.31px] text-[#717182]'>
            {isLoading ? 'Loading...' : `Total ${total} records found`}
          </p>
        </div>

        <button
          onClick={downloadCSV}
          className='bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-lg h-8 px-3 flex items-center justify-center hover:bg-[#f9fafb] transition-colors disabled:opacity-50'
          disabled={records.length === 0}
        >
          <span className='text-[14px] font-medium leading-5 text-[#0a0a0a]'>
            Download CSV
          </span>
        </button>
      </div>

      <div className='flex flex-col gap-4 flex-1'>
        <div className='border border-[#f3f4f6] rounded-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-[#f9fafb]'>
                <tr className='border-b border-[rgba(0,0,0,0.1)]'>
                  <th className='text-left px-2 py-2.5 w-[150px]'>
                    <p className='text-[14px] font-medium leading-5 text-[#0a0a0a]'>Date</p>
                  </th>
                  <th className='text-left px-2 py-2.5 w-[215px]'>
                    <p className='text-[14px] font-medium leading-5 text-[#0a0a0a]'>Weight</p>
                  </th>
                  <th className='text-left px-2 py-2.5 w-[339px]'>
                    <p className='text-[14px] font-medium leading-5 text-[#0a0a0a]'>Muscle Mass</p>
                  </th>
                  <th className='text-left px-2 py-2.5 w-[304px]'>
                    <p className='text-[14px] font-medium leading-5 text-[#0a0a0a]'>Body Fat %</p>
                  </th>
                  <th className='text-left px-2 py-2.5 w-[150px]'>
                    <p className='text-[14px] font-medium leading-5 text-[#0a0a0a]'>BMI</p>
                  </th>
                  <th className='text-right px-2 py-2.5'>
                    <p className='text-[14px] font-medium leading-5 text-[#0a0a0a]'>Actions</p>
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className='px-2 py-8 text-center text-[#6a7282]'>
                      Loading history...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-2 py-8 text-center text-[#6a7282]'>
                      No records found. Upload an InBody result to get started.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record.id}
                      className='border-b border-[rgba(0,0,0,0.1)] hover:bg-[#f9fafb] transition-colors'
                    >
                      <td className='px-2 py-3'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='size-4 text-[#0a0a0a]' />
                          <p className='text-[14px] font-medium leading-5 text-[#0a0a0a]'>
                            {formatDate(record.measuredAt)}
                          </p>
                        </div>
                      </td>
                      <td className='px-2 py-3'>
                        <p className='text-[14px] font-normal leading-5 text-[#0a0a0a]'>
                          {record.weight ? `${record.weight.toFixed(1)} kg` : '--'}
                        </p>
                      </td>
                      <td className='px-2 py-3'>
                        <p className='text-[14px] font-normal leading-5 text-[#10b981]'>
                          {(record.skeletalMuscle ?? record.muscle) ? `${(record.skeletalMuscle ?? record.muscle)!.toFixed(1)} kg` : '--'}
                        </p>
                      </td>
                      <td className='px-2 py-3'>
                        <p className='text-[14px] font-normal leading-5 text-[#fb2c36]'>
                          {record.bodyFatPercentage ? `${record.bodyFatPercentage.toFixed(1)} %` : '--'}
                        </p>
                      </td>
                      <td className='px-2 py-3'>
                        <p className='text-[14px] font-normal leading-5 text-[#0a0a0a]'>
                          {record.bmi ? record.bmi.toFixed(1) : '--'}
                        </p>
                      </td>
                      <td className='px-2 py-3'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => alert('상세 보기 기능은 준비 중입니다.')}
                            className='size-8 rounded-lg flex items-center justify-center hover:bg-[#f3f4f6] transition-colors'
                            title='View'
                          >
                            <Eye className='size-4 text-[#0a0a0a]' />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className='size-8 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] transition-colors'
                            title='Delete'
                          >
                            <Trash2 className='size-4 text-[#0a0a0a]' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hasMoreRecords && (
          <button
            onClick={() => setPage(p => p + 1)}
            className='mx-auto px-4 py-2 rounded-lg hover:bg-[#f3f4f6] transition-colors'
          >
            <p className='text-[14px] font-medium leading-5 text-[#6a7282]'>
              Load More Records
            </p>
          </button>
        )}
      </div>
    </div>
  )
}
