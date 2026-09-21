module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/src/modules/**/__tests__/**/*.test.js',
    '**/src/shared/**/__tests__/**/*.test.js',
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/modules/**/*.js',
    'src/shared/**/*.js',
    '!src/**/*.routes.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
