import React from "react"
import { render, waitFor } from "@testing-library/react"

import { ListingDetailsUnitAccordions } from "../../../modules/listingDetails/ListingDetailsUnitAccordions"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"
import { units } from "../../data/RailsListingUnits/listing-units"

import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
const axios = require("axios")

jest.mock("axios")

describe("ListingDetailsUnitAccordion", () => {
  it("displays the unit accordions for a given listing", async () => {
    axios.get.mockResolvedValue({ data: { listings: [], units: openSaleListing.Units } })

    const { asFragment, findByTestId } = render(
      <ListingDetailsContext.Provider
        value={{
          units,
          amiCharts: [],
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: false,
          fetchingAmiChartsError: null,
          fetchingUnitsError: null,
        }}
      >
        <ListingDetailsUnitAccordions />
      </ListingDetailsContext.Provider>
    )

    await waitFor(() => {
      findByTestId("unit-accordion")
    })

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
          fetchingAmiChartsError: null,
          fetchingUnitsError: null,
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
          fetchingAmiChartsError: null,
          fetchingUnitsError: null,
        }}
      >
        <ListingDetailsUnitAccordions />
      </ListingDetailsContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
