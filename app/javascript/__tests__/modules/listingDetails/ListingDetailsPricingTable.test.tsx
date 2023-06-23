import React from "react"
import renderer, { act } from "react-test-renderer"
import { ListingDetailsPricingTable } from "../../../modules/listingDetails/ListingDetailsPricingTable"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { units, unitsWithOneOccupant } from "../../data/RailsListingUnits/listing-units"
import { amiCharts } from "../../data/RailsAmiCharts/ami-charts"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"

describe("ListingDetailsPricingTable", () => {
  it("renders ListingDetailsPricingTable component with spinner before api call", () => {
    const tree = renderer.create(
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
    expect(tree.toJSON()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable component with rental listing", () => {
    const tree = renderer.create(
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
    expect(tree.toJSON()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable component with open sale listing", () => {
    const tree = renderer.create(
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
    expect(tree.toJSON()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable component when rental listing", () => {
    const tree = renderer.create(
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
    expect(tree.toJSON()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable component when rental listing with AMI full text", () => {
    const tree = renderer.create(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneOccupant,
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
    expect(tree.toJSON()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable when habitat listing", () => {
    const tree = renderer.create(
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
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
