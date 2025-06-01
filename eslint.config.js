// eslint.config.js for ESLint v9+ flat config
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    plugins: { react },
    rules: {
      ...react.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  prettier,
  {
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      'public/',
      'src-tauri/',
    ],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        Node: 'readonly',
        setTimeout: 'readonly',
      },
      // browser environment
    },
  },
];
