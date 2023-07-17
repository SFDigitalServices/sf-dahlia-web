import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsInfoSession } from "../../../modules/listingDetailsAside/ListingDetailsInfoSession"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsInfoSession", () => {
  it("renders ListingDetailsInfoSession component", () => {
    const { asFragment } = render(<ListingDetailsInfoSession listing={openSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("does not render ListingDetailsInfoSession component whith no information sessions attached to listing", () => {
    const closedListingWithoutInfoSessions = {
      ...closedRentalListing,
      Information_Sessions: [],
    }

    const { asFragment } = render(
      <ListingDetailsInfoSession listing={closedListingWithoutInfoSessions} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
