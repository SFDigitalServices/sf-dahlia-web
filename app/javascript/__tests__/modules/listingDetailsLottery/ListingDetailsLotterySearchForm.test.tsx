import React from "react"
import { ListingDetailsLotterySearchForm } from "../../../modules/listingDetailsLottery/ListingDetailsLotterySearchForm"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { lotteryResultRentalThree } from "../../data/RailsLotteryResult/lottery-result-rental-three"
import userEvent from "@testing-library/user-event"
import { render, cleanup } from "@testing-library/react"
import { lotteryResultRentalInvalidLotteryNumber } from "../../data/RailsLotteryResult/lottery-result-rental-invalid-lottery-number"
import { renderAndLoadAsync } from "../../__util__/renderUtils"

const axios = require("axios")

jest.mock("axios")

describe("ListingDetailsLotteryModal", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("displays initial view with form and listing preferences", async () => {
    axios.get.mockResolvedValue({ data: lotteryResultRentalThree })

    const { findByText, asFragment } = render(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    expect(await findByText("Lottery Results")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays error when user submits form with empty lottery number", async () => {
    const user = userEvent.setup()
    const { findByText, getByRole } = render(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    await user.click(getByRole("button"))

    expect(await findByText("Please enter a valid lottery number.")).toBeDefined()
  })

  it("displays error when user submits form with non numeric lottery number", async () => {
    const user = userEvent.setup()
    const { findByText, getByRole } = render(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    const input = getByRole("textbox")
    await userEvent.type(input, "123abc")
    await user.click(getByRole("button"))

    expect(await findByText("Please enter a valid lottery number.")).toBeDefined()
  })

  it("displays three results when lottery number found", async () => {
    axios.get.mockResolvedValue({ data: lotteryResultRentalThree })

    const user = userEvent.setup()
    const { findByText, getByRole } = await renderAndLoadAsync(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    const input = getByRole("textbox")
    await userEvent.type(input, "123")
    await user.click(getByRole("button"))

    expect(await findByText("Your preference ranking")).toBeDefined()
    expect(await findByText("Displaced Tenant Housing Preference (DTHP)")).toBeDefined()
    expect(await findByText("Certificate of Preference (COP)")).toBeDefined()
    expect(await findByText("Live or Work in San Francisco Preference")).toBeDefined()
  })

  it("displays results when a lotteryNumber is given initially", async () => {
    axios.get.mockResolvedValue({ data: lotteryResultRentalThree })

    const { findByText } = await renderAndLoadAsync(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
        lotteryNumber="123"
      />
    )

    expect(await findByText("Your preference ranking")).toBeDefined()
    expect(await findByText("Displaced Tenant Housing Preference (DTHP)")).toBeDefined()
    expect(await findByText("Certificate of Preference (COP)")).toBeDefined()
    expect(await findByText("Live or Work in San Francisco Preference")).toBeDefined()
  })

  it("displays error when invalid lottery number", async () => {
    axios.get.mockResolvedValue({ data: lotteryResultRentalInvalidLotteryNumber })

    const user = userEvent.setup()
    const { findByText, getByRole } = await renderAndLoadAsync(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    const input = getByRole("textbox")
    await userEvent.type(input, "123")
    await user.click(getByRole("button"))

    expect(await findByText("The number you entered was not found.")).toBeDefined()
  })

  it("displays error when api error", async () => {
    axios.get.mockResolvedValue({ data: null })

    const user = userEvent.setup()
    const { findByText, getByRole } = await renderAndLoadAsync(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    const input = getByRole("textbox")
    await userEvent.type(input, "123")
    await user.click(getByRole("button"))

    expect(
      await findByText("We seem to be having a connection issue. Please try your search again.")
    ).toBeDefined()
  })
})
