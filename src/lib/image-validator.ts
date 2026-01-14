/**
 * TAG-DATA-TASK-003: 이미지 검증 서비스 구현
 * SPEC-DATA-001-02, SPEC-DATA-001-03: 파일 형식, 크기, 보안 검증
 */

/**
 * 이미지 검증 서비스
 * SPEC-DATA-001-02, SPEC-DATA-001-03: 파일 형식, 크기, 보안 검증
 */

export enum ImageValidationError {
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_MAGIC_BYTES = 'INVALID_MAGIC_BYTES',
  EMPTY_FILE = 'EMPTY_FILE',
}

export interface ImageValidationResult {
  valid: boolean;
  error?: ImageValidationError;
  errorDetails?: string;
}

// 지원되는 이미지 형식
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png'] as const;

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Magic bytes (파일 형식 위조 방지)
const MAGIC_BYTES = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
} as const;

/**
 * 이미지 파일을 검증합니다
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  // 빈 파일 체크
  if (file.size === 0) {
    return {
      valid: false,
      error: ImageValidationError.EMPTY_FILE,
      errorDetails: '파일이 비어있습니다',
    };
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: ImageValidationError.FILE_TOO_LARGE,
      errorDetails: `파일 크기가 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과했습니다 (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  // MIME 타입 검증
  if (!SUPPORTED_FORMATS.includes(file.type as any)) {
    return {
      valid: false,
      error: ImageValidationError.UNSUPPORTED_FORMAT,
      errorDetails: `지원되지 않는 형식입니다: ${file.type}. 지원되는 형식: ${SUPPORTED_FORMATS.join(', ')}`,
    };
  }

  // Magic bytes 검증 (파일 형식 위조 방지)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const expectedMagicBytes = MAGIC_BYTES[file.type as keyof typeof MAGIC_BYTES];
    if (!expectedMagicBytes) {
      return {
        valid: false,
        error: ImageValidationError.UNSUPPORTED_FORMAT,
        errorDetails: `Magic bytes를 찾을 수 없습니다: ${file.type}`,
      };
    }

    // Magic bytes 비교
    for (let i = 0; i < expectedMagicBytes.length; i++) {
      if (uint8Array[i] !== expectedMagicBytes[i]) {
        return {
          valid: false,
          error: ImageValidationError.INVALID_MAGIC_BYTES,
          errorDetails: `파일 형식이 위조되었습니다. 예상: ${file.type}, 실제: 다른 형식`,
        };
      }
    }
  } catch (error) {
    return {
      valid: false,
      error: ImageValidationError.INVALID_MAGIC_BYTES,
      errorDetails: `Magic bytes 검증 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }

  return {
    valid: true,
  };
}

/**
 * 지원되는 이미지 형식 목록을 반환합니다
 */
export function getSupportedFormats(): readonly string[] {
  return SUPPORTED_FORMATS;
}

/**
 * 최대 파일 크기를 반환합니다 (bytes)
 */
export function getMaxFileSize(): number {
  return MAX_FILE_SIZE;
}

/**
 * 최대 파일 크기를 사람이 읽기 쉬운 형식으로 반환합니다
 */
export function getMaxFileSizeReadable(): string {
  return `${MAX_FILE_SIZE / 1024 / 1024}MB`;
}
