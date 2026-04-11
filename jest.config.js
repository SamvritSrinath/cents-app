module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/web-build/'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**',
  ],
  // Ratchet upward as more hooks/screens gain tests (collectCoverageFrom is broad).
  coverageThreshold: {
    global: {
      statements: 14,
      branches: 14,
      functions: 9,
      lines: 14,
    },
  },
};
