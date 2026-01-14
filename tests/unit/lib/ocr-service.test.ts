import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractTextFromImage,
  OCRError,
  isLowConfidence,
  hasMeaningfulText,
} from '@/lib/ocr-service';

// Tesseract.js 모킹
vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn(),
  },
}));

import Tesseract from 'tesseract.js';

describe('OCR Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractTextFromImage', () => {
    it('성공적으로 텍스트를 추출해야 한다', async () => {
      const mockText = '홍길동\n남\n30세\n175cm\n70kg';
      const mockConfidence = 95.5;

      vi.mocked(Tesseract.recognize).mockResolvedValue({
        data: {
          text: mockText,
          confidence: mockConfidence,
        },
      } as never);

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.text).toBe(mockText);
      expect(result.confidence).toBe(mockConfidence);
      expect(Tesseract.recognize).toHaveBeenCalledTimes(1);
      expect(Tesseract.recognize).toHaveBeenCalledWith(
        '/path/to/image.jpg',
        'kor+eng',
        expect.any(Object),
      );
    });

    it('낮은 신뢰도일 때 에러를 발생시켜야 한다', async () => {
      const mockConfidence = 30.0; // 기본 최소 신뢰도 50% 미만

      vi.mocked(Tesseract.recognize).mockResolvedValue({
        data: {
          text: '일부 텍스트',
          confidence: mockConfidence,
        },
      } as never);

      await expect(
        extractTextFromImage('/path/to/image.jpg', {
          maxRetries: 1, // 재시도 횟수 줄임
        }),
      ).rejects.toThrow('OCR 신뢰도가 낮습니다');
    });

    it('재시도 로직이 작동해야 한다', async () => {
      // 첫 번째와 두 번째 시도는 실패, 세 번째는 성공
      vi.mocked(Tesseract.recognize)
        .mockRejectedValueOnce(new Error('네트워크 오류'))
        .mockRejectedValueOnce(new Error('타임아웃'))
        .mockResolvedValueOnce({
          data: {
            text: '성공한 텍스트',
            confidence: 85.0,
          },
        } as never);

      const result = await extractTextFromImage('/path/to/image.jpg', {
        maxRetries: 3,
      });

      expect(result.text).toBe('성공한 텍스트');
      expect(Tesseract.recognize).toHaveBeenCalledTimes(3);
    }, 15000); // 타임아웃 15초

    it('최대 재시도 횟수를 초과하면 에러를 발생시켜야 한다', async () => {
      vi.mocked(Tesseract.recognize).mockRejectedValue(new Error('영구적 오류'));

      await expect(
        extractTextFromImage('/path/to/image.jpg', {
          maxRetries: 2,
        }),
      ).rejects.toThrow('OCR 처리 실패');

      // maxRetries: 2 = 첫 시도 + 1번 재시도 = 총 2번 시도
      expect(Tesseract.recognize).toHaveBeenCalledTimes(2);
    });

    it('타임아웃이 작동해야 한다', async () => {
      vi.mocked(Tesseract.recognize).mockImplementation(
        () =>
          new Promise((resolve) => {
            // 절대 해결되지 않는 Promise
            setTimeout(() => resolve({} as never), 60000);
          }),
      );

      await expect(
        extractTextFromImage('/path/to/image.jpg', {
          timeout: 100, // 100ms 타임아웃
        }),
      ).rejects.toThrow('OCR timeout');
    }, 10000);

    it('최소 신뢰도 설정을 커스터마이즈할 수 있어야 한다', async () => {
      const mockConfidence = 40.0;

      vi.mocked(Tesseract.recognize).mockResolvedValue({
        data: {
          text: '텍스트',
          confidence: mockConfidence,
        },
      } as never);

      // 최소 신뢰도를 30%로 낮춤
      const result = await extractTextFromImage('/path/to/image.jpg', {
        minConfidence: 30,
      });

      expect(result.confidence).toBe(mockConfidence);
    });

    it('빈 텍스트를 반환할 수 있어야 한다', async () => {
      vi.mocked(Tesseract.recognize).mockResolvedValue({
        data: {
          text: '   \n\n   ', // 공백만
          confidence: 85.0,
        },
      } as never);

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.text).toBe(''); // trim 된 빈 문자열
    });
  });

  describe('isLowConfidence', () => {
    it('신뢰도가 낮으면 true를 반환해야 한다', () => {
      expect(isLowConfidence(30)).toBe(true);
      expect(isLowConfidence(49)).toBe(true);
    });

    it('신뢰도가 충분하면 false를 반환해야 한다', () => {
      expect(isLowConfidence(50)).toBe(false);
      expect(isLowConfidence(80)).toBe(false);
      expect(isLowConfidence(100)).toBe(false);
    });

    it('커스텀 임계값을 사용할 수 있어야 한다', () => {
      expect(isLowConfidence(40, 50)).toBe(true);
      expect(isLowConfidence(40, 30)).toBe(false);
    });
  });

  describe('hasMeaningfulText', () => {
    it('의미 있는 텍스트가 있으면 true를 반환해야 한다', () => {
      expect(hasMeaningfulText('Hello World')).toBe(true);
      expect(hasMeaningfulText('홍길동')).toBe(true);
      expect(hasMeaningfulText('a')).toBe(true);
    });

    it('빈 문자열이면 false를 반환해야 한다', () => {
      expect(hasMeaningfulText('')).toBe(false);
    });

    it('공백만 있으면 false를 반환해야 한다', () => {
      expect(hasMeaningfulText('   ')).toBe(false);
      expect(hasMeaningfulText('\n\n\n')).toBe(false);
      expect(hasMeaningfulText('  \n  \t  ')).toBe(false);
    });

    it('앞뒤 공백을 무시해야 한다', () => {
      expect(hasMeaningfulText('  Hello  ')).toBe(true);
      expect(hasMeaningfulText('\nText\n')).toBe(true);
    });
  });
});
