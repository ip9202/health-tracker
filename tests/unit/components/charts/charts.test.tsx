import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { WeightChart } from '@/components/charts/weight-chart';
import { BodyCompositionChart } from '@/components/charts/body-composition-chart';
import { ScoreChart } from '@/components/charts/score-chart';
import { BMIChart } from '@/components/charts/bmi-chart';
import { ChartContainer } from '@/components/charts/chart-container';
import type { ChartDataPoint } from '@/lib/types/inbody';

// Mock shadcn/ui components
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-trigger">{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />,
}));

// Mock Recharts to avoid complex chart rendering in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ name }: { name?: string }) => <div data-testid="line">{name}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ name }: { name?: string }) => <div data-testid="bar">{name}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: ({ label }: { label?: { value: string } }) => (
    <div data-testid="y-axis">{label?.value}</div>
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockWeightData: ChartDataPoint[] = [
  { date: '2024-01-01', value: 70.5 },
  { date: '2024-01-02', value: 71.0 },
  { date: '2024-01-03', value: 70.8 },
];

const mockBodyCompositionData = [
  { date: '2024-01-01', bodyFatPercentage: 20.5, muscle: 35.0, skeletalMuscle: 30.0 },
  { date: '2024-01-02', bodyFatPercentage: 20.3, muscle: 35.5, skeletalMuscle: 30.2 },
  { date: '2024-01-03', bodyFatPercentage: 20.0, muscle: 36.0, skeletalMuscle: 30.5 },
];

const mockScoreData = [
  { date: '2024-01-01', score: 75 },
  { date: '2024-01-02', score: 78 },
  { date: '2024-01-03', score: 82 },
];

const mockBMIData: ChartDataPoint[] = [
  { date: '2024-01-01', value: 22.5 },
  { date: '2024-01-02', value: 22.7 },
  { date: '2024-01-03', value: 22.6 },
];

describe('WeightChart Component', () => {
  it('should render line chart with weight data', () => {
    render(<WeightChart data={mockWeightData} />);
    expect(screen.getByTestId('line-chart')).toBeDefined();
    expect(screen.getByTestId('line')).toBeDefined();
  });

  it('should display empty state when no data', () => {
    render(<WeightChart data={[]} />);
    expect(screen.getByText(/데이터가 없습니다/i)).toBeDefined();
  });

  it('should render responsive container', () => {
    render(<WeightChart data={mockWeightData} />);
    expect(screen.getByTestId('responsive-container')).toBeDefined();
  });

  it('should render with Korean labels', () => {
    render(<WeightChart data={mockWeightData} />);
    expect(screen.getAllByText(/체중/i).length).toBeGreaterThan(0);
  });
});

describe('BodyCompositionChart Component', () => {
  it('should render multi-line chart with body composition data', () => {
    render(<BodyCompositionChart data={mockBodyCompositionData} />);
    expect(screen.getByTestId('line-chart')).toBeDefined();
  });

  it('should display empty state when no data', () => {
    render(<BodyCompositionChart data={[]} />);
    expect(screen.getByText(/데이터가 없습니다/i)).toBeDefined();
  });

  it('should render three lines for bodyFatPercentage, muscle, skeletalMuscle', () => {
    render(<BodyCompositionChart data={mockBodyCompositionData} />);
    expect(screen.getAllByTestId('line').length).toBe(3);
  });

  it('should render with Korean labels', () => {
    render(<BodyCompositionChart data={mockBodyCompositionData} />);
    const labels = screen.getAllByTestId('line').map(el => el.textContent);
    expect(labels).toContain('체지방률 (%)');
    expect(labels).toContain('근육량 (kg)');
    expect(labels).toContain('골격근 (kg)');
  });
});

describe('ScoreChart Component', () => {
  it('should render bar chart with score data', () => {
    render(<ScoreChart data={mockScoreData} />);
    expect(screen.getByTestId('bar-chart')).toBeDefined();
    expect(screen.getByTestId('bar')).toBeDefined();
  });

  it('should display empty state when no data', () => {
    render(<ScoreChart data={[]} />);
    expect(screen.getByText(/데이터가 없습니다/i)).toBeDefined();
  });

  it('should render with Korean labels', () => {
    render(<ScoreChart data={mockScoreData} />);
    expect(screen.getAllByText(/신체 점수/i).length).toBeGreaterThan(0);
  });
});

describe('BMIChart Component', () => {
  it('should render line chart with BMI data', () => {
    render(<BMIChart data={mockBMIData} />);
    expect(screen.getByTestId('line-chart')).toBeDefined();
    expect(screen.getByTestId('line')).toBeDefined();
  });

  it('should display empty state when no data', () => {
    render(<BMIChart data={[]} />);
    expect(screen.getByText(/데이터가 없습니다/i)).toBeDefined();
  });

  it('should render with Korean labels', () => {
    render(<BMIChart data={mockBMIData} />);
    expect(screen.getAllByText(/BMI/i).length).toBeGreaterThan(0);
  });
});

describe('ChartContainer Component', () => {
  it('should render tabs for chart switching', () => {
    render(
      <ChartContainer>
        <div>Test Content</div>
      </ChartContainer>
    );
    expect(screen.getAllByText(/체중/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/체성분/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/점수/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BMI/i).length).toBeGreaterThan(0);
  });

  it('should show loading state when loading prop is true', () => {
    render(
      <ChartContainer loading>
        <div>Test Content</div>
      </ChartContainer>
    );
    expect(screen.getByTestId('chart-skeleton')).toBeDefined();
  });

  it('should show empty state when no data and not loading', () => {
    render(
      <ChartContainer hasData={false}>
        <div>Test Content</div>
      </ChartContainer>
    );
    expect(screen.getByText(/표시할 데이터가 없습니다/i)).toBeDefined();
  });

  it('should render children when not loading and has data', () => {
    render(
      <ChartContainer hasData loading={false}>
        <div data-testid="test-content">Test Content</div>
      </ChartContainer>
    );
    expect(screen.getAllByTestId('test-content').length).toBeGreaterThan(0);
  });
});
