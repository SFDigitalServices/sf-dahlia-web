import React from "react"
import { render, cleanup } from "@testing-library/react"
import { ListingDetailsEligibility } from "../../../modules/listingDetails/ListingDetailsEligibility"
import { preferences as defaultPreferences } from "../../data/RailsListingPreferences/lottery-preferences-default"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import {
  sroMixedRentalListing,
  sroRentalListing,
} from "../../data/RailsRentalListing/listing-rental-sro"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"

const axios = require("axios")

jest.mock("axios")

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

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("displays listing details eligibility section and no Building Selection Criteria Link", async (done) => {
    const testListing = {
      ...closedRentalListing,
      Building_Selection_Criteria: "",
    }

    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = render(
      <ListingDetailsEligibility listing={testListing} imageSrc={"listing-eligibility.svg"} />
    )

    expect(await findByText("Eligibility")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("displays listing details eligibility section for a sales listing", async (done) => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = render(
      <ListingDetailsEligibility listing={openSaleListing} imageSrc={"listing-eligibility.svg"} />
    )

    expect(await findByText("Eligibility")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("displays listing details eligibility section for a listing with only SRO units", async (done) => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })
    const { asFragment, findByText } = render(
      <ListingDetailsEligibility listing={sroRentalListing} imageSrc={"listing-eligibility.svg"} />
    )

    expect(await findByText("Eligibility")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("displays listing details eligibility section for an SRO listing with expanded occupancy units", async (done) => {
    const listing = { ...sroRentalListing, Id: "a0W0P00000FIuv3UAD" }
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = render(
      <ListingDetailsEligibility listing={listing} imageSrc={"listing-eligibility.svg"} />
    )

    expect(await findByText("Eligibility")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("displays listing details eligibility section for an SRO listing with a mix of SRO units and non-SRO units", async (done) => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = render(
      <ListingDetailsEligibility
        listing={sroMixedRentalListing}
        imageSrc={"listing-eligibility.svg"}
      />
    )
    expect(await findByText("Eligibility")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })

  it("displays listing details eligibility section when habitat listing", async (done) => {
    axios.get.mockResolvedValue({ data: { preferences: defaultPreferences } })

    const { asFragment, findByText } = render(
      <ListingDetailsEligibility listing={habitatListing} imageSrc={"listing-eligibility.svg"} />
    )

    expect(await findByText("Eligibility")).toBeDefined()
    expect(asFragment()).toMatchSnapshot()
    done()
  })
})
