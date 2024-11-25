import { renderHook } from "@testing-library/react"
import useScript from "../../hooks/useScript"

describe("useScript", () => {
  let querySelectorSpy
  let scriptElement: HTMLScriptElement
  let getAttributeSpy
  let setStatusMock
  let createElementSpy

  beforeEach(() => {
    scriptElement = document.createElement("script")
    setStatusMock = jest.fn()
    jest.spyOn(require("react"), "useState").mockImplementation(() => ["loading", setStatusMock])
    querySelectorSpy = jest.spyOn(document, "querySelector").mockImplementation(() => scriptElement)
    getAttributeSpy = jest.spyOn(scriptElement, "getAttribute").mockImplementation(() => "loading")
    createElementSpy = jest.spyOn(document, "createElement").mockImplementation(() => scriptElement)
  })

  afterEach(() => {
    jest.restoreAllMocks() // Restore original implementations after each test
  })

  it("create script element if enabled and src is present", () => {
    const src = "src"
    renderHook(() => useScript(src, false))
    expect(querySelectorSpy).toHaveBeenCalledWith(`script[src="${src}"]`)
    expect(getAttributeSpy).toHaveBeenCalledWith("data-status")
    expect(setStatusMock).toHaveBeenCalledWith("loading")
  })
  it("create script element if enabled and src is not present", () => {
    const src = undefined
    renderHook(() => useScript(src, false))
    expect(setStatusMock).toHaveBeenCalledWith("idle")
    expect(querySelectorSpy).not.toHaveBeenCalled()
    expect(getAttributeSpy).not.toHaveBeenCalled()
  })
  it("create script element if enabled and script is not present", () => {
    const src = "src"
    querySelectorSpy.mockReturnValue(null)
    renderHook(() => useScript(src, false))
    expect(querySelectorSpy).toHaveBeenCalledWith(`script[src="${src}"]`)
    expect(createElementSpy).toHaveBeenCalledWith("script")
    expect(scriptElement.src).toContain(src)

    expect(getAttributeSpy).not.toHaveBeenCalled()
  })
  it("do not create script element if disabled", () => {
    const src = "src"
    renderHook(() => useScript(src, true))
    expect(setStatusMock).toHaveBeenCalledWith("error")
    expect(querySelectorSpy).not.toHaveBeenCalled()
    expect(getAttributeSpy).not.toHaveBeenCalled()
  })
})
