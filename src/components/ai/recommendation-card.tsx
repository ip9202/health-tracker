/**
 * TAG-FE-005: AI 분석 결과 UI 컴포넌트
 * SPEC-AI-001: AI 기반 건강 분석 및 추천 시스템
 *
 * 추천 항목 카드 컴포넌트
 * 운동, 영양, 생활 습관 추천을 우선순위별로 표시
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Dumbbell, Apple, Heart } from 'lucide-react';
import type { Recommendation } from '@/lib/ai-schemas';

interface RecommendationCardProps {
  recommendations: Recommendation[];
  isLoading?: boolean;
}

export function RecommendationCard({
  recommendations,
  isLoading = false,
}: RecommendationCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>추천 사항</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-600" />
            추천 사항
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            현재 특별한 추천 사항이 없습니다. 현재 건강 관리를 잘 유지하고 있습니다!
          </p>
        </CardContent>
      </Card>
    );
  }

  // 우선순위별 정렬
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => b.priority - a.priority
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return <Dumbbell className="h-4 w-4" />;
      case 'nutrition':
        return <Apple className="h-4 w-4" />;
      case 'lifestyle':
        return <Heart className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      exercise: '운동',
      nutrition: '영양',
      lifestyle: '생활 습관',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exercise':
        return 'bg-blue-100 text-blue-800';
      case 'nutrition':
        return 'bg-green-100 text-green-800';
      case 'lifestyle':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 5) return '매우 중요';
    if (priority >= 4) return '중요';
    if (priority >= 3) return '권장';
    return '참고';
  };

  const getPriorityVariant = (priority: number): "default" | "secondary" | "destructive" | "outline" => {
    if (priority >= 5) return 'destructive';
    if (priority >= 4) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          추천 사항
          <Badge variant="secondary" className="ml-2">
            {recommendations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRecommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {getTypeIcon(rec.type)}
                  <h4 className="font-semibold text-sm flex-1">{rec.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(rec.type)} variant="outline">
                    {getTypeLabel(rec.type)}
                  </Badge>
                  <Badge variant={getPriorityVariant(rec.priority)}>
                    {getPriorityLabel(rec.priority)}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 pl-6">{rec.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
