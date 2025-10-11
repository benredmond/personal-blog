// jest.setup.js
// ABOUTME: Jest setup file that configures the testing environment
// ABOUTME: Handles React initialization, mocks, and global configurations

// Import testing utilities
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({
  asyncUtilTimeout: 5000, // Increase timeout for async operations
});

// Ensure global.IS_REACT_ACT_ENVIRONMENT is set to true
// This tells React that the environment has proper act() support
global.IS_REACT_ACT_ENVIRONMENT = true;

// Polyfill setImmediate for Jest environment
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => {
    return setTimeout(callback, 0, ...args);
  };
}

// Polyfill TextEncoder/TextDecoder for Jest environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      const buf = Buffer.from(str, 'utf-8');
      const arr = new Uint8Array(buf.length);
      for (let i = 0; i < buf.length; i++) {
        arr[i] = buf[i];
      }
      return arr;
    }
  };
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(arr) {
      return Buffer.from(arr).toString('utf-8');
    }
  };
}

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ posts: [], total: 0 }),
    text: async () => '',
    headers: new Headers(),
    statusText: 'OK',
  })
);
