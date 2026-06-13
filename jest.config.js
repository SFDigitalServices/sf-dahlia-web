/*eslint no-undef: "error"*/
/*eslint-env node*/

process.env.TZ = "UTC"
process.env.NODE_ENV = "test"
process.env.UNLEASH_ENV = "development"

module.exports = {
  testRegex: "/*.test.(tsx|ts)$",
  collectCoverageFrom: ["**/*.(tsx|ts)"],
  coveragePathIgnorePatterns: ["<rootDir>/packs"],
  coverageReporters: ["lcov"],
  coverageDirectory: "<rootDir>/../../jest-test-coverage",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
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
    "^@uic$": "<rootDir>/components/uic",
    "^axios$": require.resolve("axios"),
  },
  // @bloom-housing/ui-seeds ships untranspiled ESM and must be transformed by
  // babel; everything else under node_modules is left ignored. (Previously this
  // pattern named @bloom-housing/ui-components, which has since been vendored.)
  transformIgnorePatterns: ["node_modules/(?!(@bloom-housing/ui-seeds)/)"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testEnvironment: "jsdom",
  testSequencer: "<rootDir>/__tests__/CustomTestSequencer.ts",
}
