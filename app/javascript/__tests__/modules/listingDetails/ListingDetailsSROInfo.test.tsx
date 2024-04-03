import React from "react"
import { render } from "@testing-library/react"
import { ListingDetailsSROInfo } from "../../../modules/listingDetails/ListingDetailsSROInfo"
import {
  sroRentalListing,
  pluralSroRentalListing,
} from "../../data/RailsRentalListing/listing-rental-sro"

describe("ListingDetailsLotteryInfo", () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it("displays the SRO info box for a regular SRO", () => {
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

    const { asFragment } = render(<ListingDetailsSROInfo listing={sroRentalListing} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("displays the Merry Go Round Housing description for its listing", () => {
    const listing = { ...pluralSroRentalListing, Id: "a0W0P00000F7t4uUAB" }
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

    const { asFragment } = render(<ListingDetailsSROInfo listing={listing} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
