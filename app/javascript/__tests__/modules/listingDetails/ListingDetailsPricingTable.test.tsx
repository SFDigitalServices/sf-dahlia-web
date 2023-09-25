import React from "react"
import { render, cleanup, screen, fireEvent } from "@testing-library/react"
import { ListingDetailsPricingTable } from "../../../modules/listingDetails/ListingDetailsPricingTable"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { units, unitsWithOneOccupant } from "../../data/RailsListingUnits/listing-units"
import { amiCharts } from "../../data/RailsAmiCharts/ami-charts"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"
import {
  openRentalListing,
  openRentalListingUnits,
  openRentalListingAmis,
} from "../../data/RailsRentalListing/listing-rental-open"

describe("ListingDetailsPricingTable", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe("open rental listing", () => {
    it("renders ListingDetailsPricingTable component with open rental listing", () => {
      const { getByText } = render(
        <ListingDetailsContext.Provider
          value={{
            units: openRentalListingUnits,
            amiCharts: openRentalListingAmis,
            fetchingUnits: false,
            fetchedUnits: true,
            fetchingAmiCharts: false,
            fetchedAmiCharts: true,
            fetchingAmiChartsError: undefined,
            fetchingUnitsError: undefined,
          }}
        >
          <ListingDetailsPricingTable listing={openRentalListing} />
        </ListingDetailsContext.Provider>
      )

      fireEvent.click(getByText("$2,364 to $6,725"))

      screen.logTestingPlaygroundURL()

      expect(getByText("$2,364 to $6,725")).toBeInTheDocument()

      // expect(asFragment()).toMatchSnapshot()
    })
  })

  // eslint-disable-next-line @typescript-eslint/require-await
  it("renders ListingDetailsPricingTable component with spinner before api call", () => {
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
        <ListingDetailsPricingTable listing={closedRentalListing} />
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
        <ListingDetailsPricingTable listing={openSaleListing} />
      </ListingDetailsContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable component when rental listing", () => {
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
        <ListingDetailsPricingTable listing={closedRentalListing} />
      </ListingDetailsContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable component when rental listing with AMI full text", () => {
    const { asFragment } = render(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneOccupant,
          amiCharts,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsPricingTable listing={closedRentalListing} />
      </ListingDetailsContext.Provider>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable when habitat listing", () => {
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
        <ListingDetailsPricingTable listing={habitatListing} />
      </ListingDetailsContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
