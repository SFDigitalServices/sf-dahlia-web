import React from "react"
import { render } from "@testing-library/react"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { ListingDetailsOpenHouses } from "../../../modules/listingDetailsAside/ListingDetailsOpenHouses"

describe("ListingDetailsOpenHouses", () => {
  it("displays Open Houses with Listing containing Open_Houses", () => {
    const { asFragment } = render(
      <ListingDetailsOpenHouses listing={lotteryCompleteRentalListing} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("doesn't display anything with Listing not containing Open_Houses", () => {
    const listing = { ...lotteryCompleteRentalListing, Open_Houses: [] }

    const { asFragment } = render(<ListingDetailsOpenHouses listing={listing} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
