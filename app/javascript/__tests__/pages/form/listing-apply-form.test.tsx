import React from "react"
import ListingApplyForm from "../../../pages/form/listing-apply-form"
import { setupLocationAndRouteMock } from "../../__util__/accountUtils"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { getListingDetailPath } from "../../../util/routeUtil"
import { openRentalListing } from "../../data/RailsRentalListing/listing-rental-open"

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

describe("<ListingApplyForm />", () => {
  let originalLocation: Location

  beforeEach(() => {
    originalLocation = window.location
    setupLocationAndRouteMock()
  })
  afterEach(() => {
    jest.restoreAllMocks()
    window.location = originalLocation
  })

  it("redirects to listing details page when toggle is off", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    const listingId = "a0123"
    const listingDetailsUrl = `http://dahlia.com${getListingDetailPath()}/${listingId}`
    axios.get.mockResolvedValue({ data: { listing: openRentalListing } })
    await renderAndLoadAsync(<ListingApplyForm assetPaths={{}} listingId={listingId} />)
    expect(window.location.href).toBe(listingDetailsUrl)
  })
})
