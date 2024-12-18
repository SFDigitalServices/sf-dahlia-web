import React from "react"
import { render, cleanup } from "@testing-library/react"
import ForSale from "../../../pages/listings/for-sale"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { fcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs"
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

describe("For Sale", () => {
  beforeEach(() => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("renders ForSale component", async () => {
    axios.get.mockResolvedValue({ data: { listings: [] } })

    const { findByText, asFragment } = render(<ForSale assetPaths="/" />)

    expect(await findByText("Buy affordable housing")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("listings with multiple listings render the first image in the array", async () => {
    axios.get.mockResolvedValue({ data: { listings: [openSaleListing, fcfsSaleListing] } })

    const { findAllByAltText } = render(<ForSale assetPaths="/" />)

    const image = await findAllByAltText("This is a listing image")
    expect(image[0].getAttribute("src")).toBe(openSaleListing.Listing_Images[0].displayImageURL)
  })
})
