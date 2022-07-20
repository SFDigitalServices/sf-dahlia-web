import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsFeatures } from "../../../modules/listingDetails/ListingDetailsFeatures"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsFeatures", () => {
  it("displays listing details features section", () => {
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
      .create(
        <ListingDetailsFeatures listing={closedRentalListing} imageSrc={"listing-features.svg"} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
