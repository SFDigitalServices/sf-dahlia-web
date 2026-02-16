import React from "react"
import { GenericDirectory } from "../../modules/listings/GenericDirectory"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { openRentalListing } from "../data/RailsRentalListing/listing-rental-open"
import { waitFor } from "@testing-library/react"

describe("GenericDirectory", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockResizeObserver = jest.fn()
    mockResizeObserver.mockReturnValue({
      observe: jest.fn(),
      disconnect: jest.fn(),
    })
    window.ResizeObserver = mockResizeObserver
  })
  const filters = {
    household_size: "1",
    income_timeframe: "monthly",
    income_total: 2000,
    include_children_under_6: false,
    children_under_6: "0",
    type: "",
  }
  it("displays the rental directory page with listings", async () => {
    const mockProps = {
      listingsAPI: jest.fn().mockResolvedValue([
        {
          ...openRentalListing,
          Application_Due_Date: "2099-12-31T23:59:59.000+0000",
          Does_Match: true,
        },
      ]),
      directoryType: "forRent" as const,
      filters: filters,
      getSummaryTable: jest.fn().mockResolvedValue([]),
      getPageHeader: jest.fn(() => <div />),
      findMoreActionBlock: <div />,
    }
    const { asFragment, findByText } = await renderAndLoadAsync(<GenericDirectory {...mockProps} />)
    await waitFor(() => {
      expect(findByText("Matched")).toBeDefined()
    })
    expect(asFragment()).toMatchSnapshot()
  })
  it("displays the directory no matches page with no listings", async () => {
    const mockProps = {
      listingsAPI: jest.fn().mockResolvedValue([]),
      directoryType: "forRent" as const,
      filters: filters,
      getSummaryTable: jest.fn().mockResolvedValue([]),
      getPageHeader: jest.fn(() => <div />),
      findMoreActionBlock: <div />,
    }
    const { asFragment, queryByText } = await renderAndLoadAsync(
      <GenericDirectory {...mockProps} />
    )
    await waitFor(() => {
      expect(
        queryByText(
          "Based on information you entered, you don't match any current listings for rent."
        )
      ).toBeDefined()
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
