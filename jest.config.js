export default {
  transform: {
    "^.+\\.js$": "babel-jest", // Transform ES6 modules using Babel
  },
  moduleFileExtensions: ["js"],
  testMatch: ["**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  collectCoverage: true,
  // Read Env Variable (Optional if Next line enabled)
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  testEnvironment: "node",
  verbose: true,
};
