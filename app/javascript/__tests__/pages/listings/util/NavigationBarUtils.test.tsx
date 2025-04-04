import { handleSectionHeaderEntries } from "../../../../modules/listings/util/NavigationBarUtils"

const mockIntersectionObserverEntry = (id, isIntersecting, intersectionRatio) => {
  return {
    target: { id },
    isIntersecting: isIntersecting,
    intersectionRatio: intersectionRatio,
  } as IntersectionObserverEntry
}

describe("handleSectionHeaderEvents", () => {
  it("handleSectionHeaderEvents sets the correct active item", () => {
    const events: IntersectionObserverEntry[] = [
      mockIntersectionObserverEntry("buy-now", true, 0.2),
    ]

    const result = handleSectionHeaderEntries(events, null, 1)

    expect(result).toEqual("buy-now")
  })

  it("handleSectionHeaderEvents returns null for empty arrays", () => {
    const events: IntersectionObserverEntry[] = []

    const result = handleSectionHeaderEntries(events, null, -1)

    expect(result).toBeUndefined()
  })
})
