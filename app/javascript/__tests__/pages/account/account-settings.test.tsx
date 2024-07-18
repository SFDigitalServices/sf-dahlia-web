import React from "react"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import AccountSettingsPage from "../../../pages/account/account-settings"
import { act } from "react-dom/test-utils"
import { fireEvent } from "@testing-library/dom"

describe("<AccountSettingsPage />", () => {
  describe("when the user is signed in", () => {
    let getByText
    let getAllByText
    let getByLabelText
    let originalUseContext
    let promise

    beforeEach(async () => {
      originalUseContext = React.useContext
      const mockContextValue: ContextProps = {
        profile: {
          uid: "abc123",
          email: "email@email.com",
          created_at: new Date(),
          updated_at: new Date(),
          DOB: "1999-01-01",
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

      promise = Promise.resolve()

      const renderResult = await renderAndLoadAsync(<AccountSettingsPage assetPaths={{}} />)
      getByText = renderResult.getByText
      getAllByText = renderResult.getAllByText
      getByLabelText = renderResult.getByLabelText
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })
    it("shows the correct header text", () => {
      const title = getByText("Account settings")

      expect(title).not.toBeNull()
    })

    it("updates when clicked", async () => {
      const button = getAllByText("Update")
      const passwordField: Element = getByLabelText("Choose a new password")

      await act(async () => {
        button[0].dispatchEvent(new MouseEvent("click"))
        button[1].dispatchEvent(new MouseEvent("click"))
        fireEvent.change(passwordField, { target: { value: "1234test" } })
        button[1].dispatchEvent(new MouseEvent("click"))
        button[2].dispatchEvent(new MouseEvent("click"))
        await promise
      })

      // confirm that apis are called
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
      const { queryByText } = await renderAndLoadAsync(<AccountSettingsPage assetPaths={{}} />)

      expect(window.location.href).toBe("/sign-in")
      expect(queryByText("Account Settings")).toBeNull()
    })
  })
})
