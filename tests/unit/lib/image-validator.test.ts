import { describe, it, expect, vi } from 'vitest';
import {
  validateImageFile,
  ImageValidationError,
  getSupportedFormats,
  getMaxFileSize,
  getMaxFileSizeReadable,
} from '@/lib/image-validator';

// Mock File 생성 헬퍼
function createMockFile(
  type: string,
  size: number,
  magicBytes: number[] = [],
): File {
  // ArrayBuffer 생성
  const bufferSize = magicBytes.length > 0 ? magicBytes.length : size;
  const buffer = new Uint8Array(bufferSize);
  magicBytes.forEach((byte, index) => {
    buffer[index] = byte;
  });

  const mockFile = {
    name: 'test.jpg',
    type,
    size,
    arrayBuffer: vi.fn().mockResolvedValue(buffer.buffer),
  } as unknown as File;

  return mockFile;
}

// JPEG Magic bytes
const JPEG_MAGIC_BYTES = [0xff, 0xd8, 0xff];

// PNG Magic bytes
const PNG_MAGIC_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe('Image Validator', () => {
  describe('validateImageFile', () => {
    describe('유효한 파일 검증', () => {
      it('JPEG 파일을 검증해야 한다', async () => {
        const jpegFile = createMockFile('image/jpeg', 1024, JPEG_MAGIC_BYTES);

        const result = await validateImageFile(jpegFile);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('PNG 파일을 검증해야 한다', async () => {
        const pngFile = createMockFile('image/png', 1024, PNG_MAGIC_BYTES);

        const result = await validateImageFile(pngFile);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('10MB 이하의 파일을 허용해야 한다', async () => {
        const file = createMockFile('image/jpeg', 10 * 1024 * 1024, JPEG_MAGIC_BYTES);

        const result = await validateImageFile(file);

        expect(result.valid).toBe(true);
      });
    });

    describe('무효한 파일 검증', () => {
      it('빈 파일을 거부해야 한다', async () => {
        const emptyFile = createMockFile('image/jpeg', 0, []);

        const result = await validateImageFile(emptyFile);

        expect(result.valid).toBe(false);
        expect(result.error).toBe(ImageValidationError.EMPTY_FILE);
        expect(result.errorDetails).toContain('비어있습니다');
      });

      it('10MB를 초과하는 파일을 거부해야 한다', async () => {
        const largeFile = createMockFile('image/jpeg', 11 * 1024 * 1024, JPEG_MAGIC_BYTES);

        const result = await validateImageFile(largeFile);

        expect(result.valid).toBe(false);
        expect(result.error).toBe(ImageValidationError.FILE_TOO_LARGE);
        expect(result.errorDetails).toContain('10MB');
      });

      it('지원되지 않는 형식을 거부해야 한다 - GIF', async () => {
        const gifFile = createMockFile('image/gif', 1024, [0x47, 0x49, 0x46]);

        const result = await validateImageFile(gifFile);

        expect(result.valid).toBe(false);
        expect(result.error).toBe(ImageValidationError.UNSUPPORTED_FORMAT);
        expect(result.errorDetails).toContain('image/gif');
      });

      it('지원되지 않는 형식을 거부해야 한다 - WebP', async () => {
        const webpFile = createMockFile('image/webp', 1024, []);

        const result = await validateImageFile(webpFile);

        expect(result.valid).toBe(false);
        expect(result.error).toBe(ImageValidationError.UNSUPPORTED_FORMAT);
      });

      it('지원되지 않는 형식을 거부해야 한다 - PDF', async () => {
        const pdfFile = createMockFile('application/pdf', 1024, [0x25, 0x50, 0x44, 0x46]);

        const result = await validateImageFile(pdfFile);

        expect(result.valid).toBe(false);
        expect(result.error).toBe(ImageValidationError.UNSUPPORTED_FORMAT);
      });

      it('Magic bytes가 일치하지 않는 파일을 거부해야 한다', async () => {
        // JPEG MIME 타입이지만 PNG Magic bytes를 가진 파일
        const fakeFile = createMockFile('image/jpeg', 1024, PNG_MAGIC_BYTES);

        const result = await validateImageFile(fakeFile);

        expect(result.valid).toBe(false);
        expect(result.error).toBe(ImageValidationError.INVALID_MAGIC_BYTES);
        expect(result.errorDetails).toContain('위조');
      });
    });

    describe('경계값 테스트', () => {
      it('정확히 10MB 파일을 허용해야 한다', async () => {
        const file = createMockFile('image/jpeg', 10 * 1024 * 1024, JPEG_MAGIC_BYTES);

        const result = await validateImageFile(file);

        expect(result.valid).toBe(true);
      });

      it('10MB + 1바이트를 거부해야 한다', async () => {
        const file = createMockFile('image/jpeg', 10 * 1024 * 1024 + 1, JPEG_MAGIC_BYTES);

        const result = await validateImageFile(file);

        expect(result.valid).toBe(false);
        expect(result.error).toBe(ImageValidationError.FILE_TOO_LARGE);
      });

      it('1바이트 파일 (Magic bytes만)을 허용해야 한다', async () => {
        const file = createMockFile('image/jpeg', 3, JPEG_MAGIC_BYTES);

        const result = await validateImageFile(file);

        expect(result.valid).toBe(true);
      });
    });
  });

  describe('getSupportedFormats', () => {
    it('지원되는 형식 목록을 반환해야 한다', () => {
      const formats = getSupportedFormats();

      expect(formats).toContain('image/jpeg');
      expect(formats).toContain('image/png');
      expect(formats).toHaveLength(2);
    });
  });

  describe('getMaxFileSize', () => {
    it('최대 파일 크기를 bytes로 반환해야 한다', () => {
      const maxSize = getMaxFileSize();

      expect(maxSize).toBe(10 * 1024 * 1024);
    });
  });

  describe('getMaxFileSizeReadable', () => {
    it('최대 파일 크기를 사람이 읽기 쉬운 형식으로 반환해야 한다', () => {
      const maxSizeReadable = getMaxFileSizeReadable();

      expect(maxSizeReadable).toBe('10MB');
    });
  });
});
