import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsImageCard } from "../../../modules/listingDetails/ListingDetailsImageCard"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"

describe("ListingDetailsImageCard", () => {
  it("displays image card when no tag", () => {
    const tree = renderer.create(<ListingDetailsImageCard listing={openSaleListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays tag when listing is habitat for humanity", () => {
    const tree = renderer.create(<ListingDetailsImageCard listing={habitatListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
