import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsLotterySearchForm } from "../../../modules/listingDetailsLottery/ListingDetailsLotterySearchForm"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { lotteryResultRentalThree } from "../../data/RailsLotteryResult/lottery-result-rental-three"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { getLotteryResults } from "../../../api/listingApiService"
import { lotteryResultRentalInvalidLotteryNumber } from "../../data/RailsLotteryResult/lottery-result-rental-invalid-lottery-number"
import { renderAndLoadAsync } from "../../__util__/renderUtils"

jest.mock("../../../api/listingApiService")

describe("ListingDetailsLotteryModal", () => {
  beforeAll(() => {
    const getLotteryResultsMock = getLotteryResults as jest.MockedFunction<typeof getLotteryResults>
    getLotteryResultsMock.mockReturnValue(Promise.resolve(lotteryResultRentalThree))
  })

  it("displays initial view with form and listing preferences", () => {
    const tree = renderer
      .create(
        <ListingDetailsLotterySearchForm
          listing={lotteryCompleteRentalListing}
          lotteryBucketDetails={lotteryResultRentalThree}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays error when user submits form with empty lottery number", async () => {
    const user = userEvent.setup()
    const { findByText } = render(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    user.click(screen.getByRole("button"))
    findByText("Please enter a valid lottery number.")
  })

  it("displays error when user submits form with non numeric lottery number", async () => {
    const user = userEvent.setup()
    const { findByText } = render(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    const input = screen.getByRole("textbox")
    userEvent.type(input, "123abc")
    user.click(screen.getByRole("button"))
    findByText("Please enter a valid lottery number.")
  })

  it("displays three results when lottery number found", async () => {
    const getLotteryResultsMock = getLotteryResults as jest.MockedFunction<typeof getLotteryResults>
    getLotteryResultsMock.mockReturnValue(Promise.resolve(lotteryResultRentalThree))

    const user = userEvent.setup()
    const { findByText } = await renderAndLoadAsync(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    const input = screen.getByRole("textbox")
    userEvent.type(input, "123")
    user.click(screen.getByRole("button"))

    findByText("Your preference ranking")
    findByText("Displaced Tenant Housing Preference (DTHP)")
    findByText("Certificate of Preference (COP)")
    findByText("Live or Work in San Francisco Preference")
  })

  it("displays error when invalid lottery number", async () => {
    const getLotteryResultsMock = getLotteryResults as jest.MockedFunction<typeof getLotteryResults>
    getLotteryResultsMock.mockReturnValue(Promise.resolve(lotteryResultRentalInvalidLotteryNumber))

    const user = userEvent.setup()
    const { findByText } = await renderAndLoadAsync(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    const input = screen.getByRole("textbox")

    userEvent.type(input, "123")
    user.click(screen.getByRole("button"))
    findByText("The number you entered was not found.")
  })

  it("displays error when api error", async () => {
    const getLotteryResultsMock = getLotteryResults as jest.MockedFunction<typeof getLotteryResults>
    getLotteryResultsMock.mockReturnValue(Promise.resolve(null))

    const user = userEvent.setup()
    const { findByText } = await renderAndLoadAsync(
      <ListingDetailsLotterySearchForm
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalThree}
      />
    )

    const input = screen.getByRole("textbox")

    userEvent.type(input, "123")
    user.click(screen.getByRole("button"))
    findByText("We seem to be having a connection issue. Please try your search again.")
  })
})
