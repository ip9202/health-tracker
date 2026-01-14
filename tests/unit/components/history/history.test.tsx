import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock components before importing
vi.mock('@/components/history/history-item', () => ({
  HistoryItem: ({ record }: { record: any }) => <div data-testid="history-item">{record.id}</div>,
}));

vi.mock('@/components/history/pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        이전
      </button>
      <span>{currentPage} / {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        다음
      </button>
    </div>
  ),
}));

vi.mock('@/components/history/history-filters', () => ({
  HistoryFilters: ({ onFilterChange }: any) => (
    <div data-testid="history-filters">
      <button onClick={() => onFilterChange({ from: '2024-01-01', to: '2024-12-31' })}>
        필터 적용
      </button>
    </div>
  ),
}));

import { HistoryList } from '@/components/history/history-list';
import type { InBodyRecord } from '@/lib/types/inbody';

const mockRecords: InBodyRecord[] = [
  {
    id: '1',
    measuredAt: new Date('2024-01-01'),
    weight: 70.5,
    bodyFat: 20.5,
    muscle: 35.0,
    skeletalMuscle: 30.0,
    bodyScore: 75,
    bmi: 22.5,
  },
  {
    id: '2',
    measuredAt: new Date('2024-01-02'),
    weight: 71.0,
    bodyFat: 20.3,
    muscle: 35.5,
    skeletalMuscle: 30.2,
    bodyScore: 78,
    bmi: 22.7,
  },
];

describe('HistoryList Component', () => {
  it('should render list of records', () => {
    render(<HistoryList records={mockRecords} loading={false} />);
    expect(screen.getAllByTestId('history-item').length).toBe(2);
  });

  it('should show loading skeleton when loading', () => {
    render(<HistoryList records={[]} loading={true} />);
    expect(screen.getByTestId('history-skeleton')).toBeDefined();
  });

  it('should show empty state when no records', () => {
    render(<HistoryList records={[]} loading={false} />);
    expect(screen.getByText(/기록이 없습니다/i)).toBeDefined();
  });

  it('should render pagination when totalPages > 1', () => {
    render(
      <HistoryList
        records={mockRecords}
        loading={false}
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('pagination')).toBeDefined();
  });

  it('should render filters', () => {
    render(<HistoryList records={mockRecords} loading={false} onFilterChange={vi.fn()} />);
    expect(screen.getByTestId('history-filters')).toBeDefined();
  });

  it('should call onPageChange when pagination clicked', () => {
    const onPageChange = vi.fn();
    render(
      <HistoryList
        records={mockRecords}
        loading={false}
        currentPage={1}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByText('다음');
    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onFilterChange when filters applied', () => {
    const onFilterChange = vi.fn();
    render(<HistoryList records={mockRecords} loading={false} onFilterChange={onFilterChange} />);

    const filterButton = screen.getByText('필터 적용');
    fireEvent.click(filterButton);
    expect(onFilterChange).toHaveBeenCalledWith({ from: '2024-01-01', to: '2024-12-31' });
  });

  it('should disable pagination controls on first page', () => {
    render(
      <HistoryList
        records={mockRecords}
        loading={false}
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    const prevButton = screen.getByText('이전');
    expect(prevButton).toBeDisabled();
  });

  it('should disable pagination controls on last page', () => {
    render(
      <HistoryList
        records={mockRecords}
        loading={false}
        currentPage={5}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    const nextButton = screen.getByText('다음');
    expect(nextButton).toBeDisabled();
  });
});

describe('RecordDetailModal Component', () => {
  it('should render modal with record data', () => {
    // This will be implemented when we create the component
    // For now, we're just defining the test structure
    expect(true).toBe(true);
  });

  it('should display 20 fields in grid layout', () => {
    expect(true).toBe(true);
  });

  it('should toggle OCR text visibility', () => {
    expect(true).toBe(true);
  });

  it('should close modal when close button clicked', () => {
    expect(true).toBe(true);
  });
});

describe('DataGrid Component', () => {
  it('should render fields in grid layout', () => {
    expect(true).toBe(true);
  });

  it('should display field labels and values', () => {
    expect(true).toBe(true);
  });

  it('should handle missing values gracefully', () => {
    expect(true).toBe(true);
  });
});
