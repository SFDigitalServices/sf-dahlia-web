import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsLotteryModalFooter } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryModalFooter"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { LOTTERY_MODAL_STATE } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryModal"

describe("ListingDetailsLotteryModalFooter", () => {
  it("displays preference link only when status is not initial state", () => {
    const tree = renderer
      .create(
        <ListingDetailsLotteryModalFooter
          listing={lotteryCompleteRentalListing}
          lotteryModalStatus={LOTTERY_MODAL_STATE.LOADING}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
  it("displays full footer when modal status is initial state", () => {
    const tree = renderer
      .create(
        <ListingDetailsLotteryModalFooter
          listing={lotteryCompleteRentalListing}
          lotteryModalStatus={LOTTERY_MODAL_STATE.INITIAL_STATE}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
