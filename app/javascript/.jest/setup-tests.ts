import "@testing-library/jest-dom/extend-expect"

import { configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"
import { addTranslation } from "@sf-digital-services/ui-components"
import enPhrases from "../../assets/json/translations/react/en.json"
import { LanguagePrefix, loadTranslations } from "../util/languageUtil"
import { cleanup } from "@testing-library/react"

configure({ adapter: new Adapter() })

afterEach(cleanup)

// see: https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }
})

loadTranslations(LanguagePrefix.English)

// fail on console errors. This allows us to catch missing
// translations warnings in our code. Snippet from
// https://stackoverflow.com/a/50584643
const error = console.error
console.error = function (message: Error | string) {
  error.apply(console, arguments) // keep default behaviour
  throw (message instanceof Error ? message : new Error(message))
}
