import React from "react"
import renderer from "react-test-renderer"
import { ListingDetailsUnitAccordion } from "../../../modules/listingDetails/ListingDetailsUnitAccordion"
import { unitsGrouped } from "../../data/RailsListingUnits/listing-units"

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
        Object.keys(unitsGrouped).map((unitType) => (
          <ListingDetailsUnitAccordion
            key={unitType}
            unitType={unitType}
            unitGroup={unitsGrouped[unitType]}
          />
        ))
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
