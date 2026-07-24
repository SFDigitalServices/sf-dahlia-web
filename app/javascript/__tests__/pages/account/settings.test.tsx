/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import SettingsPage from "../../../pages/account/settings"
import { fireEvent, screen, within, act } from "@testing-library/react"
import { authenticatedGet, authenticatedPut } from "../../../api/apiService"
import { mockProfileStub, setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"

jest.mock("../../../api/apiService", () => ({
  authenticatedPut: jest.fn(),
  authenticatedGet: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

const mockAgencies = [
  { id: "123", name: "Test Agency A", shortName: "A" },
  { id: "456", name: "Test Agency B", shortName: "B" },
]

describe("<SettingsPage />", () => {
  describe("when the user is signed in", () => {
    let promise
    let originalLocation: Location

    beforeEach(async () => {
      document.documentElement.lang = "en"
      originalLocation = mockWindowLocation()
      ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
      setupUserContext({ loggedIn: true })
      ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { agencies: [] } })
      promise = Promise.resolve()
      await renderAndLoadAsync(<SettingsPage assetPaths={{}} />)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("shows the correct header text", () => {
      const title = screen.getByRole("heading", { name: "Account settings", level: 1 })

      expect(title).not.toBeNull()
    })

    describe("when the user updates their name and DOB", () => {
      it("updates Name", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            contact: { ...mockProfileStub, firstName: "NewFirstName", lastName: "NewLastName" },
          },
        })

        const button = screen.getByRole("button", { name: "Save name" })
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
            screen.getByText("We will update any applications you have not submitted yet.")
          ).not.toBeNull()
          const closeButton = screen.getByLabelText("Close")

          fireEvent.click(closeButton)
          fireEvent.click(button)
          await promise
        })

        expect(screen.getByText("Your changes have been saved.")).not.toBeNull()

        await act(async () => {
          const closeButton = screen.getByLabelText("Close")
          fireEvent.click(closeButton)

          await promise
        })

        expect(
          screen.queryByText(
            "We sent you an email. Check your email and follow the link to finish changing your information."
          )
        ).toBeNull()

        expect(screen.queryByText("Your changes have been saved.")).toBeNull()

        expect(authenticatedPut).toHaveBeenCalledWith(
          "/api/v1/account/update",
          expect.objectContaining({
            contact: expect.objectContaining({
              firstName: "NewFirstName",
              lastName: "NewLastName",
            }),
          })
        )

        expect(firstNameField.getAttribute("value")).toBe("NewFirstName")

        expect(lastNameField.getAttribute("value")).toBe("NewLastName")
      })

      it("updates DOB", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            contact: {
              ...mockProfileStub,
              DOB: "2000-02-06",
              dobObject: { birthYear: "2000", birthMonth: "02", birthDay: "06" },
            },
          },
        })

        const dobButton = screen.getByRole("button", { name: "Save date of birth" })
        const monthField: Element = screen.getByRole("spinbutton", {
          name: /month/i,
        })
        const dayField: Element = screen.getByRole("spinbutton", {
          name: /day/i,
        })
        const yearField: Element = screen.getByRole("spinbutton", {
          name: /year/i,
        })

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 2 } })
          fireEvent.change(dayField, { target: { value: 6 } })
          fireEvent.change(yearField, { target: { value: 2000 } })
          expect(
            screen.getByText("We will update any applications you have not submitted yet.")
          ).not.toBeNull()
          const closeButton = screen.getByLabelText("Close")

          fireEvent.click(closeButton)

          fireEvent.click(dobButton)
          await promise
        })

        expect(
          screen.queryByText("We will update any applications you have not submitted yet.")
        ).toBeNull()
        expect(screen.getByText("Your changes have been saved.")).not.toBeNull()

        await act(async () => {
          const closeButton = screen.getByLabelText("Close")
          fireEvent.click(closeButton)
          await promise
        })

        expect(screen.queryByText("Your changes have been saved.")).toBeNull()

        expect(authenticatedPut).toHaveBeenCalledWith(
          "/api/v1/account/update",
          expect.objectContaining({
            contact: expect.objectContaining({
              DOB: "2000-02-06",
            }),
          })
        )
      })

      it("blocks a DOB update if invalid", async () => {
        const dobButton = screen.getByRole("button", { name: "Save date of birth" })
        const monthField: Element = screen.getByRole("spinbutton", {
          name: /month/i,
        })
        const dayField: Element = screen.getByRole("spinbutton", {
          name: /day/i,
        })
        const yearField: Element = screen.getByRole("spinbutton", {
          name: /year/i,
        })

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 15 } }) // invalid
          fireEvent.change(dayField, { target: { value: 6 } })
          fireEvent.change(yearField, { target: { value: 2000 } })
          fireEvent.click(dobButton)
          await promise
        })

        expect(authenticatedPut).not.toHaveBeenCalled()

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 2 } })
          fireEvent.change(dayField, { target: { value: 74 } }) // invalid
          fireEvent.change(yearField, { target: { value: 2000 } })
          fireEvent.click(dobButton)
          await promise
        })

        expect(authenticatedPut).not.toHaveBeenCalled()

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 2 } })
          fireEvent.change(dayField, { target: { value: 6 } })
          fireEvent.change(yearField, { target: { value: 1823 } }) // invalid
          fireEvent.click(dobButton)
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

        const emailUpdateButton = screen.getByRole("button", { name: "Save email address" })
        const group = screen.getByRole("group", {
          name: /email/i,
        })

        expect(
          screen.getByRole("link", {
            name: /forgot password\?/i,
          })
        ).toHaveAttribute("href", "/forgot-password?email=email@email.com")

        const emailField = within(group).getByRole("textbox")

        await act(async () => {
          fireEvent.change(emailField, { target: { value: "test@test.com" } })
          emailUpdateButton.dispatchEvent(new MouseEvent("click"))

          expect(
            screen.getByText("We will update any applications you have not submitted yet.")
          ).not.toBeNull()
          const closeButton = screen.getByLabelText("Close")
          fireEvent.click(closeButton)

          await promise
        })

        expect(
          screen.getByText(
            "We sent you an email. Check your email and follow the link to finish changing your information."
          )
        ).not.toBeNull()

        await act(async () => {
          const closeButton = screen.getByLabelText("Close")
          fireEvent.click(closeButton)

          await promise
        })

        expect(
          screen.queryByText(
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

        expect(
          screen.getByRole("link", {
            name: /forgot password\?/i,
          })
        ).toHaveAttribute("href", "/forgot-password?email=test@test.com")
      })

      it("does not update with malformed emails", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            status: "success",
          },
        })

        const emailUpdateButton = screen.getByRole("button", { name: "Save email address" })
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

        const passwordUpdateButton = screen.getByRole("button", { name: "Save password" })
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

        const passwordUpdateButton = screen.getByRole("button", { name: "Save password" })

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

        const passwordUpdateButton = screen.getByRole("button", { name: "Save password" })

        const currentPasswordField = screen.getByLabelText(/current password/i)
        const newPasswordField = screen.getByLabelText(/choose a new password/i)

        await act(async () => {
          fireEvent.change(currentPasswordField, { target: { value: "abcd1234" } })
          fireEvent.change(newPasswordField, { target: { value: "abcd1234!" } })
          passwordUpdateButton.dispatchEvent(new MouseEvent("click"))
          await promise
        })

        expect(screen.getByText("Your changes have been saved.")).not.toBeNull()

        await act(async () => {
          const closeButton = screen.getByLabelText("Close")
          fireEvent.click(closeButton)
          await promise
        })

        expect(screen.queryByText("Your changes have been saved.")).toBeNull()

        expect(authenticatedPut).toHaveBeenCalledWith(
          "/api/v1/auth/password",
          expect.objectContaining({
            current_password: "abcd1234",
            password: "abcd1234!",
            password_confirmation: "abcd1234!",
          })
        )

        // React 19 omits the empty `value` attribute; assert on the value property instead.
        expect(newPasswordField).toHaveValue("")
        expect(currentPasswordField).toHaveValue("")
      })
    })

    describe("renders the correct errors", () => {
      it("name Errors", async () => {
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

        const button = screen.getByRole("button", { name: "Save name" })
        const firstNameField: Element = screen.getByRole("textbox", {
          name: /first name/i,
        })

        const lastNameField: Element = screen.getByRole("textbox", {
          name: /last name/i,
        })

        await act(async () => {
          fireEvent.change(firstNameField, { target: { value: "" } })
          fireEvent.change(lastNameField, { target: { value: "" } })
          fireEvent.click(button)
          await promise
        })

        expect(screen.getAllByText("Enter first name")).toHaveLength(2)
        expect(screen.getAllByText("Enter last name")).toHaveLength(2)

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
          fireEvent.click(button)
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

      it("date of birth errors", async () => {
        const dobButton = screen.getByRole("button", { name: "Save date of birth" })
        const monthField: Element = screen.getByRole("spinbutton", {
          name: /month/i,
        })
        const dayField: Element = screen.getByRole("spinbutton", {
          name: /day/i,
        })
        const yearField: Element = screen.getByRole("spinbutton", {
          name: /year/i,
        })

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 45 } }) // invalid
          fireEvent.change(dayField, { target: { value: 56 } }) // invalid
          fireEvent.change(yearField, { target: { value: 1800 } }) // invalid
          fireEvent.click(dobButton)

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
          fireEvent.click(dobButton)

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
          fireEvent.click(dobButton)

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
          fireEvent.click(dobButton)

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
          fireEvent.click(dobButton)

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
          fireEvent.click(dobButton)

          await promise
        })
        expect(
          screen.getByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
      })

      it("email Errors", async () => {
        const emailButton = screen.getByRole("button", { name: "Save email address" })
        const group = screen.getByRole("group", {
          name: /email/i,
        })

        const emailField = within(group).getByRole("textbox")

        await act(async () => {
          fireEvent.change(emailField, { target: { value: "testtest.com" } })
          fireEvent.click(emailButton)
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
          fireEvent.click(emailButton)
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
          fireEvent.click(emailButton)
          await promise
        })
        expect(
          screen.getByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
      })
      it("password Errors", async () => {
        const passwordButton = screen.getByRole("button", { name: "Save password" })
        const currentPasswordField = screen.getByLabelText(/current password/i)
        const newPasswordField = screen.getByLabelText(/choose a new password/i)

        await act(async () => {
          fireEvent.change(currentPasswordField, { target: { value: "abcd1234" } })
          fireEvent.change(newPasswordField, { target: { value: "password" } })
          fireEvent.click(passwordButton)
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
          fireEvent.click(passwordButton)
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
          fireEvent.click(passwordButton)
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
          fireEvent.click(passwordButton)
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

  describe("when the user grants their housing counselor agency access", () => {
    let originalLocation: Location
    let mockContext: ReturnType<typeof setupUserContext>

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    describe("when the feature flag is enabled", () => {
      beforeEach(async () => {
        document.documentElement.lang = "en"
        originalLocation = mockWindowLocation()
        ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
        mockContext = setupUserContext({ loggedIn: true })
        ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { agencies: mockAgencies } })
        await renderAndLoadAsync(<SettingsPage assetPaths={{}} />)
      })

      it("renders the housing counselor section on the page", async () => {
        expect(
          await screen.findByRole("group", {
            name: /share your account with a housing counselor/i,
          })
        ).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /share my account/i })).toBeInTheDocument()
      })

      it("shares access with a housing counselor agency when the user clicks the share button", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            contact: {
              ...mockProfileStub,
              housingCounselingAgencyId: "123",
            },
          },
        })

        const agencySelect = await screen.findByLabelText(/counseling agency/i)
        const agreeCheckbox = screen.getByLabelText(/i agree to share my account with this agency/i)
        const shareButton = screen.getByRole("button", { name: /share my account/i })

        await act(async () => {
          fireEvent.change(agencySelect, { target: { value: "123" } })
          fireEvent.click(agreeCheckbox)
          fireEvent.click(shareButton)
          await Promise.resolve()
        })

        expect(
          await screen.findByText(
            /you shared your account\. we sent a confirmation to your email\./i
          )
        ).toBeInTheDocument()
        expect(authenticatedPut).toHaveBeenCalledWith(
          "/api/v1/account/update-housing-counselor",
          expect.objectContaining({
            contact: expect.objectContaining({
              housingCounselingAgencyId: "123",
            }),
          })
        )
        expect(mockContext.saveProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            housingCounselingAgencyId: "123",
          })
        )
      })

      it("does not show a success toast when sharing fails", async () => {
        ;(authenticatedPut as jest.Mock).mockRejectedValue(new Error("Network error"))

        const agencySelect = await screen.findByLabelText(/counseling agency/i)
        const agreeCheckbox = screen.getByLabelText(/i agree to share my account with this agency/i)
        const shareButton = screen.getByRole("button", { name: /share my account/i })

        await act(async () => {
          fireEvent.change(agencySelect, { target: { value: "123" } })
          fireEvent.click(agreeCheckbox)
          fireEvent.click(shareButton)
          await Promise.resolve()
        })

        expect(
          screen.queryByText(/you shared your account\. we sent a confirmation to your email\./i)
        ).toBeNull()
      })
    })

    describe("when the user revokes their housing counselor agency access", () => {
      beforeEach(async () => {
        document.documentElement.lang = "en"
        originalLocation = mockWindowLocation()
        ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
        mockContext = setupUserContext({
          loggedIn: true,
          mockProfile: {
            ...mockProfileStub,
            housingCounselingAgencyId: "123",
          },
        })
        ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { agencies: mockAgencies } })
        await renderAndLoadAsync(<SettingsPage assetPaths={{}} />)
      })

      it("revokes housing counselor access when the user clicks the revoke button", async () => {
        ;(authenticatedPut as jest.Mock).mockResolvedValue({
          data: {
            contact: {
              ...mockProfileStub,
              housingCounselingAgencyId: null,
            },
          },
        })

        expect(
          await screen.findByText(/your account is shared with test agency a/i)
        ).toBeInTheDocument()

        const revokeButton = screen.getByRole("button", { name: /stop sharing/i })

        await act(async () => {
          fireEvent.click(revokeButton)
          await Promise.resolve()
        })

        expect(
          await screen.findByText(
            /you stopped sharing your account\. we sent a confirmation to your email\./i
          )
        ).toBeInTheDocument()
        expect(authenticatedPut).toHaveBeenCalledWith(
          "/api/v1/account/update-housing-counselor",
          expect.objectContaining({
            contact: expect.objectContaining({
              housingCounselingAgencyId: null,
            }),
          })
        )
        expect(mockContext.saveProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            housingCounselingAgencyId: null,
          })
        )
      })
    })

    describe("when the feature flag is disabled", () => {
      beforeEach(async () => {
        document.documentElement.lang = "en"
        originalLocation = mockWindowLocation()
        ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
        setupUserContext({ loggedIn: true })
        ;(authenticatedGet as jest.Mock).mockResolvedValue({ data: { agencies: mockAgencies } })
        await renderAndLoadAsync(<SettingsPage assetPaths={{}} />)
      })

      it("does not render the housing counselor section", () => {
        expect(
          screen.queryByRole("group", {
            name: /share your account with a housing counselor/i,
          })
        ).toBeNull()
        expect(screen.queryByRole("button", { name: /share my account/i })).toBeNull()
      })
    })
  })

  describe("when the user is not signed in", () => {
    let originalLocation: Location

    beforeEach(async () => {
      originalLocation = mockWindowLocation()
      ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
      setupUserContext({ loggedIn: false })

      await renderAndLoadAsync(<SettingsPage assetPaths={{}} />)
    })

    afterEach(() => {
      restoreWindowLocation(originalLocation)
    })

    it("redirects to the sign in page", () => {
      expect(window.location.assign).toHaveBeenCalledWith("/sign-in?redirect=settings")
    })
  })
})
