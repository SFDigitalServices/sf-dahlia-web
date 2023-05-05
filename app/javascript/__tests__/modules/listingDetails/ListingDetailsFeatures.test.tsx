import React from "react"
import { render, cleanup } from "@testing-library/react"
import { ListingDetailsFeatures } from "../../../modules/listingDetails/ListingDetailsFeatures"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { units } from "../../data/RailsListingUnits/listing-units"
import { preferences as defaultPreferences } from "../../data/RailsListingPreferences/lottery-preferences-default"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"

const axios = require("axios")

jest.mock("axios")

describe("ListingDetailsFeatures", () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("displays listing details features section when rental listing", async (done) => {
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

    const { asFragment, findAllByTestId } = render(
      <ListingDetailsContext.Provider
        value={{
          units: units,
          amiCharts: [],
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: null,
          fetchingUnitsError: null,
        }}
      >
        <ListingDetailsFeatures listing={closedRentalListing} imageSrc={"listing-features.svg"} />
      </ListingDetailsContext.Provider>
    )

    expect(await findAllByTestId("content-accordion-button")).toHaveLength(3)
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("displays listing details features section when sales listing", async (done) => {
    axios.get.mockResolvedValue({
      data: { units: openSaleListing.Units, preferences: defaultPreferences },
    })

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

    const { asFragment, findAllByTestId } = render(
      <ListingDetailsContext.Provider
        value={{
          units: units,
          amiCharts: [],
          fetchingUnits: false,
          fetchedUnits: true,
          fetchingAmiCharts: false,
          fetchedAmiCharts: true,
          fetchingAmiChartsError: null,
          fetchingUnitsError: null,
        }}
      >
        <ListingDetailsFeatures listing={openSaleListing} imageSrc={"listing-features.svg"} />
      </ListingDetailsContext.Provider>
    )

    expect(await findAllByTestId("content-accordion-button")).toHaveLength(3)
    expect(asFragment()).toMatchSnapshot()
    done()
  })
})
