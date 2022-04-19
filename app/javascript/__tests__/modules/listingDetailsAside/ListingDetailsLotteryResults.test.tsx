import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsLotteryResults } from "../../../modules/listingDetailsAside/ListingDetailsLotteryResults"
import { openSaleListing } from "../../data/listing-sale-open"
import { lotteryCompleteRentalListing } from "../../data/listing-rental-lottery-complete"

describe("ListingDetailsLotteryResults", () => {
  it("does not display if lottery is not complete", () => {
    const tree = renderer
      .create(<ListingDetailsLotteryResults listing={openSaleListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("display if lottery is complete", () => {
    const tree = renderer
      .create(<ListingDetailsLotteryResults listing={lotteryCompleteRentalListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
