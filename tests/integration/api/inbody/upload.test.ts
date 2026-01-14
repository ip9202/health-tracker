import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/inbody/upload/route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
vi.mock('@/lib/image-validator', () => ({
  validateImageFile: vi.fn(),
  ImageValidationError: {
    UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_MAGIC_BYTES: 'INVALID_MAGIC_BYTES',
    EMPTY_FILE: 'EMPTY_FILE',
  },
}));

vi.mock('@/lib/ocr-service', () => ({
  extractTextFromImage: vi.fn(),
}));

vi.mock('@/lib/parser-service', () => ({
  parseInBodyData: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    inBodyRecord: {
      create: vi.fn(),
    },
  },
}));

import { validateImageFile } from '@/lib/image-validator';
import { extractTextFromImage } from '@/lib/ocr-service';
import { parseInBodyData } from '@/lib/parser-service';

describe('POST /api/inbody/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('이미지 파일을 성공적으로 업로드하고 처리해야 한다', async () => {
    // Mock setup
    const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    const mockFormData = new FormData();
    mockFormData.append('file', mockFile);

    vi.mocked(validateImageFile).mockResolvedValue({ valid: true });
    vi.mocked(extractTextFromImage).mockResolvedValue({
      text: '체중: 70kg',
      confidence: 95.0,
    });
    vi.mocked(parseInBodyData).mockReturnValue({
      data: { weight: 70 },
      warnings: [],
      rawText: '체중: 70kg',
    });
    vi.mocked(prisma.inBodyRecord.create).mockResolvedValue({
      id: 'test-id',
      userId: 'temp-user-id',
      measuredAt: new Date(),
      weight: 70,
      ocrConfidence: 95.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    // Create mock request
    const mockRequest = {
      formData: async () => mockFormData,
    } as unknown as Request;

    const response = await POST(mockRequest as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.extractedData.weight).toBe(70);
    expect(validateImageFile).toHaveBeenCalledTimes(1);
    expect(extractTextFromImage).toHaveBeenCalledTimes(1);
    expect(parseInBodyData).toHaveBeenCalledTimes(1);
    expect(prisma.inBodyRecord.create).toHaveBeenCalledTimes(1);
  });

  it('파일이 없으면 400 에러를 반환해야 한다', async () => {
    const mockFormData = new FormData();
    // 파일 없음

    const mockRequest = {
      formData: async () => mockFormData,
    } as unknown as Request;

    const response = await POST(mockRequest as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errorCode).toBe('NO_FILE');
  });

  it('이미지 검증 실패 시 400 에러를 반환해야 한다', async () => {
    const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    const mockFormData = new FormData();
    mockFormData.append('file', mockFile);

    vi.mocked(validateImageFile).mockResolvedValue({
      valid: false,
      error: 'UNSUPPORTED_FORMAT' as const,
      errorDetails: '지원되지 않는 형식입니다',
    });

    const mockRequest = {
      formData: async () => mockFormData,
    } as unknown as Request;

    const response = await POST(mockRequest as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errorCode).toBe('UNSUPPORTED_FORMAT');
  });

  it('OCR 실패 시 500 에러를 반환해야 한다', async () => {
    const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    const mockFormData = new FormData();
    mockFormData.append('file', mockFile);

    vi.mocked(validateImageFile).mockResolvedValue({ valid: true });
    vi.mocked(extractTextFromImage).mockRejectedValue(new Error('OCR timeout'));

    const mockRequest = {
      formData: async () => mockFormData,
    } as unknown as Request;

    const response = await POST(mockRequest as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.errorCode).toBe('OCR_FAILURE');
  });

  it('DB 저장 실패 시 500 에러를 반환해야 한다', async () => {
    const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    const mockFormData = new FormData();
    mockFormData.append('file', mockFile);

    vi.mocked(validateImageFile).mockResolvedValue({ valid: true });
    vi.mocked(extractTextFromImage).mockResolvedValue({
      text: '체중: 70kg',
      confidence: 95.0,
    });
    vi.mocked(parseInBodyData).mockReturnValue({
      data: { weight: 70 },
      warnings: [],
      rawText: '체중: 70kg',
    });
    vi.mocked(prisma.inBodyRecord.create).mockRejectedValue(new Error('DB connection failed'));

    const mockRequest = {
      formData: async () => mockFormData,
    } as unknown as Request;

    const response = await POST(mockRequest as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.errorCode).toBe('DB_FAILURE');
  });
});
