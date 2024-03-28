import React from "react"
import TagManager from "react-gtm-module"
import { render, cleanup, waitFor } from "@testing-library/react"
import ListingDetail from "../../../../javascript/pages/listings/listing-detail"
import { openRentalListing } from "../../data/RailsRentalListing/listing-rental-open"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { sroRentalListing } from "../../data/RailsRentalListing/listing-rental-sro"

const axios = require("axios")

jest.mock("axios")

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

describe("Listing Detail", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("renders an open rental listing", async () => {
    axios.get.mockResolvedValue({ data: { listing: openRentalListing } })
    const { findByText, asFragment } = render(<ListingDetail assetPaths="/" />)

    expect(await findByText(openRentalListing.Name)).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders a habitat listing", async () => {
    axios.get.mockResolvedValue({ data: { listing: habitatListing } })
    const { findByText, asFragment } = render(<ListingDetail assetPaths="/" />)

    expect(await findByText(habitatListing.Name)).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders a listing with sro units", async () => {
    axios.get.mockResolvedValue({ data: { listing: sroRentalListing } })
    const { findByText, asFragment } = render(<ListingDetail assetPaths="/" />)

    expect(await findByText(sroRentalListing.Name)).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("initializes Google Tag Manager for a rental listing", async () => {
    process.env.GOOGLE_TAG_MANAGER_KEY = "testkey"
    const initializeTagManager = jest.spyOn(TagManager, "initialize")
    axios.get.mockResolvedValue({ data: { listing: openRentalListing } })
    const { asFragment } = render(<ListingDetail assetPaths="/" />)

    await waitFor(() => {
      expect(initializeTagManager).toHaveBeenCalled()
    })
    expect(asFragment()).toMatchSnapshot()
  })
})

it("initializes Google Tag Manager for a sales listing", async () => {
  process.env.GOOGLE_TAG_MANAGER_KEY = "testkey"
  const initializeTagManager = jest.spyOn(TagManager, "initialize")
  axios.get.mockResolvedValue({ data: { listing: habitatListing } })
  const { asFragment } = render(<ListingDetail assetPaths="/" />)

  await waitFor(() => {
    expect(initializeTagManager).toHaveBeenCalled()
  })
  expect(asFragment()).toMatchSnapshot()
})
