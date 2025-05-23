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

const mockIntersectionObserver = jest.fn()
const observeFunction = jest.fn()
const mockResizeObserver = jest.fn()
const mockResizeObserveFunction = jest.fn()
const mockResizeDisconnectFunction = jest.fn()

describe("For Rent", () => {
  beforeEach(() => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    mockIntersectionObserver.mockReturnValue({
      observe: observeFunction,
    })
    window.IntersectionObserver = mockIntersectionObserver

    mockResizeObserver.mockReturnValue({
      observe: mockResizeObserveFunction,
      disconnect: mockResizeDisconnectFunction,
    })
    window.ResizeObserver = mockResizeObserver
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
    ;(await findByText("Enter a lottery")).click()

    expect(asFragment()).toMatchSnapshot()
    expect(mockIntersectionObserver).toHaveBeenCalled()
    expect(observeFunction).toHaveBeenCalled()
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
  }, 0)
})
