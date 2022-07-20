import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsProcess } from "../../../modules/listingDetailsAside/ListingDetailsProcess"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"

describe("ListingDetailsProcess", () => {
  it("renders leasing agent section if exists", () => {
    const tree = renderer
      .create(<ListingDetailsProcess listing={lotteryCompleteRentalListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
