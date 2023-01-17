import React from "react"
import renderer, { act } from "react-test-renderer"
import { ListingDetailsFeatures } from "../../../modules/listingDetails/ListingDetailsFeatures"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { units } from "../../data/RailsListingUnits/listing-units"
import { getUnits } from "../../../api/listingApiService"

jest.mock("../../../api/listingApiService")

describe("ListingDetailsFeatures", () => {
  it("displays listing details features section when rental listing", async () => {
    const getUnitsMock = getUnits as jest.MockedFunction<typeof getUnits>
    getUnitsMock.mockReturnValue(Promise.resolve(units))
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
        <ListingDetailsFeatures listing={closedRentalListing} imageSrc={"listing-features.svg"} />
      )
      .toJSON()

    // wait for state changes
    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(tree).toMatchSnapshot()
  })

  it("displays listing details features section when sales listing", async () => {
    const getUnitsMock = getUnits as jest.MockedFunction<typeof getUnits>
    getUnitsMock.mockReturnValue(Promise.resolve(units))
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
        <ListingDetailsFeatures listing={openSaleListing} imageSrc={"listing-features.svg"} />
      )
      .toJSON()

    // wait for state changes
    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(tree).toMatchSnapshot()
  })
})
