import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsAside } from "../../../modules/listingDetailsAside/ListingDetailsAside"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"

describe("ListingDetailsAside", () => {
  it("renders ListingDetailsAside component", () => {
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

    const { asFragment } = render(<ListingDetailsAside listing={closedRentalListing} imageSrc="" />)

    expect(asFragment()).toMatchSnapshot()
  })
})
