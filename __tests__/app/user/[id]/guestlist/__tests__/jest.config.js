module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../../../$1',
  },
  
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  
  testPathIgnorePatterns: [
    '<rootDir>/.next/', 
    '<rootDir>/node_modules/',
    '<rootDir>/setup.ts',
    '<rootDir>/jest.config.js',
    '<rootDir>/mocks/',
    '<rootDir>/utils/',
  ],
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/setup.ts',
    '!**/jest.config.js',
    '!**/mocks/**',
    '!**/utils/**',
  ],
  
  clearMocks: true,
  restoreMocks: true,
  
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
};