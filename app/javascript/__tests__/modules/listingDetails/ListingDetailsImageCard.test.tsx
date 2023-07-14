import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsImageCard } from "../../../modules/listingDetails/ListingDetailsImageCard"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"

describe("ListingDetailsImageCard", () => {
  it("displays image card when no tag", () => {
    const { asFragment } = render(<ListingDetailsImageCard listing={openSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays tag when listing is habitat for humanity", () => {
    const { asFragment } = render(<ListingDetailsImageCard listing={habitatListing} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
