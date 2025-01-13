import React from "react"
import { render, cleanup } from "@testing-library/react"
import ListingDetail from "../../../../javascript/pages/listings/listing-detail"
import { openRentalListing } from "../../data/RailsRentalListing/listing-rental-open"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { sroRentalListing } from "../../data/RailsRentalListing/listing-rental-sro"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { resetAccordionUuid } from "@bloom-housing/ui-components"
import TagManager from "react-gtm-module"

const axios = require("axios")
jest.useRealTimers()
jest.mock("axios")

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

describe("Listing Detail", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })
  beforeEach(() => {
    // This component pulls in react-media, which needs this custom mock
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        find: jest.fn(),
      }
    })

    resetAccordionUuid()
  })

  it("renders an open rental listing", async () => {
    axios.get.mockResolvedValue({
      data: { listing: openRentalListing, units: openRentalListing.Units, ami: [] },
    })
    const { findAllByText, asFragment } = render(<ListingDetail assetPaths="/" />)

    expect(await findAllByText(openRentalListing.Name)).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders a habitat listing", async () => {
    axios.get.mockResolvedValue({
      data: { listing: habitatListing, units: habitatListing.Units, ami: [] },
    })
    const { findAllByText, asFragment } = render(<ListingDetail assetPaths="/" />)

    expect(await findAllByText(habitatListing.Name)).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders a listing with sro units", async () => {
    axios.get.mockResolvedValue({
      data: { listing: sroRentalListing, units: sroRentalListing.Units, ami: [] },
    })
    const { findAllByText, asFragment } = render(<ListingDetail assetPaths="/" />)

    expect(await findAllByText(sroRentalListing.Name)).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("initializes Google Tag Manager for a sales listing", async () => {
    axios.get.mockResolvedValue({
      data: { listing: habitatListing, units: habitatListing.Units, ami: [] },
    })
    await renderAndLoadAsync(<ListingDetail assetPaths="/" />)

    expect(TagManager.dataLayer).toHaveBeenCalledWith({
      dataLayer: {
        event: "view_listing",
        listing_custom_type: undefined,
        listing_id: "a0W8H000000HI2uUAG",
        listing_name: "TEST: 36 Amber Drive",
        listing_num_preferences: 3,
        listing_record_type: "Ownership",
        listing_status: "Active",
        listing_tenure: "New sale",
      },
    })
  })
})
