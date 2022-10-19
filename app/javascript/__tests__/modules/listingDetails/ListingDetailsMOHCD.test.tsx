import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsMOHCD } from "../../../modules/listingDetails/ListingDetailsMOHCD"

describe("ListingDetailsMOHCD", () => {
  it("renders MOHCD component", () => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    })
    const tree = renderer.create(<ListingDetailsMOHCD />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
