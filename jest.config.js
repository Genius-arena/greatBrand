// jest.config.js
module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/tests/'
    ],
    coverageReporters: ['text', 'lcov'],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    // setupFiles: ['<rootDir>/tests/setup.js'],
    testTimeout: 30000,
    verbose: true
  };