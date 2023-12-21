export default {
  transform: {
    "^.+\\.js$": "babel-jest", // Transform ES6 modules using Babel
  },
  moduleFileExtensions: ["js"],
  testMatch: ["**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  collectCoverage: true,
};
