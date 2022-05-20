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
      branches: 45,
      functions: 45,
      lines: 60,
      statements: 60,
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
  setupFilesAfterEnv: ["<rootDir>/__tests__/setupTests.ts"],
  moduleNameMapper: {
    "\\.(scss|css|less)$": "identity-obj-proxy",
  },
  "transformIgnorePatterns": ["node_modules/?!(@bloom-housing/ui-components)"]
}
