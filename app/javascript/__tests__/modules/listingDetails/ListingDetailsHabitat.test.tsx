import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsHabitat } from "../../../modules/listingDetails/ListingDetailsHabitat"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

describe("ListingDetailsHabitat", () => {
  it("does not display when not habitat listing", () => {
    const tree = renderer.create(<ListingDetailsHabitat listing={closedRentalListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays habitat info when habitat listing", () => {
    const tree = renderer.create(<ListingDetailsHabitat listing={habitatListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
