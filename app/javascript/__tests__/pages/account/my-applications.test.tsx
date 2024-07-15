import { renderAndLoadAsync } from "../../__util__/renderUtils"
import MyApplications, {
  determineApplicationItemList,
} from "../../../pages/account/my-applications"
import React from "react"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { authenticatedGet } from "../../../api/apiService"
import { render } from "@testing-library/react"
import { applicationWithOpenListing } from "../../data/RailsApplication/application-with-open-listing"
import { Application } from "../../../api/types/rails/application/RailsApplication"
import { openSaleListing } from "../../data/RailsSaleListing/listing-sale-open"

jest.mock("axios")

jest.mock("../../../api/apiService.ts", () => ({
  authenticatedGet: jest.fn(),
}))

describe("<MyApplications />", () => {
  beforeAll(() => {
    // The below line prevents @axe-core from throwing an error
    // when the html tag does not have a lang attribute
    document.documentElement.lang = "en"
  })

  describe("when a user is signed in", () => {
    let originalUseContext

    beforeEach(() => {
      originalUseContext = React.useContext
      const mockContextValue: ContextProps = {
        profile: {
          uid: "abc123",
          email: "email@email.com",
          created_at: new Date(),
          updated_at: new Date(),
        },
        signIn: jest.fn(),
        signOut: jest.fn(),
        loading: false,
        initialStateLoaded: true,
      }

      jest.spyOn(React, "useContext").mockImplementation((context) => {
        if (context === UserContext) {
          return mockContextValue
        }
        return originalUseContext(context)
      })
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
  })

  describe("when the user is not signed in", () => {
    let originalUseContext
    let originalLocation: Location

    beforeEach(() => {
      originalUseContext = React.useContext
      originalLocation = window.location
      const mockContextValue: ContextProps = {
        profile: undefined,
        signIn: jest.fn(),
        signOut: jest.fn(),
        loading: false,
        initialStateLoaded: true,
      }

      jest.spyOn(React, "useContext").mockImplementation((context) => {
        if (context === UserContext) {
          return mockContextValue
        }
        return originalUseContext(context)
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)?.location
      ;(window as Window).location = {
        ...originalLocation,
        href: "http://dahlia.com",
        assign: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn(),
        toString: jest.fn(),
      }
    })

    afterEach(() => {
      jest.restoreAllMocks()
      window.location = originalLocation
    })

    it("redirects to the sign in page", async () => {
      const { queryByText } = await renderAndLoadAsync(<MyApplications assetPaths={{}} />)

      expect(window.location.href).toBe("/sign-in")
      expect(queryByText("My applications")).toBeNull()
    })
  })

  describe("display applications", () => {
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
      const { getByText, getByRole } = render(determineApplicationItemList(false, "", [], () => {}))
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
})
