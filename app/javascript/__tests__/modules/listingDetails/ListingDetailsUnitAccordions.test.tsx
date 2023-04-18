import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsUnitAccordions } from "../../../modules/listingDetails/ListingDetailsUnitAccordions"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"
import { units } from "../../data/RailsListingUnits/listing-units"

describe("ListingDetailsUnitAccordion", () => {
  it("displays the unit accordions for a given listing", () => {
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
    const tree = renderer
      .create(
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
            amiChartData: {
              years: [],
              percentages: [],
              types: [],
            },
          }}
        >
          <ListingDetailsUnitAccordions />
        </ListingDetailsContext.Provider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("displays the spinner for loading state", () => {
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
    const tree = renderer
      .create(
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
            amiChartData: {
              years: [],
              percentages: [],
              types: [],
            },
          }}
        >
          <ListingDetailsUnitAccordions />
        </ListingDetailsContext.Provider>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
