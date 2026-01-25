import { describe, it, expect } from 'vitest';
import {
  RiskFactorSchema,
  RecommendationSchema,
  WarningSchema,
  HealthAnalysisSchema,
} from '@/lib/ai-schemas';

describe('TAG-AI-004: AI Schemas - Zod Validation', () => {
  describe('RiskFactorSchema', () => {
    it('should validate valid risk factor', () => {
      const validRiskFactor = {
        category: 'muscle' as const,
        level: 'high' as const,
        description: '골격근량이 평균보다 낮습니다',
      };

      const result = RiskFactorSchema.safeParse(validRiskFactor);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe('muscle');
        expect(result.data.level).toBe('high');
      }
    });

    it('should accept all valid category values', () => {
      const categories = ['muscle', 'fat', 'metabolism', 'weight'] as const;
      
      categories.forEach(category => {
        const result = RiskFactorSchema.safeParse({
          category,
          level: 'moderate' as const,
          description: 'Test description',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should accept all valid level values', () => {
      const levels = ['low', 'moderate', 'high'] as const;
      
      levels.forEach(level => {
        const result = RiskFactorSchema.safeParse({
          category: 'muscle' as const,
          level,
          description: 'Test description',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid category', () => {
      const result = RiskFactorSchema.safeParse({
        category: 'invalid',
        level: 'high' as const,
        description: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid level', () => {
      const result = RiskFactorSchema.safeParse({
        category: 'muscle' as const,
        level: 'critical',
        description: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing description', () => {
      const result = RiskFactorSchema.safeParse({
        category: 'muscle' as const,
        level: 'high' as const,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('RecommendationSchema', () => {
    it('should validate valid recommendation', () => {
      const validRecommendation = {
        type: 'exercise' as const,
        title: '스쿼트 운동',
        description: '하체 근력 강화를 위해 주 3회 스쿼트를 권장합니다',
        priority: 5,
      };

      const result = RecommendationSchema.safeParse(validRecommendation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('exercise');
        expect(result.data.priority).toBe(5);
      }
    });

    it('should accept all valid type values', () => {
      const types = ['exercise', 'nutrition', 'lifestyle'] as const;
      
      types.forEach(type => {
        const result = RecommendationSchema.safeParse({
          type,
          title: 'Test',
          description: 'Test description',
          priority: 3,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should enforce priority range (1-5)', () => {
      const validPriority = RecommendationSchema.safeParse({
        type: 'exercise' as const,
        title: 'Test',
        description: 'Test',
        priority: 1,
      });
      expect(validPriority.success).toBe(true);

      const invalidPriorityLow = RecommendationSchema.safeParse({
        type: 'exercise' as const,
        title: 'Test',
        description: 'Test',
        priority: 0,
      });
      expect(invalidPriorityLow.success).toBe(false);

      const invalidPriorityHigh = RecommendationSchema.safeParse({
        type: 'exercise' as const,
        title: 'Test',
        description: 'Test',
        priority: 6,
      });
      expect(invalidPriorityHigh.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const result = RecommendationSchema.safeParse({
        type: 'exercise' as const,
        title: 'Test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('WarningSchema', () => {
    it('should validate valid warning', () => {
      const validWarning = {
        severity: 'warning' as const,
        message: 'BMI가 정상 범위를 벗어납니다',
        actionable: true,
      };

      const result = WarningSchema.safeParse(validWarning);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.severity).toBe('warning');
        expect(result.data.actionable).toBe(true);
      }
    });

    it('should accept all valid severity values', () => {
      const severities = ['info', 'caution', 'warning'] as const;
      
      severities.forEach(severity => {
        const result = WarningSchema.safeParse({
          severity,
          message: 'Test warning',
          actionable: false,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid severity', () => {
      const result = WarningSchema.safeParse({
        severity: 'critical',
        message: 'Test',
        actionable: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('HealthAnalysisSchema', () => {
    const validHealthAnalysis = {
      healthStatus: '관리 필요',
      healthScore: 72,
      riskFactors: [
        {
          category: 'muscle' as const,
          level: 'moderate' as const,
          description: '골격근량이 약간 부족합니다',
        },
        {
          category: 'fat' as const,
          level: 'high' as const,
          description: '체지방율이 정상 범위를 초과합니다',
        },
      ],
      recommendations: [
        {
          type: 'exercise' as const,
          title: '근력 운동',
          description: '주 3회 근력 운동을 권장합니다',
          priority: 5,
        },
        {
          type: 'nutrition' as const,
          title: '단백질 섭취',
          description: '하루 1.2g/kg 체중단백질 섭취를 권장합니다',
          priority: 4,
        },
      ],
      warnings: [
        {
          severity: 'caution' as const,
          message: '급격한 체중 감량은 건강에 해로울 수 있습니다',
          actionable: true,
        },
      ],
    };

    it('should validate complete health analysis', () => {
      const result = HealthAnalysisSchema.safeParse(validHealthAnalysis);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.healthScore).toBe(72);
        expect(result.data.riskFactors).toHaveLength(2);
        expect(result.data.recommendations).toHaveLength(2);
        expect(result.data.warnings).toHaveLength(1);
      }
    });

    it('should enforce healthScore range (0-100)', () => {
      const invalidScoreLow = { ...validHealthAnalysis, healthScore: -1 };
      const resultLow = HealthAnalysisSchema.safeParse(invalidScoreLow);
      expect(resultLow.success).toBe(false);

      const invalidScoreHigh = { ...validHealthAnalysis, healthScore: 101 };
      const resultHigh = HealthAnalysisSchema.safeParse(invalidScoreHigh);
      expect(resultHigh.success).toBe(false);
    });

    it('should accept empty arrays for optional lists', () => {
      const minimalAnalysis = {
        healthStatus: '양호',
        healthScore: 85,
        riskFactors: [],
        recommendations: [],
        warnings: [],
      };

      const result = HealthAnalysisSchema.safeParse(minimalAnalysis);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidAnalysis = {
        healthStatus: '양호',
        // missing healthScore
        riskFactors: [],
        recommendations: [],
        warnings: [],
      };

      const result = HealthAnalysisSchema.safeParse(invalidAnalysis);
      expect(result.success).toBe(false);
    });

    it('should validate nested schemas', () => {
      const invalidNested = {
        healthStatus: '양호',
        healthScore: 85,
        riskFactors: [
          {
            category: 'invalid' as const, // Invalid category
            level: 'high' as const,
            description: 'Test',
          },
        ],
        recommendations: [],
        warnings: [],
      };

      const result = HealthAnalysisSchema.safeParse(invalidNested);
      expect(result.success).toBe(false);
    });
  });
});
