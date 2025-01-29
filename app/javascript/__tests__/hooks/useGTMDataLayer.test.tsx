import { renderHook } from "@testing-library/react"
import { useGTMDataLayer } from "../../hooks/analytics/useGTMDataLayer"
import TagManager from "react-gtm-module"

describe("useGTMDataLayer", () => {
  let consoleSpy

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it("pushes data to the data layer", () => {
    const event = "testEvent"
    const data = { test: "data" }

    const { result } = renderHook(() => useGTMDataLayer())

    result.current.pushToDataLayer(event, data)

    expect(TagManager.dataLayer).toHaveBeenCalledWith({ dataLayer: { event, ...data } })
  })

  it("errors out when no data is provided", () => {
    const event = "testEvent"
    const data = undefined

    const { result } = renderHook(() => useGTMDataLayer())

    result.current.pushToDataLayer(event, data)

    expect(consoleSpy).toHaveBeenCalled()
  })

  it("errors out when no event is provided", () => {
    const event = undefined
    const data = { test: "data" }

    const { result } = renderHook(() => useGTMDataLayer())

    result.current.pushToDataLayer(event, data)

    expect(consoleSpy).toHaveBeenCalled()
  })

  it("errors out when an event property is provided in the data object", () => {
    const event = "testEvent"
    const data = { test: "data", event: "testEvent" }

    const { result } = renderHook(() => useGTMDataLayer())

    result.current.pushToDataLayer(event, data)

    expect(consoleSpy).toHaveBeenCalled()
  })
})
