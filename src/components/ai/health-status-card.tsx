/**
 * TAG-FE-005: AI 분석 결과 UI 컴포넌트
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템
 *
 * 건강 상태 카드 컴포넌트
 * 전체 건강 상태와 점수를 시각화
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';

interface HealthStatusCardProps {
  healthStatus: string;
  healthScore: number;
  isLoading?: boolean;
}

export function HealthStatusCard({
  healthStatus,
  healthScore,
  isLoading = false,
}: HealthStatusCardProps) {
  // 점수에 따른 색상 및 메시지
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 70) return 'bg-blue-600';
    if (score >= 50) return 'bg-yellow-600';
    if (score >= 30) return 'bg-orange-600';
    return 'bg-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            건강 상태 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-2 bg-gray-200 rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          건강 상태 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 건강 점수 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">건강 점수</span>
            <span className={`text-2xl font-bold ${getScoreColor(healthScore)}`}>
              {healthScore}
              <span className="text-sm text-gray-500">/100</span>
            </span>
          </div>
          <Progress value={healthScore} className="h-3">
            <div
              className={`h-full ${getProgressColor(healthScore)} transition-all`}
              style={{ width: `${healthScore}%` }}
            />
          </Progress>
        </div>

        {/* 건강 상태 메시지 */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">{healthStatus}</p>
        </div>
      </CardContent>
    </Card>
  );
}
