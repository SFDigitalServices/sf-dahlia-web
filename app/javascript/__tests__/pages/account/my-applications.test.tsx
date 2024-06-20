import { renderAndLoadAsync } from "../../__util__/renderUtils"
import MyApplications from "../../../pages/account/my-applications"
import React from "react"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { authenticatedGet } from "../../../api/apiService"

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
      expect(getByText("My Applications")).not.toBeNull()
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
      expect(queryByText("My Applications")).toBeNull()
    })
  })
})
