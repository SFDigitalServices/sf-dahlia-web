import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsLotteryModal } from "../../../modules/listingDetailsLottery/ListingDetailsLotteryModal"
import { lotteryCompleteRentalListing } from "../../data/RailsRentalListing/listing-rental-lottery-complete"
import { lotteryResultRentalBucketsThree } from "../../data/RailsLotteryResult/lottery-result-rental-buckets-three"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { getLotteryResults } from "../../../api/listingApiService"
import { lotteryResultRentalInvalidLotteryNumber } from "../../data/RailsLotteryResult/lottery-result-rental-invalid-lottery-number"

jest.mock("../../../api/listingApiService")

describe("ListingDetailsLotteryModal", () => {
  it("displays initial view with form and listing preferences", () => {
    const tree = renderer
      .create(
        <ListingDetailsLotteryModal
          listing={lotteryCompleteRentalListing}
          lotteryBucketDetails={lotteryResultRentalBucketsThree}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays error when user submits form with empty lottery number", async () => {
    const user = userEvent.setup()
    const { getByText } = render(
      <ListingDetailsLotteryModal
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalBucketsThree}
      />
    )

    await user.click(screen.getByRole("button"))
    getByText("Please enter a valid lottery number.")
  })

  it("displays three results when lottery number found", async () => {
    const getLotteryResultsMock = getLotteryResults as jest.MockedFunction<typeof getLotteryResults>
    getLotteryResultsMock.mockReturnValue(Promise.resolve(lotteryResultRentalBucketsThree))

    const user = userEvent.setup()
    const { getByText } = render(
      <ListingDetailsLotteryModal
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalBucketsThree}
      />
    )

    const input = screen.getByRole("textbox")
    await userEvent.type(input, "123")
    await user.click(screen.getByRole("button"))

    getByText("Your preference ranking")
    getByText("Displaced Tenant Housing Preference (DTHP)")
    getByText("Certificate of Preference (COP)")
    getByText("Live or Work in San Francisco Preference")
  })

  it("displays error when invalid lottery number", async () => {
    const getLotteryResultsMock = getLotteryResults as jest.MockedFunction<typeof getLotteryResults>
    getLotteryResultsMock.mockReturnValue(Promise.resolve(lotteryResultRentalInvalidLotteryNumber))

    const user = userEvent.setup()
    const { getByText } = render(
      <ListingDetailsLotteryModal
        listing={lotteryCompleteRentalListing}
        lotteryBucketDetails={lotteryResultRentalBucketsThree}
      />
    )

    const input = screen.getByRole("textbox")
    await userEvent.type(input, "123")
    await user.click(screen.getByRole("button"))

    getByText("The number you entered was not found.")
  })
  it("displays error when api error", () => {})
})
