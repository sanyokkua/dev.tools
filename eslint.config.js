// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    { files: ['**/*.ts'] },
    {
        ignores: [
            '**/node_modules/',
            '.git/',
            '.config/',
            '.jest/',
            '.husky/',
            '.gitignore/',
            'gitignore/',
            '**/*.js',
            '**/*.mjs',
        ],
    },
    { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } } },
    { rules: { '@typescript-eslint/no-unsafe-assignment': 'warn', '@typescript-eslint/no-floating-promises': 'off' } },
);
