import React from "react"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import HowToApply, { LeasingAgentBox } from "../../../pages/howToApply/how-to-apply"
import { notYetOpenSaleFcfsListing } from "../../data/RailsSaleListing/listing-sale-fcfs-not-yet-open"
import { fcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs"
import { openFcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs-open"
import { localizedFormat, formatTimeOfDay } from "../../../util/languageUtil"

const axios = require("axios")

jest.mock("axios")

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

describe("<HowToApply />", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("renders HowToApply component", async () => {
    axios.get.mockResolvedValue({ data: { listing: fcfsSaleListing } })
    const { asFragment } = await renderAndLoadAsync(<HowToApply assetPaths={{}} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it("shows 'SUBMIT APPLICATION' button if URL is present", async () => {
    process.env.FCFS_FORMASSEMBLY_URL_EN = "https://www.test.com"
    axios.get.mockResolvedValue({ data: { listing: openFcfsSaleListing } })
    const { queryByText } = await renderAndLoadAsync(<HowToApply assetPaths={{}} />)
    expect(queryByText("Submit application")).not.toBeNull()
  })

  it("opens correct url for a locale", async () => {
    process.env.FCFS_FORMASSEMBLY_URL_EN = "https://www.test.com"
    process.env.FCFS_FORMASSEMBLY_URL_ES = "https://www.test-es.com"
    // set client to ES locale
    const originalLocation = { ...window.location }
    jest.spyOn(window, "location", "get").mockImplementation(() => ({
      ...originalLocation,
      pathname: "/es/test",
    }))
    axios.get.mockResolvedValue({ data: { listing: openFcfsSaleListing } })
    global.open = jest.fn()

    await renderAndLoadAsync(<HowToApply assetPaths={{}} />)
    screen.getByText("Submit application").click()
    await waitFor(() => {
      expect(global.open).toHaveBeenCalledWith(
        `${process.env.FCFS_FORMASSEMBLY_URL_ES}?ListingID=a0W0P00000GlKfBUAV`,
        "_blank"
      )
    })
    jest.restoreAllMocks()
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    })
  })

  it("does not show 'SUBMIT APPLICATION' button if URL is missing", async () => {
    process.env.FCFS_FORMASSEMBLY_URL_EN = undefined
    axios.get.mockResolvedValue({ data: { listing: openFcfsSaleListing } })
    const { queryByText } = await renderAndLoadAsync(<HowToApply assetPaths={{}} />)
    expect(queryByText("Submit application")).toBeNull()
  })

  it("shows the correct header text", async () => {
    const listingData = { data: { listing: fcfsSaleListing } }
    axios.get.mockResolvedValue(listingData)
    const { getAllByText } = await renderAndLoadAsync(<HowToApply assetPaths={{}} />)
    expect(getAllByText(`Apply to ${listingData.data.listing.Name}`)).not.toBeNull()
  })

  it("renders not-yet-open components", () => {
    axios.get.mockResolvedValue({ data: { listing: notYetOpenSaleFcfsListing } })
    const { findByText } = render(<HowToApply assetPaths={{}} />)
    const datetime = notYetOpenSaleFcfsListing.Application_Start_Date_Time || ""
    const date = localizedFormat(datetime, "LL")
    const time = formatTimeOfDay(datetime)
    expect(findByText(`Applications open: ${date} at ${time} Pacific Time`)).toBeDefined()
    expect(
      findByText(`Applications open ${date} at ${time} Pacific Time. Check back here to apply.`)
    ).toBeDefined()
  })

  it("redirects to home page if listing not found", () => {
    axios.get.mockResolvedValue({ data: { listing: null } })
    render(<HowToApply assetPaths={{}} />)
    expect(window.location.pathname).toBe("/")
  })

  it("shows the correct leasing agent box for the listing", async () => {
    const { asFragment } = await renderAndLoadAsync(<LeasingAgentBox listing={fcfsSaleListing} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
