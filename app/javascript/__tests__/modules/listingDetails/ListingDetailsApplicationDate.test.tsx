import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsApplicationDate } from "../../../modules/listingDetailsAside/ListingDetailsApplicationDate"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { notYetOpenSaleFcfsListing } from "../../data/RailsSaleListing/listing-sale-fcfs-not-yet-open"
import { closedFcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs-closed"
import { openFcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs-open"

describe("ListingDetailsApplicationDate lottery listing", () => {
  it("displays Application Deadline when listing is a sale and due date has not passed", () => {
    const { asFragment } = render(<ListingDetailsApplicationDate listing={openSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })
  it("displays Applications Closed when listing is a rental and due date has passed", () => {
    const { asFragment } = render(<ListingDetailsApplicationDate listing={closedRentalListing} />)

    expect(asFragment()).toMatchSnapshot()
  })
})

describe("ListingDetailsApplicationDate fcfs listing", () => {
  it("displays Application opens when listing is a fcfs sale listing and applications have not opened", () => {
    const { asFragment } = render(<ListingDetailsApplicationDate listing={openFcfsSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })
  it("displays Applications Closed when listing is a fcfs sale and applications are open", () => {
    const { asFragment } = render(<ListingDetailsApplicationDate listing={closedFcfsSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays Applications closed when listing is a fcfs sale and applications have closed", () => {
    const { asFragment } = render(
      <ListingDetailsApplicationDate listing={notYetOpenSaleFcfsListing} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
