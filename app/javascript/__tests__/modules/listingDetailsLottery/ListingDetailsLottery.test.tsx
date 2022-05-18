import React from "react"
import renderer from "react-test-renderer"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { ListingDetailsLottery } from "../../../modules/listingDetailsLottery/ListingDetailsLottery"
import { lotteryCompleteRentalListingWithSummary } from "../../data/RailsRentalListing/listing-rental-lottery-complete-with-summary"

describe("ListingDetailsLottery", () => {
  it("does not display if lottery is not complete", () => {
    const tree = renderer.create(<ListingDetailsLottery listing={openSaleListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays if lottery is complete", () => {
    const tree = renderer
      .create(<ListingDetailsLottery listing={lotteryCompleteRentalListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays if lottery is complete with summary", () => {
    const tree = renderer
      .create(<ListingDetailsLottery listing={lotteryCompleteRentalListingWithSummary} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
