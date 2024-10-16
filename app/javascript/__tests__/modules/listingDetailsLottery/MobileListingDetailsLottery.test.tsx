import React from "react"
import { render } from "@testing-library/react"
import { MobileListingDetailsLottery } from "../../../modules/listingDetailsLottery/MobileListingDetailsLottery"
import { fcfsSaleListing } from "../../data/RailsSaleListing/listing-sale-fcfs"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { notYetOpenSaleFcfsListing } from "../../data/RailsSaleListing/listing-sale-fcfs-not-yet-open"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}))

beforeEach(() => {
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

describe("MobileListingDetailsLottery", () => {
  it("does not display when fcfs sale listing", () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })

    const { asFragment } = render(
      <MobileListingDetailsLottery imageSrc="" listing={fcfsSaleListing} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("does display when fcfs toggle is disabled", () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })

    const { asFragment } = render(
      <MobileListingDetailsLottery imageSrc="" listing={notYetOpenSaleFcfsListing} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("does display when lottery listing is closed", () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })

    const { asFragment } = render(
      <MobileListingDetailsLottery listing={closedRentalListing} imageSrc={""} />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("does not display if listing is open", () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })

    const { asFragment } = render(
      <MobileListingDetailsLottery listing={openSaleListing} imageSrc={""} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
