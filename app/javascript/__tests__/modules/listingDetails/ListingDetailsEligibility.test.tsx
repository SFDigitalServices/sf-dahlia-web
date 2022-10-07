import React from "react"
import renderer, { act } from "react-test-renderer"
import { ListingDetailsEligibility } from "../../../modules/listingDetails/ListingDetailsEligibility"
import { preferences as defaultPreferences } from "../../data/RailsListingPreferences/lottery-preferences-default"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import {
  sroMixedRentalListing,
  sroRentalListing,
} from "../../data/RailsRentalListing/listing-rental-sro"
import { getPreferences } from "../../../api/listingApiService"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

jest.mock("../../../api/listingApiService")

describe("ListingDetailsEligibility", () => {
  beforeEach(() => {
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
  })
  it("displays listing details eligibility section", () => {
    const tree = renderer
      .create(
        <ListingDetailsEligibility
          listing={closedRentalListing}
          imageSrc={"listing-eligibility.svg"}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays listing details eligibility section for a sales listing", async () => {
    const getPreferencesMock = getPreferences as jest.MockedFunction<typeof getPreferences>
    getPreferencesMock.mockReturnValue(Promise.resolve(defaultPreferences))

    const tree = renderer
      .create(
        <ListingDetailsEligibility listing={openSaleListing} imageSrc={"listing-eligibility.svg"} />
      )
      .toJSON()

    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(tree).toMatchSnapshot()
  })

  it("displays listing details eligibility section for a listing with only SRO units", () => {
    const tree = renderer
      .create(
        <ListingDetailsEligibility
          listing={sroRentalListing}
          imageSrc={"listing-eligibility.svg"}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it("displays listing details eligibility section for an SRO listing with expanded occupancy units", async () => {
    const listing = { ...sroRentalListing, Id: "a0W0P00000FIuv3UAD" }
    const getPreferencesMock = getPreferences as jest.MockedFunction<typeof getPreferences>
    getPreferencesMock.mockReturnValue(Promise.resolve(defaultPreferences))

    const tree = renderer
      .create(<ListingDetailsEligibility listing={listing} imageSrc={"listing-eligibility.svg"} />)
      .toJSON()

    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(tree).toMatchSnapshot()
  })

  it("displays listing details eligibility section for an SRO listing with a mix of SRO units and non-SRO units", async () => {
    const getPreferencesMock = getPreferences as jest.MockedFunction<typeof getPreferences>
    getPreferencesMock.mockReturnValue(Promise.resolve(defaultPreferences))

    const tree = renderer
      .create(
        <ListingDetailsEligibility
          listing={sroMixedRentalListing}
          imageSrc={"listing-eligibility.svg"}
        />
      )
      .toJSON()

    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(tree).toMatchSnapshot()
  })

  it("displays listing details eligibility section when habitat listing", async () => {
    const getPreferencesMock = getPreferences as jest.MockedFunction<typeof getPreferences>
    getPreferencesMock.mockReturnValue(Promise.resolve(defaultPreferences))

    const tree = renderer
      .create(
        <ListingDetailsEligibility listing={habitatListing} imageSrc={"listing-eligibility.svg"} />
      )
      .toJSON()

    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(tree).toMatchSnapshot()
  })
})
