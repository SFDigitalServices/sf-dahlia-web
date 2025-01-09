import { renderHook } from "@testing-library/react"
import { useGTMInitializer } from "../../hooks/analytics/useInitializeGTM"
import TagManager from "react-gtm-module"

describe("useInitializeGTM", () => {
  let consoleSpy
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it("initializes GTM with the provided ID", () => {
    const gtmId = "GTM-12345"
    const options = { test: true }

    renderHook(() => useGTMInitializer(gtmId, options))

    expect(TagManager.initialize).toHaveBeenCalledWith({ gtmId, ...options })
  })

  it("errors out when no GTM id is provided", () => {
    const gtmId = undefined
    const options = { test: true }

    renderHook(() => useGTMInitializer(gtmId, options))

    expect(consoleSpy).toHaveBeenCalled()
  })
})
