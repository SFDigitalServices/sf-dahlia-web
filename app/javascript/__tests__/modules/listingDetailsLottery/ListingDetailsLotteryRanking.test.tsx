import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsLotteryRanking } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryRanking"
import { lotteryResultRentalTwo } from "../../data/RailsLotteryResult/lottery-result-rental-two"
import { lotteryResultRentalOne } from "../../data/RailsLotteryResult/lottery-result-rental-one"
import { lotteryResultSaleGeneral } from "../../data/RailsLotteryResult/lottery-result-sale-general"

describe("ListingDetailsLotteryRanking", () => {
  it("displays lottery ranking for rental with two results - COP and L/W", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryRanking lotteryResult={lotteryResultRentalTwo} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays lottery ranking for rental with one result - L/W", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryRanking lotteryResult={lotteryResultRentalOne} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays lottery ranking for sale with general pool only", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryRanking lotteryResult={lotteryResultSaleGeneral} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
