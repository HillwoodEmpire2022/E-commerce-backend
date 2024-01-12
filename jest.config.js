export default {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js'],
  testMatch: ['**/*.test.js'],
  transformIgnorePatterns: ['/node_modules/(?!my-module).+\\.js$'],
  collectCoverage: true,
  // Read Env Variable (Optional if Next line enabled)
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  testEnvironment: 'node',
  verbose: true,
};
