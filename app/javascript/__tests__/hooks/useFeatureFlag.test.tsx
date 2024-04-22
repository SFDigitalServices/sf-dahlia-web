import { renderHook } from "@testing-library/react"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

// Note that in this test we are not using the global mock of Unleash
jest.mock("@unleash/proxy-client-react")

describe("useFeatureFlag", () => {
  afterEach(() => {
    jest.spyOn(require("@unleash/proxy-client-react"), "useFlag").mockRestore()
    jest.spyOn(require("@unleash/proxy-client-react"), "useFlagsStatus").mockRestore()
  })

  it("returns the default value when the flag is not set", () => {
    jest
      .spyOn(require("@unleash/proxy-client-react"), "useFlag")
      .mockImplementation(() => undefined)

    const { result } = renderHook(() => useFeatureFlag("testFlag", false))

    expect(result.current).toBe(false)
  })

  it("returns the default value when there is a flagError", () => {
    const consoleSpy = jest.spyOn(console, "error")
    jest.spyOn(require("@unleash/proxy-client-react"), "useFlagsStatus").mockImplementation(() => {
      return { flagsError: true }
    })

    const { result } = renderHook(() => useFeatureFlag("testFlag", false))

    expect(consoleSpy).toHaveBeenCalled()
    expect(result.current).toBe(false)
  })

  it("returns the actual Unleash value when there is no URL flag or loading errors", () => {
    const consoleSpy = jest.spyOn(console, "error")

    const { result } = renderHook(() => useFeatureFlag("testFlag", false))

    expect(consoleSpy).not.toHaveBeenCalled()
    expect(result.current).toBe(true)
  })

  it("returns true when the url override is set to true", () => {
    jest.spyOn(require("@unleash/proxy-client-react"), "useFlag").mockImplementation(() => {
      return false
    })
    Object.defineProperty(window, "location", {
      writable: true,
      value: { search: "?featureFlag[testFlag]=true" },
    })
    const consoleSpy = jest.spyOn(console, "error")

    const { result } = renderHook(() => useFeatureFlag("testFlag", false))

    expect(consoleSpy).not.toHaveBeenCalled()
    expect(result.current).toBe(true)
  })

  it("returns false when the url override is set to false", () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { search: "?featureFlag[testFlag]=false" },
    })
    const consoleSpy = jest.spyOn(console, "error")

    const { result } = renderHook(() => useFeatureFlag("testFlag", true))

    expect(consoleSpy).not.toHaveBeenCalled()
    expect(result.current).toBe(false)
  })

  it("returns the unleash flag when the url override is set to something random", () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { search: "?featureFlag[testFlag]=blablabla" },
    })
    const consoleSpy = jest.spyOn(console, "error")

    const { result } = renderHook(() => useFeatureFlag("testFlag", false))

    expect(consoleSpy).not.toHaveBeenCalled()
    expect(result.current).toBe(true)
  })

  it("returns the default flag when the url override is set to something random and there is no unleash flag available", () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { search: "?featureFlag[testFlag]=blablabla" },
    })
    jest.spyOn(require("@unleash/proxy-client-react"), "useFlagsStatus").mockImplementation(() => {
      return { flagsError: true }
    })
    jest.spyOn(require("@unleash/proxy-client-react"), "useFlag").mockImplementation(() => {
      return undefined
    })

    const consoleSpy = jest.spyOn(console, "error")

    const { result } = renderHook(() => useFeatureFlag("testFlag", false))

    expect(consoleSpy).toHaveBeenCalled()
    expect(result.current).toBe(false)
  })
})
