import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            '**/node_modules/',
            '**/__tests__/',
            '.git/',
            '.config/',
            '.jest/',
            'out/',
            '.husky/',
            '.gitignore/',
            'gitignore/',
            '.next/',
            '**/*.js',
            '**/*.mjs',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/explicit-module-boundary-types': 'warn',
            'no-useless-escape': 'error',
        },
    },
    {
        files: ['test/**/*.ts', 'test/**/*.tsx'],
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
        },
    },
);
