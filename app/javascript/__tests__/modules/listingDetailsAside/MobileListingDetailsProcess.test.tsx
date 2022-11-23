import React from "react"
import renderer from "react-test-renderer"
import { MobileListingDetailsProcess } from "../../../modules/listingDetailsAside/MobileListingDetailsProcess"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("MobileListingDetailsProcess", () => {
  it("does not render if listing is closed", () => {
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
        <MobileListingDetailsProcess
          listing={closedRentalListing}
          imageSrc=""
          isApplicationOpen={false}
        />
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it("renders with listing with open application", () => {
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
        <MobileListingDetailsProcess
          listing={openSaleListing}
          imageSrc=""
          isApplicationOpen={true}
        />
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
