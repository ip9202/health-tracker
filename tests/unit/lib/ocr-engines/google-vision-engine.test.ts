import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleVisionEngine, createGoogleVisionEngine } from '@/lib/ocr-engines/google-vision-engine';
import { OCRError } from '@/lib/ocr-engines/types';

// @google-cloud/vision 모킹 - 팩토리 내에서 직접 vi.fn() 사용
vi.mock('@google-cloud/vision', () => {
  const mockDocumentTextDetection = vi.fn();
  const mockImageAnnotatorClient = vi.fn(() => ({
    documentTextDetection: mockDocumentTextDetection,
  }));

  return {
    default: {
      ImageAnnotatorClient: mockImageAnnotatorClient,
    },
    __mocks__: {
      mockDocumentTextDetection,
      mockImageAnnotatorClient,
    },
  };
});

// 모듈에서 mock 함수 가져오기 (비동기로 처리)
let mockDocumentTextDetection: any;
let mockImageAnnotatorClient: any;

// 최상위 beforeEach로 mock 초기화
beforeEach(async () => {
  const vision = await import('@google-cloud/vision');
  mockDocumentTextDetection = (vision as any).__mocks__.mockDocumentTextDetection;
  mockImageAnnotatorClient = (vision as any).__mocks__.mockImageAnnotatorClient;
});

describe('GoogleVisionEngine', () => {
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock client 생성
    mockClient = {
      documentTextDetection: mockDocumentTextDetection,
    };

    // 환경 변수 설정
    process.env.GOOGLE_CLOUD_CREDENTIALS = Buffer.from(
      JSON.stringify({ type: 'service_account', project_id: 'test-project' }),
    ).toString('base64');

    // 기본 mockReturnValue 설정
    mockImageAnnotatorClient.mockReturnValue(mockClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GOOGLE_CLOUD_CREDENTIALS;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  });

  describe('생성자', () => {
    it('Base64 인증 정보로 클라이언트를 생성해야 한다', () => {
    void new GoogleVisionEngine();

      expect(mockImageAnnotatorClient).toHaveBeenCalledWith(
        expect.objectContaining({
          credentials: expect.objectContaining({
            type: 'service_account',
          }),
        }),
      );
    });

    it('파일 경로 인증 정보로 클라이언트를 생성해야 한다', () => {
      delete process.env.GOOGLE_CLOUD_CREDENTIALS;
      process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';

    void new GoogleVisionEngine();

      expect(mockImageAnnotatorClient).toHaveBeenCalledWith();
    });

    it('인증 정보가 없으면 기본 클라이언트를 생성해야 한다', () => {
      delete process.env.GOOGLE_CLOUD_CREDENTIALS;
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

    void new GoogleVisionEngine();

      expect(mockImageAnnotatorClient).toHaveBeenCalledWith();
    });

    it('잘못된 Base64 인증 정보면 에러를 발생시켜야 한다', () => {
      process.env.GOOGLE_CLOUD_CREDENTIALS = 'invalid-base64!!!';

      expect(() => new GoogleVisionEngine()).toThrow('Google Cloud Credentials 파싱 실패');
    });
  });

  describe('extractText - Data URL', () => {
    it('Data URL에서 텍스트를 성공적으로 추출해야 한다', async () => {
      const mockText = '테스트 텍스트\nInBody 결과';
      const mockConfidence = 0.95;

      mockDocumentTextDetection.mockResolvedValue([
        {
          fullTextAnnotation: {
            text: mockText,
            pages: [{ confidence: mockConfidence }],
          },
        },
      ]);

      const engine = new GoogleVisionEngine();
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1...';

      const result = await engine.extractText(dataUrl);

      expect(result.text).toBe(mockText);
      expect(result.confidence).toBe(95);
      expect(result.engine).toBe('google-vision');
      expect(mockDocumentTextDetection).toHaveBeenCalledWith({
        content: expect.any(String),
      });
    });

    it('잘못된 Data URL 형식이면 에러를 발생시켜야 한다', async () => {
      const engine = new GoogleVisionEngine();

      await expect(engine.extractText('invalid-data-url')).rejects.toThrow('유효하지 않은 Data URL 형식');
    });

    it('텍스트를 찾을 수 없으면 에러를 발생시켜야 한다', async () => {
      mockDocumentTextDetection.mockResolvedValue([{}]);

      const engine = new GoogleVisionEngine();
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1...';

      await expect(engine.extractText(dataUrl)).rejects.toThrow('Google Vision API에서 텍스트를 찾을 수 없음');
    });

    it('빈 텍스트를 반환하면 에러를 발생시켜야 한다', async () => {
      mockDocumentTextDetection.mockResolvedValue([
        {
          fullTextAnnotation: {
            text: '   ',
            pages: [{ confidence: 0.95 }],
          },
        },
      ]);

      const engine = new GoogleVisionEngine();
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1...';

      await expect(engine.extractText(dataUrl)).rejects.toThrow('추출된 텍스트가 없음');
    });
  });

  describe('extractText - 파일 경로', () => {
    it('파일 경로에서 텍스트를 성공적으로 추출해야 한다', async () => {
      const mockText = '파일 경로 테스트';
      const mockConfidence = 0.92;

      mockDocumentTextDetection.mockResolvedValue([
        {
          fullTextAnnotation: {
            text: mockText,
            pages: [{ confidence: mockConfidence }],
          },
        },
      ]);

      const engine = new GoogleVisionEngine();

      const result = await engine.extractText('/path/to/image.jpg');

      expect(result.text).toBe(mockText);
      expect(result.confidence).toBe(92);
      expect(result.engine).toBe('google-vision');
      expect(mockDocumentTextDetection).toHaveBeenCalledWith({
        source: { filename: '/path/to/image.jpg' },
      });
    });

    it('신뢰도가 낮으면 경고를 출력해야 한다', async () => {
      const mockText = '낮은 신뢰도 텍스트';
      const mockConfidence = 0.25; // 25%

      mockDocumentTextDetection.mockResolvedValue([
        {
          fullTextAnnotation: {
            text: mockText,
            pages: [{ confidence: mockConfidence }],
          },
        },
      ]);

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const engine = new GoogleVisionEngine();

      const result = await engine.extractText('/path/to/image.jpg', { minConfidence: 30 });

      expect(result.text).toBe(mockText);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('신뢰도가 낮습니다'),
      );
    });
  });

  describe('extractText - 타임아웃', () => {
    it('타임아웃 내에 응답하지 않으면 에러를 발생시켜야 한다', async () => {
      // 절대 해결되지 않는 Promise
      mockDocumentTextDetection.mockImplementation(
        () => new Promise(() => {}),
      );

      const engine = new GoogleVisionEngine();

      await expect(
        engine.extractText('/path/to/image.jpg', { timeout: 100 }),
      ).rejects.toThrow(`${OCRError.TIMEOUT}: Google Vision API 타임아웃`);
    });
  });

  describe('extractText - 에러 처리', () => {
    it('인증 실패 시 적절한 에러를 발생시켜야 한다', async () => {
      const authError = new Error('Authentication failed');
      mockDocumentTextDetection.mockRejectedValue(authError);

      const engine = new GoogleVisionEngine();

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow(
        `${OCRError.NOT_CONFIGURED}: Google Cloud 인증 실패`,
      );
    });

    it('일반 오류 시 적절한 에러를 발생시켜야 한다', async () => {
      const generalError = new Error('Network error');
      mockDocumentTextDetection.mockRejectedValue(generalError);

      const engine = new GoogleVisionEngine();

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow(
        `${OCRError.FAILURE}: Google Vision API 처리 실패`,
      );
    });

    it('알 수 없는 오류 타입도 처리해야 한다', async () => {
      mockDocumentTextDetection.mockRejectedValue('String error');

      const engine = new GoogleVisionEngine();

      await expect(engine.extractText('/path/to/image.jpg')).rejects.toThrow(
        `${OCRError.FAILURE}: Google Vision API 처리 실패`,
      );
    });
  });

  describe('isAvailable', () => {
    it('GOOGLE_CLOUD_CREDENTIALS가 있으면 true를 반환해야 한다', () => {
      process.env.GOOGLE_CLOUD_CREDENTIALS = 'valid-credentials';

      const engine = new GoogleVisionEngine();

      expect(engine.isAvailable()).toBe(true);
    });

    it('GOOGLE_APPLICATION_CREDENTIALS가 있으면 true를 반환해야 한다', () => {
      delete process.env.GOOGLE_CLOUD_CREDENTIALS;
      process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';

      const engine = new GoogleVisionEngine();

      expect(engine.isAvailable()).toBe(true);
    });

    it('인증 정보가 없으면 false를 반환해야 한다', () => {
      delete process.env.GOOGLE_CLOUD_CREDENTIALS;
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

      const engine = new GoogleVisionEngine();

      expect(engine.isAvailable()).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('클라이언트를 정리해야 한다', async () => {
      const engine = new GoogleVisionEngine();
      await engine.cleanup();

      // 클라이언트가 null로 설정되었는지 확인
      // 다음 extractText 호출에서 새 클라이언트가 생성되는지 테스트
      mockDocumentTextDetection.mockResolvedValue([
        {
          fullTextAnnotation: {
            text: 'After cleanup',
            pages: [{ confidence: 1 }],
          },
        },
      ]);

      await engine.extractText('/path/to/image.jpg');

      expect(mockImageAnnotatorClient).toHaveBeenCalled();
    });
  });

  describe('createGoogleVisionEngine', () => {
    it('팩토리 함수가 엔진 인스턴스를 생성해야 한다', () => {
      const engine = createGoogleVisionEngine();

      expect(engine).toBeInstanceOf(GoogleVisionEngine);
    });
  });
});
