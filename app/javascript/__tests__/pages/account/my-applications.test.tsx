/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import MyApplications, {
  determineApplicationItemList,
} from "../../../pages/account/my-applications"
import React from "react"
import { authenticatedGet, authenticatedDelete } from "../../../api/apiService"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { applicationWithOpenListing } from "../../data/RailsApplication/application-with-open-listing"
import { Application } from "../../../api/types/rails/application/RailsApplication"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"
import { setupUserContext } from "../../__util__/accountUtils"

jest.mock("axios")

jest.mock("../../../api/apiService.ts", () => ({
  authenticatedGet: jest.fn(),
  authenticatedDelete: jest.fn(),
}))

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

describe("<MyApplications />", () => {
  let originalLocation: Location

  beforeEach(() => {
    // The below line prevents @axe-core from throwing an error
    // when the html tag does not have a lang attribute
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
  })

  describe("when the user is not signed in", () => {
    beforeEach(() => {
      setupUserContext({ loggedIn: false })
    })

    it("redirects to the sign in page", async () => {
      const { queryByText } = await renderAndLoadAsync(<MyApplications assetPaths={{}} />)

      expect(window.location.assign).toHaveBeenCalledWith("/sign-in?redirect=applications")
      expect(queryByText("My applications")).toBeNull()
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
      const { getByText } = await renderAndLoadAsync(<MyApplications assetPaths={{}} />)
      expect(getByText("My applications")).not.toBeNull()
    })

    it("calls getApplications", async () => {
      await renderAndLoadAsync(<MyApplications assetPaths={{}} />)
      expect(authenticatedGet).toHaveBeenCalledWith("/api/v1/account/my-applications")
    })

    describe("determineApplicationItemList", () => {
      it("should render loading state", () => {
        const { getByTestId } = render(determineApplicationItemList(true, "", [], () => {}))
        expect(getByTestId("loading-spinner")).toBeInTheDocument()
      })

      it("should render error state", () => {
        const { container } = render(determineApplicationItemList(false, "Error", [], () => {}))
        expect(container.textContent).toBe(
          "There was a problem loading your applications. Try refreshing the page. If the problem continues, send an email to sfhousinginfo@sfgov.org."
        )
      })

      it("should render no applications state", () => {
        const { getByText, getByRole } = render(
          determineApplicationItemList(false, "", [], () => {})
        )
        expect(
          getByText("It looks like you haven't applied to any listings yet.")
        ).toBeInTheDocument()
        expect(getByRole("link", { name: /browse rentals/i })).toBeInTheDocument()
        expect(getByRole("link", { name: /browse sales/i })).toBeInTheDocument()
      })

      it("should render applications", () => {
        const applications: Application[] = [
          applicationWithOpenListing,
          {
            ...applicationWithOpenListing,
            listing: openSaleListing,
          },
        ]

        const { getByRole, queryAllByRole } = render(
          determineApplicationItemList(false, "", applications, () => {})
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

      it("should display the delete button for an unsubmitted application", () => {
        const { getByRole } = render(
          determineApplicationItemList(false, "", applications, () => {})
        )
        expect(getByRole("button", { name: /Delete/i })).toBeInTheDocument()
      })

      it("should successfully call deleteApplication when the delete button is clicked", async () => {
        await renderAndLoadAsync(
          <>
            <MyApplications assetPaths={{}} />
            <div id="seeds-overlay-portal" />
          </>
        )
        expect(screen.getByText("My applications")).not.toBeNull()

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
    })

    it("renders the correct double submit modal", async () => {
      window.location.href = "http://dahlia.com?doubleSubmit=true"
      await renderAndLoadAsync(<MyApplications assetPaths={{}} />)
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
      await renderAndLoadAsync(<MyApplications assetPaths={{}} />)
      const modal = screen.getByTestId("modalMock")
      within(modal).getByText(/submitted: june 5, 2024/i)
      const button = within(modal).getByRole("link", {
        name: /view application/i,
      })
      expect(button).toHaveAttribute("href", "/applications/a0o6s000001cn02AAA")
    })
  })
})
