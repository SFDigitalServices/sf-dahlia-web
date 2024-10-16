import React from "react"
import { render } from "@testing-library/react"
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
    const { asFragment } = render(
      <MobileListingDetailsProcess
        listing={closedRentalListing}
        imageSrc=""
        isApplicationOpen={false}
      />
    )

    expect(asFragment()).toMatchSnapshot()
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

    const { asFragment } = render(
      <MobileListingDetailsProcess listing={openSaleListing} imageSrc="" isApplicationOpen={true} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
