module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'partylich',
  ],
  plugins: [
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'new-cap': [
      'error',
      {
        'capIsNew': false,
      },
    ],
    'no-duplicate-case': 'error',
    'spaced-comment': ['error', 'always', { 'markers': ['/', '!'] }],
  },
  overrides: [
    // typescript
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: ['*.js'],
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/array-type': [
          'error',
          { 'default': 'generic' },
        ],
        '@typescript-eslint/method-signature-style': [
          'error',
          'property',
        ],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/member-delimiter-style': [
          'error',
          {
            multiline: {
              delimiter: 'semi',
              requireLast: true,
            },
            singleline: {
              delimiter: 'semi',
              requireLast: false,
            },
            multilineDetection: 'brackets',
          },
        ],
      },
    },
  ],
};
