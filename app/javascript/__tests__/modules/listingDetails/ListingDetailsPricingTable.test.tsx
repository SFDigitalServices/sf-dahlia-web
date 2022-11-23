import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsPricingTable } from "../../../modules/listingDetails/ListingDetailsPricingTable"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

describe("ListingDetailsPricingTable", () => {
  it("renders ListingDetailsPricingTable component", () => {
    const tree = renderer
      .create(<ListingDetailsPricingTable listing={closedRentalListing} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("does not render ListingDetailsPricingTable when habitat listing", () => {
    const tree = renderer.create(<ListingDetailsPricingTable listing={habitatListing} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
