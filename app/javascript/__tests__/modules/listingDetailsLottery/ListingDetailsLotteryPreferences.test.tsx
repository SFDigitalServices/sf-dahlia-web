import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsLotteryPreferences } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryPreferences"
import { lotteryResultRentalThree } from "../../data/RailsLotteryResult/lottery-result-rental-three"
import { lotteryResultSaleTwo } from "../../data/RailsLotteryResult/lottery-result-sale-two"

describe("ListingDetailsLotteryPreferences", () => {
  it("displays 3 default preferences - COP, DTHP, L/W", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryPreferences lotteryBucketsDetails={lotteryResultRentalThree} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays 2 preferences - NRHP, L/W", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryPreferences lotteryBucketsDetails={lotteryResultSaleTwo} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
