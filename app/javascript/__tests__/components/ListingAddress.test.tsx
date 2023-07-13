import React from "react"
import { render } from "@testing-library/react"
import { ListingAddress } from "../../components/ListingAddress"
import { openSaleListing } from "../data/RailsSaleListing/listing-sale-open"

describe("ListingAddress", () => {
  it("does not display address when address field missing", () => {
    const listing = { ...openSaleListing, Building_Zip_Code: "" }

    const { asFragment } = render(<ListingAddress listing={listing} />)

    expect(asFragment()).toMatchSnapshot()
  })
  it("displays address when all fields present", () => {
    const { asFragment } = render(<ListingAddress listing={openSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
