import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsLotteryPreferences } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryPreferences"
import { lotteryResultRentalThree } from "../../data/RailsLotteryResult/lottery-result-rental-three"
import { lotteryResultSaleTwo } from "../../data/RailsLotteryResult/lottery-result-sale-two"

describe("ListingDetailsLotteryPreferences", () => {
  it("displays 3 default preferences - COP, DTHP, L/W", () => {
    const tree = renderer
      .create(<ListingDetailsLotteryPreferences lotteryBucketsDetails={lotteryResultRentalThree} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays 2 preferences - NRHP, L/W", () => {
    const tree = renderer
      .create(<ListingDetailsLotteryPreferences lotteryBucketsDetails={lotteryResultSaleTwo} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
