import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsWaitlist } from "../../../modules/listingDetailsAside/ListingDetailsWaitlist"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"

describe("ListingDetailsWaitlist", () => {
  it("does not render waitlist section if listing has no waitlist", () => {
    const { asFragment } = render(<ListingDetailsWaitlist listing={openSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })
  it("renders waitlist section if listing has waitlist", () => {
    const { asFragment } = render(<ListingDetailsWaitlist listing={lotteryCompleteRentalListing} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
