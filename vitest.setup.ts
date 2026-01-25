import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {}
  }),
  useSearchParams: () => ({
    get: vi.fn()
  }),
  usePathname: () => '/'
}))

// Mock Next.js server components
vi.mock('next/server', () => ({
  NextResponse: class NextResponse {
    static json(data: any, init?: ResponseInit) {
      return new Response(JSON.stringify(data), init)
    }
    static redirect(url: string, init?: number | ResponseInit) {
      const status = typeof init === 'number' ? init : init?.status || 307
      return new Response(null, { status, headers: { Location: url } })
    }
  },
  NextRequest: class NextRequest extends Request {
    constructor(input: string | RequestInfo, init?: RequestInit) {
      super(input, init)
    }
  }
}))

// Mock Next.js config
vi.mock('next/config', () => ({
  getConfig: () => ({
    publicRuntimeConfig: {},
    serverRuntimeConfig: {}
  })
}))

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated'
  })),
  signIn: vi.fn(),
  signOut: vi.fn()
}))

// Mock Tesseract.js with PSM enum
vi.mock('tesseract.js', () => {
  const createWorker = vi.fn(() => Promise.resolve({
    loadLanguage: vi.fn(() => Promise.resolve()),
    initialize: vi.fn(() => Promise.resolve()),
    recognize: vi.fn(() => Promise.resolve({
      data: {
        text: '',
        confidence: 95,
      }
    })),
    terminate: vi.fn(() => Promise.resolve()),
  }));

  // PSM enum
  const PSM = {
    AUTO: '3',
    SINGLE_BLOCK: '6',
    SPARSE_TEXT: '11',
    RAW_LINE: '13',
  };

  return {
    default: { createWorker },
    createWorker,
    PSM,
  };
});

// Mock @google-cloud/vision
vi.mock('@google-cloud/vision', () => {
  const mockImageAnnotatorClient = vi.fn(() => ({
    documentTextDetection: vi.fn(() => Promise.resolve([{
      fullTextAnnotation: {
        text: 'Sample text',
        pages: [{ confidence: 0.95 }],
      }
    }])),
  }));

  return {
    default: {
      ImageAnnotatorClient: mockImageAnnotatorClient,
    },
  };
});

// Mock Canvas API for happy-dom

// Mock Image class for testing
global.Image = class Image {
  onload: ((this: Image, ev: Event) => any) | null = null;
  onerror: ((this: Image, ev: Event) => any) | null = null;
  src: string = '';
  width: number = 0;
  height: number = 0;

  constructor() {
    // Simulate async image loading
    setTimeout(() => {
      if (this.src) {
        this.width = 800;
        this.height = 600;
        if (this.onload) {
          this.onload.call(this, new Event('load'));
        }
      }
    }, 0);
  }
} as any;

// Mock ImageData constructor
global.ImageData = class ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(data: Uint8ClampedArray, width: number, height?: number) {
    this.data = data;
    this.width = width;
    this.height = height ?? (data.length / 4 / width);
  }
} as any;

HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === '2d') {
    // Mock 2D context
    const mockImageData = {
      data: new Uint8ClampedArray(4),
      width: 0,
      height: 0,
    };

    return {
      fillStyle: '',
      fillRect: vi.fn(),
      getImageData: vi.fn((x: number, y: number, w: number, h: number) => {
        // Return actual ImageData with proper size
        const data = new Uint8ClampedArray(w * h * 4);
        return new ImageData(data, w, h);
      }),
      putImageData: vi.fn(),
      createImageData: vi.fn((w: number, h: number) => {
        const data = new Uint8ClampedArray(w * h * 4);
        return new ImageData(data, w, h);
      }),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      font: '',
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
    } as any;
  }
  return null;
}) as any;

// Mock document.createElement for canvas
const originalCreateElement = document.createElement;
document.createElement = function(tagName: string, ...args: any[]) {
  const element = originalCreateElement.call(document, tagName, ...args);

  if (tagName.toLowerCase() === 'canvas') {
    // Override width/height setters to make them work
    Object.defineProperty(element, 'width', {
      get: function() { return this._width || 0; },
      set: function(val) { this._width = val; },
    });
    Object.defineProperty(element, 'height', {
      get: function() { return this._height || 0; },
      set: function(val) { this._height = val; },
    });
  }

  return element;
};

// Cleanup after each test
afterEach(() => {
  cleanup()
})
