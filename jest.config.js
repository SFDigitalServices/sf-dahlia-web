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
  // React 19 renders are heavier; large pages (e.g. listing detail) can exceed the 5s
  // default, especially under parallel workers with coverage. Raise the ceiling.
  testTimeout: 20000,
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
    // ui-components 14 tables pull in @dnd-kit -> @preact/signals-core. Under jsdom, Jest
    // resolves the package's "browser" export (ESM), which it can't parse. Force the CJS
    // build so the ui-components barrel import loads in tests.
    "^@preact/signals-core$": require.resolve("@preact/signals-core"),
  },
  transformIgnorePatterns: ["node_modules/?!(@bloom-housing/ui-components)"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testEnvironment: "jsdom",
  testSequencer: "<rootDir>/__tests__/CustomTestSequencer.ts",
}
