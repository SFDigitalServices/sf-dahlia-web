import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsProcess } from "../../../modules/listingDetailsAside/ListingDetailsProcess"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"

describe("ListingDetailsProcess", () => {
  it("renders leasing agent section if exists", () => {
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
    
    const { asFragment } = render(
      <ListingDetailsProcess listing={lotteryCompleteRentalListing} isApplicationOpen={true} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
