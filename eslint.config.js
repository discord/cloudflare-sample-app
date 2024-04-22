import prettier from 'eslint-plugin-prettier/recommended';
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  js.configs.recommended,
  prettier,
];
