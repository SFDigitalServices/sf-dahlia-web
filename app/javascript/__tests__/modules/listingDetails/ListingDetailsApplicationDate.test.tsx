import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsApplicationDate } from "../../../modules/listingDetailsAside/ListingDetailsApplicationDate"
import { openSaleListing } from "../../data/listing-sale-open"
import { closedRentalListing } from "../../data/listing-rental-closed"

describe("ListingDetailsApplicationDate", () => {
  it("displays Application Deadline when listing is a sale and due date has not passed", () => {
    const tree = renderer
      .create(<ListingDetailsApplicationDate isApplicationOpen={true} listing={openSaleListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
  it("displays Applications Closed when listing is a rental and due date has passed", () => {
    const tree = renderer
      .create(
        <ListingDetailsApplicationDate isApplicationOpen={false} listing={closedRentalListing} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
