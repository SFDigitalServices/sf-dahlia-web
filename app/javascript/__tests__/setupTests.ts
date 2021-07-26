import "@testing-library/jest-dom/extend-expect"

import { cleanup } from "@testing-library/react"
import { configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

import { LanguagePrefix, loadTranslations } from "../util/languageUtil"

configure({ adapter: new Adapter() })

afterEach(cleanup)

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
