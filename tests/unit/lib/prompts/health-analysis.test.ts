import { describe, it, expect } from 'vitest';
import { generateHealthAnalysisPrompt, formatInBodyData } from '@/lib/prompts/health-analysis';

describe('TAG-AI-003: AI Prompt Engineering', () => {
  describe('formatInBodyData', () => {
    it('should format complete InBody data', () => {
      const inbodyData = {
        weight: 70.5,
        height: 175,
        bmi: 23.0,
        bodyFatPercentage: 18.5,
        skeletalMuscle: 32.5,
        calorieNeeds: 1800,
      };

      const formatted = formatInBodyData(inbodyData);
      
      expect(formatted).toContain('70.5kg');
      expect(formatted).toContain('175cm');
      expect(formatted).toContain('23.0');
      expect(formatted).toContain('18.5%');
      expect(formatted).toContain('32.5kg');
      expect(formatted).toContain('1800kcal');
    });

    it('should handle null/undefined values gracefully', () => {
      const inbodyData = {
        weight: null,
        height: undefined,
        bmi: 0,
        bodyFatPercentage: null,
        skeletalMuscle: undefined,
        calorieNeeds: 0,
      };

      const formatted = formatInBodyData(inbodyData);
      
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format with historical data when available', () => {
      const inbodyData = {
        weight: 70.5,
        height: 175,
        bmi: 23.0,
        bodyFatPercentage: 18.5,
        skeletalMuscle: 32.5,
        calorieNeeds: 1800,
      };

      const historicalData = [
        { weight: 72.0, bodyFatPercentage: 19.5, date: '2025-10-01' },
        { weight: 71.2, bodyFatPercentage: 19.0, date: '2025-11-01' },
      ];

      const formatted = formatInBodyData(inbodyData, historicalData);
      
      expect(formatted).toContain('추이 데이터');
      expect(formatted).toContain('72.0kg');
      expect(formatted).toContain('19.5%');
    });
  });

  describe('generateHealthAnalysisPrompt', () => {
    it('should generate complete prompt with InBody data', () => {
      const inbodyData = {
        weight: 70.5,
        height: 175,
        bmi: 23.0,
        bodyFatPercentage: 18.5,
        skeletalMuscle: 32.5,
        calorieNeeds: 1800,
      };

      const prompt = generateHealthAnalysisPrompt(inbodyData);
      
      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
    });

    it('should include system prompt', () => {
      const inbodyData = {
        weight: 70.5,
        height: 175,
        bmi: 23.0,
        bodyFatPercentage: 18.5,
        skeletalMuscle: 32.5,
        calorieNeeds: 1800,
      };

      const prompt = generateHealthAnalysisPrompt(inbodyData);
      
      expect(prompt).toContain('건강 분석');
      expect(prompt).toContain('운동 추천');
    });

    it('should include JSON format requirement', () => {
      const inbodyData = {
        weight: 70.5,
        height: 175,
        bmi: 23.0,
        bodyFatPercentage: 18.5,
        skeletalMuscle: 32.5,
        calorieNeeds: 1800,
      };

      const prompt = generateHealthAnalysisPrompt(inbodyData);
      
      expect(prompt).toContain('JSON');
    });

    it('should include medical disclaimer', () => {
      const inbodyData = {
        weight: 70.5,
        height: 175,
        bmi: 23.0,
        bodyFatPercentage: 18.5,
        skeletalMuscle: 32.5,
        calorieNeeds: 1800,
      };

      const prompt = generateHealthAnalysisPrompt(inbodyData);
      
      expect(prompt).toContain('의료 전문가');
      expect(prompt).toContain('진단');
    });

    it('should include historical data when provided', () => {
      const inbodyData = {
        weight: 70.5,
        height: 175,
        bmi: 23.0,
        bodyFatPercentage: 18.5,
        skeletalMuscle: 32.5,
        calorieNeeds: 1800,
      };

      const historicalData = [
        { weight: 72.0, bodyFatPercentage: 19.5, date: '2025-10-01' },
      ];

      const prompt = generateHealthAnalysisPrompt(inbodyData, historicalData);
      
      expect(prompt).toContain('추이');
    });
  });
});
