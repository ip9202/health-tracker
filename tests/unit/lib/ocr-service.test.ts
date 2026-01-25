import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractTextFromImage,
  cleanupWorker,
  isLowConfidence,
  hasMeaningfulText,
  getAvailableEngines,
} from '@/lib/ocr-service';

// Fallback 엔진 모킹
const mockExtractText = vi.fn();
const mockCleanup = vi.fn();
const mockIsAvailable = vi.fn();
const mockGetAvailableEngines = vi.fn();

vi.mock('@/lib/ocr-engines/fallback-engine', () => ({
  FallbackEngine: vi.fn().mockImplementation(() => ({
    extractText: mockExtractText,
    cleanup: mockCleanup,
    isAvailable: mockIsAvailable,
    getAvailableEngines: mockGetAvailableEngines,
  })),
  createFallbackEngine: vi.fn(() => ({
    extractText: mockExtractText,
    cleanup: mockCleanup,
    isAvailable: mockIsAvailable,
    getAvailableEngines: mockGetAvailableEngines,
  })),
}));

describe('OCR Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAvailable.mockReturnValue(true);
    mockGetAvailableEngines.mockReturnValue(['tesseract', 'google-vision']);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractTextFromImage', () => {
    it('성공적으로 텍스트를 추출해야 한다', async () => {
      const mockText = '홍길동\n남\n30세\n175cm\n70kg';
      const mockConfidence = 95.5;

      mockExtractText.mockResolvedValue({
        text: mockText,
        confidence: mockConfidence,
        engine: 'google-vision',
      });

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.text).toBe(mockText);
      expect(result.confidence).toBe(mockConfidence);
      expect(mockExtractText).toHaveBeenCalledTimes(1);
    });

    it('Google Vision API 엔진을 통해 텍스트를 추출해야 한다', async () => {
      const mockText = 'Google Vision 텍스트';
      const mockConfidence = 92.0;

      mockExtractText.mockResolvedValue({
        text: mockText,
        confidence: mockConfidence,
        engine: 'google-vision',
      });

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.text).toBe(mockText);
      expect(result.confidence).toBe(mockConfidence);
      expect(result.engine).toBe('google-vision');
    });

    it('Tesseract 엔진 폴백 시 텍스트를 추출해야 한다', async () => {
      const mockText = 'Tesseract 텍스트';
      const mockConfidence = 88.0;

      mockExtractText.mockResolvedValue({
        text: mockText,
        confidence: mockConfidence,
        engine: 'tesseract',
      });

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.text).toBe(mockText);
      expect(result.confidence).toBe(mockConfidence);
      expect(result.engine).toBe('tesseract');
    });

    it('낮은 신뢰도일 때 경고를 출력해야 한다', async () => {
      const mockConfidence = 25.0; // 기본 최소 신뢰도 30% 미만

      mockExtractText.mockResolvedValue({
        text: '텍스트',
        confidence: mockConfidence,
        engine: 'google-vision',
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.confidence).toBe(mockConfidence);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('OCR 신뢰도가 낮습니다'),
      );
    });

    it('재시도 로직이 작동해야 한다', async () => {
      // 첫 번째와 두 번째 시도는 실패, 세 번째는 성공
      mockExtractText
        .mockRejectedValueOnce(new Error('네트워크 오류'))
        .mockRejectedValueOnce(new Error('타임아웃'))
        .mockResolvedValueOnce({
          text: '성공한 텍스트',
          confidence: 85.0,
          engine: 'google-vision',
        });

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.text).toBe('성공한 텍스트');
      expect(mockExtractText).toHaveBeenCalledTimes(3);
    });

    it('최대 재시도 횟수를 초과하면 에러를 발생시켜야 한다', async () => {
      mockExtractText.mockRejectedValue(new Error('영구적 오류'));

      await expect(
        extractTextFromImage('/path/to/image.jpg', {
          maxRetries: 2,
        }),
      ).rejects.toThrow('OCR 처리 실패');

      // maxRetries: 2 = 첫 시도 + 1번 재시도 = 총 2번 시도
      expect(mockExtractText).toHaveBeenCalledTimes(2);
    });

    it('타임아웃이 작동해야 한다', async () => {
      mockExtractText.mockImplementation(
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
    });

    it('최소 신뢰도 설정을 커스터마이즈할 수 있어야 한다', async () => {
      const mockConfidence = 40.0;

      mockExtractText.mockResolvedValue({
        text: '텍스트',
        confidence: mockConfidence,
        engine: 'tesseract',
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      // 최소 신뢰도를 30%로 낮춤
      const result = await extractTextFromImage('/path/to/image.jpg', {
        minConfidence: 30,
      });

      expect(result.confidence).toBe(mockConfidence);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('빈 텍스트를 반환할 수 있어야 한다', async () => {
      mockExtractText.mockResolvedValue({
        text: '', // 빈 텍스트
        confidence: 85.0,
        engine: 'google-vision',
      });

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.text).toBe('');
    });

    it('Data URL로도 작동해야 한다', async () => {
      const mockText = 'Data URL 텍스트';
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1...';

      mockExtractText.mockResolvedValue({
        text: mockText,
        confidence: 95.0,
        engine: 'google-vision',
      });

      const result = await extractTextFromImage(dataUrl);

      expect(result.text).toBe(mockText);
    });

    it('Google Vision API 비활성화 옵션을 전달해야 한다', async () => {
      mockExtractText.mockResolvedValue({
        text: '텍스트',
        confidence: 85.0,
        engine: 'tesseract',
      });

      await extractTextFromImage('/path/to/image.jpg', {
        useGoogleVision: false,
      });

      expect(mockExtractText).toHaveBeenCalledWith(
        '/path/to/image.jpg',
        expect.objectContaining({
          useGoogleVision: false,
        }),
      );
    });

    it('폴백 비활성화 옵션을 전달해야 한다', async () => {
      mockExtractText.mockResolvedValue({
        text: '텍스트',
        confidence: 95.0,
        engine: 'google-vision',
      });

      await extractTextFromImage('/path/to/image.jpg', {
        enableFallback: false,
      });

      expect(mockExtractText).toHaveBeenCalledWith(
        '/path/to/image.jpg',
        expect.objectContaining({
          enableFallback: false,
        }),
      );
    });

    it('모든 옵션을 병합해야 한다', async () => {
      mockExtractText.mockResolvedValue({
        text: '텍스트',
        confidence: 95.0,
        engine: 'google-vision',
      });

      await extractTextFromImage('/path/to/image.jpg', {
        timeout: 5000,
        maxRetries: 3,
        minConfidence: 80,
        useGoogleVision: true,
        enableFallback: true,
      });

      expect(mockExtractText).toHaveBeenCalledWith(
        '/path/to/image.jpg',
        {
          timeout: 5000,
          maxRetries: 3,
          minConfidence: 80,
          useGoogleVision: true,
          enableFallback: true,
        },
      );
    });
  });

  describe('cleanupWorker', () => {
    it('Worker를 정리해야 한다', async () => {
      await cleanupWorker();

      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });

    it('여러 번 호출해도 안전해야 한다', async () => {
      await cleanupWorker();
      await cleanupWorker();

      expect(mockCleanup).toHaveBeenCalledTimes(2);
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

  describe('getAvailableEngines', () => {
    it('사용 가능한 엔진 목록을 반환해야 한다', () => {
      mockGetAvailableEngines.mockReturnValue(['google-vision', 'tesseract']);

      const engines = getAvailableEngines();

      expect(engines).toContain('google-vision');
      expect(engines).toContain('tesseract');
    });

    it('Tesseract만 사용 가능하면 tesseract만 반환해야 한다', () => {
      mockGetAvailableEngines.mockReturnValue(['tesseract']);

      const engines = getAvailableEngines();

      expect(engines).toEqual(['tesseract']);
    });

    it('Google Vision만 사용 가능하면 google-vision만 반환해야 한다', () => {
      mockGetAvailableEngines.mockReturnValue(['google-vision']);

      const engines = getAvailableEngines();

      expect(engines).toEqual(['google-vision']);
    });

    it('엔진 정보가 없으면 기본값을 반환해야 한다', () => {
      mockGetAvailableEngines.mockReturnValue(undefined);

      const engines = getAvailableEngines();

      expect(engines).toEqual(['tesseract']);
    });
  });

  describe('엣지 케이스', () => {
    it('null이나 undefined 옵션으로도 작동해야 한다', async () => {
      mockExtractText.mockResolvedValue({
        text: '텍스트',
        confidence: 95.0,
        engine: 'google-vision',
      });

      const result = await extractTextFromImage('/path/to/image.jpg', null as any);

      expect(result.text).toBe('텍스트');
    });

    it('빈 경로로도 작동해야 한다', async () => {
      mockExtractText.mockResolvedValue({
        text: '빈 경로',
        confidence: 90.0,
        engine: 'tesseract',
      });

      const result = await extractTextFromImage('');

      expect(result.text).toBe('빈 경로');
    });

    it('특수 문자가 포함된 경로로도 작동해야 한다', async () => {
      mockExtractText.mockResolvedValue({
        text: '특수 문자',
        confidence: 92.0,
        engine: 'google-vision',
      });

      const result = await extractTextFromImage('/path/to/image with spaces.jpg');

      expect(result.text).toBe('특수 문자');
    });
  });

  describe('엔진 통합', () => {
    it('Google Vision API가 우선되어야 한다', async () => {
      mockExtractText.mockResolvedValue({
        text: 'Google Vision 우선',
        confidence: 95.0,
        engine: 'google-vision',
      });

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.engine).toBe('google-vision');
    });

    it('Google Vision API 실패 시 Tesseract로 폴백해야 한다', async () => {
      // Fallback 엔진 내부에서 폴백 로직을 처리하므로
      // 최종적으로 Tesseract 결과를 반환
      mockExtractText.mockResolvedValue({
        text: 'Tesseract 폴백',
        confidence: 88.0,
        engine: 'tesseract',
      });

      const result = await extractTextFromImage('/path/to/image.jpg');

      expect(result.engine).toBe('tesseract');
    });

    it('useGoogleVision를 false로 설정하면 Tesseract만 사용해야 한다', async () => {
      mockExtractText.mockResolvedValue({
        text: 'Tesseract 전용',
        confidence: 90.0,
        engine: 'tesseract',
      });

      const result = await extractTextFromImage('/path/to/image.jpg', {
        useGoogleVision: false,
      });

      expect(result.engine).toBe('tesseract');
    });
  });
});
