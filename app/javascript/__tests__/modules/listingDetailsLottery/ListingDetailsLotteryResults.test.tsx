import React from "react"
import { screen } from "@testing-library/react"
import renderer from "react-test-renderer"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { lotteryCompleteRentalListingWithSummary } from "../../data/RailsRentalListing/listing-rental-lottery-complete-with-summary"
import { getLotteryBucketDetails } from "../../../api/listingApiService"
import { lotteryResultRentalOne } from "../../data/RailsLotteryResult/lottery-result-rental-one"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { ListingDetailsLotteryResults } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryResults"

jest.mock("../../../api/listingApiService")

let getLotteryBucketDetailsMock

const buttonText = "View Lottery Results"

describe("ListingDetailsLotteryResults", () => {
  beforeAll(() => {
    getLotteryBucketDetailsMock = getLotteryBucketDetails as jest.MockedFunction<
      typeof getLotteryBucketDetails
    >
  })

  it("does not display if lottery is not complete", async () => {
    await renderAndLoadAsync(<ListingDetailsLotteryResults listing={openSaleListing} />)
    const viewButton = screen.queryByText(buttonText)

    expect(viewButton).not.toBeInTheDocument()
  })

  it("displays if lottery is complete", () => {
    getLotteryBucketDetailsMock.mockReturnValue(Promise.resolve(lotteryResultRentalOne))

    const tree = renderer
      .create(<ListingDetailsLotteryResults listing={lotteryCompleteRentalListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays with summary if lottery is complete", () => {
    getLotteryBucketDetailsMock.mockReturnValue(Promise.resolve(lotteryResultRentalOne))

    const tree = renderer
      .create(<ListingDetailsLotteryResults listing={lotteryCompleteRentalListingWithSummary} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
