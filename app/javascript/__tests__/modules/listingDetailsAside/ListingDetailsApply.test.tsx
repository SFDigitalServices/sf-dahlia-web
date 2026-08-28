import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { ListingDetailsApply } from "../../../modules/listingDetailsAside/ListingDetailsApply"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { setupUserContext } from "../../__util__/accountUtils"
import { getAddProfilePath } from "../../../util/routeUtil"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../../modules/constants"

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}))

describe("ListingDetailsApply", () => {
  beforeEach(() => {
    ;(useFeatureFlag as jest.Mock).mockImplementation((flagName: string) => ({
      flagsReady: true,
      unleashFlag: flagName === UNLEASH_FLAG.FORM_ENGINE,
    }))
  })

  it("does not render if listing is closed", () => {
    const { asFragment } = render(
      <MemoryRouter>
        <ListingDetailsApply listing={closedRentalListing} />
      </MemoryRouter>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it("renders if listing is open", () => {
    const { asFragment } = render(
      <MemoryRouter>
        <ListingDetailsApply listing={openSaleListing} />
      </MemoryRouter>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it(
    "displays habitat link for eligibility requirements when listing is habitat and is" + " open",
    () => {
      const openHabitatListing = {
        ...habitatListing,
        Application_Due_Date: "2032-12-02T01:00:00.000+0000",
      }

      const { asFragment } = render(
        <MemoryRouter>
          <ListingDetailsApply listing={openHabitatListing} />
        </MemoryRouter>
      )

      expect(asFragment()).toMatchSnapshot()
    }
  )

  it("redirects signed in users without a completed profile to the add profile page", () => {
    setupUserContext({ loggedIn: true, hasProfile: false })

    render(<ListingDetailsApply listing={openSaleListing} />)

    expect(screen.getByRole("link", { name: /apply online/i })).toHaveAttribute(
      "href",
      getAddProfilePath()
    )
  })
})
