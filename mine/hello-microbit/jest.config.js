module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/coverage.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['main.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'json-summary'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
};
