module.exports = {
  displayName: 'seating-tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/../../../../../jest.setup.js',
    '<rootDir>/setup/jest.setup.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../../../../src/$1',
  },
  testMatch: [
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    '<rootDir>/../**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/../**/*.d.ts',
    '!<rootDir>/../**/*.test.{js,jsx,ts,tsx}',
    '!<rootDir>/../**/__tests__/**/*',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
}; 