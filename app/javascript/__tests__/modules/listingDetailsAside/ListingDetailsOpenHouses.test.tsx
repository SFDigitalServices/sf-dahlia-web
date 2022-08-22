import React from "react"
import renderer from "react-test-renderer"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { ListingDetailsOpenHouses } from "../../../modules/listingDetailsAside/ListingDetailsOpenHouses"

describe("ListingDetailsOpenHouses", () => {
  it("displays Open Houses with Listing containing Open_Houses", () => {
    const tree = renderer
      .create(<ListingDetailsOpenHouses listing={lotteryCompleteRentalListing} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("doesn't display anything with Listing not containing Open_Houses", () => {
    const listing = { ...lotteryCompleteRentalListing, Open_Houses: [] }
    const tree = renderer.create(<ListingDetailsOpenHouses listing={listing} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
