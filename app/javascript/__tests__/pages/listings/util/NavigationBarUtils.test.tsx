import React from "react"
import { cleanup, render } from "@testing-library/react"
import * as navBarUtils from "../../../../modules/listings/util/NavigationBarUtils"
import { DIRECTORY_PAGE_HEADER } from "../../../../modules/constants"

const mockIntersectionObserverEntry = (id, offsetTop, isIntersecting, intersectionRatio) => {
  return {
    target: { id: id, offsetTop: offsetTop },
    isIntersecting: isIntersecting,
    intersectionRatio: intersectionRatio,
  } as unknown as IntersectionObserverEntry
}

const mockElement = (id, clientHeight) => {
  return {
    id: id,
    clientHeight: clientHeight,
  } as unknown as HTMLElement
}

const mockIntersectionObserver = jest.fn()
const mockIntersectionObserveFunction = jest.fn()
const mockIntersetionDisconnectFunction = jest.fn()
const mockResizeObserver = jest.fn()
const mockResizeObserveFunction = jest.fn()
const mockResizeDisconnectFunction = jest.fn()

describe("navBarUtils", () => {
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
    jest.resetModules()
  })

  it("handleSectionHeaderEvents sets the correct active item", () => {
    const callback = jest.fn()
    navBarUtils.handleIntersectionEntries(
      [mockIntersectionObserverEntry("buy-now", 0, true, 0.2)],
      callback
    )
    expect(callback).toHaveBeenCalledWith("buy-now")
    callback.mockClear()

    jest.mock("../../../../modules/listings/util/NavigationBarUtils", () => {
      const originalUtils = jest.requireActual(
        "../../../../modules/listings/util/NavigationBarUtils"
      )
      return {
        __esModule: true,
        ...originalUtils,
        scrollDirection: 1,
      }
    })
    navBarUtils.handleIntersectionEntries(
      [mockIntersectionObserverEntry("lottery-results", 100, true, 0.2)],
      callback
    )
    expect(callback).toHaveBeenCalledWith("lottery-results")
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
    window.innerHeight = 200

    navBarUtils.addIntersectionObserver(mockElement("element_id", 100), callback)

    expect(mockIntersectionObserver).toHaveBeenCalled()
    expect(mockIntersectionObserveFunction).toHaveBeenCalled()
    expect(mockResizeObserveFunction).toHaveBeenCalled()
  })

  it("initObservers recreates intersection observers", () => {
    const callback = jest.fn()
    window.innerHeight = 200

    navBarUtils.addIntersectionObserver(mockElement("element1_id", 100), callback)
    navBarUtils.addIntersectionObserver(mockElement("element2_id", 100), callback)

    navBarUtils.initObservers(callback)

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(2)
    expect(mockIntersectionObserveFunction).toHaveBeenCalledTimes(2)
    expect(mockResizeDisconnectFunction).toHaveBeenCalled()
    expect(mockResizeObserveFunction).toHaveBeenCalledTimes(2)
  })

  it("scrollListener correctly updates variables to track latest scrollY coordinate and scroll direction", () => {
    window.scrollY = 10
    navBarUtils.scrollListener()

    expect(navBarUtils.scrollDirection).toEqual(1)
    expect(navBarUtils.lastScrollY).toEqual(10)

    window.scrollY = 5
    navBarUtils.scrollListener()

    expect(navBarUtils.scrollDirection).toEqual(-1)
    expect(navBarUtils.lastScrollY).toEqual(5)
  })

  it("handleIntersectionEntries processes the directory page header", () => {
    const callback = jest.fn()
    const mockToggle = jest.fn()
    const mockQuerySelector = jest.fn()
    mockQuerySelector.mockReturnValue({
      getBoundingClientRect: jest.fn().mockReturnValue({ top: 0 }),
      clientHeight: 50,
      classList: {
        toggle: mockToggle,
      },
    } as unknown as HTMLElement)
    document.querySelector = mockQuerySelector

    navBarUtils.handleIntersectionEntries(
      [mockIntersectionObserverEntry(DIRECTORY_PAGE_HEADER, 0, true, 0.2)],
      callback
    )
    expect(mockToggle).toHaveBeenCalledTimes(1)
    mockToggle.mockClear()

    navBarUtils.handleIntersectionEntries(
      [mockIntersectionObserverEntry(DIRECTORY_PAGE_HEADER, 0, false, 0.2)],
      callback
    )
    expect(mockToggle).toHaveBeenCalledTimes(2)
  })
})
