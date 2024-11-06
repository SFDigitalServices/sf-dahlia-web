/* eslint-disable jest/no-standalone-expect */
import "@testing-library/jest-dom"
import axios from "axios"
import { cleanup } from "@testing-library/react"

import { LanguagePrefix, loadTranslations } from "../util/languageUtil"

document.documentElement.lang = "en"

const spies = {
  delete: jest.spyOn(axios, "delete"),
  get: jest.spyOn(axios, "get"),
  post: jest.spyOn(axios, "post"),
  put: jest.spyOn(axios, "put"),
  create: jest.spyOn(axios, "create"),
}

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

beforeEach(() => {
  jest.resetAllMocks()
})

// fail test if api call has not been mocked up
afterEach(() => {
  cleanup()
  expect(spies.delete).not.toHaveBeenCalled()
  expect(spies.get).not.toHaveBeenCalled()
  expect(spies.post).not.toHaveBeenCalled()
  expect(spies.put).not.toHaveBeenCalled()
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
