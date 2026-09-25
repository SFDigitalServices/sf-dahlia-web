/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable react/prop-types */
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import ApplicationsPage from "../../../pages/account/applications"
import React from "react"
import { apiDelete, authenticatedGet, authenticatedDelete, get } from "../../../api/apiService"
import { AuthSessionProvider } from "../../../authentication/session/AuthSessionProvider"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../../modules/constants"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { applicationWithOpenListing } from "../../data/RailsApplication/application-with-open-listing"
import { Application } from "../../../api/types/rails/application/RailsApplication"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { setupUserContext } from "../../__util__/accountUtils"

jest.mock("axios")

jest.mock("../../../api/apiService.ts", () => ({
  apiDelete: jest.fn(),
  authenticatedGet: jest.fn(),
  authenticatedDelete: jest.fn(),
  get: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  ...jest.requireActual("../../../hooks/useFeatureFlag"),
  useFeatureFlag: jest.fn(),
}))

// TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
// Every flag is on by default in tests, so pin the Clerk flag per describe block.
// This helper, the useFeatureFlag mock above, and the Devise describes below all
// go with the flag, leaving the "when Clerk auth is enabled" cases as the suite.
const setClerkFlag = (clerkEnabled: boolean) => {
  ;(useFeatureFlag as jest.Mock).mockImplementation((flagName: string) => ({
    flagsReady: true,
    unleashFlag: flagName === UNLEASH_FLAG.CLERK_AUTH ? clerkEnabled : true,
  }))
}

const ApplicationsPageWithSession = () => (
  <AuthSessionProvider>
    <ApplicationsPage assetPaths={{}} />
  </AuthSessionProvider>
)

jest.mock("@bloom-housing/ui-seeds", () => {
  const originalModule = jest.requireActual("@bloom-housing/ui-seeds")

  const MockDialog = ({ children, isOpen }) =>
    isOpen ? <div data-testid="modalMock">{children}</div> : null
  MockDialog.Header = ({ children }) => <div>{children}</div>
  MockDialog.Content = ({ children }) => <div>{children}</div>
  MockDialog.Footer = ({ children }) => <div>{children}</div>

  return {
    __esModule: true,
    ...originalModule,
    Dialog: MockDialog,
  }
})

describe("<ApplicationsPage />", () => {
  let originalLocation: Location

  beforeEach(() => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setClerkFlag(false)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
  })

  describe("when the user is not signed in", () => {
    beforeEach(() => {
      setupUserContext({ loggedIn: false })
    })

    it("redirects to the sign in page", async () => {
      const { queryByRole } = await renderAndLoadAsync(<ApplicationsPageWithSession />)

      expect(window.location.assign).toHaveBeenCalledWith("/sign-in?redirect=applications")
      expect(
        queryByRole("heading", { name: "Applications and lottery results", level: 1 })
      ).toBeNull()
    })
  })

  describe("when a user is signed in", () => {
    beforeEach(() => {
      setupUserContext({ loggedIn: true })
      ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { data: "test-data" } })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it("shows the correct header text", async () => {
      await renderAndLoadAsync(<ApplicationsPageWithSession />)
      expect(
        screen.getByRole("heading", { name: "Applications and lottery results", level: 1 })
      ).not.toBeNull()
    })

    it("calls getApplications", async () => {
      await renderAndLoadAsync(<ApplicationsPageWithSession />)
      expect(authenticatedGet).toHaveBeenCalledWith("/api/v1/account/my-applications")
    })

    describe("application list rendering", () => {
      it("should render loading state", async () => {
        ;(authenticatedGet as jest.Mock).mockReturnValue(new Promise(() => {}))
        const { getByTestId } = await renderAndLoadAsync(<ApplicationsPageWithSession />)
        expect(getByTestId("loading-spinner")).toBeInTheDocument()
      })

      it("should render error state", async () => {
        ;(authenticatedGet as jest.Mock).mockRejectedValue(new Error("Error"))
        const { getByText } = await renderAndLoadAsync(<ApplicationsPageWithSession />)
        expect(
          getByText(/There was a problem loading your applications\. Try refreshing the page\./i)
        ).toBeInTheDocument()
      })

      it("should render no applications state", async () => {
        ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { applications: [] } })
        const { getByText, getByRole } = await renderAndLoadAsync(<ApplicationsPageWithSession />)
        expect(
          getByText("It looks like you haven't applied to any listings yet.")
        ).toBeInTheDocument()
        expect(getByRole("link", { name: /browse rentals/i })).toBeInTheDocument()
        expect(getByRole("link", { name: /browse sales/i })).toBeInTheDocument()
      })

      it("should render applications", async () => {
        const applications: Application[] = [
          applicationWithOpenListing,
          {
            ...applicationWithOpenListing,
            listing: openSaleListing,
          },
        ]
        ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { applications } })

        const { getByRole, queryAllByRole } = await renderAndLoadAsync(
          <ApplicationsPageWithSession />
        )

        expect(getByRole("heading", { name: /Rental Units/i, level: 2 })).toBeInTheDocument()
        expect(getByRole("heading", { name: /Sale Units/i, level: 2 })).toBeInTheDocument()
        expect(queryAllByRole("link", { name: /view application/i })).toHaveLength(2)
      })
    })

    describe("delete application", () => {
      const applications: Application[] = [
        applicationWithOpenListing,
        {
          ...applicationWithOpenListing,
          id: "abc123",
          listing: openSaleListing,
          status: "Draft",
        },
      ]

      beforeEach(() => {
        ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { applications } })
        ;(authenticatedDelete as jest.Mock).mockResolvedValue({ data: {} })
      })

      it("should display the delete button for an unsubmitted application", async () => {
        const { getByRole } = await renderAndLoadAsync(<ApplicationsPageWithSession />)
        expect(getByRole("button", { name: /Delete/i })).toBeInTheDocument()
      })

      it("should successfully call deleteApplication when the delete button is clicked", async () => {
        await renderAndLoadAsync(
          <>
            <ApplicationsPageWithSession />
            <div id="seeds-overlay-portal" />
          </>
        )
        expect(
          screen.getByRole("heading", { name: "Applications and lottery results", level: 1 })
        ).not.toBeNull()

        fireEvent.click(screen.getByRole("button", { name: /Delete/i }))

        const modal = screen.getByTestId("modalMock")
        fireEvent.click(within(modal).getByRole("button", { name: /Delete/i }))

        await waitFor(() => {
          const loadingSpinner = screen.queryByTestId("loading-spinner")
          expect(loadingSpinner).not.toBeInTheDocument()
          expect(
            screen.getByRole("heading", {
              name: /681 florida - casa adelante/i,
            })
          ).toBeInTheDocument()
        })

        await waitFor(() => {
          expect(
            screen.queryByRole("heading", {
              name: /test sale listing \(do not modify\) - homeownership acres/i,
            })
          ).not.toBeInTheDocument()
        })

        expect(
          screen.queryByRole("heading", { name: /Rental Units/i, level: 2 })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole("heading", { name: /Sale Units/i, level: 2 })
        ).not.toBeInTheDocument()

        expect(screen.queryByRole("button", { name: /Delete/i })).not.toBeInTheDocument()
      })

      it("should render error state when deleteApplication fails", async () => {
        ;(authenticatedDelete as jest.Mock).mockRejectedValue(new Error("Error"))
        await renderAndLoadAsync(
          <>
            <ApplicationsPageWithSession />
            <div id="seeds-overlay-portal" />
          </>
        )

        fireEvent.click(screen.getByRole("button", { name: /Delete/i }))

        const modal = screen.getByTestId("modalMock")
        fireEvent.click(within(modal).getByRole("button", { name: /Delete/i }))

        await waitFor(() => {
          expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument()
          expect(
            screen.getByText(
              /There was a problem loading your applications\. Try refreshing the page\./i
            )
          ).toBeInTheDocument()
        })
      })
    })

    it("renders the correct double submit modal", async () => {
      window.location.href = "http://dahlia.com?doubleSubmit=true"
      await renderAndLoadAsync(<ApplicationsPageWithSession />)
      const modal = screen.getByTestId("modalMock")
      within(modal).getByRole("link", {
        name: /dahliahousingportal@sfgov\.org/i,
      })
      within(modal).getByText(
        /an application has already been submitted to this listing using this account\./i
      )
    })

    it("renders the correct already submitted modal", async () => {
      ;(authenticatedGet as jest.Mock).mockResolvedValue({
        data: { applications: [applicationWithOpenListing] },
      })

      window.location.href = "http://dahlia.com?alreadySubmittedId=a0o6s000001cn02AAA"
      await renderAndLoadAsync(<ApplicationsPageWithSession />)
      const modal = screen.getByTestId("modalMock")
      within(modal).getByText(/submitted: june 5, 2024/i)
      const button = within(modal).getByRole("link", {
        name: /view application/i,
      })
      expect(button).toHaveAttribute("href", "/applications/a0o6s000001cn02AAA")
    })
  })

  describe("when Clerk auth is enabled", () => {
    const clerkAuthHeader = { headers: { Authorization: "Bearer clerk-session-token" } }
    const draftApplication: Application = {
      ...applicationWithOpenListing,
      id: "abc123",
      listing: openSaleListing,
      status: "Draft",
    }

    beforeEach(() => {
      setClerkFlag(true)
      setupUserContext({ loggedIn: true })
      ;(get as jest.Mock).mockResolvedValue({ data: { applications: [draftApplication] } })
      ;(apiDelete as jest.Mock).mockResolvedValue({ data: {} })
    })

    it("fetches applications with the Clerk session token", async () => {
      await renderAndLoadAsync(<ApplicationsPageWithSession />)

      expect(get).toHaveBeenCalledWith("/api/v1/account/my-applications", clerkAuthHeader)
      expect(authenticatedGet).not.toHaveBeenCalled()
    })

    it("deletes a draft application with the Clerk session token", async () => {
      await renderAndLoadAsync(
        <>
          <ApplicationsPageWithSession />
          <div id="seeds-overlay-portal" />
        </>
      )

      fireEvent.click(screen.getByRole("button", { name: /Delete/i }))
      const modal = screen.getByTestId("modalMock")
      fireEvent.click(within(modal).getByRole("button", { name: /Delete/i }))

      await waitFor(() => {
        expect(apiDelete).toHaveBeenCalledWith(
          "/api/v1/short-form/application/abc123",
          clerkAuthHeader
        )
      })
      expect(authenticatedDelete).not.toHaveBeenCalled()
    })
  })
})
