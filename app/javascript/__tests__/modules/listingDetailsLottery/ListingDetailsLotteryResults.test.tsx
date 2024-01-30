import React from "react"
import { render, screen } from "@testing-library/react"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { lotteryCompleteRentalListingWithSummary } from "../../data/RailsRentalListing/listing-rental-lottery-complete-with-summary"
import { lotteryResultRentalOne } from "../../data/RailsLotteryResult/lottery-result-rental-one"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { ListingDetailsLotteryResults } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryResults"

const axios = require("axios")

jest.mock("axios")

describe("ListingDetailsLotteryResults", () => {
  it("does not display if lottery is not complete", async () => {
    await renderAndLoadAsync(<ListingDetailsLotteryResults listing={openSaleListing} />)
    const viewButton = screen.queryByText("View Lottery Results")

    expect(viewButton).not.toBeInTheDocument()
  })

  it("displays if lottery is complete", async () => {
    axios.get.mockResolvedValue({ data: lotteryResultRentalOne })

    const { asFragment, findByText } = render(
      <ListingDetailsLotteryResults listing={lotteryCompleteRentalListing} />
    )

    await findByText("View Lottery Results")
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays with summary if lottery is complete", async () => {
    axios.get.mockResolvedValue({ data: lotteryResultRentalOne })

    const { asFragment, findByText } = render(
      <ListingDetailsLotteryResults listing={lotteryCompleteRentalListingWithSummary} />
    )

    await findByText("View Lottery Results")

    expect(asFragment()).toMatchSnapshot()
  })
})
