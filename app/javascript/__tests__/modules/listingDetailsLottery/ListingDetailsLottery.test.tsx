import React from "react"
import { screen } from "@testing-library/react"
import renderer from "react-test-renderer"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { ListingDetailsLottery } from "../../../modules/listingDetailsLottery/ListingDetailsLottery"
import { lotteryCompleteRentalListingWithSummary } from "../../data/RailsRentalListing/listing-rental-lottery-complete-with-summary"
import { getLotteryBucketDetails } from "../../../api/listingApiService"
import { lotteryResultRentalOne } from "../../data/RailsLotteryResult/lottery-result-rental-one"
import { renderAndLoadAsync } from "../../__util__/renderUtils"

jest.mock("../../../api/listingApiService")

let getLotteryBucketDetailsMock

const buttonText = "View Lottery Results"

describe("ListingDetailsLottery", () => {
  beforeAll(() => {
    getLotteryBucketDetailsMock = getLotteryBucketDetails as jest.MockedFunction<
      typeof getLotteryBucketDetails
    >
  })

  it("does not display if lottery is not complete", async () => {
    await renderAndLoadAsync(<ListingDetailsLottery listing={openSaleListing} />)
    const viewButton = screen.queryByText(buttonText)

    expect(viewButton).not.toBeInTheDocument()
  })

  it("displays if lottery is complete", () => {
    getLotteryBucketDetailsMock.mockReturnValue(Promise.resolve(lotteryResultRentalOne))

    const tree = renderer
      .create(<ListingDetailsLottery listing={lotteryCompleteRentalListing} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays if lottery is complete with summary", () => {
    getLotteryBucketDetailsMock.mockReturnValue(Promise.resolve(lotteryResultRentalOne))

    const tree = renderer
      .create(<ListingDetailsLottery listing={lotteryCompleteRentalListingWithSummary} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
