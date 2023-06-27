import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsHMITable } from "../../../modules/listingDetails/ListingDetailsHMITable"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { units } from "../../data/RailsListingUnits/listing-units"
import { amiCharts } from "../../data/RailsAmiCharts/ami-charts"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"

describe("ListingDetailsHMITable", () => {
  it("renders ListingDetailsHMITable component with spinner before api call", () => {
    const { asFragment } = render(
      <ListingDetailsContext.Provider
        value={{
          units: [],
          amiCharts: [],
          fetchingUnits: true,
          fetchedUnits: false,
          fetchingAmiCharts: true,
          fetchedAmiCharts: false,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsHMITable listing={closedRentalListing} />
      </ListingDetailsContext.Provider>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders ListingDetailsHMITable component with rental listing", () => {
    const { asFragment } = render(
      <ListingDetailsContext.Provider
        value={{
          units,
          amiCharts,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsHMITable listing={closedRentalListing} />
      </ListingDetailsContext.Provider>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable component with open sale listing", () => {
    const { asFragment } = render(
      <ListingDetailsContext.Provider
        value={{
          units,
          amiCharts,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsHMITable listing={openSaleListing} />
      </ListingDetailsContext.Provider>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("does not render ListingDetailsPricingTable when habitat listing", () => {
    const { asFragment } = render(
      <ListingDetailsContext.Provider
        value={{
          units,
          amiCharts,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsHMITable listing={habitatListing} />
      </ListingDetailsContext.Provider>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
