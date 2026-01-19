import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FallbackEngine, createFallbackEngine } from '@/lib/ocr-engines/fallback-engine';

// Google Vision 모킹
vi.mock('@/lib/ocr-engines/google-vision-engine', () => {
  const mockExtractText = vi.fn();
  const mockCleanup = vi.fn();
  const mockIsAvailable = vi.fn();
  const MockGoogleVisionEngine = vi.fn(() => ({
    extractText: mockExtractText,
    cleanup: mockCleanup,
    isAvailable: mockIsAvailable,
  }));
  const mockCreateGoogleVisionEngine = vi.fn(() => ({
    extractText: mockExtractText,
    cleanup: mockCleanup,
    isAvailable: mockIsAvailable,
  }));

  return {
    GoogleVisionEngine: MockGoogleVisionEngine,
    createGoogleVisionEngine: mockCreateGoogleVisionEngine,
    __mocks__: {
      mockExtractText: mockExtractText,
      mockCleanup: mockCleanup,
      mockIsAvailable: mockIsAvailable,
      MockGoogleVisionEngine: MockGoogleVisionEngine,
      mockCreateGoogleVisionEngine: mockCreateGoogleVisionEngine,
    },
  };
});

// Tesseract 모킹
vi.mock('@/lib/ocr-engines/tesseract-engine', () => {
  const mockExtractText = vi.fn();
  const mockCleanup = vi.fn();
  const mockIsAvailable = vi.fn(() => true);
  const MockTesseractEngine = vi.fn(() => ({
    extractText: mockExtractText,
    cleanup: mockCleanup,
    isAvailable: mockIsAvailable,
  }));
  const mockCreateTesseractEngine = vi.fn(() => ({
    extractText: mockExtractText,
    cleanup: mockCleanup,
    isAvailable: mockIsAvailable,
  }));

  return {
    TesseractEngine: MockTesseractEngine,
    createTesseractEngine: mockCreateTesseractEngine,
    __mocks__: {
      mockExtractText: mockExtractText,
      mockCleanup: mockCleanup,
      mockIsAvailable: mockIsAvailable,
      MockTesseractEngine: MockTesseractEngine,
      mockCreateTesseractEngine: mockCreateTesseractEngine,
    },
  };
});

// 모듈에서 mock 함수 가져오기
let mockGoogleVision: any;
let mockTesseract: any;
let consoleLogSpy: any;
let consoleWarnSpy: any;

beforeEach(async () => {
  const gvModule = await import('@/lib/ocr-engines/google-vision-engine');
  const tModule = await import('@/lib/ocr-engines/tesseract-engine');

  const gvMocks = (gvModule as any).__mocks__;
  const tMocks = (tModule as any).__mocks__;

  mockGoogleVision = {
    extractText: gvMocks.mockExtractText,
    cleanup: gvMocks.mockCleanup,
    isAvailable: gvMocks.mockIsAvailable,
  };

  mockTesseract = {
    extractText: tMocks.mockExtractText,
    cleanup: tMocks.mockCleanup,
    isAvailable: tMocks.mockIsAvailable,
  };

  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('FallbackEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGoogleVision.isAvailable.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('생성자', () => {
    it('Google Vision이 사용 가능하면 초기화해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(true);

      void new FallbackEngine();

      expect(mockGoogleVision.isAvailable).toHaveBeenCalled();
    });

    it('Google Vision이 사용 불가능하면 초기화하지 않아야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);

      void new FallbackEngine();

      expect(mockGoogleVision.isAvailable).toHaveBeenCalled();
    });

    it('useGoogleVision 옵션으로 Google Vision 사용을 비활성화할 수 있어야 한다', () => {
      void new FallbackEngine({ useGoogleVision: false });

      expect(mockGoogleVision.isAvailable).not.toHaveBeenCalled();
    });

    it('Tesseract는 항상 초기화되어야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(true);

      void new FallbackEngine();

      expect(mockTesseract).toBeDefined();
    });
  });

  describe('extractText - Google Vision 성공', () => {
    beforeEach(() => {
      mockGoogleVision.isAvailable.mockReturnValue(true);
    });

    it('Google Vision이 성공하면 결과를 반환해야 한다', async () => {
      const mockResult = {
        text: 'Google Vision 텍스트',
        confidence: 95.0,
        engine: 'google-vision' as const,
      };
      mockGoogleVision.extractText.mockResolvedValue(mockResult);

      const engine = new FallbackEngine();

      const result = await engine.extractText('/path/to/image.jpg');

      expect(result).toEqual(mockResult);
      expect(mockGoogleVision.extractText).toHaveBeenCalledTimes(1);
      expect(mockTesseract.extractText).not.toHaveBeenCalled();
    });

    it('Google Vision 첫 번째 시도가 성공하면 재시도하지 않아야 한다', async () => {
      const mockResult = {
        text: '성공',
        confidence: 95.0,
        engine: 'google-vision' as const,
      };
      mockGoogleVision.extractText.mockResolvedValue(mockResult);

      const engine = new FallbackEngine({ useGoogleVision: true });

      const result = await engine.extractText('/path/to/image.jpg', { maxRetries: 2 });

      expect(result.text).toBe('성공');
      expect(mockGoogleVision.extractText).toHaveBeenCalledTimes(1);
    });

    it('옵션을 전달해야 한다', async () => {
      const mockResult = {
        text: '텍스트',
        confidence: 95.0,
        engine: 'google-vision' as const,
      };
      mockGoogleVision.extractText.mockResolvedValue(mockResult);

      const engine = new FallbackEngine();

      await engine.extractText('/path/to/image.jpg', {
        timeout: 5000,
        minConfidence: 80,
      });

      expect(mockGoogleVision.extractText).toHaveBeenCalledWith('/path/to/image.jpg', {
        timeout: 5000,
        minConfidence: 80,
        maxRetries: 2,
      });
    });
  });

  describe('extractText - 재시도 로직', () => {
    beforeEach(() => {
      mockGoogleVision.isAvailable.mockReturnValue(true);
    });

    it('Google Vision 실패 시 재시도해야 한다', async () => {
      const tesseractResult = {
        text: 'Tesseract 텍스트',
        confidence: 88.0,
        engine: 'tesseract' as const,
      };

      mockGoogleVision.extractText
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'));

      mockTesseract.extractText.mockResolvedValue(tesseractResult);

      const engine = new FallbackEngine({ useGoogleVision: true, enableFallback: true });

      const result = await engine.extractText('/path/to/image.jpg', { maxRetries: 1 });

      expect(result).toEqual(tesseractResult);
      expect(mockGoogleVision.extractText).toHaveBeenCalledTimes(2);
      expect(mockTesseract.extractText).toHaveBeenCalledTimes(1);
    });

    it('최대 2번 재시도해야 한다 (기본값)', async () => {
      const tesseractResult = {
        text: 'Tesseract',
        confidence: 85.0,
        engine: 'tesseract' as const,
      };

      mockGoogleVision.extractText
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'));

      mockTesseract.extractText.mockResolvedValue(tesseractResult);

      const engine = new FallbackEngine();

      const result = await engine.extractText('/path/to/image.jpg');

      expect(result).toEqual(tesseractResult);
      expect(mockGoogleVision.extractText).toHaveBeenCalledTimes(3);
    });

    it('커스텀 maxRetries를 사용할 수 있어야 한다', async () => {
      const tesseractResult = {
        text: 'Tesseract',
        confidence: 85.0,
        engine: 'tesseract' as const,
      };

      for (let i = 0; i < 5; i++) {
        mockGoogleVision.extractText.mockRejectedValueOnce(new Error(`Error ${i + 1}`));
      }

      mockTesseract.extractText.mockResolvedValue(tesseractResult);

      const engine = new FallbackEngine();

      const result = await engine.extractText('/path/to/image.jpg', { maxRetries: 4 });

      expect(result).toEqual(tesseractResult);
      expect(mockGoogleVision.extractText).toHaveBeenCalledTimes(5);
    });

    it('Google Vision 성공 시 재시도 후 폴백하지 않아야 한다', async () => {
      const googleVisionResult = {
        text: 'Google Vision 성공',
        confidence: 95.0,
        engine: 'google-vision' as const,
      };

      mockGoogleVision.extractText
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(googleVisionResult);

      const engine = new FallbackEngine();

      const result = await engine.extractText('/path/to/image.jpg', { maxRetries: 1 });

      expect(result).toEqual(googleVisionResult);
      expect(mockTesseract.extractText).not.toHaveBeenCalled();
    });
  });

  describe('extractText - Tesseract 폴백', () => {
    beforeEach(() => {
      mockGoogleVision.isAvailable.mockReturnValue(true);
    });

    it('모든 Google Vision 시도 실패 시 Tesseract로 폴백해야 한다', async () => {
      const tesseractResult = {
        text: 'Tesseract 폴백',
        confidence: 82.0,
        engine: 'tesseract' as const,
      };

      mockGoogleVision.extractText.mockRejectedValue(new Error('Google Vision failed'));
      mockTesseract.extractText.mockResolvedValue(tesseractResult);

      const engine = new FallbackEngine();

      const result = await engine.extractText('/path/to/image.jpg');

      expect(result).toEqual(tesseractResult);
      expect(mockGoogleVision.extractText).toHaveBeenCalledTimes(3);
      expect(mockTesseract.extractText).toHaveBeenCalledTimes(1);
    });

    it('enableFallback이 false면 폴백하지 않아야 한다', async () => {
      mockGoogleVision.extractText.mockRejectedValue(new Error('Failed'));

      const engine = new FallbackEngine({ enableFallback: false });

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow('Failed');
      expect(mockTesseract.extractText).not.toHaveBeenCalled();
    });

    it('Google Vision이 없으면 바로 Tesseract를 사용해야 한다', async () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);

      const tesseractResult = {
        text: 'Tesseract 직접 사용',
        confidence: 90.0,
        engine: 'tesseract' as const,
      };
      mockTesseract.extractText.mockResolvedValue(tesseractResult);

      const engine = new FallbackEngine();

      const result = await engine.extractText('/path/to/image.jpg');

      expect(result).toEqual(tesseractResult);
      expect(mockGoogleVision.extractText).not.toHaveBeenCalled();
      expect(mockTesseract.extractText).toHaveBeenCalledTimes(1);
    });

    it('useGoogleVision이 false면 바로 Tesseract를 사용해야 한다', async () => {
      const tesseractResult = {
        text: 'Tesseract 사용',
        confidence: 88.0,
        engine: 'tesseract' as const,
      };
      mockTesseract.extractText.mockResolvedValue(tesseractResult);

      const engine = new FallbackEngine({ useGoogleVision: false });

      const result = await engine.extractText('/path/to/image.jpg');

      expect(result).toEqual(tesseractResult);
      expect(mockGoogleVision.extractText).not.toHaveBeenCalled();
      expect(mockTesseract.extractText).toHaveBeenCalledTimes(1);
    });
  });

  describe('extractText - 모든 엔진 실패', () => {
    beforeEach(() => {
      mockGoogleVision.isAvailable.mockReturnValue(true);
    });

    it('Google Vision과 Tesseract 모두 실패하면 에러를 발생시켜야 한다', async () => {
      mockGoogleVision.extractText.mockRejectedValue(new Error('Google Vision failed'));
      mockTesseract.extractText.mockRejectedValue(new Error('Tesseract failed'));

      const engine = new FallbackEngine();

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow('Tesseract failed');
    });

    it('enableFallback이 false이고 Google Vision이 실패하면 에러를 발생시켜야 한다', async () => {
      mockGoogleVision.extractText.mockRejectedValue(new Error('Google Vision failed'));

      const engine = new FallbackEngine({ enableFallback: false });

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow('Google Vision failed');
    });

    it('Google Vision이 없고 Tesseract도 실패하면 에러를 발생시켜야 한다', async () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);
      mockTesseract.extractText.mockRejectedValue(new Error('Tesseract failed'));

      const engine = new FallbackEngine();

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow('Tesseract failed');
    });
  });

  describe('extractText - 로깅', () => {
    beforeEach(() => {
      mockGoogleVision.isAvailable.mockReturnValue(true);
    });

    it('Google Vision 시도 로그를 출력해야 한다', async () => {
      const mockResult = {
        text: '텍스트',
        confidence: 95.0,
        engine: 'google-vision' as const,
      };
      mockGoogleVision.extractText.mockResolvedValue(mockResult);

      const engine = new FallbackEngine();

      await engine.extractText('/path/to/image.jpg', { maxRetries: 0 });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Google Vision API 시도'));
    });

    it('Google Vision 성공 로그를 출력해야 한다', async () => {
      const mockResult = {
        text: '텍스트',
        confidence: 95.0,
        engine: 'google-vision' as const,
      };
      mockGoogleVision.extractText.mockResolvedValue(mockResult);

      const engine = new FallbackEngine();

      await engine.extractText('/path/to/image.jpg');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Google Vision API 성공'));
    });

    it('Google Vision 실패 로그를 출력해야 한다', async () => {
      mockGoogleVision.extractText.mockRejectedValue(new Error('Failed'));
      mockTesseract.extractText.mockResolvedValue({
        text: 'Tesseract',
        confidence: 85.0,
        engine: 'tesseract' as const,
      });

      const engine = new FallbackEngine();

      await engine.extractText('/path/to/image.jpg');

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Google Vision API 실패'));
    });

    it('폴백 로그를 출력해야 한다', async () => {
      mockGoogleVision.extractText.mockRejectedValue(new Error('Failed'));
      mockTesseract.extractText.mockResolvedValue({
        text: 'Tesseract',
        confidence: 85.0,
        engine: 'tesseract' as const,
      });

      const engine = new FallbackEngine();

      await engine.extractText('/path/to/image.jpg');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Tesseract.js로 폴백'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Tesseract.js 사용'));
    });
  });

  describe('cleanup', () => {
    it('모든 엔진을 정리해야 한다', async () => {
      mockGoogleVision.isAvailable.mockReturnValue(true);

      const engine = new FallbackEngine();
      await engine.cleanup();

      expect(mockGoogleVision.cleanup).toHaveBeenCalledTimes(1);
      expect(mockTesseract.cleanup).toHaveBeenCalledTimes(1);
    });

    it('Google Vision이 없으면 Tesseract만 정리해야 한다', async () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);

      const engine = new FallbackEngine();
      await engine.cleanup();

      expect(mockGoogleVision.cleanup).not.toHaveBeenCalled();
      expect(mockTesseract.cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAvailable', () => {
    it('Google Vision이나 Tesseract 중 하나라도 사용 가능하면 true를 반환해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(true);

      const engine = new FallbackEngine();

      expect(engine.isAvailable()).toBe(true);
    });

    it('Google Vision만 사용 가능해도 true를 반환해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(true);
      mockTesseract.isAvailable.mockReturnValue(false);

      const engine = new FallbackEngine();

      expect(engine.isAvailable()).toBe(true);
    });

    it('Tesseract만 사용 가능해도 true를 반환해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);
      mockTesseract.isAvailable.mockReturnValue(true);

      const engine = new FallbackEngine();

      expect(engine.isAvailable()).toBe(true);
    });

    it('모든 엔진이 사용 불가능하면 false를 반환해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);
      mockTesseract.isAvailable.mockReturnValue(false);

      const engine = new FallbackEngine();

      expect(engine.isAvailable()).toBe(false);
    });
  });

  describe('getAvailableEngines', () => {
    it('사용 가능한 모든 엔진 목록을 반환해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(true);

      const engine = new FallbackEngine();

      const engines = engine.getAvailableEngines();

      expect(engines).toContain('google-vision');
      expect(engines).toContain('tesseract');
    });

    it('Google Vision만 사용 가능하면 google-vision만 반환해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(true);
      mockTesseract.isAvailable.mockReturnValue(false);

      const engine = new FallbackEngine();

      const engines = engine.getAvailableEngines();

      expect(engines).toContain('google-vision');
      expect(engines).not.toContain('tesseract');
    });

    it('Tesseract만 사용 가능하면 tesseract만 반환해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);
      mockTesseract.isAvailable.mockReturnValue(true);

      const engine = new FallbackEngine();

      const engines = engine.getAvailableEngines();

      expect(engines).not.toContain('google-vision');
      expect(engines).toContain('tesseract');
    });

    it('모든 엔진이 사용 불가능하면 빈 배열을 반환해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);
      mockTesseract.isAvailable.mockReturnValue(false);

      const engine = new FallbackEngine();

      const engines = engine.getAvailableEngines();

      expect(engines).toEqual([]);
    });
  });

  describe('createFallbackEngine', () => {
    it('팩토리 함수가 엔진 인스턴스를 생성해야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(true);

      const engine = createFallbackEngine();

      expect(engine).toBeInstanceOf(FallbackEngine);
    });

    it('팩토리 함수에 옵션을 전달할 수 있어야 한다', () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);

      const engine = createFallbackEngine({ useGoogleVision: false, enableFallback: true });

      expect(engine).toBeInstanceOf(FallbackEngine);
    });
  });

  describe('엣지 케이스', () => {
    it('빈 경로로도 작동해야 한다', async () => {
      mockGoogleVision.isAvailable.mockReturnValue(false);
      mockTesseract.extractText.mockResolvedValue({
        text: '빈 경로 테스트',
        confidence: 90.0,
        engine: 'tesseract' as const,
      });

      const engine = new FallbackEngine();

      const result = await engine.extractText('');

      expect(result.text).toBe('빈 경로 테스트');
    });

    it('null이나 undefined 옵션으로도 작동해야 한다', async () => {
      mockGoogleVision.isAvailable.mockReturnValue(true);
      mockGoogleVision.extractText.mockResolvedValue({
        text: '테스트',
        confidence: 95.0,
        engine: 'google-vision' as const,
      });

      const engine = new FallbackEngine();

      const result = await engine.extractText('/path/to/image.jpg', null as any);

      expect(result.text).toBe('테스트');
    });
  });
});
