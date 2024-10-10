import React from "react"
import { render, cleanup, waitFor } from "@testing-library/react"
import { ListingDetailsEligibility } from "../../../modules/listingDetails/ListingDetailsEligibility"
import { preferences as defaultPreferences } from "../../data/RailsListingPreferences/lottery-preferences-default"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"
import { unitsWithOneAmi } from "../../data/RailsListingUnits/listing-units"
import { amiChartsWithOneAmi } from "../../data/RailsAmiCharts/ami-charts"
import {
  pluralSroRentalListing,
  sroMixedRentalListing,
  sroRentalListing,
} from "../../data/RailsRentalListing/listing-rental-sro"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import {
  rentalEducatorListing1,
  rentalEducatorListing2,
} from "../../data/RailsRentalListing/listing-rental-educator"
import { t } from "@bloom-housing/ui-components"
import { renderAndLoadAsync } from "../../__util__/renderUtils"

const axios = require("axios")

jest.mock("axios")

describe("ListingDetailsEligibility", () => {
  beforeEach(() => {
    // This component pulls in react-media, which needs this custom mock
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    })
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("displays listing details eligibility section and no Building Selection Criteria Link", async () => {
    const testListing = {
      ...closedRentalListing,
      Building_Selection_Criteria: "",
    }

    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = await renderAndLoadAsync(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility listing={testListing} imageSrc={"listing-eligibility.svg"} />
      </ListingDetailsContext.Provider>
    )

    await waitFor(() => {
      expect(findByText("Eligibility")).toBeDefined()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays listing details eligibility section for a sales listing", async () => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = await renderAndLoadAsync(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility listing={openSaleListing} imageSrc={"listing-eligibility.svg"} />
      </ListingDetailsContext.Provider>
    )

    await waitFor(() => {
      expect(findByText("Eligibility")).toBeDefined()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays listing details eligibility section for a listing with only SRO units", async () => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })
    const { asFragment, findByText } = await renderAndLoadAsync(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility
          listing={sroRentalListing}
          imageSrc={"listing-eligibility.svg"}
        />
      </ListingDetailsContext.Provider>
    )

    await waitFor(() => {
      expect(findByText("Eligibility")).toBeDefined()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays listing details eligibility section for a listing with multiple occupancy SRO units", async () => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })
    const { asFragment, findByText } = await renderAndLoadAsync(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility
          listing={pluralSroRentalListing}
          imageSrc={"listing-eligibility.svg"}
        />
      </ListingDetailsContext.Provider>
    )

    await waitFor(() => {
      expect(findByText("Eligibility")).toBeDefined()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays listing details eligibility section for an SRO listing with expanded occupancy units", async () => {
    const listing = { ...sroRentalListing, Id: "a0W0P00000FIuv3UAD" }
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = await renderAndLoadAsync(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility listing={listing} imageSrc={"listing-eligibility.svg"} />
      </ListingDetailsContext.Provider>
    )

    await waitFor(() => {
      expect(findByText("Eligibility")).toBeDefined()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays listing details eligibility section for an SRO listing with a mix of SRO units and non-SRO units", async () => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = await renderAndLoadAsync(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility
          listing={sroMixedRentalListing}
          imageSrc={"listing-eligibility.svg"}
        />
      </ListingDetailsContext.Provider>
    )

    await waitFor(() => {
      expect(findByText("Eligibility")).toBeDefined()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays listing details eligibility section when habitat listing", async () => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = await renderAndLoadAsync(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility listing={habitatListing} imageSrc={"listing-eligibility.svg"} />
      </ListingDetailsContext.Provider>
    )

    await waitFor(() => {
      expect(findByText("Eligibility")).toBeDefined()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays custom listing details check if you're eligible section for Shirley Chisholm listing 1", async () => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = render(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility
          listing={rentalEducatorListing1}
          imageSrc={"listing-eligibility.svg"}
        />
      </ListingDetailsContext.Provider>
    )

    expect(
      await findByText(t("listings.customListingType.educator.eligibility.part1"))
    ).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays custom listing details check if you're eligible section for Shirley Chisholm listing 2", async () => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = render(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility
          listing={rentalEducatorListing2}
          imageSrc={"listing-eligibility.svg"}
        />
      </ListingDetailsContext.Provider>
    )

    expect(
      await findByText(t("listings.customListingType.educator.eligibility.priority"))
    ).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("displays ListingDetailsChisholmPreferences for educator listing 1", async () => {
    axios.get.mockResolvedValue({ data: { listings: [rentalEducatorListing1] } })
    const { asFragment, findByText } = await renderAndLoadAsync(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility
          listing={rentalEducatorListing1}
          imageSrc={"listing-eligibility.svg"}
        />
      </ListingDetailsContext.Provider>
    )

    expect(findByText(t("listings.customListingType.educator.preferences.part1"))).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
  })

  it("does not display ListingDetailsChisholmPreferences for a non-Chisholm listing", async () => {
    axios.get.mockResolvedValue({ data: { listings: [sroRentalListing] } })
    const { asFragment, findByText } = await renderAndLoadAsync(
      <ListingDetailsContext.Provider
        value={{
          units: unitsWithOneAmi,
          amiCharts: amiChartsWithOneAmi,
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: undefined,
          fetchingUnitsError: undefined,
        }}
      >
        <ListingDetailsEligibility
          listing={sroRentalListing}
          imageSrc={"listing-eligibility.svg"}
        />
      </ListingDetailsContext.Provider>
    )

    expect(findByText(t("listings.customListingType.educator.preferences.part1"))).not.toBeNull()
    expect(asFragment()).toMatchSnapshot()
  })

  it("does not display preferences when still loading", async () => {

  })

  it("does not display preferences when there are no preferences", async () => {

  })
})
