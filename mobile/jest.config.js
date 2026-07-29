module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-typescript'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
