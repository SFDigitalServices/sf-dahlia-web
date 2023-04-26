/*eslint no-undef: "error"*/
/*eslint-env node*/

process.env.TZ = "UTC"
process.env.NODE_ENV = "test"
process.env.SRO_PLURAL_LISTINGS = JSON.stringify({
  a0W0P00000F7t4uUAB: "Merry Go Round Shared Housing",
  a0W0P00000FIuv3UAD: "1335 Folsom Street",
  a0W4U00000HlubxUAB: "1335 Folsom Street",
  a0W4U00000KGFDWUA5: "1335 Folsom Street",
  a0W4U00000KKtXyUAL: "750 Harrison",
})

module.exports = {
  testRegex: "/*.test.(tsx|ts)$",
  collectCoverageFrom: ["**/*.(tsx|ts)"],
  coverageReporters: ["lcov", "text"],
  coverageDirectory: "test-coverage",
  coverageThreshold: {
    global: {
      branches: 67,
      functions: 57,
      lines: 80,
      statements: 80,
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
  setupFilesAfterEnv: ["<rootDir>/__tests__/setupTests.ts"],
  moduleNameMapper: {
    "\\.(scss|css|less|jpg)$": "identity-obj-proxy",
  },
  transformIgnorePatterns: ["node_modules/?!(@bloom-housing/ui-components)"],
  moduleFileExtensions: ["tsx", "js", "ts"],
  reporters: ["default", "jest-junit"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testEnvironment: "jsdom",
  testTimeout: 20000,
}
