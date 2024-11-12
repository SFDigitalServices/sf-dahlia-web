import React from "react"
import { render, cleanup, screen, waitFor } from "@testing-library/react"
import ForRent from "../../../../javascript/pages/listings/for-rent"
import { sroRentalListing } from "../../data/RailsRentalListing/listing-rental-sro"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"

const axios = require("axios")

jest.mock("axios")

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}))

describe("For Rent", () => {
  beforeEach(() => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true })
  })
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("renders ForRent component", async () => {
    axios.get.mockResolvedValue({ data: { listings: [] } })

    const { findByText, asFragment } = render(<ForRent assetPaths="/" />)

    expect(await findByText("Rent affordable housing")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("listings with multiple listings render the first image in the array", async () => {
    axios.get.mockResolvedValue({ data: { listings: [sroRentalListing] } })

    const { findByAltText } = render(<ForRent assetPaths="/" />)

    await waitFor(
      () => {
        return screen
          .getByRole("button", {
            name: /show upcoming lotteries \(1\)/i,
          })
          .click()
      },
      {
        timeout: 10000,
      }
    )

    const image = await findByAltText("This is a listing image")
    expect(image.getAttribute("src")).toBe(sroRentalListing.Listing_Images[0].displayImageURL)
  })
})
