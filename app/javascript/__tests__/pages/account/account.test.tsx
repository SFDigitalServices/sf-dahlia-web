/* eslint-disable @typescript-eslint/unbound-method */
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import Account from "../../../pages/account/account"
import React from "react"
import { MemoryRouter } from "react-router"
import { within, screen, fireEvent, waitFor } from "@testing-library/react"
import { useAuth } from "@clerk/react"
import { setupUserContext } from "../../__util__/accountUtils"
import { withAuthentication } from "../../../authentication/withAuthentication"
import { RedirectType, getSignInPath } from "../../../util/routeUtil"

jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

const mockNavigate = jest.fn()
jest.mock("react-router", () => ({
  ...jest.requireActual<typeof import("react-router")>("react-router"),
  useNavigate: () => mockNavigate,
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: () => ({ flagsReady: true, unleashFlag: true }),
}))

describe("<Account />", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
    jest.spyOn(console, "error").mockImplementation(() => {})
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  })

  describe("when the user is signed in", () => {
    let originalLocation: Location
    let overviewNav: HTMLElement

    beforeEach(async () => {
      originalLocation = mockWindowLocation()
      setupUserContext({ loggedIn: true })
      const WrappedComponent = withAuthentication(Account, { redirectType: RedirectType.Account })
      await renderAndLoadAsync(<WrappedComponent assetPaths={{}} />, {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/account"]}>{children}</MemoryRouter>
        ),
      })
      overviewNav = screen
        .getAllByRole("navigation", { name: "Account" })
        .find((nav) => within(nav).queryByRole("link", { name: /See applications/ }))!
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("contains three tabs within the account layout", () => {
      expect(within(overviewNav).getAllByRole("listitem")).toHaveLength(3)
    })

    it("first tab has title 'Applications and lottery results'", () => {
      expect(
        within(overviewNav).getByRole("heading", {
          level: 2,
          name: "Applications and lottery results",
        })
      ).toBeInTheDocument()
    })

    it("second link has title Account settings", () => {
      const listItems = within(overviewNav).getAllByRole("listitem")
      expect(
        within(listItems[1]).getByRole("heading", { level: 2, name: "Account settings" })
      ).toBeInTheDocument()
    })

    it("does not nest links inside overview tabs", () => {
      const anchors = overviewNav.querySelectorAll("a")
      expect(anchors).toHaveLength(2)
      anchors.forEach((anchor) => {
        expect(anchor.querySelector("a")).toBeNull()
      })
    })
  })

  describe("when the Clerk user signs out", () => {
    let originalLocation: Location
    let clerkSignOut: jest.Mock

    beforeEach(async () => {
      originalLocation = mockWindowLocation()
      setupUserContext({ loggedIn: true })
      clerkSignOut = jest.fn().mockResolvedValue(undefined)
      ;(useAuth as jest.Mock).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        getToken: jest.fn().mockResolvedValue("clerk-session-token"),
        signOut: clerkSignOut,
      })

      const WrappedComponent = withAuthentication(Account, { redirectType: RedirectType.Account })
      await renderAndLoadAsync(<WrappedComponent assetPaths={{}} />, {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/account"]}>{children}</MemoryRouter>
        ),
      })
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("ends the Clerk session and routes to sign in from the account overview", async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sign out of account" }))

      await waitFor(() => expect(clerkSignOut).toHaveBeenCalled())
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(getSignInPath()))
    })

    it("ends the Clerk session and routes to sign in from the account nav", async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sign out" }))

      await waitFor(() => expect(clerkSignOut).toHaveBeenCalled())
      await waitFor(() => expect(window.location.href).toEqual(getSignInPath()))
    })
  })

  describe("when the user is not signed in", () => {
    let originalLocation: Location

    beforeEach(async () => {
      originalLocation = mockWindowLocation()
      setupUserContext({ loggedIn: false })

      const WrappedComponent = withAuthentication(Account, { redirectType: RedirectType.Account })
      await renderAndLoadAsync(<WrappedComponent assetPaths={{}} />)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("redirects to the sign in page if the user is not signed in", () => {
      expect(window.location.assign).toHaveBeenCalledWith("/sign-in?redirect=account")
    })
  })
})
