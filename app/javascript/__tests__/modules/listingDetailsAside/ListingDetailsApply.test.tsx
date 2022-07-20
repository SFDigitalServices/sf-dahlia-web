import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsApply } from "../../../modules/listingDetailsAside/ListingDetailsApply"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsApply", () => {
  it("does not render if listing is closed", () => {
    const tree = renderer.create(<ListingDetailsApply listing={closedRentalListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it("renders if listing is open", () => {
    const tree = renderer.create(<ListingDetailsApply listing={openSaleListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
