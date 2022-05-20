import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsLotterySearchFooter } from "../../../modules/listingDetailsLottery/ListingDetailsLotterySearchFooter"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { LOTTERY_SEARCH_FORM_STATUS } from "../../../modules/listingDetailsLottery/ListingDetailsLotterySearchForm"

describe("ListingDetailsLotteryModalFooter", () => {
  it("displays preference link only when status is not initial state", () => {
    const tree = renderer
      .create(
        <ListingDetailsLotterySearchFooter
          listing={lotteryCompleteRentalListing}
          lotterySearchFormStatus={LOTTERY_SEARCH_FORM_STATUS.LOADING}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
  it("displays full footer when modal status is initial state", () => {
    const tree = renderer
      .create(
        <ListingDetailsLotterySearchFooter
          listing={lotteryCompleteRentalListing}
          lotterySearchFormStatus={LOTTERY_SEARCH_FORM_STATUS.INITIAL_STATE}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
