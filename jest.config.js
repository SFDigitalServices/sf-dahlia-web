/*eslint no-undef: "error"*/
/*eslint-env node*/

process.env.TZ = "UTC"
process.env.NODE_ENV = "test"

module.exports = {
  testRegex: "/*.test.(tsx|ts)$",
  collectCoverageFrom: ["**/*.(tsx|ts)"],
  coverageReporters: ["lcov", "text"],
  coverageDirectory: "test-coverage",
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  rootDir: "./app/javascript",
  roots: ["<rootDir>/"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["<rootDir>/.jest/setup-tests.ts"],
  moduleNameMapper: {
    "\\.(scss|css|less)$": "identity-obj-proxy",
  },
  "transformIgnorePatterns": [
    "node_modules/?!(@sf-digital-services/ui-components)"
  ]
}
