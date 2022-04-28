import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsLotteryPreferences } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryPreferences"
import { lotteryCompleteRentalListing } from "../../data/listing-rental-lottery-complete"
import { lotteryBuckets } from "../../data/lottery-buckets"

describe("ListingDetailsLotteryPreferences", () => {
  it("displays 3 default preferences - COP, DTHP, L/W", () => {
    const tree = renderer
      .create(
        <ListingDetailsLotteryPreferences
          listing={lotteryCompleteRentalListing}
          lotteryBucketsDetails={lotteryBuckets}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
