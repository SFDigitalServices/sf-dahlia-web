import { renderHook } from "@testing-library/react"
import useTranslate from "../../hooks/useTranslate"
import * as useScript from "../../hooks/useScript"
import * as usePollElementRender from "../../hooks/usePollElementRender"

describe("useTranslate", () => {
  let getCurrentLanguageSpy
  let useScriptSpy
  let usePollElementRenderSpy
  let querySelectorSpy
  let selectElement: HTMLSelectElement
  let dispatchEventSpy
  beforeEach(() => {
    selectElement = document.createElement("select")
    getCurrentLanguageSpy = jest
      .spyOn(require("../../util/languageUtil"), "getCurrentLanguage")
      .mockImplementation(() => "en")
    querySelectorSpy = jest.spyOn(document, "querySelector").mockReturnValue(selectElement)

    dispatchEventSpy = jest.spyOn(selectElement, "dispatchEvent").mockImplementation(() => {
      return true
    })
  })

  afterEach(() => {
    jest.restoreAllMocks() // Restore original implementations after each test
  })

  it("render dom element for translation when enabled", () => {
    useScriptSpy = jest.spyOn(useScript, "default").mockImplementation(() => "ready")
    usePollElementRenderSpy = jest
      .spyOn(usePollElementRender, "default")
      .mockImplementation(() => true)

    renderHook(() => useTranslate(false))
    expect(getCurrentLanguageSpy).toHaveBeenCalled()
    expect(useScriptSpy).toHaveBeenCalledWith(
      "//translate.google.com/translate_a/element.js?cb=initGoogleTranslate",
      false
    )
    expect(usePollElementRenderSpy).toHaveBeenCalledWith("select.goog-te-combo option", false)
    expect(querySelectorSpy).toHaveBeenCalledWith("select.goog-te-combo")
    expect(dispatchEventSpy).toHaveBeenCalled()
  })

  it("do not render dom element for translation when disabled", () => {
    useScriptSpy = jest.spyOn(useScript, "default").mockImplementation(() => "error")
    usePollElementRenderSpy = jest
      .spyOn(usePollElementRender, "default")
      .mockImplementation(() => false)

    renderHook(() => useTranslate(true))
    expect(getCurrentLanguageSpy).not.toHaveBeenCalled()
    expect(useScriptSpy).toHaveBeenCalledWith(
      "//translate.google.com/translate_a/element.js?cb=initGoogleTranslate",
      true
    )
    expect(usePollElementRenderSpy).toHaveBeenCalledWith("select.goog-te-combo option", true)
    expect(querySelectorSpy).not.toHaveBeenCalled()
    expect(dispatchEventSpy).not.toHaveBeenCalled()
  })
})
