import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TesseractEngine, createTesseractEngine } from '@/lib/ocr-engines/tesseract-engine';
import { OCRError } from '@/lib/ocr-engines/types';

// Tesseract.js 모킹 - 팩토리 내에서 직접 vi.fn() 사용
vi.mock('tesseract.js', () => {
  const mockRecognize = vi.fn();
  const mockTerminate = vi.fn();
  const mockWorker = {
    recognize: mockRecognize,
    terminate: mockTerminate,
  };
  const mockCreateWorker = vi.fn(() => Promise.resolve(mockWorker));

  return {
    createWorker: mockCreateWorker,
    __mocks__: {
      mockCreateWorker,
      mockRecognize,
      mockTerminate,
    },
  };
});

// 모듈에서 mock 함수 가져오기
let mockCreateWorker: any;
let mockRecognize: any;
let mockTerminate: any;

beforeEach(async () => {
  const tesseract = await import('tesseract.js');
  mockCreateWorker = (tesseract as any).__mocks__.mockCreateWorker;
  mockRecognize = (tesseract as any).__mocks__.mockRecognize;
  mockTerminate = (tesseract as any).__mocks__.mockTerminate;
});

describe('TesseractEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('생성자', () => {
    it('Worker를 비동기로 초기화해야 한다', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Test',
          confidence: 95.0,
        },
      });

      const engine = new TesseractEngine();

      // 초기화 대기
      await engine.extractText('data:image/jpeg;base64,test');

      expect(mockCreateWorker).toHaveBeenCalledWith('kor+eng', 1, {
        logger: expect.any(Function),
      });
    });

    it('초기화 실패 시 에러를 발생시켜야 한다', async () => {
      const initError = new Error('Worker initialization failed');
      mockCreateWorker.mockRejectedValue(initError);

      const engine = new TesseractEngine();

      await expect(engine.extractText('data:image/jpeg;base64,test')).rejects.toThrow(
        'Tesseract 초기화 실패',
      );
    });
  });

  describe('extractText', () => {
    beforeEach(() => {
      mockCreateWorker.mockResolvedValue({
        recognize: mockRecognize,
        terminate: mockTerminate,
      });
    });

    it('Data URL에서 텍스트를 성공적으로 추출해야 한다', async () => {
      const mockText = '홍길동\n남\n30세\n175cm\n70kg';
      const mockConfidence = 95.5;

      mockRecognize.mockResolvedValue({
        data: {
          text: mockText,
          confidence: mockConfidence,
        },
      });

      const engine = new TesseractEngine();
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1...';

      const result = await engine.extractText(dataUrl);

      expect(result.text).toBe(mockText);
      expect(result.confidence).toBe(mockConfidence);
      expect(result.engine).toBe('tesseract');
      expect(mockRecognize).toHaveBeenCalledWith(dataUrl);
    });

    it('파일 경로에서 텍스트를 성공적으로 추출해야 한다', async () => {
      const mockText = '파일 경로 테스트';
      const mockConfidence = 88.3;

      mockRecognize.mockResolvedValue({
        data: {
          text: mockText,
          confidence: mockConfidence,
        },
      });

      const engine = new TesseractEngine();

      const result = await engine.extractText('/path/to/image.jpg');

      expect(result.text).toBe(mockText);
      expect(result.confidence).toBe(mockConfidence);
      expect(mockRecognize).toHaveBeenCalledWith('/path/to/image.jpg');
    });

    it('빈 텍스트를 반환하면 에러를 발생시켜야 한다', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: '',
          confidence: 95.0,
        },
      });

      const engine = new TesseractEngine();

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow('추출된 텍스트가 없음');
    });

    it('공백만 있는 텍스트를 반환하면 에러를 발생시켜야 한다', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: '   \n\n   ',
          confidence: 95.0,
        },
      });

      const engine = new TesseractEngine();

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow('추출된 텍스트가 없음');
    });

    it('신뢰도가 낮으면 경고를 출력해야 한다', async () => {
      const mockText = '낮은 신뢰도 텍스트';
      const mockConfidence = 25.0;

      mockRecognize.mockResolvedValue({
        data: {
          text: mockText,
          confidence: mockConfidence,
        },
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const engine = new TesseractEngine();

      const result = await engine.extractText('/path/to/image.jpg', { minConfidence: 30 });

      expect(result.text).toBe(mockText);
      expect(result.confidence).toBe(mockConfidence);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tesseract 신뢰도가 낮습니다'),
      );
    });

    it('최소 신뢰도 설정을 커스터마이즈할 수 있어야 한다', async () => {
      const mockText = '텍스트';
      const mockConfidence = 40.0;

      mockRecognize.mockResolvedValue({
        data: {
          text: mockText,
          confidence: mockConfidence,
        },
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const engine = new TesseractEngine();

      const result = await engine.extractText('/path/to/image.jpg', { minConfidence: 30 });

      expect(result.confidence).toBe(mockConfidence);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('extractText - 타임아웃', () => {
    beforeEach(() => {
      mockCreateWorker.mockResolvedValue({
        recognize: mockRecognize,
        terminate: mockTerminate,
      });
    });

    it('타임아웃 내에 응답하지 않으면 에러를 발생시켜야 한다', async () => {
      mockRecognize.mockImplementation(
        () => new Promise(() => {}),
      );

      const engine = new TesseractEngine();

      await expect(
        engine.extractText('/path/to/image.jpg', { timeout: 100 }),
      ).rejects.toThrow(`${OCRError.TIMEOUT}: Tesseract 타임아웃`);
    });

    it('커스텀 타임아웃을 사용할 수 있어야 한다', async () => {
      mockRecognize.mockImplementation(
        () => new Promise(() => {}),
      );

      const engine = new TesseractEngine();

      const startTime = Date.now();

      await expect(
        engine.extractText('/path/to/image.jpg', { timeout: 200 }),
      ).rejects.toThrow();

      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(150);
      expect(elapsed).toBeLessThan(400);
    });
  });

  describe('extractText - 에러 처리', () => {
    beforeEach(() => {
      mockCreateWorker.mockResolvedValue({
        recognize: mockRecognize,
        terminate: mockTerminate,
      });
    });

    it('인식 실패 시 적절한 에러를 발생시켜야 한다', async () => {
      const recognitionError = new Error('Recognition failed');
      mockRecognize.mockRejectedValue(recognitionError);

      const engine = new TesseractEngine();

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow(
        `${OCRError.FAILURE}: Tesseract 처리 실패`,
      );
    });

    it('타임아웃 에러를 적절하게 처리해야 한다', async () => {
      const timeoutError = new Error('Tesseract timeout');
      mockRecognize.mockRejectedValue(timeoutError);

      const engine = new TesseractEngine();

      await expect(engine.extractText('/path/to/image.jpg', { timeout: 100 }))
        .rejects.toThrow(`${OCRError.TIMEOUT}: Tesseract 타임아웃`);
    });

    it('알 수 없는 오류 타입도 처리해야 한다', async () => {
      mockRecognize.mockRejectedValue('String error');

      const engine = new TesseractEngine();

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow(
        `${OCRError.FAILURE}: Tesseract 처리 실패`,
      );
    });
  });

  describe('Worker 캐싱', () => {
    beforeEach(() => {
      mockCreateWorker.mockResolvedValue({
        recognize: mockRecognize,
        terminate: mockTerminate,
      });
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Test',
          confidence: 95.0,
        },
      });
    });

    it('Worker가 재사용되어야 한다', async () => {
      const engine = new TesseractEngine();

      await engine.extractText('/path/to/image1.jpg');
      await engine.extractText('/path/to/image2.jpg');

      expect(mockCreateWorker).toHaveBeenCalledTimes(1);
    });

    it('여러 엔진 인스턴스가 Worker를 공유해야 한다', async () => {
      const engine1 = new TesseractEngine();
      const engine2 = new TesseractEngine();

      await engine1.extractText('/path/to/image1.jpg');
      await engine2.extractText('/path/to/image2.jpg');

      expect(mockCreateWorker).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      mockCreateWorker.mockResolvedValue({
        recognize: mockRecognize,
        terminate: mockTerminate,
      });
    });

    it('Worker를 종료해야 한다', async () => {
      const engine = new TesseractEngine();
      await engine.cleanup();

      expect(mockTerminate).toHaveBeenCalledTimes(1);
    });

    it('cleanup 후 새 요청이 오면 Worker가 다시 생성되어야 한다', async () => {
      mockRecognize.mockResolvedValue({
        data: {
          text: 'Test',
          confidence: 95.0,
        },
      });

      const engine = new TesseractEngine();

      await engine.extractText('/path/to/image1.jpg');
      await engine.cleanup();

      mockCreateWorker.mockClear();

      await engine.extractText('/path/to/image2.jpg');

      expect(mockCreateWorker).toHaveBeenCalledTimes(1);
    });

    it('여러 번 호출해도 안전해야 한다', async () => {
      const engine = new TesseractEngine();

      await engine.cleanup();
      await engine.cleanup();
      await engine.cleanup();

      expect(mockTerminate).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAvailable', () => {
    it('항상 true를 반환해야 한다', () => {
      const engine = new TesseractEngine();

      expect(engine.isAvailable()).toBe(true);
    });

    it('환경 변수가 없어도 true를 반환해야 한다', () => {
      delete process.env.GOOGLE_CLOUD_CREDENTIALS;
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

      const engine = new TesseractEngine();

      expect(engine.isAvailable()).toBe(true);
    });
  });

  describe('createTesseractEngine', () => {
    it('팩토리 함수가 엔진 인스턴스를 생성해야 한다', () => {
      const engine = createTesseractEngine();

      expect(engine).toBeInstanceOf(TesseractEngine);
    });
  });

  describe('동시성 처리', () => {
    beforeEach(() => {
      mockCreateWorker.mockResolvedValue({
        recognize: mockRecognize,
        terminate: mockTerminate,
      });
    });

    it('동시에 여러 요청이 와도 순차적으로 처리되어야 한다', async () => {
      let callCount = 0;
      mockRecognize.mockImplementation(async () => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          data: {
            text: `Test ${callCount}`,
            confidence: 95.0,
          },
        };
      });

      const engine = new TesseractEngine();

      const results = await Promise.all([
        engine.extractText('/path/to/image1.jpg'),
        engine.extractText('/path/to/image2.jpg'),
        engine.extractText('/path/to/image3.jpg'),
      ]);

      expect(results).toHaveLength(3);
      expect(results[0].text).toBe('Test 1');
      expect(results[1].text).toBe('Test 2');
      expect(results[2].text).toBe('Test 3');
    });
  });
});
