import React from "react"
import { cleanup, render } from "@testing-library/react"
import * as navBarUtils from "../../../../modules/listings/util/NavigationBarUtils"

const mockIntersectionObserverEntry = (id, isIntersecting, intersectionRatio) => {
  return {
    target: { id },
    isIntersecting: isIntersecting,
    intersectionRatio: intersectionRatio,
  } as IntersectionObserverEntry
}

const mockIntersectionObserver = jest.fn()
const mockResizeObserver = jest.fn()
const mockResizeObserveFunction = jest.fn()
const mockResizeDisconnectFunction = jest.fn()

describe("handleSectionHeaderEvents", () => {
  beforeEach(() => {
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver

    mockResizeObserver.mockReturnValue({
      observe: mockResizeObserveFunction,
      disconnect: mockResizeDisconnectFunction,
    })
    window.ResizeObserver = mockResizeObserver
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("handleSectionHeaderEvents sets the correct active item", () => {
    const events: IntersectionObserverEntry[] = [
      mockIntersectionObserverEntry("buy-now", true, 0.2),
    ]

    const result = navBarUtils.handleSectionHeaderEntries(events)

    expect(result).toEqual("buy-now")
  })

  it("handleSectionHeaderEvents returns null for empty arrays", () => {
    const events: IntersectionObserverEntry[] = []

    const result = navBarUtils.handleSectionHeaderEntries(events)

    expect(result).toBeUndefined()
  })

  it("component MenuIntersectionObserver can create and add an intersection observer", () => {
    const mockElement = jest.fn()
    mockElement.mockReturnValue({
      id: "elem_id",
      clientHeight: 100,
    })

    const setActiveItem = jest.fn()
    window.innerHeight = 200
    const ref = React.createRef<navBarUtils.MenuIntersectionObserverHandle>()

    render(<navBarUtils.MenuIntersectionObserver ref={ref} setActiveItem={setActiveItem} />)

    ref.current?.addObservedElement(mockElement)
    expect(mockResizeObserver).toHaveBeenCalled()
    expect(mockIntersectionObserver).toHaveBeenCalled()
  })
})
