import React from "react"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import AccountSettingsPage from "../../../pages/account/account-settings"
import { act } from "react-dom/test-utils"
import { fireEvent, screen, within } from "@testing-library/dom"
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
    let queryByText
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
      queryByText = renderResult.queryByText

      document.documentElement.lang = "en"
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it("shows the correct header text", () => {
      const title = getByText("Account settings")

      expect(title).not.toBeNull()
    })

    test("resize events", () => {
      expect(renderResult).toMatchSnapshot()

      // Change the viewport to 500px.
      global.innerWidth = 500

      // Trigger the window resize event.
      global.dispatchEvent(new Event("resize"))

      expect(renderResult).toMatchSnapshot()
    })

    describe("when the user updates their name and DOB", () => {
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
          expect(
            getByText("We will update any applications you have not submitted yet.")
          ).not.toBeNull()
          const closeButton = screen.getByLabelText("Close")

          fireEvent.click(closeButton)
          button[0].dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(getByText("Your changes have been saved.")).not.toBeNull()

        await act(async () => {
          const closeButton = screen.getByLabelText("Close")
          fireEvent.click(closeButton)

          await promise
        })

        expect(
          queryByText(
            "We sent you an email. Check your email and follow the link to finish changing your information."
          )
        ).toBeNull()

        expect(queryByText("Your changes have been saved.")).toBeNull()

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
          expect(
            getByText("We will update any applications you have not submitted yet.")
          ).not.toBeNull()
          const closeButton = screen.getByLabelText("Close")

          fireEvent.click(closeButton)

          button[1].dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(
          queryByText("We will update any applications you have not submitted yet.")
        ).toBeNull()
        expect(getByText("Your changes have been saved.")).not.toBeNull()

        expect(authenticatedPut).toHaveBeenCalledWith(
          "/api/v1/account/update",
          expect.objectContaining({
            contact: expect.objectContaining({
              DOB: "2000-02-06",
            }),
          })
        )

        expect(saveProfileMock).toHaveBeenCalled()
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

    describe("when the user updates their email", () => {
      it("updates Email", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            status: "success",
          },
        })

        const emailUpdateButton = getAllByText("Update")[2]
        const group = screen.getByRole("group", {
          name: /email/i,
        })

        const emailField = within(group).getByRole("textbox")

        await act(async () => {
          fireEvent.change(emailField, { target: { value: "test@test.com" } })
          emailUpdateButton.dispatchEvent(new MouseEvent("click"))

          expect(
            getByText("We will update any applications you have not submitted yet.")
          ).not.toBeNull()
          const closeButton = screen.getByLabelText("Close")
          fireEvent.click(closeButton)

          await promise
        })

        expect(
          getByText(
            "We sent you an email. Check your email and follow the link to finish changing your information."
          )
        ).not.toBeNull()

        await act(async () => {
          const closeButton = screen.getByLabelText("Close")
          fireEvent.click(closeButton)

          await promise
        })

        expect(
          queryByText(
            "We sent you an email. Check your email and follow the link to finish changing your information."
          )
        ).toBeNull()

        expect(authenticatedPut).toHaveBeenCalledWith(
          "/api/v1/auth",
          expect.objectContaining({
            user: expect.objectContaining({
              email: "test@test.com",
            }),
          })
        )
      })

      it("does not update with malformed emails", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            status: "success",
          },
        })

        const emailUpdateButton = getAllByText("Update")[2]
        const group = screen.getByRole("group", {
          name: /email/i,
        })

        const emailField = within(group).getByRole("textbox")

        await act(async () => {
          fireEvent.change(emailField, { target: { value: "testtest.com" } })
          emailUpdateButton.dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(authenticatedPut).not.toHaveBeenCalled()
      })
    })

    describe("when the user updates their password", () => {
      it("does not update when only one field is filled out", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            status: "success",
          },
        })

        const passwordUpdateButton = getAllByText("Update")[3]
        const currentPasswordField = screen.getByLabelText(/current password/i)

        await act(async () => {
          fireEvent.change(currentPasswordField, { target: { value: "abcd1234" } })
          passwordUpdateButton.dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(authenticatedPut).not.toHaveBeenCalled()
      })

      it("does not update when the new password field is insufficiently complex", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            status: "success",
          },
        })

        const passwordUpdateButton = getAllByText("Update")[3]

        const currentPasswordField = screen.getByLabelText(/current password/i)
        const newPasswordField = screen.getByLabelText(/choose a new password/i)

        await act(async () => {
          fireEvent.change(currentPasswordField, { target: { value: "abcd1234" } })
          fireEvent.change(newPasswordField, { target: { value: "password" } })
          passwordUpdateButton.dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(authenticatedPut).not.toHaveBeenCalled()
      })

      it("updates the password field", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            status: "success",
          },
        })

        const passwordUpdateButton = getAllByText("Update")[3]

        const currentPasswordField = screen.getByLabelText(/current password/i)
        const newPasswordField = screen.getByLabelText(/choose a new password/i)

        await act(async () => {
          fireEvent.change(currentPasswordField, { target: { value: "abcd1234" } })
          fireEvent.change(newPasswordField, { target: { value: "abcd1234!" } })
          passwordUpdateButton.dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(authenticatedPut).toHaveBeenCalledWith(
          "/api/v1/auth/password",
          expect.objectContaining({
            current_password: "abcd1234",
            password: "abcd1234!",
            password_confirmation: "abcd1234!",
          })
        )

        expect(newPasswordField.getAttribute("value")).toBe("")
        expect(currentPasswordField.getAttribute("value")).toBe("")
      })
    })

    describe("renders the correct errors", () => {
      test("name Errors", async () => {
        ;(authenticatedPut as jest.Mock).mockRejectedValue({
          response: {
            data: {
              errors: {
                firstName: ["unknown error"],
                lastName: ["unknown error"],
                full_messages: ["unknown error", "unknown error"],
              },
            },
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
          fireEvent.change(firstNameField, { target: { value: "" } })
          fireEvent.change(lastNameField, { target: { value: "" } })
          button[0].dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(getAllByText("Enter first name")).toHaveLength(2)
        expect(getAllByText("Enter last name")).toHaveLength(2)

        await act(async () => {
          screen
            .getByRole("button", {
              name: /enter last name/i,
            })
            .dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(firstNameField).toHaveFocus()

        await act(async () => {
          fireEvent.change(firstNameField, { target: { value: "First Name" } })
          fireEvent.change(lastNameField, { target: { value: "Last Name" } })
          button[0].dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(
          screen.getAllByRole("button", {
            name: /something went wrong/i,
          })
        ).not.toBeNull()
        expect(
          screen.getAllByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
      })

      test("date of birth errors", async () => {
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
          fireEvent.change(monthField, { target: { value: 45 } }) // invalid
          fireEvent.change(dayField, { target: { value: 56 } }) // invalid
          fireEvent.change(yearField, { target: { value: 1800 } }) // invalid
          button[1].dispatchEvent(new MouseEvent("click"))

          await promise
        })
        expect(
          screen.getByRole("button", {
            name: /enter a valid date of birth/i,
          })
        ).not.toBeNull()

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 1 } })
          fireEvent.change(dayField, { target: { value: 56 } }) // invalid
          fireEvent.change(yearField, { target: { value: 1800 } }) // invalid
          button[1].dispatchEvent(new MouseEvent("click"))

          await promise
        })
        expect(
          screen.getByRole("button", {
            name: /enter a valid date of birth/i,
          })
        ).not.toBeNull()

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 1 } })
          fireEvent.change(dayField, { target: { value: 1 } }) // invalid
          fireEvent.change(yearField, { target: { value: 202 } }) // invalid
          button[1].dispatchEvent(new MouseEvent("click"))

          await promise
        })
        expect(
          screen.getByRole("button", {
            name: /enter a valid date of birth/i,
          })
        ).not.toBeNull()

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 1 } })
          fireEvent.change(dayField, { target: { value: 56 } }) // invalid
          fireEvent.change(yearField, { target: { value: 1999 } })
          button[1].dispatchEvent(new MouseEvent("click"))

          await promise
        })
        expect(
          screen.getByRole("button", {
            name: /enter a valid date of birth/i,
          })
        ).not.toBeNull()
        expect(
          screen.getByText(/enter a valid date of birth\. enter date like: mm dd yyyy/i)
        ).not.toBeNull()
        expect(
          screen.queryByText(
            /you must be 18 or older\. if you are under 18, email to get info on housing resources for youth/i
          )
        ).toBeNull()
        ;(authenticatedPut as jest.Mock).mockRejectedValueOnce({
          response: {
            status: 422, // Indicates that the age is too young
            data: {
              message: "Unprocessable Entity",
            },
          },
        })
        await act(async () => {
          fireEvent.change(monthField, { target: { value: 1 } })
          fireEvent.change(dayField, { target: { value: 12 } })
          fireEvent.change(yearField, { target: { value: 1998 } })
          button[1].dispatchEvent(new MouseEvent("click"))

          await promise
        })
        expect(
          screen.getByText(/enter a valid date of birth\. enter date like: mm dd yyyy/i)
        ).not.toBeNull()
        ;(authenticatedPut as jest.Mock).mockRejectedValueOnce({
          response: {
            status: 500, // General server error
          },
        })
        await act(async () => {
          fireEvent.change(monthField, { target: { value: 1 } })
          fireEvent.change(dayField, { target: { value: 12 } })
          fireEvent.change(yearField, { target: { value: 1998 } })
          button[1].dispatchEvent(new MouseEvent("click"))

          await promise
        })
        expect(
          screen.getByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
      })

      test("email Errors", async () => {
        const button = getAllByText("Update")
        const group = screen.getByRole("group", {
          name: /email/i,
        })

        const emailField = within(group).getByRole("textbox")

        await act(async () => {
          fireEvent.change(emailField, { target: { value: "testtest.com" } })
          button[2].dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(
          screen.getByRole("button", {
            name: /email missing @ symbol/i,
          })
        ).not.toBeNull()

        expect(
          screen.getByText(/email missing @ symbol\. enter email like: example@web\.com/i)
        ).not.toBeNull()
        ;(authenticatedPut as jest.Mock).mockRejectedValueOnce({
          response: {
            status: 422, // Indicates that the email is invalid
            data: {
              message: "Unprocessable Entity",
            },
          },
        })
        await act(async () => {
          fireEvent.change(emailField, { target: { value: "test@test.com" } })
          button[2].dispatchEvent(new MouseEvent("click"))
          await promise
        })
        expect(
          screen.getByRole("button", {
            name: /email entered incorrectly/i,
          })
        ).not.toBeNull()
        expect(
          screen.getByText(/email entered incorrectly\. enter email like: example@web\.com/i)
        ).not.toBeNull()
        ;(authenticatedPut as jest.Mock).mockRejectedValueOnce({
          response: {
            status: 500, // General server error
          },
        })
        await act(async () => {
          fireEvent.change(emailField, { target: { value: "test@test.com" } })
          button[2].dispatchEvent(new MouseEvent("click"))
          await promise
        })
        expect(
          screen.getByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
      })
      test("password Errors", async () => {
        const button = getAllByText("Update")
        const currentPasswordField = screen.getByLabelText(/current password/i)
        const newPasswordField = screen.getByLabelText(/choose a new password/i)

        await act(async () => {
          fireEvent.change(currentPasswordField, { target: { value: "abcd1234" } })
          fireEvent.change(newPasswordField, { target: { value: "password" } })
          button[3].dispatchEvent(new MouseEvent("click"))
          await promise
        })
        expect(
          screen.getByText(
            /choose a strong password with at least 8 characters, 1 letter, and 1 number/i
          )
        ).not.toBeNull()
        expect(
          screen.getByRole("button", {
            name: /choose a strong password/i,
          })
        ).not.toBeNull()

        await act(async () => {
          fireEvent.change(currentPasswordField, { target: { value: "" } })
          fireEvent.change(newPasswordField, { target: { value: "" } })
          button[3].dispatchEvent(new MouseEvent("click"))
          await promise
        })
        expect(
          screen.getByRole("button", {
            name: /enter current password/i,
          })
        ).not.toBeNull()
        expect(
          screen.getByRole("button", {
            name: /enter new password/i,
          })
        ).not.toBeNull()
        ;(authenticatedPut as jest.Mock).mockRejectedValueOnce({
          response: {
            status: 500, // General server error
          },
        })

        await act(async () => {
          fireEvent.change(currentPasswordField, { target: { value: "abcd1234" } })
          fireEvent.change(newPasswordField, { target: { value: "password1" } })
          button[3].dispatchEvent(new MouseEvent("click"))
          await promise
        })
        expect(
          screen.getByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
        ;(authenticatedPut as jest.Mock).mockRejectedValueOnce({
          response: {
            status: 422,
            data: {
              errors: {
                full_messages: ["Current password is invalid"],
              },
            },
          },
        })
        await act(async () => {
          fireEvent.change(currentPasswordField, { target: { value: "abcd1234" } })
          fireEvent.change(newPasswordField, { target: { value: "password1" } })
          button[3].dispatchEvent(new MouseEvent("click"))
          await promise
        })
        expect(
          screen.getByRole("button", {
            name: /current password is incorrect/i,
          })
        ).not.toBeNull()
      })
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
