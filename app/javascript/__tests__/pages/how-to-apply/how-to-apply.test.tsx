import React from "react"
import { cleanup } from "@testing-library/react"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import HowToApply from "../../../pages/how-to-apply/how-to-apply"
import { notYetOpenSaleFcfsListing } from "../../data/RailsSaleListing/listing-sale-fcfs-not-yet-open"
import { fcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs"
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

  it("shows the correct header text", async () => {
    axios.get.mockResolvedValue({ data: { listing: fcfsSaleListing } })
    const { getAllByText } = await renderAndLoadAsync(<HowToApply assetPaths={{}} />)
    expect(getAllByText("How to Apply")).not.toBeNull()
  })

  it("renders not-yet-open components", async () => {
    axios.get.mockResolvedValue({ data: { listing: notYetOpenSaleFcfsListing } })
    const { getAllByText } = await renderAndLoadAsync(<HowToApply assetPaths={{}} />)
    const datetime = notYetOpenSaleFcfsListing.Application_Start_Date_Time
    const date = localizedFormat(datetime, "LL")
    const time = formatTimeOfDay(datetime)
    expect(getAllByText(`Applications open: ${date} at ${time} Pacific Time`)).not.toBeNull()
    expect(
      getAllByText(`Applications open ${date} at ${time} Pacific Time. Check back here to apply.`)
    ).not.toBeNull()
  })
})
