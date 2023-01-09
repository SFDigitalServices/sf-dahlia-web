import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsUnitAccordions } from "../../../modules/listingDetails/ListingDetailsUnitAccordions"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"

describe("ListingDetailsUnitAccordion", () => {
  it("displays the unit accordions for a given listing", () => {
    // This component pulls in react-media, which needs this custom mock
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
    const tree = renderer
      .create(<ListingDetailsUnitAccordions listingId={openSaleListing.Id} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
