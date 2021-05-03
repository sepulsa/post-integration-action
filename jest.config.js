module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['**/*.ts', '!src/entries/**'],
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  verbose: true,
}
