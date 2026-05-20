import js from '@eslint/js';
import globals from 'globals';

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

import prettier from 'eslint-config-prettier';

import tseslint from 'typescript-eslint';

import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,

      ...tseslint.configs.strictTypeChecked,

      reactHooks.configs.flat.recommended,

      reactRefresh.configs.vite,

      prettier,
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },

      globals: globals.browser,
    },

    plugins: {
      'simple-import-sort': simpleImportSort,

      'unused-imports': unusedImports,
    },

    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      'simple-import-sort/imports': 'error',

      'simple-import-sort/exports': 'error',

      'unused-imports/no-unused-imports': 'error',

      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },

  {
    files: ['**/router/config.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
