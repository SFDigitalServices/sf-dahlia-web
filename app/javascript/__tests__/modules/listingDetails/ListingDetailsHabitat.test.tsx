import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsHabitat } from "../../../modules/listingDetails/ListingDetailsHabitat"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

describe("ListingDetailsHabitat", () => {
  it("does not display when not habitat listing", () => {
    const { asFragment } = render(<ListingDetailsHabitat listing={closedRentalListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays habitat info when habitat listing", () => {
    const { asFragment } = render(<ListingDetailsHabitat listing={habitatListing} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
