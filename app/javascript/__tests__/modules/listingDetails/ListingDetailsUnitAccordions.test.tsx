import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsUnitAccordions } from "../../../modules/listingDetails/ListingDetailsUnitAccordions"
import ListingDetailsContext from "../../../contexts/listingDetails/listingDetailsContext"
import { units } from "../../data/RailsListingUnits/listing-units"

describe("ListingDetailsUnitAccordion", () => {
  it("displays the unit accordions for a given listing", () => {
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
          }}
        >
          <ListingDetailsUnitAccordions />
        </ListingDetailsContext.Provider>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays spinner if no units and not fetching units", () => {
    const tree = renderer
      .create(
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
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays the spinner for loading state", () => {
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
          }}
        >
          <ListingDetailsUnitAccordions />
        </ListingDetailsContext.Provider>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
