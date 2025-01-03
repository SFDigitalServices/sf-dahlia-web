import { handleSectionHeaderEntries } from "../../../../modules/listings/util/NavigationBarUtils"

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

  it("handleSectionHeaderEvents sets the correct active item based on ratio", () => {
    const events: IntersectionObserverEntry[] = [
      mockIntersectionObserverEntry("enter-a-lottery", true),
      mockIntersectionObserverEntry("buy-now", true),
      mockIntersectionObserverEntry("lottery-results", false),
    ]

    handleSectionHeaderEntries(events)

    expect(handleSectionHeaderEntries(events)).toEqual("buy-now")
  })
})
