import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { useAuth } from "@clerk/clerk-react"
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

  describe("when Clerk auth is enabled", () => {
    beforeEach(() => {
      ;(useFeatureFlag as jest.Mock).mockImplementation((flagName: string) => ({
        flagsReady: true,
        unleashFlag: flagName === UNLEASH_FLAG.CLERK_AUTH,
      }))
    })

    it("redirects signed out users to sign in", () => {
      setupUserContext({ loggedIn: false })

      render(<ListingDetailsApply listing={openSaleListing} />)

      expect(screen.getByRole("link", { name: /apply online/i })).toHaveAttribute(
        "href",
        getSignInPath()
      )
    })

    it("redirects signed in users without a completed profile to the add profile page", () => {
      setupUserContext({ loggedIn: true, hasProfile: false })

      render(<ListingDetailsApply listing={openSaleListing} />)

      expect(screen.getByRole("link", { name: /apply online/i })).toHaveAttribute(
        "href",
        getAddProfilePath()
      )
    })

    it("does not render apply online while signed-in profile state is still loading", () => {
      const context = setupUserContext({ loggedIn: true, hasProfile: false })
      context.initialStateLoaded = false
      ;(useAuth as jest.Mock).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      })

      render(<ListingDetailsApply listing={openSaleListing} />)

      expect(screen.queryByRole("link", { name: /apply online/i })).toBeNull()
    })

    it("uses the listing application link for signed in users with a profile", () => {
      setupUserContext({ loggedIn: true, hasProfile: true })
      ;(useAuth as jest.Mock).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      })

      render(<ListingDetailsApply listing={openSaleListing} />)

      expect(screen.getByRole("link", { name: /apply online/i }).getAttribute("href")).toBe(
        `/listings/${openSaleListing.listingID}/apply-welcome/intro`
      )
    })

    it("does not render apply online while Clerk auth is loading", () => {
      setupUserContext({ loggedIn: false })
      ;(useAuth as jest.Mock).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
      })

      render(<ListingDetailsApply listing={openSaleListing} />)

      expect(screen.queryByRole("link", { name: /apply online/i })).toBeNull()
    })
  })
})
