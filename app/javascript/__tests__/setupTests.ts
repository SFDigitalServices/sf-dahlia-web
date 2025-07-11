/* eslint-disable jest/no-standalone-expect */
import "@testing-library/jest-dom"
import axios from "axios"
import { cleanup } from "@testing-library/react"
import failOnConsole from "jest-fail-on-console"

import { LanguagePrefix, loadTranslations } from "../util/languageUtil"

document.documentElement.lang = "en"

const spies = {
  delete: jest.spyOn(axios, "delete"),
  get: jest.spyOn(axios, "get"),
  post: jest.spyOn(axios, "post"),
  put: jest.spyOn(axios, "put"),
  create: jest.spyOn(axios, "create"),
}

const inspectMode = process.env.INSPECT_MODE === "true"

failOnConsole({
  shouldFailOnLog: !inspectMode,
  shouldFailOnInfo: !inspectMode,
  shouldFailOnWarn: !inspectMode,
  shouldFailOnError: !inspectMode,
  shouldFailOnAssert: !inspectMode,
})
// If you want to permit a console message, you can use the following:
// ```
// const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
// Run code that triggers a warning
// spy.mockRestore(); // Restore original behavior after test
// ```
// Make sure that you absorb the console output so that it doesn't clutter the test output.

// The current nanoid implementation is not compatible with jest. This is a temporary workaround until the issue is resolved
// https://github.com/ai/nanoid/issues/363
jest.mock("nanoid", () => {
  return {
    nanoid: () => {},
  }
})

jest.mock("@unleash/proxy-client-react", () => {
  return {
    __esModule: true,
    useFlag: () => true,
    useFlagsStatus: () => ({ flagsError: false }),
    FlagProvider: ({ children }) => children,
  }
})

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

// eslint-disable-next-line jest/require-top-level-describe
beforeEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
  jest.spyOn(console, "log").mockImplementation(() => {})
})

let previousHeapUsage: number | null = null
const THRESHOLD_PERCENTAGE = 5

// eslint-disable-next-line jest/require-top-level-describe
afterEach(() => {
  if (inspectMode) {
    const testName = expect.getState().currentTestName
    const currentHeapUsage = process.memoryUsage().heapUsed / 1024 / 1024
    const roundedUsage = Math.round(currentHeapUsage * 100) / 100

    if (previousHeapUsage !== null) {
      const increase = ((currentHeapUsage - previousHeapUsage) / previousHeapUsage) * 100
      if (increase > THRESHOLD_PERCENTAGE) {
        console.error(
          `Test "${testName}" caused an anomalous heap increase: ${
            Math.round(previousHeapUsage * 100) / 100
          } MB -> ${roundedUsage} MB (${Math.round(increase * 100) / 100}% increase).`
        )
      }
    }

    previousHeapUsage = currentHeapUsage
  }
  cleanup()

  // fail test if api call has not been mocked up
  expect(spies.delete).not.toHaveBeenCalled()
  expect(spies.get).not.toHaveBeenCalled()
  expect(spies.post).not.toHaveBeenCalled()
  expect(spies.put).not.toHaveBeenCalled()
  jest.restoreAllMocks()
})

// see: https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
window.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}))

void loadTranslations(LanguagePrefix.English)

process.env.GOOGLE_TAG_MANAGER_KEY = "GTM-123456"
jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

// FIXME: Re-enable when this issue is deployed
// https://github.com/bloom-housing/bloom/issues/1378
// // fail on console warnings. This allows us to catch missing
// // translations warnings in our code. Snippet from
// // https://stackoverflow.com/a/50584643
// const error = console.error
// console.error = function (message: Error | string, ...args: unknown[]) {
//   error.apply(console, args) // keep default behaviour
//   throw message instanceof Error ? message : new Error(message)
// }
