import React from "react"
import renderer from "react-test-renderer"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { ListingDetailsLotteryInfo } from "../../../modules/listingDetailsLottery/LotteryDetailsLotteryInfo"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsLotteryInfo", () => {
  it("does not display when listing has no lottery date", () => {
    // mock a listing with no lottery date
    const testListing = { ...openSaleListing, Lottery_Date: null }
    const tree = renderer.create(<ListingDetailsLotteryInfo listing={testListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("does not display when listing is open", () => {
    const tree = renderer.create(<ListingDetailsLotteryInfo listing={openSaleListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays when listing has upcoming lottery", () => {
    const testListing = { ...closedRentalListing }
    const tree = renderer.create(<ListingDetailsLotteryInfo listing={testListing} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("does not display when listing has a completed lottery", () => {
    const tree = renderer
      .create(<ListingDetailsLotteryInfo listing={lotteryCompleteRentalListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
