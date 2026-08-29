import React from "react"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { ListingDetailsApply } from "../../../modules/listingDetailsAside/ListingDetailsApply"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { closedRentalListing } from "../../data/RailsRentalListing/listing-rental-closed"
import { habitatListing } from "../../data/RailsSaleListing/listing-sale-habitat"
import { setupUserContext } from "../../__util__/accountUtils"
import { getAddProfilePath, getSignInPath } from "../../../util/routeUtil"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../../modules/constants"

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}))

const mockNavigate = jest.fn()
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}))

describe("ListingDetailsApply", () => {
  beforeEach(() => {
    mockNavigate.mockClear()
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

  it("sends signed in users without a completed profile to sign-in with an add-profile redirect", async () => {
    // The Clerk apply button now routes through sign-in, which forwards this
    // redirect target, instead of linking straight to the add-profile page.
    ;(useFeatureFlag as jest.Mock).mockImplementation((flagName: string) => ({
      flagsReady: true,
      unleashFlag: flagName === UNLEASH_FLAG.CLERK_AUTH,
    }))
    setupUserContext({ loggedIn: true, hasProfile: false })

    render(
      <MemoryRouter>
        <ListingDetailsApply listing={openSaleListing} />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByRole("button", { name: /apply online/i }))

    expect(mockNavigate).toHaveBeenCalledWith(getSignInPath(), {
      state: { redirectUrl: getAddProfilePath() },
    })
  })
})
