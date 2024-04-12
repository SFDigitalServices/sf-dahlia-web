/*eslint no-undef: "error"*/
/*eslint-env node*/

process.env.TZ = "UTC"
process.env.NODE_ENV = "test"

module.exports = {
  testRegex: "/*.test.(tsx|ts)$",
  collectCoverageFrom: ["**/*.(tsx|ts)"],
  coveragePathIgnorePatterns: ["<rootDir>/packs"],
  coverageReporters: ["lcov", "text"],
  coverageDirectory: "test-coverage",
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 80,
  //     statements: 80,
  //   },
  // },
  preset: "ts-jest",
  rootDir: "./app/javascript",
  roots: ["<rootDir>/"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        // ts-jest configuration goes here
        tsconfig: "tsconfig.json",
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setupTests.ts"],
  setupFiles: ["<rootDir>/__tests__/jest.setup.js"],
  moduleNameMapper: {
    "\\.(scss|css|less|jpg)$": "identity-obj-proxy",
    "^axios$": require.resolve("axios"),
  },
  transformIgnorePatterns: ["node_modules/?!(@bloom-housing/ui-components)"],
  reporters: ["default", "jest-junit"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testEnvironment: "jsdom",
}
