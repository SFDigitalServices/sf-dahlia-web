/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import SettingsPage from "../../../pages/account/settings"
import { fireEvent, screen, within, act } from "@testing-library/react"
import { authenticatedPut, get, put } from "../../../api/apiService"
import { mockProfileStub, setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { useUser } from "@clerk/react"
import { useLocation, useNavigate } from "react-router"
import { UNLEASH_FLAG } from "../../../modules/constants"

jest.mock("../../../api/apiService", () => ({
  authenticatedPut: jest.fn(),
  authenticatedGet: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
}))

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

// Read lazily by the @clerk/react mock below; the mock- prefix lets jest.mock reference it.
let mockSession: {
  startVerification: jest.Mock
  prepareFirstFactorVerification: jest.Mock
  attemptFirstFactorVerification: jest.Mock
} | null = null

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(),
    useUser: jest.fn(),
    useSignUp: () => ({ fetchStatus: "idle", signUp: {} }),
    useSession: () => ({ session: mockSession }),
  }
})

const CLERK_HEADERS = { headers: { Authorization: "Bearer clerk-session-token" } }

// Clerk recognizes its API errors by this static kind rather than by instanceof.
class ReverificationRequiredError extends Error {
  static kind = "ClerkAPIResponseError"
  errors = [{ code: "session_reverification_required" }]
}

type MockEmailAddress = {
  id: string
  emailAddress: string
  prepareVerification: jest.Mock
  attemptVerification: jest.Mock
  destroy: jest.Mock
}

const mockEmailAddress = (id: string, emailAddress: string): MockEmailAddress => {
  const address: MockEmailAddress = {
    id,
    emailAddress,
    prepareVerification: jest.fn(),
    attemptVerification: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined),
  }
  address.prepareVerification.mockResolvedValue(address)
  address.attemptVerification.mockResolvedValue({
    ...address,
    verification: { status: "verified" },
  })
  return address
}

let oldAddress: MockEmailAddress
let newAddress: MockEmailAddress
let clerkUser: {
  passwordEnabled: boolean
  primaryEmailAddressId: string
  emailAddresses: MockEmailAddress[]
  createEmailAddress: jest.Mock
  update: jest.Mock
}

const setupClerkEmailUser = () => {
  oldAddress = mockEmailAddress("idn_old", "old@example.com")
  newAddress = mockEmailAddress("idn_new", "new@example.com")
  clerkUser = {
    passwordEnabled: true,
    primaryEmailAddressId: "idn_old",
    emailAddresses: [oldAddress],
    createEmailAddress: jest.fn().mockResolvedValue(newAddress),
    update: jest.fn().mockResolvedValue(undefined),
  }
  mockSession = {
    startVerification: jest.fn().mockResolvedValue({
      status: "needs_first_factor",
      supportedFirstFactors: [
        { strategy: "email_code", emailAddressId: "idn_old", safeIdentifier: "o***@example.com" },
      ],
    }),
    prepareFirstFactorVerification: jest.fn().mockResolvedValue({ status: "needs_first_factor" }),
    attemptFirstFactorVerification: jest.fn().mockResolvedValue({ status: "complete" }),
  }
}

const submitEmail = async (email: string) => {
  const group = screen.getByRole("group", { name: /email/i })
  await act(async () => {
    fireEvent.change(within(group).getByRole("textbox"), { target: { value: email } })
    fireEvent.click(screen.getByRole("button", { name: "Save email address" }))
    await Promise.resolve()
  })
}

const confirmCode = async () => {
  await act(async () => {
    fireEvent.change(screen.getByLabelText("1"), { target: { value: "123456" } })
    fireEvent.click(screen.getByRole("button", { name: /confirm code/i }))
    await Promise.resolve()
  })
}

const mockAgencies = [
  { id: "123", name: "Test Agency A", shortName: "A" },
  { id: "456", name: "Test Agency B", shortName: "B" },
]

const fillAndSubmitDevisePassword = async (currentPassword: string, newPassword?: string) => {
  const newPasswordField = screen.getByLabelText(/choose a new password/i)
  const passwordForm = newPasswordField.closest("form") as HTMLElement

  await act(async () => {
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: currentPassword },
    })
    if (newPassword !== undefined) {
      fireEvent.change(newPasswordField, { target: { value: newPassword } })
    }
    fireEvent.click(within(passwordForm).getByRole("button", { name: "Save password" }))
    await Promise.resolve()
  })
}

describe("<SettingsPage />", () => {
  describe("when the user is signed in", () => {
    let promise
    let originalLocation: Location
    let mockNavigate: jest.Mock

    beforeEach(async () => {
      document.documentElement.lang = "en"
      originalLocation = mockWindowLocation()
      ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
      setupUserContext({ loggedIn: true })
      ;(get as jest.Mock).mockResolvedValue({ data: { agencies: [] } })
      setupClerkEmailUser()
      ;(useUser as jest.Mock).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: clerkUser,
      })
      mockNavigate = jest.fn()
      ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
      ;(useLocation as jest.Mock).mockReturnValue({
        pathname: "/account/settings",
        state: null,
      })
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
        ;(put as jest.Mock).mockResolvedValue({
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

        expect(put).toHaveBeenCalledWith(
          "/api/v1/account/update",
          expect.objectContaining({
            contact: expect.objectContaining({
              firstName: "NewFirstName",
              lastName: "NewLastName",
            }),
          }),
          { headers: { Authorization: "Bearer clerk-session-token" } }
        )

        expect(firstNameField.getAttribute("value")).toBe("NewFirstName")

        expect(lastNameField.getAttribute("value")).toBe("NewLastName")
      })

      it("updates DOB", async () => {
        ;(put as jest.Mock).mockResolvedValue({
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

        expect(put).toHaveBeenCalledWith(
          "/api/v1/account/update",
          expect.objectContaining({
            contact: expect.objectContaining({
              DOB: "2000-02-06",
            }),
          }),
          { headers: { Authorization: "Bearer clerk-session-token" } }
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

        expect(put).not.toHaveBeenCalled()

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 2 } })
          fireEvent.change(dayField, { target: { value: 74 } }) // invalid
          fireEvent.change(yearField, { target: { value: 2000 } })
          fireEvent.click(dobButton)
          await promise
        })

        expect(put).not.toHaveBeenCalled()

        await act(async () => {
          fireEvent.change(monthField, { target: { value: 2 } })
          fireEvent.change(dayField, { target: { value: 6 } })
          fireEvent.change(yearField, { target: { value: 1823 } }) // invalid
          fireEvent.click(dobButton)
          await promise
        })

        expect(put).not.toHaveBeenCalled()
      })
    })

    describe("when the user updates their email", () => {
      it("verifies the new email with a code, then makes it the sign-in email", async () => {
        ;(put as jest.Mock).mockResolvedValue({
          data: { contact: { ...mockProfileStub, email: "new@example.com" } },
        })

        await submitEmail("new@example.com")

        expect(clerkUser.createEmailAddress).toHaveBeenCalledWith({ email: "new@example.com" })
        expect(newAddress.prepareVerification).toHaveBeenCalledWith({ strategy: "email_code" })
        expect(screen.getByText("Check your email for a code")).not.toBeNull()
        expect(screen.getByText("new@example.com")).not.toBeNull()

        await confirmCode()

        expect(newAddress.attemptVerification).toHaveBeenCalledWith({ code: "123456" })
        expect(clerkUser.update).toHaveBeenCalledWith({ primaryEmailAddressId: "idn_new" })
        expect(oldAddress.destroy).toHaveBeenCalled()
        expect(put).toHaveBeenCalledWith(
          "/api/v1/account/update",
          expect.objectContaining({
            contact: expect.objectContaining({ email: "new@example.com" }),
          }),
          CLERK_HEADERS
        )
        expect(
          screen.getByText("Your email has been updated here and on any unsubmitted applications.")
        ).not.toBeNull()
      })

      it("keeps the user on the code step when the code is wrong", async () => {
        newAddress.attemptVerification.mockRejectedValueOnce(new Error("bad code"))
        jest.spyOn(console, "error").mockImplementation(() => {})

        await submitEmail("new@example.com")
        await confirmCode()

        expect(screen.getByText(/that code did not work/i)).not.toBeNull()
        expect(clerkUser.update).not.toHaveBeenCalled()
        expect(put).not.toHaveBeenCalled()
      })

      it("asks the user to confirm it's them before adding the email", async () => {
        clerkUser.createEmailAddress.mockRejectedValueOnce(new ReverificationRequiredError())

        await submitEmail("new@example.com")

        expect(screen.getByRole("heading", { name: /confirm it's you/i, level: 1 })).not.toBeNull()
        expect(screen.queryByRole("button", { name: "Save email address" })).toBeNull()

        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /send code/i }))
          await promise
        })
        await confirmCode()

        expect(mockSession.attemptFirstFactorVerification).toHaveBeenCalledWith({
          strategy: "email_code",
          code: "123456",
        })
        expect(clerkUser.createEmailAddress).toHaveBeenCalledTimes(2)
        expect(screen.getByText("Check your email for a code")).not.toBeNull()
      })

      it("returns to the email form when reverification is cancelled", async () => {
        clerkUser.createEmailAddress.mockRejectedValueOnce(new ReverificationRequiredError())

        await submitEmail("new@example.com")
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /cancel/i }))
          await promise
        })

        expect(screen.getByRole("button", { name: "Save email address" })).not.toBeNull()
        expect(screen.queryByText(/something went wrong/i)).toBeNull()
        expect(clerkUser.createEmailAddress).toHaveBeenCalledTimes(1)
      })

      it("does not update with malformed emails", async () => {
        await submitEmail("testtest.com")

        expect(clerkUser.createEmailAddress).not.toHaveBeenCalled()
      })

      it("does nothing when the email is already the sign-in email", async () => {
        await submitEmail("old@example.com")

        expect(clerkUser.createEmailAddress).not.toHaveBeenCalled()
        expect(screen.queryByText("Check your email for a code")).toBeNull()
      })
    })

    describe("the password section", () => {
      it("shows a change password button when the user has a password", () => {
        expect(screen.getByRole("button", { name: "Change password" })).not.toBeNull()
        expect(screen.getByText("••••")).not.toBeNull()
        expect(screen.queryByRole("button", { name: "Add password" })).toBeNull()
      })

      it("navigates to the change password page", async () => {
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: "Change password" }))
          await promise
        })

        expect(mockNavigate).toHaveBeenCalledWith("/change-password", {
          state: { accountSettingsFlow: true },
        })
      })
    })
    describe("renders the correct errors", () => {
      it("name Errors", async () => {
        ;(put as jest.Mock).mockRejectedValue({
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
        ;(put as jest.Mock).mockRejectedValueOnce({
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
        ;(put as jest.Mock).mockRejectedValueOnce({
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
        await submitEmail("testtest.com")

        expect(
          screen.getByRole("button", {
            name: /email missing @ symbol/i,
          })
        ).not.toBeNull()
        expect(
          screen.getByText(/email missing @ symbol\. enter email like: example@web\.com/i)
        ).not.toBeNull()

        clerkUser.createEmailAddress.mockRejectedValueOnce({
          errors: [{ code: "form_identifier_exists" }],
        })
        await submitEmail("taken@example.com")
        expect(
          screen.getByRole("button", {
            name: /email is already in use/i,
          })
        ).not.toBeNull()

        jest.spyOn(console, "error").mockImplementation(() => {})
        clerkUser.createEmailAddress.mockRejectedValueOnce(new Error("server error"))
        await submitEmail("test@test.com")
        expect(
          screen.getByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
      })
    })
  })

  describe("when the user has no password", () => {
    let originalLocation: Location
    let mockNavigate: jest.Mock

    beforeEach(async () => {
      document.documentElement.lang = "en"
      originalLocation = mockWindowLocation()
      ;(useFeatureFlag as jest.Mock).mockReturnValue({
        flagsReady: true,
        unleashFlag: true,
      })
      setupUserContext({ loggedIn: true })
      ;(get as jest.Mock).mockResolvedValue({ data: { agencies: [] } })
      ;(useUser as jest.Mock).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { passwordEnabled: false },
      })
      mockNavigate = jest.fn()
      ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
      ;(useLocation as jest.Mock).mockReturnValue({
        pathname: "/account/settings",
        state: null,
      })
      await renderAndLoadAsync(<SettingsPage assetPaths={{}} />)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("shows an add password button", () => {
      expect(screen.getByRole("button", { name: "Add password" })).not.toBeNull()
      expect(screen.queryByRole("button", { name: "Change password" })).toBeNull()
      expect(screen.queryByText("••••")).toBeNull()
    })

    it("navigates to the add password page with the account settings flow state", async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Add password" }))
        await Promise.resolve()
      })

      expect(mockNavigate).toHaveBeenCalledWith("/add-password", {
        state: { accountSettingsFlow: true },
      })
    })
  })

  describe("when arriving after a password change", () => {
    let originalLocation: Location
    let mockNavigate: jest.Mock

    beforeEach(async () => {
      document.documentElement.lang = "en"
      originalLocation = mockWindowLocation()
      ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
      setupUserContext({ loggedIn: true })
      ;(get as jest.Mock).mockResolvedValue({ data: { agencies: [] } })
      ;(useUser as jest.Mock).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { passwordEnabled: true },
      })
      mockNavigate = jest.fn()
      ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
      ;(useLocation as jest.Mock).mockReturnValue({
        pathname: "/account/settings",
        state: { passwordChanged: true },
      })
      await renderAndLoadAsync(<SettingsPage assetPaths={{}} />)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("shows the confirmation banner and clears the navigation state", () => {
      expect(screen.getByText("New password saved.")).not.toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith("/account/settings", {
        replace: true,
        state: null,
      })
    })

    it("dismisses the banner", async () => {
      await act(async () => {
        fireEvent.click(screen.getByLabelText("Close"))
        await Promise.resolve()
      })

      expect(screen.queryByText("New password saved.")).toBeNull()
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
        ;(useLocation as jest.Mock).mockReturnValue({
          pathname: "/account/settings",
          state: null,
        })
        mockContext = setupUserContext({ loggedIn: true })
        ;(get as jest.Mock).mockResolvedValue({ data: { agencies: mockAgencies } })
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
        ;(put as jest.Mock).mockResolvedValue({
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
        expect(put).toHaveBeenCalledWith(
          "/api/v1/account/update-housing-counselor",
          expect.objectContaining({
            contact: expect.objectContaining({
              housingCounselingAgencyId: "123",
            }),
          }),
          { headers: { Authorization: "Bearer clerk-session-token" } }
        )
        expect(mockContext.saveProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            housingCounselingAgencyId: "123",
          })
        )
      })

      it("shows an access granted toast", async () => {
        ;(put as jest.Mock).mockResolvedValue({
          data: {
            contact: {
              ...mockProfileStub,
              housingCounselingAgencyId: "123",
            },
          },
        })

        const agencySelect = await screen.findByLabelText(/counseling agency/i)
        const agreeCheckbox = screen.getByLabelText(/i agree to share my account with this agency/i)

        await act(async () => {
          fireEvent.change(agencySelect, { target: { value: "123" } })
          fireEvent.click(agreeCheckbox)
          fireEvent.click(screen.getByRole("button", { name: /share my account/i }))
          await Promise.resolve()
        })

        expect(
          await screen.findByText(
            /you shared your account\. we sent a confirmation to your email\./i
          )
        ).toBeInTheDocument()
        expect(
          screen.queryByText(
            /you stopped sharing your account\. we sent a confirmation to your email\./i
          )
        ).toBeNull()
      })

      it("shows an access revoked toast", async () => {
        ;(put as jest.Mock)
          .mockResolvedValueOnce({
            data: {
              contact: {
                ...mockProfileStub,
                housingCounselingAgencyId: "123",
              },
            },
          })
          .mockResolvedValueOnce({
            data: {
              contact: {
                ...mockProfileStub,
                housingCounselingAgencyId: null,
              },
            },
          })

        const agencySelect = await screen.findByLabelText(/counseling agency/i)
        const agreeCheckbox = screen.getByLabelText(/i agree to share my account with this agency/i)

        await act(async () => {
          fireEvent.change(agencySelect, { target: { value: "123" } })
          fireEvent.click(agreeCheckbox)
          fireEvent.click(screen.getByRole("button", { name: /share my account/i }))
          await Promise.resolve()
        })

        expect(
          await screen.findByText(
            /you shared your account\. we sent a confirmation to your email\./i
          )
        ).toBeInTheDocument()

        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /stop sharing/i }))
          await Promise.resolve()
        })

        expect(
          await screen.findByText(
            /you stopped sharing your account\. we sent a confirmation to your email\./i
          )
        ).toBeInTheDocument()
        expect(
          screen.queryByText(/you shared your account\. we sent a confirmation to your email\./i)
        ).toBeNull()
      })

      it("does not show a success toast when sharing fails", async () => {
        ;(put as jest.Mock).mockRejectedValue(new Error("Network error"))

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
        ;(useLocation as jest.Mock).mockReturnValue({
          pathname: "/account/settings",
          state: null,
        })
        mockContext = setupUserContext({
          loggedIn: true,
          mockProfile: {
            ...mockProfileStub,
            housingCounselingAgencyId: "123",
          },
        })
        ;(get as jest.Mock).mockResolvedValue({ data: { agencies: mockAgencies } })
        await renderAndLoadAsync(<SettingsPage assetPaths={{}} />)
      })

      it("revokes housing counselor access when the user clicks the revoke button", async () => {
        ;(put as jest.Mock).mockResolvedValue({
          data: {
            contact: {
              ...mockProfileStub,
              housingCounselingAgencyId: null,
              housingCounselingAgencyName: null,
              housingCounselingAgencyLastModified: null,
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
        expect(put).toHaveBeenCalledWith(
          "/api/v1/account/update-housing-counselor",
          expect.objectContaining({
            contact: expect.objectContaining({
              housingCounselingAgencyId: null,
            }),
          }),
          { headers: { Authorization: "Bearer clerk-session-token" } }
        )
        expect(mockContext.saveProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            housingCounselingAgencyId: null,
            housingCounselingAgencyName: null,
            housingCounselingAgencyLastModified: null,
          })
        )
      })

      it("does not show a success toast when revoking fails", async () => {
        ;(put as jest.Mock).mockRejectedValue(new Error("Network error"))

        expect(
          await screen.findByText(/your account is shared with test agency a/i)
        ).toBeInTheDocument()

        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: /stop sharing/i }))
          await Promise.resolve()
        })

        expect(
          screen.queryByText(
            /you stopped sharing your account\. we sent a confirmation to your email\./i
          )
        ).toBeNull()
        expect(
          screen.queryByText(/you shared your account\. we sent a confirmation to your email\./i)
        ).toBeNull()
      })
    })

    describe("when the feature flag is disabled", () => {
      beforeEach(async () => {
        document.documentElement.lang = "en"
        originalLocation = mockWindowLocation()
        ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
        ;(useLocation as jest.Mock).mockReturnValue({
          pathname: "/account/settings",
          state: null,
        })
        setupUserContext({ loggedIn: true })
        ;(get as jest.Mock).mockResolvedValue({ data: { agencies: mockAgencies } })
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
      ;(useLocation as jest.Mock).mockReturnValue({
        pathname: "/account/settings",
        state: null,
      })
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

  // TODO: DAH-4262 cleanup after clerk flag is on
  describe("the Devise password section", () => {
    let originalLocation: Location

    beforeEach(async () => {
      document.documentElement.lang = "en"
      originalLocation = mockWindowLocation()
      jest.clearAllMocks()
      ;(useFeatureFlag as jest.Mock).mockImplementation((flagName: string) => ({
        flagsReady: true,
        unleashFlag: flagName !== UNLEASH_FLAG.CLERK_AUTH,
      }))
      setupUserContext({ loggedIn: true })
      ;(get as jest.Mock).mockResolvedValue({ data: { agencies: [] } })
      ;(useUser as jest.Mock).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { passwordEnabled: true },
      })
      ;(useNavigate as jest.Mock).mockReturnValue(jest.fn())
      ;(useLocation as jest.Mock).mockReturnValue({ pathname: "/account/settings", state: null })
      await renderAndLoadAsync(<SettingsPage assetPaths={{}} />)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("saves the password, shows the banner, and closes it", async () => {
      ;(authenticatedPut as jest.Mock).mockResolvedValue({ data: { status: "success" } })

      await fillAndSubmitDevisePassword("abcd1234", "abcd1234!")

      expect(authenticatedPut).toHaveBeenCalledWith(
        "/api/v1/auth/password",
        expect.objectContaining({
          current_password: "abcd1234",
          password: "abcd1234!",
          password_confirmation: "abcd1234!",
        })
      )
      expect(screen.getByText("Your changes have been saved.")).toBeInTheDocument()

      await act(async () => {
        fireEvent.click(screen.getByLabelText("Close"))
        await Promise.resolve()
      })

      expect(screen.queryByText("Your changes have been saved.")).toBeNull()
    })

    it("shows the server error in the error summary", async () => {
      ;(authenticatedPut as jest.Mock).mockRejectedValueOnce({
        response: {
          status: 422,
          data: { errors: { full_messages: ["Current password is invalid"] } },
        },
      })

      await fillAndSubmitDevisePassword("abcd1234", "password1")

      expect(
        screen.getByRole("button", { name: /current password is incorrect/i })
      ).toBeInTheDocument()
      expect(screen.queryByText("Your changes have been saved.")).toBeNull()
    })

    it("does not call the API when the new password is empty", async () => {
      await fillAndSubmitDevisePassword("abcd1234")

      expect(authenticatedPut).not.toHaveBeenCalled()
    })
  })
})
