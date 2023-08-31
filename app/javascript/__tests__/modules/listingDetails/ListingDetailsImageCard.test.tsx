import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsImageCard } from "../../../modules/listingDetails/ListingDetailsImageCard"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { saleEducatorListing } from "../../data/RailsSaleListing/listing-sale-educator"
import { rentalEducatorListing } from "../../data/RailsRentalListing/listing-rental-educator"

describe("ListingDetailsImageCard", () => {
  it("displays image card when no tag", () => {
    const { asFragment } = render(<ListingDetailsImageCard listing={openSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays tag when listing is habitat for humanity", () => {
    const { asFragment } = render(<ListingDetailsImageCard listing={habitatListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays tag when sale listing is for educators", () => {
    const { asFragment } = render(<ListingDetailsImageCard listing={saleEducatorListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays tag when rental listing is for educators", () => {
    const { asFragment } = render(<ListingDetailsImageCard listing={rentalEducatorListing} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
