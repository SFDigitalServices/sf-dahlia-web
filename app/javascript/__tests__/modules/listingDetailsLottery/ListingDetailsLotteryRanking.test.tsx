import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsLotteryRanking } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryRanking"
import { lotteryResultRentalTwo } from "../../data/RailsLotteryResult/lottery-result-rental-two"
import { lotteryResultRentalOne } from "../../data/RailsLotteryResult/lottery-result-rental-one"
import { lotteryResultSaleGeneral } from "../../data/RailsLotteryResult/lottery-result-sale-general"

describe("ListingDetailsLotteryRanking", () => {
  it("displays lottery ranking for rental with two results - COP and L/W", () => {
    const tree = renderer
      .create(<ListingDetailsLotteryRanking lotteryResult={lotteryResultRentalTwo} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays lottery ranking for rental with one result - L/W", () => {
    const tree = renderer
      .create(<ListingDetailsLotteryRanking lotteryResult={lotteryResultRentalOne} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays lottery ranking for sale with general pool only", () => {
    const tree = renderer
      .create(<ListingDetailsLotteryRanking lotteryResult={lotteryResultSaleGeneral} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
