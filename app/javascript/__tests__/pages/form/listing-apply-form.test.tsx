/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { useParams } from "react-router"
import ListingApplyForm from "../../../pages/form/listing-apply-form"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
  defineCryptoApi,
} from "../../__util__/renderUtils"
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

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: jest.fn(),
}))

defineCryptoApi()

describe("<ListingApplyForm />", () => {
  let originalLocation: Location

  beforeEach(() => {
    originalLocation = mockWindowLocation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    restoreWindowLocation(originalLocation)
  })

  it("redirects to listing details page when toggle is off", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    const listingId = "a0123"
    ;(useParams as jest.Mock).mockReturnValue({ id: listingId })
    const listingDetailsUrl = `${getListingDetailPath()}/${listingId}`
    axios.get.mockResolvedValue({ data: { listing: openRentalListing } })
    await renderAndLoadAsync(<ListingApplyForm assetPaths={{}} />)
    expect(window.location.assign).toHaveBeenCalledWith(listingDetailsUrl)
  })
})
