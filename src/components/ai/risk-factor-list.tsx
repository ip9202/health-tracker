/**
 * TAG-FE-005: AI 분석 결과 UI 컴포넌트
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템
 *
 * 위험 요소 리스트 컴포넌트
 * 건강 위험 요소를 카테고리별로 시각화
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';
import type { RiskFactor } from '@/lib/ai-schemas';

interface RiskFactorListProps {
  riskFactors: RiskFactor[];
  isLoading?: boolean;
}

export function RiskFactorList({ riskFactors, isLoading = false }: RiskFactorListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>위험 요소</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (riskFactors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-green-600" />
            위험 요소
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            현재 특별한 위험 요소가 없습니다. 건강한 상태를 유지하세요!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      muscle: '근육',
      fat: '체지방',
      metabolism: '대사',
      weight: '체중',
    };
    return labels[category] || category;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      high: '높음',
      moderate: '중간',
      low: '낮음',
    };
    return labels[level] || level;
  };

  const getCategoryIcon = (category: string) => {
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          위험 요소
          <Badge variant="secondary" className="ml-2">
            {riskFactors.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {riskFactors.map((factor, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(factor.category)}
                  <span className="font-medium text-sm">
                    {getCategoryLabel(factor.category)}
                  </span>
                </div>
                <Badge className={getLevelColor(factor.level)} variant="outline">
                  {getLevelLabel(factor.level)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{factor.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
