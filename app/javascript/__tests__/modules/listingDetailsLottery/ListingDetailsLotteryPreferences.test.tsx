import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsLotteryPreferences } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryPreferences"
import { lotteryResultRentalBucketsThree } from "../../data/RailsLotteryResult/lottery-result-rental-buckets-three"
import { lotteryResultSaleBucketsTwo } from "../../data/RailsLotteryResult/lottery-result-sale-buckets-two"

describe("ListingDetailsLotteryPreferences", () => {
  it("displays 3 default preferences - COP, DTHP, L/W", () => {
    const tree = renderer
      .create(
        <ListingDetailsLotteryPreferences lotteryBucketsDetails={lotteryResultRentalBucketsThree} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays 2 preferences - NRHP, L/W", () => {
    const tree = renderer
      .create(
        <ListingDetailsLotteryPreferences lotteryBucketsDetails={lotteryResultSaleBucketsTwo} />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
