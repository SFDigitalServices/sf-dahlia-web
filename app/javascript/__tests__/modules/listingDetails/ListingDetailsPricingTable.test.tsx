import React from "react"
import { render, cleanup, within, fireEvent } from "@testing-library/react"
import { ListingDetailsPricingTable } from "../../../modules/listingDetails/ListingDetailsPricingTable"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { units, unitsWithOneOccupant } from "../../data/RailsListingUnits/listing-units"
import { amiCharts } from "../../data/RailsAmiCharts/ami-charts"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"

import {
  rpiRentalListing,
  rpiRentalListingAmis,
  rpiRentalListingUnits,
} from "../../data/RailsRentalListing/listing-rental-rent-as-a-percent-of-income"
import {
  openRentalListingUnits,
  openRentalListingAmis,
  openRentalListing,
} from "../../data/RailsRentalListing/listing-rental-open"
import {
  fourOneFiveRentalListing,
  fourOneFiveRentalListingAmis,
  fourOneFiveRentalListingUnits,
} from "../../data/RailsRentalListing/listing-rental-415"

describe("ListingDetailsPricingTable", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe("open rental listing", () => {
    it("renders ListingDetailsPricingTable component with open rental listing", () => {
      const { asFragment, getAllByRole } = render(
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

      // Expand all the accordions so their content is rendered
      getAllByRole("button").forEach((button) => {
        fireEvent.click(button)
      })

      expect(asFragment()).toMatchSnapshot()
    })

    it("calculates the correct minimum and maximum income", () => {
      const { getAllByRole, getByText } = render(
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

      // There should be 7 accordions
      const accordions = getAllByRole("button")
      expect(accordions).toHaveLength(7)

      // Four person household
      const fourPersonHouseholdButton = getAllByRole("button")[3]
      fireEvent.click(fourPersonHouseholdButton)
      expect(within(fourPersonHouseholdButton).getByText(/\$1,776 to \$9,433/i)).toBeInTheDocument()
      const fourPersonAMITiers = getAllByRole("heading", { level: 3 })
      expect(fourPersonAMITiers).toHaveLength(5)
      expect(getByText(/\$2,254 to \$4,441/i)).toBeInTheDocument()
      expect(getByText(/\$5,248 to \$9,433/i)).toBeInTheDocument()
      fireEvent.click(fourPersonHouseholdButton)

      // Seven person household
      const sevenPersonHouseholdButton = getAllByRole("button")[6]
      fireEvent.click(sevenPersonHouseholdButton)
      expect(
        within(sevenPersonHouseholdButton).getByText(/\$1,918 to \$11,700/i)
      ).toBeInTheDocument()
      const sevenPersonAMITiers = getAllByRole("heading", { level: 3 })
      expect(sevenPersonAMITiers).toHaveLength(5)
      expect(getByText(/\$2,918 to \$6,883/i)).toBeInTheDocument()
      expect(getByText(/\$5,248 to \$11,700/i)).toBeInTheDocument()
    })
  })

  describe("415 rental listing", () => {
    it("renders ListingDetailsPricingTable component with 415 rental listing", () => {
      const { asFragment, getAllByRole } = render(
        <ListingDetailsContext.Provider
          value={{
            units: fourOneFiveRentalListingUnits,
            amiCharts: fourOneFiveRentalListingAmis,
            fetchingUnits: false,
            fetchedUnits: true,
            fetchingAmiCharts: false,
            fetchedAmiCharts: true,
            fetchingAmiChartsError: undefined,
            fetchingUnitsError: undefined,
          }}
        >
          <ListingDetailsPricingTable listing={fourOneFiveRentalListing} />
        </ListingDetailsContext.Provider>
      )

      getAllByRole("button").forEach((button) => {
        fireEvent.click(button)
      })

      expect(asFragment()).toMatchSnapshot()
    })

    it("calculates the correct minimum and maximum income", () => {
      const { getAllByRole, getByText } = render(
        <ListingDetailsContext.Provider
          value={{
            units: fourOneFiveRentalListingUnits,
            amiCharts: fourOneFiveRentalListingAmis,
            fetchingUnits: false,
            fetchedUnits: true,
            fetchingAmiCharts: false,
            fetchedAmiCharts: true,
            fetchingAmiChartsError: undefined,
            fetchingUnitsError: undefined,
          }}
        >
          <ListingDetailsPricingTable listing={fourOneFiveRentalListing} />
        </ListingDetailsContext.Provider>
      )

      const accordions = getAllByRole("button")
      expect(accordions).toHaveLength(5)

      // Two person household
      const twoPersonExpectedAMITiers = [
        "Up to 65% AMI (Area Median Income)",
        "65% to 90% AMI",
        "90% to 130% AMI",
      ]
      const twoPersonHouseholdButton = getAllByRole("button")[1]
      fireEvent.click(twoPersonHouseholdButton)
      expect(within(twoPersonHouseholdButton).getByText(/\$2,364 to \$11,104/i)).toBeInTheDocument()
      const twoPersonHouseholdAMITiers = getAllByRole("heading", { level: 3 })
      expect(twoPersonHouseholdAMITiers).toHaveLength(3)
      twoPersonHouseholdAMITiers.forEach((tier, index) => {
        expect(within(tier).getByText(twoPersonExpectedAMITiers[index])).toBeInTheDocument()
      })
      expect(getByText(/\$2,988 to \$5,554/i)).toBeInTheDocument()
      expect(getByText(/\$5,480 to \$11,104/i)).toBeInTheDocument()
      fireEvent.click(twoPersonHouseholdButton)

      // Four person household
      const fourPersonHouseholdButton = getAllByRole("button")[3]
      const fourPersonExpectedAMITiers = ["Up to 65% AMI (Area Median Income)", "90% to 130% AMI"]
      fireEvent.click(fourPersonHouseholdButton)
      expect(
        within(fourPersonHouseholdButton).getByText(/\$2,988 to \$13,879/i)
      ).toBeInTheDocument()
      const fourPersonHouseholdAMITiers = getAllByRole("heading", { level: 3 })
      expect(fourPersonHouseholdAMITiers).toHaveLength(2)
      fourPersonHouseholdAMITiers.forEach((tier, index) => {
        expect(within(tier).getByText(fourPersonExpectedAMITiers[index])).toBeInTheDocument()
      })
      expect(getByText(/\$2,988 to \$6,937/i)).toBeInTheDocument()
      expect(getByText(/\$5,480 to \$13,879/i)).toBeInTheDocument()
    })
  })

  describe("rent as a percent of income listings", () => {
    it("renders ListingDetailsPricingTable component with rent as a percent of income", () => {
      const { asFragment, getAllByRole } = render(
        <ListingDetailsContext.Provider
          value={{
            units: rpiRentalListingUnits,
            amiCharts: rpiRentalListingAmis,
            fetchingUnits: false,
            fetchedUnits: true,
            fetchingAmiCharts: false,
            fetchedAmiCharts: true,
            fetchingAmiChartsError: undefined,
            fetchingUnitsError: undefined,
          }}
        >
          <ListingDetailsPricingTable listing={rpiRentalListing} />
        </ListingDetailsContext.Provider>
      )

      getAllByRole("button").forEach((button) => {
        fireEvent.click(button)
      })

      expect(asFragment()).toMatchSnapshot()
    })

    it("calculates the correct minimum and maximum income", () => {
      const { getAllByRole, getByRole } = render(
        <ListingDetailsContext.Provider
          value={{
            units: rpiRentalListingUnits,
            amiCharts: rpiRentalListingAmis,
            fetchingUnits: false,
            fetchedUnits: true,
            fetchingAmiCharts: false,
            fetchedAmiCharts: true,
            fetchingAmiChartsError: undefined,
            fetchingUnitsError: undefined,
          }}
        >
          <ListingDetailsPricingTable listing={rpiRentalListing} />
        </ListingDetailsContext.Provider>
      )

      // There should be 5 accordions
      expect(getAllByRole("button")).toHaveLength(3)

      // Two person household
      const twoPersonHouseholdButton = getAllByRole("button")[1]
      expect(within(twoPersonHouseholdButton).getByText(/\$0 to \$3,729/i)).toBeInTheDocument()

      fireEvent.click(twoPersonHouseholdButton)

      const twoPersonHouseholdAMITiers = getByRole("heading", { level: 3 })
      expect(twoPersonHouseholdAMITiers).toBeInTheDocument()
      const incomeTable = getByRole("table")
      expect(within(incomeTable).getByText(/\$0 to \$3,729/i)).toBeInTheDocument()
      expect(within(incomeTable).getByText(/30%/i)).toBeInTheDocument()
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
    const { asFragment, getAllByRole } = render(
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

    getAllByRole("button").forEach((button) => {
      fireEvent.click(button)
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it("renders ListingDetailsPricingTable component when rental listing with AMI full text", () => {
    const { asFragment, getAllByRole } = render(
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

    getAllByRole("button").forEach((button) => {
      fireEvent.click(button)
    })

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
