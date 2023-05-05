import React from "react"
import { render, cleanup } from "@testing-library/react"
import { ListingDetailsPricingTable } from "../../../modules/listingDetails/ListingDetailsPricingTable"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { units } from "../../data/RailsListingUnits/listing-units"
import { amiCharts } from "../../data/RailsAmiCharts/ami-charts"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"

// leaving the habitat listing test commented out - should be needed very soon.
// import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { pricingTableUnits } from "../../data/RailsListingPricingTableUnits/listing-pricing-table-units-default"

const axios = require("axios")

jest.mock("axios")

describe("ListingDetailsPricingTable", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("renders ListingDetailsPricingTable component with spinner before api call", async (done) => {
    jest.spyOn(axios, "get").mockResolvedValue(null)

    const { asFragment, findByTestId } = render(
      <ListingDetailsContext.Provider
        value={{
          units: [],
          amiCharts: [],
          fetchingUnits: true,
          fetchedUnits: false,
          fetchingAmiCharts: true,
          fetchedAmiCharts: false,
          fetchingAmiChartsError: null,
          fetchingUnitsError: null,
        }}
      >
        <ListingDetailsPricingTable listing={closedRentalListing} />
      </ListingDetailsContext.Provider>
    )

    expect(await findByTestId("pricing-table")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("renders ListingDetailsPricingTable component", async (done) => {
    axios.get.mockResolvedValue({ data: [{ unitSummaries: pricingTableUnits }] })

    const { asFragment, findByTestId } = render(
      <ListingDetailsPricingTable listing={closedRentalListing} />
    )

    expect(await findByTestId("pricing-table")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("renders ListingDetailsPricingTable component with open sale listing", async (done) => {
    axios.get.mockResolvedValue({ data: [{ unitSummaries: pricingTableUnits }] })

    const { asFragment, findByTestId } = render(
      <ListingDetailsContext.Provider
        value={{
          units,
          amiCharts,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: null,
          fetchingUnitsError: null,
        }}
      >
        <ListingDetailsPricingTable listing={openSaleListing} />
      </ListingDetailsContext.Provider>
    )

    expect(await findByTestId("pricing-table")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("renders ListingDetailsPricingTable component when rental listing", async (done) => {
    axios.get.mockResolvedValue({ data: [{ unitSummaries: pricingTableUnits }] })

    const { asFragment, findByTestId } = render(
      <ListingDetailsContext.Provider
        value={{
          units,
          amiCharts,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: null,
          fetchingUnitsError: null,
        }}
      >
        <ListingDetailsPricingTable listing={closedRentalListing} />
      </ListingDetailsContext.Provider>
    )

    expect(await findByTestId("pricing-table")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("does not render ListingDetailsPricingTable when habitat listing", async (done) => {
    axios.get.mockResolvedValue({ data: [{ unitSummaries: pricingTableUnits }] })

    const { asFragment, findByTestId } = render(
      <ListingDetailsContext.Provider
        value={{
          units,
          amiCharts,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: null,
          fetchingUnitsError: null,
        }}
      >
        <ListingDetailsPricingTable listing={habitatListing} />
      </ListingDetailsContext.Provider>
    )

    expect(await findByTestId("pricing-table")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })
})
