import React from "react"
import renderer from "react-test-renderer"
import { openSaleListing } from "../../data/listing-sale-open"
import { lotteryCompleteRentalListing } from "../../data/listing-rental-lottery-complete"
import { ListingDetailsLottery } from "../../../modules/listingDetailsLottery/ListingDetailsLottery"

describe("ListingDetailsLottery", () => {
  it("does not display if lottery is not complete", () => {
    const tree = renderer.create(<ListingDetailsLottery listing={openSaleListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("display if lottery is complete", () => {
    const tree = renderer
      .create(<ListingDetailsLottery listing={lotteryCompleteRentalListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
