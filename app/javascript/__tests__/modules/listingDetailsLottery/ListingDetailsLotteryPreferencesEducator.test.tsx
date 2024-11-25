import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsLotteryPreferencesEducator } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryPreferencesEducator"
import { lotteryResultRentalEducator } from "../../data/RailsLotteryResult/lottery-result-rental-educator"

describe("ListingDetailsLotteryPreferencesEducator", () => {
  it("displays 3 default preferences - COP, DTHP, L/W", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryPreferencesEducator
        lotteryBucketsDetails={lotteryResultRentalEducator}
        isEducatorOne={false}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays 2 preferences - NRHP, L/W", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryPreferencesEducator
        lotteryBucketsDetails={lotteryResultRentalEducator}
        isEducatorOne={false}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("educator 1 displays 3 default preferences - COP, DTHP, L/W", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryPreferencesEducator
        lotteryBucketsDetails={lotteryResultRentalEducator}
        isEducatorOne={true}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("educator 1 displays 2 preferences - NRHP, L/W", () => {
    const { asFragment } = render(
      <ListingDetailsLotteryPreferencesEducator
        lotteryBucketsDetails={lotteryResultRentalEducator}
        isEducatorOne={true}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
