module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  forceExit: true,
  testTimeout: 30000,
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/__tests__/**/*.test.ts'],
};