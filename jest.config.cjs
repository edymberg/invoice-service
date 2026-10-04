/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 70,
    },
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/infrastructure/adapters/inbound/http/generated/",
    "/src/infrastructure/adapters/outbound/sdk/afip/AfipSdkElectronicBillingMockAdapter.ts",
    "/src/infrastructure/adapters/outbound/sdk/afip/AfipSdkElectronicBillingDevAdapter.ts",
  ],
};
