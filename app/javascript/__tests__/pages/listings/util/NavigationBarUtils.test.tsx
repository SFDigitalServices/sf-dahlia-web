import {
  handleSectionHeaderEntries,
  isElementInViewport,
} from "../../../../modules/listings/util/NavigationBarUtils"

const mockIntersectionObserverEntry = (id, isIntersecting) => {
  return {
    target: { id },
    isIntersecting,
  } as IntersectionObserverEntry
}

describe("handleSectionHeaderEvents", () => {
  it("handleSectionHeaderEvents sets the correct active item", () => {
    const events: IntersectionObserverEntry[] = [
      mockIntersectionObserverEntry("enter-a-lottery", false),
      mockIntersectionObserverEntry("buy-now", true),
      mockIntersectionObserverEntry("lottery-results", false),
    ]

    handleSectionHeaderEntries(events)

    expect(handleSectionHeaderEntries(events)).toEqual("buy-now")
  })

  it("handleSectionHeaderEvents sets the correct active item based on order", () => {
    const events: IntersectionObserverEntry[] = [
      mockIntersectionObserverEntry("enter-a-lottery", true),
      mockIntersectionObserverEntry("buy-now", true),
      mockIntersectionObserverEntry("lottery-results", false),
    ]

    handleSectionHeaderEntries(events)

    expect(handleSectionHeaderEntries(events)).toEqual("enter-a-lottery")
  })
})

describe("isElementInViewport", () => {
  it("isElementInViewport returns true for element on screen", () => {
    const container = {
      getBoundingClientRect: jest.fn().mockReturnValue({ top: 0 }),
      clientHeight: 50,
    } as unknown as HTMLElement
    expect(isElementInViewport(container)).toBeTruthy()
  })

  it("isElementInViewport returns false for element off screen", () => {
    const container = {
      getBoundingClientRect: jest.fn().mockReturnValue({ top: -100 }),
      clientHeight: 50,
    } as unknown as HTMLElement
    expect(isElementInViewport(container)).toBeFalsy()
  })
})
