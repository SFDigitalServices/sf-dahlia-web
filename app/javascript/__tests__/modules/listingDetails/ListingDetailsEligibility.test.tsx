import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsEligibility } from "../../../modules/listingDetails/ListingDetailsEligibility"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsLotteryInfo", () => {
  it("displays listing details eligibility section", () => {
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
        <ListingDetailsEligibility
          listing={closedRentalListing}
          imageSrc={"listing-eligibility.svg"}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
