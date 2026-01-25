/**
 * TAG-FE-005: AI 분석 결과 UI 컴포넌트
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템
 *
 * 주의 사항 알림 컴포넌트
 * 건강 관련 주의 사항을 심각도별로 표시
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Warning } from '@/lib/ai-schemas';

interface WarningAlertProps {
  warnings: Warning[];
  isLoading?: boolean;
}

export function WarningAlert({ warnings, isLoading = false }: WarningAlertProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>주의 사항</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (warnings.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'caution':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (
    severity: string
  ): 'default' | 'destructive' | null => {
    switch (severity) {
      case 'warning':
        return 'destructive';
      case 'caution':
      case 'info':
      default:
        return 'default';
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      warning: '경고',
      caution: '주의',
      info: '안내',
    };
    return labels[severity] || severity;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'border-red-200 bg-red-50';
      case 'caution':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          주의 사항
          <span className="text-sm font-normal text-gray-500">
            ({warnings.length}건)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {warnings.map((warning, index) => (
            <Alert
              key={index}
              variant={getSeverityVariant(warning.severity)}
              className={getSeverityColor(warning.severity)}
            >
              {getSeverityIcon(warning.severity)}
              <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
                {getSeverityLabel(warning.severity)}
                {warning.actionable && (
                  <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
                    조치 가능
                  </span>
                )}
              </AlertTitle>
              <AlertDescription className="text-sm mt-1">
                {warning.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>

        {/* 면책 조항 */}
        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          <p>
            ⚠️ 이 분석 결과는 일반적인 건강 지침을 제공합니다. 의료 전문가의
            진단을 대체하지 않으며, 개별적인 건강 상황에 따라 달라질 수 있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
