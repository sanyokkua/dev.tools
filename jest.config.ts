import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    // Add more setup options before each test is run
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
    testMatch: ['**/test/**/*.test.ts', '**/test/**/*.test.tsx'],
    coverageThreshold: { global: { lines: 93, functions: 73, branches: 87, statements: 93 } },
    coveragePathIgnorePatterns: ['/node_modules/', '\\.generated\\.ts$'],
    moduleNameMapper: {
        // TypeScript ESM uses explicit .js extensions; Jest can't resolve .js → .ts without this
        '^(\\.{1,2}/.*)\\.js$': '$1',
        // uuid v13 is pure ESM; Jest can't parse it — use a CJS shim
        '^uuid$': '<rootDir>/test/__mocks__/uuid.js',
        // browser-fs-access is ESM-only; use a CJS shim for Jest
        '^browser-fs-access$': '<rootDir>/test/__mocks__/browser-fs-access.js',
        '^@/contexts/(.*)$': '<rootDir>/src/components/contexts/$1',
        '^@/controls/(.*)$': '<rootDir>/src/components/controls/$1',
        '^@/layouts/(.*)$': '<rootDir>/src/components/layouts/$1',
        '^@/elements/(.*)$': '<rootDir>/src/components/elements/$1',
        '^@/page-specific/(.*)$': '<rootDir>/src/components/page-specific/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/common/(.*)$': '<rootDir>/src/common/$1',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^prettier/standalone$': '<rootDir>/node_modules/prettier/standalone.js',
        '^prettier/plugins/(.*)$': '<rootDir>/node_modules/prettier/plugins/$1.js',
        '^@prettier/plugin-xml$': '<rootDir>/node_modules/@prettier/plugin-xml/src/plugin.js',
        '^jsonpath-plus$': '<rootDir>/node_modules/jsonpath-plus/dist/index-node-cjs.cjs',
    },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
