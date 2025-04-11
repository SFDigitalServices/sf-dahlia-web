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
const mockIntersectionObserveFunction = jest.fn()
const mockIntersetionDisconnectFunction = jest.fn()
const mockResizeObserver = jest.fn()
const mockResizeObserveFunction = jest.fn()
const mockResizeDisconnectFunction = jest.fn()

describe("handleSectionHeaderEvents", () => {
  beforeEach(() => {
    mockIntersectionObserver.mockReturnValue({
      observe: mockIntersectionObserveFunction,
      disconnect: mockIntersetionDisconnectFunction,
    })
    window.IntersectionObserver = mockIntersectionObserver

    mockResizeObserver.mockReturnValue({
      observe: mockResizeObserveFunction,
      disconnect: mockResizeDisconnectFunction,
    })
    window.ResizeObserver = mockResizeObserver

    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback): number => {
        // eslint-disable-next-line node/no-callback-literal
        cb(0)
        return 0
      })
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

  it("handleResize does nothing when height changes by less than 0.2", () => {
    const setActiveItem = jest.fn()
    const entry = {
      target: {
        id: "entry_id",
      },
      contentRect: {
        height: 100,
      },
    }
    // eslint-disable-next-line dot-notation
    navBarUtils.elementHeights["entry_id"] = 100
    const initObserversSpy = jest.spyOn(navBarUtils, "initObservers")

    // eslint-disable-next-line dot-notation, import/namespace
    navBarUtils.handleResize([entry], setActiveItem)
    expect(initObserversSpy).not.toHaveBeenCalled()
  })

  it("handleResize triggers initObservers when height change is greater than 0.2", () => {
    const setActiveItem = jest.fn()
    const entry = {
      target: {
        id: "entry_id",
      },
      contentRect: {
        height: 200,
      },
    }
    // eslint-disable-next-line dot-notation
    navBarUtils.elementHeights["entry_id"] = 100
    const initObserversSpy = jest.spyOn(navBarUtils, "initObservers")

    // eslint-disable-next-line dot-notation, import/namespace
    navBarUtils.handleResize([entry], setActiveItem)
    expect(initObserversSpy).toHaveBeenCalled()
  })

  it("addIntersectionObserver creates a custom IntersectionObserver and watches for resize", () => {
    const callback = jest.fn()
    const element = {
      id: "element_id",
      clientHeight: 100,
    } as unknown as HTMLElement
    window.innerHeight = 200

    navBarUtils.addIntersectionObserver(element, callback)

    expect(mockIntersectionObserver).toHaveBeenCalled()
    expect(mockIntersectionObserveFunction).toHaveBeenCalled()
    expect(mockResizeObserveFunction).toHaveBeenCalled()
  })
})
