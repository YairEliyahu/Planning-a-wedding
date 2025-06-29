import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Setup global text encoder/decoder for Node.js environment
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock AbortSignal.timeout for older Node versions
if (!global.AbortSignal?.timeout) {
  Object.defineProperty(global.AbortSignal, 'timeout', {
    value: (delay: number) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), delay);
      return controller.signal;
    },
    writable: true,
  });
}

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock FileReader for tests
Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: class FileReader {
    result: string | ArrayBuffer | null = null;
    onload: ((this: FileReader, ev: any) => any) | null = null;
    onerror: ((this: FileReader, ev: any) => any) | null = null;
    
    readAsArrayBuffer(_file: Blob) {
      setTimeout(() => {
        this.result = new ArrayBuffer(8);
        if (this.onload) {
          this.onload.call(this, { target: this } as any);
        }
      }, 0);
    }
    
    readAsText(_file: Blob) {
      setTimeout(() => {
        this.result = 'mock file content';
        if (this.onload) {
          this.onload.call(this, { target: this } as any);
        }
      }, 0);
    }
    
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
  }
});

// Mock window.URL for blob operations
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'URL', {
    value: {
      createObjectURL: jest.fn(() => 'blob:mock-url'),
      revokeObjectURL: jest.fn(),
    },
    writable: true,
  });
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useParams: () => ({ id: 'test-user-id' }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/user/test-user-id/guestlist',
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      connectedUserId: null,
      sharedEventId: null,
      profileComplete: true,
    },
    isAuthReady: true,
    isLoading: false,
  }),
}));

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: An invalid form control'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
}); 