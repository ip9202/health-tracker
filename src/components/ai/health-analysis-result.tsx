/**
 * TAG-FE-005: AI 분석 결과 UI 컴포넌트
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템
 *
 * 통합 AI 분석 결과 컴포넌트
 * 모든 AI 분석 결과를 통합하여 표시
 */

'use client';

import { useState } from 'react';
import { HealthStatusCard } from './health-status-card';
import { RiskFactorList } from './risk-factor-list';
import { RecommendationCard } from './recommendation-card';
import { WarningAlert } from './warning-alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import type { HealthAnalysis } from '@/lib/ai-schemas';

interface HealthAnalysisResultProps {
  analysis: HealthAnalysis | null;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  recordId?: string;
}

export function HealthAnalysisResult({
  analysis,
  isLoading = false,
  onRefresh,
  recordId,
}: HealthAnalysisResultProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading && !analysis) {
    return (
      <div className="space-y-6">
        <HealthStatusCard healthStatus="" healthScore={0} isLoading />
        <RiskFactorList riskFactors={[]} isLoading />
        <RecommendationCard recommendations={[]} isLoading />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">AI 분석 결과가 없습니다</p>
        {onRefresh && (
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            분석 시작
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더: 재분석 버튼 */}
      {onRefresh && (
        <div className="flex justify-end">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            재분석
          </Button>
        </div>
      )}

      {/* 건강 상태 카드 */}
      <HealthStatusCard
        healthStatus={analysis.healthStatus}
        healthScore={analysis.healthScore}
      />

      {/* 위험 요소 리스트 */}
      <RiskFactorList riskFactors={analysis.riskFactors} />

      {/* 추천 사항 카드 */}
      <RecommendationCard recommendations={analysis.recommendations} />

      {/* 주의 사항 알림 */}
      {analysis.warnings.length > 0 && (
        <WarningAlert warnings={analysis.warnings} />
      )}

      {/* 분석 메타데이터 */}
      {recordId && (
        <div className="text-xs text-gray-400 text-right">
          분석 ID: {recordId.slice(0, 8)}...
        </div>
      )}
    </div>
  );
}
