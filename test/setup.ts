import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextDecoder, TextEncoder });
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: false });

global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();
