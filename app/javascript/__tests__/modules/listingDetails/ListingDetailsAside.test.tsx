import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsAside } from "../../../modules/listingDetailsAside/ListingDetailsAside"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"

describe("ListingDetailsAside", () => {
  it("renders ListingDetailsAside component rental", () => {
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

  it("renders ListingDetailsAside component sales", () => {
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

    const { asFragment } = render(<ListingDetailsAside listing={openSaleListing} imageSrc="" />)

    expect(asFragment()).toMatchSnapshot()
  })
})
