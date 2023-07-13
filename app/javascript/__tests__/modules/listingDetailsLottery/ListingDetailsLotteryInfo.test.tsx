import React from "react"
import { render } from "@testing-library/react"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { ListingDetailsLotteryInfo } from "../../../modules/listingDetailsLottery/LotteryDetailsLotteryInfo"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsLotteryInfo", () => {
  it("does not display when listing has no lottery date", () => {
    // mock a listing with no lottery date
    const testListing = { ...openSaleListing, Lottery_Date: null }

    const { asFragment } = render(<ListingDetailsLotteryInfo listing={testListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("does not display when listing is open", () => {
    const { asFragment } = render(<ListingDetailsLotteryInfo listing={openSaleListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays when listing has upcoming lottery", () => {
    const testListing = { ...closedRentalListing }

    const { asFragment } = render(<ListingDetailsLotteryInfo listing={testListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("does not display when listing has a completed lottery", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryInfo listing={lotteryCompleteRentalListing} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
