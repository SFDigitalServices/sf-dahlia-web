import { handleSectionHeaderEvents } from "../../../../modules/listings/util/NavigationBarUtils"

const mockIntersectionObserverEntry = (id, isIntersecting, intersectionRatio) => {
  return {
    target: { id },
    isIntersecting,
    intersectionRatio,
  } as IntersectionObserverEntry
}

describe("handleSectionHeaderEvents", () => {
  const mockSetActiveItem = jest.fn()

  it("handleSectionHeaderEvents sets the correct active item", () => {
    const events: IntersectionObserverEntry[] = [
      mockIntersectionObserverEntry("section-1", true, 0.5),
      mockIntersectionObserverEntry("section-2", true, 0.8),
      mockIntersectionObserverEntry("section-3", false, 0),
    ]

    handleSectionHeaderEvents(events, "section-1", mockSetActiveItem)

    expect(mockSetActiveItem).toHaveBeenCalledWith("section-2")
  })

  it("handleSectionHeaderEvents sets the correct active item based on ratio", () => {
    const events: IntersectionObserverEntry[] = [
      mockIntersectionObserverEntry("section-1", true, 0.8),
      mockIntersectionObserverEntry("section-2", true, 0.5),
      mockIntersectionObserverEntry("section-3", false, 0),
    ]

    handleSectionHeaderEvents(events, "section-1", mockSetActiveItem)

    expect(mockSetActiveItem).toHaveBeenCalledWith("section-1")
  })
})
