import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsApplicationDate } from "../../../modules/listingDetailsAside/ListingDetailsApplicationDate"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsApplicationDate", () => {
  it("displays Application Deadline when listing is a sale and due date has not passed", () => {
    const { asFragment } = render(
      <ListingDetailsApplicationDate isApplicationOpen={true} listing={openSaleListing} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it("displays Applications Closed when listing is a rental and due date has passed", () => {
    const { asFragment } = render(
      <ListingDetailsApplicationDate isApplicationOpen={false} listing={closedRentalListing} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
