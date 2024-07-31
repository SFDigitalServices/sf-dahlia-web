import React from "react"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import AccountSettingsPage from "../../../pages/account/account-settings"
import { act } from "react-dom/test-utils"
import { fireEvent, screen } from "@testing-library/dom"
import { authenticatedPut } from "../../../api/apiService"
import { User } from "../../../authentication/user"

const mockProfile: User = {
  uid: "abc123",
  email: "email@email.com",
  created_at: new Date(),
  updated_at: new Date(),
  DOB: "1999-01-01",
  firstName: "FirstName",
  lastName: "LastName",
  middleName: "MiddleName",
}

jest.mock("../../../api/apiService", () => ({
  authenticatedPut: jest.fn(),
}))

const saveProfileMock = jest.fn()

describe("<AccountSettingsPage />", () => {
  describe("when the user is signed in", () => {
    let getByText
    let getAllByText
    let getByLabelText
    let originalUseContext
    let promise
    let renderResult

    beforeEach(async () => {
      originalUseContext = React.useContext
      const mockContextValue: ContextProps = {
        profile: mockProfile,
        signIn: jest.fn(),
        signOut: jest.fn(),
        saveProfile: saveProfileMock,
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

      renderResult = await renderAndLoadAsync(<AccountSettingsPage assetPaths={{}} />)
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
        button[3].dispatchEvent(new MouseEvent("click"))
        await promise
      })

      // confirm that apis are called
    })
    test("resize events", () => {
      expect(renderResult).toMatchSnapshot()

      // Change the viewport to 500px.
      global.innerWidth = 500

      // Trigger the window resize event.
      global.dispatchEvent(new Event("resize"))

      expect(renderResult).toMatchSnapshot()
    })

    it("updates Name", async () => {
      ;(authenticatedPut as jest.Mock).mockResolvedValue({
        data: {
          contact: { ...mockProfile, firstName: "NewFirstName", lastName: "NewLastName" },
        },
      })

      const button = getAllByText("Update")
      const firstNameField: Element = screen.getByRole("textbox", {
        name: /first name/i,
      })
      const lastNameField: Element = screen.getByRole("textbox", {
        name: /last name/i,
      })

      await act(async () => {
        fireEvent.change(firstNameField, { target: { value: "NewFirstName" } })
        fireEvent.change(lastNameField, { target: { value: "NewLastName" } })
        button[0].dispatchEvent(new MouseEvent("click"))
        await promise
      })

      expect(authenticatedPut).toHaveBeenCalledWith(
        "/api/v1/account/update",
        expect.objectContaining({
          contact: expect.objectContaining({
            firstName: "NewFirstName",
            lastName: "NewLastName",
          }),
        })
      )

      expect(saveProfileMock).toHaveBeenCalled()

      expect(firstNameField.getAttribute("value")).toBe("NewFirstName")

      expect(lastNameField.getAttribute("value")).toBe("NewLastName")

      expect(getByText("Your changes have been saved.")).not.toBeNull()
      expect(
        getByText("We will update any applications you have not submitted yet.")
      ).not.toBeNull()
    })

    it("updates DOB", async () => {
      ;(authenticatedPut as jest.Mock).mockResolvedValue({
        data: {
          contact: {
            ...mockProfile,
            DOB: "2000-02-06",
            dobObject: { birthYear: "2000", birthMonth: "02", birthDay: "06" },
          },
        },
      })

      const button = getAllByText("Update")
      const monthField: Element = screen.getByRole("textbox", {
        name: /month/i,
      })
      const dayField: Element = screen.getByRole("textbox", {
        name: /day/i,
      })
      const yearField: Element = screen.getByRole("textbox", {
        name: /year/i,
      })

      await act(async () => {
        fireEvent.change(monthField, { target: { value: 2 } })
        fireEvent.change(dayField, { target: { value: 6 } })
        fireEvent.change(yearField, { target: { value: 2000 } })
        button[1].dispatchEvent(new MouseEvent("click"))
        await promise
      })

      expect(authenticatedPut).toHaveBeenCalledWith(
        "/api/v1/account/update",
        expect.objectContaining({
          contact: expect.objectContaining({
            DOB: "2000-2-6",
          }),
        })
      )

      expect(saveProfileMock).toHaveBeenCalled()

      expect(getByText("Your changes have been saved.")).not.toBeNull()
      expect(
        getByText("We will update any applications you have not submitted yet.")
      ).not.toBeNull()
    })

    it("blocks a DOB update if invalid", async () => {
      const button = getAllByText("Update")
      const monthField: Element = screen.getByRole("textbox", {
        name: /month/i,
      })
      const dayField: Element = screen.getByRole("textbox", {
        name: /day/i,
      })
      const yearField: Element = screen.getByRole("textbox", {
        name: /year/i,
      })

      await act(async () => {
        fireEvent.change(monthField, { target: { value: 15 } }) // invalid
        fireEvent.change(dayField, { target: { value: 6 } })
        fireEvent.change(yearField, { target: { value: 2000 } })
        button[1].dispatchEvent(new MouseEvent("click"))
        await promise
      })

      expect(authenticatedPut).not.toHaveBeenCalled()

      await act(async () => {
        fireEvent.change(monthField, { target: { value: 2 } })
        fireEvent.change(dayField, { target: { value: 74 } }) // invalid
        fireEvent.change(yearField, { target: { value: 2000 } })
        button[1].dispatchEvent(new MouseEvent("click"))
        await promise
      })

      expect(authenticatedPut).not.toHaveBeenCalled()

      await act(async () => {
        fireEvent.change(monthField, { target: { value: 2 } })
        fireEvent.change(dayField, { target: { value: 6 } })
        fireEvent.change(yearField, { target: { value: 1823 } }) // invalid
        button[1].dispatchEvent(new MouseEvent("click"))
        await promise
      })

      expect(authenticatedPut).not.toHaveBeenCalled()
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
        saveProfile: jest.fn(),
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
