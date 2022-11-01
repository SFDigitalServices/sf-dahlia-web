import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsAside } from "../../../modules/listingDetailsAside/ListingDetailsAside"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsPricingTable", () => {
  it("renders ListingDetailsAside component", () => {
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
      .create(<ListingDetailsAside listing={closedRentalListing} imageSrc="" />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
