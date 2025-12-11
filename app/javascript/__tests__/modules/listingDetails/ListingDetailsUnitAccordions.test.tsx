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

  const unitsWithOccupied = [
    ...units,
    {
      attributes: { type: "Unit", url: "/services/data/v35.0/sobjects/Unit/a0b4U00001JvOmOQAV" },
      Unit_Type: "2 BR",
      Availability: 0,
      BMR_Rental_Minimum_Monthly_Income_Needed: 90,
      Unit_Square_Footage: 1200,
      BMR_Rent_Monthly: 1500,
      Unit_Number: "104C",
      Unit_Floor: "1",
      Number_of_Bathrooms: 2,
      Status: "Occupied",
      Property_Type: "Condo",
      isReservedCommunity: true,
      AMI_chart_type: "MOHCD",
      AMI_chart_year: 2021,
      Max_AMI_for_Qualifying_Unit: 82,
      Min_AMI_for_Qualifying_Unit: 55,
      Min_Occupancy: 2,
      Max_Occupancy: 4,
      Id: "a0b4U00001JvOmOQAV",
    },
  ]
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
        <ListingDetailsUnitAccordions isSale={true} />
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
        <ListingDetailsUnitAccordions isSale={true} />
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
        <ListingDetailsUnitAccordions isSale={true} />
      </ListingDetailsContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("filters to show only available units for sales listings", () => {
    const { asFragment } = render(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOccupied,
          amiCharts: [],
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: false,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsUnitAccordions isSale={true} />
      </ListingDetailsContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("does not filter units for rental listings", () => {
    const { asFragment } = render(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOccupied,
          amiCharts: [],
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: false,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsUnitAccordions isSale={false} />
      </ListingDetailsContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
