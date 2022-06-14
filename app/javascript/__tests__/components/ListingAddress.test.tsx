import React from "react"
import renderer from "react-test-renderer"
import { ListingAddress } from "../../components/ListingAddress"
import { openSaleListing } from "../data/RailsSaleListing/listing-sale-open"

describe("ListingAddress", () => {
  it("does not display address when address field missing", () => {
    const listing = { ...openSaleListing, Building_Zip_Code: "" }
    const tree = renderer.create(<ListingAddress listing={listing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it("displays address when all fields present", () => {
    const tree = renderer.create(<ListingAddress listing={openSaleListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
