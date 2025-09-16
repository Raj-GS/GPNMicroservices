module.exports = {
  testEnvironment: "jsdom", // simulate browser environment
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^react-router-dom$": "<rootDir>/node_modules/react-router-dom",
  },
  collectCoverage: true,              // enable coverage collection
  coverageDirectory: "coverage",      // output folder for coverage
  coverageReporters: ["html", "text"], // HTML + console text
  reporters: [
    "default",                        // default Jest console reporter
    ["jest-html-reporter", {          // HTML test report
      pageTitle: "Test Report",
      outputPath: "reports/test-report.html",
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ],
  verbose: true,                      // show individual test names in console
};
