// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tailwindcss from 'eslint-plugin-tailwindcss';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // public/mockServiceWorker.js は msw が生成するファイルのため対象外
  globalIgnores(['dist', 'dev-dist', 'public']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      // eslint-plugin-tailwindcss の型定義は typescript-eslint の FlatConfig 型を使っており、
      // ESLint の defineConfig が受け取る型と languageOptions の定義が一致しないため型エラーになる。
      // 実行時の動作には影響しない。
      // @ts-expect-error -- プラグイン側の型定義の不整合
      tailwindcss.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      // eslint-plugin-react-hooks v7 の型定義では configs.flat が入れ子のオブジェクトのため、
      // ESLint の Plugin 型に代入できず型エラーになる。実行時の動作には影響しない。
      // https://github.com/facebook/react/issues/32370
      // @ts-expect-error -- プラグイン側の型定義の不整合
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      tailwindcss:
        /** @type {import('eslint-plugin-tailwindcss').PluginSettings} */
        ({
          cssConfigPath: './src/index.css',
        }),
    },
    rules: {
      // eslint-plugin-react-hooks v4 の recommended と同じルールのみ有効化する
      // (v7 の recommended には React Compiler 向けのルールが追加されている)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      // Prettier で実施するので ESLint の Rule は無効化
      'tailwindcss/classnames-order': ['off'],
      // index.css で定義している独自クラス
      'tailwindcss/no-custom-classname': [
        'warn',
        { whitelist: ['code-block-wrap'] },
      ],
      curly: ['error', 'all'],
    },
  },
]);
