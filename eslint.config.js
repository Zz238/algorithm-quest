import globals from 'globals';
import vue from 'eslint-plugin-vue';

export default [
  {
    ignores: [
      'dist/**',
      'offline.html',
      'java-validation/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  ...vue.configs['flat/essential'],
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.{js,mjs}', '*.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { 'no-undef': 'error', 'no-unreachable': 'error' },
  },
];
