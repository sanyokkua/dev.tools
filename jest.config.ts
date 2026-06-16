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
    moduleNameMapper: {
        // uuid v13 is pure ESM; Jest can't parse it — use a CJS shim
        '^uuid$': '<rootDir>/test/__mocks__/uuid.js',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/common/(.*)$': '<rootDir>/src/common/$1',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^prettier/standalone$': '<rootDir>/node_modules/prettier/standalone.js',
        '^prettier/plugins/(.*)$': '<rootDir>/node_modules/prettier/plugins/$1.js',
        '^@prettier/plugin-xml$': '<rootDir>/node_modules/@prettier/plugin-xml/src/plugin.js',
    },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
