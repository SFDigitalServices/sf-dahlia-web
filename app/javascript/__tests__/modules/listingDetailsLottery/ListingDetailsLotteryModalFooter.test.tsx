import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsLotterySearchFooter } from "../../../modules/listingDetailsLottery/ListingDetailsLotterySearchFooter"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { LOTTERY_SEARCH_FORM_STATUS } from "../../../modules/listingDetailsLottery/ListingDetailsLotterySearchForm"

describe("ListingDetailsLotteryModalFooter", () => {
  it("displays preference link only when status is not initial state", () => {
    const { asFragment } = render(
      <ListingDetailsLotterySearchFooter
        listing={lotteryCompleteRentalListing}
        lotterySearchFormStatus={LOTTERY_SEARCH_FORM_STATUS.LOADING}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it("displays full footer when modal status is initial state", () => {
    const { asFragment } = render(
      <ListingDetailsLotterySearchFooter
        listing={lotteryCompleteRentalListing}
        lotterySearchFormStatus={LOTTERY_SEARCH_FORM_STATUS.INITIAL_STATE}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
