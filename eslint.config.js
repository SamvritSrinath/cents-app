const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.config({
    extends: ['expo', 'prettier'],
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
    ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'web-build/', 'eslint.config.js'],
  }),
];
