import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsApply } from "../../../modules/listingDetailsAside/ListingDetailsApply"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"

describe("ListingDetailsApplicationDate", () => {
  it("does not render waitlist section if listing has no waitlist", () => {
    const tree = renderer.create(<ListingDetailsApply listing={openSaleListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it("renders waitlist section if listing has waitlist", () => {
    const tree = renderer
      .create(<ListingDetailsApply listing={lotteryCompleteRentalListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
