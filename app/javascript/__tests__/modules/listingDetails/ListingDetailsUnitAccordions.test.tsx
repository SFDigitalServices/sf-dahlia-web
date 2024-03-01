import React from "react"
import { render, cleanup } from "@testing-library/react"
import { ListingDetailsUnitAccordions } from "../../../modules/listingDetails/ListingDetailsUnitAccordions"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"
import { units } from "../../data/RailsListingUnits/listing-units"

import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"

const axios = require("axios")

jest.useRealTimers()
jest.mock("axios")

describe("ListingDetailsUnitAccordion", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("displays the unit accordions for a given listing", async () => {
    jest.setTimeout(30_000)
    axios.get.mockResolvedValue({ data: { listings: [], units: openSaleListing.Units } })

    const { asFragment, findAllByTestId } = render(
      <ListingDetailsContext.Provider
        value={{
          units,
          amiCharts: [],
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: false,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsUnitAccordions />
      </ListingDetailsContext.Provider>
    )

    expect(await findAllByTestId("content-accordion-button")).toHaveLength(3)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays spinner if no units and not fetching units", () => {
    const { asFragment } = render(
      <ListingDetailsContext.Provider
        value={{
          units: [],
          amiCharts: [],
          fetchingUnits: false,
          fetchedUnits: false,
          fetchingAmiCharts: false,
          fetchedAmiCharts: false,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsUnitAccordions />
      </ListingDetailsContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays the spinner for loading state", () => {
    const { asFragment } = render(
      <ListingDetailsContext.Provider
        value={{
          units: [],
          amiCharts: [],
          fetchingUnits: true,
          fetchedUnits: false,
          fetchingAmiCharts: false,
          fetchedAmiCharts: false,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsUnitAccordions />
      </ListingDetailsContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
