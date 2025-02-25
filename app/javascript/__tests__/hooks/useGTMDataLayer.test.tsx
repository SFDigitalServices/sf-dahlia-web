import React from "react"
import { renderHook } from "@testing-library/react"
import {
  useGTMDataLayer,
  useGTMDataLayerWithoutUserContext,
} from "../../hooks/analytics/useGTMDataLayer"
import TagManager from "react-gtm-module"
import UserContext from "../../authentication/context/UserContext"
import { mockProfileStub } from "../__util__/accountUtils"

describe("useGTMDataLayer", () => {
  let consoleSpy
  const mockedDate = new Date()

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    jest.useFakeTimers()
    jest.setSystemTime(mockedDate)
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe("User Information is available", () => {
    let pushToDataLayer

    beforeEach(() => {
      const wrapper = ({ children }) => (
        <UserContext.Provider value={{ profile: mockProfileStub }}>{children}</UserContext.Provider>
      )

      const { result } = renderHook(() => useGTMDataLayer(), { wrapper })

      pushToDataLayer = result.current.pushToDataLayer
    })

    it("pushes data to the data layer", () => {
      const event = "testEvent"
      const data = { test: "data" }

      pushToDataLayer(event, data)

      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event,
          event_timestamp: mockedDate.toISOString(),
          ...data,
          user_id: mockProfileStub.id,
        },
      })
    })

    it("errors out when no event is provided", () => {
      const event = undefined
      const data = { test: "data" }

      pushToDataLayer(event, data)

      expect(consoleSpy).toHaveBeenCalled()
    })

    it("errors out when an event property is provided in the data object", () => {
      const event = "testEvent"
      const data = { test: "data", event: "testEvent" }

      pushToDataLayer(event, data)

      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe("User Information is not available", () => {
    let pushToDataLayer

    beforeEach(() => {
      const wrapper = ({ children }) => (
        <UserContext.Provider value={{ profile: undefined }}>{children}</UserContext.Provider>
      )

      const { result } = renderHook(() => useGTMDataLayer(), { wrapper })

      pushToDataLayer = result.current.pushToDataLayer
    })

    it("pushed data to the data layer but with an undefined user_id", () => {
      const event = "testEvent"
      const data = { test: "data" }

      pushToDataLayer(event, data)

      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event,
          event_timestamp: mockedDate.toISOString(),
          ...data,
          user_id: undefined, // when a value is undefined it is ignored by GTM
        },
      })
    })
  })

  describe("useGTMDataLayerWithoutUserContext", () => {
    let pushToDataLayer

    beforeEach(() => {
      const { result } = renderHook(() => useGTMDataLayerWithoutUserContext())

      pushToDataLayer = result.current.pushToDataLayer
    })

    it("pushed data to the data layer but without a user_id", () => {
      const event = "testEvent"
      const data = { test: "data" }

      pushToDataLayer(event, data)

      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event,
          event_timestamp: mockedDate.toISOString(),
          ...data,
        },
      })
    })
  })
})
