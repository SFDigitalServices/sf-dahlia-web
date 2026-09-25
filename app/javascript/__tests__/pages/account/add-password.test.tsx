import React from "react"
import { useClerk, useSession, useSignIn, useUser } from "@clerk/react"
import { screen, waitFor, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useLocation, useNavigate } from "react-router"
import AddPassword from "../../../pages/account/add-password"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { AUTH_FLOW } from "../../../modules/constants"

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(),
    useClerk: jest.fn(),
    useUser: jest.fn(),
    useSignIn: jest.fn(),
    useSignUp: jest.fn(),
    useSession: jest.fn(() => ({ session: null })),
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

const submitPassword = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByTestId("password-field"), "abcd1234")
  await user.click(screen.getByRole("button", { name: /add password/i }))
  await screen.findByRole("heading", { name: /confirm it's you/i, level: 1 })
}

const enterCode = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /send code/i }))
  await user.click(await screen.findByLabelText("1"))
  await user.paste("123456")
  await user.click(screen.getByRole("button", { name: /confirm code/i }))
}

describe("<AddPassword />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockUpdatePassword: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    document.title = "DAHLIA San Francisco Housing Portal"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: true, hasProfile: false })
    mockNavigate = jest.fn()
    mockUpdatePassword = jest.fn().mockResolvedValue(undefined)
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useLocation as jest.Mock).mockReturnValue({
      state: { flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
    ;(useSignIn as jest.Mock).mockReturnValue({
      isLoaded: true,
      signIn: { resetPassword: jest.fn(), status: null },
      setActive: jest.fn(),
    })
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useClerk as jest.Mock).mockReturnValue({ client: undefined })
    ;(useSession as jest.Mock).mockReturnValue({ session: null })
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { updatePassword: mockUpdatePassword, passwordEnabled: false },
    })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the add password page", () => {
    expect(screen.getByRole("heading", { name: /add a password/i, level: 1 })).not.toBeNull()
    expect(screen.getByText(/it's okay to skip this step/i)).not.toBeNull()
    expect(screen.getByRole("group", { name: /choose password \(optional\)/i })).not.toBeNull()
    expect(screen.getByText(/must include at least:/i)).not.toBeNull()
    expect(screen.getByTestId("password-field")).not.toBeNull()
    expect(screen.getByLabelText(/show password/i)).not.toBeNull()
    expect(screen.getByRole("button", { name: /save password/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /skip for now/i })).not.toBeNull()
    expect(screen.getByRole("heading", { name: /get help/i })).not.toBeNull()
  })

  it("saves a valid password", async () => {
    const user = userEvent.setup()
    jest.spyOn(console, "error").mockImplementation(() => {})

    await user.type(screen.getByTestId("password-field"), "abcd1234")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith({ newPassword: "abcd1234" })
    })
    expect(mockNavigate).toHaveBeenCalledWith("/add-profile")
    expect(screen.queryByTestId("error-message")).toBeNull()
  })

  it("shows a validation error for an invalid password", async () => {
    const user = userEvent.setup()

    await user.type(screen.getByTestId("password-field"), "abc")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Choose a strong password with at least 8 characters, 1 letter, and 1 number"
      )
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it("does not save a password when skipping", async () => {
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /skip for now/i }))

    expect(mockUpdatePassword).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/add-profile")
  })

  it("shows an error when the password update fails", async () => {
    const user = userEvent.setup()
    jest.spyOn(console, "error").mockImplementation(() => {})
    mockUpdatePassword.mockRejectedValue(new Error("nope"))

    await user.type(screen.getByTestId("password-field"), "abcd1234")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).not.toBeNull()
    })
  })

  it("redirects to sign-in when clerk is disabled", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("redirects to sign-in when the user is not signed in", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: false })
    ;(useUser as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false, user: null })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("does not redirect when the user has no password and no profile", () => {
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(screen.getByRole("heading", { name: /add a password/i, level: 1 })).not.toBeNull()
  })

  it("redirects to add-profile when the user already has a password", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: true, hasProfile: false })
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { updatePassword: mockUpdatePassword, passwordEnabled: true },
    })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/add-profile")
    })
  })

  it("redirects to account when the user has already set up their profile", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: true })
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { updatePassword: mockUpdatePassword, passwordEnabled: false },
    })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/account")
    })
  })
  describe("Reset password flow", () => {
    let mockSubmitPassword: jest.Mock
    let mockFinalize: jest.Mock
    let mockSignInResource: {
      status: string | null
      resetPasswordEmailCode: { submitPassword: jest.Mock }
      finalize: jest.Mock
    }

    const renderWithStatus = async (status: string | null) => {
      cleanup()
      mockSubmitPassword = jest.fn().mockResolvedValue({ resetPasswordError: null })
      mockFinalize = jest.fn().mockImplementation(async ({ navigate }) => {
        await navigate({ decorateUrl: (url: string) => url })
        return { signInFinalizeError: null }
      })
      mockSignInResource = {
        status,
        resetPasswordEmailCode: { submitPassword: mockSubmitPassword },
        finalize: mockFinalize,
      }
      ;(useLocation as jest.Mock).mockReturnValue({
        state: { flow: AUTH_FLOW.FORGOT_PASSWORD },
      })
      ;(useSignIn as jest.Mock).mockReturnValue({
        fetchStatus: "idle",
        signIn: mockSignInResource,
      })
      await renderAndLoadAsync(<AddPassword assetPaths={{}} />)
    }

    it("redirects to forgot password page if reset status is stale", async () => {
      await renderWithStatus(null)
      expect(screen.queryByRole("button", { name: /save password/i })).toBeNull()
    })

    it("resets the password and redirects to account page", async () => {
      await renderWithStatus("needs_new_password")
      mockSubmitPassword.mockImplementation(() => {
        mockSignInResource.status = "complete"
        return Promise.resolve({ resetPasswordError: null })
      })

      const user = userEvent.setup()
      await user.type(screen.getByTestId("password-field"), "abcd1234")
      await user.click(screen.getByRole("button", { name: /save password/i }))

      await waitFor(() => {
        expect(mockSubmitPassword).toHaveBeenCalledWith({
          password: "abcd1234",
          signOutOfOtherSessions: true,
        })
      })
      expect(mockFinalize).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith("/account")
    })

    it("logs an error when the reset does not complete", async () => {
      await renderWithStatus("needs_new_password")
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
      mockSubmitPassword.mockResolvedValue({ resetPasswordError: null })

      const user = userEvent.setup()
      await user.type(screen.getByTestId("password-field"), "abcd1234")
      await user.click(screen.getByRole("button", { name: /save password/i }))

      await waitFor(() => {
        expect(mockSubmitPassword).toHaveBeenCalledWith({
          password: "abcd1234",
          signOutOfOtherSessions: true,
        })
      })
      expect(consoleError).toHaveBeenCalledWith(
        "Reset password status error:",
        "needs_new_password"
      )
      expect(mockFinalize).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalledWith("/account")

      consoleError.mockRestore()
    })
  })

  describe("Account settings flow", () => {
    beforeEach(async () => {
      cleanup()
      jest.restoreAllMocks()
      document.title = "DAHLIA San Francisco Housing Portal"
      setupUserContext({ loggedIn: true })
      mockNavigate = jest.fn()
      mockUpdatePassword = jest.fn().mockResolvedValue(undefined)
      ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
      ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
      ;(useSignIn as jest.Mock).mockReturnValue({
        isLoaded: true,
        signIn: { resetPassword: jest.fn(), status: null },
        setActive: jest.fn(),
      })
      ;(useLocation as jest.Mock).mockReturnValue({
        state: { accountSettingsFlow: true },
      })
      ;(useUser as jest.Mock).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { updatePassword: mockUpdatePassword, passwordEnabled: false },
      })
      await renderAndLoadAsync(<AddPassword assetPaths={{}} />)
    })

    it("hides the skip info banner and shows a cancel button", () => {
      expect(screen.queryByRole("button", { name: /skip for now/i })).toBeNull()
      expect(screen.queryByText(/it's okay to skip this step/i)).toBeNull()
      expect(screen.queryByRole("heading", { name: /get help/i })).toBeNull()
      expect(screen.getByRole("button", { name: /cancel/i })).not.toBeNull()
    })

    it("returns to settings when cancelled", async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole("button", { name: /cancel/i }))

      expect(mockUpdatePassword).not.toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith("/account/settings")
    })

    it("saves the password and returns to settings with the banner state", async () => {
      const user = userEvent.setup()
      jest.spyOn(console, "error").mockImplementation(() => {})

      await user.type(screen.getByTestId("password-field"), "abcd1234")
      await user.click(screen.getByRole("button", { name: /add password/i }))

      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalledWith({ newPassword: "abcd1234" })
      })
      expect(mockNavigate).toHaveBeenCalledWith("/account/settings", {
        state: { passwordChanged: true },
      })
    })
  })

  describe("Reverification", () => {
    // Clerk recognizes its API errors by this static kind rather than by instanceof.
    class ReverificationRequiredError extends Error {
      static kind = "ClerkAPIResponseError"
      errors = [{ code: "session_reverification_required" }]
    }

    let mockSession: {
      startVerification: jest.Mock
      prepareFirstFactorVerification: jest.Mock
      attemptFirstFactorVerification: jest.Mock
    }

    beforeEach(async () => {
      cleanup()
      jest.restoreAllMocks()
      setupUserContext({ loggedIn: true })
      mockNavigate = jest.fn()
      mockUpdatePassword = jest
        .fn()
        .mockRejectedValueOnce(new ReverificationRequiredError())
        .mockResolvedValue(undefined)
      mockSession = {
        startVerification: jest.fn().mockResolvedValue({
          status: "needs_first_factor",
          supportedFirstFactors: [
            { strategy: "email_code", emailAddressId: "idn_1", safeIdentifier: "j***@example.com" },
          ],
        }),
        prepareFirstFactorVerification: jest.fn().mockResolvedValue({
          status: "needs_first_factor",
        }),
        attemptFirstFactorVerification: jest.fn().mockResolvedValue({ status: "complete" }),
      }
      ;(useSession as jest.Mock).mockReturnValue({ session: mockSession })
      ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
      ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
      ;(useSignIn as jest.Mock).mockReturnValue({
        isLoaded: true,
        signIn: { resetPassword: jest.fn(), status: null },
        setActive: jest.fn(),
      })
      ;(useLocation as jest.Mock).mockReturnValue({ state: { accountSettingsFlow: true } })
      ;(useUser as jest.Mock).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { updatePassword: mockUpdatePassword, passwordEnabled: false },
      })
      await renderAndLoadAsync(<AddPassword assetPaths={{}} />)
    })


    it("asks the user to confirm it's them in place of the form", async () => {
      const user = userEvent.setup()

      await submitPassword(user)

      expect(mockSession.startVerification).toHaveBeenCalledWith({ level: "first_factor" })
      expect(screen.getByText(/j\*\*\*@example.com/)).not.toBeNull()
      expect(screen.getByTestId("password-field")).not.toBeVisible()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("retries adding the password once the emailed code is confirmed", async () => {
      const user = userEvent.setup()

      await submitPassword(user)
      await enterCode(user)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/account/settings", {
          state: { passwordChanged: true },
        })
      })
      expect(mockSession.prepareFirstFactorVerification).toHaveBeenCalledWith({
        strategy: "email_code",
        emailAddressId: "idn_1",
      })
      expect(mockSession.attemptFirstFactorVerification).toHaveBeenCalledWith({
        strategy: "email_code",
        code: "123456",
      })
      expect(mockUpdatePassword).toHaveBeenCalledTimes(2)
    })

    it("shows an error and stays on the prompt when the code is wrong", async () => {
      const user = userEvent.setup()
      jest.spyOn(console, "error").mockImplementation(() => {})
      mockSession.attemptFirstFactorVerification.mockRejectedValueOnce(new Error("bad code"))

      await submitPassword(user)
      await enterCode(user)

      expect(await screen.findByText(/that code did not work/i)).not.toBeNull()
      expect(screen.getByRole("heading", { name: /confirm it's you/i })).not.toBeNull()
      expect(mockUpdatePassword).toHaveBeenCalledTimes(1)
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("returns to the filled-in form without an error when cancelled", async () => {
      const user = userEvent.setup()

      await submitPassword(user)
      await user.click(screen.getByRole("button", { name: /cancel/i }))

      await waitFor(() => {
        expect(screen.queryByRole("heading", { name: /confirm it's you/i })).toBeNull()
      })
      expect(screen.getByTestId("password-field")).toHaveValue("abcd1234")
      expect(screen.queryByText(/something went wrong/i)).toBeNull()
      expect(mockUpdatePassword).toHaveBeenCalledTimes(1)
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
