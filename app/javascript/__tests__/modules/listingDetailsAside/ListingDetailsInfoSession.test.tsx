import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsInfoSession } from "../../../modules/listingDetailsAside/ListingDetailsInfoSession"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsInfoSession", () => {
  it("renders ListingDetailsInfoSession component", () => {
    const tree = renderer.create(<ListingDetailsInfoSession listing={openSaleListing} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("does not render ListingDetailsInfoSession component whith no information sessions attached to listing", () => {
    const closedListingWithoutInfoSessions = {
      ...closedRentalListing,
      Information_Sessions: [],
    }

    const tree = renderer
      .create(<ListingDetailsInfoSession listing={closedListingWithoutInfoSessions} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
