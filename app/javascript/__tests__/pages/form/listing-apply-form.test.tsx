/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import ListingApplyForm from "../../../pages/form/listing-apply-form"
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
    originalLocation = { ...window.location }
    delete (window as any).location
    window.location = {
      ...originalLocation,
      assign: jest.fn(),
    } as any
  })
  afterEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    })
  })

  it("redirects to listing details page when toggle is off", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    const listingId = "a0123"
    const listingDetailsUrl = `${getListingDetailPath()}/${listingId}`
    axios.get.mockResolvedValue({ data: { listing: openRentalListing } })
    await renderAndLoadAsync(<ListingApplyForm assetPaths={{}} listingId={listingId} />)
    expect(window.location.assign).toHaveBeenCalledWith(listingDetailsUrl)
  })
})
