import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsNeighborhood } from "../../../modules/listingDetails/ListingDetailsNeighborhood"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"

describe("ListingDetailsNeighborhood", () => {
  it("displays map", () => {
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
        <ListingDetailsNeighborhood imageSrc={"test"} listing={lotteryCompleteRentalListing} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
