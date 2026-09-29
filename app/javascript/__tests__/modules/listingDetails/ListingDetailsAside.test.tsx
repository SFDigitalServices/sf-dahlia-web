import React from "react"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { ListingDetailsAside } from "../../../modules/listingDetailsAside/ListingDetailsAside"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { fcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../../modules/constants"

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}))

describe("ListingDetailsAside", () => {
  beforeEach(() => {
    ;(useFeatureFlag as jest.Mock).mockImplementation((flagName: string) => ({
      flagsReady: true,
      unleashFlag: flagName === UNLEASH_FLAG.FORM_ENGINE,
    }))
  })

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

    const { asFragment } = render(
      <MemoryRouter>
        <ListingDetailsAside listing={closedRentalListing} imageSrc={"listing-units.svg"} />
      </MemoryRouter>
    )

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

    const { asFragment } = render(
      <MemoryRouter>
        <ListingDetailsAside listing={openSaleListing} imageSrc={"listing-units.svg"} />
      </MemoryRouter>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("renders ListingDetailsAside component fcfs", () => {
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
      <MemoryRouter>
        <ListingDetailsAside listing={fcfsSaleListing} imageSrc={"listing-units.svg"} />
      </MemoryRouter>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
